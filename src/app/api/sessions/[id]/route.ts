import { NextResponse } from "next/server";
import { getSession, saveSession } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = getSession(params.id);
  if (!session) {
    return NextResponse.json({ error: "会话不存在" }, { status: 404 });
  }
  return NextResponse.json({ session });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = getSession(params.id);
  if (!session) {
    return NextResponse.json({ error: "会话不存在" }, { status: 404 });
  }

  const body = await req.json();

  if (body.status) {
    session.status = body.status;
    if (body.status === "completed") {
      session.completedAt = new Date().toISOString();
    }
  }

  if (body.messages) {
    session.messages = body.messages;
  }

  if (body.review) {
    session.review = body.review;
  }

  saveSession(session);
  return NextResponse.json({ session });
}
