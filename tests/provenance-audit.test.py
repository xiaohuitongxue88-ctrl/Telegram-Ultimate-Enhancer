import json
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOL = ROOT / 'tools' / 'provenance-audit.py'


class ProvenanceAuditTests(unittest.TestCase):
    def run_audit(self, reference_text, candidate_text):
        with tempfile.TemporaryDirectory() as td:
            td = Path(td)
            ref = td / 'reference.js'
            cand = td / 'candidate.js'
            ref.write_text(reference_text, encoding='utf-8')
            cand.write_text(candidate_text, encoding='utf-8')
            result = subprocess.run(
                ['python', str(TOOL), str(ref), str(cand), '--json'],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=False,
            )
            return result, json.loads(result.stdout) if result.stdout.strip() else None

    def test_detects_historical_markers_and_common_run(self):
        reference = '''
const REFRESH_DELAY = 500;
const hiddenButtons = mediaButtons.querySelectorAll("button.btn-icon.hide");
for (const btn of hiddenButtons) {
  btn.classList.remove("hide");
}
'''
        candidate = '''
const REFRESH_DELAY = 500;
const hiddenButtons = mediaButtons.querySelectorAll("button.btn-icon.hide");
for (const btn of hiddenButtons) {
  btn.classList.remove("hide");
}
'''
        result, data = self.run_audit(reference, candidate)
        self.assertEqual(result.returncode, 2)
        self.assertIn('REFRESH_DELAY', data['historical_markers_present'])
        self.assertGreaterEqual(data['max_common_run_lines'], 3)
        self.assertEqual(data['verdict'], 'REVIEW')

    def test_clean_candidate_is_pass_eligible(self):
        reference = 'const REFRESH_DELAY = 500;\nconst hiddenButtons = [];\n'
        candidate = '''
const EvidenceGate = {
  allows(classification) {
    return classification.direct.length > 0 || classification.strong.length >= 2;
  }
};
'''
        result, data = self.run_audit(reference, candidate)
        self.assertEqual(result.returncode, 0)
        self.assertEqual(data['historical_markers_present'], [])
        self.assertLess(data['max_common_run_lines'], 3)
        self.assertIn(data['verdict'], ['PASS', 'NOTICE'])


if __name__ == '__main__':
    unittest.main()
