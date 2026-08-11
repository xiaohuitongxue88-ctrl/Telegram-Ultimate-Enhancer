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

        FEEDBACK_PROMPT_ENABLED: true,
        FEEDBACK_TEST_MODE: false,
        FEEDBACK_TEST_DELAY_MS: 1500,
        FEEDBACK_IDLE_DELAY_MS: 10000,
        FEEDBACK_SESSION_GAP_MS: 30 * 60 * 1000,

        FEEDBACK_URL:
            'https://greasyfork.org/zh-CN/scripts/590834-telegram-ultimate-enhancer/feedback',
        GITHUB_URL:
            'https://github.com/xiaohuitongxue88-ctrl/Telegram-Ultimate-Enhancer',

        FEEDBACK_STAGES: Object.freeze([
            Object.freeze({
                minAgeMs: 3 * 24 * 60 * 60 * 1000,
                minSessions: 3,
                minSuccess: 5,
                minFeatures: 2,
                minGapMs: 0
            }),
            Object.freeze({
                minAgeMs: 14 * 24 * 60 * 60 * 1000,
                minSessions: 10,
                minSuccess: 25,
                minFeatures: 3,
                minGapMs: 10 * 24 * 60 * 60 * 1000
            }),
            Object.freeze({
                minAgeMs: 45 * 24 * 60 * 60 * 1000,
                minSessions: 25,
                minSuccess: 80,
                minFeatures: 3,
                minGapMs: 30 * 24 * 60 * 60 * 1000
            })
        ]),

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
                console.log(
                    `[Telegram Ultimate Enhancer V${Config.VERSION}] [${tag}]`,
                    ...args
                );
            }
        },

        warn(tag, ...args) {
            if (Config.DEBUG) {
                console.warn(
                    `[Telegram Ultimate Enhancer V${Config.VERSION}] [${tag}]`,
                    ...args
                );
            }
        },

        error(tag, ...args) {
            console.error(
                `[Telegram Ultimate Enhancer V${Config.VERSION}] [${tag}]`,
                ...args
            );
        }
    };

    // =============================================================================
    // 03. 弱引用缓存
    // =============================================================================
    const Cache = {
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

            return Boolean(
                target.closest(
                    'input,textarea,select,[contenteditable="true"],[role="textbox"]'
                )
            );
        },

        getActiveVideo() {
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

                const vw =
                    window.innerWidth || document.documentElement.clientWidth;
                const vh =
                    window.innerHeight || document.documentElement.clientHeight;

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
        },

        openNewTab(url) {
            try {
                return window.open(
                    String(url || ''),
                    '_blank',
                    'noopener,noreferrer'
                );
            } catch (error) {
                Log.warn('OPEN_TAB', error);
                return null;
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
    // 06. 使用反馈提示
    // =============================================================================
    const FeedbackPrompt = {
        STORAGE_KEY: 'telegram-ultimate-enhancer.feedback.v1',

        panel: null,
        eligibilityTimer: 0,
        testTimer: 0,
        passiveFeatureTimes: new Map(),

        defaultState() {
            return {
                firstSeenAt: Date.now(),
                lastSessionAt: 0,
                sessionCount: 0,
                successCount: 0,
                featureFlags: [],
                promptCount: 0,
                lastPromptAt: 0,
                actionClicked: false
            };
        },

        loadState() {
            const fallback = this.defaultState();

            try {
                const raw = localStorage.getItem(this.STORAGE_KEY);
                if (!raw) {
                    this.saveState(fallback);
                    return fallback;
                }

                const parsed = JSON.parse(raw);
                const state = {
                    ...fallback,
                    ...parsed
                };

                if (!Array.isArray(state.featureFlags)) {
                    state.featureFlags = [];
                }

                return state;
            } catch (error) {
                Log.warn('FEEDBACK_STORAGE_READ', error);
                return fallback;
            }
        },

        saveState(state) {
            try {
                localStorage.setItem(
                    this.STORAGE_KEY,
                    JSON.stringify(state)
                );
                return true;
            } catch (error) {
                Log.warn('FEEDBACK_STORAGE_WRITE', error);
                return false;
            }
        },

        init() {
            if (!Config.FEEDBACK_PROMPT_ENABLED || !document.body) return;

            if (Config.FEEDBACK_TEST_MODE) {
                clearTimeout(this.testTimer);

                this.testTimer = setTimeout(() => {
                    this.show({ testMode: true });
                }, Config.FEEDBACK_TEST_DELAY_MS);

                return;
            }

            this.loadState();
        },

        recordSuccess(feature, options = {}) {
            if (!Config.FEEDBACK_PROMPT_ENABLED) return;
            if (Config.FEEDBACK_TEST_MODE) return;

            const featureName = String(feature || '').trim();
            if (!featureName) return;

            const now = Date.now();
            const cooldownMs = Math.max(
                0,
                Number(options.cooldownMs || 0)
            );

            if (cooldownMs > 0) {
                const last = Number(
                    this.passiveFeatureTimes.get(featureName) || 0
                );

                if (now - last < cooldownMs) {
                    return;
                }

                this.passiveFeatureTimes.set(featureName, now);
            }

            const state = this.loadState();
            if (state.actionClicked) return;

            state.successCount =
                Math.max(0, Number(state.successCount || 0)) + 1;

            const features = new Set(state.featureFlags || []);
            features.add(featureName);
            state.featureFlags = Array.from(features);

            const lastSessionAt = Number(state.lastSessionAt || 0);
            if (
                !lastSessionAt ||
                now - lastSessionAt >= Config.FEEDBACK_SESSION_GAP_MS
            ) {
                state.sessionCount =
                    Math.max(0, Number(state.sessionCount || 0)) + 1;
                state.lastSessionAt = now;
            }

            this.saveState(state);
            this.scheduleIfEligible(state);
        },

        getCurrentStage(state) {
            const index = Math.max(
                0,
                Number(state.promptCount || 0)
            );

            return Config.FEEDBACK_STAGES[index] || null;
        },

        isEligible(state) {
            if (!state || state.actionClicked) return false;

            const stage = this.getCurrentStage(state);
            if (!stage) return false;

            const now = Date.now();
            const firstSeenAt = Number(state.firstSeenAt || now);
            const lastPromptAt = Number(state.lastPromptAt || 0);
            const featureCount = new Set(
                state.featureFlags || []
            ).size;

            if (now - firstSeenAt < stage.minAgeMs) return false;
            if (Number(state.sessionCount || 0) < stage.minSessions) {
                return false;
            }
            if (Number(state.successCount || 0) < stage.minSuccess) {
                return false;
            }
            if (featureCount < stage.minFeatures) return false;

            if (
                stage.minGapMs > 0 &&
                lastPromptAt > 0 &&
                now - lastPromptAt < stage.minGapMs
            ) {
                return false;
            }

            return true;
        },

        isSafeMoment() {
            if (!document.body) return false;
            if (document.hidden) return false;
            if (document.fullscreenElement) return false;

            const active = document.activeElement;
            if (
                active instanceof Element &&
                Utils.isEditableTarget(active)
            ) {
                return false;
            }

            return true;
        },

        scheduleIfEligible(state) {
            if (!this.isEligible(state)) return;
            if (this.panel || this.eligibilityTimer) return;

            this.eligibilityTimer = setTimeout(() => {
                this.eligibilityTimer = 0;

                const fresh = this.loadState();
                if (!this.isEligible(fresh)) return;
                if (!this.isSafeMoment()) return;

                this.show({ testMode: false });
            }, Config.FEEDBACK_IDLE_DELAY_MS);
        },

        removePanel() {
            if (this.panel?.isConnected) {
                this.panel.remove();
            }

            this.panel = null;
        },

        markActionClicked() {
            if (Config.FEEDBACK_TEST_MODE) return;

            const state = this.loadState();
            state.actionClicked = true;
            this.saveState(state);
        },

        show({ testMode = false } = {}) {
            if (!document.body || this.panel) return;

            if (!testMode) {
                const state = this.loadState();

                if (!this.isEligible(state)) {
                    return;
                }

                state.promptCount =
                    Math.max(0, Number(state.promptCount || 0)) + 1;
                state.lastPromptAt = Date.now();
                this.saveState(state);
            }

            const panel = document.createElement('section');
            panel.id = 'tue-feedback-prompt';
            panel.setAttribute('role', 'region');
            panel.setAttribute('aria-label', '支持项目持续维护');

            panel.innerHTML = `
                <div class="tue-feedback-head">
                    <div class="tue-feedback-title">
                        支持项目持续维护
                    </div>

                    <button
                        type="button"
                        class="tue-feedback-close"
                        aria-label="关闭本次提示"
                        title="关闭"
                    >×</button>
                </div>

                <div class="tue-feedback-copy">
                    <p>
                        如果 <strong>Telegram Ultimate Enhancer</strong>
                        对你的实际使用有所帮助，欢迎留下真实评价或为项目添加 GitHub Star。
                    </p>

                    <p>
                        <strong>
                            你的好评、Star 和推荐，是我持续更新、修复兼容问题和开发新功能的重要动力。
                        </strong>
                    </p>

                    <p>
                        长期缺少真实反馈和社区支持，也意味着项目的持续需求有限，
                        后续维护和新功能开发可能相应减少。
                    </p>
                </div>

                <div class="tue-feedback-actions">
                    <button
                        type="button"
                        class="tue-feedback-action tue-feedback-primary"
                        data-tue-feedback-action="greasyfork"
                    >
                        提交 Greasy Fork 评价
                    </button>

                    <button
                        type="button"
                        class="tue-feedback-action tue-feedback-secondary"
                        data-tue-feedback-action="github"
                    >
                        GitHub Star
                    </button>
                </div>
            `;

            const closeButton = panel.querySelector(
                '.tue-feedback-close'
            );

            closeButton?.addEventListener(
                'click',
                () => this.removePanel(),
                { once: true }
            );

            panel
                .querySelector(
                    '[data-tue-feedback-action="greasyfork"]'
                )
                ?.addEventListener(
                    'click',
                    () => {
                        this.markActionClicked();
                        Utils.openNewTab(Config.FEEDBACK_URL);
                        this.removePanel();
                    },
                    { once: true }
                );

            panel
                .querySelector(
                    '[data-tue-feedback-action="github"]'
                )
                ?.addEventListener(
                    'click',
                    () => {
                        this.markActionClicked();
                        Utils.openNewTab(Config.GITHUB_URL);
                        this.removePanel();
                    },
                    { once: true }
                );

            document.body.appendChild(panel);
            this.panel = panel;
        }
    };

    // =============================================================================
    // 07. Telegram 原生动作证据引擎
    // =============================================================================
    const NativeActionEvidence = Object.freeze({
        ACTION_TERMS: Object.freeze({
            download: Object.freeze(['download', '下载', 'save', '保存']),
            forward: Object.freeze(['forward', '转发'])
        }),

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
                for (
                    const context of root.querySelectorAll(
                        this.CONTEXT_SELECTOR
                    )
                ) {
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

                    for (
                        const element of context.querySelectorAll(
                            this.CANDIDATE_SELECTOR
                        )
                    ) {
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

            for (
                const [action, terms]
                of Object.entries(NativeActionEvidence.ACTION_TERMS)
            ) {
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
            const record = (
                bucket,
                source,
                value,
                action
            ) => {
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
                record(
                    evidence.direct,
                    source,
                    this.normalize(value),
                    action
                );
            }

            const className = this.normalize(element.className);
            const classAction = this.findAction(className);
            record(
                evidence.strong,
                'semantic-class',
                className,
                classAction
            );

            const context =
                ContextDetector.closestActionContext(element);
            if (context) {
                evidence.strong.push(
                    'telegram-media-action-context'
                );
            }

            if (
                element.matches?.(
                    'button,.btn-icon,[role="button"]'
                ) &&
                (
                    className.includes('btn icon') ||
                    className.includes('btn-icon') ||
                    element.tagName === 'BUTTON'
                )
            ) {
                evidence.strong.push(
                    'telegram-native-button-shape'
                );
            }

            const glyph =
                String(element.textContent || '').trim();
            const glyphAction =
                NativeActionEvidence.GLYPH_HINTS[glyph] ||
                'unknown';

            record(
                evidence.weak,
                'glyph-hint',
                glyph
                    ? `U+${glyph.codePointAt(0).toString(16)}`
                    : '',
                glyphAction
            );

            const uniqueVotes =
                Array.from(new Set(actionVotes));

            if (uniqueVotes.length === 1) {
                evidence.action = uniqueVotes[0];
            } else if (uniqueVotes.length > 1) {
                evidence.action = 'unknown';
                evidence.weak.push(
                    `conflict:${uniqueVotes.join('|')}`
                );
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

            if (!(element instanceof HTMLElement)) {
                return result;
            }

            if (element.classList.contains('hide')) {
                result.reasons.push('class:hide');
            }

            if (
                element.hidden ||
                element.hasAttribute('hidden')
            ) {
                result.reasons.push('attribute:hidden');
            }

            const inline = element.style;

            if (inline.display === 'none') {
                result.reasons.push('style:display-none');
            }
            if (inline.visibility === 'hidden') {
                result.reasons.push(
                    'style:visibility-hidden'
                );
            }
            if (inline.pointerEvents === 'none') {
                result.reasons.push(
                    'style:pointer-events-none'
                );
            }
            if (Number(inline.opacity || 1) <= 0) {
                result.reasons.push('style:opacity-zero');
            }

            result.hidden = result.reasons.length > 0;
            return result;
        }
    };

    const EvidenceGate = {
        allows(classification) {
            if (
                !classification ||
                classification.action === 'unknown'
            ) {
                return false;
            }

            const direct = classification.direct || [];
            const strong = classification.strong || [];

            return direct.length > 0 || strong.length >= 2;
        }
    };

    const ActionRestorer = {
        restore(element, classification, visibility) {
            if (!(element instanceof HTMLElement)) {
                return false;
            }
            if (!EvidenceGate.allows(classification)) {
                return false;
            }
            if (!visibility?.hidden) {
                return false;
            }

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
                element.classList.add(
                    'tue-native-action-restored'
                );
                element.dataset.tueAction =
                    classification.action;
                Cache.processedButtons.add(element);

                FeedbackPrompt.recordSuccess(
                    'native-action',
                    { cooldownMs: 60 * 1000 }
                );

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
                if (
                    ContextDetector.closestActionContext(root)
                ) {
                    return true;
                }

                return Boolean(
                    root.querySelector(
                        ContextDetector.CONTEXT_SELECTOR
                    )
                );
            } catch {
                return false;
            }
        },

        processElement(element) {
            if (!(element instanceof HTMLElement)) {
                return false;
            }

            const visibility =
                VisibilityInspector.inspect(element);

            if (!visibility.hidden) return false;

            const classification =
                ActionClassifier.classify(element);

            return ActionRestorer.restore(
                element,
                classification,
                visibility
            );
        },

        processRoot(root) {
            if (!(root instanceof Element)) return 0;
            if (!this.mayContainCandidate(root)) return 0;

            let restored = 0;

            for (
                const candidate
                of CandidateCollector.collect(root)
            ) {
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
    // 08. 普通任务 DOM 调度器
    // =============================================================================
    const Scheduler = {
        pendingRoots: new Set(),
        flushTimer: 0,

        enqueue(root) {
            if (!(root instanceof Element)) return;

            if (!NativeActionEngine.mayContainCandidate(root)) {
                return;
            }

            for (const existing of this.pendingRoots) {
                if (
                    existing === root ||
                    existing.contains(root)
                ) {
                    return;
                }
            }

            for (
                const existing
                of Array.from(this.pendingRoots)
            ) {
                if (root.contains(existing)) {
                    this.pendingRoots.delete(existing);
                }
            }

            this.pendingRoots.add(root);

            if (
                this.pendingRoots.size >
                Config.DOM_QUEUE_SOFT_LIMIT
            ) {
                const oldest =
                    this.pendingRoots.values().next().value;

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

                if (
                    roots.length >=
                    Config.DOM_MAX_ROOTS_PER_FLUSH
                ) {
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
    // 09. 精准 MutationObserver
    // =============================================================================
    const ObserverEngine = {
        observer: null,

        start() {
            if (this.observer || !document.body) return;

            this.observer =
                new MutationObserver(mutations => {
                    for (const mutation of mutations) {
                        if (!mutation.addedNodes?.length) {
                            continue;
                        }

                        for (
                            const node
                            of mutation.addedNodes
                        ) {
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

            Log.info(
                'OBSERVER',
                'DOM 增量观察器已启动'
            );
        },

        stop() {
            if (!this.observer) return;

            this.observer.disconnect();
            this.observer = null;
        }
    };

    // =============================================================================
    // 10. 精准事件委托
    // =============================================================================
    const EventHub = {
        initialized: false,

        init() {
            if (this.initialized) return;
            this.initialized = true;

            this.setupCopy();
            this.setupContextMenu();
            this.setupKeyboard();
            this.setupClick();
        },

        setupKeyboard() {
            window.addEventListener(
                'keydown',
                event => {
                    if (
                        Utils.isEditableTarget(
                            event.target
                        )
                    ) {
                        return;
                    }

                    const key =
                        String(event.key || '')
                            .toLowerCase();

                    if (
                        key !== '[' &&
                        key !== ']' &&
                        key !== 'p'
                    ) {
                        return;
                    }

                    const video =
                        Utils.getActiveVideo();

                    if (!video) return;

                    if (key === ']') {
                        video.playbackRate =
                            Math.min(
                                4,
                                Number(
                                    video.playbackRate || 1
                                ) + 0.25
                            );

                        UI.showToast(
                            `倍速 ${video.playbackRate.toFixed(2)}×`
                        );

                        FeedbackPrompt.recordSuccess(
                            'speed'
                        );
                        return;
                    }

                    if (key === '[') {
                        video.playbackRate =
                            Math.max(
                                0.25,
                                Number(
                                    video.playbackRate || 1
                                ) - 0.25
                            );

                        UI.showToast(
                            `倍速 ${video.playbackRate.toFixed(2)}×`
                        );

                        FeedbackPrompt.recordSuccess(
                            'speed'
                        );
                        return;
                    }

                    if (key === 'p') {
                        if (
                            document.pictureInPictureElement
                        ) {
                            const result =
                                document
                                    .exitPictureInPicture?.();

                            if (
                                result &&
                                typeof result.then ===
                                    'function'
                            ) {
                                result
                                    .then(() => {
                                        FeedbackPrompt
                                            .recordSuccess(
                                                'pip'
                                            );
                                    })
                                    .catch(() =>
                                        UI.showToast(
                                            '退出画中画失败'
                                        )
                                    );
                            }
                        } else if (
                            typeof video
                                .requestPictureInPicture ===
                            'function'
                        ) {
                            video
                                .requestPictureInPicture()
                                .then(() => {
                                    FeedbackPrompt
                                        .recordSuccess(
                                            'pip'
                                        );
                                })
                                .catch(() =>
                                    UI.showToast(
                                        '画中画被浏览器拒绝'
                                    )
                                );
                        }
                    }
                },
                true
            );
        },

        setupCopy() {
            if (
                !Config.UNLOCK_PROTECTED_COPY &&
                !Config.CLEAN_TRACKING_PARAMS_ON_COPY
            ) {
                return;
            }

            window.addEventListener(
                'copy',
                event => {
                    if (
                        Utils.isEditableTarget(
                            event.target
                        )
                    ) {
                        return;
                    }

                    const selectedText =
                        Utils.selectionText();

                    if (!selectedText) return;

                    let outputText = selectedText;
                    let cleanedTracking = false;

                    if (
                        Config
                            .CLEAN_TRACKING_PARAMS_ON_COPY &&
                        /^https?:\/\/\S+$/i.test(
                            selectedText
                        )
                    ) {
                        const result =
                            Utils.cleanUrlTracking(
                                selectedText
                            );

                        if (result.modified) {
                            outputText = result.url;
                            cleanedTracking = true;
                        }
                    }

                    try {
                        if (event.clipboardData) {
                            event.clipboardData
                                .setData(
                                    'text/plain',
                                    outputText
                                );

                            event.preventDefault();
                            event.stopImmediatePropagation();

                            UI.showToast(
                                cleanedTracking
                                    ? '已复制，并清理链接跟踪参数'
                                    : '已复制选中文本'
                            );

                            FeedbackPrompt.recordSuccess(
                                cleanedTracking
                                    ? 'link-clean'
                                    : 'copy'
                            );
                            return;
                        }

                        if (
                            Config.UNLOCK_PROTECTED_COPY
                        ) {
                            event.stopImmediatePropagation();
                        }
                    } catch (error) {
                        Log.warn('COPY', error);
                    }
                },
                true
            );
        },

        setupContextMenu() {
            window.addEventListener(
                'contextmenu',
                event => {
                    const target = event.target;

                    if (!(target instanceof Element)) {
                        return;
                    }

                    if (
                        Config.UNLOCK_PROTECTED_COPY &&
                        Utils.selectionText()
                    ) {
                        event.stopImmediatePropagation();
                        return;
                    }

                    if (
                        target.closest(
                            'video,audio,img,.media-viewer,.media-container'
                        )
                    ) {
                        event.stopImmediatePropagation();
                    }
                },
                true
            );
        },

        setupClick() {
            window.addEventListener(
                'click',
                event => {
                    const target = event.target;

                    if (!(target instanceof Element)) {
                        return;
                    }

                    if (
                        Config.CONFIRM_CALL_ACTION
                    ) {
                        const callButton =
                            target.closest(
                                [
                                    '.tgico-phone',
                                    '.tgico-call',
                                    '[title*="Call" i]',
                                    '[title*="通话" i]',
                                    '[aria-label*="Call" i]'
                                ].join(',')
                            );

                        if (callButton) {
                            const confirmed =
                                window.confirm(
                                    '确定要发起语音/视频通话吗？'
                                );

                            if (!confirmed) {
                                event.preventDefault();
                                event.stopImmediatePropagation();

                                UI.showToast(
                                    '已取消通话操作'
                                );
                                return;
                            }
                        }
                    }

                    if (
                        !Config
                            .OPEN_EXTERNAL_LINKS_IN_NEW_TAB
                    ) {
                        return;
                    }

                    if (
                        event.button !== 0 ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey ||
                        event.metaKey
                    ) {
                        return;
                    }

                    const anchor =
                        target.closest('a[href]');

                    if (!anchor) return;
                    if (
                        anchor.hasAttribute('download')
                    ) {
                        return;
                    }
                    if (anchor.target === '_blank') {
                        return;
                    }

                    const href = anchor.href;

                    if (
                        !href ||
                        !Utils.isExternalHttpUrl(href)
                    ) {
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    Utils.openNewTab(href);
                    FeedbackPrompt.recordSuccess(
                        'external-link'
                    );
                },
                true
            );
        }
    };

    // =============================================================================
    // 11. 静态 CSS
    // =============================================================================
    function injectStaticStyle() {
        const rules = [];

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

        rules.push(`
            .tue-native-action-restored {
                opacity: 1 !important;
                visibility: visible !important;
                pointer-events: auto !important;
            }
        `);

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

        rules.push(`
            #tue-feedback-prompt {
                position: fixed;
                right: 16px;
                bottom: 16px;
                z-index: 2147483001;

                box-sizing: border-box;
                width: min(328px, calc(100vw - 32px));
                padding: 14px;

                border: 1px solid #e4e4e7;
                border-radius: 10px;
                background: #ffffff;
                box-shadow: 0 8px 24px rgba(15, 23, 42, .10);

                color: #18181b;
                font-family:
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    "Microsoft YaHei",
                    sans-serif;

                text-align: left;
            }

            #tue-feedback-prompt,
            #tue-feedback-prompt * {
                box-sizing: border-box;
            }

            #tue-feedback-prompt .tue-feedback-head {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 10px;
                margin: 0 0 8px;
            }

            #tue-feedback-prompt .tue-feedback-title {
                min-width: 0;
                padding-top: 3px;

                color: #18181b;
                font-size: 15px;
                font-weight: 600;
                line-height: 1.3;
                letter-spacing: -.01em;
            }

            #tue-feedback-prompt .tue-feedback-close {
                flex: 0 0 auto;
                width: 28px;
                height: 28px;
                padding: 0;

                border: 1px solid transparent;
                border-radius: 6px;
                background: transparent;

                color: #71717a;
                font: inherit;
                font-size: 18px;
                font-weight: 400;
                line-height: 1;

                cursor: pointer;
            }

            #tue-feedback-prompt .tue-feedback-close:hover,
            #tue-feedback-prompt .tue-feedback-close:focus-visible {
                border-color: #e4e4e7;
                background: #f4f4f5;
                color: #18181b;
                outline: none;
            }

            #tue-feedback-prompt .tue-feedback-copy {
                color: #52525b;
                font-size: 12.5px;
                font-weight: 400;
                line-height: 1.55;
            }

            #tue-feedback-prompt .tue-feedback-copy p {
                margin: 0 0 8px;
            }

            #tue-feedback-prompt .tue-feedback-copy p:last-child {
                margin-bottom: 0;
            }

            #tue-feedback-prompt .tue-feedback-copy strong {
                color: #18181b;
                font-weight: 600;
            }

            #tue-feedback-prompt .tue-feedback-actions {
                display: grid;
                grid-template-columns: minmax(0, 1fr) 118px;
                gap: 8px;
                margin-top: 12px;
            }

            #tue-feedback-prompt .tue-feedback-action {
                min-width: 0;
                min-height: 36px;
                padding: 7px 10px;

                border-radius: 8px;

                font: inherit;
                font-size: 12.5px;
                font-weight: 500;
                line-height: 1.2;

                cursor: pointer;
            }

            #tue-feedback-prompt .tue-feedback-primary {
                border: 1px solid #18181b;
                background: #18181b;
                color: #fafafa;
            }

            #tue-feedback-prompt .tue-feedback-primary:hover,
            #tue-feedback-prompt .tue-feedback-primary:focus-visible {
                border-color: #27272a;
                background: #27272a;
                outline: none;
            }

            #tue-feedback-prompt .tue-feedback-secondary {
                border: 1px solid #d4d4d8;
                background: #ffffff;
                color: #18181b;
            }

            #tue-feedback-prompt .tue-feedback-secondary:hover,
            #tue-feedback-prompt .tue-feedback-secondary:focus-visible {
                border-color: #a1a1aa;
                background: #f4f4f5;
                outline: none;
            }

            @media (prefers-color-scheme: dark) {
                #tue-feedback-prompt {
                    border-color: #27272a;
                    background: #18181b;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, .28);
                    color: #fafafa;
                }

                #tue-feedback-prompt .tue-feedback-title,
                #tue-feedback-prompt .tue-feedback-copy strong {
                    color: #fafafa;
                }

                #tue-feedback-prompt .tue-feedback-copy {
                    color: #d4d4d8;
                }

                #tue-feedback-prompt .tue-feedback-close {
                    color: #a1a1aa;
                }

                #tue-feedback-prompt .tue-feedback-close:hover,
                #tue-feedback-prompt .tue-feedback-close:focus-visible {
                    border-color: #3f3f46;
                    background: #27272a;
                    color: #fafafa;
                }

                #tue-feedback-prompt .tue-feedback-primary {
                    border-color: #fafafa;
                    background: #fafafa;
                    color: #18181b;
                }

                #tue-feedback-prompt .tue-feedback-primary:hover,
                #tue-feedback-prompt .tue-feedback-primary:focus-visible {
                    border-color: #e4e4e7;
                    background: #e4e4e7;
                }

                #tue-feedback-prompt .tue-feedback-secondary {
                    border-color: #3f3f46;
                    background: #18181b;
                    color: #fafafa;
                }

                #tue-feedback-prompt .tue-feedback-secondary:hover,
                #tue-feedback-prompt .tue-feedback-secondary:focus-visible {
                    border-color: #52525b;
                    background: #27272a;
                }
            }

            @media (max-width: 420px) {
                #tue-feedback-prompt {
                    right: 10px;
                    bottom: 10px;
                    width: calc(100vw - 20px);
                }

                #tue-feedback-prompt .tue-feedback-actions {
                    grid-template-columns: 1fr;
                }
            }
        `);

        GM_addStyle(rules.join('\n'));
    }

    // =============================================================================
    // 12. 生命周期
    // =============================================================================
    const Lifecycle = {
        started: false,

        start() {
            if (this.started || !document.body) return;
            this.started = true;

            NativeActionEngine.initialScan();
            ObserverEngine.start();
            FeedbackPrompt.init();

            Log.info(
                'BOOT',
                'Evidence Native Actions / DOM增量 / 精准事件委托 / GPU Safe UI'
            );
        },

        boot() {
            injectStaticStyle();
            EventHub.init();

            if (document.body) {
                this.start();
                return;
            }

            document.addEventListener(
                'DOMContentLoaded',
                () => this.start(),
                { once: true }
            );
        }
    };

    Lifecycle.boot();
})();
