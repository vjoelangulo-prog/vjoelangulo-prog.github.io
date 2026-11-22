(function(){
const $=i=>document.getElementById(i);
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.style.cssText=c;if(x!=null)e.textContent=x;return e};
const pad=n=>('0'+n).slice(-2),en=encodeURIComponent;
const say=t=>{add('j',t);speak(t)};
const oc=window.call;
window.call=function(b){
try{if(b&&b.systemInstruction&&!(b.generationConfig&&b.generationConfig.responseMimeType)){
b.systemInstruction.parts[0].text+=' Fecha y hora actual del usuario: '+new Date().toLocaleString('es',{dateStyle:'full',timeStyle:'short'})+'.'}}catch(e){}
return oc(b)};
const utc=ms=>new Date(ms).toISOString().replace(/[-:]|\.\d{3}/g,'');
function calURL(t,s,e){
const web='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+en(t)+'&dates='+utc(s)+'/'+utc(e);
return 'intent:#Intent;action=android.intent.action.INSERT;type=vnd.android.cursor.dir/event;S.title='+en(t)+';l.beginTime='+s+';l.endTime='+e+';S.browser_fallback_url='+en(web)+';end'}
function card(){let w=$('wc5');if(!w){w=mk('div','position:fixed;left:0;right:0;bottom:0;z-index:24;background:#07111ffa;border-top:2px solid var(--a);padding:16px 16px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px #000;transition:transform .3s');w.id='wc5';document.body.append(w)}w.textContent='';w.style.transform='none';return w}
const closeCard=()=>{const w=$('wc5');if(w)w.style.transform='translateY(110%)'};
function evCard(t,s,e){const w=card();
w.append(mk('div','font-size:10px;letter-spacing:3px;color:var(--a);margin-bottom:10px','📅 AGREGAR AL CALENDARIO'));
w.append(mk('div','font-size:17px;margin-bottom:4px',t));
w.append(mk('div','font-size:13px;color:#5b7a99;margin-bottom:14px',new Date(s).toLocaleString('es',{weekday:'long',day:'numeric',month:'long',hour:'numeric',minute:'2-digit'})));
const r=mk('div','display:flex;gap:10px'),b1=mk('button','flex:2;padding:16px','ABRIR CALENDARIO'),b2=mk('button','flex:1;padding:16px','CANCELAR');
b1.className=b2.className='hb';b1.onclick=()=>{closeCard();location.href=calURL(t,s,e)};b2.onclick=closeCard;
r.append(b1,b2);w.append(r);speak('Listo, '+cfg.addr+'. Toque el botón para guardarlo en el calendario.')}
async function parseEv(t){const n=new Date();
const p='Ahora es: '+n.toLocaleString('es',{dateStyle:'full',timeStyle:'short'})+' (hora local '+n.getFullYear()+'-'+pad(n.getMonth()+1)+'-'+pad(n.getDate())+'T'+pad(n.getHours())+':'+pad(n.getMinutes())+':00).\nEl usuario dijo: "'+t.replace(/"/g,"'")+'"\nSi quiere agendar algo en el calendario, responde SOLO JSON: {"a":"event","title":"título corto","at":"YYYY-MM-DDTHH:MM:SS en hora local","min":duración en minutos, 60 si no la dice}. Si no es eso, {"a":"none"}.';
return JSON.parse(await call({contents:[{role:'user',parts:[{text:p}]}],generationConfig:{responseMimeType:'application/json',maxOutputTokens:200}}))}
const lastRem=()=>(cfg.rem||[]).filter(r=>!r.done).sort((a,b)=>b.id-a.id)[0];
new MutationObserver(()=>{const c=$('wc4');if(!c||!c.classList.contains('open')||c.querySelector('#calb'))return;
if(c.textContent.indexOf('RECORDATORIO CREADO')<0)return;const r=lastRem();if(!r)return;
const b=mk('button','width:100%;padding:14px;margin-bottom:10px','📅 AGREGAR AL CALENDARIO');b.id='calb';b.className='hb';
b.onclick=()=>{location.href=calURL(r.t,r.at,r.at+1800000)};
const f=c.querySelector('button');f?f.parentNode.insertBefore(b,f):c.append(b)}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
const isLocked=()=>{const l=$('lk');return !!l&&l.textContent=='🔒'};
let pendP=null;
const later=()=>{let n=0;const iv=setInterval(()=>{if(++n>60){clearInterval(iv);return}if(state==''){clearInterval(iv);$('mic').click()}},250)};
const P=[
{label:'Notificaciones',n:'las notificaciones',re:/notificaci/i,st:async()=>('Notification' in window)?Notification.permission:'denied',ask:async()=>(await Notification.requestPermission())=='granted'},
{label:'Micrófono',n:'el micrófono',re:/micr[oó]fono/i,st:async()=>{try{return(await navigator.permissions.query({name:'microphone'})).state}catch(e){return 'default'}},ask:async()=>{const s=await navigator.mediaDevices.getUserMedia({audio:true});s.getTracks().forEach(x=>x.stop());return true}},
{label:'Almacenamiento protegido',n:'el almacenamiento protegido',re:/almacenamiento/i,st:async()=>(navigator.storage&&await navigator.storage.persisted())?'granted':'default',ask:async()=>!!(navigator.storage&&await navigator.storage.persist())}];
async function grant(p){let ok=false;try{ok=await p.ask()}catch(e){}
paintP();
say(ok?'Permiso concedido, '+cfg.addr+'.':'No se concedió, '+cfg.addr+'. Android necesita que lo confirme con un toque: vaya a Ajustes, Sistema, Permisos y pulse CONCEDER.')}
const TIME=/^(?:jarvis[,\s]+)?(?:por favor[,\s]+)?(?:qu[eé] hora es|dime la hora|me dices la hora)/i;
const DATE=/^(?:jarvis[,\s]+)?(?:por favor[,\s]+)?(?:qu[eé] d[ií]a es|qu[eé] fecha es|a cu[aá]ntos estamos|dime la fecha)/i;
const CAL=/(calendario|ag[eé]ndame|agendar|agenda\s+(?:una|un|el|la|mi)\s+(?:cita|reuni|evento|recordatorio))/i;
const READ=/(qu[eé] tengo|qu[eé] hay|mis eventos|mi agenda)/i;
const WRITE=/(agend|agrega|a[ñn]ad|pon|crea|guard)/i;
const LAST=/^(?:jarvis[,\s]+)?(?:agr[eé]ga|a[ñn]ade|p[oó]n|gu[aá]rda)(?:lo|la|me)?\s+(?:eso\s+)?(?:en|al)\s+(?:el\s+)?calendario/i;
const PRM=/(activa|concede|habilita|permite|autoriza|dame|dar)\w*\s.*(notificaci|micr[oó]fono|almacenamiento)/i;
const YES=/^(s[ií]|claro|dale|adelante|autorizo|concedido|ok|okey|hazlo)(\s|$|[.,!¡])/i,NO=/^(no|cancela|denegado)/i;
const os=window.send;
window.send=async function(t){t=(t||'').trim();if(!t)return os(t);
if(TIME.test(t)){add('u',t);const d=new Date(),h=d.getHours(),m=d.getMinutes(),h12=h%12||12,pt=h<6?'de la madrugada':h<12?'de la mañana':h<19?'de la tarde':'de la noche';say((h12==1?'Es la una':'Son las '+h12)+(m?' con '+m:' en punto')+' '+pt+', '+cfg.addr+'.');return}
if(DATE.test(t)){add('u',t);say('Hoy es '+new Date().toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+', '+cfg.addr+'.');return}
if(!isLocked()){
if(pendP){const p=pendP;pendP=null;
if(YES.test(t)){add('u',t);await grant(p);return}
if(NO.test(t)){add('u',t);say('Entendido, no se concede.');return}}
if(LAST.test(t)){add('u',t);const r=lastRem();if(!r){say('No tengo ningún recordatorio reciente, '+cfg.addr+'.');return}evCard(r.t,r.at,r.at+1800000);return}
if(CAL.test(t)){add('u',t);
if(READ.test(t)&&!WRITE.test(t)){say('No puedo leer su calendario, '+cfg.addr+', pero puedo agregar eventos. Dígame, por ejemplo: agéndame reunión mañana a las tres.');return}
S('thinking','ENTENDIENDO...');
try{const a=await parseEv(t),s=new Date(a.at).getTime();
if(a&&a.a=='event'&&a.title&&!isNaN(s)){evCard(String(a.title).slice(0,120),s,s+(+a.min||60)*60000);return}}catch(e){}
say('No entendí la fecha, '+cfg.addr+'. Dígame, por ejemplo: agéndame dentista el viernes a las cuatro.');return}
if(PRM.test(t)){const p=P.find(x=>x.re.test(t));if(p){add('u',t);pendP=p;say('Necesito su autorización, '+cfg.addr+'. ¿Me permite activar '+p.n+'? Diga sí o no.');later();return}}}
return os(t)};
const row=mk('div');row.className='row';row.append(mk('label','','PERMISOS DE JARVIS'));
const list=mk('div'),note=mk('div','font-size:11px;margin-top:8px;color:#5b7a99;line-height:1.5','Android abre su propia ventana de permiso: ahí debes tocar PERMITIR. Por voz: «activa las notificaciones».');
const tools=mk('div','display:flex;flex-wrap:wrap;gap:8px;margin-top:8px');
const tb=(x,f)=>{const b=mk('button','',x);b.className='hb';b.onclick=f;return b};
tools.append(tb('PROBAR NOTIFICACIÓN',()=>{try{navigator.serviceWorker.ready.then(g=>g.showNotification('Jarvis','Notificación de prueba',{vibrate:[200,100,200],icon:'/icon-192.png'}))}catch(e){}}),tb('AJUSTES DEL CELULAR',()=>{location.href='intent:#Intent;action=android.settings.SETTINGS;end'}));
row.append(list,tools,note);$('t4').append(row);
async function paintP(){list.textContent='';
for(const p of P){const s=await p.st(),r=mk('div','display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px');
r.append(mk('span','font-size:12px;color:'+(s=='granted'?'#2fffa0':s=='denied'?'#ff4f6d':'#cfe8ff'),(s=='granted'?'✔ ':s=='denied'?'✖ ':'○ ')+p.label));
if(s!='granted'){const b=mk('button','padding:8px 10px','CONCEDER');b.className='hb';b.onclick=()=>grant(p);r.append(b)}
list.append(r)}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)paintP()});
paintP();
})();
