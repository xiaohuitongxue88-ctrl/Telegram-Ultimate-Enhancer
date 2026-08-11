# Telegram Ultimate Enhancer V1.0.0 代码血缘审计

**审计日期：** 2026-08-11  
**审计版本：** Telegram Ultimate Enhancer V1.0.0  
**审计状态：** `PASS（技术血缘收口） / LIVE PASS（真实页面回归通过）`

> 本报告是工程层面的代码来源与实现路径审计，不是法院意义上的版权鉴定，也不构成法律意见。`PASS` 的含义是：在本次审计范围内，没有发现阻止该项目以独立新项目定位发布的实质性历史实现残留；它不等于“世界范围内 100% 原创”或不存在任何通用 API / Telegram DOM 相似。

## 1. 审计目标

本次目标不是把变量改名，而是检查 V1.0.0 是否已经从早期参考项目 `Telegram Media Downloader` 的特有实现路径中脱离，同时保留用户当前稳定脚本已经具备的复制、右键、剧透、视频增强、外链、安全交互和低资源运行能力。

重点审查：

1. 是否仍包含 Range Fetch / Blob 分片下载器；
2. 是否仍采用固定间隔 `setInterval` 扫描 Telegram DOM；
3. 是否仍采用 `hiddenButtons → remove('hide') → 固定字体字符判定 → btn.click()` 的历史控制流；
4. 是否仍包含原项目自建下载按钮、下载进度条和相关特殊命名；
5. V1.0.0 新 Native Action 模块是否形成独立的证据式判断结构；
6. 共享的 Telegram DOM 类名和标准浏览器 API 是否只是平台事实/公共接口，而不是复制特有表达。

## 2. 对照来源

### 2.1 当前项目基准

- 用户提供并已正常使用的内部稳定基准脚本（未公开发布）；
- 本地仅作为功能基准保留，不进入公开首发包；
- V1.0.0 在该基准上做定向原创化收口，不恢复早期第三方下载引擎。

### 2.2 历史参考项目

- 项目：`Telegram Media Downloader`
- 作者：Nestor Qin / Neet-Nestor
- 上游声明许可证：GNU GPLv3
- 审查版本：1.212
- Greasy Fork：`https://greasyfork.org/en/scripts/446342-telegram-media-downloader/code`
- GitHub：`https://github.com/Neet-Nestor/Telegram-Media-Downloader`
- 固定审查 commit：`169a678627cec090ce1fa8b6eaac250547f0121a`
- 上游文件：`src/tel_download.js`
- Git blob SHA：`46b4e539528017204a778326505775a38c10671b`

固定来源记录见 `reference/SOURCE_RECORD.md`。`reference` 目录仅用于审计可复现性，不参与脚本运行。

## 3. 上游高风险实现特征

对 1.212 源码人工复核确认，其实现包含以下具有明显识别度的路径：

- `REFRESH_DELAY = 500` 与多个 `setInterval(..., REFRESH_DELAY)` 页面扫描；
- `tel_download_video` / `tel_download_audio` / `tel_download_image`；
- `contentRangeRegex`、HTTP `Range`、`Content-Range`、`_next_offset` 与 Blob 拼接；
- `showSaveFilePicker` 与自建下载进度 UI；
- WebK 媒体查看器内：`hiddenButtons` 查询 `button.btn-icon.hide`，先移除 `hide`，再依据 `DOWNLOAD_ICON` / `FORWARD_ICON` 固定字形补 class，并通过 `btn.click()` 代理官方动作；
- 在缺少官方按钮时自建 `tel-download` 按钮并绑定下载函数。

这些项目被列为本次阻断性血缘指标。

## 4. V1.0.0 架构复核

V1.0.0 原生动作链已改为：

`ContextDetector → CandidateCollector → ActionClassifier → VisibilityInspector → EvidenceGate → ActionRestorer → NativeActionEngine`

核心差异：

- **动作身份与隐藏状态分离。** 不因为元素带 `hide` 就直接认定其为下载/转发动作；
- **证据分级。** `aria-label` / `title` / `data-action` / `data-testid` 明确语义可成为直接证据，语义 class 和受控上下文作为强证据，字体字形只作为弱提示；
- **证据门槛。** 未达到动作身份与证据门槛的候选不恢复；
- **最小修改。** 只恢复已确认原生动作自身的隐藏/不可交互状态，不创建下载器，不代理 `.click()`，不接管媒体网络；
- **增量运行。** 使用 `MutationObserver` 收集新增节点，交给有界 Scheduler 分批处理；不存在周期性页面轮询；
- **候选范围受控。** 原生动作候选只在明确媒体动作区收集，不对整个 `.media-viewer` 做持续深层扫描。

## 5. 自动检查结果

### 5.1 JavaScript 源码不变量

`tests/source-invariants.test.cjs` 检查：

- V1.0.0 正式元数据与规划仓库地址；
- 禁止历史下载器/轮询 token；
- 新证据式 Native Action 模块存在；
- 不存在 `button.btn-icon.hide` 旧组合和“移除 hide 后固定字符判定”的旧控制流；
- 复制、剧透、外链净化、防误拨、PiP、MutationObserver、Scheduler 等基准功能代码仍存在；
- Native Action 上下文没有退化为整个 `.media-viewer`；
- 源文件声明项目版权，并指向 GPLv3 Section 7 附加条款文件。

最近一次本地执行结果：`8/8 PASS`。

### 5.2 审计工具自测

`tests/provenance-audit.test.py` 对审计器自身验证：

- 含历史 marker / 连续公共实现片段的样本会得到 `REVIEW`；
- 不含这些阻断性特征的新结构样本可得到 `PASS/NOTICE`。

最近一次本地执行结果：`2/2 PASS`。

### 5.3 高风险签名扫描

`tools/provenance-audit.py` 对上游高风险 marker 清单与 V1.0.0 正式代码进行机械扫描，最近一次结果：

```text
historical_markers_present: []
exact_normalized_line_overlap_count: 0
max_common_run_lines: 0
verdict: PASS
```

**范围说明：** 该机械结果针对本地保存的高风险历史签名集合，不是对上游 803 行源码做全文法证式相似度结论。因此最终判定同时依赖第 3、4、6 节的人工源代码复核。

## 6. 表达级人工复核

### 6.1 已确认移除/未采用

V1.0.0 中未发现以下字符串或控制流：

- `tel_download_video`
- `tel_download_audio`
- `tel_download_image`
- `contentRangeRegex`
- `REFRESH_DELAY`
- `hiddenButtons`
- `DOWNLOAD_ICON`
- `FORWARD_ICON`
- `button.btn-icon.hide`
- `createProgressBar`
- `showSaveFilePicker`
- `_next_offset`
- `fetchNextPart`
- `Content-Range`
- `new Blob(` 下载拼接路径
- `.click()` / `onclick =` 原生动作代理路径
- `setInterval(` / `requestAnimationFrame(` DOM 自旋扫描

### 6.2 仍可能出现的公共/平台事实

以下元素即使两项目都使用，也不能单凭相同名称认定为复制特有代码表达，本报告将其列入 `NOTICE` 范畴而不是阻断项：

- Telegram Web 自身公开 DOM/class 事实，例如 `.media-viewer-topbar`、`.media-viewer-buttons`、`.tgico-download`、`.tgico-forward`、`#MediaViewer .MediaViewerActions`；
- 标准 Web API，例如 `document.querySelector`、`MutationObserver`、`classList`、事件监听、Picture-in-Picture；
- Userscript 通用元数据，例如 `@match https://web.telegram.org/*`；
- “恢复 Telegram 原生动作”“解除复制限制”这类功能目标/产品思想本身。

V1.0.0 仍保留极少量 Telegram 字体字形提示，但它们位于 `GLYPH_HINTS` 中，只是弱证据，不能单独越过 EvidenceGate；同时不再采用上游 1.212 的 `DOWNLOAD_ICON` / `FORWARD_ICON` 常量与旧循环控制流。

## 7. 第三方与许可证处理

- 项目继续采用标准 GNU GPLv3 文本，`LICENSE` 不自行改写；
- `THIRD_PARTY_NOTICES.md` 明确保留早期参考 `Telegram Media Downloader` 的历史关系，而不是删除来源记录；
- `ADDITIONAL_TERMS.md` 仅对 `xiaohuitongxue` 享有版权或有权附加条款的项目原创材料适用，用于 GPLv3 Section 7 允许范围内的合理署名、来源保留与修改版标记；
- 附加条款明确不主张第三方 GPL 材料、Telegram 自身接口、标准浏览器 API 或他人独立实现的类似功能归当前项目所有。

## 8. 审计结论

### `PASS — 技术血缘收口通过`

在本次审计范围内：

1. 未发现历史 Range/Blob 下载器及其特殊命名；
2. 未发现上游固定间隔 DOM 扫描架构；
3. 未发现 `hiddenButtons → remove hide → 固定 glyph → btn.click()` 历史控制流；
4. 未发现上游自建下载进度体系；
5. 原生动作恢复已经形成独立的证据式结构与控制流；
6. 剩余相同点主要属于 Telegram DOM 平台事实、标准浏览器 API、Userscript 元数据或通用功能目标，按 `NOTICE` 记录；
7. 项目历史参考关系继续透明保留，不将其描述成“从未参考第三方”。

因此，**从工程/代码血缘角度，V1.0.0 可以定位为新的 `Telegram Ultimate Enhancer / Telegram 终极增强器` 项目首发版，而不是 `Telegram Media Downloader` 的维护版或简单修补版。**

但本报告不建议使用以下宣传语：

- “100% 全球原创”；
- “Telegram 下载功能首创”；
- “与任何第三方项目从无关系”。

更准确的表述是：

> Telegram Ultimate Enhancer 是独立发展的 Telegram Web 增强项目。早期开发曾参考开源项目 Telegram Media Downloader 的受限媒体处理思路；V1.0.0 已重新设计核心原生动作恢复路径，并以增量 DOM、证据式动作判定和原生能力优先为当前架构。

## 9. LIVE 状态

最终记录：

`AUTOMATED PASS / LIVE PASS`

2026-08-11，项目作者在真实 Chrome + Tampermonkey + Telegram Web 环境完成现场功能回归。已确认受保护内容复制、原生下载/转发恢复、普通按钮无误显、倍速、画中画、输入区复制、外链、防误拨、剧透、置顶/赞助处理及连续使用稳定性均正常。持续轮询/高频 DOM 扫描则由自动源码检查确认不存在。现场清单见 `docs/LIVE_VERIFICATION_CHECKLIST.md`。
