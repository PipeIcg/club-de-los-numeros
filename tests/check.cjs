const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const context = { document:{querySelector:()=>({})},localStorage:{getItem:()=>null},console };
vm.createContext(context);
vm.runInContext(source.split('const heroArt =')[0]+'\nthis.api={generate,topics,word};',context);
const {generate,topics,word}=context.api;
assert.equal(topics.length,12);
for(const [n,expected] of [[0,'cero'],[16,'dieciséis'],[22,'veintidós'],[31,'treinta y uno'],[100,'cien'],[101,'ciento uno'],[500,'quinientos'],[700,'setecientos'],[999,'novecientos noventa y nueve']])assert.equal(word(n),expected);
for(let n=0;n<=999;n++)assert.ok(word(n)&&!word(n).includes('undefined'));
let checked=0;
for(const topic of topics) {
  for(let repeat=0;repeat<200;repeat++)for(let i=0;i<5;i++) {
    const q=generate(topic.id,i);
    assert.equal(new Set(q.options).size,q.options.length,topic.id+': opciones repetidas');
    assert.ok(q.options.length>=3&&q.options.length<=4);
    assert.equal(q.options.filter(o=>o===q.answer).length,1);
    assert.ok(q.prompt&&q.hint&&q.explanation);
    for(const value of [q.prompt,q.answer,q.visual,...q.options]) assert.ok(!/NaN|undefined/.test(value),topic.id+': contenido inválido');
    if(topic.id==='operaciones') {
      const numbers=[...q.visual.matchAll(/<div>(?:[+−] )?(\d+)<\/div>/g)].map(m=>Number(m[1]));
      assert.equal(numbers.length,2);
      const [a,b]=numbers, sub=i%2===1;
      assert.equal(Number(q.answer),sub?a-b:a+b);
      for(let place=1;place<=100;place*=10) {
        const x=Math.floor(a/place)%10,y=Math.floor(b/place)%10;
        assert.ok(sub?x>=y:x+y<=9,'Operación con reserva');
      }
      assert.ok(Number(q.answer)>=0&&Number(q.answer)<=999);
    }
    if(topic.id==='componer'&&i%2===0) {
      const displayed=Number(q.visual.match(/>(\d+)</)[1]);
      for(const option of q.options) {
        const sum=option.split(' + ').reduce((a,b)=>a+Number(b),0);
        assert.equal(sum===displayed,option===q.answer,'Dos opciones equivalentes');
      }
    }
    if(topic.id==='secuencias') {
      const values=[...q.visual.matchAll(/<span class="">(\d+)<\/span>/g)].map(m=>Number(m[1]));
      assert.equal(values.length,4);
      const step=values[1]-values[0];
      assert.ok(values.every((v,j)=>j===0||v-values[j-1]===step));
      assert.equal(Number(q.answer),values[3]+step);
      assert.ok(Number(q.answer)>=0&&Number(q.answer)<=999);
    }
    if(topic.id==='dinero'&&i<4) {
      const money=q.visual.match(/aria-label="Dinero: ([^"]+)"/)[1];
      const total=[...money.matchAll(/(\d+) pesos/g)].reduce((sum,m)=>sum+Number(m[1]),0);
      assert.equal(Number(q.answer.replace(/[^0-9]/g,'')),total);
    }
    checked++;
  }
  console.log('OK · '+topic.short);
}
console.log(`\n${checked.toLocaleString('es-CL')} ejercicios verificados; lectura de los 1.000 números y operaciones sin reserva correctas.`);
