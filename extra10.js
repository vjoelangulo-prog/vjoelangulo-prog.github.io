(function(){
const $=i=>document.getElementById(i);
const SK=['jkey','jkeys','jkeyi','jcfg','jfacts','jhist','jlog','jcol'];
const enc=new TextEncoder(),dec=new TextDecoder();
const b64=u=>{let s='';u.forEach(c=>s+=String.fromCharCode(c));return btoa(s)};
const unb=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
if(cfg.cc&&String(cfg.cc).length>3){cfg.cc='51';sv();const c=$('cc');if(c)c.value='51'}
async function dk(pw,salt){const m=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:salt,iterations:150000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
function snap(){const d={};SK.forEach(k=>{const v=localStorage.getItem(k);if(v!==null)d[k]=v});return d}
async function pack(pw){sv();const d=snap(),o={app:'jarvis',v:2,date:new Date().toISOString()};
if(pw){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),k=await dk(pw,salt);
const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k,enc.encode(JSON.stringify(d))));
o.enc=1;o.salt=b64(salt);o.iv=b64(iv);o.data=b64(ct)}else{o.enc=0;o.data=d}
return JSON.stringify(o)}
async function unpack(txt,pw){let o;try{o=JSON.parse(txt)}catch(e){throw new Error('El respaldo no es válido')}
if(o&&!o.app&&SK.some(k=>k in o))return o;
if(!o||o.app!='jarvis')throw new Error('Ese archivo no es un respaldo de Jarvis');
if(o.enc){if(!pw)throw new Error('Este respaldo tiene contraseña. Escríbela arriba.');
try{const k=await dk(pw,unb(o.salt));return JSON.parse(dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb(o.iv)},k,unb(o.data))))}catch(e){throw new Error('Contraseña incorrecta')}}
return o.data}
const css='width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:10px;font:12px ui-monospace,monospace';
const row=document.createElement('div');row.className='row';
row.innerHTML='<label>RESPALDO Y SEGURIDAD DE TUS DATOS</label><div id="bs" style="font-size:12px;margin-bottom:10px"></div><input id="bp" type="password" placeholder="contraseña (opcional, protege tus claves)" style="'+css+'"><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px"><button class="hb" id="bd">DESCARGAR</button><button class="hb" id="bh">COMPARTIR</button><button class="hb" id="bc">COPIAR TEXTO</button></div><div style="margin:16px 0 6px;font-size:10px;letter-spacing:2px;color:#5b7a99">RESTAURAR</div><div style="display:flex;flex-wrap:wrap;gap:8px"><button class="hb" id="bf2">ELEGIR ARCHIVO</button><button class="hb" id="br">RESTAURAR TEXTO</button></div><textarea id="bk" placeholder="o pega aquí tu respaldo y toca RESTAURAR TEXTO" style="'+css+';height:60px;margin-top:8px"></textarea><input id="bf" type="file" accept=".json,application/json" style="display:none"><div id="bm" style="font-size:11px;margin-top:8px;min-height:14px;color:#5b7a99"></div><div id="bo" style="font-size:10px;margin-top:6px;color:#5b7a99"></div>';
$('t4').append(row);
const msg=(t,c)=>{const m=$('bm');m.style.color=c||'#5b7a99';m.textContent=t};
function stat(){const l=+localStorage.jlastbk||0,s=$('bs');
if(!l){s.style.color='#ffb02e';s.textContent='⚠ Aún no has hecho ningún respaldo'}
else{const d=Math.floor((Date.now()-l)/864e5);s.style.color=d>7?'#ffb02e':'#2fffa0';s.textContent=(d>7?'⚠ ':'✔ ')+'Último respaldo: '+(d<1?'hoy':'hace '+d+' día'+(d>1?'s':''))}}
const stamp=()=>{localStorage.jlastbk=Date.now();stat()};
async function mk(){const pw=$('bp').value;if(pw&&pw.length<4){msg('La contraseña debe tener al menos 4 caracteres','#ff4f6d');return null}return await pack(pw)}
const fname=()=>'jarvis-respaldo-'+new Date().toISOString().slice(0,10)+'.json';
$('bd').onclick=async()=>{try{const t=await mk();if(!t)return;const b=new Blob([t],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=fname();document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);stamp();msg('Guardado en tu carpeta Descargas'+($('bp').value?' (con contraseña)':' (sin contraseña: incluye tus claves, no lo compartas)'),'#2fffa0')}catch(e){msg('No se pudo descargar: '+e.message,'#ff4f6d')}};
$('bh').onclick=async()=>{try{const t=await mk();if(!t)return;const f=new File([t],fname(),{type:'application/json'});
if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Respaldo Jarvis'});stamp();msg('Compartido','#2fffa0')}
else msg('Tu navegador no permite compartir archivos. Usa DESCARGAR.','#ffb02e')}catch(e){if(e.name!='AbortError')msg('No se pudo compartir','#ff4f6d')}};
$('bc').onclick=async()=>{try{const t=await mk();if(!t)return;$('bk').value=t;try{await navigator.clipboard.writeText(t);msg('Copiado. Pégalo en un lugar privado.','#2fffa0')}catch(e){$('bk').select();msg('Copia el texto de abajo manualmente.','#ffb02e')}stamp()}catch(e){msg(e.message,'#ff4f6d')}};
async function restore(txt){try{const d=await unpack(txt,$('bp').value),n=SK.filter(k=>typeof d[k]=='string').length;if(!n)throw new Error('El respaldo está vacío');
let f=0;try{f=JSON.parse(d.jfacts||'[]').length}catch(e){}
if(!confirm('Se reemplazarán tus datos actuales por el respaldo ('+f+' recuerdos). ¿Continuar?'))return;
SK.forEach(k=>{if(typeof d[k]=='string')localStorage.setItem(k,d[k])});
msg('Restaurado. Recargando...','#2fffa0');setTimeout(()=>location.reload(),400)}catch(e){msg(e.message,'#ff4f6d')}}
$('br').onclick=()=>restore($('bk').value);
$('bf2').onclick=()=>$('bf').click();
$('bf').onchange=async()=>{const f=$('bf').files[0];if(!f)return;try{await restore(await f.text())}catch(e){msg('No pude leer el archivo','#ff4f6d')}$('bf').value=''};

const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open('jarvis-bk',1);r.onupgradeneeded=()=>r.result.createObjectStore('s');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const idbSet=async v=>{const d=await idb();return new Promise((res,rej)=>{const t=d.transaction('s','readwrite');t.objectStore('s').put(v,'last');t.oncomplete=res;t.onerror=rej})};
const idbGet=async()=>{const d=await idb();return new Promise((res,rej)=>{const q=d.transaction('s').objectStore('s').get('last');q.onsuccess=()=>res(q.result);q.onerror=rej})};
const pj=(k,d)=>{try{return JSON.parse(localStorage[k])||d}catch(e){return d}};
const has=()=>pj('jkeys',[]).length>0||pj('jfacts',[]).length>0||(cfg.dir&&cfg.dir.length>0);
let lastS='';
async function tick(){try{if(!has())return;sv();const d=snap(),s=JSON.stringify(d);if(s===lastS)return;lastS=s;await idbSet({t:Date.now(),d:d})}catch(e){}}
(async()=>{try{
if(!has()&&!sessionStorage.jrest){const sn=await idbGet();
if(sn&&sn.d){const d2=sn.d,ok=(()=>{try{return JSON.parse(d2.jkeys||'[]').length>0||JSON.parse(d2.jfacts||'[]').length>0}catch(e){return false}})();
if(ok){sessionStorage.jrest='1';SK.forEach(k=>{if(typeof d2[k]=='string')localStorage.setItem(k,d2[k])});location.reload();return}}}
}catch(e){}
setInterval(tick,20000);addEventListener('pagehide',tick);setTimeout(tick,3000)})();
(async()=>{let ok=false;try{if(navigator.storage&&navigator.storage.persist){ok=await navigator.storage.persisted();if(!ok)ok=await navigator.storage.persist()}}catch(e){}
const o=$('bo');if(o){o.style.color=ok?'#2fffa0':'#5b7a99';o.textContent=ok?'✔ Almacenamiento protegido: Android no borrará tus datos por falta de espacio':'Almacenamiento no protegido. Instala Jarvis como app para mejorarlo.'}})();
stat();
try{const l=+localStorage.jlastbk||0,hoy=new Date().toDateString();
if(has()&&(!l||Date.now()-l>7*864e5)&&localStorage.jbkn!=hoy){localStorage.jbkn=hoy;add('j','Hace tiempo que no haces un respaldo. Ve a ⚙ → SISTEMA → RESPALDO y toca DESCARGAR.',Date.now(),false)}}catch(e){}
})();
