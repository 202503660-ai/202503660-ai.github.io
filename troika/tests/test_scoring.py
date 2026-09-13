"""Independent checks of the allocation optimizer and infeasible inputs."""
from pathlib import Path
import itertools
import json
import math
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
import scoring


class AllocationTests(unittest.TestCase):
    def test_matches_exhaustive_optimum_on_small_problem(self):
        weights, stores = [0.1, 0.4, 0.8], [30, 30, 30]
        result = scoring.allocate(weights, stores, total=10)
        candidates = [k for k in itertools.product(range(2, 7), repeat=3) if sum(k) == 10]
        objective = lambda k: sum(w * math.sqrt(n) for w, n in zip(weights, k))
        self.assertAlmostEqual(objective(result), max(map(objective, candidates)), places=12)

    def test_shipped_allocation_matches_independent_dynamic_program(self):
        text = (Path(__file__).resolve().parents[1] / 'data.js').read_text(encoding='utf-8')
        data = json.loads(text.split('const data=', 1)[1].rsplit(';if(typeof module', 1)[0])
        targets = [p for p in data['places'] if p['zone'] != '연계']
        dp = {0: (0.0, [])}
        for p in targets:
            cap = min(6, math.floor(0.2 * p['storeCount']))
            weight = p['marginalization']['M']
            nxt = {}
            for used, (value, plan) in dp.items():
                for count in range(2, cap + 1):
                    total = used + count
                    if total > 60:
                        continue
                    score = value + weight * math.sqrt(count)
                    if total not in nxt or score > nxt[total][0]:
                        nxt[total] = score, plan + [count]
            dp = nxt
        actual = sum(p['marginalization']['M'] * math.sqrt(p['plannedQuota']) for p in targets)
        self.assertAlmostEqual(actual, dp[60][0], places=12)
        self.assertEqual([p['plannedQuota'] for p in targets], dp[60][1])

    def test_rejects_conflicting_minimum_and_store_cap(self):
        with self.assertRaises(ValueError):
            scoring.allocate([0.5, 0.5], [5, 50], total=4)

    def test_rejects_unavailable_budget_and_invalid_scores(self):
        for weights, stores, total in [([0.5], [30], 7), ([0.5], [30], 1),
                                       ([float('nan')], [30], 2), ([-1], [30], 2),
                                       ([0.5], [30], 2.5)]:
            with self.subTest(weights=weights, total=total):
                with self.assertRaises(ValueError):
                    scoring.allocate(weights, stores, total=total)


if __name__ == '__main__':
    unittest.main()
