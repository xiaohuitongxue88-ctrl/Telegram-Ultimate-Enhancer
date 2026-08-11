# Telegram Ultimate Enhancer / Telegram 终极增强器

Telegram Web 低开销综合增强工具：恢复有充分证据支持的原生下载/转发动作，解除受保护内容复制与右键限制，并提供剧透解除、倍速、画中画、外链净化和防误拨。

[![Greasy Fork 版本](https://img.shields.io/greasyfork/v/590834?style=flat-square&label=Greasy%20Fork%20%E7%89%88%E6%9C%AC)](https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer)
[![Greasy Fork 总安装量](https://img.shields.io/greasyfork/dt/590834?style=flat-square&label=%E6%80%BB%E5%AE%89%E8%A3%85%E9%87%8F)](https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer)
[![GitHub Stars](https://img.shields.io/github/stars/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer?style=flat-square&logo=github&label=GitHub%20Stars)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer)
[![GitHub Release](https://img.shields.io/github/v/release/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer?style=flat-square&label=GitHub%20Release)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/releases/latest)
[![License](https://img.shields.io/github/license/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer?style=flat-square&label=License)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/blob/main/LICENSE)

> **V1.0.0 · First Public Release · Low Overhead / Native First**
>
> 以 Telegram 原生能力优先、证据式恢复、低资源运行和长期稳定为核心设计原则。

---

## 主要功能

- **原生下载 / 转发动作恢复**：仅在证据充分时恢复 Telegram 已存在但被限制或隐藏的原生动作。
- **受保护内容复制**：恢复文本选择、`Ctrl+C` 与浏览器原生右键复制。
- **剧透解除**：支持明确的文字及媒体剧透内容解除。
- **视频倍速**：支持快捷键调节播放速度。
- **画中画**：按 `P` 快速进入 / 退出 Picture-in-Picture。
- **外部链接优化**：外部链接默认新标签页打开。
- **链接净化**：复制链接时清理常见跟踪参数。
- **通话防误拨**：Telegram 通话动作增加二次确认。
- **页面体验优化**：处理明确的置顶消息和赞助消息节点。

---

## 低资源设计

Telegram Ultimate Enhancer 不采用固定 500ms 周期性全页扫描，也不使用持续 `requestAnimationFrame` 自旋。

脚本通过 `MutationObserver` 增量处理新增 DOM，并配合任务去重、批处理和队列软上限降低重复工作量。

核心原则：

**High Capability / Low Activation**

即保持足够的能力，但只在确有需要并具有相应证据时执行高影响操作。

---

## 原生能力优先

媒体相关功能优先恢复 Telegram 自身已经存在的原生动作。

本项目：

- 不自建媒体分片下载器；
- 不接管 Telegram 媒体网络下载链；
- 不通过独立下载管理器重复实现 Telegram 已有的下载能力；
- 不仅凭 URL 关键词或单一弱信号执行高影响恢复操作。

对于下载 / 转发动作，当前 V1.0.0 采用上下文检测、候选动作收集、动作分类、可见性判断、证据门控与原生动作恢复的分层流程。

---

## 快捷键

| 快捷键 | 功能 |
|---|---|
| `]` | 视频速度 +0.25×，最高 4× |
| `[` | 视频速度 -0.25×，最低 0.25× |
| `P` | 进入 / 退出画中画 |

在输入框、搜索框和可编辑区域中不会触发上述快捷键增强。

---

## 隐私与安全

V1.0.0 不包含：

- 用户行为遥测；
- 广告注入；
- 挖矿；
- 后台数据上传；
- 自建媒体分片抓取服务。

主要功能均直接运行在当前 Telegram Web 页面中。

---

## 安装与更新

### 推荐安装

请直接通过 Greasy Fork 正式页面安装：

**https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer**

从 Greasy Fork 安装后，后续版本可继续由 Greasy Fork 的用户脚本更新机制进行检查和更新。

### 源码与版本归档

GitHub Repository：

**https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer**

GitHub Releases：

**https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/releases**

---

## 支持项目

如果这个项目对你有帮助，欢迎在 GitHub 为项目点一个 **Star**：

[![Star on GitHub](https://img.shields.io/github/stars/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer?style=for-the-badge&logo=github&label=Star%20on%20GitHub)](https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer)

GitHub Star 属于 GitHub 账户级操作。点击上面的按钮会进入项目仓库，登录 GitHub 后点击右上角 **Star** 即可完成支持。

如果你正在 Greasy Fork 使用本脚本，也欢迎通过脚本页面的 **反馈** 功能提交评价：

**https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer/feedback**

在反馈页面选择 **“好 - 脚本运行良好”** 并提交，即会计入 Greasy Fork 的正面评价统计。

---

## 开源许可与项目来源

本项目采用 **GNU General Public License v3.0（GPLv3）**。

标准许可证：

**https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/blob/main/LICENSE**

针对本项目中有权附加条款的原创材料，合理署名、原始项目来源保留及修改版标识要求见：

**https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/blob/main/ADDITIONAL_TERMS.md**

项目早期开发曾参考 Nestor Qin / Neet-Nestor 的开源项目 **Telegram Media Downloader** 所代表的 Telegram Web 用户脚本技术路线。相关第三方来源、许可证及代码血缘说明已在 GitHub 仓库公开记录。

当前 V1.0.0 已采用独立的 NativeAction 架构和低开销增量处理体系，不包含其 Range/Blob 下载引擎、下载进度 UI 或固定周期页面扫描体系。

本项目不宣称 Telegram 下载、复制解锁、倍速、画中画、MutationObserver 或其他单项能力为全球首创。

**Telegram Ultimate Enhancer V1.0.0 是本项目的首次公开正式发布。**

---

## 问题反馈

GitHub Issues：

**https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/issues**

Greasy Fork Feedback：

**https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer/feedback**

---

Maintained by **xiaohuitongxue** · Licensed under **GNU GPL v3.0**
