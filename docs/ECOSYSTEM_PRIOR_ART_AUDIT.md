# Telegram Ultimate Enhancer V1.0.0
# Greasy Fork 生态既有作品横向审计报告

**审计日期：2026-08-11**  
**审计对象：Telegram Ultimate Enhancer V1.0.0**  
**官方仓库规划：** https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer  
**结论：ECOSYSTEM PRIOR-ART AUDIT — PASS WITH POSITIONING CONSTRAINTS**

---

## 1. 审计目的

本报告解决的问题与“代码血缘审计”不同。

前一阶段 `CODE_PROVENANCE_AUDIT` 主要确认：
- V1.0.0 是否仍存在原参考项目 `Telegram Media Downloader / Neet-Nestor` 的高风险实现血缘；
- 是否仍沿用 Range Fetch、Blob 拼接、自建下载进度条、固定周期 DOM 扫描等核心实现。

本次审计进一步确认：
1. Greasy Fork 上是否早已有相同或相近功能；
2. 是否存在其他独立项目与 V1.0.0 代码实现高度相似；
3. 哪些功能不能宣传为“首创”；
4. `Telegram Ultimate Enhancer` 名称是否存在明显混淆风险；
5. V1.0.0 应如何准确定位为“独立首发项目”。

---

## 2. 审计边界与方法

### 2.1 检索范围

以 2026-08-11 审计时 Greasy Fork 的公开 `telegram.org` Userscript 列表及 Telegram 关键词检索结果为基础。

Greasy Fork 当前公开列表中存在大量 Telegram 相关脚本，其中包含：
- 下载器；
- 复制工具；
- 播放增强；
- 广告处理；
- 翻译；
- 样式；
- 爬虫；
- 消息管理等。

本报告不是对所有无关脚本做机械逐行比较，而是先做全量筛选，再对与 V1.0.0 功能或定位真正重叠的项目进行重点审计。

### 2.2 重点比较维度

- 创建时间 / 更新时间；
- 功能目标；
- 下载路线；
- 复制解锁路线；
- DOM 监听路线；
- 播放增强；
- 广告/保护层处理；
- 项目名称与宣传定位；
- 许可证；
- 是否明确为其他项目的 Fork / derivative；
- 与 V1.0.0 的实质实现重合风险。

### 2.3 重要限制

本报告只能证明：
> 在审计时可检索、可访问的 Greasy Fork 公开作品范围内的审计结论。

不能证明：
- 全互联网从未存在类似私人脚本；
- 未公开代码不存在；
- 某个功能思想由任何一方“全球首创”。

因此项目应强调“独立项目首发”，而不是“某功能全球首创”。

---

# 3. 重点既有项目审计

## 3.1 Telegram Photo Protection Remover
- 作者：GooseOb
- 创建：2022-04-13
- 许可证：MIT
- Greasy Fork ID：443342
- 地址：https://greasyfork.org/en/scripts/443342-telegram-photo-protection-remover

### 既有能力
早于 Neet-Nestor 下载器存在，主要解除图片保护：
- WebK：右键/点击时恢复图片 pointer events；
- WebA/Z：移除 protection layer、`is-protected` 等限制。

### 与 V1.0.0 的关系
V1.0.0 也包含右键和保护内容体验增强，因此：
- **不能宣传“首创 Telegram 图片/右键保护解除”。**
- 当前 V1.0.0 没有采用其 200ms `setInterval` + 删除 protector 的具体实现。
- 技术血缘风险：**低**。

---

## 3.2 Telegram Media Downloader
- 作者：Nestor Qin / Neet-Nestor
- 创建：2022-06-11
- 当前审计版本：1.212
- 许可证：GNU GPLv3
- Greasy Fork ID：446342
- 地址：https://greasyfork.org/en/scripts/446342-telegram-media-downloader
- 源码：https://greasyfork.org/en/scripts/446342-telegram-media-downloader/code

### 既有能力
核心包括：
- 受限图片/视频/语音下载；
- Range Fetch；
- Content-Range；
- Blob 拼接；
- 自建下载 UI；
- WebK 隐藏原生按钮识别与解除。

其 WebK 历史路径存在：
`button.btn-icon.hide → remove("hide") → 固定 glyph → tgico-download/tgico-forward → 原生按钮`

### 与 V1.0.0 的关系
这是本项目早期明确参考过的历史项目。

V1.0.0 已经：
- 不存在 `contentRangeRegex`；
- 不存在 Range 分段下载；
- 不存在 `_next_offset`；
- 不存在 Blob 拼接下载器；
- 不存在自建下载进度条；
- 不存在 `REFRESH_DELAY=500`；
- 不存在旧 `button.btn-icon.hide` 控制流；
- 不主动 `.click()` 代理 Telegram 下载。

当前改为：
`ContextDetector → CandidateCollector → ActionClassifier → VisibilityInspector → EvidenceGate → ActionRestorer`

结论：
- **功能目标存在明确 prior art。**
- **历史来源必须继续透明记录。**
- **V1.0.0 技术实现已经完成独立化收口。**
- 技术血缘风险：**已处置 / PASS**。

---

## 3.3 Telegram Web Media Downloader — Save Restricted Photos & Videos (Batch) + Copy Text
- 作者：copyMister
- 创建：2023-10-20
- 2024-06-11 已加入 Ctrl+C 解锁
- 2026-06-06 当前大改版本
- 许可证：MIT
- Greasy Fork ID：477900
- 地址：https://greasyfork.org/en/scripts/477900-telegram-web-media-downloader-save-restricted-photos-videos-batch-copy-text
- 源码：https://greasyfork.org/en/scripts/477900-telegram-web-media-downloader-save-restricted-photos-videos-batch-copy-text/code

### 既有能力
- 受限聊天媒体下载；
- 单个下载；
- 批量下载；
- 受保护文本复制；
- MutationObserver；
- capture-phase `copy` 监听；
- `stopImmediatePropagation()`；
- 调用 WebK 内部 `appDownloadManager.downloadToDisc()`。

### 与 V1.0.0 的关键区别

copyMister：
- 强制 WebK；
- 根据 `[data-mid]`、`.no-forwards`、message object 找媒体；
- 直接调用 `appDownloadManager.downloadToDisc()`；
- 自建右键菜单 Download 项；
- 批量选择下载。

V1.0.0：
- 不使用 `appDownloadManager`；
- 不使用 `downloadToDisc`；
- 不依赖 `data-mid`；
- 不依赖 `.no-forwards` 作为下载入口；
- 不创建替代下载菜单；
- 只恢复已经存在的 Telegram 原生 action；
- Copy 事件中主动写 `event.clipboardData`；
- 同时保护输入框、链接清洗、Toast 等。

### 审计判断
这是**最重要的独立 prior-art 项目之一**。

需要承认：
- “受保护文本复制”不是本项目首创；
- capture phase + `stopImmediatePropagation()` 也早已有实际使用；
- MutationObserver 也不是本项目特有。

但：
- 两项目下载架构明显不同；
- Copy 模块具体数据流和代码表达不同；
- 未发现本项目使用其 Telegram 内部 manager 路线。

技术血缘风险：**低**。  
宣传限制：**高**。

---

## 3.4 enable-copy-telegram
- 作者：maanimis
- 创建：2025-02-23
- 许可证：MIT
- Greasy Fork ID：527824
- 地址：https://greasyfork.org/en/scripts/527824-enable-copy-telegram

### 既有能力
通过：
- `keydown`
- Ctrl+C
- `preventDefault`
- `stopImmediatePropagation`
- `window.getSelection`
- `navigator.clipboard.writeText`

解除 Telegram 复制限制。

### 与 V1.0.0 的关系
V1.0.0 不使用其 keyboard-copy 路线，不使用 `navigator.clipboard.writeText()`。

结论：
- 复制功能存在 prior art；
- 代码实现不同；
- 技术血缘风险：**低**。

---

## 3.5 Telegram +
- 作者：diorhc
- 创建：2025-05-27
- 许可证：MIT
- Greasy Fork ID：537433
- 地址：https://greasyfork.org/en/scripts/537433-telegram
- 源码：https://greasyfork.org/en/scripts/537433-telegram/code

### 既有能力
公开说明中已经包括：
- `P`：Picture in Picture；
- 视频快捷键；
- 下载受限频道内容；
- Ads Blocker。

源码同时具有明显 Nestor 下载器家族特征：
- `DOWNLOAD_ICON`
- `contentRangeRegex`
- `REFRESH_DELAY = 500`
- Range 下载
- 进度 UI 等。

### 与 V1.0.0 的关系
非常重要：

**`P` 作为 Telegram Web 画中画快捷键在 2025 年已有 prior art。**

因此：
- 不能宣传“首创 Telegram P 键画中画”；
- 不能宣传“首创 Telegram 播放增强”；
- 不能宣传“首创 Telegram 广告隐藏”。

V1.0.0 的 PiP 调用只是标准浏览器 Picture-in-Picture API，属于普通浏览器能力应用。

技术血缘风险：**低**。  
功能先后宣传风险：**中高**。

---

## 3.6 Telegram Text Copier
- 作者：ibryapici
- 创建：2025-06-30
- Greasy Fork ID：541182
- 地址：https://greasyfork.org/en/scripts/541182-telegram-text-copier
- 源码：https://greasyfork.org/en/scripts/541182-telegram-text-copier/code

### 既有能力
- Hover Copy 按钮；
- 右键菜单 Copy；
- App A / App K；
- 周期性 `setInterval` 扫描。

### 与 V1.0.0 的关系
V1.0.0：
- 不创建每条消息 hover copy 按钮；
- 不创建右键自定义 Copy 菜单；
- 不周期扫描消息；
- 使用原生 Copy 事件恢复浏览器自身复制。

技术血缘风险：**低**。

---

## 3.7 Telegram Web - Media Batch Downloader
- 作者：OsoCosmico
- 创建：2026-02-25
- 当前版本：2.0.0
- 许可证：MIT
- Greasy Fork ID：567432
- 地址：https://greasyfork.org/en/scripts/567432-telegram-web-media-batch-downloader
- 源码：https://greasyfork.org/en/scripts/567432-telegram-web-media-batch-downloader/code

### 既有能力
- 单个/批量受限媒体下载；
- WebK 内部 manager；
- `appDownloadManager.downloadToDisc({message, media})`；
- Telegram native tgico；
- Copy 解锁；
- DOM observer。

作者公开说明该项目为基于 `c0d3r` 项目的 heavily modified Fork。

### 与 V1.0.0 的关系
V1.0.0 不使用其内部 manager 下载、不做批量任务、不创建批量按钮。

技术血缘风险：**低**。  
同类功能 prior art：**明确存在**。

---

## 3.8 Telegram Media Downloader (Global Edition)
- 作者：jacksonc
- 创建：2026-04-11
- 许可证：MIT
- Greasy Fork ID：573418
- 地址：https://greasyfork.org/en/scripts/573418-telegram-media-downloader-global-edition

### 既有能力
下载 + 大规模多语言 UI。

### 与 V1.0.0 的关系
产品方向是“Downloader”，而 V1.0.0 是综合 Enhancer。
未发现需要改变当前项目定位的证据。

技术血缘风险：**低 / 未发现直接证据**。

---

## 3.9 Telegram Web A 视频全功能增强
- 作者：nnn U
- 创建：2026-04-19

### 既有能力
- 视频倍速；
- 快进/快退；
- 自动画质处理。

### 与 V1.0.0 的关系
进一步证明：
- Telegram 播放倍速/视频增强属于已有功能方向；
- 不能宣传为本项目首创。

技术血缘风险：**低**。

---

## 3.10 Telegram Media Downloader (Optimized & Enhanced)
- 作者：Andrew98
- 创建：2026-04-28
- 当前版本：1.0.3
- 许可证：GNU GPLv3
- Greasy Fork ID：575704
- 地址：https://greasyfork.org/en/scripts/575704-telegram-media-downloader-optimized-enhanced

### 项目自身声明
其页面明确说明：
- adapted from open-source project；
- 原项目为 Neet-Nestor / Telegram-Media-Downloader；
- copyright belongs to original author。

### 审计归类
该项目应归入 **Neet-Nestor 衍生家族**，而不是独立 prior-art 源头。

V1.0.0 不使用其 Range/Blob/Progress 路线。

---

## 3.11 Telegram Media Downloader (Queue + ZIP)
- 作者：wzzhaoyi
- 创建：2026-05-14
- Greasy Fork ID：578070
- 地址：https://greasyfork.org/en/scripts/578070-telegram-media-downloader

### 项目自身源码声明
明确写明：
- Derived from Telegram Media Downloader；
- 原作者 Nestor Qin；
- chunked-fetch / Range-request downloaders 和 MediaViewer injection 源于原项目；
- 自身增加 serial queue / ZIP 等。

### 审计归类
同样属于 **Neet-Nestor 衍生家族**。

不应把它当作另一个独立血缘来源重复统计。

---

## 3.12 Telegram TextEmoji Copier
- 创建：2026-05-26

### 既有能力
- 受限文本复制；
- floating copy button；
- context menu option。

### 与 V1.0.0 的关系
再次确认 Copy Unlock 已是成熟功能类别。

V1.0.0 不使用其 UI 操作路线。

---

## 3.13 Telegram Web - Ultimate Unlocker & Media Downloader
- 作者：vortexvips
- 创建：2026-06-04
- Greasy Fork ID：581155
- 地址：https://greasyfork.org/en/scripts/581155-telegram-web-ultimate-unlocker-media-downloader

### 重要性：名称 + 功能同时重叠

该项目名称已经使用：
- `Ultimate`
- `Unlocker`
- `Media Downloader`

源码作者行还写有：
`Andrew, Nestor Qin (Integrated)`

其媒体模块存在：
- `refreshDelay: 500`
- `contentRangeRegex`
- Range fetch
- 自建下载服务
- 周期 tick

因此主要媒体实现仍明显处于 Nestor/Andrew 衍生路线。

### 对本项目名称的判断

`Telegram Ultimate Enhancer`
与
`Telegram Web - Ultimate Unlocker & Media Downloader`
不是相同名称。

`Ultimate` 属于常见描述词，不足以单独构成项目同一性。

### 建议
**无需更改已经创建的 GitHub 仓库名称。**

但不得宣传：
- “第一个使用 Ultimate 名称的 Telegram 工具”；
- “唯一 Ultimate Telegram 工具”。

名称混淆风险：**可接受，需通过描述和视觉定位区分**。

---

## 3.14 Telegram Web Copy Helper
- 作者：LaneZeroO
- 创建：2026-06-11
- 许可证：MIT
- Greasy Fork ID：582166
- 地址：https://greasyfork.org/en/scripts/582166-telegram-web-copy-helper

### 既有能力
- floating copy panel；
- copy selected；
- copy last；
- preview；
- GM_setClipboard。

### 与 V1.0.0 的关系
V1.0.0 没有 copy panel，也不使用 GM_setClipboard。
技术路线不同。

---

## 3.15 Telegram Media Downloader by Wenhao
- 作者：liyinred
- 创建：2026-06-21

### 既有能力
- WebK 视频下载；
- Stories；
- Blob playback；
- HLS；
- 图片下载；
- progress controls。

### 与 V1.0.0 的关系
V1.0.0 不实现自己的媒体下载协议栈，不做 HLS/Blob 下载。
属于完全不同的产品路线。

---

## 3.16 2026-07-04 同名 Media Downloader
Greasy Fork 当前列表中还有 Dharan Tej 发布的：

`Telegram Web Media Downloader — Save Restricted Photos & Videos (Batch) + Copy Text`

创建时间 2026-07-04。

该名称与 copyMister 项目高度一致，应视为需要进一步关注来源关系的项目，但它晚于 copyMister 多年，也晚于上述主要 prior art。

它不改变本项目的功能先后结论。

---

# 4. 功能先后结论

| V1.0.0 功能 | Greasy Fork 既有作品 | 能否宣传“首创” |
|---|---|---|
| 受限媒体下载/恢复 | 2022 Nestor 等 | ❌ |
| 图片保护/右键解除 | 2022 GooseOb | ❌ |
| 受保护文字复制 | 2023 copyMister / 2025 多项目 | ❌ |
| capture copy + stopImmediatePropagation | copyMister 已采用 | ❌ |
| MutationObserver Telegram DOM 监听 | 多项目已有 | ❌ |
| Picture-in-Picture | Telegram + 2025 已有 | ❌ |
| `P` 画中画快捷键 | Telegram + 已有 | ❌ |
| 视频倍速增强 | 多项目已有 | ❌ |
| 广告处理 | Telegram + / Ads Remover 等 | ❌ |
| “Ultimate” 命名 | 2026-06 已存在 | ❌ |
| GPLv3 Telegram 下载项目 | Nestor 等 | ❌ |

因此：

## **V1.0.0 不应以“单项功能首创”作为首发依据。**

---

# 5. 代码实现独立性结论

横向审计发现：

### 5.1 与 copyMister 不同
本项目不存在：
- `appDownloadManager`
- `downloadToDisc`
- `mtprotoMessagePort`
- `data-mid`
- 批量消息下载器
- 自建 Download 右键项

### 5.2 与 Nestor 衍生家族不同
本项目不存在：
- `contentRangeRegex`
- Range Fetch 下载体系
- Blob 分块拼接
- `tel_download_video`
- 下载进度卡片体系
- 500ms 页面扫描
- 原隐藏按钮固定 glyph → click 下载的历史控制流

### 5.3 与 Text Copier 类不同
本项目不存在：
- 每条消息 hover copy 按钮
- 自建 Copy context menu item
- 周期遍历所有消息
- GM_setClipboard / navigator.clipboard 作为核心复制路径

### 5.4 本项目当前实现特征
当前核心差异化在于：

1. **Evidence-based Native Action Restoration**
   - 上下文；
   - 候选；
   - 多证据分类；
   - 可见性判断；
   - Evidence Gate；
   - 最小原生状态恢复。

2. **Bounded Incremental DOM Runtime**
   - MutationObserver 只采集增量；
   - Set 去重；
   - 祖先覆盖后代；
   - 批次上限；
   - 队列软上限；
   - 无周期全页扫描。

3. **Browser-native Copy Restoration**
   - 真实 `copy` 事件；
   - `event.clipboardData`；
   - 输入区隔离；
   - URL tracking cleaner；
   - 原生浏览器右键保留。

4. **综合增强定位**
   - Native actions；
   - Copy；
   - Context menu；
   - Spoiler；
   - Playback；
   - PiP；
   - Links；
   - Call confirmation；
   - Pinned/Sponsored handling；
   - GPU Safe Toast。

---

# 6. 最终审计判定

## `ECOSYSTEM PRIOR-ART AUDIT: PASS WITH POSITIONING CONSTRAINTS`

### PASS 的含义

截至审计时可访问的 Greasy Fork Telegram 公开生态：

**没有发现证据表明 V1.0.0 当前实现是从另一个未披露的独立 Telegram Userscript 直接复制形成。**

已经识别出的主要历史来源：
- Neet-Nestor

已在 THIRD_PARTY_NOTICES / CODE_PROVENANCE_AUDIT 中透明记录。

其他主要项目与 V1.0.0：
- 功能可能重叠；
- 浏览器 API 可能相同；
- Telegram DOM 客观事实可能相同；
- 但核心程序结构、下载路线或交互数据流存在明显区别。

### POSITIONING CONSTRAINTS 的含义

不得把下列内容写成项目声明：

- 全球首个 Telegram 增强脚本；
- 首个 Telegram 受限下载工具；
- 首创 Telegram 复制解锁；
- 首创 Telegram 画中画；
- 首创 Telegram 视频倍速；
- 首创 Telegram 广告处理；
- 第一个 Telegram Ultimate 工具；
- 所有类似功能都源于本项目。

---

# 7. 可以安全使用的项目定位

推荐：

> **Telegram Ultimate Enhancer 是由 xiaohuitongxue 首次公开发布并维护的独立 Telegram Web 综合增强项目。**

更严谨版本：

> **Telegram Ultimate Enhancer is an independently developed Telegram Web enhancement project focused on low-overhead native-action restoration, protected-content usability, playback enhancements, and safer interaction.**

中文：

> **Telegram Ultimate Enhancer / Telegram 终极增强器是一个独立开发的 Telegram Web 综合增强项目，重点提供低开销的原生动作恢复、受保护内容使用体验、播放增强及安全交互。**

这里的“首次公开发布”指：
**Telegram Ultimate Enhancer 这个具体项目的 V1.0.0 首次公开发布。**

不是指这些 Telegram 功能第一次在世界上出现。

---

# 8. 项目名称审计

## 当前名称
`Telegram Ultimate Enhancer`

## 已存在相近名称
`Telegram Web - Ultimate Unlocker & Media Downloader`
创建于 2026-06-04。

## 判断
**不需要修改 GitHub 仓库名。**

理由：
- 完整名称不同；
- `Enhancer` 与 `Unlocker & Media Downloader` 产品定位不同；
- `Ultimate` 是常见描述词；
- 当前仓库地址已经稳定；
- 修改名称反而会破坏已经建立的首发证据链连续性。

## 但建议强化副标题
GitHub Description / README 首屏建议固定：

> Telegram Web 低开销综合增强：原生媒体动作恢复、受保护内容复制、播放增强与安全交互。

这可以明显降低与纯 Downloader / Unlocker 项目的混淆。

---

# 9. GitHub 文档建议

正式仓库建议新增：

`docs/ECOSYSTEM_PRIOR_ART_AUDIT.md`

并维持：

- `LICENSE`
- `ADDITIONAL_TERMS.md`
- `THIRD_PARTY_NOTICES.md`
- `docs/CODE_PROVENANCE_AUDIT.md`
- `docs/ECOSYSTEM_PRIOR_ART_AUDIT.md`

### THIRD_PARTY_NOTICES 不建议塞入所有上述项目

原因：
这些项目属于 **prior art（既有作品）**，不等于本项目使用了它们的代码。

THIRD_PARTY_NOTICES 继续只记录真正有历史参考/许可证关系的来源，例如 Neet-Nestor。

其他独立 prior art 放在本审计报告即可，避免造成“本项目由十几个脚本拼成”的错误印象。

---

# 10. 发布策略

推荐顺序：

1. Greasy Fork 生态审计完成；
2. 将本报告加入正式首发包；
3. 更新 README 的项目定位；
4. 保持 `Telegram-Ultimate-Enhancer` 仓库名称；
5. 上传 GitHub V1.0.0；
6. 创建 GitHub Release V1.0.0；
7. 最后发布 Greasy Fork；
8. Greasy Fork 页面不使用“全球首创/第一个”等无法证明的宣传语。

---

# 11. 最终结论

**【代码层面】**
PASS。

**【独立项目定位】**
PASS。

**【名称】**
保留 `Telegram Ultimate Enhancer`。

**【功能首创声明】**
禁止。

**【GitHub 仓库】**
无需重新创建或修改名称。

**【许可证】**
继续 GNU GPLv3；当前方向无需更改。

**【下一步】**
将本报告纳入 V1.0.0 正式首发包，并基于审计结论更新 README 后，再进行 GitHub 第一次代码发布。

---

## 主要公开来源

1. Neet-Nestor — Telegram Media Downloader  
   https://greasyfork.org/en/scripts/446342-telegram-media-downloader

2. copyMister — Telegram Web Media Downloader + Copy Text  
   https://greasyfork.org/en/scripts/477900-telegram-web-media-downloader-save-restricted-photos-videos-batch-copy-text

3. maanimis — enable-copy-telegram  
   https://greasyfork.org/en/scripts/527824-enable-copy-telegram

4. diorhc — Telegram +  
   https://greasyfork.org/en/scripts/537433-telegram

5. ibryapici — Telegram Text Copier  
   https://greasyfork.org/en/scripts/541182-telegram-text-copier

6. OsoCosmico — Telegram Web - Media Batch Downloader  
   https://greasyfork.org/en/scripts/567432-telegram-web-media-batch-downloader

7. jacksonc — Telegram Media Downloader (Global Edition)  
   https://greasyfork.org/en/scripts/573418-telegram-media-downloader-global-edition

8. Andrew98 — Telegram Media Downloader (Optimized & Enhanced)  
   https://greasyfork.org/en/scripts/575704-telegram-media-downloader-optimized-enhanced

9. wzzhaoyi — Telegram Media Downloader Queue + ZIP  
   https://greasyfork.org/en/scripts/578070-telegram-media-downloader

10. vortexvips — Telegram Web - Ultimate Unlocker & Media Downloader  
    https://greasyfork.org/en/scripts/581155-telegram-web-ultimate-unlocker-media-downloader

11. LaneZeroO — Telegram Web Copy Helper  
    https://greasyfork.org/en/scripts/582166-telegram-web-copy-helper

12. GooseOb — Telegram Photo Protection Remover  
    https://greasyfork.org/en/scripts/443342-telegram-photo-protection-remover

13. Greasy Fork telegram.org public listing  
    https://greasyfork.org/en/scripts/by-site/telegram.org
