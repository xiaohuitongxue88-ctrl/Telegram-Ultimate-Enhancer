# Third-Party Notices / 第三方与历史来源说明

## Telegram Media Downloader

- Project: `Telegram Media Downloader`
- Original author: Nestor Qin (Neet-Nestor)
- License: GNU GPLv3
- Greasy Fork script: `446342-telegram-media-downloader`
- Repository: `https://github.com/Neet-Nestor/Telegram-Media-Downloader`
- Reference version reviewed for V1.0.0 provenance audit: 1.212

### Relationship to this project

Telegram Ultimate Enhancer 的早期开发曾参考该开源脚本在 Telegram Web 受限媒体场景中的处理思路。V1.0.0 首发版本已经移除/不采用其主要下载体系，包括 Range Fetch、Blob 拼接、自建下载按钮、下载进度条以及固定间隔 DOM 扫描。

原参考脚本 WebK 的一条历史实现链是：查询媒体动作区的隐藏按钮，移除 `hide`，再依据固定字体图标字符补充下载/转发 class。V1.0.0 将这一块重新设计为“上下文 → 候选 → 多证据动作分类 → 可见性检查 → 证据门槛 → 最小恢复”，不再沿用该控制流。

该说明用于透明记录项目历史，并不声称 Telegram Web 的通用 DOM 类名、标准浏览器 API 或通用功能概念属于任何一方的专有表达。

最终审计结论见 `docs/CODE_PROVENANCE_AUDIT.md`。本次工程审计结果为 `PASS（技术血缘收口）`：未发现阻止 V1.0.0 以独立新项目定位发布的历史高风险实现残留；共享 Telegram DOM 名称、标准浏览器 API 和通用功能目标继续按平台事实/公共接口处理。2026-08-11 已完成真实页面回归验证，状态为 `LIVE PASS`。
