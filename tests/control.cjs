const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../control.js'),'utf8');
const context={};vm.createContext(context);
vm.runInContext(source+'\nthis.make=makeSubtraction;this.board=controlBoard;',context);
for(let round=0;round<2000;round++)for(let i=0;i<10;i++) {
  const q=context.make(i);
  assert.ok(q.a>=10&&q.a<=999&&q.b>=0&&q.b<=q.a);
  assert.equal(q.answer,q.a-q.b);
  for(let place=1;place<=100;place*=10)assert.ok(Math.floor(q.a/place)%10>=Math.floor(q.b/place)%10,'Se generó una resta con canje');
  if(i===2)assert.equal(q.a%10,0);
  if(i===3)assert.equal(Math.floor(q.a/10)%10,0);
  if(i===4)assert.equal(q.answer,0);
  if(i===9)assert.equal(q.a,999);
  assert.ok(!/undefined|NaN/.test(context.board(q)));
}
console.log('OK · 20.000 restas sin canje, incluyendo ceros, resultado cero y límite 999.');
