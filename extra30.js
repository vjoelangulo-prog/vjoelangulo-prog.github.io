(function(){
const $=i=>document.getElementById(i);
const note=t=>{try{add('j',String(t),Date.now(),false)}catch(e){}};
const noTTS=()=>!(window.speechSynthesis&&window.SpeechSynthesisUtterance);
const hasG=()=>{try{
const ks=JSON.parse(localStorage.getItem('jkeys')||'[]').map(o=>o&&o.k);
const k1=localStorage.getItem('jkey');if(k1)ks.push(k1);
return ks.some(k=>k&&!/^sk-/.test(k))}catch(e){return true}};
function fix(){try{
if(!noTTS())return;
if(cfg.vmode!=='gemini'){cfg.vmode='gemini';try{sv()}catch(e){}}
const vm=$('vm');
if(vm){[].forEach.call(vm.options,o=>{if(o.value=='phone'){o.disabled=true;o.textContent='Voz del celular (no existe en esta app)'}});vm.value='gemini'}
}catch(e){}}
fix();
window.addEventListener('load',fix);
let told=false,toldK=false;
const os=window.speak;
if(typeof os=='function')window.speak=function(t){
try{if(noTTS()){
if(cfg.vmode!=='gemini')cfg.vmode='gemini';
if(!told){told=true;note('La voz del celular no existe dentro de esta app, así que uso la voz natural de Gemini (necesita internet).')}
if(!hasG()&&!toldK){toldK=true;note('Para hablarte necesito una clave de Gemini guardada (es gratis en aistudio.google.com). Claude y OpenAI no generan voz.')}}}catch(e){}
return os.apply(this,arguments)};
})();
