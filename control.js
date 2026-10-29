'use strict';

// Las funciones de esta sección se llaman cuando app.js termina de iniciar.
let controlSession=null;

function makeSubtraction(index,mode='practica',allowZero=false) {
  const between=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
  const level=mode==='ensayo'?(index<3?0:index<6?1:2):Math.floor(index/5);
  const top=level===0?[0,between(2,9),between(2,9)]:level===1?[between(1,5),between(0,9),between(1,9)]:[between(6,9),between(0,9),between(0,9)];
  if(level===2&&index%5===1)top[2]=0;
  if(level===2&&index%5===2)top[1]=0;
  if(index===(mode==='ensayo'?9:14))top.fill(9);
  const bottom=top.map(digit=>between(0,digit));
  if(level===0&&index<2){bottom[0]=0;bottom[1]=0;bottom[2]=between(1,top[2]);}
  else if(level===0)bottom[1]=between(1,top[1]);
  else bottom[0]=between(1,top[0]);
  if(allowZero)bottom.splice(0,3,...top);
  else if(top.every((digit,i)=>digit===bottom[i])) {
    // Baja una cifra del sustraendo: conserva el no canje y evita a − a.
    const place=bottom.findLastIndex(digit=>digit>0);
    bottom[place]--;
  }
  const a=top[0]*100+top[1]*10+top[2], b=bottom[0]*100+bottom[1]*10+bottom[2];
  return {a,b,answer:a-b,level};
}

function makeControlQuestions(mode) {
  const count=mode==='ensayo'?10:15, questions=[], used=new Set();
  // El caso a − a solo aparece en una de cada cuatro rondas, como máximo una vez.
  const zeroIndex=Math.random()<.25?4:-1;
  for(let i=0;i<count;i++) {
    let q;
    for(let tries=0;tries<40;tries++) {
      q=makeSubtraction(i,mode,i===zeroIndex);
      if(!used.has(`${q.a}-${q.b}`))break;
    }
    if(used.has(`${q.a}-${q.b}`)) {
      // Mantén el nivel incluso si el generador aleatorio repite el mismo valor.
      const min=q.level===0?22:q.level===1?101:600, max=q.level===0?99:q.level===1?599:999;
      const minBottom=q.level===0?(i<2?1:10):100;
      let found=false;
      for(let offset=0;offset<=max-min&&!found;offset++) {
        const a=min+(q.a-min+offset)%(max-min+1);
        for(let b=minBottom;b<a&&(q.level!==0||i>=2||b<10);b++) {
          const noExchange=[1,10,100].every(place=>Math.floor(a/place)%10>=Math.floor(b/place)%10);
          if(noExchange&&!used.has(`${a}-${b}`)){q={a,b,answer:a-b,level:q.level};found=true;break;}
        }
      }
    }
    used.add(`${q.a}-${q.b}`);questions.push(q);
  }
  return questions;
}

function controlBoard(q,result='?',activeColumn=-1) {
  const digits=n=>String(n).padStart(3,' ').split('').map((d,i)=>`<span${activeColumn>=0&&i===2-activeColumn?' class="guided-active"':''}>${d===' '?'&nbsp;':d}</span>`).join('');
  return `<div class="subtraction-board" role="img" aria-label="${q.a} menos ${q.b}${result==='?'?', resultado por descubrir':', resultado '+result}"><div class="board-head"><span></span><span>C</span><span>D</span><span>U</span></div><div class="board-row"><span></span>${digits(q.a)}</div><div class="board-row"><span class="minus">−</span>${digits(q.b)}</div><div class="board-result"><span></span>${result==='?'?'<span class="result-placeholder">?</span>':digits(result)}</div></div>`;
}

function subtractionSteps(q) {
  return [1,10,100].map((place,i)=>{
    const a=Math.floor(q.a/place)%10, b=Math.floor(q.b/place)%10;
    return `<li><b>${['Unidades','Decenas','Centenas'][i]}:</b> del ${b} al ${a} faltan ${a-b}.</li>`;
  }).join('');
}

function guidedColumn(q,column) {
  const place=[1,10,100][column];
  return {name:['unidades','decenas','centenas'][column],bottom:Math.floor(q.b/place)%10,top:Math.floor(q.a/place)%10,answer:Math.floor(q.answer/place)%10};
}

function renderGuidedResolution(q,column=0,collected=[]) {
  const s=controlSession;
  if(!s||s.mode!=='practica'||s.solved[s.index])return;
  const exercise=s.index, step=guidedColumn(q,column);
  s.guided[exercise]=true;
  $('.question-visual').innerHTML=controlBoard(q,'?',column);
  $('#control-hint').innerHTML=`<section class="guided-resolution" aria-labelledby="guided-title"><span class="eyebrow">RESOLUCIÓN GUIADA · PASO ${column+1} DE 3</span><h3 id="guided-title">${['Primero, las unidades','Seguimos con las decenas','Terminamos con las centenas'][column]}</h3><p class="guided-method">${column===0?'Revisamos las columnas: arriba hay la misma cantidad o más que abajo. Podemos resolver sin canjear. Empezamos por las unidades y contamos desde abajo hacia arriba.':`¡Muy bien! Encontraste ${collected[column-1]} ${column===1?'unidades':'decenas'}. Ahora seguimos con las ${step.name}.`}${column===2&&q.a<100?' No hay centenas en estos números: usamos 0 en esa columna.':''}</p><div class="guided-count"><span><small>ABAJO · PARTIMOS EN</small><b>${step.bottom}</b></span><span class="guided-up" aria-hidden="true">↑</span><span><small>ARRIBA · LLEGAMOS A</small><b>${step.top}</b></span></div><p class="guided-question">¿Cuánto falta para llegar del <strong>${step.bottom}</strong> al <strong>${step.top}</strong>?</p><label for="guided-answer">¿Cuántas ${step.name} faltan?</label><div class="guided-input-row"><input id="guided-answer" inputmode="numeric" type="text" maxlength="1" autocomplete="off" aria-describedby="guided-feedback"><button type="button" class="primary" id="check-guided">Continuar →</button></div><div id="guided-feedback" class="feedback" role="status" aria-live="polite"></div><button type="button" class="text-button" id="read-guided">♫ Escuchar este paso</button></section>`;
  $('#read-guided').onclick=()=>speak(`${column===0?'Primero las unidades.':`Ahora las ${step.name}.`} Partimos en el número de abajo, ${step.bottom}, y llegamos al de arriba, ${step.top}. ¿Cuánto falta para llegar del ${step.bottom} al ${step.top}? Escribe cuántas ${step.name} faltan.`);
  $('#check-guided').onclick=()=>{
    if(controlSession!==s||s.index!==exercise||s.solved[exercise])return;
    const raw=$('#guided-answer').value.trim();
    if(!/^\d$/.test(raw)) {$('#guided-feedback').textContent='Escribe una cifra del 0 al 9.';$('#guided-answer').focus();return;}
    if(Number(raw)!==step.answer) {
      $('#guided-feedback').className='feedback retry';
      $('#guided-feedback').textContent=`Todavía no. Empieza en ${step.bottom} y cuenta los pasos hasta ${step.top}. ${step.bottom===step.top?'¿Ya estás en el número al que quieres llegar?':'Puedes contar con tus dedos.'}`;
      return;
    }
    const answers=[...collected,Number(raw)];playTone(true);
    if(column<2){renderGuidedResolution(q,column+1,answers);return;}
    $('.question-visual').innerHTML=controlBoard(q);
    $('#control-hint').innerHTML=`<section class="guided-resolution"><span class="eyebrow">¡ENCONTRASTE LAS TRES CIFRAS!</span><h3>Ahora reunimos el resultado</h3><p>Al resolver fuimos de U a D y C. Para escribir el número, ordenamos sus cifras de <strong>C a D y U</strong>.</p><div class="guided-digits">${[2,1,0].map(i=>`<div><small>${['U','D','C'][i]}</small><b>${answers[i]}</b></div>`).join('')}</div><p>Escribe el número completo en «Escribe tu resultado» y comprueba tu respuesta.</p></section>`;
    $('#subtraction-answer').focus();
  };
  $('#guided-answer').onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();$('#check-guided').click();}};
  $('#guided-answer').focus();
}

function renderControlHome() {
  session=null;controlSession=null;
  main.innerHTML=`<a class="back-button" href="#matematicas">← Volver a Matemáticas</a><section class="control-intro"><span class="eyebrow">MATEMÁTICAS · 2.º BÁSICO</span><h1>¡Me preparo para mi control!</h1><p>Restar paso a paso, con calma y confianza.</p><div class="control-details"><span>✎ Sustracciones sin canje hasta 999</span><time datetime="2026-10-29">29 de octubre de 2026</time></div><p class="control-notice">Según el aviso del curso: control del jueves 29 de octubre, con nota acumulativa.</p></section><section class="lesson-panel control-learn" aria-labelledby="restar-title"><span class="eyebrow">PRIMERO, RECORDEMOS</span><h2 id="restar-title">Cada cifra en su lugar</h2><p class="lesson-intro">Restar es quitar o encontrar cuánto queda. Ordena los números en C, D y U. Empieza por las <strong>unidades</strong>, sigue con las <strong>decenas</strong> y termina con las <strong>centenas</strong>.</p><div class="control-example">${controlBoard({a:786,b:243},543)}<div><h3>786 − 243 = 543</h3><ol class="column-steps">${subtractionSteps({a:786,b:243})}</ol><p>En cada columna, la cifra de arriba es mayor o igual que la de abajo. Por eso podemos restar <strong>sin canjear</strong>.</p></div></div><button class="secondary" id="read-control">♫ Escuchar explicación</button></section><section class="control-modes" aria-label="Formas de preparar el control"><article><span aria-hidden="true">🌱</span><h2>Practico con ayuda</h2><p>15 restas en tres tramos: dos cifras, centenas y desafíos hasta 999. Tienes pistas, resolución guiada y nuevos intentos.</p><a class="primary" href="#control-restas/practica">Practicar paso a paso →</a></article><article><span aria-hidden="true">🎒</span><h2>Mi ensayo del control</h2><p>10 restas sin pistas. Revisa y cambia tus respuestas antes de terminar. Al final, las revisamos juntos.</p><a class="primary" href="#control-restas/ensayo">Comenzar mi ensayo →</a></article></section><div class="control-history"><span>Prácticas completadas: <b>${progress.control.practices}</b></span><span>Ensayos completados: <b>${progress.control.exams}</b></span><span>Mejor ensayo: <b>${progress.control.exams?progress.control.best+' de 10':'¡Por descubrir!'}</b></span></div><p class="saved-note">Sin cronómetro. Los resultados son para aprender y no son una nota del colegio.<br>Tu progreso de esta sección se guarda aparte de las 12 misiones.</p>`;
  $('#read-control').onclick=()=>speak('Sustracciones sin canje hasta 999. Ordena los números en centenas, decenas y unidades. Empieza por las unidades. En 786 menos 243: Del 3 al 6 faltan 3 unidades. Del 4 al 8 faltan 4 decenas. Del 2 al 7 faltan 5 centenas. El resultado es 543. En cada columna, la cifra de arriba es mayor o igual que la de abajo. Por eso restamos sin canjear.');
}

function startControl(mode) {
  session=null;
  const questions=makeControlQuestions(mode),count=questions.length;
  controlSession={mode,questions,index:0,answers:Array(count).fill(null),attempts:Array(count).fill(0),solved:Array(count).fill(false),guided:Array(count).fill(false)};
  renderControlQuestion();
}

function readControlAnswer() {
  const input=$('#subtraction-answer'), raw=input.value.trim();
  if(!/^\d{1,3}$/.test(raw)) {
    $('#control-feedback').className='feedback retry';
    $('#control-feedback').textContent='Escribe un número entero del 0 al 999, sin puntos ni signos.';
    input.setAttribute('aria-invalid','true');input.focus();return null;
  }
  input.removeAttribute('aria-invalid');
  return Number(raw);
}

function renderControlQuestion() {
  const s=controlSession,q=s.questions[s.index],exam=s.mode==='ensayo',total=s.questions.length;
  main.innerHTML=`<a class="back-button" href="#control-restas">← Volver a preparar mi control</a><div class="lesson-heading"><span class="topic-icon" style="--tint:#fbefd7;--accent:#9b783e">−</span><div><h1>${exam?'Mi ensayo del control':'Practico paso a paso'}</h1><p>Sustracciones sin canje hasta 999</p></div></div><section class="lesson-panel control-question"><div class="question-top"><span>RESTA ${s.index+1} DE ${total}</span><span>${exam?'Sin apuro, confía en ti.':'¡Cada intento cuenta!'}</span></div><div class="exercise-track" role="progressbar" aria-label="Restas respondidas" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${s.answers.filter(a=>a!==null).length}">${s.questions.map((_,i)=>`<span class="${i===s.index?'now':s.answers[i]!==null?'done':''}"></span>`).join('')}</div><h2 class="question-title">¿Cuánto es ${q.a} − ${q.b}?</h2><div class="question-visual">${controlBoard(q)}</div><form id="subtraction-form" novalidate><label for="subtraction-answer">Escribe tu resultado</label><div class="written-answer"><input id="subtraction-answer" type="text" inputmode="numeric" pattern="[0-9]{1,3}" maxlength="3" autocomplete="off" aria-describedby="answer-instructions control-feedback" value="${s.answers[s.index]===null?'':s.answers[s.index]}" ${!exam&&s.solved[s.index]?'disabled':''}><span id="answer-instructions">Un número del 0 al 999</span></div><div id="control-feedback" class="feedback" role="status" aria-live="polite"></div><div id="control-hint"></div><div class="lesson-actions">${exam?`<button type="button" class="secondary" id="previous-subtraction" ${s.index===0?'hidden':''}>← Anterior</button>`:'<button type="button" class="secondary" id="subtraction-hint">☀ Una pista</button><button type="button" class="secondary" id="read-subtraction">♫ Escuchar</button>'}<button class="primary next-button" id="check-subtraction" ${!exam&&s.solved[s.index]?'hidden':''}>${exam?(s.index===total-1?'Terminar y revisar →':'Guardar y continuar →'):'Comprobar mi respuesta'}</button>${!exam?'<button type="button" class="primary next-button" id="next-subtraction" hidden>Siguiente →</button>':''}</div></form>${exam?'<p class="saved-note">Tus respuestas se revisan al terminar. Usa «Anterior» si quieres cambiar alguna.</p>':''}</section>`;
  if(!exam) {
    const stageNames=['Calentamos con dos cifras','¡Vamos con las centenas!','Desafíos hasta 999'];
    const stageDescriptions=['Empezamos restando una cifra y seguimos con dos.','Ahora restamos números de tres cifras, hasta 599.','Números de 600 a 999 y ceros en algunas columnas.'];
    $('.question-title').insertAdjacentHTML('beforebegin',`<div class="practice-level"><span>TRAMO ${q.level+1} DE 3 · PREGUNTAS ${q.level*5+1}–${q.level*5+5}</span><h3>${stageNames[q.level]}</h3><p>${stageDescriptions[q.level]}</p></div>`);
    $('#subtraction-hint').insertAdjacentHTML('afterend','<button type="button" class="secondary" id="guided-button">✎ Resolver paso a paso</button>');
    $('#guided-button').onclick=()=>renderGuidedResolution(q);
  }
  $('#subtraction-form').onsubmit=event=>{
    event.preventDefault();const value=readControlAnswer();if(value===null)return;
    if(exam) {s.answers[s.index]=value;if(s.index===total-1)finishControl();else{s.index++;renderControlQuestion();focusMain();}return;}
    if(s.solved[s.index])return;
    s.attempts[s.index]++;
    if(value===q.answer) {
      s.answers[s.index]=value;s.solved[s.index]=true;
      $('#guided-button').disabled=true;
      if($('#guided-answer')){$('#guided-answer').disabled=true;$('#check-guided').disabled=true;}
      $('#subtraction-answer').disabled=true;$('#check-subtraction').hidden=true;$('#next-subtraction').hidden=false;
      $('#next-subtraction').textContent=s.index===total-1?'Ver mi progreso ✦':'Siguiente →';
      $('#control-feedback').className='feedback success';$('#control-feedback').textContent=`¡Lo lograste! ${q.a} − ${q.b} = ${q.answer}.`;
      playTone(true);
    } else {
      $('#control-feedback').className='feedback retry';$('#control-feedback').textContent='Todavía no. Revisa primero las unidades y vuelve a intentarlo. ¡Puedes usar la pista!';playTone(false);
    }
  };
  if(exam) {
    $('#previous-subtraction').onclick=()=>{
      const raw=$('#subtraction-answer').value.trim();
      s.answers[s.index]=/^\d{1,3}$/.test(raw)?Number(raw):null;
      if(s.index>0){s.index--;renderControlQuestion();focusMain();}
    };
  } else {
    $('#subtraction-hint').onclick=()=>{ $('#control-hint').innerHTML='<div class="hint"><strong>Empieza por las unidades.</strong><p>En cada columna, cuenta desde la cifra de abajo hasta la de arriba. ¿Cuántos pasos necesitas? Si quieres hacerlo juntos, elige «Resolver paso a paso».</p></div>';$('#subtraction-hint').disabled=true; };
    $('#read-subtraction').onclick=()=>speak(`¿Cuánto es ${q.a} menos ${q.b}? Empieza por las unidades y escribe tu resultado.`);
    $('#next-subtraction').onclick=()=>{if(!s.solved[s.index])return;if(s.index===total-1)finishControl();else{s.index++;renderControlQuestion();focusMain();}};
  }
}

function finishControl() {
  const s=controlSession,exam=s.mode==='ensayo',total=s.questions.length;
  if(s.answers.some(a=>a===null))return;
  const correct=s.questions.filter((q,i)=>s.answers[i]===q.answer).length;
  if(exam){progress.control.exams++;progress.control.best=Math.max(progress.control.best,correct);}else progress.control.practices++;
  save();
  main.innerHTML=`<section class="lesson-panel result"><span class="eyebrow">UN PASO MÁS EN TU APRENDIZAJE</span><span class="result-medal" aria-hidden="true">${correct===total?'🌟':'🌱'}</span><h1>${exam?'¡Terminaste tu ensayo!':'¡Terminaste tu práctica!'}</h1><p>${exam?'Ahora podemos revisar juntos lo que ya sabes y lo que podemos seguir practicando.':'Resolviste las quince restas y completaste los tres tramos. ¡Cada intento te ayuda a aprender!'}</p><div class="result-stats"><div><strong>${correct} de ${total}</strong><small>${exam?'respuestas correctas':'restas resueltas'}</small></div>${!exam?`<div><strong>${s.attempts.filter(n=>n===1).length} de ${total}</strong><small>al primer intento</small></div>`:''}</div><div class="result-actions"><button class="primary" id="repeat-control">${exam?'Otro ensayo':'Volver a practicar'} →</button><a class="secondary" href="#control-restas">Volver a mi preparación</a></div><p class="saved-note">${storageAvailable?'Tu progreso quedó guardado en este navegador.':'Tu navegador no permite guardar el progreso.'} Este resultado no es una nota escolar.</p></section><section class="control-review" aria-labelledby="review-title"><div class="section-heading"><div><h2 id="review-title">Revisamos juntos</h2><p>Abre cada explicación para ver la resta por columnas.</p></div></div><div class="review-grid">${s.questions.map((q,i)=>{const ok=s.answers[i]===q.answer;return `<article class="review-item ${ok?'review-ok':'review-again'}"><span class="review-status">${ok?'✓ ¡Lo lograste!':'↻ Para seguir practicando'}</span><h3>${q.a} − ${q.b} = ${q.answer}</h3><p>Tu respuesta: <strong>${s.answers[i]}</strong></p><details><summary>Ver paso a paso</summary><ol class="column-steps">${subtractionSteps(q)}</ol></details></article>`;}).join('')}</div></section>`;
  $('#repeat-control').onclick=()=>{startControl(s.mode);focusMain();};
  if(correct===total)confetti();focusMain();
  controlSession=null;
}
