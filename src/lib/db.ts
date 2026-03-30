import fs from "fs";
import path from "path";
import type { Session } from "@/types";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const SESSIONS_DIR = path.join(DATA_DIR, "sessions");

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

function sessionFilePath(id: string): string {
  return path.join(SESSIONS_DIR, `${id}.json`);
}

export function saveSession(session: Session): void {
  ensureDirectories();
  const filePath = sessionFilePath(session.id);
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2), "utf-8");
}

export function getSession(id: string): Session | null {
  ensureDirectories();
  const filePath = sessionFilePath(id);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function deleteSession(id: string): void {
  const filePath = sessionFilePath(id);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function listSessions(): Session[] {
  ensureDirectories();
  const files = fs.readdirSync(SESSIONS_DIR).filter((f) => f.endsWith(".json"));
  const sessions: Session[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(SESSIONS_DIR, file), "utf-8");
      sessions.push(JSON.parse(raw) as Session);
    } catch {
      // skip corrupted files
    }
  }
  return sessions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
