(function(){
const $=i=>document.getElementById(i);
const PRE=/(youtube|reproduce|ponme|pon\s+(la\s+|el\s+|una\s+|un\s+)?(canci|m[uú]sica|video)|\babre\b|\babrir\b|ll[eé]vame|navega|\bruta\b|c[oó]mo llego|alarma|despi[eé]rtame|temporizador|cron[oó]metro|\btimer\b)/i;
const APPS={whatsapp:'com.whatsapp',youtube:'com.google.android.youtube',spotify:'com.spotify.music',maps:'com.google.android.apps.maps',mapas:'com.google.android.apps.maps',facebook:'com.facebook.katana',instagram:'com.instagram.android',tiktok:'com.zhiliaoapp.musically',chrome:'com.android.chrome',gmail:'com.google.android.gm',telegram:'org.telegram.messenger',netflix:'com.netflix.mediaclient','play store':'com.android.vending'};
const st=document.createElement('style');
st.textContent='#wc3{position:fixed;left:0;right:0;bottom:0;z-index:22;background:#07111ffa;border-top:2px solid var(--a);padding:16px 16px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px #000;transform:translateY(110%);transition:transform .3s}#wc3.open{transform:none}';
document.head.append(st);
function el(t,c,x){const e=document.createElement(t);if(c)e.style.cssText=c;if(x!=null)e.textContent=x;return e}
function close(){const w=$('wc3');if(w)w.classList.remove('open')}
function say(t){add('j',t);speak(t)}
const en=encodeURIComponent;
function build(a){
if(a.a=='youtube'&&a.q){const q=en(a.q),f=en('https://www.youtube.com/results?search_query='+q);
return{t:'YOUTUBE',d:'Buscar: '+a.q,b:'ABRIR YOUTUBE ▶',v:'Listo. Toca el botón para ver "'+a.q+'" en YouTube.',u:'intent://www.youtube.com/results?search_query='+q+'#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url='+f+';end'}}
if(a.a=='app'&&a.n){const n=String(a.n).toLowerCase().trim();let p=APPS[n];
if(!p){for(const k in APPS)if(n.includes(k)){p=APPS[k];break}}
if(/ajustes|configuraci/.test(n))return{t:'ABRIR APP',d:'Ajustes',b:'ABRIR AJUSTES',v:'Toca el botón para abrir Ajustes.',u:'intent:#Intent;action=android.settings.SETTINGS;end'};
if(p)return{t:'ABRIR APP',d:a.n,b:'ABRIR '+String(a.n).toUpperCase(),v:'Toca el botón para abrir '+a.n+'.',u:'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package='+p+';end'}}
if(a.a=='maps'&&a.q){return{t:'NAVEGAR',d:'Ir a: '+a.q,b:'ABRIR MAPS',v:'Toca el botón para ver la ruta a '+a.q+'.',u:'intent://www.google.com/maps/dir/?api=1&destination='+en(a.q)+'#Intent;scheme=https;package=com.google.android.apps.maps;end'}}
if(a.a=='alarm'&&a.h>=0&&a.h<24){const m=a.m>=0&&a.m<60?a.m:0,hh=('0'+a.h).slice(-2)+':'+('0'+m).slice(-2);
return{t:'ALARMA',d:hh+(a.l?' · '+a.l:''),b:'CREAR ALARMA '+hh,v:'Toca el botón para crear la alarma de las '+hh+'.',u:'intent:#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR='+a.h+';i.android.intent.extra.alarm.MINUTES='+m+';S.android.intent.extra.alarm.MESSAGE='+en(a.l||'Jarvis')+';end'}}
if(a.a=='timer'&&a.s>0){const s=Math.round(a.s),mm=Math.floor(s/60),ss=s%60,d=mm?(mm+' min'+(ss?' '+ss+' s':'')):(ss+' s');
return{t:'TEMPORIZADOR',d:d,b:'INICIAR '+d.toUpperCase(),v:'Toca el botón para iniciar el temporizador de '+d+'.',u:'intent:#Intent;action=android.intent.action.SET_TIMER;i.android.intent.extra.alarm.LENGTH='+s+';S.android.intent.extra.alarm.MESSAGE='+en(a.l||'Jarvis')+';end'}}
return null}
function card(o){
let w=$('wc3');if(!w){w=document.createElement('div');w.id='wc3';document.body.append(w)}w.textContent='';w.classList.add('open');
w.append(el('div','font-size:10px;letter-spacing:3px;color:var(--a);margin-bottom:10px','▸ '+o.t));
w.append(el('div','font-size:16px;margin-bottom:14px',o.d));
const r=el('div','display:flex;gap:10px'),b1=el('button','flex:2;padding:16px',o.b),b2=el('button','flex:1;padding:16px','CANCELAR');
b1.className=b2.className='hb';
b1.onclick=()=>{close();location.href=o.u};
b2.onclick=()=>{close();say('Cancelado.')};
r.append(b1,b2);w.append(r);speak(o.v)}
async function act(t){
S('thinking','ENTENDIENDO...');let a=null;
try{const p='El usuario dijo: "'+t.replace(/"/g,"'")+'"\nSi pide una de estas acciones responde SOLO JSON: {"a":"youtube","q":"qué buscar"} para buscar o poner música o videos | {"a":"app","n":"nombre de la app a abrir"} | {"a":"maps","q":"destino"} | {"a":"alarm","h":hora 0-23,"m":minutos 0-59,"l":"etiqueta"} | {"a":"timer","s":segundos,"l":"etiqueta"}. Si no pide ninguna, responde {"a":"none"}.';
a=JSON.parse(await call({contents:[{role:'user',parts:[{text:p}]}],generationConfig:{responseMimeType:'application/json',maxOutputTokens:200}}))}
catch(e){S('','TOCA PARA HABLAR');return false}
const o=a&&build(a);
if(!o){S('','TOCA PARA HABLAR');return false}
add('u',t);S('','TOCA PARA HABLAR');card(o);return true}
const prev=window.send;
window.send=async function(t){
t=(t||'').trim();if(!t)return;
if(PRE.test(t)&&t.split(/\s+/).length>=2){if(await act(t))return}
return prev(t)};
})();
