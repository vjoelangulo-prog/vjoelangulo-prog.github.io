(function(){
const $=i=>document.getElementById(i);
const HD={'X-Jarvis':'1'};
const WA=/whatsapp|wasap|guasap|mensaje|escr[ií]be|m[aá]nda|env[ií]a|d[ií]le/i;
const YES=/^\s*(s[ií]|sip|claro|dale|ok|okey|okay|confirm\w*|env[ií]a\w*|m[aá]nda\w*|adelante|hazlo|listo)(\s|$|[.,!¡])/i;
const NO=/^\s*(no|cancela\w*|d[eé]jalo|olv[ií]dalo|para|det[eé]n\w*)(\s|$|[.,!¡])/i;
let pend=null;
const st=document.createElement('style');
st.textContent='#wc{position:fixed;left:0;right:0;bottom:0;z-index:20;background:#07111ffa;border-top:2px solid var(--a);padding:16px 16px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px #000;transform:translateY(110%);transition:transform .3s;max-height:80vh;overflow-y:auto}#wc.open{transform:none}';
document.head.append(st);
function el(tag,css,text){const e=document.createElement(tag);if(css)e.style.cssText=css;if(text!=null)e.textContent=text;return e}
function card(){let w=$('wc');if(!w){w=document.createElement('div');w.id='wc';document.body.append(w)}w.textContent='';w.classList.add('open');return w}
function closeCard(){pend=null;const w=$('wc');if(w)w.classList.remove('open')}
function say(t){add('j',t);speak(t)}
function fullNum(raw){let n=String(raw).replace(/[^\d+]/g,'');if(n[0]=='+')return n.slice(1);n=n.replace(/^0+/,'');const cc=String(cfg.cc||'').replace(/\D/g,'');if(cc&&!n.startsWith(cc))n=cc+n;return n}
function waitMic(){let n=0;const iv=setInterval(()=>{if(!pend||++n>80){clearInterval(iv);return}if(state==''){clearInterval(iv);$('mic').click()}},300)}
function go(how){
if(!pend)return;const p=pend,txt=p.ta.value.trim();if(!txt)return;
const fin=()=>{closeCard();say('Listo. Abrí WhatsApp con el mensaje para '+p.name+'. Solo toca enviar.')};
if(how=='voz'){
fetch('/api/wa',{method:'POST',headers:HD,body:JSON.stringify({number:p.num,text:txt})}).then(r=>r.json()).then(j=>{if(j.ok)fin();else say('No pude abrir WhatsApp solo. Toca el botón ENVIAR.')}).catch(()=>say('No pude abrir WhatsApp solo. Toca el botón ENVIAR.'));return}
location.href='whatsapp://send?phone='+p.num+'&text='+encodeURIComponent(txt);fin()}
function ask(c,msg){
const w=card();
w.append(el('div','font-size:10px;letter-spacing:3px;color:var(--a);margin-bottom:10px','▸ ENVIAR POR WHATSAPP'));
w.append(el('div','font-size:10px;color:#5b7a99;letter-spacing:2px;margin-bottom:4px','PARA'));
w.append(el('div','font-size:15px;margin-bottom:12px',c.name+'  ·  +'+fullNum(c.number)));
w.append(el('div','font-size:10px;color:#5b7a99;letter-spacing:2px;margin-bottom:4px','MENSAJE (PUEDES EDITARLO)'));
const ta=el('textarea','width:100%;min-height:80px;background:#0a1626;border:1px solid var(--a);color:#cfe8ff;padding:10px;font:14px system-ui,sans-serif;resize:none');ta.value=msg;w.append(ta);
const row=el('div','display:flex;gap:10px;margin-top:12px');
const b1=el('button','flex:1;padding:14px','ENVIAR'),b2=el('button','flex:1;padding:14px','CANCELAR');
b1.className=b2.className='hb';b1.onclick=()=>go('btn');b2.onclick=()=>{closeCard();say('Cancelado.')};
row.append(b1,b2);w.append(row);
pend={name:c.name,num:fullNum(c.number),ta:ta};
speak('Voy a enviarle a '+c.name+': '+msg+'. ¿Lo envío?');waitMic()}
function choose(L,msg){
const w=card();pend=null;
w.append(el('div','font-size:10px;letter-spacing:3px;color:var(--a);margin-bottom:10px','▸ ¿A CUAL CONTACTO?'));
L.forEach(c=>{const b=el('button','display:block;width:100%;text-align:left;margin-bottom:8px;padding:12px',c.name+'  ·  '+c.number);b.className='hb';b.onclick=()=>ask(c,msg);w.append(b)});
const x=el('button','display:block;width:100%;padding:12px','CANCELAR');x.className='hb';x.onclick=closeCard;w.append(x);
speak('Encontré varios contactos. ¿A cuál?')}
async function wa(t){
S('thinking','ENTENDIENDO...');let a=null;
try{
const p='El usuario dijo: "'+t.replace(/"/g,"'")+'"\nSi pide enviar un mensaje por WhatsApp a una persona, responde {"action":"whatsapp","contact":"nombre tal como lo dijo","message":"el texto a enviar, en primera persona, listo para enviar, sin comillas ni explicaciones"}. Si no pide eso, responde {"action":"none"}. Solo JSON.';
a=JSON.parse(await call({contents:[{role:'user',parts:[{text:p}]}],generationConfig:{responseMimeType:'application/json',maxOutputTokens:250}}))
}catch(e){S('','TOCA PARA HABLAR');return false}
if(!a||a.action!='whatsapp'||!a.contact){S('','TOCA PARA HABLAR');return false}
add('u',t);
const msg=String(a.message||'').trim();
if(!msg){say('¿Qué quieres decirle a '+a.contact+'?');return true}
S('thinking','BUSCANDO CONTACTO...');
let j;
try{const r=await fetch('/api/contacts?q='+encodeURIComponent(a.contact),{headers:HD});j=await r.json()}
catch(e){say('No pude conectar con Termux. Escribe jarvis en Termux para encender el servidor.');return true}
if(j.error=='no_contacts'){say('No puedo leer tus contactos. En Termux escribe termux-contact-list y acepta el permiso de Contactos.');return true}
const L=j.results||[];
if(!L.length){say('No encontré a '+a.contact+' en tus contactos.');return true}
if(!cfg.cc){const c=prompt('Código de tu país, sin el signo +. Ej: 51 Perú, 52 México, 57 Colombia, 34 España');if(c){cfg.cc=c.replace(/\D/g,'');sv()}}
if(L.length==1)ask(L[0],msg);else choose(L,msg);
return true}
const osend=window.send;
window.send=async function(t){
t=(t||'').trim();if(!t)return;
if(pend){
if(YES.test(t)){add('u',t);return go('voz')}
if(NO.test(t)){add('u',t);closeCard();say('Cancelado.');return}
closeCard()}
if(WA.test(t)&&t.split(/\s+/).length>=3){if(await wa(t))return}
return osend(t)};
const t4=$('t4'),row=document.createElement('div');row.className='row';
row.innerHTML='<label>CODIGO DE PAIS PARA WHATSAPP (SIN +, EJ: 51)</label><input id="cc" inputmode="numeric" style="width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:10px;font:13px ui-monospace,monospace">';
t4.append(row);$('cc').value=cfg.cc||'';$('cc').onchange=()=>{cfg.cc=$('cc').value.replace(/\D/g,'');sv()};
})();
