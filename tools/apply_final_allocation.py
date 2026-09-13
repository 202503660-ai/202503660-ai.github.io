"""B10-14 published table snapshot; not full precision recomputation."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
# code, D, L, R, M, previous, final, sales per shop (10,000 KRW)
ROWS = [
('3110207',1,.688,.807,.669,3,6,929),('3130103',.906,1,.661,.629,3,3,105),
('3110215',.906,.750,.713,.588,2,6,810),('3130098',.750,.562,.812,.527,3,6,1650),
('3110208',.625,.812,.716,.510,2,6,541),('3110211',.562,.625,.756,.448,4,6,1492),
('3110205',.281,.500,.937,.351,3,4,1935),('3110210',.281,.438,.970,.340,4,4,2265),
('3120065',.500,.375,.695,.301,3,3,2440),('3110213',.125,.875,.820,.271,2,3,357),
('3110214',.406,.250,.827,.264,3,3,3292),('3110219',.688,.188,.732,.263,4,2,3446),
('3110222',.188,.938,.609,.255,3,2,114),('3120064',.812,.062,.958,.216,4,2,4585),
('3110220',.406,.125,.925,.208,4,2,3584),('3110224',.062,.312,.869,.121,3,2,2735)]
def apply_allocation(data):
    lookup={r[0]:r for r in ROWS}
    assert {p['id'] for p in data['places'] if p['zone']!='연계'}==set(lookup)
    for p in data['places']:
        if p['id'] in lookup:
            _,d,l,r,m,old,quota,sales=lookup[p['id']]
            p['plannedQuota']=quota
            p['allocation']=dict(D=d,L=l,R=r,M=m,previousQuota=old,cap=min(6,int(p['storeCount']*.2)),salesPerStoreManwon=sales,salesQuarter=20261 if p['id']=='3130103' else 20262,imputed=p['id']=='3130103')
        else:
            p['plannedQuota']=0
            p['allocation']=None
    data['allocationPolicy']=dict(version='B10-14-20260913-published',quarter=20262,formula='M = √(D × L) × R',betaPerKm=1.189,total=60,source='B10-14 - 스탬프 배정 알고리즘 재설계.pdf, 7–8쪽',precision=3,mode='published-snapshot',note='PDF의 반올림된 최종 분석 결과. 거리 원자료를 이용한 재계산이 아닙니다.')
    return data
if __name__=='__main__':
    p=ROOT/'data.js';s=p.read_text(encoding='utf-8')
    d=json.loads(s.split('const data=',1)[1].split(';if(typeof module',1)[0]);apply_allocation(d)
    p.write_text('(function(root){const data='+json.dumps(d,ensure_ascii=False,allow_nan=False,separators=(',',':'))+';if(typeof module!=="undefined"&&module.exports)module.exports=data;else root.TroikaData=data;})(globalThis);\n',encoding='utf-8')
