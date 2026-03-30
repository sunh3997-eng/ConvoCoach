import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConvoCoach · AI 对话陪练",
  description:
    "安全练习高难度对话，不再临场慌乱。用 AI 模拟谈薪、相亲、离职等真实场景，获得专业复盘建议。",
  keywords: "对话练习, AI 陪练, 谈薪, 提离职, 沟通技巧, 相亲",
  openGraph: {
    title: "ConvoCoach · AI 对话陪练",
    description: "安全练习高难度对话，不再临场慌乱",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
