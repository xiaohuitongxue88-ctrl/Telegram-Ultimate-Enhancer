// ==UserScript==
// @name         Telegram Ultimate Enhancer
// @name:zh-CN   Telegram 终极增强器
// @version      1.0.0
// @namespace    https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer
// @description  Telegram Web 低开销增强：恢复有充分证据的原生下载/转发动作，解除受保护内容复制与右键限制，并提供剧透解除、倍速、画中画、外链净化和防误拨。
// @description:zh-CN Telegram Web 低开销增强：恢复有充分证据的原生下载/转发动作，解除受保护内容复制与右键限制，并提供剧透解除、倍速、画中画、外链净化和防误拨。
// @author       xiaohuitongxue
// @license      GNU GPLv3
// @homepageURL  https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer
// @supportURL   https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/issues
// @match        https://web.telegram.org/*
// @match        https://webk.telegram.org/*
// @match        https://webz.telegram.org/*
// @icon         https://img.icons8.com/color/452/telegram-app--v5.png
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

/*
 * Telegram Ultimate Enhancer
 * Copyright (C) 2026 xiaohuitongxue
 * Licensed under GNU GPLv3.
 * Additional terms under GPLv3 Section 7 for project-authored material:
 * see https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer/blob/main/ADDITIONAL_TERMS.md
 */

(function () {
    'use strict';

    // =============================================================================
    // 01. 核心配置
    // =============================================================================
    const Config = Object.freeze({
        VERSION: '1.0.0',
        DEBUG: false,

        HIDE_PINNED_MESSAGES: true,
        HIDE_SPONSORED_MESSAGES: true,
        UNLOCK_SPOILERS: true,
        UNLOCK_PROTECTED_COPY: true,
        OPEN_EXTERNAL_LINKS_IN_NEW_TAB: true,
        CLEAN_TRACKING_PARAMS_ON_COPY: true,
        CONFIRM_CALL_ACTION: true,

        TRACKERS: Object.freeze([
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_term',
            'utm_content',
            'si',
            'igshid',
            'fbclid',
            'gclid',
            'share_id'
        ]),

        // Observer 回调只收集节点，不在 Telegram 的 DOM commit 阶段展开扫描。
        DOM_FLUSH_DELAY_MS: 28,
        DOM_MAX_ROOTS_PER_FLUSH: 24,
        DOM_QUEUE_SOFT_LIMIT: 96,

        TOAST_DURATION: 1600
    });

    // =============================================================================
    // 02. 日志
    // =============================================================================
    const Log = {
        info(tag, ...args) {
            if (Config.DEBUG) {
                console.log(`[Telegram Ultimate Enhancer V${Config.VERSION}] [${tag}]`, ...args);
            }
        },

        warn(tag, ...args) {
            if (Config.DEBUG) {
                console.warn(`[Telegram Ultimate Enhancer V${Config.VERSION}] [${tag}]`, ...args);
            }
        },

        error(tag, ...args) {
            console.error(`[Telegram Ultimate Enhancer V${Config.VERSION}] [${tag}]`, ...args);
        }
    };

    // =============================================================================
    // 03. 弱引用缓存
    // =============================================================================
    const Cache = {
        // 处理过的 Telegram 原生按钮不重复改写；节点移除后可自动回收。
        processedButtons: new WeakSet()
    };

    // =============================================================================
    // 04. 通用工具
    // =============================================================================
    const Utils = {
        isEditableTarget(target) {
            if (!(target instanceof Element)) return false;
            if (target.isContentEditable) return true;

            const tag = target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
                return true;
            }

            return Boolean(target.closest(
                'input,textarea,select,[contenteditable="true"],[role="textbox"]'
            ));
        },

        getActiveVideo() {
            // 仅在用户按快捷键时运行，不建立任何后台扫描。
            const viewerVideo = document.querySelector(
                '.media-viewer-aspecter video,.media-viewer video'
            );
            if (viewerVideo) return viewerVideo;

            const videos = Array.from(document.querySelectorAll('video'));
            if (!videos.length) return null;

            let best = null;
            let bestVisibleArea = 0;

            for (const video of videos) {
                const rect = video.getBoundingClientRect();
                if (rect.width <= 1 || rect.height <= 1) continue;

                const style = getComputedStyle(video);
                if (
                    style.display === 'none' ||
                    style.visibility === 'hidden' ||
                    Number(style.opacity || 1) <= 0
                ) {
                    continue;
                }

                const vw = window.innerWidth || document.documentElement.clientWidth;
                const vh = window.innerHeight || document.documentElement.clientHeight;

                const visibleWidth = Math.max(
                    0,
                    Math.min(rect.right, vw) - Math.max(rect.left, 0)
                );
                const visibleHeight = Math.max(
                    0,
                    Math.min(rect.bottom, vh) - Math.max(rect.top, 0)
                );
                const area = visibleWidth * visibleHeight;

                if (area > bestVisibleArea) {
                    best = video;
                    bestVisibleArea = area;
                }
            }

            return best || videos[0];
        },

        selectionText() {
            try {
                return window.getSelection()?.toString().trim() || '';
            } catch {
                return '';
            }
        },

        cleanUrlTracking(rawUrl) {
            try {
                const url = new URL(rawUrl);
                let modified = false;

                for (const key of Config.TRACKERS) {
                    if (url.searchParams.has(key)) {
                        url.searchParams.delete(key);
                        modified = true;
                    }
                }

                return { modified, url: url.toString() };
            } catch {
                return { modified: false, url: rawUrl };
            }
        },

        isExternalHttpUrl(rawUrl) {
            try {
                const url = new URL(rawUrl, location.href);

                if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                    return false;
                }

                const host = url.hostname.toLowerCase();

                return !(
                    host === 'telegram.org' ||
                    host.endsWith('.telegram.org') ||
                    host === 't.me' ||
                    host.endsWith('.t.me')
                );
            } catch {
                return false;
            }
        }
    };

    // =============================================================================
    // 05. GPU Safe 单实例 Toast
    // =============================================================================
    const UI = {
        toast: null,
        toastTimer: 0,

        initToast() {
            if (this.toast || !document.body) return;

            const toast = document.createElement('div');
            toast.id = 'telegram-ultimate-enhancer-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);

            this.toast = toast;
        },

        showToast(message, duration = Config.TOAST_DURATION) {
            if (!document.body) return;

            this.initToast();
            if (!this.toast) return;

            clearTimeout(this.toastTimer);

            this.toast.textContent = String(message || '');
            this.toast.style.display = 'block';

            if (duration > 0) {
                this.toastTimer = setTimeout(() => {
                    if (this.toast) {
                        this.toast.style.display = 'none';
                    }
                }, duration);
            }
        }
    };

    // =============================================================================
    // 06. Telegram 原生动作证据引擎
    // =============================================================================
    // 设计原则：
    // 1) “按钮是什么动作”与“按钮是否被隐藏”必须分开判断；
    // 2) aria/title/data 等直接语义优先，class/context 为强上下文证据；
    // 3) 字体图标字符只作为弱提示，绝不因为“某个隐藏字符”就直接恢复；
    // 4) 只恢复 Telegram 已存在的原生动作，不创建替代下载器、不接管网络。

    const NativeActionEvidence = Object.freeze({
        ACTION_TERMS: Object.freeze({
            download: Object.freeze(['download', '下载', 'save', '保存']),
            forward: Object.freeze(['forward', '转发'])
        }),

        // 当前 Telegram WebK/WebZ 实际可能只留下字体图标字符。
        // 这里仅作为弱提示；最终能否恢复仍必须通过 Context + Native Shape 等强证据门槛。
        GLYPH_HINTS: Object.freeze({
            '\ue977': 'download',
            '\ue995': 'forward'
        })
    });

    const ContextDetector = {
        CONTEXT_SELECTOR: [
            '.media-viewer-topbar',
            '.media-viewer-buttons',
            '#MediaViewer .MediaViewerActions',
            '#MediaViewer [class*="MediaViewerActions"]'
        ].join(','),

        isActionContext(element) {
            if (!(element instanceof Element)) return false;

            try {
                return element.matches(this.CONTEXT_SELECTOR);
            } catch {
                return false;
            }
        },

        closestActionContext(element) {
            if (!(element instanceof Element)) return null;

            try {
                if (this.isActionContext(element)) return element;
                return element.closest(this.CONTEXT_SELECTOR);
            } catch {
                return null;
            }
        },

        collectContexts(root) {
            if (!(root instanceof Element)) return [];

            const contexts = new Set();
            const direct = this.closestActionContext(root);
            if (direct) contexts.add(direct);

            try {
                for (const context of root.querySelectorAll(this.CONTEXT_SELECTOR)) {
                    contexts.add(context);
                }
            } catch {}

            return Array.from(contexts);
        }
    };

    const CandidateCollector = {
        CANDIDATE_SELECTOR: [
            'button',
            '[role="button"]',
            '.btn-icon',
            '.tgico-download',
            '.tgico-forward'
        ].join(','),

        collect(root) {
            if (!(root instanceof Element)) return [];

            const candidates = new Set();
            const contexts = ContextDetector.collectContexts(root);

            for (const context of contexts) {
                try {
                    if (context.matches(this.CANDIDATE_SELECTOR)) {
                        candidates.add(context);
                    }

                    for (const element of context.querySelectorAll(this.CANDIDATE_SELECTOR)) {
                        candidates.add(element);
                    }
                } catch {}
            }

            return Array.from(candidates);
        }
    };

    const ActionClassifier = {
        normalize(value) {
            return String(value || '')
                .toLowerCase()
                .replace(/[_-]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        },

        findAction(value) {
            const text = this.normalize(value);
            if (!text) return 'unknown';

            for (const [action, terms] of Object.entries(NativeActionEvidence.ACTION_TERMS)) {
                if (terms.some(term => text.includes(term))) {
                    return action;
                }
            }

            return 'unknown';
        },

        classify(element) {
            const evidence = {
                action: 'unknown',
                direct: [],
                strong: [],
                weak: []
            };

            if (!(element instanceof Element)) return evidence;

            const actionVotes = [];
            const record = (bucket, source, value, action) => {
                if (action === 'unknown') return;
                bucket.push(`${source}:${value}`);
                actionVotes.push(action);
            };

            const directSources = [
                ['aria-label', element.getAttribute('aria-label')],
                ['title', element.getAttribute('title')],
                ['data-action', element.getAttribute('data-action')],
                ['data-testid', element.getAttribute('data-testid')]
            ];

            for (const [source, value] of directSources) {
                const action = this.findAction(value);
                record(evidence.direct, source, this.normalize(value), action);
            }

            const className = this.normalize(element.className);
            const classAction = this.findAction(className);
            record(evidence.strong, 'semantic-class', className, classAction);

            const context = ContextDetector.closestActionContext(element);
            if (context) {
                evidence.strong.push('telegram-media-action-context');
            }

            if (
                element.matches?.('button,.btn-icon,[role="button"]') &&
                (className.includes('btn icon') || className.includes('btn-icon') || element.tagName === 'BUTTON')
            ) {
                evidence.strong.push('telegram-native-button-shape');
            }

            const glyph = String(element.textContent || '').trim();
            const glyphAction = NativeActionEvidence.GLYPH_HINTS[glyph] || 'unknown';
            record(evidence.weak, 'glyph-hint', glyph ? `U+${glyph.codePointAt(0).toString(16)}` : '', glyphAction);

            const uniqueVotes = Array.from(new Set(actionVotes));
            if (uniqueVotes.length === 1) {
                evidence.action = uniqueVotes[0];
            } else if (uniqueVotes.length > 1) {
                evidence.action = 'unknown';
                evidence.weak.push(`conflict:${uniqueVotes.join('|')}`);
            }

            return evidence;
        }
    };

    const VisibilityInspector = {
        inspect(element) {
            const result = {
                hidden: false,
                reasons: []
            };

            if (!(element instanceof HTMLElement)) return result;

            if (element.classList.contains('hide')) {
                result.reasons.push('class:hide');
            }

            if (element.hidden || element.hasAttribute('hidden')) {
                result.reasons.push('attribute:hidden');
            }

            const inline = element.style;
            if (inline.display === 'none') result.reasons.push('style:display-none');
            if (inline.visibility === 'hidden') result.reasons.push('style:visibility-hidden');
            if (inline.pointerEvents === 'none') result.reasons.push('style:pointer-events-none');
            if (Number(inline.opacity || 1) <= 0) result.reasons.push('style:opacity-zero');

            result.hidden = result.reasons.length > 0;
            return result;
        }
    };

    const EvidenceGate = {
        allows(classification) {
            if (!classification || classification.action === 'unknown') return false;

            const direct = classification.direct || [];
            const strong = classification.strong || [];

            return direct.length > 0 || strong.length >= 2;
        }
    };

    const ActionRestorer = {
        restore(element, classification, visibility) {
            if (!(element instanceof HTMLElement)) return false;
            if (!EvidenceGate.allows(classification)) return false;
            if (!visibility?.hidden) return false;

            let changed = false;

            if (element.classList.contains('hide')) {
                element.classList.remove('hide');
                changed = true;
            }

            if (element.hasAttribute('hidden')) {
                element.removeAttribute('hidden');
                changed = true;
            }

            if (element.style.display === 'none') {
                element.style.removeProperty('display');
                changed = true;
            }

            if (element.style.visibility === 'hidden') {
                element.style.removeProperty('visibility');
                changed = true;
            }

            if (element.style.pointerEvents === 'none') {
                element.style.removeProperty('pointer-events');
                changed = true;
            }

            if (Number(element.style.opacity || 1) <= 0) {
                element.style.removeProperty('opacity');
                changed = true;
            }

            if (changed) {
                element.classList.add('tue-native-action-restored');
                element.dataset.tueAction = classification.action;
                Cache.processedButtons.add(element);

                Log.info(
                    'NATIVE_ACTION',
                    `恢复 Telegram 原生 ${classification.action} 动作`,
                    {
                        direct: classification.direct,
                        strong: classification.strong,
                        weak: classification.weak,
                        hiddenReasons: visibility.reasons
                    }
                );
            }

            return changed;
        }
    };

    const NativeActionEngine = {
        mayContainCandidate(root) {
            if (!(root instanceof Element)) return false;

            try {
                if (ContextDetector.closestActionContext(root)) return true;
                return Boolean(root.querySelector(ContextDetector.CONTEXT_SELECTOR));
            } catch {
                return false;
            }
        },

        processElement(element) {
            if (!(element instanceof HTMLElement)) return false;

            const visibility = VisibilityInspector.inspect(element);
            if (!visibility.hidden) return false;

            const classification = ActionClassifier.classify(element);
            return ActionRestorer.restore(element, classification, visibility);
        },

        processRoot(root) {
            if (!(root instanceof Element)) return 0;
            if (!this.mayContainCandidate(root)) return 0;

            let restored = 0;
            for (const candidate of CandidateCollector.collect(root)) {
                if (this.processElement(candidate)) {
                    restored++;
                }
            }

            return restored;
        },

        initialScan() {
            if (!document.body) return 0;
            return this.processRoot(document.body);
        }
    };

    // =============================================================================
    // 07. 普通任务 DOM 调度器
    // =============================================================================
    const Scheduler = {
        pendingRoots: new Set(),
        flushTimer: 0,

        enqueue(root) {
            if (!(root instanceof Element)) return;

            // 快速筛掉普通消息、头像、emoji、反应等无关节点。
            if (!NativeActionEngine.mayContainCandidate(root)) return;

            // 已有祖先在队列里时不重复加入后代。
            for (const existing of this.pendingRoots) {
                if (existing === root || existing.contains(root)) {
                    return;
                }
            }

            // 新节点是祖先时，删除已经排队的后代。
            for (const existing of Array.from(this.pendingRoots)) {
                if (root.contains(existing)) {
                    this.pendingRoots.delete(existing);
                }
            }

            this.pendingRoots.add(root);

            // 防止极端 DOM burst 短时间持有过多节点引用。
            if (this.pendingRoots.size > Config.DOM_QUEUE_SOFT_LIMIT) {
                const oldest = this.pendingRoots.values().next().value;
                if (oldest) {
                    this.pendingRoots.delete(oldest);
                }
            }

            this.schedule();
        },

        schedule() {
            if (this.flushTimer) return;

            this.flushTimer = setTimeout(
                () => this.flush(),
                Config.DOM_FLUSH_DELAY_MS
            );
        },

        flush() {
            this.flushTimer = 0;

            if (!this.pendingRoots.size) return;

            const roots = [];

            for (const root of this.pendingRoots) {
                roots.push(root);

                if (roots.length >= Config.DOM_MAX_ROOTS_PER_FLUSH) {
                    break;
                }
            }

            for (const root of roots) {
                this.pendingRoots.delete(root);
                NativeActionEngine.processRoot(root);
            }

            if (this.pendingRoots.size) {
                this.schedule();
            }
        }
    };

    // =============================================================================
    // 08. 精准 MutationObserver
    // =============================================================================
    const ObserverEngine = {
        observer: null,

        start() {
            if (this.observer || !document.body) return;

            this.observer = new MutationObserver(mutations => {
                // 关键原则：Observer 回调只收集 Element。
                // 不在 Telegram 自己的 DOM commit 阶段展开 querySelectorAll 扫描。
                for (const mutation of mutations) {
                    if (!mutation.addedNodes?.length) continue;

                    for (const node of mutation.addedNodes) {
                        if (node instanceof Element) {
                            Scheduler.enqueue(node);
                        }
                    }
                }
            });

            this.observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            Log.info('OBSERVER', 'DOM 增量观察器已启动');
        },

        stop() {
            if (!this.observer) return;

            this.observer.disconnect();
            this.observer = null;
        }
    };

    // =============================================================================
    // 09. 精准事件委托
    // =============================================================================
    const EventHub = {
        initialized: false,

        init() {
            if (this.initialized) return;
            this.initialized = true;

            // 必须在 document-start 阶段尽早注册。
            // Telegram 的受保护频道可能很早就向 window/document 注册 copy/contextmenu 监听器；
            // 如果我们等 DOMContentLoaded 后再注册，即使使用 stopImmediatePropagation，
            // 也无法阻止“更早注册、已经先执行”的同层监听器。
            this.setupCopy();
            this.setupContextMenu();
            this.setupKeyboard();
            this.setupClick();
        },

        setupKeyboard() {
            window.addEventListener('keydown', event => {
                if (Utils.isEditableTarget(event.target)) return;

                const key = String(event.key || '').toLowerCase();
                if (key !== '[' && key !== ']' && key !== 'p') return;

                const video = Utils.getActiveVideo();
                if (!video) return;

                if (key === ']') {
                    video.playbackRate = Math.min(
                        4,
                        Number(video.playbackRate || 1) + 0.25
                    );

                    UI.showToast(`倍速 ${video.playbackRate.toFixed(2)}×`);
                    return;
                }

                if (key === '[') {
                    video.playbackRate = Math.max(
                        0.25,
                        Number(video.playbackRate || 1) - 0.25
                    );

                    UI.showToast(`倍速 ${video.playbackRate.toFixed(2)}×`);
                    return;
                }

                if (key === 'p') {
                    if (document.pictureInPictureElement) {
                        document.exitPictureInPicture?.()
                            .catch(() => UI.showToast('退出画中画失败'));
                    } else if (
                        typeof video.requestPictureInPicture === 'function'
                    ) {
                        video.requestPictureInPicture()
                            .catch(() => UI.showToast('画中画被浏览器拒绝'));
                    }
                }
            }, true);
        },

        setupCopy() {
            // 复制解锁与“链接净化”是两件事：
            // 1) 普通聊天文本：主动写入浏览器剪贴板并截断 Telegram 的受保护复制处理器；
            // 2) 单独 URL：在复制成功的同时，按配置清理跟踪参数。
            if (
                !Config.UNLOCK_PROTECTED_COPY &&
                !Config.CLEAN_TRACKING_PARAMS_ON_COPY
            ) {
                return;
            }

            window.addEventListener('copy', event => {
                // 输入框/编辑器必须保持 Telegram / Chrome 原生复制行为，
                // 避免影响消息输入、搜索框、编辑消息等正常操作。
                if (Utils.isEditableTarget(event.target)) return;

                const selectedText = Utils.selectionText();
                if (!selectedText) return;

                let outputText = selectedText;
                let cleanedTracking = false;

                // 只有“整个选区就是一个 URL”时才做净化，普通聊天内容绝不改写。
                if (
                    Config.CLEAN_TRACKING_PARAMS_ON_COPY &&
                    /^https?:\/\/\S+$/i.test(selectedText)
                ) {
                    const result = Utils.cleanUrlTracking(selectedText);
                    if (result.modified) {
                        outputText = result.url;
                        cleanedTracking = true;
                    }
                }

                try {
                    if (event.clipboardData) {
                        // 直接接管本次 copy 的最终文本。
                        // 这一步是修复受保护频道复制失败的关键：
                        // 不再依赖 Telegram 是否允许复制。
                        event.clipboardData.setData('text/plain', outputText);
                        event.preventDefault();

                        // 关键：stopPropagation 不足以阻止同一事件目标上的后续监听器。
                        // 使用 stopImmediatePropagation，阻止 Telegram 再次把本次复制判定为受保护。
                        event.stopImmediatePropagation();

                        UI.showToast(
                            cleanedTracking
                                ? '已复制，并清理链接跟踪参数'
                                : '已复制选中文本'
                        );
                        return;
                    }

                    // 极少数浏览器环境 clipboardData 不可用时：
                    // 不阻止浏览器默认复制，只截断 Telegram 后续监听器。
                    // 这样仍优先保留 Chrome 自身的 Copy 默认动作。
                    if (Config.UNLOCK_PROTECTED_COPY) {
                        event.stopImmediatePropagation();
                    }
                } catch (error) {
                    Log.warn('COPY', error);
                }
            }, true);
        },

        setupContextMenu() {
            window.addEventListener('contextmenu', event => {
                const target = event.target;
                if (!(target instanceof Element)) return;

                // 有文字选区时：
                // - 不调用 preventDefault，确保 Chrome 原生右键菜单仍然弹出；
                // - 使用 stopImmediatePropagation，而不是 stopPropagation，
                //   防止 Telegram 在同一层继续接管右键并触发“禁止复制”逻辑。
                if (Config.UNLOCK_PROTECTED_COPY && Utils.selectionText()) {
                    event.stopImmediatePropagation();
                    return;
                }

                // 媒体区域同理：保留浏览器原生右键菜单，不让 Telegram 抢占。
                if (
                    target.closest(
                        'video,audio,img,.media-viewer,.media-container'
                    )
                ) {
                    event.stopImmediatePropagation();
                }
            }, true);
        },

        setupClick() {
            window.addEventListener('click', event => {
                const target = event.target;
                if (!(target instanceof Element)) return;

                // -----------------------------------------------------------------
                // 防误拨：只对明确通话按钮做二次确认。
                // -----------------------------------------------------------------
                if (Config.CONFIRM_CALL_ACTION) {
                    const callButton = target.closest([
                        '.tgico-phone',
                        '.tgico-call',
                        '[title*="Call" i]',
                        '[title*="通话" i]',
                        '[aria-label*="Call" i]'
                    ].join(','));

                    if (callButton) {
                        const confirmed = window.confirm(
                            '确定要发起语音/视频通话吗？'
                        );

                        if (!confirmed) {
                            event.preventDefault();
                            event.stopImmediatePropagation();
                            UI.showToast('已取消通话操作');
                            return;
                        }
                    }
                }

                // -----------------------------------------------------------------
                // 外部链接：仅普通左键介入；修饰键、中键、下载链接、已有 _blank 均尊重原生。
                // -----------------------------------------------------------------
                if (!Config.OPEN_EXTERNAL_LINKS_IN_NEW_TAB) return;

                if (
                    event.button !== 0 ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey ||
                    event.metaKey
                ) {
                    return;
                }

                const anchor = target.closest('a[href]');
                if (!anchor) return;
                if (anchor.hasAttribute('download')) return;
                if (anchor.target === '_blank') return;

                const href = anchor.href;
                if (!href || !Utils.isExternalHttpUrl(href)) return;

                event.preventDefault();
                event.stopPropagation();

                window.open(
                    href,
                    '_blank',
                    'noopener,noreferrer'
                );
            }, true);
        }
    };

    // =============================================================================
    // 10. 静态 CSS
    // =============================================================================
    function injectStaticStyle() {
        const rules = [];

        // -------------------------------------------------------------------------
        // 复制解锁：只作用于真实文本层和明确受保护层。
        // 不再强制整个 .message / .bubble。
        // -------------------------------------------------------------------------
        rules.push(`
            .message-text,
            .text-content,
            .translatable-message,
            .message .text,
            .bubble .text,
            .bubble-content .text,
            .is-protected,
            .restricted-content,
            .nocopy {
                -webkit-user-select: text !important;
                user-select: text !important;
            }

            .text-content,
            .message-text,
            .translatable-message {
                pointer-events: auto !important;
            }

            .is-protected::after,
            .is-protected::before,
            .nocopy::after,
            .nocopy::before {
                pointer-events: none !important;
            }
        `);

        // -------------------------------------------------------------------------
        // 明确广告/赞助消息。
        // -------------------------------------------------------------------------
        if (Config.HIDE_SPONSORED_MESSAGES) {
            rules.push(`
                .sponsored-post,
                .sponsored-message,
                .channel-ad,
                [data-sponsored="true"] {
                    display: none !important;
                    pointer-events: none !important;
                }
            `);
        }

        // -------------------------------------------------------------------------
        // 置顶消息。
        // -------------------------------------------------------------------------
        if (Config.HIDE_PINNED_MESSAGES) {
            rules.push(`
                .pinned-messages-panel,
                .chat-pinned-message,
                .service-msg-pinned,
                .pinned-message {
                    display: none !important;
                    pointer-events: none !important;
                }
            `);
        }

        // -------------------------------------------------------------------------
        // 剧透解除：只保留明确 Telegram 类，不做 [class*="spoiler"] 全匹配。
        // -------------------------------------------------------------------------
        if (Config.UNLOCK_SPOILERS) {
            rules.push(`
                .spoiler,
                .spoiler-element,
                .text-spoiler {
                    filter: none !important;
                    background: transparent !important;
                    color: inherit !important;
                    opacity: 1 !important;
                }

                .media-spoiler,
                .media-spoiler-container,
                .spoiler-overlay {
                    display: none !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
            `);
        }

        // Telegram 原生下载/转发按钮显形后的统一可交互状态。
        rules.push(`
            .tue-native-action-restored {
                opacity: 1 !important;
                visibility: visible !important;
                pointer-events: auto !important;
            }
        `);

        // -------------------------------------------------------------------------
        // GPU Safe Toast：
        // 无 blur、无 transform、无 transition、无 animation。
        // 固定右上角，不使用 translateX 居中。
        // -------------------------------------------------------------------------
        rules.push(`
            #telegram-ultimate-enhancer-toast {
                position: fixed;
                top: 16px;
                right: 18px;
                z-index: 2147483000;

                display: none;
                box-sizing: border-box;
                max-width: min(78vw, 360px);
                min-height: 30px;
                padding: 7px 11px;

                border: 1px solid rgba(255,255,255,.14);
                border-radius: 9px;
                background: #202327;
                box-shadow: 0 4px 12px rgba(0,0,0,.20);

                color: #e7e9ee;
                font-family:
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    "Microsoft YaHei",
                    sans-serif;
                font-size: 11px;
                font-weight: 650;
                line-height: 1.35;
                text-align: left;

                pointer-events: none;
                user-select: none;
            }
        `);

        GM_addStyle(rules.join('\n'));
    }

    // =============================================================================
    // 11. 生命周期
    // =============================================================================
    const Lifecycle = {
        started: false,

        start() {
            if (this.started || !document.body) return;
            this.started = true;

            // 无启动 HUD / Toast，页面载入保持静默。
            // EventHub 已在 document-start 阶段提前注册，这里不重复初始化。

            // 启动时只扫一次已有媒体查看器按钮。
            NativeActionEngine.initialScan();

            // 最后启动 Observer，避免把脚本自身初始化动作加入队列。
            ObserverEngine.start();

            Log.info(
                'BOOT',
                'Evidence Native Actions / DOM增量 / 精准事件委托 / GPU Safe UI'
            );
        },

        boot() {
            // CSS 和事件保护层都在 document-start 尽早初始化。
            injectStaticStyle();
            EventHub.init();

            if (document.body) {
                this.start();
                return;
            }

            // 不轮询，不使用 requestAnimationFrame 自旋。
            document.addEventListener(
                'DOMContentLoaded',
                () => this.start(),
                { once: true }
            );
        }
    };

    Lifecycle.boot();
})();
