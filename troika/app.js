(() => {
  'use strict';
  const D = window.TroikaData, C = window.TroikaCore;
  const $ = id => document.getElementById(id);
  const state = { ...C.defaults, tab: 'recommendations' };
  const icons = {
    music: '<path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="17" cy="16" rx="3" ry="3"/>',
    food: '<path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v18M20 21V3c-4 1-5 5-5 10h5"/>',
    coffee: '<path d="M4 8h13v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM17 9h2a3 3 0 0 1 0 6h-2M7 3v2m5-2v2M2 22h19"/>',
    bag: '<path d="M4 8h16l1 13H3L4 8zM8 8V6a4 4 0 0 1 8 0v2"/>',
    tree: '<path d="m12 2-6 7h3l-5 6h4l-5 5h18l-5-5h4l-5-6h3L12 2zM12 20v3"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3zM21 2v4m-2-2h4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    sliders: '<path d="M4 6h7m4 0h5M4 12h2m4 0h10M4 18h11m4 0h1M11 3v6M6 9v6m9 0v6"/>',
    reset: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
    play: '<path d="m8 4 12 8-12 8V4z"/>',
    pause: '<path d="M8 4v16M16 4v16"/>',
    stamp: '<path d="M5 17h14l2 4H3l2-4zM9 17v-5a5 5 0 1 1 6 0v5"/>',
    ticket: '<path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4V5zM15 5v3m0 3v2m0 3v3"/>',
    walk: '<circle cx="13" cy="3.5" r="1.5"/><path d="m7 11 4-4 4 2 2 4h3M11 7l-1 7-4 7m4-7 5 3 1 4"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/>'
  };
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name] || icons.pin}</svg>`;
  const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  const storeMap = new Map(D.places.map(p => [p.id,p]));
  const storeIds = [...storeMap.keys()];
  const storageKey = 'troika.saved.areas.v1';
  let storage;
  try { storage = window.localStorage; } catch { storage = null; }
  const saved = C.readStamps(storage, storageKey, storeIds);
  let stamps = saved.stamps, storageAvailable = saved.available;
  const demoKey='troika.virtual.stamps.v1';
  let demoStamps=C.readStamps(storage,demoKey,storeIds).stamps;
  let timer = null, toastTimer = null, currentPlace = null, modalOpener = null;
  let map = null, markerLayer = null, leafletPromise = null, mapFailed = false;
  const breakpoint = window.matchMedia('(max-width: 1024px)');
  $('filterPanel').open = !breakpoint.matches;
  breakpoint.addEventListener('change', event => { $('filterPanel').open = !event.matches; });

  function notify(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4500);
  }
  function regionText(place) { const r = D.regions[place.region]; return `${r.name} · ${r.university}`; }
  const fmt = n => n == null ? '자료 없음' : Number(n).toLocaleString('ko-KR');
  const pct = n => n == null ? '자료 없음' : `${(n*100).toFixed(1)}%`;
  const shareText = p => `${C.timeLabel(state.step)} 시간당 비중 ${pct(C.sharePerHour(p,state.step))}`;
  const profileText=()=>[C.conceptLabels[state.interest],{solo:'혼자',friends:'친구와',pair:'둘이서',family:'가족과'}[state.companion],{focused:'집중 탐방',variety:'다양한 업종 탐방'}[state.style]].filter(Boolean).join(' · ');
  const conceptMarkup=p=>C.matchingConcept(p,state).filter(t=>t.value>0).slice(0,3).map(t=>`<span class="concept-tag">${escape(t.label)}${t.basis==='행사 기획'?' · 기획':''}</span>`).join('');
  // 스탬프 배정 근거 — 소외도 M = sqrt(D*L)*R 의 세 항을 그대로 보여준다. (TROIKA-B10-14)
  const marginMarkup = p => {
    const m = p.marginalization, q = p.plannedQuota;
    if (!m || m.M === null) return `<p class="field-hint">연계존은 교통 연계 대상이라 스탬프를 두지 않습니다. 셔틀·상품권 연계를 제안합니다. 무대까지 ${m ? fmt(Math.round(m.stageDistance)) : '—'}m.</p>`;
    const rows = [['하락 D', m.D, '20대 소비강도·점포 증감·폐업률·매출 변화'],
                  ['저활력 L', m.L, '점포당 매출의 역순위 — 상권 규모의 영향을 줄인 지표'],
                  ['도달 R', m.R, `무대까지 ${fmt(Math.round(m.stageDistance))}m`]];
    const salesPeriod = m.perStoreQuarter && m.perStoreQuarter !== D.quarter
      ? ` (${Math.floor(m.perStoreQuarter / 10)}년 ${m.perStoreQuarter % 10}분기 매출로 대체)` : '';
    const per = m.perStore != null ? ` · 점포당 분기 매출 ${fmt(Math.round(m.perStore / 10000))}만원${salesPeriod}` : '';
    return `<p class="field-hint">소외도 <strong>${m.M.toFixed(3)}</strong> = √(D×L)×R → 스탬프 <strong>${q}개</strong> · 점포 ${fmt(p.storeCount)}곳 중 ${(q / p.storeCount * 100).toFixed(1)}%${per}</p>`
      + `<div class="flow-bars">${rows.map(([k, v]) => `<div><span>${k}</span><meter min="0" max="1" value="${v}" aria-label="${k} ${v.toFixed(2)}"></meter><span>${v.toFixed(2)}</span></div>`).join('')}</div>`
      + `<p class="field-hint">${rows.map(([k, , why]) => `<strong>${k}</strong> ${why}`).join(' · ')}</p>`;
  };
  const simMarkup=p=>{const v=C.simulation(p,state.step);return `<span class="status ${v.className}">가상 혼잡도 · ${v.label} ${v.value}%</span>`;};
  function card({place:p},index) {
    const purpose=state.purpose, symbol={music:'music',food:'food',cafe:'coffee',local:'bag'}[purpose];
    return `<article class="place-card"><div class="card-art art-${purpose}" aria-hidden="true">${icon(symbol)}<span class="art-label">TROIKA / ${String(index+1).padStart(2,'0')}</span></div><div class="card-body"><div class="card-meta"><span class="region-label">${regionText(p)}</span><span class="status calm">${escape(p.type)}</span></div><h3>${escape(p.name)}</h3><div class="concept-tags">${conceptMarkup(p)}</div><p class="match-reason">${escape(C.matchingConcept(p,state)[0].label)} ${C.matchingConcept(p,state)[0].count===null?"행사 기획 테마를":`관련 업종 ${C.matchingConcept(p,state)[0].count}곳을`} 바탕으로 추천해요.</p><p class="recommendation-reason">${purpose==='cafe'?`커피·음료 점포 ${fmt(p.cafeCount)}곳`:purpose==='food'?`음식점·주점 등 ${fmt(p.foodCount)}곳`:purpose==='local'?`${escape(p.type)}의 업종을 둘러보세요`:`기획 테마 · ${escape(p.theme)}`}<br>권역 기준 상권에서 직선 ${p.distance.toFixed(2)}km</p><div class="card-bottom"><p class="walking-meta">집계 점포 ${fmt(p.storeCount)}곳 · 2026년 2분기</p><p class="card-benefit">${shareText(p)}</p><p>${simMarkup(p)}</p><button class="button outline" id="detail-${p.id}" data-detail="${p.id}">자세히 보기 ${icon('arrow')}</button></div></div></article>`;
  }
  function renderRecommendations(){const ranked=C.rank(D.places,state);$('recommendationsContainer').innerHTML=ranked.slice(0,3).map(card).join('');$('resultCount').textContent=`${ranked.length}개 상권 중 추천`;$('selectionSummary').textContent=`${state.region==='all'?'전체 권역':D.regions[state.region].name} · ${D.purposes[state.purpose]} · 기준 상권과의 거리 선호 반영${profileText()?` · ${profileText()}`:""}`;renderMapList(ranked);updateMap(ranked);}
  function renderMapList(ranked){$('mapPlaceList').innerHTML=ranked.map(({place:p},i)=>`<button class="map-place" id="map-detail-${p.id}" data-detail="${p.id}"><span class="place-index">${i+1}</span><span class="place-label"><strong>${escape(p.name)}</strong><small>${regionText(p)} · 점포 ${fmt(p.storeCount)}곳<br>${shareText(p)}<br>${simMarkup(p)}</small></span>${icon('arrow')}</button>`).join('');}
  function renderCourses(){ $('courseContainer').innerHTML=D.courses.map((c,i)=>`<article class="course-card"><span class="course-number">0${i+1}</span><p class="eyebrow">${D.regions[c.region].name} · 기획안</p><h3>${escape(c.name)}</h3><p>분석 노트북의 권역별 탐방 제안</p><ol>${c.placeIds.map(id=>`<li>${escape(D.places.find(p=>p.id===id).name)}</li>`).join('')}</ol><p class="course-note">방문 순서·도보 경로는 확정되지 않았어요.</p><button class="button outline" data-course="${c.id}">이 권역 지도에서 보기</button></article>`).join('');}
  function syncControls() {
    $('regionSelect').value = state.region;
    document.querySelectorAll('[data-purpose]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.purpose === state.purpose)));
    document.querySelectorAll('[data-walk]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.walk === state.walk)));
  }
  function setFilters(updates) {
    Object.assign(state, updates);
    $('personaSelect').value='custom';
    syncControls(); renderRecommendations(); renderCourses();
  }
  function changeTime(step) {
    state.step = C.clampStep(step);
    const time = C.timeLabel(state.step);
    $('timeSlider').value = state.step;
    $('timeSlider').setAttribute('aria-valuetext', time);
    $('timeDisplay').textContent = time;
    $('timeHint').textContent = '시간당 환산 비중 + 가상 체험';
    renderRecommendations();
  }
  function pauseTimeline() {
    if (timer) clearInterval(timer);
    timer = null;
    $('playTimeline').setAttribute('aria-pressed', 'false');
    $('playTimeline').innerHTML = icon('play') + '<span>자동 재생</span>';
  }
  function switchTab(tab, focus = false) {
    state.tab = tab;
    document.querySelectorAll('[data-tab]').forEach(button => {
      const active = button.dataset.tab === tab;
      button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
      $(button.getAttribute('aria-controls')).hidden = !active;
      if (active && focus) button.focus();
    });
    if (tab === 'map') { ensureMap(); if (map) { map.invalidateSize(); updateMap(C.rank(D.places, state)); } }
  }
  function asset(tag, url) {
    return new Promise((resolve, reject) => {
      const el = document.createElement(tag);
      if (tag === 'link') { el.rel = 'stylesheet'; el.href = url; } else { el.src = url; el.async = true; }
      const timeout = setTimeout(() => { el.remove(); reject(new Error('Map asset timeout')); }, 10000);
      el.onload = () => { clearTimeout(timeout); resolve(); };
      el.onerror = () => { clearTimeout(timeout); el.remove(); reject(new Error('Map asset unavailable')); };
      document.head.appendChild(el);
    });
  }
  async function ensureMap() {
    if (map || mapFailed) return;
    if (!leafletPromise) leafletPromise = Promise.all([
      asset('link', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'),
      asset('script', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
    ]);
    try {
      await leafletPromise;
      if (map) return;
      map = window.L.map('troikaMap', { scrollWheelZoom: false }).setView([37.59, 127.057], 14);
      markerLayer = window.L.layerGroup().addTo(map);
      const tiles = window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
      let tileError = false, tileLoaded = false;
      const tileTimeout = setTimeout(() => { if (!tileLoaded) $('mapStatus').textContent = '배경 지도 응답이 늦어요. 아래 장소 목록으로 계속 탐색할 수 있어요.'; }, 10000);
      tiles.on('tileload', () => { tileLoaded = true; clearTimeout(tileTimeout); });
      tiles.on('tileerror', () => { tileError = true; $('mapStatus').textContent = '배경 지도를 불러오지 못했어요. 아래 장소 목록에서 상세 정보를 확인하세요.'; });
      tiles.on('load', () => { if (!tileError && tileLoaded) $('mapStatus').textContent = '마커를 누르거나 아래 목록에서 장소를 선택하세요. 서울시 상권 중심 좌표 · 마커 색은 가상 혼잡도입니다.'; });
      $('mapStatus').textContent = '마커를 누르거나 아래 목록에서 장소를 선택하세요. 서울시 상권 중심 좌표 · 마커 색은 가상 혼잡도입니다.';
      updateMap(C.rank(D.places, state));
    } catch {
      mapFailed = true;
      $('mapStatus').textContent = '지도를 불러오지 못했어요. 아래 장소 목록에서 같은 정보를 확인할 수 있어요.';
      $('troikaMap').classList.add('map-unavailable');
    }
  }
  function updateMap(ranked) {
    if (!map || !markerLayer || state.tab !== 'map') return;
    markerLayer.clearLayers();
    ranked.forEach(({place:p})=>{const popup=document.createElement('div');popup.className='map-popup';popup.innerHTML=`<strong>${escape(p.name)}</strong><span>집계 점포 ${fmt(p.storeCount)}곳 · ${shareText(p)}</span>${simMarkup(p)}<button data-detail="${p.id}">자세히 보기</button>`;window.L.circleMarker([p.lat,p.lng],{radius:10,color:'white',weight:2,fillColor:C.simulation(p,state.step).color,fillOpacity:1}).bindPopup(popup).addTo(markerLayer);});
    map.invalidateSize();
    if (ranked.length) map.fitBounds(ranked.map(r => [r.place.lat, r.place.lng]), { padding: [32, 32], maxZoom: 15, animate: false });
  }
  function openDialog(dialog, opener) {
    pauseTimeline();
    modalOpener = { element: opener, id: opener && opener.id };
    dialog.showModal();
    dialog.querySelector('[data-close]').focus();
  }
  function renderDetailMeta(){const p=currentPlace;$('detailMeta').innerHTML=`<span>점포 ${fmt(p.storeCount)}곳</span><span>상권 면적 ${fmt(p.area)}㎡</span><span>${escape(p.dong)}</span>`;}
  function openDetail(id,opener){currentPlace=D.places.find(p=>p.id===id);if(!currentPlace)return;const p=currentPlace;$('detailRegion').textContent=`${regionText(p)} / 상권 코드 ${p.id}`;$('detailTitle').textContent=p.name;$('detailDescription').textContent=`2026년 2분기 서울시 상권 자료. 기획 테마: ${p.theme}.`;
    renderDetailMeta();
    $('storeList').innerHTML=`<div class="concept-tags">${conceptMarkup(p)}</div><p class="field-hint">업종 집계로 구성한 탐방 컨셉입니다. 분위기·시설·개별 매장 품질을 확인한 정보는 아닙니다.</p><button class="button primary" data-stamp="${p.id}">탐방 목록에 저장</button><div class="demo-detail">${simMarkup(p)}<p>축제 상황을 가정한 체험용 수치입니다.</p><button class="button primary" data-demo="${p.id}">가상 스탬프 받기</button></div><h3>스탬프 배정 근거</h3>${marginMarkup(p)}<h3>시간대별 유동인구 분포</h3><p class="field-hint">여섯 구간의 길이가 6·5·3·3·4·3시간으로 달라, <strong>시간당으로 환산한 비중</strong>입니다. 구간 길이에 따른 차이를 줄여 비교합니다. 혼잡도 비교 지표는 아닙니다.</p><div class="flow-bars">${p.timeFlow.map((v,i)=>`<div><span>${C.timeLabel(i)}</span><meter min="0" max="1" value="${C.sharePerHour(p,i)||0}" aria-label="${C.timeLabel(i)} 비중"></meter><span>${pct(C.sharePerHour(p,i))}</span></div>`).join('')}</div><details open><summary>탐방 관련 업종별 점포 수</summary><p class="field-hint">음식·카페·장보기·쇼핑 업종만 표시합니다. 전체 집계 점포 수와 합계가 다를 수 있어요.</p><table class="sector-table"><thead><tr><th>업종</th><th>점포 수</th></tr></thead><tbody>${p.sectors.filter(s=>s.count>0).map(s=>`<tr><td>${escape(s.name)}</td><td>${fmt(s.count)}</td></tr>`).join('')}</tbody></table></details>`;
    $('detailDialog').querySelector('.dialog-notice').textContent=`기획 구분: ${p.zone} · 스탬프 참여 배정안 ${p.plannedQuota}곳. 확정 가맹점·쿠폰 정보는 제공 자료에 없습니다.`;syncStampButtons();renderDemo();openDialog($('detailDialog'),opener);
  }
  function syncStampButtons() {
    document.querySelectorAll('[data-stamp]').forEach(button => {
      const has = stamps.includes(button.dataset.stamp);
      button.disabled = has || stamps.length === 3;
      button.textContent = has ? '저장 완료' : stamps.length === 3 ? '목록 3곳 저장됨' : '탐방 목록에 저장';
    });
  }
  function saveStamps() {
    try { storage.setItem(storageKey, JSON.stringify(stamps)); storageAvailable = true; }
    catch { storageAvailable = false; }
  }
  function renderStamps(){ $('stampCount').innerHTML=stamps.length+' <span>/ 3</span>';$('stampShortcut').textContent=`탐방 목록 ${stamps.length}/3`;$('stampSlots').innerHTML=[0,1,2].map(i=>`<div class="stamp-slot ${stamps[i]?'filled':''}">${icon(stamps[i]?'check':'plus')}<span>${stamps[i]?escape(storeMap.get(stamps[i]).name):`${i+1}번째 탐방 상권`}</span></div>`).join('');const pol=D.stampPolicy,zq=z=>D.places.filter(p=>p.zone===z).reduce((n,p)=>n+p.plannedQuota,0);$('rewardStatus').textContent=`소외도 기준 최적 배정안 · 코어 ${zq('코어')}곳 · 참여 ${zq('참여')}곳 · 연계 ${zq('연계')}곳.  확정 제휴 매장 수가 아닙니다.`;$('rewardState').textContent=pol.doc;$('storageNotice').textContent=storageAvailable?'탐방 목록은 이 브라우저에 저장됩니다.':'브라우저 저장을 사용할 수 없어 현재 화면에만 유지됩니다.';syncStampButtons();}

  function renderDemo(){
    const done=demoStamps.length===3;
    $('demoProgress').textContent=`가상 스탬프 ${demoStamps.length}/3`;
    $('demoNames').textContent=demoStamps.map(id=>storeMap.get(id).name).join(' · ')||'상권 상세에서 가상 스탬프를 받아보세요.';
    $('demoCoupon').hidden=!done;
    $('demoRemaining').textContent=done?'체험 완료! 가상 쿠폰이 열렸어요.':`서로 다른 상권 ${3-demoStamps.length}곳을 더 모으면 쿠폰이 열려요.`;
    document.querySelectorAll('[data-demo]').forEach(b=>{const has=demoStamps.includes(b.dataset.demo);b.disabled=has||done;b.textContent=has?'가상 스탬프 받음':done?'가상 체험 완료':'가상 스탬프 받기';});
  }
  $('resetDemo').addEventListener('click',()=>{demoStamps=[];try{storage.setItem(demoKey,'[]');}catch{}renderDemo();notify('가상 스탬프와 쿠폰을 초기화했어요.');});
  window.addEventListener('storage',e=>{if(e.key===demoKey||e.key===null){demoStamps=C.readStamps(storage,demoKey,storeIds).stamps;renderDemo();}});
  const questions = [
    {key:'region',title:'어느 동네까지 탐방할까요?',options:[['all','세 권역 모두 추천받기','pin'],['hoegi','회기권 · 경희대 주변','music'],['imun','이문권 · 한국외대 주변','food'],['jeonnong','전농권 · 서울시립대 주변','tree']]},
    {key:'purpose',title:'오늘 탐방의 중심은 무엇인가요?',options:[['food','맛있는 음식 찾기','food'],['cafe','커피와 디저트','coffee'],['local','동네 시장과 쇼핑','bag'],['music','캠퍼스 문화·교류 테마','music']]},
    {key:'interest',title:'한 가지를 더 고른다면, 무엇에 끌리나요?',options:[['meal','든든한 한 끼와 분식','food'],['global','중식·일식·양식 골목','food'],['cafe','커피 한 잔의 여유','coffee'],['bakery','빵집과 디저트 탐방','coffee'],['market','시장 구경과 장보기','bag'],['shopping','옷·소품·책 구경','bag'],['night','저녁 모임과 주점','music'],['culture','캠퍼스 문화·교류 (기획)','music'],['any','아직 모르겠어요','sparkles']]},
    {key:'companion',title:'누구와 함께 가나요?',options:[['solo','혼자 · 한 끼와 커피 위주','coffee'],['friends','친구와 · 다양한 음식과 모임','food'],['pair','둘이서 · 카페와 쇼핑','bag'],['family','가족과 · 식사와 시장 구경','tree'],['any','동행에 상관없이 추천받기','pin']]},
    {key:'style',title:'어떤 방식으로 골목을 즐길까요?',options:[['focused','특정 업종이 모인 골목을 깊게','pin'],['variety','여러 업종을 골고루 둘러보기','bag'],['balanced','어느 쪽이든 좋아요','sparkles']]},
    {key:'walk',title:'걷는 범위는 어느 정도가 좋나요?',options:[['low','권역 기준 상권 가까이','coffee'],['medium','주변 골목까지 적당히','walk'],['high','거리가 좀 있어도 탐험','pin']]}
  ];
  let quizIndex = 0, quizAnswers = {};
  function renderQuiz() {
    const question = questions[quizIndex];
    $('quizProgress').innerHTML = questions.map((_, i) => `<span class="${i <= quizIndex ? 'done' : ''}"></span>`).join('');
    $('quizStep').textContent = `${quizIndex + 1} / ${questions.length}`;
    $('quizQuestion').textContent = question.title;
    $('quizOptions').innerHTML = question.options.map(([value, label, symbol]) => `<button data-answer="${value}" aria-pressed="${quizAnswers[question.key] === value}">${icon(symbol)}<span>${label}</span></button>`).join('');
    $('quizBack').hidden = quizIndex === 0;
  }

  $('personaSelect').addEventListener('change', e => { const presets={student:{region:'all',purpose:'music',walk:'high'},foodie:{region:'imun',purpose:'food',walk:'medium'},cafe:{region:'hoegi',purpose:'cafe',walk:'medium'},local:{region:'jeonnong',purpose:'local',walk:'low'}};const v=e.target.value;if(presets[v])setFilters({...C.defaults,...presets[v],step:state.step});e.target.value=v; });
  $('regionSelect').addEventListener('change', e => setFilters({ region: e.target.value }));
  $('resetFilters').addEventListener('click', () => { setFilters({ ...C.defaults, step:state.step }); notify('탐방 취향을 처음 설정으로 되돌렸어요.'); });
  $('timeSlider').addEventListener('input', e => { pauseTimeline(); changeTime(e.target.value); });
  $('resetTimeline').addEventListener('click', () => { pauseTimeline(); changeTime(C.defaults.step); });
  $('playTimeline').addEventListener('click', () => {
    if (timer) return pauseTimeline();
    if (state.step === 5) changeTime(0);
    $('playTimeline').setAttribute('aria-pressed', 'true');
    $('playTimeline').innerHTML = icon('pause') + '<span>일시 정지</span>';
    timer = setInterval(() => { changeTime(state.step + 1); if (state.step >= 5) pauseTimeline(); }, 1400);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseTimeline(); });
  $('startQuiz').addEventListener('click', e => { quizIndex = 0; quizAnswers = {...state}; renderQuiz(); openDialog($('quizDialog'), e.currentTarget); });
  $('quizBack').addEventListener('click', () => { if (quizIndex > 0) { quizIndex--; renderQuiz(); $('quizQuestion').focus(); } });
  $('resetStamps').addEventListener('click', () => { stamps = []; saveStamps(); renderStamps(); notify('탐방 목록을 초기화했어요.'); });
  window.addEventListener('storage', e => { if (e.key === storageKey || e.key === null) { stamps = C.readStamps(storage, storageKey, storeIds).stamps; renderStamps(); } });
  document.querySelector('[role=tablist]').addEventListener('keydown', e => {
    const tabs = ['recommendations', 'map', 'courses'];
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    let index = tabs.indexOf(state.tab);
    index = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (index + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
    switchTab(tabs[index], true);
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      const opener = modalOpener;
      const target = opener && (opener.id ? $(opener.id) : opener.element);
      if (target && target.isConnected) target.focus();
      else $(`tab-${state.tab}`).focus();
      modalOpener = null;
    });
    dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    if(b.dataset.demo){demoStamps=C.addStamp(demoStamps,b.dataset.demo,storeIds);try{storage.setItem(demoKey,JSON.stringify(demoStamps));}catch{notify('브라우저 저장이 불가해 현재 화면에서만 유지됩니다.');}renderDemo();$('detailDialog').querySelector('[data-close]').focus();$('detailDialog').querySelector('.dialog-notice').textContent=demoStamps.length===3?'가상 스탬프 3개 완료! 아래 가상 체험 패스에서 15% 쿠폰을 확인하세요. 실제 사용은 불가합니다.':`가상 스탬프 ${demoStamps.length}/3 · 실제 방문 인증이 아닙니다.`;}
    else if (b.dataset.purpose) setFilters({ purpose: b.dataset.purpose });
    else if (b.dataset.walk) setFilters({ walk: b.dataset.walk });
    else if (b.dataset.tab) switchTab(b.dataset.tab);
    else if (b.dataset.detail) openDetail(b.dataset.detail, b);
    else if (b.dataset.close) $(b.dataset.close).close();
    else if (b.dataset.course) {
      const course = D.courses.find(c => c.id === b.dataset.course);
      setFilters({ region: course.region, purpose: course.purpose, walk: course.walk });
      switchTab('map', true);
      $('explore').scrollIntoView({ block: 'start' });
      notify(`${course.name} 권역의 상권을 선택했어요.`);
    } else if (b.dataset.stamp) {
      const next = C.addStamp(stamps, b.dataset.stamp, storeIds);
      if (next.length === stamps.length) return;
      stamps = next; saveStamps(); renderStamps();
      // Keep focus within the dialog when the just-used button becomes disabled.
      const nextButton = $('storeList').querySelector('button:not(:disabled)');
      (nextButton || $('detailDialog').querySelector('[data-close]')).focus();
      const message = `탐방 목록에 ${stamps.length}곳을 저장했어요.`;
      notify(message);
    } else if (b.dataset.answer) {
      quizAnswers[questions[quizIndex].key] = b.dataset.answer;
      if (quizIndex < questions.length - 1) { quizIndex++; renderQuiz(); $('quizQuestion').focus(); }
      else {
        setFilters(quizAnswers); switchTab('recommendations');
        $('quizDialog').close(); notify('취향 진단 완료! 선택한 취향으로 골목을 추천했어요.');
        $('explore').scrollIntoView({ block: 'start' });
      }
    }
  });
  $('dataCount').textContent = `상권 ${D.places.length}곳 · 집계 점포 ${fmt(D.places.reduce((n,p)=>n+p.storeCount,0))}곳`;
  syncControls(); changeTime(state.step); renderCourses(); renderStamps(); renderDemo();
})();
