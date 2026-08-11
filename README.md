# Telegram Ultimate Enhancer / Telegram 终极增强器

Telegram Web 的低开销增强 Userscript。项目优先恢复 Telegram 已存在的原生能力，不实现自有媒体分段下载器，并在不持续轮询页面的前提下提供复制、媒体查看与交互增强。

## V1.0.0 核心功能

- 在证据充分时恢复 Telegram 媒体查看器中被限制的原生下载/转发动作。
- 解除受保护频道文本选择、Ctrl+C 和浏览器原生右键复制限制。
- 解除明确的文字/媒体剧透遮罩。
- 视频倍速快捷键：`]` 加速、`[` 减速。
- `P` 切换浏览器画中画（浏览器支持时）。
- 外部 HTTP/HTTPS 链接默认在新标签页打开，并保留 Ctrl/Shift/Alt/Meta 等原生修饰键行为。
- 复制“整个选区就是一个 URL”时，可清理常见跟踪参数。
- Telegram 通话按钮增加二次确认，降低误拨风险。
- 可隐藏明确的置顶/赞助消息节点。
- GPU Safe 单实例 Toast：不使用 blur、transform 动画或持续渲染循环。

## 为什么不自建下载器

V1.0.0 不实现 Range Fetch、Blob 分片拼接、自建下载按钮或下载进度条。对于 Telegram 已经存在但被限制隐藏的原生动作，脚本仅在身份和上下文证据达到门槛时做最小恢复，然后继续由 Telegram 自身处理实际下载/转发流程。

## 低资源设计

脚本采用 MutationObserver 增量监听：Observer 回调只收集新增 Element，后续由有界队列批量处理。队列具有去重、祖先覆盖后代、批次上限和软上限，不使用 500ms 周期扫描，也不使用 requestAnimationFrame 自旋。

原生动作判断被拆分为：

`ContextDetector → CandidateCollector → ActionClassifier → VisibilityInspector → EvidenceGate → ActionRestorer`

“按钮是什么动作”和“按钮为什么不可见”分别判断；字体图标字符只作为弱提示，不因为单一隐藏状态或单一字符直接恢复按钮。

## 安装

1. 在 Chrome 中安装 Tampermonkey。
2. 打开 `Telegram-Ultimate-Enhancer.user.js`。
3. 将完整代码复制到 Tampermonkey 新建脚本并保存。
4. 打开或刷新 Telegram Web。

支持匹配：

- `https://web.telegram.org/*`
- `https://webk.telegram.org/*`
- `https://webz.telegram.org/*`

## 快捷键

- `]`：当前主要视频播放速度 +0.25×，最高 4×。
- `[`：当前主要视频播放速度 -0.25×，最低 0.25×。
- `P`：进入/退出画中画。

输入框、搜索框、编辑器等可编辑区域不会响应这些快捷键增强。

## 隐私与网络行为

V1.0.0 不新增远程统计、遥测或后台上传；不自行请求媒体分片；原生下载/转发仍由 Telegram Web 自己处理。

## 许可证

GNU GPL v3.0。标准许可证正文见 `LICENSE`。

针对本项目中由 `xiaohuitongxue` 享有版权或有权附加条款的原创材料，另有基于 GPLv3 Section 7(b)/(c) 的合理署名与来源保留要求，见 `ADDITIONAL_TERMS.md`。它要求传播相关源码或修改版时保留项目作者与官方仓库来源，并明确标记修改版本；该要求不主张第三方代码、Telegram 自身接口、标准浏览器 API 或他人独立实现的相似功能属于本项目。

项目历史与第三方说明见 `THIRD_PARTY_NOTICES.md`。

## 来源与项目历史

本项目早期开发过程中曾参考 Nestor Qin / Neet-Nestor 的开源项目 `Telegram Media Downloader` 对 Telegram Web 受限媒体场景的处理。V1.0.0 已重新设计为增量 DOM + 证据式原生动作恢复架构，不包含该项目的 Range/Blob 下载引擎、下载进度 UI 或周期性页面扫描体系。

完整血缘审计见 `docs/CODE_PROVENANCE_AUDIT.md`。

## 生态既有作品与定位边界

Greasy Fork 上早已存在 Telegram 受限媒体下载、受保护文本复制、右键保护解除、画中画、视频倍速和广告处理等不同实现。本项目不把这些单项功能声明为“全球首创”或“首次出现”。

V1.0.0 的定位是：**由 xiaohuitongxue 首次公开发布并维护的独立 Telegram Ultimate Enhancer 项目**。这里的“首次公开发布”仅指本项目及其 V1.0.0，不代表 Telegram 相关单项功能第一次在互联网上出现。

生态横向审计见 `docs/ECOSYSTEM_PRIOR_ART_AUDIT.md`。

## 官方地址与反馈

- 官方仓库：`https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer`
- Issues：`https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/issues`

## 发布状态

V1.0.0 正式首发版：当前工程状态为 `AUTOMATED PASS / LIVE PASS`。

- 自动化语法、源码不变量、血缘阻断扫描均通过；
- 2026-08-11 已在真实 Chrome + Tampermonkey + Telegram Web 环境完成现场功能回归；
- 现场验证记录见 `docs/LIVE_VERIFICATION_CHECKLIST.md`。
