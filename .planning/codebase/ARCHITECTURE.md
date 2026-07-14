# Architecture

**Analysis Date:** 2026-07-14

## Pattern Overview

**Overall:** 采用全栈 Next.js App Router 架构。基于单页面应用 (SPA) 渲染机制与 AI 协同智能体服务层融合。

**Key Characteristics:**
- **SPA UI Controller:** 前端核心为单页面，通过 Zustand 全局状态管理控制器（`src/lib/store.ts`）调度路由与多面板协作，减少多路由切换造成的资源重载。
- **Agent Orchestration:** 服务端封装了多智能体工作流（AI Agents），包括剧本重写、大纲资产提取、分镜拆解、音视频合成管道等。
- **Dual-Mode DB:** ORM 双数据库兼容，本地 SQLite fallback 无缝接入，云端 PostgreSQL 一体化承接。
- **Asset Consistency:** 基于 AI Vision 和参数控制保证角色外貌（Character Consistency）与场景（Scene Consistency）在不同分镜画面生成中的风格一致性。

## Layers

**View Layer (视图层):**
- 作用：渲染短剧创作各个工作台及多面板交互。
- 包含：`src/app/[locale]/page.tsx` 作为主 SPA 入口，具体由 `ScriptWorkbench`（剧本工作台）、`EpisodeWorkspace`（单集工作台）、`AssetWorkbench`（资产生成工作台）、`SettingsView`（系统设置）等组件完成。
- 依赖：Zustand 客户端状态层（`src/lib/store.ts`）与客户端 API 请求层（`src/lib/api.ts`）。
- 物理路径：`src/components/*`

**State Layer (状态管理层):**
- 作用：管理 SPA 的当前视图状态（View Switching）、当前激活剧本、当前单集、生成队列等客户端共享状态。
- 包含：Zustand store 实例。
- 物理路径：`src/lib/store.ts`

**API Route Layer (接口路由层):**
- 作用：对外提供服务端能力，控制用户身份认证、智能体触发、资源获取等核心操作。
- 包含：Next.js App Router API 路由（如 `/api/dramas`, `/api/scenes`, `/api/generations` 等）。
- 依赖：ORM 数据层及 AI 智能体服务。
- 物理路径：`src/app/api/*`

**Agent & Service Layer (智能体与服务层):**
- 作用：执行复杂的 AI 多智能体协作和底层音视频批处理操作。
- 包含：
  - `src/lib/agents/factory.ts`: 智能体工厂，根据 `AgentConfig` 动态实例化特定职能智能体。
  - `src/lib/novel-parser.ts`: 处理小说剧本的解析。
  - `src/lib/asset-extraction.ts`: 提取人物角色、场景、道具。
  - `src/lib/prompt-polisher.ts`: 图像/视频提示词优化润色。
  - `src/lib/ffmpeg.ts`: 调用本地或云端 FFmpeg 执行视音频合并与剪辑。
  - `src/lib/batch-pipeline.ts`: 批量处理生成任务。

**Data ORM Layer (数据持久化层):**
- 作用：统一进行数据建模与双端 fallback 连接。
- 包含：Prisma ORM 定义。
- 依赖：`src/lib/db.ts`（Prisma 实例，处理 SQLite/PostgreSQL 连接模式自适应）。
- 物理路径：`prisma/schema.prisma` 与 `src/lib/db.ts`

## Data Flow

### 1. 剧本上传与资产智能提取流

1. 用户在前端页面 `ScriptWorkbench` 导入剧本或小说。
2. 客户端调用后端 API 端点 `/api/novels` 提交文本。
3. 后端服务通过 `src/lib/novel-parser.ts` 格式化小说，拆解出对应的大纲章节。
4. 调用 `src/lib/asset-extraction.ts`，由 AI 提取智能体（`extractor`）从文本中提取角色（`Character`）、场景（`Scene`）以及道具（`Prop`），并将其持久化到数据库。
5. 数据库完成更新，向客户端返回提取结果，前端渲染提取出来的资产清单。

### 2. 分镜拆解与音视频生成/合成流

1. 用户进入分集工作区 `EpisodeWorkspace` 触发分镜拆解任务。
2. 后端加载分镜拆解智能体 `storyboard_breaker`，依据剧本上下文对单集内容做逐镜分割，生成 `Storyboard` 模型序列并落库。
3. 针对具体分镜，用户调用提示词优化逻辑 `src/lib/prompt-polisher.ts` 自动产生对应的英伟达/硅基流动绘图 Prompt。
4. 依次调用图片/视频生成接口，生成任务被记录在 `ImageGeneration` / `VideoGeneration` 数据库中用以异步轮询。
5. 生成完毕后，调用 `src/lib/ffmpeg.ts` 结合 TTS 语音合成文件将分镜渲染合并为最终的单集视频。

## Key Abstractions

**AiAgent (`AgentConfig`):**
- 作用：表示具备特定 Prompts 和参数设定的 AI 执行器。
- 模式：由 `src/lib/agents/factory.ts` 动态管理，提供诸如剧本改写、提取器、分镜breaker等角色。

**Dual DB Helper (`src/lib/db.ts`):**
- 作用：提供全自动 fallback 的 Prisma 客户端单例，使本地 SQLite 开发环境和 Vercel 生产环境零配置迁移。

**Zustand Controller (`useAppStore`):**
- 作用：SPA 控制中心，控制所有视图渲染逻辑（无页面刷新加载以维护工作区生成队列和缓存）。

## Entry Points

**Web Main Page:**
- 位置：`src/app/[locale]/page.tsx`
- 触发方式：浏览器访问根路径或 `/[locale]/` 路径。
- 作用：挂载 NextAuth 会话提供者，根据全局 store 决定挂载哪个工作台。

**REST API Routes:**
- 位置：`src/app/api/**/route.ts`
- 触发方式：AJAX 请求。
- 作用：API 功能的唯一处理入口，带有 `src/middleware.ts` 提供的 Cookie Token 鉴权保护。

## Error Handling

**Strategy:** 异常捕获机制逐层上报，后端 API Routes 返回规范化 JSON 错误代码（如 401 表示未授权，500 表示服务端错误），前端页面设置有 `error.tsx` 和全局 `global-error.tsx` 进行容灾拦截。

---

*Architecture analysis: 2026-07-14*
*Update when major patterns change*
