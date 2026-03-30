export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  role: MessageRole;
  content: string;
  timestamp: string;
}

export type ScenarioDifficulty = "easy" | "medium" | "hard";

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: ScenarioDifficulty;
  tags: string[];
  icon: string;
  aiRole: string;
  userRole: string;
  background: string;
  systemPrompt: string;
  openingLine: string;
  tips: string[];
}

export type SessionStatus = "active" | "completed";

export interface Session {
  id: string;
  scenarioId: string;
  messages: Message[];
  status: SessionStatus;
  createdAt: string;
  completedAt?: string;
  review?: ReviewReport;
}

export interface ReviewDimension {
  name: string;
  score: number; // 0-100
  feedback: string;
}

export interface ReviewHighlight {
  quote: string;
  comment: string;
  type: "good" | "improve";
}

export interface ReviewReport {
  overallScore: number; // 0-100
  overallFeedback: string;
  dimensions: ReviewDimension[];
  highlights: ReviewHighlight[];
  suggestions: string[];
  generatedAt: string;
}
