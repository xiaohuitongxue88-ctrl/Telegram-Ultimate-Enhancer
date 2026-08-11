# Telegram Ultimate Enhancer / Telegram 终极增强器

Telegram Web 低开销综合增强工具。以 **原生能力优先、证据式恢复、低资源运行、长期稳定** 为核心，集中解决受限媒体动作、复制限制、播放控制与常用交互体验问题。

[![Greasy Fork 版本](https://img.shields.io/greasyfork/v/590834?style=flat-square&label=Greasy%20Fork%20%E7%89%88%E6%9C%AC)](https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer)
[![Greasy Fork 总安装量](https://img.shields.io/greasyfork/dt/590834?style=flat-square&label=%E6%80%BB%E5%AE%89%E8%A3%85%E9%87%8F&color=blue)](https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer)
[![Greasy Fork 评价](https://img.shields.io/greasyfork/rating-count/590834?style=flat-square&label=Greasy%20Fork%20%E8%AF%84%E4%BB%B7)](https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer/feedback)
[![GitHub Stars](https://img.shields.io/github/stars/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer?style=flat-square&logo=github&label=GitHub%20Stars)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer)
[![GitHub Release](https://img.shields.io/github/v/release/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer?style=flat-square&label=GitHub%20Release)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/releases/latest)
[![License](https://img.shields.io/github/license/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer?style=flat-square&label=License)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/blob/main/LICENSE)

[![GitHub Star](https://img.shields.io/badge/GitHub-Star%20%E9%A1%B9%E7%9B%AE-181717?style=flat-square&logo=github)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer)
[![Greasy Fork 评价](https://img.shields.io/badge/Greasy%20Fork-%E6%8F%90%E4%BA%A4%E8%AF%84%E4%BB%B7-2ea44f?style=flat-square)](https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer/feedback)

使用体验满意？欢迎通过 **GitHub Star** 或 **Greasy Fork 真实评价** 支持项目持续维护。

> **V1.0.0 · First Public Release**  
> Native First · Evidence-Gated · Low Overhead

## 核心能力

- **原生下载 / 转发恢复**：仅在证据充分时恢复 Telegram 已存在但被限制或隐藏的原生动作，不自建媒体分片下载器。
- **受保护内容复制**：恢复文本选择、`Ctrl+C` 与浏览器原生右键复制，并避免干扰输入框、搜索框和编辑区域。
- **播放增强**：支持视频倍速与浏览器画中画，保持原播放器工作流不变。
- **剧透与页面体验**：处理明确的文字 / 媒体剧透、置顶消息和赞助消息节点。
- **链接与交互安全**：外链新标签页打开、复制链接时清理常见跟踪参数，并为 Telegram 通话增加二次确认。

## 快捷键

- **`]`** — 视频速度 `+0.25×`，最高 `4×`
- **`[`** — 视频速度 `-0.25×`，最低 `0.25×`
- **`P`** — 进入 / 退出画中画（Picture-in-Picture）

> 在输入框、搜索框和可编辑区域中不会触发上述快捷键增强。

## 设计原则

- **Native First**：优先恢复 Telegram 自身已经存在的原生能力，不重复接管媒体下载链。
- **Evidence-Gated**：下载 / 转发等高影响动作必须通过上下文、候选动作、动作分类、可见性状态与证据门控后再执行。
- **Low Overhead**：采用 `MutationObserver` 增量处理、任务去重、批处理与队列软上限，不使用固定周期全页扫描或持续 `requestAnimationFrame` 自旋。

## 隐私与安全

V1.0.0 不包含用户行为遥测、广告注入、挖矿、后台数据上传或自建媒体分片抓取服务。主要功能直接运行在当前 Telegram Web 页面中。

## 安装与更新

**Greasy Fork（推荐）**  
https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer

通过 Greasy Fork 安装后，可继续使用用户脚本管理器的标准更新机制获取后续版本。

**GitHub 源码**  
https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer

**GitHub Releases**  
https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/releases

## 开源许可与项目来源

本项目采用 **GNU General Public License v3.0（GPLv3）**。

- **LICENSE**：https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/blob/main/LICENSE
- **ADDITIONAL_TERMS.md**：https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/blob/main/ADDITIONAL_TERMS.md
- **THIRD_PARTY_NOTICES.md**：https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/blob/main/THIRD_PARTY_NOTICES.md

项目早期开发曾参考 Nestor Qin / Neet-Nestor 的开源项目 **Telegram Media Downloader** 所代表的 Telegram Web 用户脚本技术路线。相关来源、许可证及代码血缘说明已在 GitHub 仓库公开记录。

当前 V1.0.0 已采用独立的 NativeAction 架构和低开销增量处理体系，不包含其 Range / Blob 下载引擎、下载进度 UI 或固定周期页面扫描体系。

本项目不宣称 Telegram 下载、复制解锁、倍速、画中画、MutationObserver 或其他单项能力为全球首创。**Telegram Ultimate Enhancer V1.0.0** 的“首次公开发布”仅指本项目自身的首次正式公开发布。

## 支持与反馈

- **Greasy Fork 评价**：https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer/feedback
- **GitHub Issues**：https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/issues

Maintained by **xiaohuitongxue** · Licensed under **GNU GPL v3.0**