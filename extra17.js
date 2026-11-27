(function(){
const $=i=>document.getElementById(i);
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.style.cssText=c;if(x!=null)e.textContent=x;return e};
if(cfg.pace===undefined)cfg.pace='1';
if(cfg.bgv===undefined)cfg.bgv='1';
cfg.barge='0';
const prev=window.speak;
const phone=t=>{const m=cfg.vmode;cfg.vmode='phone';try{prev(t)}finally{cfg.vmode=m}};
const PACE=['con ritmo pausado y calmado','con ritmo natural y continuo','con ritmo ágil y dinámico'];
let ctx=null,out=null,an=null,gen=0,srcs=[],chk=null,micS=null,mon=null,warned=false;
function unlock(){try{
if(!ctx){ctx=new(window.AudioContext||window.webkitAudioContext)({sampleRate:24000});
out=ctx.createGain();an=ctx.createAnalyser();an.fftSize=512;const mu=ctx.createGain();mu.gain.value=0;
const cp=ctx.createDynamicsCompressor();out.gain.value=0.9;out.connect(cp);cp.connect(ctx.destination);out.connect(an);an.connect(mu);mu.connect(ctx.destination)}
if(ctx.state=='suspended')ctx.resume()}catch(e){}}
['pointerdown','keydown'].forEach(e=>document.addEventListener(e,unlock,{passive:true}));
const clean=t=>String(t).replace(/https?:\/\/\S+/g,' enlace ').replace(/[*_#`~>|]/g,' ').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu,' ').replace(/\s*\n+\s*/g,'. ').replace(/\.{2,}/g,'.').replace(/\s+/g,' ').trim();
const split=t=>{if(t.length<=45)return[t];const ABR=/(?:^|\s)(?:[A-Za-zÁÉÍÓÚáéíóú]|Sr|Sra|Dr|Dra|Lic|Ing|etc|vs)\.$/;const o=[];let r=t;
const take=mx=>{if(r.length<=mx){o.push(r);r='';return}let c=-1,re=/[.!?;:]\s/g,m;
while((m=re.exec(r))&&m.index+1<=mx){if(!ABR.test(r.slice(0,m.index+1)))c=m.index+1}
if(c<6){const k=r.lastIndexOf(', ',mx);c=k>=12?k+1:r.lastIndexOf(' ',mx)}
if(c<6)c=mx;o.push(r.slice(0,c).trim());r=r.slice(c).trim()};
take(90);if(r)take(170);if(r)o.push(r);return o.filter(Boolean)};
const TC=new Map();
function tts(text){if(text.length>90)return tts0(text);const k=(cfg.gv||'')+'|'+cfg.pace+'|'+text;if(TC.has(k))return TC.get(k);const p=tts0(text);TC.set(k,p);p.catch(()=>TC.delete(k));if(TC.size>24)TC.delete(TC.keys().next().value);return p}
async function tts0(text){
const ks=[];if(key)ks.push(key);
try{JSON.parse(localStorage.jkeys||'[]').forEach(o=>{if(o.k&&ks.indexOf(o.k)<0)ks.push(o.k)})}catch(e){}
const style='Di en español, con una voz natural y fluida, '+PACE[+cfg.pace]+', sin cortes entre palabras: ';
let err=null,quota=false;
for(let round=0;round<2&&!quota;round++){
for(const k of ks){
const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);
try{
const r=await fetch(new URL('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent'),{method:'POST',headers:{'x-goog-api-key':k,'content-type':'application/json'},signal:c.signal,body:JSON.stringify({contents:[{parts:[{text:style+text}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:cfg.gv||'Charon'}}}}})});
const j=await r.json();clearTimeout(t);
if(j.error){err=new Error(j.error.message);if(/quota|429|exhaust|rate/i.test(j.error.message))quota=true;continue}
return j.candidates[0].content.parts[0].inlineData.data
}catch(e){clearTimeout(t);err=e}}
if(!quota)await new Promise(r=>setTimeout(r,500))}
throw err||new Error('sin respuesta')}
function decode(b64){
const bin=atob(b64),n=bin.length>>1,buf=ctx.createBuffer(1,n,24000),ch=buf.getChannelData(0);
for(let i=0;i<n;i++){let v=bin.charCodeAt(2*i)|(bin.charCodeAt(2*i+1)<<8);if(v>=32768)v-=65536;ch[i]=v/32768}
const f=Math.min(240,n>>1);for(let i=0;i<f;i++){const g=i/f;ch[i]*=g;ch[n-1-i]*=g}
return buf}
function stopAll(){gen++;clearInterval(chk);srcs.forEach(s=>{try{s.onended=null;s.stop()}catch(e){}});srcs=[];stopMic()}
const after=(s,f)=>{if(s._d)f();else s.onended=()=>{s._d=1;f()}};
window.speak=function(t){
t=String(t).replace(/^(?:Listo\.\s*)?Toca el botón para (.+?)\.?$/,(m,x)=>'Necesito su permiso, '+cfg.addr+'. ¿Me autoriza a '+x+'?');
if(cfg.vmode=='phone')return phone(t);
unlock();if(!ctx)return phone(t);
stopAll();try{speechSynthesis.cancel()}catch(e){}
const my=gen,text=clean(t);
if(!text){S('','TOCA PARA HABLAR');return}
const parts=split(text);
S('speaking','HABLANDO // TOCA PARA INTERRUMPIR');
const P=parts.map(p=>{const q=tts(p).then(decode);q.catch(()=>{});return q});
chk=setInterval(()=>{if(my!=gen){clearInterval(chk);return}if(state!='speaking')stopAll()},100);
function finish(){clearInterval(chk);stopMic();srcs=[];if(state=='speaking'){S('','TOCA PARA HABLAR');if(cfg.conv=='1')setTimeout(()=>{if(state=='')$('mic').click()},400)}}
(async()=>{
let nextT=0,last=null;
for(let i=0;i<P.length;i++){
let buf;
try{buf=await P[i]}catch(e){
if(my!=gen)return;
if(!warned){warned=true;add('j','Voz natural no disponible ('+String(e.message||'error').slice(0,70)+'). Uso la voz del celular.',Date.now(),false)}
const rest=parts.slice(i).join(' '),go=()=>{if(my!=gen)return;stopMic();clearInterval(chk);phone(rest)};
if(last)after(last,go);else go();
return}
if(my!=gen)return;
const s=ctx.createBufferSource();s.buffer=buf;s.connect(out);s.onended=()=>{s._d=1};
const when=Math.max(ctx.currentTime+0.03,nextT);s.start(when);nextT=when+buf.duration;srcs.push(s);last=s;
if(i==0)startMic(my)}
after(last,()=>{if(my==gen)finish()})
})()};
const TH={'1':{g:1.8,f:0.02,n:7},'2':{g:1.4,f:0.012,n:5}};
function stopMic(){clearInterval(mon);mon=null;if(micS){micS.getTracks().forEach(x=>x.stop());micS=null}}
function interrupt(){stopAll();S('','');setTimeout(()=>$('mic').click(),250)}
async function startMic(my){
if(cfg.bgv=='0'||!navigator.mediaDevices)return;
try{
const s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:false}});
if(my!=gen||state!='speaking'){s.getTracks().forEach(x=>x.stop());return}
micS=s;
const src=ctx.createMediaStreamSource(s),ma=ctx.createAnalyser();ma.fftSize=512;src.connect(ma);
const mb=new Float32Array(ma.fftSize),ob=new Float32Array(an.fftSize);
const rms=(a,b)=>{a.getFloatTimeDomainData(b);let x=0;for(let i=0;i<b.length;i++)x+=b[i]*b[i];return Math.sqrt(x/b.length)};
const K=TH[cfg.bgv]||TH['1'];let ms=0,oh=[0,0,0,0,0,0],cal=[],c=null,run=0,t0=Date.now();
mon=setInterval(()=>{
if(my!=gen||state!='speaking'){stopMic();return}
const m=rms(ma,mb),o=rms(an,ob);ms=ms*.6+m*.4;oh.push(o);oh.shift();const op=Math.max(...oh);
if(Date.now()-t0<900){if(op>0.02)cal.push(ms/op);return}
if(c===null){if(cal.length<5)c=0.3;else{cal.sort((a,b)=>a-b);c=cal[Math.floor(cal.length*.8)]}}
if(ms>c*op*K.g+K.f)run++;else run=Math.max(0,run-1);
if(run>=K.n)interrupt()},40)
}catch(e){}}
document.addEventListener('pointerdown',e=>{if(state!='speaking')return;
if(e.target.closest&&e.target.closest('button,input,select,textarea,#core,.p'))return;
stopAll();S('','TOCA PARA HABLAR')},true);
const IN='width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:10px;font:13px ui-monospace,monospace';
const gv=$('gv');
if(gv){const w=mk('div','display:flex;gap:8px'),b=mk('button','white-space:nowrap','▶ PROBAR');b.className='hb';
gv.parentNode.insertBefore(w,gv);w.append(gv,b);gv.style.flex='1';gv.style.width='auto';gv.style.minWidth='0';
gv.onchange=()=>{cfg.gv=gv.value;sv()};
b.onclick=()=>{cfg.gv=gv.value;sv();speak('Hola, soy Jarvis. A sus órdenes, '+(cfg.addr||'señor')+'. Así sueno con esta voz.')};
const row=gv.closest('.row'),bx=mk('div');
bx.innerHTML='<div class="row"><label>RITMO DE LA VOZ NATURAL</label><select id="pc" style="'+IN+'"><option value="0">Pausado</option><option value="1">Normal</option><option value="2">Ágil</option></select></div><div class="row"><label>INTERRUMPIR CON LA VOZ (SIN AUDIFONOS)</label><select id="bgv" style="'+IN+'"><option value="0">Apagado</option><option value="1">Normal</option><option value="2">Alta sensibilidad</option></select></div>';
row.after(bx);$('pc').value=cfg.pace;$('bgv').value=cfg.bgv;
$('pc').onchange=()=>{cfg.pace=$('pc').value;sv()};
$('bgv').onchange=()=>{cfg.bgv=$('bgv').value;sv()}}
const vz=$('vz');
if(vz){const w=mk('div','display:flex;gap:8px'),b=mk('button','white-space:nowrap','▶ PROBAR');b.className='hb';
vz.parentNode.insertBefore(w,vz);w.append(vz,b);vz.style.flex='1';vz.style.width='auto';vz.style.minWidth='0';
b.onclick=()=>{cfg.voice=vz.value;sv();phone('Hola, soy Jarvis. Así sueno con la voz del celular.')}}
const ob=$('bgm');if(ob&&ob.closest('.row'))ob.closest('.row').style.display='none';
})();
