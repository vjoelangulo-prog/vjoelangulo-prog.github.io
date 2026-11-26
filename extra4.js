(function(){
const OK=['gemini-3.5-flash-lite','gemini-3.8-flash','gemini-3.1-flash-lite'];
if(OK.indexOf(cfg.model)<0){cfg.model=OK[0];try{sv()}catch(e){}}
const md=document.getElementById('md');
if(md){md.innerHTML='<option value="gemini-3.5-flash-lite">Rápido (3.5 flash-lite)</option><option value="gemini-3.8-flash">Más inteligente (3.8 flash)</option>';md.value=cfg.model}
const rf=window.fetch.bind(window);
window.fetch=function(u,o){
if(typeof u=='string'&&u.indexOf('generativelanguage')>-1){
const c=new AbortController(),t=setTimeout(()=>c.abort(),5000);
return rf(u,Object.assign({},o,{signal:c.signal})).finally(()=>clearTimeout(t))}
return rf(u,o)};
const orig=window.call;
const TR=/high demand|overload|unavailable|try again|503|500|internal|deadline|not found|404|not supported|no longer|quota|exhaust|rate|429|conexi|abort/i;
window.call=function(b){
return new Promise((resolve,reject)=>{
const base=cfg.model,list=[base].concat(OK.filter(m=>m!=base));
let done=false,n=0,fails=0,timers=[];const H=!!(b&&b.generationConfig&&(b.generationConfig.maxOutputTokens||0)>=700);
const end=(f,v)=>{if(done)return;done=true;timers.forEach(clearTimeout);f(v)};
const launch=()=>{
if(done||n>=list.length)return;
const m=list[n++];
if(n>1){const s=document.getElementById('st');if(s)s.textContent='REINTENTANDO...'}
cfg.model=m;let p;
try{p=orig(b)}catch(e){p=Promise.reject(e)}finally{cfg.model=base}
p.then(v=>end(resolve,v)).catch(e=>{
fails++;
if(!TR.test((e&&e.message)||''))return end(reject,e);
if(fails>=list.length)return end(reject,new Error('Google no respondió. Intenta de nuevo.'));
launch()})};
launch();
timers.push(setTimeout(launch,H?9000:2000),setTimeout(launch,H?17000:4500),setTimeout(()=>end(reject,new Error('Google tardó demasiado. Intenta de nuevo.')),H?26000:9000))
})};
})();
