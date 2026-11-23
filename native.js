(function(){
if(!window.Android)return;
function R(){this.lang='es-ES';this.continuous=false;this.interimResults=false;this.onstart=null;this.onresult=null;this.onerror=null;this.onend=null}
R.prototype.start=function(){window.__jsr=this;Android.startListening(this.lang||'es-ES',!!this.interimResults)};
R.prototype.stop=function(){Android.stopListening()};
R.prototype.abort=function(){window.__jsr=null;Android.abortListening()};
window.SpeechRecognition=R;window.webkitSpeechRecognition=R;
window.__jsrEvent=function(t,d){var r=window.__jsr;if(!r)return;
try{
if(t=='start'){if(r.onstart)r.onstart({})}
else if(t=='result'){if(r.onresult){var it=[{transcript:d.t,confidence:d.f?0.9:0}];it.isFinal=!!d.f;r.onresult({resultIndex:0,results:[it]})}}
else if(t=='error'){if(r.onerror)r.onerror({error:d})}
else if(t=='end'){if(r.onend)r.onend({})}
}catch(e){}};
function ld(k,d){try{return JSON.parse(localStorage[k])||d}catch(e){return d}}
function sync(){try{
var cfg=ld('jcfg',{}),keys=ld('jkeys',[]).map(function(o){return o.k}).filter(Boolean),k1=localStorage.jkey;
if(k1&&keys.indexOf(k1)<0)keys.push(k1);
var facts=ld('jfacts',[]).map(function(f){return typeof f=='string'?f:(f.c+': '+f.t)});
Android.syncConfig(JSON.stringify({keys:keys,addr:cfg.addr||'señor',voice:cfg.gv||'Charon',facts:facts,cc:cfg.cc||'51'}));
var rem=(cfg.rem||[]).filter(function(r){return !r.done&&r.at>Date.now()}).map(function(r){return{id:String(r.id),t:r.t,at:r.at}});
Android.syncReminders(JSON.stringify(rem))}catch(e){}}
setInterval(sync,5000);setTimeout(sync,2500);
window.addEventListener('load',function(){
var t4=document.getElementById('t4');if(!t4)return;
var row=document.createElement('div');row.className='row';
var lab=document.createElement('label');lab.textContent='APP NATIVA DE JARVIS (FONDO, BURBUJA, RECORDATORIOS)';row.appendChild(lab);
var st=document.createElement('div');st.style.cssText='font-size:12px;line-height:1.7;margin-bottom:10px;color:#cfe8ff';row.appendChild(st);
var bs={};
function btn(id,label,f){var b=document.createElement('button');b.className='hb';b.style.cssText='margin:0 8px 8px 0';if(label)b.textContent=label;b.onclick=function(){f();setTimeout(paint,900)};bs[id]=b;row.appendChild(b)}
function info(){try{return JSON.parse(Android.info())}catch(e){return{}}}
function paint(){var i=info();
st.textContent=(i.service?'● Fondo ACTIVO':'○ Fondo apagado')+' · Micrófono '+(i.mic?'✔':'✖')+' · Contactos '+(i.contacts?'✔':'✖')+' · Llamadas '+(i.call?'✔':'✖')+' · Sobre otras apps '+(i.overlay?'✔':'✖');
bs.svc.textContent=i.service?'APAGAR JARVIS DE FONDO':'ENCENDER JARVIS DE FONDO';
bs.bub.textContent='BURBUJA: '+(i.bubble?'SÍ':'NO');
bs.wake.textContent='ESCUCHAR «JARVIS» SIEMPRE: '+(i.wake?'SÍ':'NO')}
btn('svc','',function(){Android.toggleService()});
btn('perm','PERMISOS: MIC, CONTACTOS, LLAMADAS',function(){Android.askPerms()});
btn('ovl','PERMITIR MOSTRAR SOBRE OTRAS APPS',function(){Android.openOverlay()});
btn('bat','BATERÍA SIN RESTRICCIONES',function(){Android.openBattery()});
btn('bub','',function(){Android.setBubble(!info().bubble)});
btn('wake','',function(){Android.setWake(!info().wake)});
btn('imp','IMPORTAR CONTACTOS',function(){
var l=[];try{l=JSON.parse(Android.allContacts())}catch(e){}
if(!l.length){alert('No pude leer tus contactos. Toca PERMISOS y acepta Contactos.');return}
cfg.dir=Array.isArray(cfg.dir)?cfg.dir:[];var seen={},n=0;
cfg.dir.forEach(function(d){seen[d.name+'|'+String(d.number).replace(/[^\d+]/g,'')]=1});
l.forEach(function(c){var k=c.name+'|'+String(c.number).replace(/[^\d+]/g,'');if(!seen[k]){seen[k]=1;cfg.dir.push({name:c.name,number:c.number});n++}});
sv();alert(n+' contactos agregados')});
btn('nat','PANTALLA NATIVA',function(){Android.openNative()});
row.appendChild(document.createElement('div')).style.cssText='font-size:11px;color:#5b7a99;line-height:1.5;margin-top:4px';
row.lastChild.textContent='Los recordatorios que crees se convierten en alarmas reales de Android. Para llamadas y WhatsApp, importa tus contactos.';
t4.appendChild(row);paint();setInterval(paint,4000)});
})();
