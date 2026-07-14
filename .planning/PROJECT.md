# AI短剧创作平台 (ai-drama-studio)

## What This Is

基于 Next.js 与多智能体协作的一体化 AI 短剧智能创作平台。用户可以通过导入小说或剧本，由 AI 智能体自动提取剧本资产、拆解分镜、生成图片/视频、合成配音，并完成最终短剧视频的剪辑与输出。

## Core Value

支持由多智能体深度协作驱动的、具备角色和场景画面一致性的短剧视音频一键式智能合成。

## Requirements

### Validated

- ✓ 剧本导入与章节大纲自动解析 — existing (`src/lib/novel-parser.ts`)
- ✓ 角色、场景、道具等短剧核心资产 AI 智能提取 — existing (`src/lib/asset-extraction.ts`)
- ✓ 单集分镜 (Storyboard) 智能 breaker 拆分 — existing (API & Component)
- ✓ AI 图像与视频异步轮询生成管道 — existing (`src/lib/batch-pipeline.ts`)
- ✓ 基于 FFmpeg 的视音频剪辑、对齐与合成服务 — existing (`src/lib/ffmpeg.ts`)
- ✓ 用户密码登录、NextAuth 会话认证及多语言路由中间件 — existing (`src/middleware.ts`)

### Active

- [ ] 集成 Agnes AI 提供商，适配其文本模型、图片模型和视频大模型接口
- [ ] 集成 Tduapihub (OneAPI) 提供商，支持统一协议下的文本、图片、视频与音频生成适配
- [ ] 在系统设置面板 (SettingsView) 提供这两家提供商的 API Key 与 Base URL 后端配置及连通性检测

### Out of Scope

- 视频生成的实时在线精剪与剪辑轨道编辑器 — 优先确保 AI 一键合成的自动化和画面质量，专业剪辑交由外部软件处理
- 免登录或匿名创作 — 基于 API token 扣费管理，必须建立在用户认证体系上

## Context

- **技术生态**: Next.js App Router SPA + Zustand 状态分发 + SQLite/PostgreSQL 双持久层。
- **已知瓶颈**: 音视频合成在 Serverless 环境下开销过大易超时挂起，且第三方提供商接口经常因网络波动造成轮询中断。
- **此次目标**: 接入 Agnes 和 Tduapihub (OneAPI)，提供更丰富的多模态大模型选型。

## Constraints

- **Tech stack**: 核心代码 must 采用 TypeScript 5.x 编写并遵循项目单引号、行尾分号等现有编码风格。
- **Security**: 用户的 API Key 入库需确保安全性，防止客户端以明文传输或打印。

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 双提供商支持 | 丰富平台大模型、画风及视频生成的源池，提高系统鲁棒性 | — Pending |

---

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-14 after initialization*
