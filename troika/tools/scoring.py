# -*- coding: utf-8 -*-
"""TROIKA 스탬프 배정 스코어링 — TROIKA-B10-14

소외도  M = sqrt(D * L) * R   에서 스탬프 배정을 산출한다.

    D  하락   지금 나빠지고 있는가   20대 소비강도 변화·점포 증감·폐업률·매출 변화
    L  저활력  지금도 약한가         점포당 매출의 역순위 (점포 수로 나누므로 규모 중립)
    R  도달   축제가 닿을 수 있는가  exp(-BETA * d),  d = 무대까지 최단거리

배정은 제약 하 최적화다.

    max  sum_i  M_i * sqrt(k_i)
    s.t. sum_i  k_i = 60
         KMIN <= k_i <= min(KMAX, floor(RHO_MAX * 점포_i))
         연계존 k_i = 0

sqrt 가 오목하고 목적함수가 분리가능하므로 한계효과가 큰 곳에 1개씩 주는
증분 배정이 전역 최적해다 (Fox 1966, Management Science 13(3), 210-216).
verify_alloc.py / verify2.py 에서 동적계획법 정확해와 대조해 확인했다.

근거 문서: 공유_상권구조/10_최종제출_20260913/B10-14_스탬프배정알고리즘재설계.md
"""
from pathlib import Path
import json
import math
import sys

HERE = Path(__file__).resolve().parent
if sys.version_info[:2] == (3, 12):
    sys.path.insert(0, str(HERE.parent / '.cache/python'))

import pandas as pd
import numpy as np

# ── 설계 상수 ────────────────────────────────────────────────────────────────
BETA    = 1.189   # /km  거리감쇠. 23개 상권 회귀 추정 (반감거리 583m, R2=0.533, t=-4.90)
TOTAL   = 60      # 총 스탬프 수 — 기존 기획과 동일. 예산 증액 없음
KMIN    = 2       # 형평 하한: 참여존에 든 이상 최소한의 참여 기회
KMAX    = 6       # 집중 상한: 한 상권 독식 방지
RHO_MAX = 0.20    # 운영 상한: 점포의 20%를 넘겨 모집하는 것은 사실상 전수 모집
PEAK_Q  = 20224   # D의 기준 분기 — 20대 매출이 정점이던 2022년 4분기
BASE_Q  = 20251   # 점포 증감의 기준 분기 (점포 CSV가 보유한 가장 이른 분기)

HERE = Path(__file__).resolve().parent


# ── 입력 ────────────────────────────────────────────────────────────────────
def load_stage_distance():
    """무대까지 최단거리(m). 지오메트리라 분기마다 바뀌지 않는다.
    영역-상권 shapefile에서 dist.py 로 산출한 값을 파일로 둔다."""
    return {k: float(v) for k, v in
            json.loads((HERE / 'stage_distance.json').read_text(encoding='utf-8'))['거리_m'].items()}


def load_sales_history(sales_df):
    """상권x분기 매출을 2021 1분기까지 잇는다.
    제공된 추정매출 CSV는 2025 1분기부터라 D의 기준 분기(2022 4Q)를 담지 못한다.
    그 이전 구간은 같은 원본을 상권x분기로 집계해 둔 작은 파일에서 읽는다."""
    cols = ['기준_년분기_코드', '상권_코드', '당월_매출_금액', '연령대_20_매출_금액']
    recent = sales_df.groupby(cols[:2])[cols[2:]].sum().reset_index()
    pre = pd.read_csv(HERE / 'sales_history_pre2025.csv')
    return pd.concat([pre[cols], recent[cols]], ignore_index=True)


# ── 지수 ────────────────────────────────────────────────────────────────────
def _pct_rank(s):
    """백분위 순위. 0~1. 결측은 중앙값으로 채운다.

    정규화를 min-max가 아니라 백분위 순위로 하는 것은 의도적이다.

    노트북 원안은 minmax_norm을 썼고, 그래서 점포 수 이상치 하나(청량리역
    1,106개)가 전체 눈금을 눌렀다. 실측하면 클리핑 없이 min-max를 쓸 경우
    나머지 22곳이 0~0.36 구간에 몰린다. 그래서 원안에는 방어 장치가 있었다.

        df['store_clipped'] = df['store_count'].clip(upper=500)   # 노트북 셀5

    백분위 순위는 "얼마나 큰가"가 아니라 "몇 번째인가"만 보므로 이 방어가
    필요 없다. 실제로 clip(500)을 걸든 안 걸든 순위가 완전히 같다.
    더해서 이 지수에는 점포 수 항 자체가 없다 — D는 변화율, L은 점포당 매출,
    R은 거리다. 점포 수는 배정 상한(RHO_MAX)에만 쓰이고 거기서도 KMAX가
    막는다. 즉 클리핑을 뺀 것이 아니라, 필요 없는 구조로 바꾼 것이다.
    검증: 재현코드/q1_clip.py
    """
    return s.fillna(s.median()).rank(pct=True)


def _pick(df, code, quarter, col):
    r = df[(df['상권_코드'] == code) & (df['기준_년분기_코드'] == quarter)]
    return float(r[col].iloc[0]) if len(r) else np.nan


def build_index(codes, store_df, sales_df, flow_df, quarter, stage_distance):
    """상권별 D / L / R / M 을 산출한다. codes 는 스탬프 대상(코어+참여)."""
    sales = load_sales_history(sales_df)
    flow = flow_df.groupby(['기준_년분기_코드', '상권_코드'])[
        ['연령대_20_유동인구_수']].sum().reset_index()
    store_q = store_df[store_df['기준_년분기_코드'] == quarter]
    store_b = store_df[store_df['기준_년분기_코드'] == BASE_Q]

    rows = []
    for c in codes:
        c = int(c)
        n_now = store_q[store_q['상권_코드'] == c]['전체_점포_수'].sum()
        n_base = store_b[store_b['상권_코드'] == c]['전체_점포_수'].sum()
        closed = store_q[store_q['상권_코드'] == c]['폐업_점포_수'].sum()

        a0 = _pick(sales, c, PEAK_Q, '연령대_20_매출_금액')
        a1 = _pick(sales, c, quarter, '연령대_20_매출_금액')
        t0 = _pick(sales, c, PEAK_Q, '당월_매출_금액')
        t1 = _pick(sales, c, quarter, '당월_매출_금액')
        f0 = _pick(flow, c, PEAK_Q, '연령대_20_유동인구_수')
        f1 = _pick(flow, c, quarter, '연령대_20_유동인구_수')

        # 매출이 집계 하한에 걸려 비는 분기는 직전 유효 분기로 대체한다 (이경시장)
        t_now = t1
        sales_quarter = quarter
        if not np.isfinite(t_now):
            for q in sorted(sales['기준_년분기_코드'].unique(), reverse=True):
                if q >= quarter:
                    continue
                v = _pick(sales, c, q, '당월_매출_금액')
                if np.isfinite(v):
                    t_now = v
                    sales_quarter = int(q)
                    break

        ok = all(np.isfinite(x) and x for x in (a0, f0, f1)) and np.isfinite(a1)
        rows.append(dict(
            code=str(c),
            store=int(n_now),
            # D 구성 4지표 — 전부 "클수록 나쁘다" 방향으로 맞춘다
            d1_20대소비강도하락=-((a1 / f1) / (a0 / f0) - 1) if ok else np.nan,
            d2_점포순감=-(n_now / n_base - 1) if n_base else np.nan,
            d3_폐업률=closed / n_now * 100 if n_now else np.nan,
            d4_전체매출하락=-(t1 / t0 - 1) if np.isfinite(t1) and t0 else np.nan,
            # L 재료 — 점포당 매출
            per_store=t_now / n_now if n_now and np.isfinite(t_now) else np.nan,
            per_store_quarter=sales_quarter if np.isfinite(t_now) else None,
            d_stage=stage_distance[str(c)],
        ))

    df = pd.DataFrame(rows)

    # D — 4지표 백분위 평균 후 "다시" 백분위화.
    # 백분위 4개를 평균하면 분산이 눌려(표준편차 0.30 -> 0.17) D의 기여도가
    # 자동으로 줄어든다. 재백분위화로 L과 대등한 폭을 회복시킨다. (B10-06 진단)
    parts = ['d1_20대소비강도하락', 'd2_점포순감', 'd3_폐업률', 'd4_전체매출하락']
    df['D'] = _pct_rank(df[parts].apply(_pct_rank).mean(axis=1))

    # L — 점포당 매출이 낮을수록 높다. 점포 수로 나누므로 상권 크기와 무관하다.
    df['L'] = _pct_rank(-df['per_store'])

    # R — 무대에서 멀수록 축제 효과가 덜 닿는다.
    df['R'] = np.exp(-BETA * df['d_stage'] / 1000.0)

    # M — D와 L은 기하평균(둘 다 성립해야 소외), R은 곱(닿아야 효과가 난다)
    df['M'] = np.sqrt(df['D'] * df['L']) * df['R']
    return df


# ── 배정 ────────────────────────────────────────────────────────────────────
def allocate(M, store, total=TOTAL, kmin=KMIN, kmax=KMAX, rho_max=RHO_MAX):
    """한계효과 증분 배정. 오목·분리가능 목적함수에서 전역 최적 (Fox 1966)."""
    M = np.asarray(M, dtype=float)
    store = np.asarray(store, dtype=float)
    if M.ndim != 1 or store.shape != M.shape or not len(M):
        raise ValueError('지수와 점포 수는 같은 길이의 비어 있지 않은 배열이어야 합니다')
    if not np.isfinite(M).all() or (M < 0).any() or not np.isfinite(store).all() or (store < 0).any():
        raise ValueError('지수와 점포 수는 유한한 음이 아닌 값이어야 합니다')
    if total != int(total) or kmin != int(kmin) or kmax != int(kmax) or kmin < 0 or kmax < kmin or not 0 < rho_max <= 1:
        raise ValueError('총량·하한·상한은 정수이며 유효한 배정 제약이어야 합니다')
    total, kmin, kmax = int(total), int(kmin), int(kmax)
    cap = np.minimum(kmax, np.floor(rho_max * store)).astype(int)
    if (cap < kmin).any():
        raise ValueError('점포 수 기준 상한이 최소 배정량보다 작습니다. 운영 제약을 재검토하세요')

    remaining = total - kmin * len(M)
    if remaining < 0:
        raise ValueError(f'하한 {kmin} x {len(M)}곳이 총량 {total}을 넘습니다')
    if remaining > (cap - kmin).sum():
        raise ValueError('상한 합이 총량에 못 미칩니다')

    k = np.full(len(M), kmin)
    for _ in range(remaining):
        gain = np.where(k < cap, M * (np.sqrt(k + 1) - np.sqrt(k)), -np.inf)
        k[int(np.argmax(gain))] += 1

    assert k.sum() == total and (k >= kmin).all() and (k <= cap).all()
    return k


# ── 진입점 ──────────────────────────────────────────────────────────────────
def compute(places, store_df, sales_df, flow_df, quarter):
    """places: [{id, zone, ...}] → {상권코드: {D, L, R, M, quota}}

    연계존은 교통 연계 전용이라 스탬프를 두지 않는다(B9-00 5절). 따라서
    스코어링 대상은 코어존 + 참여존이다.
    """
    stage = load_stage_distance()
    target = [p['id'] for p in places if p['zone'] in ('코어', '참여')]
    df = build_index(target, store_df, sales_df, flow_df, quarter, stage)
    df['quota'] = allocate(df['M'].values, df['store'].values)

    out = {}
    for _, r in df.iterrows():
        out[r['code']] = dict(
            D=round(float(r['D']), 4), L=round(float(r['L']), 4),
            R=round(float(r['R']), 4), M=round(float(r['M']), 4),
            perStore=None if not np.isfinite(r['per_store']) else round(float(r['per_store'])),
            perStoreQuarter=None if pd.isna(r['per_store_quarter']) else int(r['per_store_quarter']),
            stageDistance=round(float(r['d_stage']), 1),
            quota=int(r['quota']),
        )
    for p in places:
        out.setdefault(p['id'], dict(D=None, L=None, R=None, M=None, perStore=None,
                                     perStoreQuarter=None,
                                     stageDistance=round(stage[p['id']], 1), quota=0))
    return out


META = dict(
    doc='TROIKA-B10-14',
    index='M = sqrt(D*L)*R',
    objective='max sum(M_i*sqrt(k_i))',
    constraints=f'sum k={TOTAL}, {KMIN}<=k<=min({KMAX}, {RHO_MAX}*store)',
    beta=BETA, halfDistance=round(math.log(2) / BETA * 1000),
    peakQuarter=PEAK_Q, linkZoneStamps=0,
    note='연계존은 교통 연계 전용 — 스탬프·부스 없음',
)

if __name__ == '__main__':
    import sys
    root = HERE.parent
    frames = {}
    for p in sorted(root.glob('*.csv')):
        if '(' not in p.stem:
            continue
        key = p.stem.split('(')[1].rstrip(')')
        if key in {'점포-상권', '추정매출-상권', '길단위인구-상권'}:
            frames[key] = pd.read_csv(p, encoding='cp949', low_memory=False)
    data = json.loads((root / 'data.js').read_text(encoding='utf-8')
                      .split('const data=', 1)[1].rsplit(';if(typeof module', 1)[0])
    res = compute(data['places'], frames['점포-상권'], frames['추정매출-상권'],
                  frames['길단위인구-상권'], data['quarter'])
    name = {p['id']: p['name'] for p in data['places']}
    print(f"{'상권':<18}{'D':>7}{'L':>7}{'R':>7}{'M':>8}{'스탬프':>7}")
    for cid, v in sorted(res.items(), key=lambda x: -(x[1]['M'] or 0)):
        if v['M'] is None:
            continue
        print(f"{name[cid][:16]:<18}{v['D']:>7.3f}{v['L']:>7.3f}{v['R']:>7.3f}{v['M']:>8.3f}{v['quota']:>7}")
    print(f"\n합계 {sum(v['quota'] for v in res.values())}개")
