# Changelog

## 1.0.0 - 2026-08-11

首次公开正式版本（First Public Release）。

### Added

- 证据式 Telegram 原生下载/转发动作识别与最小恢复。
- 受保护内容复制与浏览器原生右键恢复。
- 剧透解除、视频倍速、画中画、外链新标签页与跟踪参数净化。
- 通话二次确认、明确置顶/赞助节点隐藏。
- GPU Safe 单实例状态提示。
- MutationObserver + 有界 Scheduler 增量 DOM 处理。

### Architecture

- 原生动作处理拆分为 ContextDetector、CandidateCollector、ActionClassifier、VisibilityInspector、EvidenceGate、ActionRestorer。
- 不使用周期性 setInterval 页面扫描。
- 不实现 Range Fetch、Blob 分片下载、自建媒体下载按钮或进度条。

### Verification

- 自动验证状态与代码血缘审计结果见 `docs/CODE_PROVENANCE_AUDIT.md`。
- 2026-08-11 已完成真实 Chrome + Tampermonkey + Telegram Web 现场回归，状态记录为 `LIVE PASS`。
