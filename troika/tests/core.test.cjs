const test=require('node:test'),assert=require('node:assert/strict'),D=require('../data.js'),C=require('../core.js');
test('23 official areas and latest source aggregate',()=>{assert.equal(D.quarter,20262);assert.equal(D.places.length,23);assert.equal(new Set(D.places.map(p=>p.id)).size,23);assert.equal(D.places.reduce((n,p)=>n+p.storeCount,0),4402);for(const p of D.places){assert.ok(p.storeCount>=p.sectors.reduce((n,s)=>n+s.count,0));assert.ok(p.lat>37.5&&p.lat<37.7&&p.lng>127&&p.lng<127.2);assert.ok(Math.abs(p.timeFlow.reduce((n,v,i)=>n+C.share(p,i),0)-1)<1e-10);}});
test('only festival source data ships; unrelated metrics removed',()=>{assert.equal(D.places.find(p=>p.id==='3110206').name,'텃골근린공원');for(const p of D.places)for(const key of ['sales','salesSectorCount','salesYoY','flowYoY','flow','residents','apartments','facilities','consumption','change','baseScore'])assert.equal(Object.hasOwn(p,key),false,key);assert.deepEqual(D.sources.map(s=>s.file).sort(),['서울시 상권분석서비스(길단위인구-상권).csv','서울시 상권분석서비스(영역-상권).csv','서울시 상권분석서비스(점포-상권).csv','서울시 상권분석서비스(추정매출-상권).csv'].sort());});
test('all preferences bounded deterministic and region consistent',()=>{for(const region of ['all',...Object.keys(D.regions)])for(const purpose of Object.keys(D.purposes))for(const walk of ['low','medium','high']){const s={region,purpose,walk,step:0},a=C.rank(D.places,s);assert.ok(a.length);assert.ok(a.every(r=>(region==='all'||r.place.region===region)&&Number.isFinite(r.score)&&r.score>=0&&r.score<=100));assert.deepEqual(a,C.rank(D.places,{...s,step:5}));}});
test('saved list rejects stale demo IDs and duplicates, caps three',()=>{const ids=D.places.map(p=>p.id);assert.deepEqual(C.normalizeStamps([ids[0],ids[0],'fake',...ids.slice(1,5)],ids),ids.slice(0,3));assert.deepEqual(C.addStamp([ids[0]],ids[0],ids),[ids[0]]);assert.equal(C.readStamps(null,'x',ids).available,false);assert.deepEqual(C.readStamps({getItem:()=>'{broken'},'x',ids).stamps,[]);});
test('notebook planning covers each area once without claiming partners',()=>{assert.equal(D.places.reduce((n,p)=>n+p.plannedQuota,0),60);assert.equal(new Set(D.courses.flatMap(c=>c.placeIds)).size,23);assert.equal(D.courses.flatMap(c=>c.placeIds).length,23);assert.equal(D.sources.length,4);});
test('virtual congestion changes by slot and remains separate from real statistics',()=>{for(const p of D.places){const original=JSON.stringify(p);const a=C.simulation(p,0),b=C.simulation(p,4);assert.ok(a.value<b.value);assert.deepEqual(a,C.simulation(p,0));for(let i=0;i<6;i++){const v=C.simulation(p,i);assert.ok(v.value>=0&&v.value<=100);assert.ok(['여유','붐빔','혼잡'].includes(v.label));}assert.equal(JSON.stringify(p),original);}});
test('detailed quiz interests change recommendations and concepts cite counted sectors',()=>{const s={...C.defaults,purpose:'cafe'};const a=C.rank(D.places,{...s,interest:'cafe'}).map(r=>r.place.id);const b=C.rank(D.places,{...s,interest:'market'}).map(r=>r.place.id);assert.notDeepEqual(a,b);for(const p of D.places){const tags=C.concepts(p);assert.equal(tags.cafe.count,p.cafeCount);for(const t of C.matchingConcept(p,{interest:'bakery'}))assert.ok(t.value>0);for(const interest of Object.keys(C.conceptLabels))for(const companion of ['solo','friends','pair','family','any'])for(const style of ['focused','variety','balanced']){const score=C.score(p,{...s,interest,companion,style});assert.ok(Number.isFinite(score)&&score>=0&&score<=100);}}});

// ── TROIKA-B10-14 스탬프 배정 검증 ─────────────────────────────────────────
test('stamp quota follows the marginalization allocation, not store count',()=>{
  const P=D.places, byId=Object.fromEntries(P.map(p=>[p.id,p]));
  assert.equal(P.reduce((n,p)=>n+p.plannedQuota,0),60);                       // 총량 60 유지
  for(const p of P){
    if(p.zone==='연계'){ assert.equal(p.plannedQuota,0,`${p.name} 연계존은 스탬프 없음`); continue; }
    assert.ok(p.plannedQuota>=2,`${p.name} 하한 2`);                          // 형평 하한
    assert.ok(p.plannedQuota<=6,`${p.name} 상한 6`);                          // 집중 상한
    assert.ok(p.plannedQuota<=Math.floor(0.20*p.storeCount),
              `${p.name} 가맹률 20% 상한`);                                    // 운영 상한
  }
  const zone=z=>P.filter(p=>p.zone===z).reduce((n,p)=>n+p.plannedQuota,0);
  assert.equal(zone('코어'),36); assert.equal(zone('참여'),24); assert.equal(zone('연계'),0);
  // 스탬프가 장사 잘 되는 곳으로 가지 않는다: 점포 수와 음의 상관
  const part=P.filter(p=>p.zone!=='연계');
  const cor=(a,b)=>{const m=x=>x.reduce((s,v)=>s+v,0)/x.length,ma=m(a),mb=m(b);
    return a.reduce((s,v,i)=>s+(v-ma)*(b[i]-mb),0)/
      Math.sqrt(a.reduce((s,v)=>s+(v-ma)**2,0)*b.reduce((s,v)=>s+(v-mb)**2,0));};
  assert.ok(cor(part.map(p=>p.storeCount),part.map(p=>p.plannedQuota))<0,'점포 수와 음의 상관');
  assert.equal(D.stampPolicy.doc,'TROIKA-B10-14');
  assert.equal(D.stampPolicy.linkZoneStamps,0);
});

// ── TROIKA-B10-12 7.1 시간대 표시 ──────────────────────────────────────────
test('time-of-day display is normalised per hour',()=>{
  assert.deepEqual(C.slotHours,[6,5,3,3,4,3]);
  for(const p of D.places){
    const sum=[0,1,2,3,4,5].reduce((n,i)=>n+C.sharePerHour(p,i),0);
    assert.ok(Math.abs(sum-1)<1e-10,`${p.name} 시간당 비중 합 1`);
  }
  // 구간 길이가 같다면 두 지표가 같고, 다르므로 실제로 달라야 한다
  const p=D.places[0];
  assert.notEqual(C.share(p,0).toFixed(6),C.sharePerHour(p,0).toFixed(6));
  assert.ok(C.sharePerHour(p,0)<C.share(p,0),'00–06시는 6시간 구간이라 환산 시 낮아진다');
});

// ── TROIKA-B10-12 4.1~4.2 연계존 명단 교정 ────────────────────────────────
test('link zone membership follows the triangle buffer rule',()=>{
  const ids=new Set(D.places.map(p=>p.id));
  for(const bad of ['3110201','3110202']) assert.ok(!ids.has(bad),`규칙 위반 상권 ${bad} 제외`);
  for(const good of ['3110203','3110200']) assert.ok(ids.has(good),`누락 상권 ${good} 편입`);
  assert.equal(D.places.length,23);
});

// ── TROIKA-B10-14 소외도 지수가 배정을 만들어내는지 ─────────────────────────
// data.js에 실린 D·L·R에서 배정을 다시 계산해 plannedQuota와 대조한다.
// 누가 배정 숫자를 손으로 고치면 여기서 깨진다.
test('quota is reproducible from the shipped index, not hand-written',()=>{
  const P=D.places, pol=D.stampPolicy;
  const [KMIN,KMAX,RHO,TOTAL]=[2,6,0.20,60];
  for(const p of P){
    const m=p.marginalization;
    assert.ok(m,`${p.name} marginalization 필드`);
    if(p.zone==='연계'){ assert.equal(m.M,null); assert.equal(p.plannedQuota,0); continue; }
    for(const k of ['D','L','R','M']) assert.ok(m[k]>=0&&m[k]<=1,`${p.name} ${k} 범위`);
    // M = sqrt(D*L)*R 이 실제로 성립하는가
    assert.ok(Math.abs(Math.sqrt(m.D*m.L)*m.R-m.M)<5e-4,`${p.name} M 산식`);
    // R = exp(-beta*d) 가 실제로 성립하는가
    assert.ok(Math.abs(Math.exp(-pol.beta*m.stageDistance/1000)-m.R)<5e-4,`${p.name} R 산식`);
  }
  // 한계효과 증분 배정을 다시 돌린다
  const T=P.filter(p=>p.zone!=='연계');
  const M=T.map(p=>p.marginalization.M);
  const cap=T.map(p=>Math.max(KMIN,Math.min(KMAX,Math.floor(RHO*p.storeCount))));
  const k=T.map(()=>KMIN);
  for(let n=TOTAL-KMIN*T.length;n>0;n--){
    let best=-1,bv=-Infinity;
    for(let i=0;i<T.length;i++){ if(k[i]>=cap[i]) continue;
      const g=M[i]*(Math.sqrt(k[i]+1)-Math.sqrt(k[i])); if(g>bv){bv=g;best=i;} }
    k[best]++;
  }
  T.forEach((p,i)=>assert.equal(p.plannedQuota,k[i],`${p.name} 배정 재현`));
  assert.equal(k.reduce((a,b)=>a+b,0),TOTAL);
  // 정책 메타
  assert.equal(pol.doc,'TROIKA-B10-14');
  assert.equal(pol.index,'M = sqrt(D*L)*R');
  assert.equal(pol.linkZoneStamps,0);
  assert.ok(Math.abs(pol.halfDistance-583)<2,'반감거리 583m');
});

// 원자료 매출은 여전히 화면에 싣지 않는다 — 지수만 싣는다
test('raw sales figures stay out; only the derived index ships',()=>{
  for(const p of D.places){
    for(const key of ['sales','salesYoY','flowYoY','baseScore','consumption'])
      assert.equal(Object.hasOwn(p,key),false,key);
    assert.equal(Object.hasOwn(p.marginalization,'salesAmount'),false);
  }
});
