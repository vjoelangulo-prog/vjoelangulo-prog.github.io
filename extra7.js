(function(){
const $=i=>document.getElementById(i),HD={'X-Jarvis':'1'};
const CALL=/^\s*(?:jarvis[,\s]+)?(?:por favor[,\s]+)?(?:ll[aá]ma(?:le)?|llamar|marca(?:le)?|marcar|haz(?:me)?\s+una\s+llamada)\s+(?:a\s+la\s+|a\s+el\s+|al\s+|a\s+)?(.+?)\s*(?:por favor|ahora|ya)?\s*[.!]?\s*$/i;
const YES=/^\s*(s[ií]|sip|claro|dale|ok|okey|okay|llama\w*|adelante|hazlo|confirm\w*)(\s|$|[.,!¡])/i;
const NO=/^\s*(no|cancela\w*|d[eé]jalo|olv[ií]dalo|para|det[eé]n\w*)(\s|$|[.,!¡])/i;
if(cfg.callconf===undefined)cfg.callconf='1';
let cp=null;
const st=document.createElement('style');
st.textContent='#wc2{position:fixed;left:0;right:0;bottom:0;z-index:21;background:#07111ffa;border-top:2px solid var(--a);padding:16px 16px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px #000;transform:translateY(110%);transition:transform .3s;max-height:80vh;overflow-y:auto}#wc2.open{transform:none}';
document.head.append(st);
function el(tag,css,text){const e=document.createElement(tag);if(css)e.style.cssText=css;if(text!=null)e.textContent=text;return e}
function card(){let w=$('wc2');if(!w){w=document.createElement('div');w.id='wc2';document.body.append(w)}w.textContent='';w.classList.add('open');return w}
function closeCard(){cp=null;const w=$('wc2');if(w)w.classList.remove('open')}
function say(t){add('j',t);speak(t)}
function waitMic(){let n=0;const iv=setInterval(()=>{if(!cp||++n>80){clearInterval(iv);return}if(state==''){clearInterval(iv);$('mic').click()}},300)}
function dial(c){
closeCard();S('','LLAMANDO...');add('j','Llamando a '+c.name);speak('Llamando a '+c.name);
setTimeout(()=>{fetch('/api/call',{method:'POST',headers:HD,body:JSON.stringify({number:c.number})}).then(r=>r.json()).then(j=>{if(!j.ok)say('No pude llamar. Activa el permiso de Teléfono para Termux:API en los ajustes del celular.')}).catch(()=>say('No pude conectar con Termux. Escribe jarvis en Termux para encender el servidor.'))},1200)}
function confirm2(c){
if(cfg.callconf=='0'){dial(c);return}
const w=card();
w.append(el('div','font-size:10px;letter-spacing:3px;color:var(--a);margin-bottom:10px','▸ LLAMAR'));
w.append(el('div','font-size:18px;margin-bottom:4px',c.name));
w.append(el('div','font-size:13px;color:#5b7a99;margin-bottom:14px',c.number));
const row=el('div','display:flex;gap:10px'),b1=el('button','flex:1;padding:14px','LLAMAR'),b2=el('button','flex:1;padding:14px','CANCELAR');
b1.className=b2.className='hb';b1.onclick=()=>dial(c);b2.onclick=()=>{closeCard();say('Cancelado.')};
row.append(b1,b2);w.append(row);cp=c;
speak('¿Llamo a '+c.name+'?');waitMic()}
function choose(L){
const w=card();cp=null;
w.append(el('div','font-size:10px;letter-spacing:3px;color:var(--a);margin-bottom:10px','▸ ¿A CUAL CONTACTO?'));
L.forEach(c=>{const b=el('button','display:block;width:100%;text-align:left;margin-bottom:8px;padding:12px',c.name+'  ·  '+c.number);b.className='hb';b.onclick=()=>confirm2(c);w.append(b)});
const x=el('button','display:block;width:100%;padding:12px','CANCELAR');x.className='hb';x.onclick=closeCard;w.append(x);
speak('Encontré varios contactos. ¿A cuál llamo?')}
async function find(name){
const v=[name];const s=name.replace(/^(mi|el|la)\s+/i,'');if(s!=name)v.push(s);
for(const q of v){const r=await fetch('/api/contacts?q='+encodeURIComponent(q),{headers:HD}),j=await r.json();
if(j.error)return j;if(j.results&&j.results.length)return j}
return{results:[]}}
async function callFlow(name){
S('thinking','BUSCANDO CONTACTO...');let j;
try{j=await find(name)}catch(e){say('No pude conectar con Termux. Escribe jarvis en Termux para encender el servidor.');return}
if(j.error=='no_contacts'){say('No puedo leer tus contactos. Activa el permiso de Contactos para Termux:API.');return}
const L=j.results||[];
if(!L.length){say('No encontré a '+name+' en tus contactos.');return}
if(L.length==1)confirm2(L[0]);else choose(L)}
const prev=window.send;
window.send=async function(t){
t=(t||'').trim();if(!t)return;
if(cp){
if(YES.test(t)){add('u',t);return dial(cp)}
if(NO.test(t)){add('u',t);closeCard();say('Cancelado.');return}
closeCard()}
const m=t.match(CALL);
if(m&&m[1]&&m[1].split(/\s+/).length<=4){add('u',t);return await callFlow(m[1])}
return prev(t)};
const row=document.createElement('div');row.className='row';
row.innerHTML='<label>CONFIRMAR ANTES DE LLAMAR</label><select id="cfm" style="width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:10px;font:13px ui-monospace,monospace"><option value="1">Sí, preguntarme primero</option><option value="0">No, llamar directo</option></select>';
$('t4').append(row);$('cfm').value=cfg.callconf;$('cfm').onchange=()=>{cfg.callconf=$('cfm').value;sv()};
})();
