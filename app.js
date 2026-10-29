'use strict';

const $ = (selector) => document.querySelector(selector);
const main = $('#main');
const STORAGE_KEY = 'club-numeros-v1';
let storageAvailable = true;
let progress = { lessons: {}, sound: false, challenges: 0, control: { practices:0, exams:0, best:0 } };
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && typeof saved === 'object') {
    progress.sound = saved.sound === true;
    progress.challenges = Number.isInteger(saved.challenges) && saved.challenges > 0 ? saved.challenges : 0;
    if(saved.control && typeof saved.control==='object') {
      for(const key of ['practices','exams','best']) {
        const value=saved.control[key];
        if(Number.isInteger(value)&&value>=0&&(key!=='best'||value<=10))progress.control[key]=value;
      }
    }
    if (saved.lessons && typeof saved.lessons === 'object') {
      for (const [id, score] of Object.entries(saved.lessons)) {
        if (score && Number.isInteger(score.stars) && score.stars >= 1 && score.stars <= 3) {
          progress.lessons[id] = { stars: score.stars, completed: true };
        }
      }
    }
  }
} catch { storageAvailable = false; }

const topics = [
  { id:'posicion', title:'Cada número en su lugar', short:'Valor posicional', desc:'Descubre centenas, decenas y unidades.', icon:'C D U', color:'#467e76', tint:'#e7f0e8', group:'numeros', intro:'Los números tienen casitas. La de las centenas vale 100, la de las decenas vale 10 y la de las unidades vale 1.', example:'327 = 300 + 20 + 7', note:'En 327 hay 3 centenas, 2 decenas y 7 unidades. El lugar de cada cifra nos dice cuánto vale.' },
  { id:'lectura', title:'Los números tienen nombre', short:'Lectura y escritura', desc:'Lee y reconoce números del 0 al 999.', icon:'123', color:'#bd9260', tint:'#fbefd7', group:'numeros', intro:'Cada número tiene un nombre. Para leerlo, mira primero las centenas, después las decenas y al final las unidades.', example:'482', note:'Se lee: cuatrocientos ochenta y dos. Entre las decenas y las unidades usamos «y», como en ochenta y dos.' },
  { id:'orden', title:'¿Cuál es más grande?', short:'Orden y comparación', desc:'Compara, ordena y encuentra al mayor.', icon:'≷', color:'#9c7ea9', tint:'#f1eaf7', group:'numeros', intro:'Para comparar, mira las centenas. Si son iguales, mira las decenas. Si también son iguales, mira las unidades. La boca del signo se abre hacia el número mayor.', example:'156 > 98', note:'156 es mayor que 98. Usamos > para «mayor que», < para «menor que» y = para «igual a».' },
  { id:'contar', title:'Bloques que cuentan', short:'Contar y representar', desc:'Construye números con bloques de colores.', icon:'▦', color:'#5e8ba4', tint:'#e7f0f7', group:'numeros', intro:'Una placa azul representa 100. Una barra verde representa 10. Un cubito amarillo representa 1. ¡Juntos forman un número!', example:'blocks', note:'1 centena + 3 decenas + 2 unidades = 100 + 30 + 2 = 132.' },
  { id:'operaciones', title:'Juntar y quitar', short:'Sumas y restas', desc:'Practica operaciones sin reserva.', icon:'＋ −', color:'#c07862', tint:'#fbece4', group:'calculo', intro:'Sumar es juntar. Restar es quitar o encontrar la diferencia. Empieza por las unidades, sigue con las decenas y termina con las centenas.', example:'245 + 132 = 377', note:'Unidades: 5 + 2 = 7. Decenas: 4 + 3 = 7. Centenas: 2 + 1 = 3. Practicaremos sin reserva: sin llevar ni pedir prestado.' },
  { id:'secuencias', title:'Sigue la pista', short:'Secuencias numéricas', desc:'Encuentra el patrón y sigue la serie.', icon:'↗', color:'#739157', tint:'#edf2df', group:'calculo', intro:'Una secuencia es una fila de números que sigue una regla. Mira cuánto cambia de un número al siguiente: puede aumentar o disminuir.', example:'120 → 130 → 140 → 150 → ?', note:'Cada número aumenta en 10. Después de 150 viene 160. ¡Encontraste la regla!' },
  { id:'componer', title:'El rompecabezas numérico', short:'Componer y descomponer', desc:'Arma y separa centenas, decenas y unidades.', icon:'⊕', color:'#ac8c42', tint:'#fbf3d4', group:'calculo', intro:'Podemos separar un número en partes y volver a juntarlas. Cada parte conserva el valor de su lugar: centenas, decenas y unidades.', example:'356 = 300 + 50 + 6', note:'Descomponer es separar: 356 → 300 + 50 + 6. Componer es juntar: 300 + 50 + 6 → 356.' },
  { id:'graficos', title:'Historias en un gráfico', short:'Pictogramas y gráficos', desc:'Mira, cuenta y descubre lo que dicen los datos.', icon:'▥', color:'#b6799e', tint:'#f7e8f1', group:'mundo', intro:'Los gráficos muestran datos con dibujos o barras. Mira el título y lo que vale cada dibujo. Una barra más alta representa una cantidad mayor.', example:'chart', note:'La pera tiene la barra más alta: fue la fruta más elegida. En un pictograma, revisa la clave: un dibujo puede valer 1, 2 o más.' },
  { id:'problemas', title:'Pequeños grandes desafíos', short:'Problemas matemáticos', desc:'Resuelve historias de todos los días.', icon:'?', color:'#558a83', tint:'#e3f0eb', group:'calculo', intro:'Lee con calma e imagina la historia. Busca los datos y qué te preguntan. Si juntamos, sumamos; si quitamos, restamos.', example:'12 + 5 = 17', note:'Luna tiene 12 lápices y recibe 5 más. Ahora tiene 17 lápices. Puedes hacer un dibujo para ayudarte.' },
  { id:'medicion', title:'¡A medir el mundo!', short:'Medición', desc:'Explora centímetros, litros y horas.', icon:'↔', color:'#bd9051', tint:'#faf0dc', group:'mundo', intro:'Medir nos ayuda a conocer el mundo. Medimos largos en centímetros (cm), la capacidad en litros (L) y el tiempo con el reloj.', example:'measure', note:'La regla comienza en 0. Una botella puede contener 1 litro. En una hora en punto, el minutero apunta al 12 y la aguja corta indica la hora.' },
  { id:'geometria', title:'Un mundo de formas', short:'Figuras y cuerpos', desc:'Descubre figuras planas y cuerpos geométricos.', icon:'△', color:'#8d7fa9', tint:'#efebf8', group:'mundo', intro:'Las figuras son planas, como un dibujo en el papel. Los cuerpos ocupan espacio, como una caja, una pelota o una lata.', example:'shapes', note:'El triángulo tiene 3 lados; el cuadrado, 4 lados iguales. La esfera se parece a una pelota, el cubo a un dado y el cilindro a una lata.' },
  { id:'dinero', title:'Mi pequeña alcancía', short:'Dinero chileno', desc:'Cuenta pesos y juega a comprar.', icon:'$', color:'#8e9651', tint:'#eef1dc', group:'mundo', intro:'En Chile usamos pesos. Para saber cuánto dinero hay, sumamos el valor de las monedas o billetes. Si pagamos de más, recibimos vuelto.', example:'coins', note:'Una moneda de $100 y dos de $10 suman $120. Mira el número de cada moneda: su tamaño en el dibujo no representa su valor.' }
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (items) => items[rand(0, items.length - 1)];
function shuffle(items) { const out = [...items]; for (let i=out.length-1;i>0;i--) { const j=rand(0,i); [out[i],out[j]]=[out[j],out[i]]; } return out; }
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function word(n) {
  const ones=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve'];
  if(n<30) return ones[n];
  if(n<100) return ['','','','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'][Math.floor(n/10)] + (n%10?' y '+ones[n%10]:'');
  if(n===100) return 'cien';
  return ['','ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos'][Math.floor(n/100)] + (n%100?' '+word(n%100):'');
}
function question(prompt, answer, distractors, hint, visual='', explanation='') {
  const correct = String(answer);
  const wrong = [...new Set(distractors.map(String))].filter(v => v !== correct);
  let offset = 1;
  while (wrong.length < 3 && Number.isFinite(Number(answer))) {
    const candidate = String(Number(answer) + offset++);
    if (candidate !== correct && !wrong.includes(candidate)) wrong.push(candidate);
  }
  return {prompt, answer:correct, options:shuffle([correct,...shuffle(wrong).slice(0,3)]), hint, visual, explanation};
}
function numericQuestion(prompt, answer, hint, visual='', explanation='', step=10) {
  const variants=[answer+step,answer-step,answer+1,answer+100,answer-1,answer+step*2].filter(n=>n>=0);
  return question(prompt,answer,variants,hint,visual,explanation);
}
const numberVisual = n => `<div class="big-number">${escapeHTML(n)}</div>`;
function blocks(n, labels=true) {
  const digits=[Math.floor(n/100),Math.floor(n/10)%10,n%10];
  return `<div class="base-ten" role="img" aria-label="${digits[0]} placas de centena, ${digits[1]} barras de decena y ${digits[2]} cubitos de unidad">${digits.map((amount,i)=>`<div class="base-group"><div class="base-pieces">${Array.from({length:amount},()=>`<span class="${['hundred','ten','unit'][i]}"></span>`).join('') || '<span class="muted">—</span>'}</div>${labels?`<small>${['Centenas','Decenas','Unidades'][i]}</small>`:''}</div>`).join('')}</div>`;
}
function placeTable(n) { return `<div class="place-table" aria-label="Centenas, decenas y unidades"><span class="head">C</span><span class="head">D</span><span class="head">U</span>${String(n).padStart(3,'0').split('').map(d=>`<span>${d}</span>`).join('')}</div>`; }
function coins(values) { return `<div class="coins" role="img" aria-label="Dinero: ${values.map(v=>v+' pesos').join(', ')}">${values.map(v=>v>=1000?`<span class="bill">$${v.toLocaleString('es-CL')}</span>`:`<span class="coin ${v===50?'silver':''}">${v}</span>`).join('')}</div>`; }
function chart(values=[3,2,5,1]) {
  return `<div class="chart" role="img" aria-label="Votos: manzana ${values[0]}, plátano ${values[1]}, pera ${values[2]}, naranja ${values[3]}">${values.map((n,i)=>`<div class="chart-column"><div class="chart-bar" style="height:${n*24}px;background:${['#e89078','#edcc71','#95b883','#d9ae7a'][i]}"><span>${n}</span></div></div>`).join('')}</div><div class="chart-labels" aria-hidden="true"><span>🍎</span><span>🍌</span><span>🍐</span><span>🍊</span></div><span class="chart-legend">Frutas favoritas · cantidad de votos</span>`;
}
function shape(type) {
  const shapes={
    'triángulo':'<path d="M60 14 108 101H12Z" fill="#92bbc8"/>',
    'cuadrado':'<rect x="20" y="20" width="80" height="80" rx="2" fill="#dd9e88"/>',
    'círculo':'<circle cx="60" cy="60" r="43" fill="#e8c969"/>',
    'rectángulo':'<rect x="9" y="29" width="102" height="62" rx="2" fill="#a4be8b"/>',
    'cubo':'<path d="M17 37 48 15 105 27 75 50Z" fill="#d4c1ed"/><path d="M17 37 75 50V108L17 92Z" fill="#b79ccc"/><path d="M75 50 105 27V83L75 108Z" fill="#9577b1"/>',
    'esfera':'<defs><radialGradient id="sphere"><stop offset="0" stop-color="#f7dca3"/><stop offset="1" stop-color="#cb9b62"/></radialGradient></defs><circle cx="60" cy="60" r="44" fill="url(#sphere)"/><path d="M17 60Q60 84 103 60M60 16Q29 60 60 104" stroke="#b88c57" fill="none"/>',
    'cilindro':'<path d="M25 28V92C25 110 95 110 95 92V28" fill="#9ebf9b"/><ellipse cx="60" cy="28" rx="35" ry="14" fill="#ccdec3"/><path d="M25 92C25 110 95 110 95 92" fill="none"/>',
    'cono':'<path d="M24 94 60 12 96 94" fill="#e8acbd"/><ellipse cx="60" cy="94" rx="36" ry="13" fill="#ce91a5"/>'
  };
  return `<svg class="shape-svg" viewBox="0 0 120 120" role="img" aria-label="${type}"><g stroke="#526554" stroke-width="2.3" stroke-linejoin="round">${shapes[type]}</g></svg>`;
}
function clockVisual(hour) {
  const angle=hour*30*Math.PI/180;
  return `<svg viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Reloj: minutero en 12, aguja corta en ${hour}"><circle cx="80" cy="80" r="73" fill="#fffdf6" stroke="#e0a08b" stroke-width="7"/>${Array.from({length:12},(_,i)=>{const a=(i+1)*Math.PI/6;return `<text x="${80+Math.sin(a)*57}" y="${85-Math.cos(a)*57}" text-anchor="middle" fill="#62745a" font-size="13">${i+1}</text>`;}).join('')}<path d="M80 80V35" stroke="#8b9b85" stroke-width="4" stroke-linecap="round"/><path d="M80 80L${80+Math.sin(angle)*30} ${80-Math.cos(angle)*30}" stroke="#2d604b" stroke-width="6" stroke-linecap="round"/><circle cx="80" cy="80" r="5" fill="#2d604b"/></svg>`;
}
function rulerVisual(length) {
  return `<div style="width:min(100%,420px)"><div class="object-length" style="width:calc((100% - 18px) * ${length/10});margin-bottom:7px" role="img" aria-label="La barra empieza en 0 y termina en ${length} centímetros"></div><div class="ruler">${Array.from({length:11},(_,i)=>`<span>${i}</span>`).join('')}</div></div>`;
}

function generate(id, index=0) {
  const n=rand(100,999), c=Math.floor(n/100), d=Math.floor(n/10)%10, u=n%10;
  switch(id) {
    case 'posicion': {
      const place=rand(0,2), digit=[c,d,u][place], names=['centenas','decenas','unidades'];
      if(index%2===0) return question(`¿Qué cifra está en las ${names[place]}?`,digit,shuffle([0,1,2,3,4,5,6,7,8,9]),`En C–D–U, busca ${['la primera','la segunda','la tercera'][place]} casita.`,placeTable(n),`En ${n}, la cifra de las ${names[place]} es ${digit}.`);
      const value=digit*[100,10,1][place];
      return numericQuestion(`¿Cuánto vale el ${digit} que está en las ${names[place]}?`,value,`Cada ${['centena vale 100','decena vale 10','unidad vale 1'][place]}. Multiplica la cifra por ese valor.`,placeTable(n),`${digit} ${names[place]} valen ${value}.`,10);
    }
    case 'lectura': {
      const num=index===0?rand(0,99):n;
      if(index%2) return numericQuestion(`¿Qué número dice «${word(num)}»?`,num,'Separa lo que escuchas en centenas, decenas y unidades.','',`${word(num)} se escribe ${num}.`);
      return question('¿Cómo se lee este número?',word(num),[word((num+10)%1000),word((num+100)%1000),word((num+1)%1000),word((num+20)%1000)],'Lee primero las centenas. Luego las decenas y las unidades.',numberVisual(num),`${num} se lee ${word(num)}.`);
    }
    case 'orden': {
      if(index===4) {const nums=shuffle([n,Math.max(0,n-10),Math.min(999,n+20),Math.max(0,n-100)]);return question('¿Cuál de estos números es el menor?',Math.min(...nums),nums,'Compara centenas, luego decenas y por último unidades.','',`El menor es ${Math.min(...nums)}.`);}
      const other=index===2?n:rand(0,999), sign=n>other?'>':n<other?'<':'=';
      return question('¿Qué signo va en el espacio?',sign,['>','<','='],'La boca abierta mira al número más grande. Si son iguales, elige =.',numberVisual(`${n} ☐ ${other}`),`${n} ${sign} ${other}. ${sign==='='?'Los dos números son iguales.':'La abertura mira al número mayor.'}`);
    }
    case 'contar': {
      const num=rand(1,3)*100+rand(0,5)*10+rand(0,6);
      return numericQuestion('¿Qué número forman estos bloques?',num,'Cada placa azul vale 100; cada barra verde vale 10; cada cubito amarillo vale 1.',blocks(num),`Son ${Math.floor(num/100)*100} + ${Math.floor(num/10)%10*10} + ${num%10} = ${num}.`);
    }
    case 'operaciones': {
      const aDigits=[rand(1,7),rand(0,8),rand(0,8)], subtract=index%2===1;
      const bDigits=aDigits.map((v,i)=>rand(i===0?1:0,subtract?v:9-v));
      const a=aDigits[0]*100+aDigits[1]*10+aDigits[2], b=bDigits[0]*100+bDigits[1]*10+bDigits[2];
      const answer=subtract?a-b:a+b, symbol=subtract?'−':'+';
      return numericQuestion(subtract?'¿Cuánto queda al restar?':'¿Cuánto hay al sumar?',answer,'Empieza a la derecha: unidades, después decenas y al final centenas.',`<div class="vertical-sum" aria-label="${a} ${subtract?'menos':'más'} ${b}"><div>${a}</div><div>${symbol} ${b}</div><div class="line">?</div></div>`,`${a} ${symbol} ${b} = ${answer}.`);
    }
    case 'secuencias': {
      const step=pick([2,5,10,20,100]), down=index%3===2, start=down?rand(5,9)*step:rand(0,Math.floor((999-4*step)/step))*step;
      const seq=Array.from({length:5},(_,i)=>start+i*step*(down?-1:1));
      return numericQuestion('¿Qué número sigue en la secuencia?',seq[4],`Compara los primeros dos números. La regla es ${down?'restar':'sumar'} siempre la misma cantidad.`,`<div class="sequence">${seq.map((v,i)=>`<span class="${i===4?'blank':''}">${i===4?'?':v}</span>`).join('')}</div>`,`La regla es ${down?'restar':'sumar'} ${step}. El siguiente número es ${seq[4]}.`,step);
    }
    case 'componer': {
      if(index%2) return numericQuestion('Junta las partes. ¿Qué número forman?',n,'Suma el valor de las centenas, las decenas y las unidades.',numberVisual(`${c*100} + ${d*10} + ${u}`),`${c*100} + ${d*10} + ${u} = ${n}.`);
      const answer=`${c*100} + ${d*10} + ${u}`;
      return question('¿Cómo se descompone este número?',answer,[`${c*100} + ${u*10} + ${d}`,`${c*100} + ${d} + ${u}`,`${c*10} + ${d*10} + ${u}`,`${c*100} + ${d*10} + ${u+1}`,`${c*100+100} + ${d*10} + ${u}`],'La primera cifra indica centenas, la segunda decenas y la tercera unidades.',numberVisual(n),`${n} = ${answer}.`);
    }
    case 'graficos': {
      if(index%2) {
        const amount=rand(2,5), key=index===3?2:1;
        return numericQuestion('¿Cuántos libros leyó Leo?',amount*key,`Mira la clave: cada dibujo representa ${key} ${key===1?'libro':'libros'}.`,`<div class="pictogram"><span>Leo</span><b>${'📘'.repeat(amount)}</b></div><span class="chart-legend">Clave: 📘 = ${key} ${key===1?'libro':'libros'}</span>`,`Hay ${amount} dibujos. Cada uno vale ${key}: son ${amount*key} libros.`,key);
      }
      const values=shuffle([rand(1,2),3,4,5]), fruit=['manzana','plátano','pera','naranja'];
      if(index===0) return question('¿Qué fruta recibió más votos?',fruit[values.indexOf(5)],fruit,'Busca la barra más alta.',chart(values),`${['La manzana','El plátano','La pera','La naranja'][values.indexOf(5)]} recibió 5 votos: su barra es la más alta.`);
      const which=rand(0,3); return numericQuestion(`¿Cuántos votos recibió ${['la manzana','el plátano','la pera','la naranja'][which]}?`,values[which],'Busca la fruta y mira el número sobre su barra.',chart(values),`Recibió ${values[which]} votos.`,1);
    }
    case 'problemas': {
      const a=rand(2,5)*10+rand(4,9), b=rand(1,2)*10+rand(1,3);
      const stories=[
        [`Luna tiene ${a} láminas y recibe ${b} más. ¿Cuántas tiene ahora?`,a+b,'Recibe más láminas: necesitas sumar.','🎴'],
        [`Tomás tiene ${a} lápices y regala ${b}. ¿Cuántos le quedan?`,a-b,'Regala lápices: necesitas restar.','✏️'],
        [`Hay ${a} pájaros en un árbol y llegan ${b} más. ¿Cuántos hay en total?`,a+b,'Llegan más pájaros. Junta los dos grupos.','🐦'],
        [`En una caja hay ${a} manzanas. Se comen ${b}. ¿Cuántas quedan?`,a-b,'Se comen algunas manzanas. Quita esa cantidad.','🍎'],
        [`En el curso hay ${a} cuentos y traen ${b} nuevos. ¿Cuántos cuentos hay ahora?`,a+b,'Para saber el total, suma los cuentos que había y los nuevos.','📚']
      ];
      const [prompt,answer,hint,emoji]=stories[index%5];
      return numericQuestion(prompt,answer,hint,`<div style="font-size:55px" aria-hidden="true">${emoji}</div>`,`${a} ${index===1||index===3?'−':'+'} ${b} = ${answer}.`);
    }
    case 'medicion': {
      if(index===1||index===4) {const hour=rand(1,12);return question('¿Qué hora marca el reloj?',`${hour}:00`,[`${hour%12+1}:00`,`${(hour+4)%12+1}:00`,`${(hour+7)%12+1}:00`],'El minutero está en el 12: es una hora en punto. Mira adónde apunta la aguja corta.',clockVisual(hour),`${hour===1?'Es la 1':'Son las '+hour} en punto: ${hour}:00.`);}
      if(index===2) {const num=rand(2,5);return numericQuestion(`Hay ${num} botellas de 1 litro. ¿Cuántos litros hay en total?`,num,'Cada botella contiene 1 litro. Cuenta las botellas.',`<div style="font-size:40px" role="img" aria-label="${num} botellas">${'🧴'.repeat(num)}</div>`,`${num} botellas de 1 litro contienen ${num} litros.`,1);}
      const length=rand(2,9); return question('¿Cuánto mide la barra?',`${length} cm`,[`${length+1} cm`,`${length-1} cm`,`${length+2} cm`],'La barra empieza en 0. Mira el número donde termina.',rulerVisual(length),`Empieza en 0 y termina en ${length}: mide ${length} centímetros.`);
    }
    case 'geometria': {
      const flat=['triángulo','cuadrado','círculo','rectángulo'], bodies=['cubo','esfera','cilindro','cono'];
      if(index===2) return question('¿Qué figura tiene 3 lados?','triángulo',flat,'Cuenta los lados. Puedes dibujarlos con tu dedo.','', 'El triángulo tiene 3 lados y 3 vértices.');
      if(index===4) return question('¿Qué cuerpo se parece a una lata?','cilindro',bodies,'Una lata tiene dos bases circulares y una superficie curva.','<div style="font-size:60px" aria-hidden="true">🥫</div>','El cilindro tiene dos bases circulares.');
      const options=index%2?bodies:flat, chosen=pick(options);
      return question(index%2?'¿Cómo se llama este cuerpo?':'¿Cómo se llama esta figura?',chosen,options,'Mira su forma con calma. ¿Es plana o tiene volumen?',shape(chosen),`Es ${chosen==='esfera'?'una':'un'} ${chosen}.`);
    }
    case 'dinero': {
      if(index===4) {const price=pick([100,200,300,400]), paid=500;return question(`Un jugo cuesta $${price}. Pagas con $500. ¿Cuánto vuelto recibes?`,`$${paid-price}`,[`$${paid-price+100}`,`$${price+500}`,`$${paid-price-50}`],'Resta lo que cuesta el jugo al dinero con que pagaste.',coins([500]),`$500 − $${price} = $${paid-price} de vuelto.`);}
      const values=index===3?[1000,100,100]:[...Array(rand(1,3)).fill(100),...Array(rand(1,3)).fill(10),...(index%2?[50]:[])];
      const answer=values.reduce((a,b)=>a+b,0);
      return question('¿Cuántos pesos hay en total?',`$${answer.toLocaleString('es-CL')}`,[answer+10,answer+100,answer-10].map(v=>`$${v.toLocaleString('es-CL')}`),'Primero suma los valores más grandes. Después agrega las monedas pequeñas.',coins(shuffle(values)),`En total hay $${answer.toLocaleString('es-CL')}.`);
    }
    default: throw new Error('Tema desconocido: '+id);
  }
}

const heroArt = `<svg viewBox="0 0 320 280" fill="none" aria-hidden="true"><path d="M20 273C10 220 51 190 86 207 72 164 112 151 143 177 171 139 210 165 218 194 274 162 314 205 298 274" fill="#d1dfbc"/><circle cx="177" cy="128" r="91" fill="#f2d477"/><path d="M236 70 249 59M243 88 262 85M219 54 223 39" stroke="#bdc9a3" stroke-width="4" stroke-linecap="round"/><path d="m51 55 4 12 13 3-12 5-2 13-6-12-12-2 11-6Z" fill="#f0c85b"/><path d="m275 145 3 9 10 2-9 4-2 10-4-9-10-2 9-4Z" fill="#729578"/><circle cx="77" cy="134" r="4" fill="#ed9a78"/><circle cx="268" cy="201" r="4" fill="#ed9a78"/><g transform="rotate(-8 170 170)"><path d="M112 208C96 228 95 259 103 279H228C235 244 220 219 210 207" fill="#e99972" stroke="#496951" stroke-width="3"/><path d="M113 190C94 183 85 154 92 139 72 100 100 76 124 89 148 72 192 74 215 93 245 81 262 112 240 139 249 166 233 193 210 201 180 220 135 216 113 190Z" fill="#faf1d5" stroke="#496951" stroke-width="3"/><path d="m101 116 5-15 17 7M215 110l17-5 2 17" fill="#edb6a0"/><ellipse cx="126" cy="159" rx="6" ry="8" fill="#38523f"/><ellipse cx="202" cy="159" rx="6" ry="8" fill="#38523f"/><ellipse cx="111" cy="177" rx="12" ry="7" fill="#eab39b"/><ellipse cx="215" cy="177" rx="12" ry="7" fill="#eab39b"/><path d="m157 174 9 1-4 5Z" fill="#496951"/><path d="M162 180v5m-12-1q12 15 24 0" stroke="#496951" stroke-width="3" stroke-linecap="round"/><path d="M132 216 155 240 181 215" fill="#f7dc85" stroke="#496951" stroke-width="3"/><path d="M90 238 164 248 232 226 233 270 162 290 87 279Z" fill="#4e8671" stroke="#315943" stroke-width="3"/><path d="m164 248-2 42M106 250l37 5m-36 7 36 5m34-15 38-12m-38 24 38-12" stroke="#abc6a5" stroke-width="2"/><ellipse cx="98" cy="251" rx="15" ry="11" fill="#faf1d5" stroke="#496951" stroke-width="3" transform="rotate(18 98 251)"/><ellipse cx="225" cy="246" rx="13" ry="11" fill="#faf1d5" stroke="#496951" stroke-width="3" transform="rotate(-18 225 246)"/></g><g transform="rotate(13 66 196)"><rect x="29" y="174" width="54" height="48" rx="9" fill="#fffbec" stroke="#8caa83" stroke-width="2"/><text x="56" y="207" text-anchor="middle" fill="#77976b" font-family="Arial" font-size="29" font-weight="bold">3</text></g><g transform="rotate(-10 258 110)"><rect x="242" y="91" width="43" height="43" rx="9" fill="#fffbed" stroke="#d5ad58" stroke-width="2"/><text x="263" y="122" text-anchor="middle" fill="#c4994e" font-family="Arial" font-size="30">+</text></g></svg>`;

let activeFilter='todos';
let session=null;
function save() { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(progress)); } catch { if(storageAvailable) toast('Tu navegador no permite guardar el avance. Puedes seguir jugando.'); storageAvailable=false; } }
function completedCount() { return topics.filter(t=>progress.lessons[t.id]?.completed).length; }
function totalStars() { return topics.reduce((sum,t)=>sum+(progress.lessons[t.id]?.stars||0),0); }
function updateHeader() { $('#total-stars').textContent=totalStars(); const button=$('#sound-toggle'); button.setAttribute('aria-pressed',String(progress.sound)); button.setAttribute('aria-label',progress.sound?'Desactivar sonidos':'Activar sonidos'); button.innerHTML=`♫ <span>Sonido ${progress.sound?'activado':'apagado'}</span>`; }
function icon(t) { return `<span class="topic-icon" style="--tint:${t.tint};--accent:${t.color};${t.id==='posicion'?'font-size:14px;letter-spacing:1px':''}">${t.icon}</span>`; }
function stars(count) { return '★'.repeat(count)+'☆'.repeat(3-count); }
function topicCards() {
  const filtered=topics.filter(t=>activeFilter==='todos'||(activeFilter==='pendientes'?!progress.lessons[t.id]?.completed:t.group===activeFilter));
  return filtered.length?filtered.map(t=>`<button class="topic-card" data-topic="${t.id}" style="--tint:${t.tint};--accent:${t.color}" aria-label="${t.short}${progress.lessons[t.id]?`, ${progress.lessons[t.id].stars} estrellas`:''}"><div class="card-top">${icon(t)}<span class="topic-number">${String(topics.indexOf(t)+1).padStart(2,'0')}</span></div><h3>${t.short}</h3><p>${t.desc}</p><div class="card-bottom">${progress.lessons[t.id]?`<span class="card-stars" aria-label="${progress.lessons[t.id].stars} de 3 estrellas">${stars(progress.lessons[t.id].stars)}</span>`:'<small>5 desafíos · a tu ritmo</small>'}<span class="card-arrow" aria-hidden="true">↗</span></div></button>`).join(''):'<p class="empty-filter">¡Completaste todas las misiones! Puedes volver a jugar para ganar más estrellas.</p>';
}
function controlBanner() {
  return `<section class="control-banner" aria-labelledby="control-banner-title"><span class="control-banner-icon" aria-hidden="true">✎</span><div><span class="eyebrow">PREPÁRATE CON CONFIANZA</span><h2 id="control-banner-title">Un control, muchos pequeños pasos</h2><p>Sustracciones sin canje hasta 999 · <time datetime="2026-10-29">Jueves 29 de octubre</time></p></div><a class="primary" href="#control-restas">Preparar mi control →</a></section>`;
}
function renderSubjects() {
  session=null;
  main.innerHTML=`<div class="greeting"><div><h1>¡Hola, explorador! <span aria-hidden="true">☀️</span></h1><p>Un mundo de cosas por descubrir, a tu ritmo.</p></div><span class="date-pill">2.º básico · Aquí crece tu curiosidad</span></div><section class="hero"><div class="hero-copy"><span class="eyebrow">PEQUEÑOS PASOS, GRANDES DESCUBRIMIENTOS</span><h2>Aprender es<br>una <span>aventura.</span></h2><p>Elige una asignatura y descubre todo lo que puedes aprender jugando.</p><a class="primary" href="#matematicas">Explorar Matemáticas →</a></div><div class="hero-art">${heroArt}</div></section><section class="subjects-section" aria-labelledby="subjects-title"><div class="section-heading"><div><h2 id="subjects-title">Mis asignaturas</h2><p>Comenzamos con números. ¡Pronto habrá más aventuras!</p></div><span class="count-pill">2.º básico</span></div><div class="subject-grid"><a class="subject-card available" href="#matematicas"><span class="subject-emoji" aria-hidden="true">🔢</span><span class="subject-status">● Disponible</span><h3>Matemáticas</h3><p>Números, formas y pequeños grandes desafíos.</p><span class="subject-bottom">${completedCount()} de 12 misiones completadas <b aria-hidden="true">→</b></span></a>${[['📖','Lenguaje','Letras, palabras e historias por descubrir.'],['🌎','Historia','Personas, lugares y aventuras del pasado.'],['🌱','Ciencias','Preguntas y descubrimientos sobre nuestro mundo.']].map(([emoji,title,desc])=>`<article class="subject-card coming-soon" aria-label="${title}, próximamente"><span class="subject-emoji" aria-hidden="true">${emoji}</span><span class="subject-status">Próximamente</span><h3>${title}</h3><p>${desc}</p><span class="subject-bottom">Una nueva aventura está en camino <span aria-hidden="true">✦</span></span></article>`).join('')}</div></section>${controlBanner()}<p class="saved-note">Tus estrellas y misiones de Matemáticas siguen aquí. ¡Continúa donde lo dejaste!</p>`;
}
function renderHome(explore=false) {
  session=null;
  const done=completedCount(), next=topics.find(t=>!progress.lessons[t.id]?.completed)||topics[0];
  main.innerHTML=`${!explore?`<div class="greeting"><div><h1>¡Hola, explorador! <span aria-hidden="true">☀️</span></h1><p>Hoy es un buen día para descubrir algo nuevo.</p></div><span class="date-pill">✦ Tu próxima aventura comienza aquí</span></div><section class="hero" aria-label="Bienvenida"><div class="hero-copy"><span class="eyebrow">PEQUEÑOS PASOS, GRANDES DESCUBRIMIENTOS</span><h2>Las matemáticas<br>son una <span>aventura.</span></h2><p>Juega con los números, resuelve misterios<br>y aprende a tu propio ritmo.</p><button class="primary" data-topic="${next.id}">${done?'Seguir mi aventura':'¡Comenzar a explorar!'} <span>→</span></button></div><div class="hero-art">${heroArt}</div><span class="hero-caption">¡Vamos a descubrir juntos!</span></section><div class="progress-strip"><div class="progress-label"><span class="progress-emoji">🌱</span><div><strong>${done===12?'¡Tu aventura floreció!':'Tu aventura va creciendo'}</strong><small>${done} de 12 misiones completadas</small></div></div><div class="track" role="progressbar" aria-label="Misiones completadas" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="12"><span style="width:${done/12*100}%"></span></div><span class="progress-meta">${done===0?'¡Todo empieza con un primer paso!':`${totalStars()} estrellas de 36 posibles`}</span></div>`:''}<section aria-labelledby="topics-title"><div class="section-heading"><div><h2 id="topics-title">${explore?'Tu mapa de descubrimientos':'¿Qué descubrimos hoy?'}</h2><p>Elige una misión. ¡Puedes empezar por la que más te guste!</p></div><span class="count-pill">12 misiones</span></div><div class="filter-row" role="group" aria-label="Filtrar temas">${[['todos','Todos'],['numeros','Números'],['calculo','A calcular'],['mundo','Mi mundo'],['pendientes','Por descubrir']].map(([id,label])=>`<button class="filter ${activeFilter===id?'selected':''}" data-filter="${id}" aria-pressed="${activeFilter===id}">${label}</button>`).join('')}</div><div class="topic-grid">${topicCards()}</div></section><section class="challenge-banner"><span aria-hidden="true">🎒</span><div><h3>¿Te animas a una misión sorpresa?</h3><p>Un poquito de cada tema. ¡Descubre todo lo que sabes!</p></div><button id="mixed-challenge">¡Acepto el desafío! ↗</button></section>`;
  main.insertAdjacentHTML('afterbegin',`<a class="back-button" href="#inicio">← Mis asignaturas</a><div class="subject-page-title"><span class="eyebrow">MI ASIGNATURA</span><h1>Matemáticas</h1></div>${controlBanner()}`);
}
function example(t) {
  switch(t.example) { case 'blocks':return blocks(132);case 'chart':return chart();case 'shapes':return `<div style="display:flex;justify-content:center;gap:15px;flex-wrap:wrap">${shape('triángulo')}${shape('cubo')}</div>`;case 'coins':return coins([100,10,10]);case 'measure':return rulerVisual(6);default:return `<div class="equation">${escapeHTML(t.example)}</div>`; }
}
function renderLesson(id) {
  const t=topics.find(t=>t.id===id);
  if(!t) { location.hash='inicio'; return; }
  session=null;
  main.innerHTML=`<a class="back-button" href="#temas">← Volver a las misiones</a><div class="lesson-heading">${icon(t)}<div><h1>${t.title}</h1><p>Misión ${topics.indexOf(t)+1} de 12 · ${t.short}</p></div></div><section class="lesson-panel"><div class="lesson-tabs"><span class="current">01 · Aprende</span><span>02 · Juega</span><span>03 · Celebra</span></div><span class="eyebrow">ANTES DE COMENZAR</span><h2>Una pequeña pista para un gran desafío</h2><p class="lesson-intro">${t.intro}</p><div class="example-box">${example(t)}<p>${t.note}</p></div><div class="lesson-actions"><button class="secondary" id="read-lesson">♫ Escuchar explicación</button><button class="primary" id="start-lesson">¡Vamos a practicar! →</button></div></section><p class="saved-note">Sin cronómetro. Sin apuro. Puedes intentarlo todas las veces que quieras.</p>`;
  $('#read-lesson').onclick=()=>speak(`${t.title}. ${t.intro} ${t.note}`);
  $('#start-lesson').onclick=()=>startSession(id);
}
function startSession(id) {
  const mixed=id==='sorpresa', selected=mixed?shuffle(topics).slice(0,5):Array(5).fill(topics.find(t=>t.id===id));
  session={id,index:0,firstCorrect:0,attempts:0,solved:false,questions:selected.map((t,i)=>({...generate(t.id,i),topicId:t.id})),retry:false};
  renderQuestion();
}
function renderQuestion() {
  const s=session, q=s.questions[s.index], t=topics.find(t=>t.id===q.topicId);
  s.attempts=0;s.solved=false;
  main.innerHTML=`<a class="back-button" href="#temas">← Volver a las misiones</a><div class="lesson-heading">${icon(t)}<div><h1>${s.id==='sorpresa'?'Misión sorpresa':t.title}</h1><p>${s.id==='sorpresa'?t.short:'Paso a paso, tú puedes.'}</p></div></div><section class="lesson-panel"><div class="question-top"><span>DESAFÍO ${s.index+1} DE 5</span><span>✦ ${s.index===0?'¡Vamos a empezar!':s.index<4?'¡Vas muy bien!':'¡Último desafío!'}</span></div><div class="exercise-track" role="progressbar" aria-label="Desafíos completados" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${s.index}">${Array.from({length:5},(_,i)=>`<span class="${i<s.index?'done':i===s.index?'now':''}"></span>`).join('')}</div><h2 class="question-title" id="question-title">${escapeHTML(q.prompt)}</h2>${q.visual?`<div class="question-visual">${q.visual}</div>`:''}<div class="answer-grid" role="group" aria-labelledby="question-title">${q.options.map((opt,i)=>`<button class="answer-option" data-answer="${i}">${escapeHTML(opt)}</button>`).join('')}</div><div class="feedback" role="status" aria-live="polite"></div><div id="hint-box"></div><div class="lesson-actions"><button class="secondary" id="hint-button">☀ Una pista</button><button class="secondary" id="read-question" aria-label="Escuchar pregunta">♫ Escuchar</button><button class="primary next-button" id="next-question" hidden>${s.index===4?'Ver mi logro ✦':'Siguiente →'}</button></div></section>`;
  $('#hint-button').onclick=()=>{ $('#hint-box').innerHTML=`<div class="hint">💡 ${escapeHTML(q.hint)}</div>`; $('#hint-button').disabled=true; };
  $('#read-question').onclick=()=>speak(q.prompt);
  $('#next-question').onclick=()=>{ if(!s.solved)return; s.index++; if(s.index===5)finishSession();else{renderQuestion();focusMain();} };
}
function answerQuestion(optionIndex) {
  const s=session;if(!s||s.solved)return;
  const q=s.questions[s.index], chosen=q.options[optionIndex], button=$(`[data-answer="${optionIndex}"]`);
  if(!button||button.disabled)return;
  s.attempts++;
  if(chosen===q.answer) {
    s.solved=true;if(s.attempts===1)s.firstCorrect++;
    button.classList.add('correct');button.setAttribute('aria-label',chosen+', respuesta correcta');
    document.querySelectorAll('[data-answer]').forEach(b=>b.disabled=true);
    $('.feedback').className='feedback success';
    $('.feedback').textContent=`¡Lo lograste! ${q.explanation}`;
    $('#next-question').hidden=false;
    playTone(true);
  } else {
    button.classList.add('wrong');button.disabled=true;button.setAttribute('aria-label',chosen+', intenta otra respuesta');
    $('.feedback').className='feedback retry';
    $('.feedback').textContent='Todavía no. Mira con calma y vuelve a intentarlo. ¡La pista puede ayudarte!';
    playTone(false);
  }
}
function finishSession() {
  const s=session, earned=s.firstCorrect>=4?3:s.firstCorrect>=2?2:1;
  if(s.id==='sorpresa')progress.challenges++;
  else progress.lessons[s.id]={stars:Math.max(earned,progress.lessons[s.id]?.stars||0),completed:true};
  save();updateHeader();
  const next=topics.find(t=>!progress.lessons[t.id]?.completed&&t.id!==s.id);
  main.innerHTML=`<section class="lesson-panel result"><span class="eyebrow">CADA INTENTO TE HACE CRECER</span><span class="result-medal" aria-hidden="true">${earned===3?'🏆':'🌟'}</span><h1>¡Misión cumplida, explorador!</h1><div class="result-stars" aria-label="${earned} de 3 estrellas en esta partida">${stars(earned)}</div><p>Resolviste los cinco desafíos. ${earned===3?'¡Los números y tú hacen un gran equipo!':'Tu esfuerzo cuenta muchísimo. Puedes volver a jugar y seguir descubriendo.'}</p><div class="result-stats"><div><strong>5 de 5</strong><small>desafíos resueltos</small></div><div><strong>${s.firstCorrect} de 5</strong><small>al primer intento</small></div></div><div class="result-actions"><button class="secondary" id="play-again">↻ Volver a jugar</button>${next?`<button class="primary" data-topic="${next.id}">Otra aventura →</button>`:'<a class="primary" href="#logros">Ver mis logros →</a>'}</div><p class="saved-note">${storageAvailable?'Guardamos tu mejor resultado en este navegador.':'El guardado no está disponible en este navegador.'}<br>3 estrellas: 4–5 aciertos al primer intento · 2: 2–3 · 1: 0–1</p><a class="back-button" style="margin:22px 0 0" href="#temas">Volver al mapa de misiones</a></section>`;
  $('#play-again').onclick=()=>startSession(s.id);
  confetti();focusMain();
}
function renderAchievements() {
  session=null;
  const done=completedCount(), total=totalStars();
  const badges=[['🌱','El primer brote','Completa tu primera misión.',done>=1],['🧭','Explorador curioso','Completa 3 misiones diferentes.',done>=3],['🌳','Cada vez más grande','Completa 6 misiones diferentes.',done>=6],['🌈','Un mundo de números','Completa las 12 misiones.',done===12],['✨','Coleccionista de estrellas','Consigue 18 estrellas en tus misiones.',total>=18],['🎒','Espíritu aventurero','Completa una misión sorpresa.',progress.challenges>0]];
  main.innerHTML=`<div class="achievements-intro"><span class="eyebrow">MIRA TODO LO QUE HAS CRECIDO</span><h1>Tus pequeños grandes logros</h1><p>Cada descubrimiento merece celebrarse. ¡Sigue a tu ritmo!</p></div><div class="progress-strip"><div class="progress-label"><span class="progress-emoji">⭐</span><div><strong>${total} estrellas ganadas</strong><small>${done} de 12 misiones completadas</small></div></div><div class="track"><span style="width:${total/36*100}%"></span></div><span class="progress-meta">36 estrellas por descubrir</span></div><div class="badge-grid">${badges.map(([emoji,title,desc,unlocked])=>`<article class="badge ${unlocked?'':'locked'}"><span aria-hidden="true">${emoji}</span><h3>${title}</h3><p>${desc}</p><p style="margin-top:15px;font-weight:700;color:var(--green)">${unlocked?'✓ ¡Lo conseguiste!':'Por descubrir'}</p></article>`).join('')}</div><p class="saved-note">El progreso pertenece a este navegador. No necesitas registrarte.</p>`;
}
function route() {
  if('speechSynthesis' in window)window.speechSynthesis.cancel();
  const hash=location.hash.slice(1)||'inicio';
  if(hash==='main'){focusMain();return;}
  const nav=hash.startsWith('control-restas')?'control-restas':hash.startsWith('mision/')||['sorpresa','temas','matematicas'].includes(hash)?'matematicas':hash;
  document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===nav));
  $('.breadcrumb').textContent=nav==='matematicas'?'MIS ASIGNATURAS / MATEMÁTICAS':nav==='control-restas'?'MATEMÁTICAS / PREPARAR MI CONTROL':'MI PEQUEÑO GRAN MUNDO DE APRENDIZAJE';
  if(hash==='inicio')renderSubjects();
  else if(hash==='matematicas')renderHome(true);
  else if(hash==='temas')renderHome(true);
  else if(hash==='control-restas')renderControlHome();
  else if(hash==='control-restas/practica')startControl('practica');
  else if(hash==='control-restas/ensayo')startControl('ensayo');
  else if(hash==='logros')renderAchievements();
  else if(hash==='sorpresa')startSession('sorpresa');
  else if(hash.startsWith('mision/'))renderLesson(hash.split('/')[1]);
  else {location.hash='inicio';return;}
  updateHeader();window.scrollTo({top:0,behavior:'instant'});
}
function focusMain() { main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'}); }
let toastTimer;
function toast(message) { clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4000); }
function speak(text) {
  if(!('speechSynthesis' in window)){toast('Este navegador no tiene lectura en voz alta. Puedes leer con un acompañante.');return;}
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);utterance.lang='es-CL';utterance.rate=.85;
  const voices=window.speechSynthesis.getVoices();
  const spanish=voices.find(v=>v.lang==='es-CL')||voices.find(v=>v.lang.startsWith('es'));
  if(spanish)utterance.voice=spanish;
  utterance.onerror=e=>{if(e.error!=='interrupted'&&e.error!=='canceled')toast('No se pudo reproducir la voz. Inténtalo de nuevo o lee con un acompañante.');};
  window.speechSynthesis.speak(utterance);
}
let audioContext;
function playTone(success) {
  if(!progress.sound)return;
  try {
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
    audioContext??=new Audio(); if(audioContext.state==='suspended')audioContext.resume();
    const oscillator=audioContext.createOscillator(), gain=audioContext.createGain();oscillator.connect(gain);gain.connect(audioContext.destination);
    oscillator.type='sine';oscillator.frequency.setValueAtTime(success?523:280,audioContext.currentTime);oscillator.frequency.setValueAtTime(success?659:250,audioContext.currentTime+.12);
    gain.gain.setValueAtTime(.08,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.3);oscillator.start();oscillator.stop(audioContext.currentTime+.3);
  }catch { /* El sonido es opcional; los ejercicios siguen funcionando. */ }
}
function confetti() {
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  for(let i=0;i<32;i++){const p=document.createElement('span');p.className='confetti';p.style.left=rand(5,95)+'%';p.style.background=pick(['#f5ca65','#8fb186','#e99b80','#aaa0c1']);p.style.animationDelay=Math.random()*.5+'s';p.style.rotate=rand(0,180)+'deg';document.body.append(p);setTimeout(()=>p.remove(),3400);}
}
main.addEventListener('click',event=>{
  const topic=event.target.closest('[data-topic]');if(topic){location.hash='mision/'+topic.dataset.topic;return;}
  const filter=event.target.closest('[data-filter]');if(filter){activeFilter=filter.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('selected',b===filter);b.setAttribute('aria-pressed',String(b===filter));});$('.topic-grid').innerHTML=topicCards();return;}
  const answer=event.target.closest('[data-answer]');if(answer){answerQuestion(Number(answer.dataset.answer));return;}
  if(event.target.closest('#mixed-challenge'))location.hash='sorpresa';
});
$('#sound-toggle').onclick=()=>{progress.sound=!progress.sound;save();updateHeader();if(progress.sound)playTone(true);};
const help=$('#help-dialog');$('#adult-help').onclick=()=>help.showModal();$('#header-help').onclick=()=>help.showModal();$('.dialog-close').onclick=()=>help.close();$('.dialog-done').onclick=()=>help.close();
window.addEventListener('hashchange',()=>{route();focusMain();});
route();
