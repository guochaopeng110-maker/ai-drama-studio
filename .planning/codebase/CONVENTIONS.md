# Coding Conventions

**Analysis Date:** 2026-07-14

## Naming Patterns

**Files:**
- 业务逻辑与工具文件：`kebab-case.ts` (如 `prompt-polisher.ts`, `usage-tracker.ts`)。
- React 组件：`kebab-case.tsx` (如 `episode-workspace.tsx`, `settings-view.tsx`)。
- API 端点路由：始终为 `route.ts` 结合实体路径 (如 `src/app/api/dramas/[id]/route.ts`)。

**Functions:**
- 统一使用 `camelCase` 风格 (如 `resolveDatabaseUrl`, `isPostgresUrl`)。
- 事件监听器及 UI 响应逻辑采用 `handle[Event]` 或 `on[Event]` (如 `handleSave`, `onSelect`)。

**Variables:**
- 一般变量使用 `camelCase`。
- 常量与全局锁等集合采用 `UPPER_SNAKE_CASE` (如 `FULLSCREEN_VIEWS`, `NEXTAUTH_SECRET`)。
- 本地或类内部的临时参数无特殊下划线前缀。

**Types & Interfaces:**
- 统一使用 `PascalCase` 命名，不建议带 `I` 或 `T` 等前缀。
  - 正确示范：`interface UserProfile`
  - 错误示范：`interface IUserProfile`

## Code Style

**Formatting & Linting:**
- 缩进：统一使用 2 空格缩进。
- 行尾分号：每行结尾强制使用分号 `;`。
- 引号：字符串等统一使用单引号 `'`（除非是 JSX 属性中的双引号 `""` 或模板字符串 `` ` ``）。
- Linting 工具：使用 ESLint。通过运行 `bun run lint` (即 `eslint .`) 保证风格合规。

## Import Organization

**Order Rules:**
1. React、Next.js 核心库及相关全局依赖。
2. 基础第三方库与实用工具 (如 `lucide-react`, `zustand`)。
3. 通过 `@/` 别名导入的项目内部模块（如 `@/lib/*`, `@/components/*`)。
4. 相对路径导入 (如 `./utils`, `../types`)。
5. 类型定义导入 (如 `import type { User }`)。

**Path Aliases:**
- 使用 `@/` 别名直接定位 `src/` 根目录。

## Error Handling

**Backend API:**
- 全局接口应当由 `try {} catch (e) {}` 结构包裹。
- 捕获异常后通过 `console.error` 详尽记录异常信息。
- 对客户端返回结构一致的 JSON 错误信息，如 `NextResponse.json({ error: '未登录' }, { status: 401 })`，防止泄露详细的敏感堆栈。

**Frontend:**
- 采用局部组件状态维护网络请求错误并在 UI 上提示（使用 `sonner` 吐司或 `react-toast`）。
- 结合 Next.js Error Boundary（`error.tsx`）接管页面崩溃场景。

## Logging

- 采用带有前缀的 `console.log` / `console.error` 进行服务端和客户端日志追踪，如：
  - `console.log('[db] Using huobao_POSTGRES_URL_NON_POOLING')`
  - `console.error('[db] FAILED to connect to database:', err)`
- 便于在 Vercel 实时日志控制台或终端输出中根据模块名快速过滤。

## Comments

- **模块或功能分界线**：采用较长的注释线进行视觉隔离，如：
  ```typescript
  // ============================================================
  // Dual-mode: Local SQLite fallback + Vercel PostgreSQL
  // ============================================================
  ```
- **核心逻辑注释**：必须注释“为什么”这么写（Why），而不是重述代码在“做什么”（What）。说明与外部大模型平台的通信限制或由于网络原因做出的重试。

---

*Convention analysis: 2026-07-14*
*Update when patterns change*
