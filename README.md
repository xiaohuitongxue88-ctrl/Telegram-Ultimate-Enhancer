# Telegram Ultimate Enhancer / Telegram 终极增强器

Telegram Web 低开销综合增强工具：原生媒体动作恢复、受保护内容复制、播放增强与安全交互。

[![点赞](https://img.shields.io/github/stars/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer?style=flat-square&logo=github&label=%E7%82%B9%E8%B5%9E)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/stargazers)
[![最近提交](https://img.shields.io/github/last-commit/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer?style=flat-square&label=%E6%9C%80%E8%BF%91%E6%8F%90%E4%BA%A4)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/commits/main)
[![最新版本](https://img.shields.io/github/v/release/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer?style=flat-square&label=%E6%9C%80%E6%96%B0%E7%89%88%E6%9C%AC)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/releases/latest)
[![许可证](https://img.shields.io/github/license/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer?style=flat-square&label=%E8%AE%B8%E5%8F%AF%E8%AF%81)](./LICENSE)
[![下载量](https://img.shields.io/github/downloads/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/total?style=flat-square&label=%E4%B8%8B%E8%BD%BD%E9%87%8F)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/releases)

> **V1.0.0 · AUTOMATED PASS / LIVE PASS**  
> 已完成自动化检查及真实 Chrome + Tampermonkey + Telegram Web 现场回归。

## 核心能力

- **原生媒体动作恢复**：在证据充分时恢复 Telegram 已存在但受限制的下载/转发动作，不自建媒体分段下载器。
- **受保护内容复制**：恢复文本选择、Ctrl+C 与浏览器原生右键复制，并避免干扰输入框、搜索框和编辑器。
- **播放增强**：支持视频倍速快捷键与浏览器画中画。
- **链接与交互安全**：外链新标签页打开、复制链接时清理常见跟踪参数、通话操作二次确认。
- **内容体验优化**：可解除明确的文字/媒体剧透，并处理明确的置顶/赞助节点。
- **低资源运行**：采用 MutationObserver 增量处理与有界调度，不使用周期性全页扫描和持续渲染循环。

## 安装

1. 在 Chrome 中安装 **Tampermonkey**。
2. 打开 [`Telegram-Ultimate-Enhancer.user.js`](./Telegram-Ultimate-Enhancer.user.js)，复制完整代码到 Tampermonkey 新建脚本并保存。
3. 打开或刷新 Telegram Web。

支持：`web.telegram.org`、`webk.telegram.org`、`webz.telegram.org`。

## 快捷键

| 快捷键 | 功能 |
|---|---|
| `]` | 视频速度 +0.25×，最高 4× |
| `[` | 视频速度 -0.25×，最低 0.25× |
| `P` | 进入 / 退出画中画 |

可编辑区域不会触发上述快捷键增强。

## 隐私与性能

V1.0.0 不新增远程统计、遥测或后台上传；不自行请求媒体分片。下载与转发仍由 Telegram Web 自身处理。

脚本采用增量 DOM 监听、队列去重、批次上限和软上限设计，目标是长期运行时保持较低资源占用并尽量减少对原页面的干扰。

## 开源许可与项目来源

本项目采用 **GNU GPL v3.0**，标准许可证见 [`LICENSE`](./LICENSE)。针对本项目中有权附加条款的原创材料，合理署名、原始项目来源保留及修改版标识要求见 [`ADDITIONAL_TERMS.md`](./ADDITIONAL_TERMS.md)。

项目早期开发曾参考 Nestor Qin / Neet-Nestor 的开源项目 **Telegram Media Downloader**。V1.0.0 已重新设计为增量 DOM + 证据式原生动作恢复架构，不包含其 Range/Blob 下载引擎、下载进度 UI 或周期页面扫描体系。详细历史与第三方说明见 [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)。

Greasy Fork 上已有受限媒体下载、复制、右键解除、画中画、倍速等不同实现，因此本项目不将这些单项功能声明为“全球首创”。**Telegram Ultimate Enhancer V1.0.0** 的“首次公开发布”仅指本项目自身的首次正式公开发布。

## 技术与审计文档

- [代码血缘审计](./docs/CODE_PROVENANCE_AUDIT.md)
- [Greasy Fork 生态既有作品横向审计](./docs/ECOSYSTEM_PRIOR_ART_AUDIT.md)
- [真实环境现场验证](./docs/LIVE_VERIFICATION_CHECKLIST.md)
- [V1.0.0 发布验证](./docs/RELEASE_VERIFICATION.md)
- [更新记录](./CHANGELOG.md)

## 官方地址

**Repository**：https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer  
**Issues**：https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/issues

---

Maintained by **xiaohuitongxue** · Licensed under **GNU GPL v3.0**