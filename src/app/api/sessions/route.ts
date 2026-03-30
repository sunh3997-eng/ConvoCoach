import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { saveSession, listSessions } from "@/lib/db";
import { getScenarioById } from "@/lib/scenarios";
import type { Session } from "@/types";

export async function POST(req: Request) {
  try {
    const { scenarioId } = await req.json();

    if (!scenarioId) {
      return NextResponse.json({ error: "缺少 scenarioId" }, { status: 400 });
    }

    const scenario = getScenarioById(scenarioId);
    if (!scenario) {
      return NextResponse.json({ error: "场景不存在" }, { status: 404 });
    }

    const session: Session = {
      id: uuidv4(),
      scenarioId,
      messages: [],
      status: "active",
      createdAt: new Date().toISOString(),
    };

    saveSession(session);

    return NextResponse.json({ session });
  } catch (error) {
    console.error("创建会话失败:", error);
    return NextResponse.json({ error: "创建会话失败" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sessions = listSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("获取会话列表失败:", error);
    return NextResponse.json({ error: "获取会话列表失败" }, { status: 500 });
  }
}
