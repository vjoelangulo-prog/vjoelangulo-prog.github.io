(function(){
const $=i=>document.getElementById(i);
cfg.rem=Array.isArray(cfg.rem)?cfg.rem:[];
cfg.rem=cfg.rem.filter(r=>!r.done||Date.now()-r.at<864e5);
const PRE=/recu[eé]rd|recordatorio|av[ií]sa(me|le)|no me dejes olvidar|hazme acordar/i;
const LST=/qu[eé]\s+recordatorios\s+tengo|mis recordatorios|lista de recordatorios/i;
let actx=null,beep=null,showing=false,pendAsk=null;
const unlock=()=>{try{if(!actx)actx=new(window.AudioContext||window.webkitAudioContext)();if(actx.state=='suspended')actx.resume()}catch(e){}};
['pointerdown','keydown'].forEach(e=>document.addEventListener(e,unlock,{passive:true}));
function ring(on){clearInterval(beep);try{navigator.vibrate(0)}catch(e){}if(!on)return;let n=0;
const go=()=>{if(++n>70){clearInterval(beep);return}
try{if(actx)[0,.18].forEach((d,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.type='square';o.frequency.value=i?660:880;g.gain.value=.25;o.connect(g);g.connect(actx.destination);const t=actx.currentTime+d;o.start(t);o.stop(t+.14)})}catch(e){}
try{navigator.vibrate([200,100,200])}catch(e){}};
go();beep=setInterval(go,700)}
const st=document.createElement('style');
st.textContent='#wc4{position:fixed;left:0;right:0;bottom:0;z-index:23;background:#07111ffa;border-top:2px solid var(--a);padding:16px 16px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px #000;transform:translateY(110%);transition:transform .3s}#wc4.open{transform:none}';
document.head.append(st);
function el(t,c,x){const e=document.createElement(t);if(c)e.style.cssText=c;if(x!=null)e.textContent=x;return e}
function card(){let w=$('wc4');if(!w){w=document.createElement('div');w.id='wc4';document.body.append(w)}w.textContent='';w.classList.add('open');return w}
function closeCard(){const w=$('wc4');if(w)w.classList.remove('open')}
const say=t=>{add('j',t);speak(t)};
const p2=n=>('0'+n).slice(-2);
const iso=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())+'T'+p2(d.getHours())+':'+p2(d.getMinutes())+':'+p2(d.getSeconds());
function fmt(ts){const d=new Date(ts),n=new Date(),m=new Date(n.getTime()+864e5),h=d.toLocaleTimeString('es',{hour:'numeric',minute:'2-digit'});
if(d.toDateString()==n.toDateString())return 'hoy a las '+h;
if(d.toDateString()==m.toDateString())return 'mañana a las '+h;
return d.toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'})+' a las '+h}
function fire(r){
r.done=true;sv();draw();showing=true;
try{if('Notification' in window&&Notification.permission=='granted'&&navigator.serviceWorker)navigator.serviceWorker.ready.then(g=>g.showNotification('⏰ Jarvis · Recordatorio',{body:r.t,tag:r.id,renotify:true,requireInteraction:true,vibrate:[300,150,300,150,600],icon:'/icon-192.png'}))}catch(e){}
unlock();ring(true);
const w=card();
w.append(el('div','font-size:10px;letter-spacing:3px;color:#ffb02e;margin-bottom:10px','⏰ RECORDATORIO'));
w.append(el('div','font-size:19px;margin-bottom:16px',r.t));
const row=el('div','display:flex;gap:10px'),b1=el('button','flex:1;padding:16px','ENTENDIDO'),b2=el('button','flex:1;padding:16px','+10 MIN');
b1.className=b2.className='hb';
b1.onclick=()=>{ring(false);closeCard();showing=false;try{speechSynthesis.cancel()}catch(e){}};
b2.onclick=()=>{ring(false);closeCard();showing=false;cfg.rem.push({id:String(Date.now()),t:r.t,at:Date.now()+6e5,done:false});sv();draw();say('Te lo recuerdo en 10 minutos.')};
row.append(b1,b2);w.append(row);
add('j','⏰ Recordatorio: '+r.t,Date.now(),false);
setTimeout(()=>{if(showing){try{speak('Recordatorio: '+r.t)}catch(e){}}},2500)}
setInterval(()=>{if(showing)return;const n=Date.now(),r=cfg.rem.find(x=>!x.done&&x.at<=n);if(r)fire(r)},1000);
function intent(r){const d=r.at-Date.now(),lab=encodeURIComponent(r.t);
if(d<=0)return null;
if(d<36e5)return{b:'ALARMA DEL CELULAR (TEMPORIZADOR)',u:'intent:#Intent;action=android.intent.action.SET_TIMER;i.android.intent.extra.alarm.LENGTH='+Math.round(d/1000)+';S.android.intent.extra.alarm.MESSAGE='+lab+';end'};
if(d<=864e5){const t=new Date(r.at);return{b:'ALARMA DEL CELULAR '+p2(t.getHours())+':'+p2(t.getMinutes()),u:'intent:#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR='+t.getHours()+';i.android.intent.extra.alarm.MINUTES='+t.getMinutes()+';S.android.intent.extra.alarm.MESSAGE='+lab+';end'}}
return null}
function created(r){
const w=card();
w.append(el('div','font-size:10px;letter-spacing:3px;color:var(--a);margin-bottom:10px','▸ RECORDATORIO CREADO'));
w.append(el('div','font-size:17px;margin-bottom:4px',r.t));
w.append(el('div','font-size:13px;color:#5b7a99;margin-bottom:14px',fmt(r.at)));
const it=intent(r),row=el('div','display:flex;flex-direction:column;gap:10px');
if(it){const b=el('button','padding:14px',it.b);b.className='hb';b.onclick=()=>{closeCard();location.href=it.u};row.append(b)}
const ok=el('button','padding:14px','LISTO');ok.className='hb';ok.onclick=closeCard;row.append(ok);
w.append(row)}
async function make(t){
S('thinking','ENTENDIENDO...');let a=null;
try{const n=new Date();
const pr='Ahora es: '+n.toLocaleString('es',{dateStyle:'full',timeStyle:'short'})+' (hora local '+iso(n)+').\nEl usuario dijo: "'+t.replace(/"/g,"'")+'"\nSi pide un recordatorio con hora o tiempo, responde SOLO JSON: {"a":"remind","text":"qué recordar, corto y claro, ej: Llamar al doctor","at":"YYYY-MM-DDTHH:MM:SS en hora local"}. Si pide un recordatorio pero no dice cuándo, responde {"a":"ask"}. Si no es un recordatorio, responde {"a":"none"}.';
a=JSON.parse(await call({contents:[{role:'user',parts:[{text:pr}]}],generationConfig:{responseMimeType:'application/json',maxOutputTokens:200}}))}
catch(e){S('','TOCA PARA HABLAR');return false}
if(!a||a.a=='none'){S('','TOCA PARA HABLAR');return false}
add('u',t);S('','TOCA PARA HABLAR');
if(a.a=='ask'){pendAsk=t;say('¿Para cuándo quieres el recordatorio?');return true}
let at=new Date(a.at).getTime();
if(!a.text||isNaN(at)||at<Date.now()-6e4){say('No entendí la hora. Dime por ejemplo: recuérdame mañana a las 8 llamar al doctor.');return true}
if(at<Date.now()+3000)at=Date.now()+5000;
const r={id:String(Date.now()),t:String(a.text).slice(0,200),at:at,done:false};
cfg.rem.push(r);sv();draw();
try{if('Notification' in window&&Notification.permission=='default')Notification.requestPermission()}catch(e){}
say('Listo, te lo recordaré '+fmt(at)+': '+r.t);created(r);return true}
const prev=window.send;
window.send=async function(t){
t=(t||'').trim();if(!t)return;
if(pendAsk){t=pendAsk+' '+t;pendAsk=null;if(await make(t))return;return prev(t)}
if(LST.test(t)){add('u',t);const L=cfg.rem.filter(r=>!r.done).sort((a,b)=>a.at-b.at);
return say(L.length?'Tienes '+L.length+' recordatorios. '+L.map(r=>r.t+', '+fmt(r.at)).join('. '):'No tienes recordatorios pendientes.')}
if(PRE.test(t)&&t.split(/\s+/).length>=3){if(await make(t))return}
return prev(t)};
const row=document.createElement('div');row.className='row';
row.innerHTML='<label>RECORDATORIOS PENDIENTES</label><div id="rl" style="font-size:12px;margin-bottom:8px"></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="hb" id="rn">ACTIVAR NOTIFICACIONES</button><button class="hb" id="rt">PROBAR SONIDO</button></div><div id="rm" style="font-size:11px;margin-top:6px;color:#5b7a99"></div>';
$('t4').append(row);
function draw(){const l=$('rl');l.textContent='';const L=cfg.rem.filter(r=>!r.done).sort((a,b)=>a.at-b.at);
if(!L.length){l.style.color='#5b7a99';l.textContent='Ninguno. Di: "recuérdame mañana a las 8 llamar al doctor".';return}
l.style.color='#cfe8ff';
L.forEach(r=>{const d=document.createElement('div');d.style.cssText='display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px';
const s=document.createElement('span');s.textContent=r.t+' · '+fmt(r.at);
const b=document.createElement('button');b.className='hb';b.style.padding='4px 9px';b.textContent='X';b.onclick=()=>{cfg.rem=cfg.rem.filter(x=>x!==r);sv();draw()};
d.append(s,b);l.append(d)})}
$('rn').onclick=async()=>{try{const p=await Notification.requestPermission();$('rm').textContent=p=='granted'?'Notificaciones activadas':'Bloqueadas. Actívalas en Ajustes del celular → Apps → Jarvis (o Chrome) → Notificaciones.'}catch(e){$('rm').textContent='Este navegador no permite notificaciones.'}};
$('rt').onclick=()=>{if(!showing)fire({id:'test',t:'Prueba de recordatorio',at:Date.now(),done:false})};
draw();
})();
