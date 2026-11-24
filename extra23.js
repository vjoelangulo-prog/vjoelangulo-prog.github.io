(function(){
const $=i=>document.getElementById(i);
if(cfg.tick===undefined)cfg.tick='1';
let ac=null,lw=0;
const ctx=()=>{try{if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state=='suspended')ac.resume();return ac}catch(e){return null}};
function warm(){const n=Date.now();if(n-lw<45000)return;lw=n;
try{fetch(new URL('https://generativelanguage.googleapis.com/'),{mode:'no-cors',cache:'no-store'}).catch(()=>{})}catch(e){}}
['pointerdown','keydown'].forEach(e=>document.addEventListener(e,()=>{ctx();warm()},{passive:true,capture:true}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)warm()});
setTimeout(warm,1500);
function tick(){const a=ctx();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;
o.type='sine';o.frequency.value=880;g.gain.value=0.0001;o.connect(g);g.connect(a.destination);
g.gain.exponentialRampToValueAtTime(0.1,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+0.12);o.start(t);o.stop(t+0.14)}
const prev=window.send;
window.send=async function(t){if(cfg.tick=='1'&&String(t||'').trim())tick();return prev(t)};
const t2=$('t2');
if(t2){const IN='width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:10px;font:13px ui-monospace,monospace';
const bx=document.createElement('div');bx.className='row';
bx.innerHTML='<label>SONIDITO AL ENVIAR (CONFIRMA QUE TE ESCUCHÓ)</label><select id="tk" style="'+IN+'"><option value="1">Sí</option><option value="0">No</option></select>';
t2.insertBefore(bx,t2.firstChild);$('tk').value=cfg.tick;$('tk').onchange=()=>{cfg.tick=$('tk').value;sv()}}
})();
