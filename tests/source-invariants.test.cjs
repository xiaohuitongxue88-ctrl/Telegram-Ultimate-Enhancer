const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'Telegram-Ultimate-Enhancer.user.js');
const source = fs.readFileSync(sourcePath, 'utf8');

test('public metadata is V1.0.0 and points to official repository', () => {
  assert.match(source, /@name\s+Telegram Ultimate Enhancer/);
  assert.match(source, /@name:zh-CN\s+Telegram 终极增强器/);
  assert.match(source, /@version\s+1\.0\.0/);
  assert.match(source, /github\.com\/xiaohuitongxue88-ctrl\/Telegram-Ultimate-Enhancer/);
  assert.match(source, /@license\s+GNU GPLv3/);
});

test('forbidden downloader and polling patterns are absent', () => {
  for (const token of [
    'tel_download_video', 'tel_download_audio', 'tel_download_image',
    'contentRangeRegex', 'showSaveFilePicker', '_next_offset',
    'createProgressBar', 'setInterval('
  ]) {
    assert.equal(source.includes(token), false, `forbidden token: ${token}`);
  }
});

test('evidence based native action modules exist', () => {
  for (const token of [
    'ContextDetector', 'CandidateCollector', 'ActionClassifier',
    'VisibilityInspector', 'EvidenceGate', 'ActionRestorer',
    'NativeActionEngine'
  ]) {
    assert.equal(source.includes(token), true, `missing module: ${token}`);
  }
});

test('fixed icon glyph is not the sole action identity path', () => {
  assert.equal(source.includes("text === '\\ue977'"), false);
  assert.equal(source.includes("text === '\\ue995'"), false);
  assert.equal(source.includes('button.btn-icon.hide'), false);
});

test('native action decision does not equate hidden state with action identity', () => {
  assert.equal(/querySelectorAll\([^\n]*button\.btn-icon\.hide/.test(source), false);
  assert.equal(/classList\.remove\(['"]hide['"]\)[\s\S]{0,240}textContent\s*===/.test(source), false);
  assert.match(source, /direct\.length\s*>\s*0/);
  assert.match(source, /strong\.length\s*>=\s*2/);
});

test('baseline enhancement features remain present', () => {
  for (const token of [
    'UNLOCK_PROTECTED_COPY', 'UNLOCK_SPOILERS',
    'OPEN_EXTERNAL_LINKS_IN_NEW_TAB', 'CLEAN_TRACKING_PARAMS_ON_COPY',
    'CONFIRM_CALL_ACTION', 'requestPictureInPicture',
    'MutationObserver', 'DOM_QUEUE_SOFT_LIMIT', 'stopImmediatePropagation'
  ]) {
    assert.equal(source.includes(token), true, `feature regression: ${token}`);
  }
});

test('native action context stays narrow to action bars instead of whole media viewer', () => {
  const match = source.match(/const ContextDetector = \{[\s\S]*?CONTEXT_SELECTOR: \[([\s\S]*?)\]\.join\(','\)/);
  assert.ok(match, 'ContextDetector selector list not found');
  assert.equal(/['"]\.media-viewer['"]/.test(match[1]), false);
});

test('source declares project copyright and GPLv3 section 7 terms location', () => {
  assert.match(source, /Copyright \(C\) 2026 xiaohuitongxue/);
  assert.match(source, /ADDITIONAL_TERMS\.md/);
  assert.match(source, /GPLv3 Section 7/);
});
