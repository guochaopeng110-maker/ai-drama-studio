# Roadmap: AI短剧创作平台

## Overview

本项目里程碑将聚焦于为 AI 短剧创作平台接入 `Agnes` 与 `Tduapihub` 两个全新的多模态 AI 供应商。我们将分成三步走：首先在底层适配 Agnes 的文本/图/视频模型；随后兼容 OneAPI (Tduapihub) 的各种生图、生视频和 TTS 配音接口；最后在数据库和前端 UI 配置层打通，完成全链路验证。

## Phases

- [ ] **Phase 1: Agnes 供应商底层适配** - 接入 Agnes 文本、图片、视频模型 API
- [ ] **Phase 2: Tduapihub 供应商底层适配** - 兼容 OneAPI 架构的文本、图片、视频与音频生成接口
- [ ] **Phase 3: Settings UI 配置与连通性验证** - 完成前端设置面板、数据库预设与测试连通性联调

## Phase Details

### Phase 1: Agnes 供应商底层适配
**Goal**: 使得底层 AI 适配服务能够连通并调用 Agnes 平台的文本、图片和视频服务。
**Depends on**: Nothing
**Requirements**: AGNES-01, AGNES-02, AGNES-03
**Success Criteria**:
  1. 调用 `agnes-20-flash` 接口能够正确得到改写后的文本。
  2. 调用 `agnes-image-21-flash` 能正确返回生成的图片 URL。
  3. 能够向 Agnes 提交视频任务并能成功下载生成的 mp4。
**Plans**: TBD

Plans:
- [ ] 01-01: 封装 Agnes 平台的 HTTP 客户端和鉴权结构
- [ ] 01-02: 实现文本、图片、视频接口的调用适配与异常处理

### Phase 2: Tduapihub 供应商底层适配
**Goal**: 使得平台能够支持通过 Tduapihub（OneAPI 协议）进行文本、图片、视频生成以及 TTS 配音。
**Depends on**: Phase 1
**Requirements**: TDU-01, TDU-02, TDU-03, TDU-04
**Success Criteria**:
  1. 系统能以 standard OneAPI 协议连通 Tduapihub 语言模型。
  2. 支持调用其配音合成接口并下载 wav/mp3 语音包。
**Plans**: TBD

Plans:
- [ ] 02-01: 继承现有的 OpenAI 适配器格式并实现 tduapihub 客户端
- [ ] 02-02: 实现配音 TTS 与视频调用的 Tduapihub 协议适配

### Phase 3: Settings UI 配置与连通性验证
**Goal**: 在数据库中预设记录，并在前端系统设置面板渲染新提供商，且能完成 Key 的配置与连通测试。
**Depends on**: Phase 2
**Requirements**: CONF-01, CONF-02, CONF-03, CONF-04
**Success Criteria**:
  1. `prisma studio` 里预设表存在 `agnes` 和 `tduapihub`。
  2. 用户可在设置页面保存 API 密钥。
  3. 连通性测试按钮点击后，能显示 API 是否连通。
**Plans**: TBD

Plans:
- [ ] 03-01: 更新 `AiProvider` 的 Prisma 迁移与 Seed 数据注册
- [ ] 03-02: 扩展 `SettingsView` 配置输入组件与连通性 API 开发

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Agnes 底层适配 | 0/2 | Not started | - |
| 2. Tduapihub 底层适配 | 0/2 | Not started | - |
| 3. Settings UI 联调 | 0/2 | Not started | - |
