(function(){
const $=i=>document.getElementById(i);
cfg.silence=cfg.silence||4000;if(cfg.noise===undefined)cfg.noise='1';if(cfg.mfilter===undefined)cfg.mfilter='1';
const TH={'0':0,'1':0.5,'2':0.75};
let stream=null,active=false,base='',cur='',last=0,t0=0,timer=null,noStream=false;
const txt=()=>(base+' '+cur).trim();
async function openMic(){if(noStream||cfg.noise!='1'||stream)return;try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})}catch(e){stream=null}}
function closeMic(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
function show(){const t=txt();$('st').textContent=t?('“'+t.slice(-45)+'”'):'ESCUCHANDO // TOCA PARA ENVIAR';$('cs').textContent='ESCUCHANDO...'}
function finish(go){if(!active)return;active=false;clearInterval(timer);try{rec.onend=null;rec.onerror=null;rec.abort()}catch(e){}closeMic();const t=txt();base='';cur='';if(go&&t)send(t);else S('',t?'EN ESPERA':'NO TE ESCUCHE')}
function begin(){if(!active)return;rec=new SR();rec.lang=cfg.lang;rec.continuous=false;rec.interimResults=true;
rec.onstart=()=>{if(active&&state!='listening')S('listening','ESCUCHANDO...')};
rec.onresult=e=>{let it='';for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(r.isFinal){const c=r[0].confidence;if(!(c>0&&c<TH[cfg.mfilter]))base=(base+' '+r[0].transcript).trim();cur=''}else it+=r[0].transcript}if(it)cur=it;last=Date.now();show()};
rec.onerror=e=>{if(e.error=='not-allowed'||e.error=='service-not-allowed'){finish(false);add('j','Permite el micrófono en Chrome');return}if(e.error=='audio-capture'&&stream){noStream=true;closeMic()}if(e.error=='network'){finish(false);add('j','Error de red en la voz')}};
rec.onend=()=>{if(cur){base=(base+' '+cur).trim();cur=''}if(active)setTimeout(begin,80)};
try{rec.start()}catch(e){setTimeout(begin,300)}}
async function listen2(){if(!SR){add('j','Usa Chrome para la voz');return}if(active)return;active=true;base='';cur='';last=Date.now();t0=last;S('listening','ESCUCHANDO // TOCA PARA ENVIAR');await openMic();if(!active)return;begin();clearInterval(timer);timer=setInterval(()=>{const n=Date.now(),t=txt();if(t&&n-last>cfg.silence)finish(true);else if(!t&&n-t0>15000)finish(false);else if(n-t0>90000)finish(true)},200)}
window.listen=listen2;
function tap2(){if(state=='listening'){finish(true)}else if(state=='speaking'){speechSynthesis.cancel();S('','EN ESPERA')}else if(state!='thinking')listen2()}
['mic','core','cmic'].forEach(i=>$(i).onclick=tap2);
const t2=$('t2'),btn=t2.querySelector('button.hb'),box=document.createElement('div');
box.innerHTML='<div class="row"><label>PACIENCIA AL HABLAR (SILENCIO ANTES DE ENVIAR)</label><select id="sl"><option value="1500">Rápido (1.5 s)</option><option value="2500">Normal (2.5 s)</option><option value="4000">Paciente (4 s)</option><option value="6000">Muy paciente (6 s)</option></select></div><div class="row"><label>FILTRO DE RUIDO</label><select id="mf"><option value="0">Apagado (escucha todo)</option><option value="1">Medio</option><option value="2">Fuerte (ignora voces lejanas)</option></select></div><div class="row"><label>REDUCCION DE RUIDO DEL MICROFONO</label><select id="nz"><option value="1">Activada</option><option value="0">Desactivada</option></select></div>';
t2.insertBefore(box,btn);
$('sl').value=String(cfg.silence);$('mf').value=cfg.mfilter;$('nz').value=cfg.noise;
['sl','mf','nz'].forEach(i=>$(i).onchange=()=>{cfg.silence=+$('sl').value;cfg.mfilter=$('mf').value;cfg.noise=$('nz').value;sv()});
})();
