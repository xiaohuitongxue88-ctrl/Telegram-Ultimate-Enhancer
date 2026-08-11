#!/usr/bin/env python3
"""Conservative source-provenance comparison helper.

This tool reports mechanical similarity evidence only. It does not make a legal
copyright determination. It is intentionally conservative and treats known
historical implementation markers as blocking REVIEW evidence.
"""

from __future__ import annotations

import argparse
import difflib
import json
import re
import sys
from pathlib import Path

HISTORICAL_MARKERS = (
    'tel_download_video',
    'tel_download_audio',
    'tel_download_image',
    'contentRangeRegex',
    'REFRESH_DELAY',
    'hiddenButtons',
    'DOWNLOAD_ICON',
    'FORWARD_ICON',
    'button.btn-icon.hide',
    'createProgressBar',
    'showSaveFilePicker',
    '_next_offset',
)

GENERIC_LINES = {
    '{', '}', '});', '};', ');', '(', ')', 'else {', 'try {', 'catch {',
    'return false;', 'return true;', 'return null;', 'continue;',
}


def strip_block_comments(text: str) -> str:
    return re.sub(r'/\*[\s\S]*?\*/', '', text)


def normalized_lines(text: str) -> list[str]:
    text = strip_block_comments(text)
    result: list[str] = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith('//'):
            continue
        # Keep string contents intact; normalize only formatting whitespace.
        line = re.sub(r'\s+', ' ', line)
        line = line.replace("'", '"')
        if line in GENERIC_LINES:
            continue
        if len(line) < 10:
            continue
        result.append(line)
    return result


def exact_overlap(reference: list[str], candidate: list[str]) -> list[str]:
    candidate_set = set(candidate)
    return sorted({line for line in reference if line in candidate_set})


def longest_common_run(reference: list[str], candidate: list[str]) -> tuple[int, list[str]]:
    matcher = difflib.SequenceMatcher(a=reference, b=candidate, autojunk=False)
    block = max(matcher.get_matching_blocks(), key=lambda item: item.size)
    if block.size <= 0:
        return 0, []
    return block.size, reference[block.a:block.a + block.size]


def audit(reference_text: str, candidate_text: str) -> dict:
    ref_lines = normalized_lines(reference_text)
    cand_lines = normalized_lines(candidate_text)
    overlap = exact_overlap(ref_lines, cand_lines)
    run_len, run_lines = longest_common_run(ref_lines, cand_lines)
    markers = [marker for marker in HISTORICAL_MARKERS if marker in candidate_text]

    if markers or run_len >= 3:
        verdict = 'REVIEW'
    elif overlap:
        verdict = 'NOTICE'
    else:
        verdict = 'PASS'

    return {
        'reference_normalized_lines': len(ref_lines),
        'candidate_normalized_lines': len(cand_lines),
        'exact_normalized_line_overlap_count': len(overlap),
        'exact_normalized_line_overlap_sample': overlap[:20],
        'max_common_run_lines': run_len,
        'max_common_run_sample': run_lines[:20],
        'historical_markers_present': markers,
        'verdict': verdict,
        'note': 'Mechanical evidence only; manual architecture/expression review is still required.',
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('reference', type=Path)
    parser.add_argument('candidate', type=Path)
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args()

    reference_text = args.reference.read_text(encoding='utf-8')
    candidate_text = args.candidate.read_text(encoding='utf-8')
    result = audit(reference_text, candidate_text)

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"Verdict: {result['verdict']}")
        print(f"Historical markers: {result['historical_markers_present'] or 'none'}")
        print(f"Exact normalized overlap lines: {result['exact_normalized_line_overlap_count']}")
        print(f"Longest contiguous normalized run: {result['max_common_run_lines']}")
        if result['max_common_run_sample']:
            print('Longest run sample:')
            for line in result['max_common_run_sample']:
                print(f'  {line}')

    return 2 if result['verdict'] == 'REVIEW' else 0


if __name__ == '__main__':
    sys.exit(main())
