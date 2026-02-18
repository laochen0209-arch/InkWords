# 墨语 InkWords

<p align="center">
  <img src="public/icons/icon-192x192.png" alt="墨语 InkWords Logo" width="120">
</p>

<p align="center">
  <strong>极简东方美学语言学习平台</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#部署">部署</a> •
  <a href="#环境变量">环境变量</a>
</p>

---

## 简介

墨语 InkWords 是一款融合东方美学与现代语言学习理念的应用，提供中文和英文沉浸式学习体验。我们相信，学习语言不仅是掌握一门技能，更是一种文化体验和审美享受。

**访问地址**: [https://inkwords.app](https://inkwords.app)

## 功能特性

### 核心学习功能
- 📚 **沉浸式阅读** - 精选中英文文章，支持逐词翻译和收藏
- 🎯 **智能刷题** - IELTS、TOEFL、BCT 等多种考试模拟
- 📝 **生词本** - 自动记录生词，支持复习和掌握标记
- 🎧 **听力训练** - 听力理解练习，支持音频播放

### 用户系统
- 🔐 **多种登录方式** - 邮箱、Google、GitHub 登录
- 👤 **个人中心** - 学习数据统计、进度追踪
- 🏆 **签到系统** - 每日签到获取积分，连续签到奖励
- 💎 **VIP 会员** - 解锁高级功能，享受无限练习

### 技术特色
- 🌐 **国际化支持** - 中英文双语界面
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🎨 **东方美学 UI** - 水墨风格设计，沉浸式体验
- ⚡ **高性能** - Next.js 16 + Turbopack 构建

## 技术栈

- **框架**: [Next.js 16](https://nextjs.org/) (React 19)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **UI 组件**: Radix UI + shadcn/ui
- **动画**: Framer Motion
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **支付**: Stripe
- **部署**: Vercel

## 快速开始

### 环境要求
- Node.js 18+
- npm / yarn / pnpm

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/inkwords.git
cd inkwords

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件，填入你的配置

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 数据库设置

1. 创建 Supabase 项目
2. 运行数据库迁移（如有）
3. 配置环境变量中的数据库连接

## 部署

### Vercel 部署（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录并部署
vercel login
vercel --prod
```

### 环境变量配置

在 Vercel 控制台或 `.env.local` 中设置以下环境变量：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email (Nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password

# Sentry (可选)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# App Config
NEXT_PUBLIC_APP_URL=https://inkwords.app
```

## 项目结构

```
inkwords/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── auth/              # 认证页面
│   ├── home/              # 首页
│   ├── study/             # 学习页面
│   ├── library/           # 文库页面
│   ├── practice/          # 练习页面
│   └── ...
├── components/            # React 组件
│   ├── ui/               # UI 组件
│   └── ...
├── lib/                   # 工具函数和配置
│   ├── contexts/         # React Context
│   ├── i18n.ts          # 国际化配置
│   ├── supabase.ts      # Supabase 客户端
│   └── ...
├── public/               # 静态资源
├── prisma/               # Prisma 配置（如使用）
├── styles/               # 全局样式
└── types/                # TypeScript 类型
```

## 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 组件使用函数式组件 + Hooks

### 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具相关
```

## 安全

- API 路由已配置限流保护 (`middleware.ts`)
- 错误监控集成 (`lib/sentry.ts`)
- 安全响应头配置 (`next.config.ts`)
- 输入验证和 SQL 注入防护

## 性能优化

- 图片自动优化 (Next.js Image)
- 代码分割和懒加载
- 静态页面生成 (SSG)
- 增量静态再生 (ISR)
- Turbopack 快速构建

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE) © InkWords Team

## 联系我们

- 邮箱: support@inkwords.app
- 网站: [https://inkwords.app](https://inkwords.app)

---

<p align="center">
  Made with ❤️ by InkWords Team
</p>
