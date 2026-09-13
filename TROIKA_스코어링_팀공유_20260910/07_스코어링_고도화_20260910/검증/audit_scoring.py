"""Read-only audit of the 2026-09-09 scoring snapshot. Does not update source files."""
from pathlib import Path
import json
import hashlib
import numpy as np
import pandas as pd
from itertools import combinations

def tau_b(x, y):
    pairs = [(np.sign(x.iloc[i]-x.iloc[j]), np.sign(y.iloc[i]-y.iloc[j]))
             for i,j in combinations(range(len(x)),2)]
    denom = np.sqrt(sum(a != 0 for a,b in pairs)*sum(b != 0 for a,b in pairs))
    return sum(a*b for a,b in pairs)/denom if denom else float('nan')

ROOT = Path(__file__).resolve().parents[2] / '06_스코어링'
D = pd.read_csv(ROOT / 'out6_indicators.csv', dtype={'cd': str}).set_index('cd')
SAVED = pd.read_csv(ROOT / 'out6_scores.csv', dtype={'cd': str}).set_index('cd')
assert D.index.is_unique and SAVED.index.is_unique
assert set(D.index) == set(SAVED.index)
has = D['유동데이터'].map({True: True, False: False, 'True': True, 'False': False})
assert has.notna().all()
has = has.astype(bool)

def pr(x, inverse=False):
    r = x.rank(pct=True)
    return 1-r if inverse else r

def sub(x, inverse=False):
    r = pd.Series(.5, index=D.index)
    r.loc[has] = pr(x.loc[has], inverse)
    return r

v = .55*pr(D['매출레벨']) + .45*pr(D['유동레벨'])
a = .35*pr(D['무대거리'], True)+.25*pr(D['역거리'], True)+.2*pr(D['연결수'])+.2*pr(D['단절'], True)
s = .4*pr(D['간선이격'])+.25*pr(D['철도이격'])+.35*pr(D['유동야간비중'], True)
n = .3*sub(D['소비전환'], True)+.25*pr(D['매출변화'], True)+.2*pr(D['폐업률'])+.15*sub(D['유동변화']-D['매출변화'])+.1*(1-D['축제이력'])
f = pr(D['조직화'])
score = .2*np.sqrt(v)+.25*a+.15*s+.3*n+.1*f
error = float((score-SAVED['SCORE_공통']).abs().max())
assert error < 1e-12

def names(x, count=5):
    order = x.sort_values(ascending=False, kind='stable').index[:count]
    return D.loc[order, 'name'].tolist()

# Only the two N indicators imputed to .5 are perturbed. All other inputs frozen.
delta = (~has).astype(float) * .3*(.3+.15)*.5
low, high = score-delta, score+delta
ranges = []
for cd in D.index:
    others = D.index != cd
    best = 1 + int((low[others] > high.loc[cd]).sum())
    worst = 1 + int((high[others] >= low.loc[cd]).sum())
    ranges.append({'상권': D.loc[cd, 'name'], '기존순위': int(SAVED.loc[cd, 'R공통']),
                   'N결측': not bool(has.loc[cd]), '점수하한': round(low.loc[cd], 4),
                   '점수상한': round(high.loc[cd], 4), '최선순위': best, '최악순위': worst})

counts = {}; taus = []
for wn in (.2,.25,.3,.35,.4,.45):
    for wa in (.1,.15,.2,.25,.3,.35):
        rest = 1-wn-wa
        st = wn*n+wa*a+rest*(.45*np.sqrt(v)+.33*s+.22*f)
        taus.append(float(tau_b(score, st)))
        for name in names(st): counts[name] = counts.get(name,0)+1

team = pd.read_excel(ROOT / 'team_data.xlsx', sheet_name='상권_종합진단')
missing_team = D.loc[~D['name'].isin(team['상권명']), ['name']].to_dict('records')
result = {
    'input_sha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in
                      [ROOT/'out6_indicators.csv',ROOT/'out6_scores.csv',ROOT/'score_v2.py',ROOT/'score_v3.py']},
    'rows': len(D), 'flow_observed': int(has.sum()), 'shops_sum': int(D['점포'].sum()),
    'max_score_error': error, 'quota_sum': int(SAVED['쿼터'].sum()),
    'missing_team_names': missing_team,
    'stage_distances': D.loc[D['seed'].astype(bool), ['name','무대거리']].to_dict('records'),
    'top5': names(score), 'top5_without_S_renormalized': names((score-.15*s)/.85),
    'grid_counts': counts, 'grid_tau_min': min(taus), 'grid_tau_median': float(np.median(taus)),
    'N_missing_score_width': .3*(.3+.15),
    'N_only_rank_bounds': sorted(ranges, key=lambda r:r['기존순위']),
}
print(json.dumps(result, ensure_ascii=False, indent=2))
