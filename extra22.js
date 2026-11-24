(function(){
const CODE=/(c[oó]digo|programa|script|funci[oó]n|bug|debug|python|kotlin|javascript|html|css|sql|regex|\bapi\b|\bgit\b|bash|algoritmo|compil|clase|array|variable|bucle|json)/i;
const HARD=/(explica|por qu[eé]|analiza|compara|calcula|demuestra|resuelve|razona|diferencia|estrategia|paso a paso)/i;
const FAST='gemini-3.5-flash-lite',STRONG='gemini-3.8-flash';
const oc=window.call;
window.call=function(b){
let m=null;
try{
if(b&&b.systemInstruction&&Array.isArray(b.contents)&&!(b.generationConfig&&b.generationConfig.responseMimeType)){
const last=b.contents[b.contents.length-1],txt=(last&&last.parts&&last.parts[0]&&last.parts[0].text)||'';
const code=CODE.test(txt),hard=code||txt.length>160||HARD.test(txt);
let c=b.contents;
if(!hard&&c.length>8){c=c.slice(-8);while(c.length&&c[0].role!='user')c.shift()}
const g=Object.assign({},b.generationConfig||{});
if(code)g.maxOutputTokens=2500;else if(hard)g.maxOutputTokens=Math.max(g.maxOutputTokens||0,700);
const s=JSON.parse(JSON.stringify(b.systemInstruction));
if(code)s.parts[0].text+=' IGNORA el límite de frases para esta respuesta: el usuario pide código o ayuda técnica. Entrega el código completo y correcto en un bloque de código (con tres acentos graves y el nombre del lenguaje) y explícalo en una o dos frases. Piensa con cuidado antes de responder.';
else if(hard)s.parts[0].text+=' Razona con cuidado y responde con precisión, sin inventar datos.';
b=Object.assign({},b,{contents:c,generationConfig:g,systemInstruction:s});
m=(hard||cfg.model==STRONG)?STRONG:FAST}
}catch(e){}
if(!m)return oc(b);
const prev=cfg.model;cfg.model=m;
try{return oc(b)}finally{cfg.model=prev}};
const ol=window.learn;
if(typeof ol=='function')window.learn=function(t){t=String(t||'');if(t.length<18||!/(\bmi\b|\bmis\b|soy |me llamo|me gusta|trabajo|vivo|tengo|odio|prefiero|favorit|estudio|cumplea)/i.test(t))return;return ol(t)};
const os=window.speak;
window.speak=function(t){
t=String(t);
if(/\x60{3}/.test(t)){t=t.replace(/\x60{3}[\s\S]*?\x60{3}/g,' ').replace(/\x60{3}[\s\S]*$/,' ').replace(/\s+/g,' ').trim();t=(t?t+' ':'')+'El código está en el chat.'}
if(t.length>420){const cut=t.slice(0,420),i=Math.max(cut.lastIndexOf('. '),cut.lastIndexOf('? '),cut.lastIndexOf('! '));t=(i>150?cut.slice(0,i+1):cut)+' El resto está en el chat.'}
return os(t)};
const oadd=window.add;
window.add=function(w,t,ts,sv2){
const r=oadd(w,t,ts,sv2);
try{if(w=='j'&&/\x60{3}/.test(String(t))){
const bs=document.querySelectorAll('#log .msg.j'),box=bs[bs.length-1];
if(box&&!box.querySelector('.cpb')){
const b=document.createElement('button');b.className='hb cpb';b.textContent='📋 COPIAR CÓDIGO';b.style.margin='6px 0 0 0';
b.onclick=async()=>{const parts=[];String(t).replace(/\x60{3}[a-zA-Z0-9+#.-]*\n?([\s\S]*?)\x60{3}/g,(x,c)=>{parts.push(c.trim());return x});
const code=parts.length?parts.join('\n\n'):String(t);
try{await navigator.clipboard.writeText(code);b.textContent='✔ COPIADO'}catch(e){b.textContent='No pude copiar'}};
box.append(b)}}}catch(e){}
return r};
const st=document.createElement('style');st.textContent='.bub{overflow-wrap:anywhere}';document.head.append(st);
})();
