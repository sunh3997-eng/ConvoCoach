import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY 未配置。请在 .env.local 中设置 OPENAI_API_KEY。"
      );
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

export const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

// 语音接口预留
export interface STTOptions {
  audioBlob: Blob;
  language?: string;
}

export interface TTSOptions {
  text: string;
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  speed?: number;
}

// STT: 语音转文字（Whisper）— 预留接口
export async function speechToText(options: STTOptions): Promise<string> {
  const client = getOpenAIClient();
  const file = new File([options.audioBlob], "audio.webm", {
    type: "audio/webm",
  });
  const response = await client.audio.transcriptions.create({
    model: "whisper-1",
    file,
    language: options.language || "zh",
  });
  return response.text;
}

// TTS: 文字转语音 — 预留接口
export async function textToSpeech(options: TTSOptions): Promise<ArrayBuffer> {
  const client = getOpenAIClient();
  const response = await client.audio.speech.create({
    model: "tts-1",
    input: options.text,
    voice: options.voice || "nova",
    speed: options.speed || 1.0,
  });
  return response.arrayBuffer();
}
