"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { Session, Message } from "@/types";
import { getScenarioById } from "@/lib/scenarios";
import type { Scenario } from "@/types";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 message-enter">
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm flex-shrink-0">
        🤖
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1 h-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              style={{
                animation: "pulseDot 1.4s infinite ease-in-out",
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatBubble({
  message,
  aiRole,
}: {
  message: DisplayMessage;
  aiRole: string;
}) {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex items-end gap-2 message-enter ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-gray-100">
        {isUser ? "👤" : "🤖"}
      </div>
      <div
        className={`max-w-[75%] sm:max-w-[65%] ${
          isUser ? "items-end" : "items-start"
        } flex flex-col gap-1`}
      >
        <div
          className={`text-xs text-gray-400 ${isUser ? "text-right" : "text-left"}`}
        >
          {isUser ? "你" : aiRole}
        </div>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-indigo-600 text-white rounded-br-sm"
              : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
          } ${message.streaming ? "typing-cursor" : ""}`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState("");
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Load session
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (!res.ok) {
          router.push("/practice");
          return;
        }
        const { session: s } = await res.json();
        setSession(s);

        const sc = getScenarioById(s.scenarioId);
        if (!sc) {
          router.push("/practice");
          return;
        }
        setScenario(sc);

        // Load existing messages
        if (s.messages.length > 0) {
          setMessages(
            s.messages
              .filter((m: Message) => m.role !== "system")
              .map((m: Message) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              }))
          );
        } else {
          // Send opening message from AI
          setMessages([
            {
              role: "assistant",
              content: sc.openingLine,
            },
          ]);
        }
      } catch {
        router.push("/practice");
      }
    }
    loadSession();
  }, [sessionId, router]);

  async function sendMessage() {
    if (!input.trim() || isStreaming || !scenario) return;

    const userText = input.trim();
    setInput("");
    setError("");

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsTyping(true);

    // Small delay for typing indicator feel
    await new Promise((r) => setTimeout(r, 400));
    setIsTyping(false);
    setIsStreaming(true);

    // Add streaming assistant message
    let streamingContent = "";
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", streaming: true },
    ]);

    try {
      abortRef.current = new AbortController();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: userText }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "发送失败");
      }

      if (!res.body) throw new Error("无法获取响应流");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        streamingContent += text;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: streamingContent,
            streaming: true,
          };
          return updated;
        });
      }

      // Mark streaming complete
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: streamingContent,
          streaming: false,
        };
        return updated;
      });
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      setMessages((prev) => prev.slice(0, -1)); // Remove empty streaming message
      setError(
        err instanceof Error ? err.message : "发送失败，请重试"
      );
    } finally {
      setIsStreaming(false);
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function endSession() {
    setIsEnding(true);
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      router.push(`/review/${sessionId}`);
    } catch {
      setIsEnding(false);
      router.push(`/review/${sessionId}`);
    }
  }

  const messageCount = messages.filter((m) => m.role === "user").length;

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 flex-shrink-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/practice"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="返回场景选择"
            >
              ←
            </Link>
            <div className="w-px h-4 bg-gray-200" />
            <span className="text-xl">{scenario.icon}</span>
            <div>
              <div className="font-semibold text-gray-900 text-sm leading-tight">
                {scenario.title}
              </div>
              <div className="text-xs text-gray-400">
                对话 {messageCount} 轮 · {scenario.aiRole}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowEndConfirm(true)}
            disabled={isStreaming || messageCount < 1}
            className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            结束对话
          </button>
        </div>
      </header>

      {/* Background hint */}
      <div className="flex-shrink-0 bg-indigo-50 border-b border-indigo-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-2">
          <p className="text-xs text-indigo-600 leading-relaxed">
            <span className="font-medium">背景：</span>
            {scenario.background}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {messages.map((message, i) => (
            <ChatBubble key={i} message={message} aiRole={scenario.aiRole} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex-shrink-0 max-w-3xl mx-auto w-full px-4 sm:px-6 mb-2">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 ml-2">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的回应… (Enter 发送，Shift+Enter 换行)"
              disabled={isStreaming}
              rows={1}
              className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60"
              style={{
                minHeight: "44px",
                maxHeight: "120px",
                height: "auto",
              }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="flex-shrink-0 w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isStreaming ? (
                <span className="animate-spin text-base">⏳</span>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            与 AI 扮演的{scenario.aiRole}对话 · 说完后点击"结束对话"查看复盘报告
          </p>
        </div>
      </div>

      {/* End confirmation modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              结束这次对话？
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              结束后将跳转到复盘报告，AI 会分析你的对话表现并给出改进建议。共
              {messageCount} 轮对话。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                继续对话
              </button>
              <button
                onClick={() => {
                  setShowEndConfirm(false);
                  endSession();
                }}
                disabled={isEnding}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                {isEnding ? "处理中..." : "查看复盘 →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
