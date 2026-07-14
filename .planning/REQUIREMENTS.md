# Requirements: AI短剧创作平台新供应商集成

**Defined:** 2026-07-14
**Core Value:** 支持由多智能体深度协作驱动的、具备角色和场景画面一致性的短剧视音频一键式智能合成。

## v1 Requirements

### Agnes AI 适配 (Agnes Integration)

- [ ] **AGNES-01**: 系统能够向 Agnes 文本模型 (`agnes-20-flash`) 发送 API 请求并正确接收文本响应。
- [ ] **AGNES-02**: 系统支持调用 Agnes 图像模型 (`agnes-image-21-flash`) 生成指定尺寸的图片。
- [ ] **AGNES-03**: 系统支持调用 Agnes 视频大模型 (`agnes-video-v20`) 提交视频生成任务，并能通过异步轮询完成视频下载。

### Tduapihub 适配 (Tduapihub Integration)

- [ ] **TDU-01**: 兼容 OneAPI 协议规范，系统能够通过 Tduapihub 网关调用对应的多模态文本模型。
- [ ] **TDU-02**: 支持通过 Tduapihub 调用图像生成接口。
- [ ] **TDU-03**: 支持通过 Tduapihub 调用视频生成接口。
- [ ] **TDU-04**: 支持通过 Tduapihub 接口实现配音语音合成 (TTS)。

### 系统设置与管理 (Settings & DB Configuration)

- [ ] **CONF-01**: 在 `prisma/schema.prisma` 数据模型层为 Agnes 和 Tduapihub 注册默认的 `AiProvider` 数据记录。
- [ ] **CONF-02**: 更新 `src/lib/ai-config.ts` 和 `src/lib/provider-presets.ts`，加入两家供应商的模型定义、参数范围与 API 适配。
- [ ] **CONF-03**: 在后台设置页面 (`SettingsView`) 提供这两个提供商的 API Key、自定义 Base URL 输入框，且能够向后端提交保存，并在前端展示保存状态。
- [ ] **CONF-04**: 用户在后台对新提供商点击“连通性测试”时，系统能发送空载轻量级请求进行 API 可达性验证。

## Out of Scope

| Feature | Reason |
|---------|--------|
| 用户完全自定义多渠道分流 | 增加架构复杂度，目前只支持用户配置自己这两家提供商的 Key，由系统统一做模型预设路由 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AGNES-01 | Phase 1 | Pending |
| AGNES-02 | Phase 1 | Pending |
| AGNES-03 | Phase 1 | Pending |
| TDU-01 | Phase 2 | Pending |
| TDU-02 | Phase 2 | Pending |
| TDU-03 | Phase 2 | Pending |
| TDU-04 | Phase 2 | Pending |
| CONF-01 | Phase 3 | Pending |
| CONF-02 | Phase 3 | Pending |
| CONF-03 | Phase 3 | Pending |
| CONF-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-14*
*Last updated: 2026-07-14 after initial definition*
