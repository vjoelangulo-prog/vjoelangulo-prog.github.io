(function(){
const $=i=>document.getElementById(i);
const ld=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v===null?d:v}catch(e){return d}};
const BR='http://127.0.0.1:8777',TK='jbr30t',ON='jbr30on',SNAP='jbr30s',IDS='jbr30i',DEL='jbr30d',LASTP='jbr30l',FILE='extra30m.js';
const T={poll:3000,quiet:8000,retry:120000};
const note=t=>{try{add('j',String(t),Date.now(),false)}catch(e){}};
const hex=b=>[...b].map(x=>x.toString(16).padStart(2,'0')).join('');
const unhex=h=>new Uint8Array((String(h).match(/../g)||[]).map(x=>parseInt(x,16)));
const b64=u=>{let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const hsh=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return h+':'+s.length};
const km=()=>{const h=localStorage.getItem('jlock28k');return(h&&h.length===128)?unhex(h):null};
const hk=b=>crypto.subtle.importKey('raw',b,{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
const stream=(ek,nonce,n)=>Promise.all(Array.from({length:Math.ceil(n/32)},(_,i)=>{const d=new Uint8Array(24);d.set(nonce);new DataView(d.buffer).setUint32(20,i);return crypto.subtle.sign('HMAC',ek,d)}));
const xor=(data,ks)=>{const out=new Uint8Array(data.length);ks.forEach((b,i)=>{const k=new Uint8Array(b);for(let j=0;j<32&&i*32+j<data.length;j++)out[i*32+j]=data[i*32+j]^k[j]});return out};
async function seal(text,k){
const nonce=crypto.getRandomValues(new Uint8Array(16)),data=new TextEncoder().encode(text);
const ek=await hk(k.slice(0,32)),mk=await hk(k.slice(32,64));
const ct=xor(data,await stream(ek,nonce,data.length));
const msg=new Uint8Array(16+ct.length);msg.set(nonce);msg.set(ct,16);
const mac=new Uint8Array(await crypto.subtle.sign('HMAC',mk,msg));
return JSON.stringify({v:1,n:hex(nonce),c:b64(ct),m:hex(mac)})}
async function unseal(blob,k){
const nonce=unhex(blob.n),ct=unb64(blob.c);
const ek=await hk(k.slice(0,32)),mk=await hk(k.slice(32,64));
const msg=new Uint8Array(nonce.length+ct.length);msg.set(nonce);msg.set(ct,nonce.length);
if(!await crypto.subtle.verify('HMAC',mk,unhex(blob.m),msg))return null;
return new TextDecoder().decode(xor(ct,await stream(ek,nonce,ct.length)))}
const enabled=()=>!!(km()&&localStorage.getItem(TK)&&localStorage.getItem(ON)!=='0');
const localMods=()=>ld('jmods',[]).map(m=>({id:m.id,name:m.name,desc:m.desc||'',code:m.code,on:!!m.on,ver:m.ver||1,ts:m.ts||0}));
function trackDeletes(loc){
const ids=loc.map(m=>m.id),prev=ld(IDS,null);
if(prev){const gone=prev.filter(id=>ids.indexOf(id)<0);
if(gone.length){const d=ld(DEL,[]);gone.forEach(id=>d.push({id:id,ts:Date.now()}));localStorage.setItem(DEL,JSON.stringify(d.slice(-50)))}}
if(!prev||JSON.stringify(prev)!==JSON.stringify(ids))localStorage.setItem(IDS,JSON.stringify(ids))}
function union(rem,loc,del){
const map={},dl={};
((rem&&rem.mods)||[]).forEach(m=>{map[m.id]=m});
loc.forEach(m=>{const o=map[m.id];if(!o||(m.ts||0)>=(o.ts||0))map[m.id]=m});
((rem&&rem.del)||[]).concat(del).forEach(d=>{if(!dl[d.id]||d.ts>dl[d.id].ts)dl[d.id]=d});
return{mods:Object.keys(map).map(i=>map[i]).filter(m=>!(dl[m.id]&&dl[m.id].ts>=(m.ts||0))),del:Object.keys(dl).map(i=>dl[i]).slice(-50),t:Date.now()}}
async function bridge(path,body,ms){
const tok=localStorage.getItem(TK)||'';
const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),ms||15000);
try{const r=await fetch(BR+path,body===undefined?{headers:{'x-jarvis-token':tok},signal:ctl.signal}:{method:'POST',headers:{'content-type':'application/json','x-jarvis-token':tok},body:JSON.stringify(body),signal:ctl.signal});
return await r.json()}finally{clearTimeout(tm)}}
async function getRemote(k){
try{const r=await fetch(FILE+'?v='+Date.now(),{cache:'no-store'});if(!r.ok)return null;
const t=await unseal(JSON.parse(await r.text()),k);return t?JSON.parse(t):null}catch(e){return null}}
let busy=false,qt=null,qh='',nextTry=0,lastErrNote=0;
async function publish(force){
if(busy||!enabled())return false;
busy=true;
try{
const k=km(),loc=localMods(),dels=ld(DEL,[]);
const h=hsh(JSON.stringify(loc)+JSON.stringify(dels));
const text=JSON.stringify(union(await getRemote(k),loc,dels));
let ok=false;
for(let t=0;t<6&&!ok;t++){
const r=await bridge('/bundle',{data:await seal(text,k)});
if(r.ok)ok=true;else if(!r.retry)throw new Error(r.e||'el puente rechazó el archivo')}
if(!ok)throw new Error('no pude generar un archivo limpio');
note('📤 Subiendo a GitHub desde Termux…');
const p=await bridge('/publish',{},190000);
if(p.ok){localStorage.setItem(SNAP,JSON.stringify(h));localStorage.setItem(LASTP,String(Date.now()));
note('🚀 Publicado: ya está en la web y en la app (tarda 1 o 2 minutos en actualizarse).');return true}
throw new Error(p.e||String(p.out||'no se pudo publicar').slice(-160))
}catch(e){
nextTry=Date.now()+T.retry;
if(Date.now()-lastErrNote>600000){lastErrNote=Date.now();
note('🔌 No pude publicar desde Termux ('+String(e.message||e).slice(0,140)+'). Revisa que el puente esté activo: en Termux escribe «puente».')}
return false
}finally{busy=false}}
async function tick(){
if(!enabled()||busy)return;
const loc=localMods();trackDeletes(loc);
const h=hsh(JSON.stringify(loc)+JSON.stringify(ld(DEL,[])));
if(h===ld(SNAP,'')){clearTimeout(qt);qt=null;qh='';return}
if(Date.now()<nextTry)return;
if(qh!==h){qh=h;clearTimeout(qt);qt=setTimeout(()=>publish(),T.quiet)}}
async function pull(){
const k=km();if(!k)return false;
const rem=await getRemote(k);if(!rem)return false;
const mods=ld('jmods',[]),dels=ld(DEL,[]);let ch=false;
(rem.del||[]).forEach(d=>{const i=mods.findIndex(m=>m.id===d.id);if(i>=0&&(mods[i].ts||0)<=d.ts){mods.splice(i,1);ch=true}});
(rem.mods||[]).forEach(r=>{
const i=mods.findIndex(m=>m.id===r.id);
if(i<0){if(!dels.some(d=>d.id===r.id&&d.ts>=(r.ts||0))){mods.push(Object.assign({errs:0,repairs:0,hist:[]},r));ch=true}}
else if((r.ts||0)>(mods[i].ts||0)){mods[i]=Object.assign({},mods[i],r,{hist:mods[i].hist||[],errs:0});ch=true}});
if(ch){localStorage.setItem('jmods',JSON.stringify(mods));
if(!sessionStorage.getItem('jbr30r')){sessionStorage.setItem('jbr30r','1');note('🔄 Traje módulos nuevos desde GitHub. Reiniciando para aplicarlos…');setTimeout(()=>location.reload(),1500)}}
return ch}
async function ping(){
try{const r=await bridge('/ping');return r.ok?'':(r.e||'respuesta inesperada')}
catch(e){return 'No llego a Termux. ¿Escribiste «puente» en Termux? Si sí, Android puede estar bloqueando la conexión desde la app: avísame.'}}
function panel(){
const t4=$('t4');if(!t4||$('br30')||!km())return;
const row=document.createElement('div');row.className='row';row.id='br30';
const lab=document.createElement('label');lab.textContent='🔗 PUENTE CON TERMUX (PUBLICAR SOLO)';
const st=document.createElement('div');st.style.cssText='font-size:12px;line-height:1.7;margin:6px 0 10px;color:#cfe8ff';
const inp=document.createElement('input');inp.type='password';inp.placeholder='clave del puente (la muestra Termux)';inp.autocomplete='off';
inp.style.cssText='width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:14px;font:15px ui-monospace,monospace;margin-bottom:10px';
const b=(t,f)=>{const x=document.createElement('button');x.className='hb';x.style.cssText='margin:0 8px 8px 0';x.textContent=t;x.onclick=f;return x};
const paint=()=>{const lp=+localStorage.getItem(LASTP)||0;
st.textContent=(localStorage.getItem(TK)?'● Clave guardada':'○ Sin clave')+' · Publicar solo: '+(localStorage.getItem(ON)==='0'?'NO':'SÍ')+(lp?' · Último: '+new Date(lp).toLocaleString():'');
tg.textContent='PUBLICAR SOLO: '+(localStorage.getItem(ON)==='0'?'NO':'SÍ')};
const tg=b('',()=>{localStorage.setItem(ON,localStorage.getItem(ON)==='0'?'1':'0');paint()});
const save=b('GUARDAR Y PROBAR',async()=>{const v=inp.value.trim();if(v)localStorage.setItem(TK,v);inp.value='';
st.textContent='Probando…';const e=await ping();paint();st.textContent+=e?' · ✖ '+e:' · ✔ Conectado con Termux'});
const now=b('PUBLICAR AHORA',async()=>{st.textContent='Publicando…';const ok=await publish(true);paint();if(!ok)st.textContent+=' · ✖ No se pudo (mira el chat)'});
const info=document.createElement('div');info.style.cssText='font-size:11px;color:#5b7a99;line-height:1.5;margin-top:4px';
info.textContent='En Termux escribe «puente» y pega aquí la clave que muestra. Cuando Jarvis instale, mejore o arregle un módulo, se publica solo (cifrado) y llega a la web y a la app.';
row.append(lab,st,inp,save,tg,now,info);t4.appendChild(row);paint()}
setInterval(()=>{try{panel();tick()}catch(e){}},T.poll);
setTimeout(()=>{try{pull()}catch(e){}},2500);
window.J30={tick:tick,publish:publish,pull:pull,ping:ping,T:T,seal:seal,unseal:unseal};
})();
