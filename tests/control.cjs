const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../control.js'),'utf8');
const testMath=Object.create(Math);
let seed=72931;
const seededRandom=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
testMath.random=seededRandom;
const context={Math:testMath};vm.createContext(context);
vm.runInContext(source+'\nthis.questions=makeControlQuestions;this.make=makeSubtraction;this.board=controlBoard;this.column=guidedColumn;',context);
let checked=0;
function verify(mode) {
  const questions=context.questions(mode),count=mode==='ensayo'?10:15;
  assert.equal(questions.length,count);
  assert.equal(new Set(questions.map(q=>`${q.a}-${q.b}`)).size,count,'Se repitió una operación');
  const zeros=questions.filter(q=>q.answer===0).length;
  assert.ok(zeros<=1,'Más de un resultado cero en la ronda');
  for(const [i,q] of questions.entries()) {
    const level=mode==='ensayo'?(i<3?0:i<6?1:2):Math.floor(i/5);
    assert.equal(q.level,level);
    assert.ok(q.a>=10&&q.a<=999&&q.b>0&&q.b<=q.a);
    assert.equal(q.answer,q.a-q.b);
    for(const place of [1,10,100])assert.ok(Math.floor(q.a/place)%10>=Math.floor(q.b/place)%10,'Resta con canje');
    if(level===0){assert.ok(q.a<100);if(i<2)assert.ok(q.b<10);else assert.ok(q.b>=10);}
    if(level===1)assert.ok(q.a>=100&&q.a<=599&&q.b>=100);
    if(level===2)assert.ok(q.a>=600&&q.b>=100);
    assert.ok(!/undefined|NaN/.test(context.board(q)));
    checked++;
  }
  return zeros;
}
let zeroRounds=0;
for(let round=0;round<1000;round++){zeroRounds+=verify('practica');verify('ensayo');}
assert.ok(zeroRounds>150&&zeroRounds<350,'La inclusión del cero no ronda el 25 %');
for(const fixed of [0,.5,.999999]) {
  testMath.random=()=>fixed;
  verify('practica');verify('ensayo');
}
testMath.random=seededRandom;
for(let i=0;i<15;i++)assert.ok(context.make(i).answer>0,'Se generó a − a sin solicitarlo');
assert.ok(source.includes('15 restas en tres tramos'));
assert.ok(source.includes('Resolviste las quince restas'));
const example={a:587,b:325,answer:262};
for(const [i,expected] of [[0,[5,7,2]],[1,[2,8,6]],[2,[3,5,2]]]) {
  const column=context.column(example,i);
  assert.deepEqual([column.bottom,column.top,column.answer],expected);
}
for(const q of context.questions('practica')) {
  const digits=[0,1,2].map(i=>context.column(q,i));
  assert.ok(digits.every(d=>d.top-d.bottom===d.answer));
  assert.equal(digits[2].answer*100+digits[1].answer*10+digits[0].answer,q.answer);
}
console.log(`OK · ${checked.toLocaleString('es-CL')} restas: sin canje, sin repeticiones, tres niveles y máximo un resultado cero por ronda.`);
console.log(`OK · ${zeroRounds} de 1.000 prácticas incluyeron una resta con resultado cero.`);
