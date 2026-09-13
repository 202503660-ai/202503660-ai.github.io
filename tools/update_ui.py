from pathlib import Path
p=Path('app.js');s=p.read_text(encoding='utf-8-sig')
start=s.index('  function statusMarkup');end=s.index('  function syncControls',start)
s=s[:start]+'''  const fmt = n => n == null ? '자료 없음' : Number(n).toLocaleString('ko-KR');
  const pct = n => n == null ? '자료 없음' : `${(n*100).toFixed(1)}%`;
  const shareText = p => `${C.timeLabel(state.step)} 비중 ${pct(C.share(p,state.step))}`;
  function card({place:p},index) {
    const purpose=state.purpose, symbol={music:'music',food:'food',cafe:'coffee',local:'bag'}[purpose];
    return `<article class="place-card"><div class="card-art art-${purpose}" aria-hidden="true">${icon(symbol)}<span class="art-label">TROIKA / ${String(index+1).padStart(2,'0')}</span></div><div class="card-body"><div class="card-meta"><span class="region-label">${regionText(p)}</span><span class="status calm">${escape(p.type)}</span></div><h3>${escape(p.name)}</h3><p class="recommendation-reason">${purpose==='cafe'?`커피·음료 점포 ${fmt(p.cafeCount)}곳`:purpose==='food'?`음식점·주점 등 ${fmt(p.foodCount)}곳`:purpose==='local'?`${escape(p.type)}의 업종을 둘러보세요`:`기획 테마 · ${escape(p.theme)}`}<br>권역 기준 상권에서 직선 ${p.distance.toFixed(2)}km</p><div class="card-bottom"><p class="walking-meta">집계 점포 ${fmt(p.storeCount)}곳 · 2026년 2분기</p><p class="card-benefit">${shareText(p)}</p><button class="button outline" id="detail-${p.id}" data-detail="${p.id}">자세히 보기 ${icon('arrow')}</button></div></div></article>`;
  }
  function renderRecommendations(){const ranked=C.rank(D.places,state);$('recommendationsContainer').innerHTML=ranked.slice(0,3).map(card).join('');$('resultCount').textContent=`${ranked.length}개 상권 중 추천`;$('selectionSummary').textContent=`${state.region==='all'?'전체 권역':D.regions[state.region].name} · ${D.purposes[state.purpose]} · 기준 상권과의 거리 선호 반영`;renderMapList(ranked);updateMap(ranked);}
  function renderMapList(ranked){$('mapPlaceList').innerHTML=ranked.map(({place:p},i)=>`<button class="map-place" id="map-detail-${p.id}" data-detail="${p.id}"><span class="place-index">${i+1}</span><span class="place-label"><strong>${escape(p.name)}</strong><small>${regionText(p)} · 점포 ${fmt(p.storeCount)}곳<br>${shareText(p)}</small></span>${icon('arrow')}</button>`).join('');}
  function renderCourses(){ $('courseContainer').innerHTML=D.courses.map((c,i)=>`<article class="course-card"><span class="course-number">0${i+1}</span><p class="eyebrow">${D.regions[c.region].name} · 기획안</p><h3>${escape(c.name)}</h3><p>분석 노트북의 권역별 탐방 제안</p><ol>${c.placeIds.map(id=>`<li>${escape(D.places.find(p=>p.id===id).name)}</li>`).join('')}</ol><p class="course-note">방문 순서·도보 경로는 확정되지 않았어요.</p><button class="button outline" data-course="${c.id}">이 권역 지도에서 보기</button></article>`).join('');}
''' + s[end:]
s=s.replace("const storeMap = new Map(D.places.flatMap(p => p.stores.map(s => [s.id, s])));","const storeMap = new Map(D.places.map(p => [p.id,p]));").replace("troika.demo.stamps.v1","troika.saved.areas.v1")
a=s.index('    const hour = C.hourAt');b=s.index('    renderRecommendations();',a)
s=s[:a]+"    $('timeHint').textContent = '분기 자료 · 시간대 비중';\n"+s[b:]
s=s.replace("time.replace(':', '시 ') + '분'","time")
s=s.replace('state.step === 24','state.step === 5').replace('state.step >= 24','state.step >= 5')
s=s.replace('좌표와 혼잡도는 예시입니다.','서울시 상권 중심 좌표입니다. 실시간 혼잡도는 제공하지 않습니다.')
a=s.index('    ranked.forEach(({ place: p, congestion: value })');b=s.index('    map.invalidateSize();',a)
s=s[:a]+'''    ranked.forEach(({place:p})=>{const popup=document.createElement('div');popup.className='map-popup';popup.innerHTML=`<strong>${escape(p.name)}</strong><span>집계 점포 ${fmt(p.storeCount)}곳 · ${shareText(p)}</span><button data-detail="${p.id}">자세히 보기</button>`;window.L.circleMarker([p.lat,p.lng],{radius:10,color:'white',weight:2,fillColor:{'코어':'#d94b39','참여':'#47734a','연계':'#a57422'}[p.zone],fillOpacity:1}).bindPopup(popup).addTo(markerLayer);});
''' + s[b:]
a=s.index('  function renderDetailMeta');b=s.index('  function syncStampButtons',a)
s=s[:a]+'''  function renderDetailMeta(){const p=currentPlace;$('detailMeta').innerHTML=`<span>점포 ${fmt(p.storeCount)}곳</span><span>상권 면적 ${fmt(p.area)}㎡</span><span>${escape(p.dong)}</span>`;}
  function openDetail(id,opener){currentPlace=D.places.find(p=>p.id===id);if(!currentPlace)return;const p=currentPlace;$('detailRegion').textContent=`${regionText(p)} / 상권 코드 ${p.id}`;$('detailTitle').textContent=p.name;$('detailDescription').textContent=`2026년 2분기 서울시 상권 자료. 기획 테마: ${p.theme}.`;
    renderDetailMeta();
    $('storeList').innerHTML=`<button class="button primary" data-stamp="${p.id}">탐방 목록에 저장</button><div class="data-metrics"><p>추정매출 원자료 합산 <strong>${fmt(p.sales)}원</strong><br><small>당월_매출_금액 · 제공 업종 ${p.salesSectorCount}종 합계</small></p><p>전년 동분기 추정매출 변화 <strong>${pct(p.salesYoY)}</strong><br><small>두 분기 공통 업종 기준</small></p><p>유동인구 원자료 지표 <strong>${fmt(p.flow)}</strong><br><small>실시간 인원·고유 방문자 수가 아닙니다.</small></p><p>상주인구 ${fmt(p.residents)}명 · 집객시설 ${fmt(p.facilities)}개<br>아파트 단지 ${fmt(p.apartments)}개</p></div><h3>시간대별 유동인구 분포</h3><p class="field-hint">시간 구간 길이가 달라요. 각 구간 원자료의 구성비이며 혼잡도 비교 지표가 아닙니다.</p><div class="flow-bars">${p.timeFlow.map((v,i)=>`<div><span>${C.timeLabel(i)}</span><meter min="0" max="1" value="${C.share(p,i)||0}" aria-label="${C.timeLabel(i)} 비중"></meter><span>${pct(C.share(p,i))}</span></div>`).join('')}</div><details open><summary>업종별 점포 수</summary><table class="sector-table"><thead><tr><th>업종</th><th>점포 수</th></tr></thead><tbody>${p.sectors.filter(s=>s.count>0).map(s=>`<tr><td>${escape(s.name)}</td><td>${fmt(s.count)}</td></tr>`).join('')}</tbody></table></details>`;
    $('detailDialog').querySelector('.dialog-notice').textContent=`기획 구분: ${p.zone} · 스탬프 참여 배정안 ${p.plannedQuota}곳. 확정 가맹점·쿠폰 정보는 제공 자료에 없습니다.`;syncStampButtons();openDialog($('detailDialog'),opener);
  }
''' + s[b:]
s=s.replace("has ? '적립 완료' : stamps.length === 3 ? '체험 완료' : '데모 스탬프'","has ? '저장 완료' : stamps.length === 3 ? '목록 3곳 저장됨' : '탐방 목록에 저장'")
a=s.index('  function renderStamps');b=s.index('  const questions',a)
s=s[:a]+'''  function renderStamps(){ $('stampCount').innerHTML=stamps.length+' <span>/ 3</span>';$('stampShortcut').textContent=`탐방 목록 ${stamps.length}/3`;$('stampSlots').innerHTML=[0,1,2].map(i=>`<div class="stamp-slot ${stamps[i]?'filled':''}">${icon(stamps[i]?'check':'plus')}<span>${stamps[i]?escape(storeMap.get(stamps[i]).name):`${i+1}번째 탐방 상권`}</span></div>`).join('');$('rewardStatus').textContent='노트북 배정안: 코어 27곳 · 참여 23곳 · 연계 10곳. 확정 제휴 매장 수가 아닙니다.';$('rewardState').textContent='운영 기획';$('storageNotice').textContent=storageAvailable?'탐방 목록은 이 브라우저에 저장됩니다.':'브라우저 저장을 사용할 수 없어 현재 화면에만 유지됩니다.';syncStampButtons();}

''' + s[b:]
s=s.replace('골목에서 들려오는 버스킹 공연','문화·교류 테마의 골목 (기획)').replace('축제에서 가장 기대되는 순간은?','탐방에서 가장 기대되는 순간은?')
s=s.replace('데모 스탬프를 초기화했어요. 다시 모아보세요.','탐방 목록을 초기화했어요.').replace('코스의 세 장소를 선택했어요.','권역의 상권을 선택했어요.')
a=s.index("      const message = stamps.length === 3");b=s.index('      notify(message);',a)
s=s[:a]+"      const message = `탐방 목록에 ${stamps.length}곳을 저장했어요.`;\n"+s[b:]
s=s.replace('`예시 장소 ${D.places.length}곳 · 매장 ${storeIds.length}곳`','`상권 ${D.places.length}곳 · 집계 점포 ${fmt(D.places.reduce((n,p)=>n+p.storeCount,0))}곳`')
p.write_text(s,encoding='utf-8')
