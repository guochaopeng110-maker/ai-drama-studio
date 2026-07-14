# Testing Patterns

**Analysis Date:** 2026-07-14

## Test Framework

当前项目中**未配置**自动化的单元测试 (如 Jest, Vitest)、端到端测试 (如 Cypress, Playwright) 框架或相关依赖。

## Testing Approach (Manual Verification)

在目前的开发流中，主要依赖以下手动方式对系统正确性进行验证：

### 1. 本地联调运行

开发时，首选使用 Bun 作为主要运行时。
- **启动开发服务器:**
  ```bash
  bun run dev
  ```
  在本地 `http://localhost:3000` 进行界面渲染、身份认证、小说导入及智能体流的逐项调试。

### 2. 数据库可视化验证

由于本地开发默认使用 SQLite 数据库，开发人员可通过 Prisma 提供的 Studio 控制台直观审查表数据的读写变化（包含 `Drama`, `Episode`, `Storyboard`, `ImageGeneration` 等）。
- **启动数据库浏览器:**
  ```bash
  npx prisma studio
  ```
  这有助于调试 AI 提取智能体写入的 `Character`、`Scene` 是否完备，以及生成扣费表 `GenerationCost` 等记录是否生成正确。

### 3. 多智能体及生成流程调试

- **测试步骤:**
  1. 清空本地 SQLite 数据以防止脏数据影响。
  2. 启动开发服务器并登录管理员账户 (利用 `scripts/seed-admin.ts` 初始配置)。
  3. 新建剧本并进入工作台，上传一段样板剧本，观测服务端控制台对于智能体执行提取的进程日志。
  4. 触发分镜生成，核对轮询 API 能够获取到正确的第三方 AI 状态并生成图片/视频。

## Adding Tests in Future

如果项目计划后续集成自动化测试流水线，推荐采用以下落地方案：

### 1. 单元测试 (Unit Testing)

针对 `src/lib/` 里的无状态或低耦合解析模块（如 `novel-parser.ts`, `art-prompt-loader.ts`）引入 **Vitest** 进行覆盖。
- **文件命名:** `*.test.ts` 放置在与被测试源码同级目录下。
- **测试指令:** `bun test`

### 2. 端到端测试 (E2E Testing)

针对涉及身份认证、AI 提取与音视频生成的长链路工作流，配置 **Playwright** 进行测试。
- 模拟用户登录、在 UI 上上传剧本、推进到单集分镜列表的完整流程。
- 通过 Mock 机制截断昂贵且不稳定的真实大模型网络请求，确保 CI/CD 快速、零成本构建通过。

---

*Testing analysis: 2026-07-14*
*Update when test patterns change*
