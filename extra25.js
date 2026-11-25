(function(){
const $=i=>document.getElementById(i);
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.style.cssText=c;if(x!=null)e.textContent=x;return e};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const LOG=[];
const log=m=>{LOG.push(new Date().toLocaleTimeString()+' '+m);if(LOG.length>40)LOG.shift()};
const note=t=>{try{add('j',t,Date.now(),false)}catch(e){}};
const setS=(c,t)=>{try{S(c,t)}catch(e){}};
const st=()=>{try{return state}catch(e){return ''}};
const clean=t=>String(t).replace(/https?:\/\/\S+/g,' enlace ').replace(/[*_#`~>|]/g,' ').replace(/\s+/g,' ').trim();
const AC=window.AudioContext||window.webkitAudioContext;
const acs=[];
if(AC&&!AC.__j25){
const W=function(o){const c=(o===undefined)?new AC():new AC(o);acs.push(c);return c};
W.prototype=AC.prototype;W.__j25=1;
window.AudioContext=W;window.webkitAudioContext=W}
const wake=()=>{acs.forEach(c=>{try{if(c.state!=='running'&&c.state!=='closed')c.resume()}catch(e){}})};
['touchstart','touchend','pointerup','click','keydown'].forEach(e=>document.addEventListener(e,wake,{passive:true,capture:true}));
function fixBridge(){
const R=window.SpeechRecognition;
if(!window.Android||!R||!R.prototype||R.prototype.__j25)return;
const P=R.prototype;let last=0;
P.start=function(){const me=this;window.__jsr=me;const w=Math.max(0,600-(Date.now()-last));
setTimeout(()=>{if(window.__jsr!==me)return;last=Date.now();log('mic: start');try{Android.startListening(me.lang||'es-ES',!!me.interimResults)}catch(e){log('mic: fallo '+e)}},w)};
P.stop=function(){if(window.__jsr===this){try{Android.stopListening()}catch(e){}}};
P.abort=function(){if(window.__jsr===this){window.__jsr=null;try{Android.abortListening()}catch(e){}}};
P.__j25=1}
fixBridge();
let lastHint=0;
const HINT={'network':'No pude entender tu voz: el reconocedor de Google necesita internet. Revisa tu conexión.','audio-capture':'El micrófono está ocupado por otra función de Jarvis. Apaga «Jarvis de fondo» en Ajustes → App nativa y prueba de nuevo.','not-allowed':'Falta el permiso del micrófono. Ve a Ajustes → App nativa → PERMISOS y acepta Micrófono.','service-not-allowed':'Este celular no tiene el servicio de voz de Google activo. Instala o actualiza «Google» y «Servicios de voz de Google».'};
function hookEvents(){
const o=window.__jsrEvent;if(!o||o.__j25)return;
const f=function(t,d){
try{
if(t=='error'){log('mic error: '+d);const h=HINT[d];if(h&&Date.now()-lastHint>10000){lastHint=Date.now();note(h)}}
else if(t=='result'&&d)log('mic texto: '+(d.f?'FINAL ':'parcial ')+String(d.t).slice(0,50));
else log('mic '+t)}catch(e){}
return o.apply(this,arguments)};
f.__j25=1;window.__jsrEvent=f}
hookEvents();
let ls=Date.now(),lstate='';
setInterval(()=>{const s=st();if(s!==lstate){lstate=s;ls=Date.now()}
const age=Date.now()-ls;
if(s=='thinking'&&age>45000){setS('','TOCA PARA HABLAR');note('Jarvis tardó demasiado en responder. Revisa tu internet o tu clave de Gemini en Ajustes.')}
else if(s=='speaking'&&age>90000){try{speechSynthesis.cancel()}catch(e){}setS('','TOCA PARA HABLAR')}
else if(s=='listening'&&age>100000){try{if(window.Android)Android.abortListening()}catch(e){}window.__jsr=null;setS('','TOCA PARA HABLAR')}},1000);
function phoneSay(t){
try{const ss=window.speechSynthesis;ss.cancel();
const parts=clean(t).match(/[^.!?]+[.!?]*/g)||[];
const vs=ss.getVoices(),v=vs.find(x=>/^es/i.test(x.lang))||null;
let n=parts.length;if(!n)return;
setS('speaking','HABLANDO // TOCA PARA INTERRUMPIR');
parts.forEach(p=>{const u=new SpeechSynthesisUtterance(p.trim());u.lang='es-ES';if(v)u.voice=v;
u.onend=u.onerror=()=>{if(--n<=0&&st()=='speaking')setS('','TOCA PARA HABLAR')};ss.speak(u)})}catch(e){}}
let told=false,vt=null;
const os=window.speak;
window.speak=function(t){
wake();
const r=os?os.apply(this,arguments):undefined;
clearTimeout(vt);
const txt=String(t);
vt=setTimeout(()=>{try{
if(st()!='speaking')return;
if(acs.length&&acs.every(c=>c.state!=='running')){
log('audio bloqueado: uso la voz del celular');
if(!told){told=true;note('Android bloqueó el audio natural. Uso la voz del celular.')}
phoneSay(txt)}}catch(e){}},3500);
return r};
function keys(){const ks=[];
try{if(typeof key!=='undefined'&&key)ks.push(key)}catch(e){}
try{JSON.parse(localStorage.jkeys||'[]').forEach(o=>{if(o.k&&ks.indexOf(o.k)<0)ks.push(o.k)})}catch(e){}
if(localStorage.jkey&&ks.indexOf(localStorage.jkey)<0)ks.push(localStorage.jkey);
return ks}
async function diag(out){
const L=[];const P=s=>{L.push(s);out.textContent=L.join('\n')};
P('— DIAGNÓSTICO DE VOZ —');
P('App nativa: '+(window.Android?'sí':'no (navegador)'));
if(window.Android){try{const i=JSON.parse(Android.info());P('Permiso de micrófono: '+(i.mic?'sí':'NO')+' · Jarvis de fondo: '+(i.service?'activo':'apagado')+' · Escuchar siempre: '+(i.wake?'sí':'no'))}catch(e){P('No pude leer el estado nativo')}}
P('Internet: '+(navigator.onLine?'sí':'NO'));
P('1) Salida de audio: escucha un tono…');
try{const c=new AC();await c.resume();const o=c.createOscillator(),g=c.createGain();g.gain.value=0.15;o.frequency.value=660;o.connect(g);g.connect(c.destination);o.start();await sleep(500);o.stop();P('   AudioContext: '+c.state+' (¿oíste el tono?)');c.close()}catch(e){P('   ERROR de audio: '+(e.message||e))}
P('2) Voz natural de Gemini…');
const ks=keys();
if(!ks.length)P('   NO hay clave de Gemini guardada');
else{
try{
const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),15000);
const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent',{method:'POST',headers:{'x-goog-api-key':ks[0],'content-type':'application/json'},signal:ctl.signal,body:JSON.stringify({contents:[{parts:[{text:'Di en español: Prueba de voz natural.'}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:(window.cfg&&cfg.gv)||'Charon'}}}}})});
const j=await r.json();clearTimeout(tm);
if(j.error)P('   ERROR de Gemini ('+r.status+'): '+String(j.error.message).slice(0,140));
else{const b64=j.candidates[0].content.parts[0].inlineData.data;P('   OK: llegó audio ('+Math.round(b64.length*0.75/1024)+' KB). Reproduciendo…');
const bin=atob(b64),n=bin.length>>1,c=new AC({sampleRate:24000}),buf=c.createBuffer(1,n,24000),ch=buf.getChannelData(0);
for(let i=0;i<n;i++){let v=bin.charCodeAt(2*i)|(bin.charCodeAt(2*i+1)<<8);if(v>=32768)v-=65536;ch[i]=v/32768}
await c.resume();const s=c.createBufferSource();s.buffer=buf;s.connect(c.destination);s.start();await sleep(Math.min(4000,buf.duration*1000+300));P('   AudioContext: '+c.state)}
}catch(e){P('   FALLÓ la conexión: '+(e.name=='AbortError'?'tardó más de 15 s':(e.message||e)))}}
P('3) Voz del celular…');
try{const ss=window.speechSynthesis;if(!ss)P('   Este navegador no tiene voz del celular');
else{const vs=ss.getVoices();P('   Voces instaladas: '+vs.length+' (en español: '+vs.filter(x=>/^es/i.test(x.lang)).length+')');
await new Promise(res=>{const u=new SpeechSynthesisUtterance('Prueba de la voz del celular.');u.lang='es-ES';u.onend=()=>{P('   Terminó de hablar');res()};u.onerror=e=>{P('   ERROR: '+e.error);res()};ss.cancel();ss.speak(u);setTimeout(res,6000)})}}catch(e){P('   ERROR: '+(e.message||e))}
P('4) Micrófono: di algo ahora (8 s)…');
const R=window.SpeechRecognition||window.webkitSpeechRecognition;
if(!R)P('   No hay reconocimiento de voz');
else await new Promise(res=>{let got=0;const r=new R();r.lang='es-ES';r.interimResults=true;r.continuous=false;
r.onstart=()=>P('   escuchando, habla…');
r.onresult=e=>{try{const x=e.results[e.results.length-1][0].transcript;got=1;P('   oí: “'+x+'”')}catch(z){}};
r.onerror=e=>P('   error: '+e.error);
r.onend=()=>{P('   fin de escucha'+(got?'':' (NO recibí texto)'));res()};
try{r.start()}catch(e){P('   no pude iniciar: '+e);res()}
setTimeout(()=>{try{r.abort()}catch(e){}res()},8000)});
P('Últimos eventos del micrófono:');
LOG.slice(-6).forEach(x=>P('   '+x));
P('— FIN. Mándame una captura de esto —')}
function panel(){
const t2=$('t2');if(!t2||$('diag25'))return;
const row=mk('div');row.className='row';row.id='diag25';
const lab=mk('label','','DIAGNÓSTICO DE VOZ');
const b=mk('button','margin:6px 0 10px 0','🔧 PROBAR AUDIO Y MICRÓFONO');b.className='hb';
const out=mk('pre','white-space:pre-wrap;word-break:break-word;font:12px/1.6 ui-monospace,monospace;color:#cfe8ff;margin:0;user-select:text','Toca el botón y sigue las pruebas. Sube el volumen del celular.');
let busy=false;
b.onclick=async()=>{if(busy)return;busy=true;b.textContent='PROBANDO…';try{await diag(out)}catch(e){out.textContent+='\nERROR: '+(e.message||e)}b.textContent='🔧 PROBAR AUDIO Y MICRÓFONO';busy=false};
row.append(lab,b,out);t2.insertBefore(row,t2.firstChild)}
try{panel()}catch(e){}
window.addEventListener('load',()=>{try{fixBridge();hookEvents();panel()}catch(e){}});
})();
