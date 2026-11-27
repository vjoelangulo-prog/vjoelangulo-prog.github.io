(function(){
const $=i=>document.getElementById(i);
try{
if(localStorage.getItem('jv31')===null){
localStorage.setItem('jv31','1');
if(cfg.model==='gemini-3.8-flash'){cfg.model='gemini-3.5-flash-lite';sv()}}
}catch(e){}
function ui(){try{const md=$('md');if(md&&cfg.model)md.value=cfg.model}catch(e){}}
ui();
window.addEventListener('load',ui);
})();
