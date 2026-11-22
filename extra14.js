(function(){
const $=i=>document.getElementById(i),enc=new TextEncoder();
let sec={};try{sec=JSON.parse(localStorage.jsec)||{}}catch(e){}
if(sec.auto===undefined)sec.auto=5;if(sec.lockbg===undefined)sec.lockbg='1';
const has=()=>!!(sec.word||sec.morse);
let locked=has(),last=Date.now(),pat='',until=0,fails=0,hiddenAt=0;
const save=()=>{localStorage.jsec=JSON.stringify(sec)};
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const b64=u=>{let s='';u.forEach(c=>s+=String.fromCharCode(c));return btoa(s)};
const unb=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function hash(x,sl){const salt=sl?unb(sl):crypto.getRandomValues(new Uint8Array(16));
const k=await crypto.subtle.importKey('raw',enc.encode(x),'PBKDF2',false,['deriveBits']);
const bits=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:salt,iterations:50000,hash:'SHA-256'},k,256));
return{s:b64(salt),h:b64(bits)}}
async function check(x,rec){if(!rec||!rec.s)return false;return(await hash(x,rec.s)).h===rec.h}
function mk(t,c,x){const e=document.createElement(t);if(c)e.style.cssText=c;if(x!=null)e.textContent=x;return e}
function toast(t){let d=$('tst');if(!d){d=mk('div','position:fixed;left:50%;bottom:120px;transform:translateX(-50%);z-index:80;background:#07111ffa;border:1px solid var(--a);padding:10px 16px;font:12px ui-monospace,monospace;letter-spacing:1px;color:#cfe8ff;max-width:86%;text-align:center;display:none');d.id='tst';document.body.append(d)}
d.textContent=t;d.style.display='block';clearTimeout(d._t);d._t=setTimeout(()=>{d.style.display='none'},4500)}
async function wordMatch(t){if(!sec.word)return false;const w=norm(t).split(' ').filter(Boolean),n=sec.word.n;
if(w.length<n||w.length>n+6)return false;let c=0;
for(let i=0;i+n<=w.length&&c<7;i++,c++){if(await check(w.slice(i,i+n).join(' '),sec.word))return true}return false}
function sheet(){let w=$('wl');if(!w){w=mk('div','position:fixed;left:0;right:0;bottom:0;z-index:70;background:#07111ffc;border-top:2px solid #ff4f6d;padding:18px 16px calc(20px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px #000;text-align:center;display:none');w.id='wl';document.body.append(w)}return w}
function openUnlock(msg){const w=sheet();w.textContent='';pat='';w.style.display='block';
w.append(mk('div','font-size:11px;letter-spacing:3px;color:#ff4f6d;margin-bottom:8px','🔒 ACCESO RESTRINGIDO'));
w.append(mk('div','font-size:13px;color:#cfe8ff;margin-bottom:14px',msg||(sec.morse&&sec.word?'Ingrese el código Morse o diga la palabra secreta':sec.morse?'Ingrese el código Morse':'Diga la palabra secreta en voz alta')));
const row=mk('div','display:flex;gap:10px;justify-content:center;margin-top:12px');
const hb=(t,f)=>{const b=mk('button','padding:12px 14px',t);b.className='hb';b.onclick=f;return b};
if(sec.morse){const disp=mk('div','font-size:20px;letter-spacing:6px;color:var(--a);min-height:28px;margin-bottom:8px');
const pad=mk('button','width:110px;height:110px;border-radius:50%;border:2px solid var(--a);background:#0a1626;color:var(--a);font:11px ui-monospace,monospace;box-shadow:0 0 20px var(--a);touch-action:manipulation;user-select:none','TOCA · MANTÉN');
let t0=0;pad.onpointerdown=e=>{e.preventDefault();t0=Date.now();pad.style.transform='scale(.94)'};
pad.onpointerup=pad.onpointercancel=()=>{if(!t0)return;pat+=Date.now()-t0>=350?'-':'.';t0=0;pad.style.transform='';disp.textContent='◆'.repeat(pat.length);try{navigator.vibrate(30)}catch(e){}};
pad.oncontextmenu=e=>e.preventDefault();
w.append(disp,pad);
row.append(hb('BORRAR',()=>{pat='';disp.textContent=''}),hb('DESBLOQUEAR',async()=>{
if(Date.now()<until){toast('Espere un momento…');return}
if(pat&&await check(pat,sec.morse)){unlockOk()}else{fails++;pat='';disp.textContent='';try{navigator.vibrate([200,80,200])}catch(e){}toast('Código incorrecto');if(fails>=5){until=Date.now()+60000;fails=0;toast('Demasiados intentos. Bloqueado 1 minuto.')}}}))}
row.append(hb('CERRAR',()=>{w.style.display='none'}));w.append(row)}
const top=$('top'),gear=$('gear'),wrap=mk('div','display:flex;gap:10px;align-items:center'),lk=mk('button','','🔓');
lk.className='ib';lk.id='lk';top.append(wrap);wrap.append(lk,gear);
function paint(){lk.style.display=has()?'':'none';lk.textContent=locked?'🔒':'🔓';lk.style.borderColor=locked?'#ff4f6d':'#2fffa0'}
function closeAll(){['ps','pc','wc','wc2','wc3'].forEach(i=>{const e=$(i);if(e)e.classList.remove('open')})}
const oadd=window.add;
window.add=function(a,b,c,d){return oadd(a,b,c,locked?false:d)};
function setLocked(v){locked=!!v&&has();paint();const l=$('log');
if(locked){if(l)l.innerHTML='';closeAll()}else{if(l)l.innerHTML='';jlog.forEach(m=>oadd(m.w,m.t,m.ts,false))}}
function unlockOk(){const w=$('wl');if(w)w.style.display='none';pat='';fails=0;setLocked(false);last=Date.now();
const m='Acceso concedido. Bienvenido, '+cfg.addr+'.';add('j',m);speak(m);toast('🔓 Acceso concedido')}
function deny(){const m='Acceso denegado, '+cfg.addr+'. Necesito la clave de acceso.';add('j',m);speak(m);toast('🔒 Acceso denegado');if(sec.morse)setTimeout(()=>openUnlock(),600)}
const PERS=/qu[eé] sabes de m[ií]|mis datos|sobre m[ií]|qui[eé]n soy|c[oó]mo me llamo|mi nombre|mi (novi[oa]|espos[oa]|mam[aá]|pap[aá]|famil|trabajo|cumple|direcci|tel[eé]fono|n[uú]mero|cuenta|casa|hij)|mis (contactos|recordatorios|mensajes|chats|gustos|claves|datos)|memoria|recuerd|lo que te (dije|cont[eé])|ll[aá]ma|escr[ií]be|whatsapp|mensaje|contact|clave|c[oó]digo|contrase|desbloque/i;
async function lockedChat(t){S('thinking','PROCESANDO...');
try{const a=await call({systemInstruction:{parts:[{text:'Eres Jarvis, asistente de voz. Responde en español, máximo dos frases, sin listas. No tienes ninguna información personal del usuario ni acceso a sus datos, contactos, mensajes ni recordatorios: si los piden, di que primero deben ingresar la clave de acceso.'}]},contents:[{role:'user',parts:[{text:t}]}],generationConfig:{maxOutputTokens:200}});
add('j',a);speak(a)}catch(e){add('j','Error: '+e.message);S('','ERROR')}}
const os=window.send;
window.send=async function(t){t=(t||'').trim();if(!t)return;last=Date.now();
if(!locked)return os(t);
if(await wordMatch(t)){unlockOk();return}
add('u',t);if(PERS.test(t)){deny();return}
return lockedChat(t)};
lk.onclick=()=>{if(locked)openUnlock();else{setLocked(true);toast('🔒 Bloqueado')}};
document.addEventListener('click',e=>{if(!locked)return;const x=e.target.closest&&e.target.closest('#gear,#cb');if(x){e.stopPropagation();e.preventDefault();openUnlock('Para abrir esto, ingrese la clave')}},true);
['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,()=>{last=Date.now()},true));
setInterval(()=>{if(!locked&&has()&&+sec.auto>0&&Date.now()-last>sec.auto*60000)setLocked(true)},5000);
document.addEventListener('visibilitychange',()=>{if(document.hidden){hiddenAt=Date.now()}else if(hiddenAt){if(sec.lockbg=='1'&&has()&&Date.now()-hiddenAt>20000)setLocked(true);hiddenAt=0}});
window.JSEC={sec:()=>sec,save:save,hash:hash,check:check,norm:norm,wordMatch:wordMatch,setLocked:setLocked,paint:paint,openUnlock:openUnlock,toast:toast};
setLocked(locked);paint();
})();
