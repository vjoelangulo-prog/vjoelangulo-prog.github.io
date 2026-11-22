(function(){
const $=i=>document.getElementById(i);
if(cfg.addr===undefined)cfg.addr='señor';
if(cfg.hf===undefined)cfg.hf='0';
const oc=window.call;
window.call=function(b){
try{if(b&&b.systemInstruction&&!(b.generationConfig&&b.generationConfig.responseMimeType)){
b.systemInstruction.parts[0].text+=' Hablas como J.A.R.V.I.S., el mayordomo de inteligencia artificial de Tony Stark: educado, eficiente, con ingenio sutil. Llama al usuario "'+cfg.addr+'". Si te dan una orden, confirma con frases como "Sí, '+cfg.addr+'", "Enseguida" o "A sus órdenes". Nunca digas que eres un modelo de lenguaje.'}}catch(e){}
return oc(b)};
const R=window.SpeechRecognition||window.webkitSpeechRecognition;
const WK=/(jarvis|yarvis|harvis|jarbis|yervis|charvis|jarvi|garvis|jarves|yarbis)/gi;
let w=null,wOn=false,tmr=null,rest='';
const btn=document.createElement('button');btn.className='ib';btn.id='hf';btn.textContent='👂';
const sp=document.querySelector('#mainbar .sp');if(sp)sp.replaceWith(btn);
const paint=()=>{btn.style.opacity=cfg.hf=='1'?'1':'.45';btn.style.boxShadow=cfg.hf=='1'?'0 0 18px var(--a)':'none'};
function stopW(){clearTimeout(tmr);wOn=false;if(w){try{w.onend=null;w.onresult=null;w.onerror=null;w.abort()}catch(e){}w=null}}
function ack(){const L=['Sí, '+cfg.addr+'.','A sus órdenes.','Dígame, '+cfg.addr+'.','Aquí estoy, '+cfg.addr+'.'],t=L[Math.floor(Math.random()*L.length)];
add('j',t);speak(t);let n=0;const iv=setInterval(()=>{if(++n>60){clearInterval(iv);return}if(state==''){clearInterval(iv);$('mic').click()}},250)}
function startW(){if(!R||wOn||cfg.hf!='1'||state!=''||document.hidden)return;
wOn=true;w=new R();w.lang=cfg.lang;w.continuous=true;w.interimResults=true;
w.onresult=e=>{let t='';for(let i=0;i<e.results.length;i++)t+=' '+e.results[i][0].transcript;t=t.trim();
let m=null,x;WK.lastIndex=0;while((x=WK.exec(t)))m=x;if(!m)return;
rest=t.slice(m.index+m[0].length).replace(/^[\s,.:;!¡¿?]+/,'').trim();
clearTimeout(tmr);tmr=setTimeout(()=>{const r=rest;rest='';stopW();r.length>2?send(r):ack()},1300)};
w.onerror=e=>{if(e.error=='not-allowed'||e.error=='service-not-allowed'){cfg.hf='0';sv();paint();stopW();add('j','Permite el micrófono para el modo manos libres.',Date.now(),false)}};
w.onend=()=>{wOn=false;w=null};
try{w.start()}catch(e){wOn=false}}
setInterval(()=>{if(cfg.hf=='1'&&state==''&&!wOn)startW();else if(wOn&&(cfg.hf!='1'||state!=''))stopW()},700);
btn.onclick=()=>{cfg.hf=cfg.hf=='1'?'0':'1';sv();paint();const s=$('hfm');if(s)s.value=cfg.hf;if(cfg.hf=='1')S('','DI «JARVIS»');else stopW()};
paint();
const osp=window.speak;
window.speak=function(t){
t=String(t).replace(/^(?:Listo\.\s*)?Toca el botón para (.+?)\.?$/,(m,x)=>'Necesito su permiso, '+cfg.addr+'. ¿Me autoriza a '+x+'?');
return osp(t)};
let seen=false;
new MutationObserver(()=>{const c=$('wc3');if(!c)return;
if(!c.classList.contains('open')){seen=false;return}
c.querySelectorAll('button').forEach(b=>{const x=b.textContent;if(x=='CANCELAR')b.textContent='DENEGAR';else if(x!='DENEGAR'&&x.indexOf('✔')!==0)b.textContent='✔ CONCEDER · '+x});
if(!seen){seen=true;let n=0;const iv=setInterval(()=>{if(++n>70||!c.classList.contains('open')){clearInterval(iv);return}if(state==''){clearInterval(iv);$('mic').click()}},300)}}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
const os=window.send;
window.send=async function(t){
t=(t||'').trim();const c=$('wc3'),o=x=>{const e=$(x);return e&&e.classList.contains('open')};
if(c&&o('wc3')&&!o('wc')&&!o('wc2')){
if(/^(s[ií]|concedido|autorizado|permiso concedido|adelante|hazlo|abrelo|ábrelo|claro|dale|ok|okey)(\s|$|[.,!¡])/i.test(t)){add('u',t);const b=[...c.querySelectorAll('button')].find(x=>/CONCEDER/.test(x.textContent));if(b)b.click();return}
if(/^(no|denegado|cancela\w*|d[eé]jalo|olv[ií]dalo)(\s|$|[.,!¡])/i.test(t)){add('u',t);const b=[...c.querySelectorAll('button')].find(x=>x.textContent=='DENEGAR');if(b)b.click();return}}
return os(t)};
const t2=$('t2'),bx=document.createElement('div'),IS='width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:10px;font:13px ui-monospace,monospace';
bx.innerHTML='<div class="row"><label>MODO MANOS LIBRES (DI «JARVIS» Y HABLA)</label><select id="hfm" style="'+IS+'"><option value="0">Apagado</option><option value="1">Encendido</option></select></div><div class="row"><label>COMO TE LLAMA JARVIS</label><input id="adr" placeholder="señor, jefe, jefa..." style="'+IS+'"></div>';
t2.insertBefore(bx,t2.firstChild);
$('hfm').value=cfg.hf;$('adr').value=cfg.addr;
$('hfm').onchange=()=>{cfg.hf=$('hfm').value;sv();paint();if(cfg.hf!='1')stopW()};
$('adr').onchange=()=>{cfg.addr=$('adr').value.trim()||'señor';sv()};
})();
