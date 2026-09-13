(function(root){
'use strict';
const defaults={region:'all',purpose:'food',walk:'medium',step:4,interest:'any',companion:'any',style:'balanced'};
const slots=['00–06시','06–11시','11–14시','14–17시','17–21시','21–24시'];
const clampStep=n=>Math.max(0,Math.min(5,Math.round(Number(n)||0)));
function share(p,step){const sum=p.timeFlow.reduce((a,b)=>a+(b||0),0);return sum?p.timeFlow[clampStep(step)]/sum:null;}
// Fictional festival scenario, independent of observed population statistics.
function simulation(p,step){const offset=Number(p.id.slice(-2))%21;const value=Math.min(95,[18,32,65,48,76,39][clampStep(step)]+offset);return {value,label:value<45?'여유':value<75?'붐빔':'혼잡',className:value<45?'calm':value<75?'busy':'crowded',color:value<45?'#47734a':value<75?'#a57422':'#c44936'};}
const conceptLabels={meal:'든든한 한 끼',global:'세계 음식 탐방',cafe:'커피 산책',bakery:'빵·디저트 탐방',market:'시장·장보기',shopping:'소소한 쇼핑',night:'저녁 모임',culture:'캠퍼스 문화·교류'};
function concepts(p){
 const count=(codes)=>p.sectors.filter(s=>codes.includes(s.code)).reduce((n,s)=>n+s.count,0);
 const named=(terms)=>p.sectors.filter(s=>terms.some(t=>s.name.includes(t))).reduce((n,s)=>n+s.count,0);
 const metric=(n)=>Math.min(1,Math.sqrt(n/Math.max(1,p.storeCount)*4));
 const nums={meal:count(['CS100001','CS100008']),global:count(['CS100002','CS100003','CS100004']),cafe:p.cafeCount,bakery:count(['CS100005']),market:named(['슈퍼마켓','편의점','반찬','청과','육류','수산물','미곡']),shopping:named(['의류','신발','가방','서적','문구','화초','화장품','완구','공예','기념품']),night:count(['CS100009'])};
 return {...Object.fromEntries(Object.entries(nums).map(([key,count])=>[key,{key,label:conceptLabels[key],count,value:key==='market'&&p.type==='전통시장'?1:metric(count),basis:'업종 구성'}])),culture:{key:'culture',label:conceptLabels.culture,count:null,value:p.theme.includes('문화')||p.theme.includes('버스킹')?1:p.zone==='코어'?.7:.25,basis:'행사 기획'}};
}
function matchingConcept(p,s){const tags=Object.values(concepts(p)).filter(t=>t.value>0);const focus={food:['meal','global'],cafe:['cafe','bakery'],local:['market','shopping'],music:['culture']}[s.purpose]||[];const match=t=>t.value+(t.key===s.interest?1:0)+(focus.includes(t.key)?.5:0);return tags.sort((a,b)=>match(b)-match(a)||a.key.localeCompare(b.key));}
function score(p,s){
 const tags=concepts(p),max=(keys)=>Math.max(...keys.map(k=>tags[k].value));
 const purpose=s.purpose==='food'?max(['meal','global']):s.purpose==='cafe'?max(['cafe','bakery']):s.purpose==='local'?max(['market','shopping']):tags.culture.value;
 const walk=Math.max(0,1-p.distance/({low:.6,medium:1.2,high:2.5}[s.walk]||1.2));
 let sum=45*purpose+20*walk,weight=65;
 if(tags[s.interest]){sum+=20*tags[s.interest].value;weight+=20;}
 // Companion and exploration preferences are editorial matching rules, not facility certifications.
 const groups={solo:['cafe','meal'],friends:['global','night','culture'],pair:['cafe','bakery','shopping'],family:['meal','market']};
 if(groups[s.companion]){sum+=10*max(groups[s.companion]);weight+=10;}
 const values=Object.values(tags).filter(t=>t.key!=='culture').map(t=>t.value);
 if(s.style==='variety'){sum+=5*values.reduce((a,b)=>a+b,0)/values.length;weight+=5;}
 else if(s.style==='focused'){sum+=5*Math.max(...values);weight+=5;}
 return sum/weight*100;
}
function rank(places,s){return places.filter(p=>s.region==='all'||p.region===s.region).map(place=>({place,score:score(place,s)})).sort((a,b)=>b.score-a.score||a.place.id.localeCompare(b.place.id));}
function normalizeStamps(v,ids){return Array.isArray(v)?[...new Set(v.filter(x=>typeof x==='string'&&ids.includes(x)))].slice(0,3):[];}
function addStamp(v,id,ids){return normalizeStamps([...normalizeStamps(v,ids),id],ids);}
function readStamps(storage,key,ids){try{let v;try{v=JSON.parse(storage.getItem(key));}catch(e){if(e instanceof SyntaxError)return {stamps:[],available:true};throw e;}return {stamps:normalizeStamps(v,ids),available:true};}catch{return {stamps:[],available:false};}}
const c={defaults,clampStep,timeLabel:s=>slots[clampStep(s)],share,simulation,conceptLabels,concepts,matchingConcept,score,rank,normalizeStamps,addStamp,readStamps};
if(typeof module!=='undefined'&&module.exports)module.exports=c;else root.TroikaCore=c;
})(globalThis);
