# Technology Stack

**Analysis Date:** 2026-07-14

## Languages

**Primary:**
- TypeScript 5.x - 用于所有的 Next.js 页面组件、App Router API 路由以及核心的 AI 智能体（Agents）逻辑。

**Secondary:**
- JavaScript - 用于构建脚本（`scripts/` 目录）和各类配置文件（如 `eslint.config.mjs`, `postcss.config.mjs`）。

## Runtime

**Environment:**
- Bun v1.3.4 (或更高版本) - 作为主要运行时和包管理工具。
- Node.js (v18+ / v20+) - 兼容的 Next.js 服务端运行环境。

**Package Manager:**
- Bun - 存在锁文件 `bun.lock`。
- Lockfile: `bun.lock` (主要)，`package-lock.json` (备用/兼容)。

## Frameworks

**Core:**
- Next.js 16.1.1 - 采用 App Router 架构的全栈 React 框架。
- React 19.0.0 - 核心 UI 渲染框架。
- TailwindCSS v4.0.0 - 现代高性能 CSS 工具库，配合 `@tailwindcss/postcss` 运作。

**Testing:**
- 目前**未配置**自动化测试框架。

**Build/Dev:**
- Next.js Compiler (基于 SWC) - 编译 TypeScript 和打包。
- PostCSS 8.x - 处理 CSS 编译。

## Key Dependencies

**Critical:**
- `@prisma/client` v6.11.1 - 数据库 ORM，管理核心实体的数据读写。
- `next-auth` v4.24.11 - 身份认证与会话管理框架。
- `next-intl` v4.3.4 - 多语言本地化路由器与翻译框架。
- `z-ai-web-dev-sdk` v0.0.17 - 自研 AI 多模态应用集成 SDK，用于对接高阶大模型能力。
- `zustand` v5.0.6 - 客户端轻量级状态管理，统一驱动 SPA 视图和项目全局状态。

**Infrastructure:**
- `@tanstack/react-query` v5.82.0 - 负责客户端的 API 异步请求数据获取和状态缓存。
- `framer-motion` v12.23.2 - 提供 UI 微交互与流畅视效动画。
- `@mdxeditor/editor` v3.39.1 - 富文本与 Markdown 剧本编辑器。
- `@dnd-kit/core` & `@dnd-kit/sortable` - 实现分镜列表、剧本大纲的交互式拖拽重排。
- `bcryptjs` v3.0.3 - 用户密码加密哈希。

## Configuration

**Environment:**
- 通过根目录 `.env` 文件进行配置，生产环境部署（如 Vercel）直接配置面板环境变量。
- 关键配置：`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` 以及各大 AI 平台 API key。

**Build:**
- `tsconfig.json` - TypeScript 编译参数。
- `next.config.ts` - Next.js 项目运行时与打包选项。
- `tailwind.config.ts` - Tailwind 样式定制与主题配置。

## Platform Requirements

**Development:**
- 支持 Bun / Node.js 运行环境的任何操作系统（Windows, macOS, Linux）。
- 需要访问外部网络以连接各 AI 接口。

**Production:**
- 部署目标：Vercel 托管（带有 `vercel.json` 规则映射），或者打包后运行在 Bun Standalone 容器环境。

---

*Stack analysis: 2026-07-14*
*Update after major dependency changes*
