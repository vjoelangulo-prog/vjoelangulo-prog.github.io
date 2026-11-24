(function(){
const $=i=>document.getElementById(i);
cfg.noise='0';if(cfg.conv===undefined)cfg.conv='0';if(cfg.barge===undefined)cfg.barge='0';
let act=false,base='',cur='',last=0,t0=0,tm=null,gen=0,bg=null,warned=false;
const txt=()=>(base+' '+cur).trim();
const msg=t=>add('j',t,Date.now(),false);
function stopRec(){try{rec.onend=null;rec.onresult=null;rec.onerror=null;rec.abort()}catch(e){}}
function finish(go){if(!act)return;act=false;clearInterval(tm);stopRec();const t=txt();base='';cur='';
if(go&&t)send(t);else S('',t?'EN ESPERA':'NO TE ESCUCHE // TOCA Y HABLA')}
function begin(){if(!act)return;
rec=new SR();rec.lang=cfg.lang;rec.continuous=false;rec.interimResults=true;
rec.onstart=()=>{if(act&&!txt())S('listening','ESCUCHANDO...')};
rec.onresult=e=>{let it='';for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(r.isFinal){base=(base+' '+r[0].transcript).trim();cur=''}else it+=r[0].transcript}
if(it)cur=it;last=Date.now();if(!it&&base)last-=Math.max(0,(cfg.silence||2500)-700);const t=txt();if(t)$('st').textContent='“'+t.slice(-40)+'”'};
rec.onerror=e=>{const k=e.error;
if(k=='not-allowed'||k=='service-not-allowed'){finish(false);S('','SIN PERMISO DE MICROFONO');msg('No tengo permiso del micrófono. En Chrome toca el candado junto a localhost → Permisos → Micrófono → Permitir.');return}
if(k=='audio-capture'){finish(false);S('','MICROFONO OCUPADO');msg('El micrófono está ocupado por otra app. Si dejaste python jarvis.py abierto en Termux, ciérralo con CTRL+C.');return}
if(k=='network'){finish(false);S('','SIN INTERNET');msg('La voz de Chrome necesita internet.')}};
rec.onend=()=>{if(cur){base=(base+' '+cur).trim();cur=''}if(act)setTimeout(begin,150)};
try{rec.start()}catch(e){setTimeout(begin,300)}}
function listen(seed){if(!SR){msg('Usa Chrome para la voz');return}if(act)return;
act=true;base=seed||'';cur='';t0=last=Date.now();S('listening','ESCUCHANDO...');
begin();clearInterval(tm);
tm=setInterval(()=>{const n=Date.now(),t=txt();
if(t&&n-last>(cfg.silence||2500))finish(true);
else if(!t&&n-t0>12000)finish(false);
else if(n-t0>90000)finish(true)},200)}
function stopBarge(){if(bg){try{bg.onend=null;bg.onresult=null;bg.abort()}catch(e){}bg=null}}
function interrupt(){gen++;stopBarge();speechSynthesis.cancel()}
function done(){stopBarge();if(state!='speaking')return;S('','TOCA PARA HABLAR');if(cfg.conv=='1')setTimeout(()=>{if(state=='')listen()},400)}
function startBarge(my){if(!SR)return;stopBarge();try{bg=new SR();bg.lang=cfg.lang;bg.continuous=true;bg.interimResults=true;
bg.onresult=e=>{let s='';for(let i=e.resultIndex;i<e.results.length;i++)s+=e.results[i][0].transcript;
if(my==gen&&s.trim().split(/\s+/).length>=2){interrupt();S('','');listen(s.trim())}};
bg.onend=()=>{if(bg&&my==gen&&state=='speaking')try{bg.start()}catch(e){}};
bg.start()}catch(e){}}
window.speak=function(t){interrupt();const my=gen;
const p=t.split(/(?<=[.!?])\s+/).filter(x=>x.trim());
if(!p.length){S('','TOCA PARA HABLAR');return}
S('speaking','HABLANDO // TOCA PARA INTERRUMPIR');
setTimeout(()=>{if(my!=gen)return;
const vs=speechSynthesis.getVoices(),v=vs.find(v=>v.name==cfg.voice)||vs.find(v=>v.lang==cfg.lang)||vs.find(v=>v.lang.startsWith('es'));
let i=0;try{speechSynthesis.resume()}catch(e){}
p.forEach(x=>{const u=new SpeechSynthesisUtterance(x);u.lang=cfg.lang;if(v)u.voice=v;u.rate=+cfg.rate;u.pitch=+cfg.pitch;
u.onend=()=>{if(my==gen&&++i==p.length)done()};
u.onerror=e=>{if(my!=gen)return;if(e.error!='interrupted'&&e.error!='canceled'&&!warned){warned=true;msg('No pude hablar. En Ajustes del celular → Salida de texto a voz, instala una voz en español.')}if(++i==p.length)done()};
speechSynthesis.speak(u)});
if(cfg.barge=='1')startBarge(my)},80)};
function tap(){if(state=='listening')finish(true);else if(state=='speaking'){interrupt();S('','');listen()}else if(state!='thinking')listen()}
['mic','core','cmic'].forEach(i=>$(i).onclick=tap);
const t2=$('t2'),btn=t2.querySelector('button.hb'),bx=document.createElement('div');
bx.innerHTML='<div class="row"><label>MODO CONVERSACION (ESCUCHA SOLO AL TERMINAR DE HABLAR)</label><select id="cvm"><option value="0">Apagado</option><option value="1">Encendido</option></select></div><div class="row"><label>INTERRUMPIR CON LA VOZ (SOLO CON AUDIFONOS)</label><select id="bgm"><option value="0">Apagado</option><option value="1">Encendido</option></select></div>';
t2.insertBefore(bx,btn);
$('cvm').value=cfg.conv;$('bgm').value=cfg.barge;
['cvm','bgm'].forEach(i=>$(i).onchange=()=>{cfg.conv=$('cvm').value;cfg.barge=$('bgm').value;sv()});
try{navigator.permissions.query({name:'microphone'}).then(p=>{if(p.state=='denied')msg('El micrófono está bloqueado para esta página. Toca el candado junto a localhost → Permisos → Micrófono → Permitir.')})}catch(e){}
})();
