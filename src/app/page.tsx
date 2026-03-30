"use client";

import Link from "next/link";
import { scenarios, difficultyLabels, difficultyColors } from "@/lib/scenarios";

const features = [
  {
    icon: "🛡️",
    title: "安全的练习空间",
    desc: "AI 模拟真实对话对象，不怕犯错，不怕尴尬，反复练到自信为止",
  },
  {
    icon: "🎯",
    title: "真实场景还原",
    desc: "7+ 高难度对话场景，每个场景都有详细背景设定，贴近真实处境",
  },
  {
    icon: "📊",
    title: "专业复盘分析",
    desc: "对话结束后自动生成复盘报告，从 4 个维度评分，给出可操作改进建议",
  },
  {
    icon: "⚡",
    title: "随时随地练习",
    desc: "无需预约真人教练，打开即用，5 分钟快速练一场",
  },
];

const testimonials = [
  {
    avatar: "👩‍💼",
    name: "张晓雯",
    role: "产品经理",
    content:
      "用 ConvoCoach 练了 3 次薪资谈判之后，真实面试时心跳都没乱。最后成功谈到了比初始 offer 高 25% 的薪资！",
  },
  {
    avatar: "👨‍💻",
    name: "李明峰",
    role: "软件工程师",
    content:
      "我是那种特别不擅长开口的人，提离职前练了两遍，跟上司谈的时候出奇顺利，全程没有尴尬冷场。",
  },
  {
    avatar: "👩‍🎓",
    name: "陈思雨",
    role: "应届毕业生",
    content:
      "相亲那个场景真的帮了我大忙！AI 会给出各种刁钻的回答，让我学会怎么自然地推进对话，实战效果超好。",
  },
];

const pricingPlans = [
  {
    name: "免费体验",
    price: "¥0",
    period: "永久",
    features: ["每月 3 次完整对话", "所有场景可体验", "基础复盘报告"],
    cta: "立即开始",
    highlight: false,
  },
  {
    name: "个人专业版",
    price: "¥29",
    period: "每月",
    features: [
      "无限次对话练习",
      "所有 7+ 场景",
      "深度复盘 + 话术建议",
      "对话历史记录",
      "优先客服支持",
    ],
    cta: "订阅专业版",
    highlight: true,
  },
  {
    name: "企业版",
    price: "定制",
    period: "按席位",
    features: [
      "团队账号管理",
      "自定义行业场景",
      "团队训练报告",
      "专属客户成功经理",
      "API 接入支持",
    ],
    cta: "联系我们",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold text-gray-900">ConvoCoach</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              功能
            </a>
            <a href="#scenarios" className="hover:text-indigo-600 transition-colors">
              场景
            </a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">
              价格
            </a>
          </div>
          <Link
            href="/practice"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            免费开始
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2 rounded-full mb-8 border border-indigo-100">
            <span>✨</span>
            <span>AI 驱动的对话陪练，随时开练</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
            高难度对话
            <br />
            <span className="text-indigo-600">练出来，不是等出来</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            谈薪、提离职、相亲、家庭矛盾……这些重要对话，只有一次机会。
            <br className="hidden sm:block" />
            用 ConvoCoach 反复练习，让自己在关键时刻不再慌乱。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/practice"
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              免费开始练习 →
            </Link>
            <a
              href="#scenarios"
              className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              查看场景模板
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            免费体验 3 次，无需注册信用卡
          </p>
        </div>
      </section>

      {/* Social Proof Numbers */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          {[
            { num: "7+", label: "真实场景" },
            { num: "92%", label: "用户满意度" },
            { num: "3分钟", label: "开始一次练习" },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600">
                {item.num}
              </div>
              <div className="text-gray-500 mt-1 text-sm sm:text-base">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              为什么选择 ConvoCoach？
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              心理咨询太贵，真人陪练太尴尬。ConvoCoach
              给你一个低成本、高强度的练习空间。
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scenarios Preview */}
      <section id="scenarios" className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              覆盖你最需要的场景
            </h2>
            <p className="text-gray-500 text-lg">
              每个场景都有详细背景设定和专属 AI 角色
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario) => {
              const dc = difficultyColors[scenario.difficulty];
              return (
                <div
                  key={scenario.id}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{scenario.icon}</span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full border ${dc.bg} ${dc.text} ${dc.border}`}
                    >
                      {difficultyLabels[scenario.difficulty]}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {scenario.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {scenario.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              选择场景开始练习
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              三步开始你的练习
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "选择场景",
                desc: "从 7 个真实场景中选择你最需要练习的对话类型",
              },
              {
                step: "02",
                title: "开始对话",
                desc: "与 AI 扮演的角色进行真实对话，AI 会模拟各种反应和压力",
              },
              {
                step: "03",
                title: "查看复盘",
                desc: "对话结束后获得详细评分报告和可操作的改进建议",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-indigo-50 border-2 border-indigo-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-600 mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              他们的真实反馈
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white border border-gray-100 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-2xl">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="mt-3 text-yellow-400 text-sm">★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              简单透明的价格
            </h2>
            <p className="text-gray-500 text-lg">
              免费开始，按需升级
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border ${
                  plan.highlight
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200"
                    : "bg-white border-gray-200"
                }`}
              >
                {plan.highlight && (
                  <div className="text-indigo-200 text-sm font-medium mb-2">
                    最受欢迎
                  </div>
                )}
                <div className="mb-6">
                  <h3
                    className={`text-xl font-bold mb-1 ${
                      plan.highlight ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-bold ${
                        plan.highlight ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={
                        plan.highlight ? "text-indigo-200" : "text-gray-400"
                      }
                    >
                      / {plan.period}
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-center gap-2 text-sm ${
                        plan.highlight ? "text-indigo-100" : "text-gray-600"
                      }`}
                    >
                      <span
                        className={
                          plan.highlight ? "text-indigo-200" : "text-emerald-500"
                        }
                      >
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/practice"
                  className={`block text-center py-3 rounded-xl font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-white text-indigo-600 hover:bg-indigo-50"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            下一次重要对话
            <br />
            你准备好了吗？
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            不用等到真实场景才来后悔——现在开始练习，让自己在关键时刻胸有成竹。
          </p>
          <Link
            href="/practice"
            className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-indigo-50 transition-colors"
          >
            免费开始练习 →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="text-white font-semibold">ConvoCoach</span>
          </div>
          <div className="text-sm">
            © 2026 ConvoCoach · 让每次重要对话都有备而来
          </div>
        </div>
      </footer>
    </div>
  );
}
