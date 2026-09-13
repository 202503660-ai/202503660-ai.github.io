const test=require('node:test'),assert=require('node:assert/strict'),D=require('../data.js'),C=require('../core.js');
test('published allocation meets all final constraints',()=>{
 const target=D.places.filter(p=>p.allocation);
 assert.equal(target.length,16);assert.equal(target.reduce((a,p)=>a+p.storeCount,0),2699);
 assert.equal(target.reduce((a,p)=>a+p.plannedQuota,0),60);
 for(const [zone,total] of [['코어',36],['참여',24],['연계',0]])assert.equal(D.places.filter(p=>p.zone===zone).reduce((a,p)=>a+p.plannedQuota,0),total);
 for(const p of target){assert.ok(p.plannedQuota>=2&&p.plannedQuota<=Math.min(6,Math.floor(p.storeCount*.2)));assert.ok(Number.isInteger(p.plannedQuota));}
 const top=target.toSorted((a,b)=>b.allocation.M-a.allocation.M).slice(0,5);
 assert.equal(top.reduce((a,p)=>a+p.plannedQuota,0),27);assert.equal(top.reduce((a,p)=>a+p.allocation.previousQuota,0),13);
});
test('provenance precision and missing-quarter disclosure are preserved',()=>{
 assert.equal(D.allocationPolicy.mode,'published-snapshot');assert.equal(D.allocationPolicy.precision,3);
 const a=D.places.find(p=>p.id==='3130103');assert.equal(a.allocation.salesQuarter,20261);assert.equal(a.allocation.imputed,true);assert.equal(a.allocation.cap,3);
 const b=D.places.find(p=>p.id==='3110207');assert.equal(b.plannedQuota,6);assert.equal(b.allocation.M,.669);
});
test('policy snapshot cannot change visitor preference score',()=>{
 for(const p of D.places)assert.equal(C.score(p,C.defaults),C.score({...p,plannedQuota:999,allocation:{M:0}},C.defaults));
});
