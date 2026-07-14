# Codebase Structure

**Analysis Date:** 2026-07-14

## Directory Layout

```
DramaStudio/
├── .agents/             # GSD 规划与开发智能体运行配置
├── docs/                # 项目相关的说明文档
├── examples/            # 样本小说或剧本参考
├── mini-services/       # 辅助微服务或独立运行脚本
├── prisma/              # 数据库 Schema 定义及本地 SQLite 存储目录
│   ├── db/              # 本地 SQLite db 数据库物理文件存储
│   └── schema.prisma    # Prisma 核心数据模型 Schema 定义
├── public/              # 存放页面公共静态资源（图标、示例图片等）
├── scripts/             # 预开发检查、种子填充以及构建脚本
└── src/                 # 全栈业务核心源代码
    ├── app/             # Next.js App Router 架构页面和 API 接口
    │   ├── [locale]/    # 本地化动态页面路由 (SPA 主入口)
    │   └── api/         # 后端 API 路由，对接智能体与持久层
    ├── components/      # React 业务组件库 (包含 UI 及各大工作台实现)
    │   ├── ui/          # Radix & Shadcn UI 基础通用控件
    │   └── ...          # 剧本/分镜/发布等大型业务模块组件
    ├── hooks/           # 自定义 React 客户端 Hooks 
    ├── i18n/            # next-intl 国际化初始化与多语言路由控制
    └── lib/             # 核心库、AI集成、全局 Zustand Store、Prisma 客户端封装
        ├── adapters/    # 各种 AI API 平台的请求适配层
        └── agents/      # 协同智能体（Agents）底层框架与 Prompt 集
```

## Directory Purposes

**prisma/**
- 作用：管理本地数据库状态与 ORM 模型生命周期。
- 包含：`schema.prisma` (统一的数据模型架构) 和本地 SQLite 物理文件。

**scripts/**
- 作用：存放脚本任务，用于项目初始化及预构建。
- 关键文件：`pre-dev.js` (开发环境检查数据库是否存在并同步生成 Prisma client)，`seed-admin.ts` (默认管理员初始化填充)。

**src/app/api/**
- 作用：短剧平台所有的后端数据接口和异步 AI 调用接口。
- 包含：`/dramas`（短剧管理）、`/episodes`（分集大纲）、`/storyboards`（分镜生成与管理）、`/auth`（鉴权接口）。

**src/components/**
- 作用：核心业务 UI 面板实现。
- 包含：`episode-workspace.tsx` (主单集分镜编辑器)，`settings-view.tsx` (系统配置控制面板)，`script-workbench.tsx` (剧本处理工作台)。
- 子目录 `ui/`：RadixUI 和 Shadcn-UI 组合的底层轻量级无状态控件。

**src/lib/**
- 作用：基础架构、AI SDK 封装与核心逻辑处理。
- 包含：
  - `store.ts` (Zustand 客户端 Store)
  - `db.ts` (Prisma Client 单例)
  - `ffmpeg.ts` (音视频剪辑合成辅助类)
  - `novel-parser.ts` (小说文本解析服务)

## Key File Locations

**Entry Points:**
- `src/app/[locale]/page.tsx` - 前端多语言 SPA 启动入口。
- `src/middleware.ts` - 统一鉴权和国际化分发中间件。

**Configuration:**
- `tsconfig.json` - TS 编译选项。
- `next.config.ts` - Next.js 全局运行打包规则。
- `package.json` - 运行时脚本及三方依赖版本声明。

**Core Logic:**
- `src/lib/agents/factory.ts` - AI 智能体的实例化控制中心。
- `src/lib/db.ts` - 数据库连接自适应初始化。

## Naming Conventions

**Files:**
- React 组件与业务面板：采用 `kebab-case.tsx` 命名规范（如 `asset-library-view.tsx`, `publish-dialog.tsx`）。
- API 路由：始终命名为 `route.ts` 结合父级 Kebab Case 目录结构（如 `src/app/api/generations/route.ts`）。
- 逻辑代码/脚本：采用 `kebab-case.ts` (如 `voice-catalog.ts`, `novel-parser.ts`)。

**Directories:**
- 采用 `kebab-case` 风格命名。
- 集合目录或通用层使用复数命名（如 `components/`, `hooks/`, `adapters/`）。

## Where to Add New Code

**新增 AI 模型/API 平台对接:**
- 在 `src/lib/adapters/` 中添加新适配器文件。
- 在 `src/lib/ai-config.ts` 和 `src/lib/provider-presets.ts` 中加入供应商预设声明。
- 在 `prisma/schema.prisma` 中的 `AiProvider` 相关模型扩展对应配置。

**新增工作台/业务视图模块:**
- 实现视图组件存入 `src/components/` (例如 `new-view.tsx`)。
- 在 `src/lib/store.ts` 的 `view` 类型中添加新视图枚举。
- 在 `src/app/[locale]/page.tsx` 的 `ViewRouter` 开关分支中注入渲染入口。

**新增数据实体模型:**
- 在 `prisma/schema.prisma` 中追加对应 model 定义。
- 运行 `bun run db:migrate` 进行数据库迁移。

---

*Structure analysis: 2026-07-14*
*Update when directory structure changes*
