# Codebase Concerns

**Analysis Date:** 2026-07-14

## Tech Debt

**本地 SQLite 与生产 PostgreSQL 混合使用的适配瓶颈:**
- **问题描述:** 本地开发缺省使用 SQLite，而部署至 Vercel 生产时采用 PostgreSQL。
- **文件路径:** `prisma/schema.prisma` 与 `src/lib/db.ts`
- **影响:** 
  1. Prisma 对两种数据库底层的某些特性支持存在差异，本地测试成功的某些特定 SQL 操作或大事务在 PostgreSQL 上可能因锁等待而报错。
  2. 难以在本地完全复现连接池故障和并发性能瓶颈。
- **改进方案:** 建议在本地使用 Docker 部署一个 PostgreSQL 容器进行开发调试，将本地开发与生产库底座统一。

**单页面应用 (SPA) 全局大状态 Zustand 过度集中:**
- **问题描述:** 系统通过 `store.ts` 集中控制了所有的 UI 显示和大部分业务状态。
- **文件路径:** `src/lib/store.ts` 和 `src/app/[locale]/page.tsx`
- **影响:** Zustand 树过大容易造成非必要的组件级重复渲染。随着后续新增各类复杂的面板（如分镜精剪、音频混音），Store 文件将变得难以拆解维护。
- **改进方案:** 根据具体的子业务切片（如 `slice`）重新组织 Zustand，或者将部分无共享要求的 UI 状态退回到 React 本地 Context 或 State 中。

## Security Considerations

**API Key 全局与租户混合模式的权限泄露风险:**
- **风险:** 系统支持系统级 API Key（配置在服务器 env 里）和用户自定义 API Key（由 `UserProvider` 提供）。
- **文件路径:** `src/lib/db.ts` 与 `src/lib/ai-config.ts`
- **当前缓解措施:** 服务端通过 `src/middleware.ts` 进行了 Cookie 鉴权校验。
- **建议:** 确保在调用第三方平台时，绝不在客户端日志中打出真实的 API Key 密文（必须进行脱敏）；对用户自主配置的 API Key 在数据库中入库时进行可逆加密，严防被黑客拖库获取到明文 API Key。

## Performance Bottlenecks

**音视频合成 FFmpeg 服务端计算开销:**
- **问题描述:** 剧本分镜生成的视频需要根据配音进行剪辑、对齐和合并。目前通过服务端（可能是 Vercel Serverless Function 或者是单独环境）处理。
- **文件路径:** `src/lib/ffmpeg.ts`
- **影响:** FFmpeg 是典型的 CPU 密集型任务。在 Vercel Serverless 环境下，受限于 10s-60s 运行超时，极易导致超时中断，且高并发下会导致服务器资源彻底崩塌。
- **改进方案:** 将音视频合成逻辑（FFmpeg）剥离出 Next.js 全栈服务，建立独立的 GPU/CPU 视音频渲染集群或者调用第三方合成服务，API 仅作异步任务的回调和进度查询。

## Fragile Areas

**第三方 AI 轮询任务的不稳定性:**
- **脆弱性:** 系统对图像、视频生成服务多使用轮询策略以获取状态结果。
- **影响:** 任何网络波动、大模型厂商超时、QPS 被限制，都可能导致轮询死锁或者造成 `ImageGeneration`/`VideoGeneration` 状态永远卡在 `processing`，最终导致用户界面显示无限加载。
- **安全修改思路:** 
  1. 为所有异步轮询设置强超时熔断逻辑（例如单次生成超过 3 分钟自动标记为失败并释出 credits）。
  2. 实现幂等的重试机制。

**多智能体（Agents）并发并发死锁:**
- **脆弱性:** 在批量提取角色、场景时，大量 LLM 请求并发发出，可能因为提供商限流引发请求大范围报错。
- **文件路径:** `src/lib/batch-pipeline.ts`
- **影响:** 资产提取缺失、单集分镜 breaker 生成的内容残缺。
- **安全修改思路:** 在 `batch-pipeline` 中引入队列和 QPS 限速控制，将超出的并发请求自动延迟入队。

---

*Concerns audit: 2026-07-14*
*Update as issues are fixed or new ones discovered*
