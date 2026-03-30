# ConvoCoach · AI 困难对话教练

> 基于 AI 语音的高难度对话陪练 Web App。在安全的环境中反复练习谈薪、离职、相亲、家庭矛盾等真实场景，不再临场慌乱。

## 功能

- **7 个预设场景**：薪资谈判、提离职、相亲对话、家庭矛盾、拒绝借钱、争取晋升、关系修复
- **AI 实时角色扮演**：GPT-4o 驱动，流式输出，AI 会根据你的回应动态调整策略
- **对话复盘报告**：4 个维度评分（表达清晰度、情绪管理、目标达成、话术技巧）+ 关键时刻分析 + 可操作建议
- **Landing Page**：完整的产品介绍页，含场景预览、功能说明、定价方案
- **中文 UI，移动端友好**

## 技术栈

- **框架**：Next.js 14 (App Router) + TypeScript
- **样式**：TailwindCSS
- **AI**：OpenAI GPT-4o（流式输出 + JSON 结构化输出）
- **存储**：JSON 文件（本地 `./data/sessions/`）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 OpenAI API Key：

```
OPENAI_API_KEY=sk-你的密钥
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
src/
├── app/
│   ├── page.tsx                        # Landing Page
│   ├── layout.tsx                      # 全局布局
│   ├── globals.css                     # 全局样式
│   ├── practice/
│   │   ├── page.tsx                    # 场景选择页
│   │   └── [sessionId]/page.tsx        # 对话练习页（流式输出）
│   ├── review/
│   │   └── [sessionId]/page.tsx        # 复盘报告页
│   └── api/
│       ├── chat/route.ts               # 流式对话 API
│       ├── review/route.ts             # 生成复盘报告 API
│       └── sessions/
│           ├── route.ts                # 创建/列出会话
│           └── [id]/route.ts           # 获取/更新会话
├── lib/
│   ├── scenarios.ts                    # 7 个场景定义
│   ├── db.ts                           # JSON 文件存储
│   └── openai.ts                       # OpenAI 客户端 + STT/TTS 预留接口
└── types/
    └── index.ts                        # TypeScript 类型定义
```

## 场景列表

| 场景 | 难度 | AI 角色 |
|------|------|---------|
| 💼 薪资谈判 | 高难度 | HR 招聘经理 |
| 🚪 提离职 | 有挑战 | 直属上司 |
| ☕ 相亲对话 | 轻松 | 相亲对象 |
| 👨‍👩‍👧 家庭矛盾 | 高难度 | 父母（母亲） |
| 💰 拒绝借钱 | 有挑战 | 借钱的朋友 |
| 📈 争取晋升 | 有挑战 | 你的上司 |
| 🤝 关系修复 | 高难度 | 受伤的朋友 |

## 环境变量说明

| 变量 | 必填 | 说明 |
|------|------|------|
| `OPENAI_API_KEY` | ✅ | OpenAI API 密钥 |
| `OPENAI_MODEL` | 可选 | 默认 `gpt-4o` |
| `DATA_DIR` | 可选 | 数据存储目录，默认 `./data` |
| `NEXT_PUBLIC_APP_URL` | 生产环境必填 | 应用基础 URL |

## 生产部署

```bash
npm run build
npm start
```

推荐部署到 Vercel：

```bash
npx vercel
```

注意：生产环境建议将 JSON 文件存储替换为数据库（PostgreSQL / MongoDB）。

## 扩展语音功能

`src/lib/openai.ts` 中已预留 STT（Whisper）和 TTS 接口，可在此基础上扩展语音输入/输出功能。
