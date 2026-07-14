# External Integrations

**Analysis Date:** 2026-07-14

## APIs & External Services

本系统支持多款大语言模型、图片生成、视频生成以及语音合成（TTS）服务提供商的对接。可以直接在系统后台中进行多供应商模型锁的配置，数据库中的自定义配置（`AiProvider` / `UserProvider` 表）具备比环境变量更高的优先级。

**AI Provider (多端对接接口):**
- **NVIDIA NIM API (英伟达):** 用于大语言模型会话与图像生成。
  - 环境变量：`NVIDIA_API_KEY`
  - 核心接口：通过 NVIDIA NIM 服务获取低延迟推理。
- **OpenAI API:** 用于 LLM、图像生成（DALL-E）以及 TTS。
  - 环境变量：`OPENAI_API_KEY`
- **DeepSeek API:** 核心的高性价比大语言模型。
  - 环境变量：`DEEPSEEK_API_KEY`
- **SiliconFlow (硅基流动):** 聚合平台，用于 LLM、图像生成及快手可灵等视频生成服务。
  - 环境变量：`SILICONFLOW_API_KEY`
- **SenseNova (商汤日日新):** 提供大语言模型，特别是限时免费版本的 DeepSeek 等服务。
  - 环境变量：`SENSENOVA_KEY`
- **Stability AI:** 专用于高品质图片生成与画面一致性。
  - 环境变量：`STABILITY_API_KEY`
- **Volcengine / Kling (火山引擎/快手可灵):** 用于短剧视频生成及火山引擎的高保真语音合成（TTS）。
  - 环境变量：`VOLCENGINE_API_KEY`
- **Fish Audio:** 专用于高品质、多情感的语音合成（TTS）服务。
  - 环境变量：`FISH_AUDIO_API_KEY`
- **Xiaomi MiMo (小米):** 用于轻量级、高性价比 LLM 及 TTS。
  - 环境变量：`MIMO_API_KEY`

## Data Storage

**Databases:**
- **SQLite (本地开发):**
  - 连接方式：通过本地文件连接 `file:./db/custom.db`。
  - ORM 客户端：Prisma ORM (Prisma Schema 维护在 `prisma/schema.prisma`，客户端实例化在 `src/lib/db.ts`)。
  - 迁移工具：`prisma migrate dev` 管理版本。
- **PostgreSQL (Supabase - 生产环境):**
  - 连接方式：通过 `huobao_POSTGRES_URL_NON_POOLING` 或 `POSTGRES_URL_NON_POOLING` 环境变量绕过 Vercel 连接池。
  - 客户端：Prisma ORM。

**File Storage:**
- **本地存储与 API 上传:**
  - 接口端点：`/api/files` 用于管理本地视频、图片、音频文件的上传和本地缓存读取。
  - 库文件：`src/lib/file-storage.ts` 处理上传切片和本地静态托管。

## Authentication & Identity

**Auth Provider:**
- **NextAuth.js:** 统一处理多语言环境下的用户身份认证。
  - 环境变量：`NEXTAUTH_SECRET`（加盐签名），`NEXTAUTH_URL`（回调 URL）。
  - 数据库关联：本地 `User` 模型，采用 `bcryptjs` 进行密码的哈希加密。
  - 会话管理：基于 Cookie（`next-auth.session-token` 和安全环境下的 `__Secure-next-auth.session-token`）。

## CI/CD & Deployment

**Hosting:**
- **Vercel:** 项目使用 Vercel 进行全栈应用代管部署。
  - 配置文件：`vercel.json` 用来定义路由和转发。
  - 环境变量：由 Vercel 项目面板统一管理。

## Environment Configuration

**Development:**
- 本地开发所需的最简环境变量（保存在 `.env` 中，详见 `.env.example`）：
  - `DATABASE_URL=file:./db/custom.db`
  - `NEXTAUTH_SECRET=随机生成的密钥`
  - `NEXTAUTH_URL=http://localhost:3000`
  - 以及需要本地测试的各大 AI API 密钥（如 `SILICONFLOW_API_KEY`, `OPENAI_API_KEY` 等）。

---

*Integration audit: 2026-07-14*
*Update when adding/removing external services*
