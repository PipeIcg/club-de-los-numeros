const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={localStorage:{getItem:()=>null},console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('historia.js','utf8')+'\nthis.topics=historyTopics;this.shuffle=historyShuffle;this.map=historyMap;this.exam=historyExamSelection;this.groups=historyExamGroups;',ctx);
assert.equal(ctx.topics.length,7);
for(const t of ctx.topics){assert.ok(t.intro&&t.example);assert.ok(t.questions.length>=5);for(const q of t.questions){assert.equal(q.length,5);assert.equal(new Set(q.slice(1)).size,4);assert.ok(q.every(Boolean));}if(t.id==='lectura')assert.ok(t.passage.includes('Sofía'));}
assert.ok(ctx.topics.find(t=>t.id==='zonas').questions.some(q=>q[1]==='Austral'));
assert.ok(ctx.topics.find(t=>t.id==='pueblos').questions.some(q=>q[1]==='Chono'));
assert.ok(ctx.topics.find(t=>t.id==='mundo').questions.some(q=>q[1]==='Mapa físico'));
for(let run=0;run<100;run++){const exam=ctx.exam();assert.equal(exam.length,37);for(const t of ctx.topics){const group=exam.filter(x=>x.t.id===t.id);assert.equal(group.length,ctx.groups[t.id].length);assert.equal(new Set(group.map(x=>x.q)).size,group.length);for(const indices of ctx.groups[t.id])assert.ok(group.some(x=>indices.some(i=>x.q===t.questions[i])));}}
assert.ok(ctx.map().includes('world-map.svg'));assert.ok(ctx.map().includes('Pacífico'));
console.log('OK · 7 temas, banco de preguntas y un ensayo de 37 preguntas con cobertura por contenido.');
