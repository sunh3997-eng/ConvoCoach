"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Session, ReviewReport, ReviewDimension, ReviewHighlight } from "@/types";
import { getScenarioById, difficultyLabels, difficultyColors } from "@/lib/scenarios";
import type { Scenario } from "@/types";

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth={6}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease-out" }}
      />
    </svg>
  );
}

function DimensionBar({ dimension }: { dimension: ReviewDimension }) {
  const color =
    dimension.score >= 80
      ? "bg-emerald-500"
      : dimension.score >= 60
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{dimension.name}</span>
        <span className="text-sm font-bold text-gray-900">{dimension.score}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${dimension.score}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{dimension.feedback}</p>
    </div>
  );
}

function HighlightCard({ highlight }: { highlight: ReviewHighlight }) {
  const isGood = highlight.type === "good";
  return (
    <div
      className={`rounded-xl p-4 border ${
        isGood
          ? "bg-emerald-50 border-emerald-100"
          : "bg-amber-50 border-amber-100"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{isGood ? "✨" : "💡"}</span>
        <span
          className={`text-xs font-semibold ${
            isGood ? "text-emerald-700" : "text-amber-700"
          }`}
        >
          {isGood ? "亮点时刻" : "改进点"}
        </span>
      </div>
      <blockquote
        className={`text-sm italic mb-2 pl-3 border-l-2 ${
          isGood ? "border-emerald-400 text-emerald-800" : "border-amber-400 text-amber-800"
        }`}
      >
        &ldquo;{highlight.quote}&rdquo;
      </blockquote>
      <p className="text-xs text-gray-600 leading-relaxed">{highlight.comment}</p>
    </div>
  );
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [review, setReview] = useState<ReviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const generateReview = useCallback(
    async (s: Session) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: s.id }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "生成复盘报告失败");
        }
        const { review: r } = await res.json();
        setReview(r);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "生成复盘报告失败，请重试");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    async function load() {
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

        if (s.review) {
          setReview(s.review);
          setLoading(false);
        } else if (s.messages.length < 2) {
          setError("对话内容不足，无法生成复盘报告（至少需要 1 轮对话）");
          setLoading(false);
        } else {
          await generateReview(s);
        }
      } catch {
        router.push("/practice");
      }
    }
    load();
  }, [sessionId, router, generateReview]);

  const userMessageCount = session?.messages.filter((m) => m.role === "user").length ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 animate-pulse">
            🧠
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            AI 正在分析你的对话...
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            正在从表达清晰度、情绪管理、目标达成和话术技巧四个维度进行评估，请稍等片刻
          </p>
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-indigo-400 rounded-full"
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">无法生成报告</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            {session && session.messages.length >= 2 && (
              <button
                onClick={() => generateReview(session)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                重新生成报告
              </button>
            )}
            <Link
              href="/practice"
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors text-center"
            >
              返回场景选择
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!review || !scenario) return null;

  const scoreColor =
    review.overallScore >= 80
      ? "text-emerald-600"
      : review.overallScore >= 60
      ? "text-amber-600"
      : "text-red-600";

  const scoreLabel =
    review.overallScore >= 85
      ? "表现优秀"
      : review.overallScore >= 70
      ? "表现良好"
      : review.overallScore >= 55
      ? "有待提升"
      : "继续练习";

  const dc = difficultyColors[scenario.difficulty];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/practice"
              className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
            >
              ←
            </Link>
            <div className="w-px h-4 bg-gray-200" />
            <span className="text-xl">{scenario.icon}</span>
            <span className="font-semibold text-gray-900 text-sm">{scenario.title} · 复盘报告</span>
          </div>
          <Link
            href="/practice"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            再练一次
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-16">

        {/* Overall Score Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <ScoreRing score={review.overallScore} size={96} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${scoreColor}`}>
                  {review.overallScore}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{scoreLabel}</h1>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${dc.bg} ${dc.text} ${dc.border}`}
                >
                  {difficultyLabels[scenario.difficulty]}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {review.overallFeedback}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                <span>共 {userMessageCount} 轮对话</span>
                <span>·</span>
                <span>场景：{scenario.title}</span>
                <span>·</span>
                <span>对手：{scenario.aiRole}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span>📊</span> 四维度评分
          </h2>
          <div className="space-y-5">
            {review.dimensions.map((d) => (
              <DimensionBar key={d.name} dimension={d} />
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span>🔍</span> 关键时刻分析
          </h2>
          <div className="space-y-3">
            {review.highlights.map((h, i) => (
              <HighlightCard key={i} highlight={h} />
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span>🚀</span> 可操作改进建议
          </h2>
          <ol className="space-y-3">
            {review.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{s}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Tips from scenario */}
        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
          <h2 className="text-base font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <span>💬</span> 场景话术参考
          </h2>
          <ul className="space-y-2">
            {scenario.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-indigo-800">
                <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/practice/${sessionId}`}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors text-center text-sm"
          >
            查看对话记录
          </Link>
          <Link
            href="/practice"
            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-center"
          >
            选择新场景练习 →
          </Link>
        </div>
      </main>
    </div>
  );
}
