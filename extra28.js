/*J28LOADER*/
(function(){
const $=i=>document.getElementById(i);
const LK='jlock28k',FILE='extra28c.js';
let U=false,bad=0,until=0;
const hex=b=>[...b].map(x=>x.toString(16).padStart(2,'0')).join('');
const unhex=h=>new Uint8Array((String(h).match(/../g)||[]).map(x=>parseInt(x,16)));
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function derive(pw,salt,it){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);return new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:salt,iterations:it},k,512))}
async function open(blob,km){
const hk=b=>crypto.subtle.importKey('raw',b,{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
const nonce=unhex(blob.n),ct=unb64(blob.c),ek=await hk(km.slice(0,32)),mk=await hk(km.slice(32,64));
const msg=new Uint8Array(nonce.length+ct.length);msg.set(nonce);msg.set(ct,nonce.length);
if(!await crypto.subtle.verify('HMAC',mk,unhex(blob.m),msg))return null;
const nb=Math.ceil(ct.length/32);
const ks=await Promise.all(Array.from({length:nb},(_,i)=>{const d=new Uint8Array(nonce.length+8);d.set(nonce);new DataView(d.buffer).setUint32(nonce.length+4,i);return crypto.subtle.sign('HMAC',ek,d)}));
const out=new Uint8Array(ct.length);
ks.forEach((b,i)=>{const k=new Uint8Array(b);for(let j=0;j<32&&i*32+j<ct.length;j++)out[i*32+j]=ct[i*32+j]^k[j]});
return new TextDecoder().decode(out)}
async function getBlob(){const r=await fetch(FILE+'?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);return JSON.parse(await r.text())}
function start(code){U=true;const p=$('lock28');if(p)p.remove();
try{new Function(code)()}catch(e){try{add('j','No pude iniciar la auto-construcción: '+e.message,Date.now(),false)}catch(x){}}}
function showLock(msg){
const t2=$('t2');if(!t2||U)return;
let row=$('lock28');
if(!row){
row=document.createElement('div');row.className='row';row.id='lock28';
const lab=document.createElement('label');lab.textContent='🔒 MÓDULOS DE JARVIS (AUTO-CONSTRUCCIÓN)';
const info=document.createElement('div');info.style.cssText='font-size:12px;line-height:1.6;color:#5b7a99;margin:6px 0 10px';
info.textContent='Aquí Jarvis crea, prueba y arregla su propio código. Función reservada al dueño: escribe la clave para desbloquearla.';
const pw=document.createElement('input');pw.type='password';pw.placeholder='clave del dueño';pw.autocomplete='off';
pw.style.cssText='width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:14px;font:15px ui-monospace,monospace;margin-bottom:10px';
const lm=document.createElement('div');lm.id='lock28msg';lm.style.cssText='font-size:12px;min-height:18px;color:#ff4f6d;margin-bottom:6px';
const ub=document.createElement('button');ub.className='hb';ub.textContent='🔓 DESBLOQUEAR';
ub.onclick=async()=>{
const n=Date.now();if(n<until){lm.textContent='Espera '+Math.ceil((until-n)/1000)+' s';return}
const v=pw.value.trim();if(!v)return;
ub.textContent='VERIFICANDO…';lm.textContent='';
try{const blob=await getBlob();const km=await derive(v,unhex(blob.s),blob.i||200000);const code=await open(blob,km);
if(code){try{localStorage.setItem(LK,hex(km))}catch(e){}start(code);return}
bad++;if(bad>=5){until=Date.now()+60000;bad=0}lm.textContent='Clave incorrecta'}
catch(e){lm.textContent='No pude cargar el módulo: '+(e.message||e)}
ub.textContent='🔓 DESBLOQUEAR';pw.value=''};
row.append(lab,info,pw,lm,ub);t2.insertBefore(row,t2.firstChild)}
const m=$('lock28msg');if(m&&msg)m.textContent=msg}
const ps=window.send;
if(typeof ps=='function')window.send=function(t){
if(!U&&typeof t=='string'&&/^\s*(?:jarvis[,:]?\s*)?(?:quiero que tengas|prog[rá]mate|cr[eé]ate|agr[eé]gate|(?:comienza|empieza|inicia|activa)\s+(?:el\s+)?(?:proceso|modo)\s+(?:de\s+)?auto)/i.test(t)){
try{add('u',t);add('j','🔒 La auto-construcción es solo del dueño. Se desbloquea en Ajustes con su clave.',Date.now(),false)}catch(e){}return}
return ps.apply(this,arguments)};
async function boot(){
let st=null;try{st=localStorage.getItem(LK)}catch(e){}
if(st){try{const blob=await getBlob();const code=await open(blob,unhex(st));if(code){start(code);return}localStorage.removeItem(LK);showLock('La clave cambió. Escríbela otra vez.');return}
catch(e){showLock('Sin conexión: no pude cargar la auto-construcción.');return}}
showLock()}
boot();
window.addEventListener('load',()=>{if(!U)showLock()});
})();
