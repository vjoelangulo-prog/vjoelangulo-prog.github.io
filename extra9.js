(function(){
const $=i=>document.getElementById(i);
if(cfg.vmode===undefined)cfg.vmode='gemini';
if(!cfg.gv)cfg.gv='Charon';
const old=window.speak;
let ctx=null,gen=0,cur=null,chk=null;
const unlock=()=>{try{if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)({sampleRate:24000});if(ctx.state=='suspended')ctx.resume()}catch(e){}};
['pointerdown','keydown'].forEach(e=>document.addEventListener(e,unlock,{passive:true}));
function stopAll(){gen++;clearInterval(chk);if(cur){try{cur.onended=null;cur.stop()}catch(e){}cur=null}}
async function tts(text){
const ks=[];if(key)ks.push(key);
try{JSON.parse(localStorage.jkeys||'[]').forEach(o=>{if(o.k&&ks.indexOf(o.k)<0)ks.push(o.k)})}catch(e){}
let err=null;
for(const k of ks){
const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);
try{
const r=await fetch(new URL('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent'),{method:'POST',headers:{'x-goog-api-key':k,'content-type':'application/json'},signal:c.signal,body:JSON.stringify({contents:[{parts:[{text:'Di en español, con tono natural, cálido y sin prisa: '+text}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:cfg.gv}}}}})});
const j=await r.json();clearTimeout(t);
if(j.error){err=new Error(j.error.message);continue}
return j.candidates[0].content.parts[0].inlineData.data
}catch(e){clearTimeout(t);err=e}}
throw err||new Error('sin respuesta')}
function decode(b64){
const bin=atob(b64),n=bin.length>>1,buf=ctx.createBuffer(1,n,24000),ch=buf.getChannelData(0);
for(let i=0;i<n;i++){let v=bin.charCodeAt(2*i)|(bin.charCodeAt(2*i+1)<<8);if(v>=32768)v-=65536;ch[i]=v/32768}
return buf}
window.speak=function(t){
if(cfg.vmode!='gemini'||cfg.barge=='1')return old(t);
unlock();if(!ctx)return old(t);
stopAll();try{speechSynthesis.cancel()}catch(e){}
const my=gen,parts=t.split(/(?<=[.!?])\s+/).filter(x=>x.trim());
if(!parts.length){S('','TOCA PARA HABLAR');return}
S('speaking','HABLANDO // TOCA PARA INTERRUMPIR');
const P=[],get=i=>{if(!P[i]){P[i]=tts(parts[i]).then(decode);P[i].catch(()=>{})}return P[i]};
chk=setInterval(()=>{if(my!=gen){clearInterval(chk);return}if(state!='speaking')stopAll()},100);
(async()=>{
for(let i=0;i<parts.length;i++){
if(my!=gen)return;
get(i);if(i+1<parts.length)get(i+1);
let buf;
try{buf=await P[i]}catch(e){
if(my!=gen)return;
if(i==0){if(!window._tw){window._tw=1;add('j','Voz natural no disponible ('+String(e.message||'error').slice(0,70)+'). Uso la voz del celular.',Date.now(),false)}stopAll();return old(t)}
break}
if(my!=gen)return;
await new Promise(res=>{const s=ctx.createBufferSource();s.buffer=buf;s.playbackRate.value=+cfg.rate||1;s.connect(ctx.destination);s.onended=res;cur=s;s.start()})}
if(my!=gen)return;
clearInterval(chk);cur=null;
if(state=='speaking'){S('','TOCA PARA HABLAR');if(cfg.conv=='1')setTimeout(()=>{if(state=='')$('mic').click()},400)}
})()};
const bx=document.createElement('div');
bx.innerHTML='<div class="row"><label>MOTOR DE VOZ</label><select id="vm"><option value="gemini">Natural (Gemini)</option><option value="phone">Del celular (robótica)</option></select></div><div class="row"><label>VOZ NATURAL</label><select id="gv"><option value="Charon">Charon · grave y seria</option><option value="Orus">Orus · firme</option><option value="Puck">Puck · alegre</option><option value="Fenrir">Fenrir · enérgica</option><option value="Kore">Kore · mujer firme</option><option value="Aoede">Aoede · mujer suave</option><option value="Sulafat">Sulafat · cálida</option><option value="Achird">Achird · amigable</option></select></div>';
const t2=$('t2');t2.insertBefore(bx,t2.firstChild);
$('vm').value=cfg.vmode;$('gv').value=cfg.gv;
$('vm').onchange=()=>{cfg.vmode=$('vm').value;sv()};
$('gv').onchange=()=>{cfg.gv=$('gv').value;sv();speak('Hola, soy Jarvis. ¿Te gusta mi voz?')};
})();
