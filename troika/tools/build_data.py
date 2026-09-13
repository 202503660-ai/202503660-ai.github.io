from pathlib import Path
import ast,json,hashlib,sys,math
ROOT=Path(__file__).resolve().parents[1]
# The shipped cache contains CPython 3.12 wheels. Do not load them into 3.13.
if sys.version_info[:2] == (3, 12):
 sys.path.insert(0,str(ROOT/'.cache/python'))
import pandas as pd
from pyproj import Transformer
sys.path.insert(0,str(Path(__file__).resolve().parent))
import scoring   # 소외도 산출 + 스탬프 배정 — TROIKA-B10-14
# ── 연계존 명단 교정 (TROIKA-B10-12 4.1~4.2) ─────────────────────────
# 삼각형 +800m / 면적 50% 규칙을 재현한 결과 노트북 RAW와 4곳이 어긋났다.
ZONE_DROP = {
    '3110201': '전농119안전센터 — 삼각형에서 950m (800m 밖)',
    '3110202': '전농1동주민센터 — 800m 버퍼에 면적 27%만 (50% 규칙 미달)',
}
ZONE_ADD = {
    '3110203': '떡전교사거리 — 삼각형에서 130m, 800m 버퍼 100%',
    '3110200': '동대문경찰서 — 삼각형에서 538m, 800m 버퍼 100%',
}
# 노트북 원본은 보존하고 아래에서 명단을 실제로 교정한다.
# ─────────────────────────────────────────────────────────────────────

frames={}; sources=[]
USED_SOURCES={'영역-상권','점포-상권','길단위인구-상권','추정매출-상권'}
for p in sorted(ROOT.glob('*.csv')):
 if '(' not in p.stem: continue
 key=p.stem.split('(')[1].rstrip(')')
 if key not in USED_SOURCES: continue
 f=pd.read_csv(p,encoding='cp949',low_memory=False); frames[key]=f
 keys=[k for k in ['기준_년분기_코드','상권_코드','서비스_업종_코드'] if k in f]
 assert not f.duplicated(keys).any(), f'Duplicate keys: {p.name}'
 sources.append(dict(file=p.name,rows=len(f),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),latest=int(f['기준_년분기_코드'].max()) if '기준_년분기_코드' in f else None))
n=json.loads((ROOT/'troika_stamp_analysis.ipynb').read_text(encoding='utf-8')); raw=None; mapping=None
for cell in n['cells']:
 try: tree=ast.parse(''.join(cell['source']))
 except SyntaxError: continue
 for a in tree.body:
  if not isinstance(a,ast.Assign): continue
  names=[t.id for t in a.targets if isinstance(t,ast.Name)]
  if 'RAW' in names: raw=[{kw.arg:ast.literal_eval(kw.value) for kw in el.keywords} for el in a.value.elts]
  if 'OFFICIAL_MAP' in names: mapping=ast.literal_eval(a.value)
assert raw and mapping
raw=[r for r in raw if str(mapping[r['name']][0]) not in ZONE_DROP]
for code in ZONE_ADD:
 area=frames['영역-상권'].set_index('상권_코드').loc[int(code)]
 name=area['상권_코드_명']
 raw.append(dict(name=name,region='전농권',zone='연계'))
 # build_data uses only tuple fields 0 (code), 5 (theme), 6 (course).
 mapping[name]=(int(code),None,None,None,None,'청량리 방면 연계','연계 · 교통 거점')
assert len(raw)==23 and len({mapping[r['name']][0] for r in raw})==23
assert set(frames)==USED_SOURCES, 'Missing required source CSV'
quarter=min(s['latest'] for s in sources if s['latest'])
codes=[mapping[r['name']][0] for r in raw]
def rows(key,q=quarter):
 f=frames[key]; return f[(f['상권_코드'].isin(codes)) & (f['기준_년분기_코드']==q)]
def val(row,k):
 v=row.get(k); return None if pd.isna(v) else float(v)
def one(key,code):
 f=rows(key); r=f[f['상권_코드']==code]; return r.iloc[0] if len(r) else {}
# ── 소외도 산출 (tools/scoring.py) ─────────────────────────────────────────
# 배정 규칙을 코드에 박지 않는다. 매 분기 자료에서 D·L·R을 다시 계산하고
# 제약 하 최적화로 스탬프를 나눈다. 산식·근거는 scoring.py 상단 참조.
_zones=[dict(id=str(mapping[r['name']][0]), zone=r['zone']) for r in raw]
SCORES=scoring.compute(_zones, frames['점포-상권'], frames['추정매출-상권'],
                       frames['길단위인구-상권'], quarter)
assert sum(v['quota'] for v in SCORES.values())==scoring.TOTAL

tr=Transformer.from_crs(5181,4326,always_xy=True)
regionkeys={'회기권':'hoegi','이문권':'imun','전농권':'jeonnong'}
places=[]
for r in raw:
 m=mapping[r['name']]; code=m[0]; area=frames['영역-상권'].set_index('상권_코드').loc[code]
 shops=rows('점포-상권'); shops=shops[shops['상권_코드']==code]
 flow=one('길단위인구-상권',code)
 lng,lat=tr.transform(area['엑스좌표_값'],area['와이좌표_값'])
 sectors=[dict(code=str(s['서비스_업종_코드']),name=s['서비스_업종_코드_명'],count=int(s['전체_점포_수'])) for _,s in shops.iterrows()]
 quota=SCORES[str(code)]['quota']
 p=dict(id=str(code),name=area['상권_코드_명'],alias=r['name'],region=regionkeys[r['region']],zone=r['zone'],theme=m[5],course=m[6],plannedQuota=quota,dong=area['행정동_코드_명'],type=area['상권_구분_코드_명'],area=int(area['영역_면적']),lat=lat,lng=lng,x=int(area['엑스좌표_값']),y=int(area['와이좌표_값']),storeCount=sum(s['count'] for s in sectors),sectors=sorted([s for s in sectors if s['code'].startswith('CS100') or any(term in s['name'] for term in ['슈퍼마켓','편의점','미곡','육류','수산물','청과','반찬','의류','신발','가방','서적','문구','화초','화장품','완구','공예','기념품'])],key=lambda s:-s['count']),timeFlow=[val(flow,f'시간대_{slot}_유동인구_수') for slot in ['00_06','06_11','11_14','14_17','17_21','21_24']])
 s=SCORES[str(code)]
 p['marginalization']=dict(D=s['D'],L=s['L'],R=s['R'],M=s['M'],
                           perStore=s['perStore'],perStoreQuarter=s['perStoreQuarter'],stageDistance=s['stageDistance'])
 p['foodCount']=sum(s['count'] for s in sectors if s['code'].startswith('CS100') and s['code']!='CS100010'); p['cafeCount']=sum(s['count'] for s in sectors if s['code']=='CS100010')
 places.append(p)
anchors={'hoegi':'3120064','imun':'3110220','jeonnong':'3110210'}
for p in places:
 a=next(x for x in places if x['id']==anchors[p['region']]); p['distance']=round(math.hypot(p['x']-a['x'],p['y']-a['y'])/1000,3)
regions={'hoegi':dict(name='회기권',university='경희대'),'imun':dict(name='이문권',university='한국외대'),'jeonnong':dict(name='전농권',university='서울시립대')}
courses=[dict(id=k,region=k,name=next(p['course'] for p in places if p['region']==k),placeIds=[p['id'] for p in places if p['region']==k],purpose={'hoegi':'music','imun':'food','jeonnong':'local'}[k],walk='medium') for k in regions]
d=dict(quarter=quarter,regions=regions,purposes=dict(music='문화·교류',food='미식탐방',cafe='카페',local='로컬마켓'),places=places,courses=courses,sources=sources,stampPolicy=scoring.META,notebookSha256=hashlib.sha256((ROOT/'troika_stamp_analysis.ipynb').read_bytes()).hexdigest())
(ROOT/'data.js').write_text('(function(root){const data='+json.dumps(d,ensure_ascii=False,allow_nan=False,separators=(',',':'))+';if(typeof module!=="undefined"&&module.exports)module.exports=data;else root.TroikaData=data;})(globalThis);\n',encoding='utf-8')
print(json.dumps(dict(quarter=quarter,areas=len(places),shops=sum(p['storeCount'] for p in places),quota=sum(p['plannedQuota'] for p in places),sources=len(sources)),ensure_ascii=False))
