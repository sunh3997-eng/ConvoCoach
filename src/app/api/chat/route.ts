import { getOpenAIClient, DEFAULT_MODEL } from "@/lib/openai";
import { getScenarioById } from "@/lib/scenarios";
import { getSession, saveSession } from "@/lib/db";
import type { Message } from "@/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { sessionId, message } = await req.json();

    if (!sessionId || !message) {
      return new Response(
        JSON.stringify({ error: "缺少 sessionId 或 message" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return new Response(JSON.stringify({ error: "会话不存在" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (session.status === "completed") {
      return new Response(JSON.stringify({ error: "会话已结束" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const scenario = getScenarioById(session.scenarioId);
    if (!scenario) {
      return new Response(JSON.stringify({ error: "场景不存在" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Save user message
    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
    session.messages.push(userMessage);

    // Build messages for OpenAI
    const openaiMessages = [
      { role: "system" as const, content: scenario.systemPrompt },
      ...session.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const client = getOpenAIClient();
    const stream = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: openaiMessages,
      stream: true,
      max_tokens: 600,
      temperature: 0.85,
    });

    const encoder = new TextEncoder();
    let fullContent = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              fullContent += text;
              controller.enqueue(encoder.encode(text));
            }
          }
        } finally {
          // Save assistant message after streaming completes
          const assistantMessage: Message = {
            role: "assistant",
            content: fullContent,
            timestamp: new Date().toISOString(),
          };
          session.messages.push(assistantMessage);
          saveSession(session);
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    console.error("对话 API 错误:", error);
    const message =
      error instanceof Error ? error.message : "AI 服务暂时不可用，请稍后重试";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
