"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  scenarios,
  difficultyLabels,
  difficultyColors,
} from "@/lib/scenarios";
import type { Scenario } from "@/types";

export default function PracticePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startSession(scenario: Scenario) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: scenario.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "创建会话失败");
      }
      const { session } = await res.json();
      router.push(`/practice/${session.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "创建会话失败，请重试");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-600 transition-colors text-sm flex items-center gap-1"
          >
            ← 返回首页
          </Link>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-bold text-gray-900">选择练习场景</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            你想练哪种对话？
          </h1>
          <p className="text-gray-500">
            选择一个场景，AI 会扮演对话的另一方，帮你进行真实演练
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scenario) => {
            const dc = difficultyColors[scenario.difficulty];
            const isSelected = selected?.id === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => setSelected(isSelected ? null : scenario)}
                className={`text-left bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-md ${
                  isSelected
                    ? "border-indigo-500 shadow-md shadow-indigo-100"
                    : "border-transparent hover:border-gray-200"
                } shadow-sm`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{scenario.icon}</span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full border ${dc.bg} ${dc.text} ${dc.border}`}
                  >
                    {difficultyLabels[scenario.difficulty]}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {scenario.title}
                </h3>
                <p className="text-xs text-indigo-600 font-medium mb-2">
                  {scenario.subtitle}
                </p>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                  {scenario.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {scenario.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected scenario detail panel */}
        {selected && (
          <div className="mt-6 bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{selected.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selected.title}
                    </h2>
                    <p className="text-indigo-600 text-sm font-medium">
                      {selected.subtitle}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-5">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">
                      背景设定
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selected.background}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">
                      角色分配
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div>
                        <span className="text-gray-400">你：</span>
                        {selected.userRole}
                      </div>
                      <div>
                        <span className="text-gray-400">AI：</span>
                        {selected.aiRole}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">
                    练习要点
                  </div>
                  <ul className="space-y-2">
                    {selected.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span className="text-indigo-400 mt-0.5 flex-shrink-0">
                          •
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="sm:w-48 flex flex-col gap-3">
                <button
                  onClick={() => startSession(selected)}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> 准备中...
                    </span>
                  ) : (
                    "开始练习 →"
                  )}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  重新选择
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
