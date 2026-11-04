const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={localStorage:{getItem:()=>null},console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('historia.js','utf8')+'\nthis.topics=historyTopics;this.shuffle=historyShuffle;this.map=historyMap;',ctx);
assert.equal(ctx.topics.length,7);
for(const t of ctx.topics){assert.ok(t.intro&&t.example);assert.ok(t.questions.length>=5);for(const q of t.questions){assert.equal(q.length,5);assert.equal(new Set(q.slice(1)).size,4);assert.ok(q.every(Boolean));}if(t.id==='lectura')assert.ok(t.passage.includes('Sofía'));}
assert.ok(ctx.topics.find(t=>t.id==='zonas').questions.some(q=>q[1]==='Austral'));
assert.ok(ctx.topics.find(t=>t.id==='pueblos').questions.some(q=>q[1]==='Chono'));
assert.ok(ctx.topics.find(t=>t.id==='mundo').questions.some(q=>q[1]==='Mapa físico'));
assert.equal(ctx.topics.flatMap(t=>ctx.shuffle(t.questions).slice(0,2)).length,14);
assert.ok(ctx.map().includes('world-map.svg'));assert.ok(ctx.map().includes('Pacífico'));
console.log('OK · 7 temas, banco de preguntas y un ensayo equilibrado de 14 preguntas.');
