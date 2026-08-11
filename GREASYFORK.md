# Telegram Ultimate Enhancer / Telegram 终极增强器

面向 **Telegram Web** 的轻量综合增强脚本。优先恢复 Telegram 已有原生能力，在不接管媒体下载链的前提下，改善受保护内容复制、媒体播放与常用交互体验。

[![Greasy Fork](https://img.shields.io/badge/Greasy%20Fork-%E5%B7%B2%E5%8F%91%E5%B8%83-8b1e1e?style=flat-square&labelColor=2f3437)](https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer)
[![发行版](https://img.shields.io/github/v/release/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer?style=flat-square&label=%E5%8F%91%E8%A1%8C%E7%89%88&labelColor=2f3437&color=2563eb)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/releases/latest)
[![许可证](https://img.shields.io/github/license/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer?style=flat-square&label=%E8%AE%B8%E5%8F%AF%E8%AF%81&labelColor=2f3437&color=6b7280)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/blob/main/LICENSE)
[![最近提交](https://img.shields.io/github/last-commit/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer?style=flat-square&label=%E6%9C%80%E8%BF%91%E6%8F%90%E4%BA%A4&labelColor=2f3437&color=6b7280)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/commits/main)
[![GitHub Star](https://img.shields.io/github/stars/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer?style=flat-square&logo=github&label=GitHub%20Star&labelColor=2f3437&color=181717)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer)

**安装与源码**：[Greasy Fork 安装](https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer) · [GitHub 源码](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer) · [正式发行版](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/releases)

**支持与反馈**：[为项目添加 GitHub Star](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer) · [提交 Greasy Fork 评价](https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer/feedback) · [提交 GitHub Issue](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/issues)

> **V1.0.0 · First Public Release** · Native First · Evidence-Gated · Low Overhead

## 支持项目

如果本项目对你的实际使用有所帮助，可以通过以下方式支持后续维护。

**GitHub Star**  
[为项目添加 Star](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer) —— 可以提升项目在 GitHub 社区中的可见度，帮助更多用户发现项目。

**Greasy Fork 评价**  
[提交真实使用评价](https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer/feedback) —— 如果实际使用体验符合预期，欢迎选择 **“好 - 脚本运行良好”** 并提交真实评价。

## 核心功能

- **原生下载 / 转发恢复**：在证据充分时恢复 Telegram 已存在但被限制或隐藏的原生动作，减少重复操作，同时避免重新接管媒体下载链。
- **受保护内容复制**：恢复文本选择、Ctrl+C 与浏览器原生右键复制，并避免干扰输入框、搜索框和可编辑区域。
- **播放控制**：提供视频倍速与画中画快捷操作，在保持原播放器工作流的基础上提高观看效率。
- **剧透与页面体验**：处理明确的文字 / 媒体剧透、置顶消息和赞助消息节点，减少不必要的页面干扰。
- **链接与交互安全**：外部链接默认使用新标签页打开；复制链接时清理常见跟踪参数；Telegram 通话操作增加二次确认，降低误触风险。

## 安装与使用

**推荐安装**  
[打开 Greasy Fork 正式安装页面](https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer)

安装完成后，后续版本可继续通过用户脚本管理器的标准更新机制进行检查和更新。

**源码与历史版本**  
[查看 GitHub 源码](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer) · [查看 GitHub Releases](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/releases)

### 快捷键

- **加速（]）**：视频速度提高 0.25×，最高 4×。
- **减速（[）**：视频速度降低 0.25×，最低 0.25×。
- **画中画（P）**：进入 / 退出 Picture-in-Picture。

在输入框、搜索框和可编辑区域中不会触发上述快捷键增强。

### 适用站点

- **web.telegram.org**
- **webk.telegram.org**
- **webz.telegram.org**

## 设计与性能

- **Native First**：优先恢复 Telegram 自身已经存在的原生能力，不重复实现已有下载链路。
- **Evidence-Gated**：下载 / 转发等高影响动作必须经过上下文、候选动作、动作分类、可见性状态与证据门控后再执行。
- **Low Overhead**：采用 MutationObserver 增量处理、任务去重、批处理与队列软上限，不使用固定周期全页扫描或持续 requestAnimationFrame 自旋。

## 隐私与安全

V1.0.0 不包含用户行为遥测、广告注入、挖矿、后台数据上传或自建媒体分片抓取服务。主要功能直接运行在当前 Telegram Web 页面中。

## 开源许可与项目来源

本项目采用 **GNU General Public License v3.0（GPLv3）**。

- [查看 LICENSE](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/blob/main/LICENSE)
- [查看 ADDITIONAL_TERMS.md](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/blob/main/ADDITIONAL_TERMS.md)
- [查看 THIRD_PARTY_NOTICES.md](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/blob/main/THIRD_PARTY_NOTICES.md)

项目早期开发曾参考 Nestor Qin / Neet-Nestor 的开源项目 **Telegram Media Downloader** 所代表的 Telegram Web 用户脚本技术路线。相关来源、许可证及代码血缘说明已在 GitHub 仓库公开记录。

当前 V1.0.0 已采用独立的 NativeAction 架构和低开销增量处理体系，不包含其 Range / Blob 下载引擎、下载进度 UI 或固定周期页面扫描体系。

本项目不宣称 Telegram 下载、复制解锁、倍速、画中画、MutationObserver 或其他单项能力为全球首创。**Telegram Ultimate Enhancer V1.0.0** 的“首次公开发布”仅指本项目自身的首次正式公开发布。

## 问题反馈

- [提交 GitHub Issue](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/issues)
- [提交 Greasy Fork 反馈](https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer/feedback)

Maintained by **xiaohuitongxue** · Licensed under **GNU GPL v3.0**