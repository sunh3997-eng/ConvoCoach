import { NextResponse } from "next/server";
import { getOpenAIClient, DEFAULT_MODEL } from "@/lib/openai";
import { getSession, saveSession } from "@/lib/db";
import { getScenarioById } from "@/lib/scenarios";
import type { ReviewReport } from "@/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "缺少 sessionId" }, { status: 400 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }

    // Return cached review if already generated
    if (session.review) {
      return NextResponse.json({ review: session.review });
    }

    if (session.messages.length < 2) {
      return NextResponse.json(
        { error: "对话内容不足，无法生成复盘报告" },
        { status: 400 }
      );
    }

    const scenario = getScenarioById(session.scenarioId);
    if (!scenario) {
      return NextResponse.json({ error: "场景不存在" }, { status: 404 });
    }

    const conversationText = session.messages
      .filter((m) => m.role !== "system")
      .map(
        (m) =>
          `${m.role === "user" ? "用户" : scenario.aiRole}: ${m.content}`
      )
      .join("\n\n");

    const reviewPrompt = `你是一位专业的沟通教练，请对以下对话场景进行深度复盘分析。

场景：${scenario.title} - ${scenario.description}
用户角色：${scenario.userRole}
AI 角色：${scenario.aiRole}

对话记录：
${conversationText}

请从以下 4 个维度（每项 0-100 分）对用户的表现进行客观评分和详细分析：
1. 表达清晰度 - 用户表达是否清晰、逻辑是否通顺
2. 情绪管理 - 面对压力时是否保持冷静和专业
3. 目标达成 - 是否有效推进了对话目标
4. 话术技巧 - 是否使用了有效的沟通策略和技巧

同时：
- 找出 2-3 个"亮点时刻"（用户说得好的地方，直接引用原文）
- 找出 2-3 个"改进点"（可以说得更好的地方，直接引用原文）
- 给出 3-4 条可操作的改进建议

请严格按照以下 JSON 格式返回，不要有任何其他文字：
{
  "overallScore": 75,
  "overallFeedback": "总体评价，2-3句话",
  "dimensions": [
    { "name": "表达清晰度", "score": 80, "feedback": "具体说明" },
    { "name": "情绪管理", "score": 75, "feedback": "具体说明" },
    { "name": "目标达成", "score": 70, "feedback": "具体说明" },
    { "name": "话术技巧", "score": 65, "feedback": "具体说明" }
  ],
  "highlights": [
    { "quote": "用户说的原话", "comment": "为什么这样说得好", "type": "good" },
    { "quote": "用户说的原话", "comment": "如何可以改进", "type": "improve" }
  ],
  "suggestions": [
    "具体可操作的建议1",
    "具体可操作的建议2",
    "具体可操作的建议3"
  ]
}`;

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: reviewPrompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ error: "AI 生成报告失败" }, { status: 500 });
    }

    let reviewData: Omit<ReviewReport, "generatedAt">;
    try {
      reviewData = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "解析报告数据失败" },
        { status: 500 }
      );
    }

    const review: ReviewReport = {
      ...reviewData,
      generatedAt: new Date().toISOString(),
    };

    // Cache the review in the session
    session.review = review;
    session.status = "completed";
    session.completedAt = session.completedAt || new Date().toISOString();
    saveSession(session);

    return NextResponse.json({ review });
  } catch (error: unknown) {
    console.error("生成复盘报告失败:", error);
    const message =
      error instanceof Error ? error.message : "生成报告失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
