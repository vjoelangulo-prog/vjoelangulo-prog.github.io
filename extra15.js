(function(){
const $=i=>document.getElementById(i),J=window.JSEC;
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.style.cssText=c;if(x!=null)e.textContent=x;return e};
document.head.append(mk('style','','.tabs button{padding:13px 0;letter-spacing:0;font-size:9px}'));
const tabs=document.querySelector('.tabs'),pb=document.querySelector('.pb'),tb=mk('button','','SEGURIDAD'),t5=mk('div');
t5.className='tp';t5.id='t5';tb.dataset.t='t5';tabs.append(tb);pb.append(t5);
let until=0,fails=0,authed=0;
const IN='width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:10px;font:13px ui-monospace,monospace;margin-bottom:8px';
const row=l=>{const r=mk('div');r.className='row';if(l)r.append(mk('label','',l));return r};
const btn=(t,f)=>{const b=mk('button','margin:4px 6px 0 0',t);b.className='hb';b.onclick=f;return b};
const inp=ph=>{const i=mk('input',IN);i.type='password';i.placeholder=ph;return i};
const msg=mk('div','font-size:12px;margin:8px 0;min-height:16px;color:#5b7a99');
const say=(t,ok)=>{msg.style.color=ok?'#2fffa0':'#ff4f6d';msg.textContent=t};
tb.onclick=()=>{document.querySelectorAll('.tabs button,.tp').forEach(x=>x.classList.remove('on'));tb.classList.add('on');t5.classList.add('on');render()};
function render(){t5.textContent='';const s=J.sec();if(!s.admin)setup();else if(Date.now()>authed)login();else panel()}
function setup(){const r=row('CREA LA CONTRASEÑA DE ADMINISTRADOR');
r.append(mk('div','font-size:12px;color:#5b7a99;margin-bottom:10px','Esta contraseña protege la sección de seguridad. Sin ella, nadie puede cambiar tu código.'));
const a=inp('contraseña (mínimo 4)'),b=inp('repítela');
r.append(a,b,btn('CREAR',async()=>{if(a.value.length<4){say('Mínimo 4 caracteres');return}if(a.value!==b.value){say('No coinciden');return}
const s=J.sec();s.admin=await J.hash(a.value);J.save();authed=Date.now()+180000;render()}),msg);t5.append(r)}
function login(){const r=row('ZONA PROTEGIDA · CONTRASEÑA DE ADMINISTRADOR'),a=inp('contraseña');
r.append(a,btn('ENTRAR',async()=>{if(Date.now()<until){say('Espera un momento…');return}
if(await J.check(a.value,J.sec().admin)){fails=0;authed=Date.now()+180000;render()}else{fails++;a.value='';say('Contraseña incorrecta');if(fails>=5){until=Date.now()+60000;fails=0;say('Demasiados intentos. Espera 1 minuto.')}}}),msg);t5.append(r)}
function panel(){const s=J.sec(),on=!!(s.word||s.morse);
const r=row('ESTADO');r.append(mk('div','font-size:13px;margin-bottom:6px;color:'+(on?'#2fffa0':'#ffb02e'),on?'🔒 Protección ACTIVA':'⚠ Protección INACTIVA: configura un código Morse o una palabra secreta'));
r.append(btn('BLOQUEAR AHORA',()=>{if(!on){say('Primero configura un código');return}J.setLocked(true)}));t5.append(r);
morseBox();wordBox();optsBox();passBox();t5.append(msg)}
function morseBox(){const s=J.sec(),r=row('CÓDIGO MORSE ('+(s.morse?'configurado':'sin configurar')+')');
r.append(mk('div','font-size:12px;color:#5b7a99;margin-bottom:10px','Toca = punto · Mantén = raya. Mínimo 4 toques. Solo tú y Jarvis lo saben.'));
let p='',first='';
const disp=mk('div','font-size:20px;letter-spacing:6px;color:var(--a);min-height:28px;text-align:center'),info=mk('div','font-size:11px;text-align:center;color:#5b7a99;margin:6px 0','Paso 1: toca tu código');
const pad=mk('button','display:block;margin:6px auto;width:96px;height:96px;border-radius:50%;border:2px solid var(--a);background:#0a1626;color:var(--a);font:11px ui-monospace,monospace;touch-action:manipulation;user-select:none','TOCA · MANTÉN');
let t0=0;pad.onpointerdown=e=>{e.preventDefault();t0=Date.now()};
pad.onpointerup=pad.onpointercancel=()=>{if(!t0)return;p+=Date.now()-t0>=350?'-':'.';t0=0;disp.textContent='◆'.repeat(p.length);try{navigator.vibrate(30)}catch(e){}};
pad.oncontextmenu=e=>e.preventDefault();
const reset=()=>{p='';first='';disp.textContent='';info.textContent='Paso 1: toca tu código'};
r.append(disp,pad,info,btn('BORRAR',()=>{p='';disp.textContent=''}),btn('SIGUIENTE / GUARDAR',async()=>{
if(p.length<4){say('Mínimo 4 toques');return}
if(!first){first=p;p='';disp.textContent='';info.textContent='Paso 2: repite el mismo código';say('');return}
if(p!==first){say('No coinciden. Empieza de nuevo.');reset();return}
const rec=await J.hash(p);rec.n=p.length;s.morse=rec;J.save();say('Código Morse guardado',true);J.paint();render()}));
if(s.morse)r.append(btn('QUITAR MORSE',()=>{if(confirm('¿Quitar el código Morse?')){delete s.morse;J.save();J.setLocked(false);render()}}));
t5.append(r)}
function wordBox(){const s=J.sec(),r=row('PALABRA SECRETA POR VOZ ('+(s.word?'configurada':'sin configurar')+')');
r.append(mk('div','font-size:12px;color:#5b7a99;margin-bottom:10px','Una palabra o frase corta que dirás en voz alta. Elige algo que solo tú sepas y pruébalo.'));
const a=inp('palabra o frase secreta');
r.append(a,btn('GUARDAR',async()=>{const n=J.norm(a.value);if(n.length<4){say('Muy corta (mínimo 4 letras)');return}
const rec=await J.hash(n);rec.n=n.split(' ').length;s.word=rec;J.save();a.value='';say('Palabra guardada. Pruébala con el botón.',true);J.paint();render()}),btn('PROBAR POR VOZ',testVoice));
if(s.word)r.append(btn('QUITAR PALABRA',()=>{if(confirm('¿Quitar la palabra secreta?')){delete s.word;J.save();J.setLocked(false);render()}}));
t5.append(r)}
function testVoice(){const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){say('Usa Chrome');return}
if(!J.sec().word){say('Primero guarda una palabra');return}
const x=new R();x.lang=cfg.lang;x.interimResults=false;say('Escuchando… di tu palabra',true);
x.onresult=async e=>{const t=e.results[0][0].transcript,ok=await J.wordMatch(t);say(ok?'✔ Coincide':'✖ No coincide (te entendí: «'+t+'»)',ok)};
x.onerror=()=>say('No te escuché');try{x.start()}catch(e){}}
function optsBox(){const s=J.sec(),r=row('AUTOBLOQUEO');
const sel=mk('select',IN);[['0','Nunca'],['1','1 minuto sin usar'],['5','5 minutos sin usar'],['15','15 minutos sin usar']].forEach(o=>{const op=mk('option','',o[1]);op.value=o[0];sel.append(op)});sel.value=String(s.auto);
sel.onchange=()=>{s.auto=+sel.value;J.save()};
const bg=mk('select',IN);[['1','Sí, si estuve fuera más de 20 segundos'],['0','No']].forEach(o=>{const op=mk('option','',o[1]);op.value=o[0];bg.append(op)});bg.value=s.lockbg;
bg.onchange=()=>{s.lockbg=bg.value;J.save()};
r.append(sel,mk('label','','BLOQUEAR AL VOLVER A LA APP'),bg);t5.append(r)}
function passBox(){const s=J.sec(),r=row('CAMBIAR CONTRASEÑA DE ADMINISTRADOR'),a=inp('nueva contraseña'),b=inp('repítela');
r.append(a,b,btn('CAMBIAR',async()=>{if(a.value.length<4){say('Mínimo 4 caracteres');return}if(a.value!==b.value){say('No coinciden');return}s.admin=await J.hash(a.value);J.save();a.value=b.value='';say('Contraseña cambiada',true)}));t5.append(r)}
})();
