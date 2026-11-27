(function(){
const A=window.Android;
if(!A||typeof A.speakNative!=='function')return;
if(window.speechSynthesis&&window.SpeechSynthesisUtterance&&!window.__jshim)return;
let q=[],cur=null,seq=0;
const U=function(t){this.text=(t==null)?'':String(t);this.lang='es-ES';this.voice=null;this.rate=1;this.pitch=1;this.volume=1;this.onstart=null;this.onend=null;this.onerror=null;this.onboundary=null};
function go(){
if(cur||!q.length)return;
const u=q.shift();cur=u;u.__id='u'+(++seq);
try{A.speakNative(u.text,String(u.lang||'es-ES'),Number(u.rate)||1,u.__id)}
catch(e){cur=null;try{u.onerror&&u.onerror({error:'synthesis-failed'})}catch(x){}go()}}
window.__jtts=function(kind,id){
const u=cur;if(!u||u.__id!==id)return;
if(kind==='start'){try{u.onstart&&u.onstart({})}catch(e){}return}
cur=null;
try{if(kind==='end'){u.onend&&u.onend({})}else{u.onerror&&u.onerror({error:'synthesis-failed'})}}catch(e){}
go()};
const SS={
get speaking(){return !!cur},
get pending(){return q.length>0},
paused:false,
speak(u){if(!u||!String(u.text||'').trim()){try{u&&u.onend&&u.onend({})}catch(e){}return}q.push(u);go()},
cancel(){q=[];cur=null;try{A.stopSpeak()}catch(e){}},
getVoices(){return[]},pause(){},resume(){},onvoiceschanged:null,addEventListener(){},removeEventListener(){}};
window.SpeechSynthesisUtterance=U;
window.speechSynthesis=SS;
window.__jshim=1;
try{if(typeof A.warmTts==='function')A.warmTts()}catch(e){}
function ui(){try{
if(localStorage.getItem('jv32')===null){localStorage.setItem('jv32','1');cfg.vmode='phone';sv()}
const vm=document.getElementById('vm');
if(vm){[].forEach.call(vm.options,o=>{if(o.value=='phone'){o.disabled=false;o.textContent='Instantánea (voz de Android)'}});vm.value=cfg.vmode}
}catch(e){}}
ui();
window.addEventListener('load',ui);
})();
