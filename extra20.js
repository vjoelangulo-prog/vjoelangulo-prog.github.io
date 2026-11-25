(function(){
const $=i=>document.getElementById(i),t6=$('t6');
if(!t6)return;
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.style.cssText=c;if(x!=null)e.textContent=x;return e};
const ld=(k,d)=>{try{return JSON.parse(localStorage[k])||d}catch(e){return d}};
const IN='width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:10px;font:13px ui-monospace,monospace;margin-bottom:8px';
const SK=['jkey','jkeys','jkeyi','jcfg','jfacts','jhist','jlog','jcol'];
const inApp=/JarvisApp/.test(navigator.userAgent);
const enc=new TextEncoder(),dec=new TextDecoder();
const b64=u=>{let s='';u.forEach(c=>s+=String.fromCharCode(c));return btoa(s)};
const unb=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const ID='https://identitytoolkit.googleapis.com/v1/accounts:';
let C=Object.assign({},window.JFB||{},ld('jfbcfg',{})),A=ld('jacc',null),busy=false,editing=false;
const saveC=()=>{localStorage.jfbcfg=JSON.stringify(C)};
const saveA=()=>{if(A)localStorage.jacc=JSON.stringify(A);else localStorage.removeItem('jacc')};
const ERR={EMAIL_EXISTS:'Ese correo ya tiene cuenta. Toca ENTRAR.',INVALID_LOGIN_CREDENTIALS:'Correo o contraseña incorrectos',INVALID_PASSWORD:'Correo o contraseña incorrectos',EMAIL_NOT_FOUND:'Ese correo no tiene cuenta',WEAK_PASSWORD:'La contraseña es muy débil (mínimo 6)',INVALID_EMAIL:'Correo no válido',TOO_MANY_ATTEMPTS_TRY_LATER:'Demasiados intentos. Espera unos minutos.',OPERATION_NOT_ALLOWED:'En Firebase activa el acceso por Correo y contraseña',USER_DISABLED:'Esta cuenta está desactivada',CREDENTIAL_TOO_OLD_LOGIN_AGAIN:'Cierra sesión, vuelve a entrar y repite',INVALID_IDP_RESPONSE:'Google rechazó el inicio de sesión'};
function errMsg(j){const m=(j&&j.error&&j.error.message)||'';const k=m.split(' ')[0];if(ERR[k])return ERR[k];if(/API key not valid|API_KEY_INVALID/i.test(m))return 'La API key de Firebase no es válida';if(/PERMISSION_DENIED|Missing or insufficient/i.test(m))return 'Firestore bloqueó el acceso: revisa las reglas';return m||'Error de conexión'}
async function post(url,body){let r,j;try{r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});j=await r.json()}catch(e){throw new Error('Sin conexión a internet')}if(!r.ok)throw new Error(errMsg(j));return j}
function setSession(j){A={email:j.email,uid:j.localId,idToken:j.idToken,refreshToken:j.refreshToken,exp:Date.now()+(+j.expiresIn||3600)*1000-60000};saveA();if(window.JACC)JACC.onLogin(j.localId,j.email)}
async function token(){if(!A)throw new Error('Sin sesión');if(Date.now()<A.exp)return A.idToken;
let r,j;try{r=await fetch('https://securetoken.googleapis.com/v1/token?key='+C.apiKey,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(A.refreshToken)});j=await r.json()}catch(e){throw new Error('Sin conexión a internet')}
if(!r.ok){A=null;saveA();render();throw new Error('Sesión vencida: entra de nuevo')}
A.idToken=j.id_token;A.refreshToken=j.refresh_token;A.exp=Date.now()+(+j.expires_in||3600)*1000-60000;saveA();return A.idToken}
const DOC=()=>'https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(C.projectId)+'/databases/(default)/documents/users/'+A.uid;
async function fs(method,qs,body){const t=await token();let r,j;
try{r=await fetch(DOC()+(qs||''),{method:method,headers:{'Authorization':'Bearer '+t,'content-type':'application/json'},body:body?JSON.stringify(body):undefined});j=await r.json()}catch(e){throw new Error('Sin conexión a internet')}
if(r.status==404&&!/database/i.test((j.error&&j.error.message)||''))return null;
if(r.status==404)throw new Error('Crea la base de datos Firestore en tu proyecto');
if(!r.ok)throw new Error(errMsg(j));return j}
async function dk(pw,salt){const m=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:salt,iterations:150000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function seal(txt,pw){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),k=await dk(pw,salt);return JSON.stringify({s:b64(salt),i:b64(iv),d:b64(new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k,enc.encode(txt))))})}
async function unseal(blob,pw){try{const o=JSON.parse(blob),k=await dk(pw,unb(o.s));return dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb(o.i)},k,unb(o.d)))}catch(e){throw new Error('Clave de cifrado incorrecta')}}
function snapObj(){try{sv()}catch(e){}const d={};SK.forEach(k=>{const v=localStorage.getItem(k);if(v!==null)d[k]=v});return d}
async function hashOf(d){const o={};SK.forEach(k=>{if(typeof d[k]=='string')o[k]=d[k]});const h=await crypto.subtle.digest('SHA-256',enc.encode(JSON.stringify(o)));return b64(new Uint8Array(h)).slice(0,16)}
async function upload(pass){const d=snapObj(),blob=await seal(JSON.stringify(d),pass);
await fs('PATCH','?updateMask.fieldPaths=blob&updateMask.fieldPaths=updated&updateMask.fieldPaths=v',{fields:{blob:{stringValue:blob},updated:{integerValue:String(Date.now())},v:{stringValue:String(window.JVER||'')}}});
localStorage.jsynced='1';localStorage.jsynchash=await hashOf(d)}
function applyMem(d){try{const c=JSON.parse(d.jcfg||'{}');Object.keys(cfg).forEach(k=>delete cfg[k]);Object.assign(cfg,c)}catch(e){}
try{const f=JSON.parse(d.jfacts||'[]').map(x=>typeof x=='string'?{c:'Otros',t:x}:x);facts.length=0;facts.push(...f)}catch(e){}
try{const c=JSON.parse(d.jcol||'[]');col.length=0;col.push(...c)}catch(e){}}
async function download(pass){const j=await fs('GET');if(!j||!j.fields||!j.fields.blob)throw new Error('No hay datos guardados en tu cuenta');
const d=JSON.parse(await unseal(j.fields.blob.stringValue,pass));
if(!confirm('Se reemplazarán los datos de este celular por los de tu cuenta. ¿Continuar?'))return;
SK.forEach(k=>{if(typeof d[k]=='string')localStorage.setItem(k,d[k])});applyMem(d);
localStorage.jsynced='1';localStorage.jsynchash=await hashOf(d);say('Restaurado. Recargando…',true);setTimeout(()=>location.reload(),700)}
function loadGIS(){return new Promise((ok,no)=>{if(window.google&&google.accounts&&google.accounts.id)return ok();const s=mk('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=ok;s.onerror=()=>no(new Error('No pude cargar Google. Revisa tu internet.'));document.head.append(s)})}
async function googleBtn(box){await loadGIS();google.accounts.id.initialize({client_id:C.clientId,callback:async r=>{try{say('Conectando con Google…');const j=await post(ID+'signInWithIdp?key='+C.apiKey,{postBody:'id_token='+r.credential+'&providerId=google.com',requestUri:location.origin,returnIdpCredential:true,returnSecureToken:true});setSession(j);render()}catch(e){say(e.message,false)}}});google.accounts.id.renderButton(box,{theme:'filled_blue',size:'large',shape:'pill',text:'continue_with'})}
const card=mk('div');card.className='row';card.append(mk('label','','CUENTA'));
const view=mk('div');view.id='acv';card.append(view);t6.insertBefore(card,t6.firstChild);
const msgEl=mk('div','font-size:12px;margin:8px 0;min-height:16px;line-height:1.5;color:#5b7a99');
function say(t,ok){msgEl.style.color=ok===true?'#2fffa0':ok===false?'#ff4f6d':'#5b7a99';msgEl.textContent=t}
const hb=(t,f)=>{const b=mk('button','margin:4px 8px 0 0',t);b.className='hb';b.onclick=async()=>{if(busy)return;busy=true;try{await f()}catch(e){say(e.message||String(e),false)}busy=false};return b};
const inp=(ph,type,val)=>{const i=mk('input',IN);i.placeholder=ph;i.type=type||'text';if(val)i.value=val;return i};
const note=(t,c)=>mk('div','font-size:12px;line-height:1.5;margin:6px 0;color:'+(c||'#5b7a99'),t);
function render(){view.textContent='';msgEl.textContent='';
if(editing||!C.apiKey||!C.projectId)return cfgView();
if(!A)return loginView();
userView()}
function cfgView(){
view.append(note('Para tener cuenta, Jarvis usa tu propio proyecto gratis de Firebase. Pega aquí sus datos. Se guardan solo en este celular.'));
const a=inp('API key de Firebase (web)','password',C.apiKey||''),p=inp('ID del proyecto (project id)','text',C.projectId||''),g=inp('ID de cliente web de Google (opcional)','text',C.clientId||'');
view.append(a,p,g,hb('GUARDAR CONFIGURACIÓN',async()=>{const k=a.value.replace(/\s+/g,''),pid=p.value.trim();if(k.length<20||pid.length<3)throw new Error('Faltan datos');C.apiKey=k;C.projectId=pid;C.clientId=g.value.trim();saveC();editing=false;render()}));
if(editing)view.append(hb('CANCELAR',()=>{editing=false;render()}));
view.append(msgEl)}
function loginView(){
const e=inp('correo electrónico','email'),p=inp('contraseña','password');
async function go(kind){const em=e.value.trim();if(!em.includes('@')||p.value.length<6)throw new Error('Escribe un correo válido y una contraseña de 6 o más caracteres');say('Conectando…');
const j=await post(ID+(kind=='up'?'signUp':'signInWithPassword')+'?key='+C.apiKey,{email:em,password:p.value,returnSecureToken:true});setSession(j);render()}
view.append(e,p,hb('ENTRAR',()=>go('in')),hb('CREAR CUENTA',()=>go('up')),hb('OLVIDÉ MI CONTRASEÑA',async()=>{if(!e.value.includes('@'))throw new Error('Escribe tu correo arriba');await post(ID+'sendOobCode?key='+C.apiKey,{requestType:'PASSWORD_RESET',email:e.value.trim()});say('Te mandé un correo para cambiar la contraseña',true)}));
view.append(mk('div','font-size:10px;letter-spacing:2px;color:#5b7a99;margin-top:16px','O CON GOOGLE'));
const gb=mk('div','margin:10px 0');view.append(gb);
if(inApp)gb.append(note('Dentro de la app, Google necesita un inicio de sesión nativo (pendiente). Usa tu correo, o entra con Google desde Chrome.','#ffb02e'));
else if(!C.clientId)gb.append(note('Para Google, agrega el ID de cliente web en EDITAR CONFIGURACIÓN.','#ffb02e'));
else googleBtn(gb).catch(x=>gb.append(note(x.message,'#ff4f6d')));
view.append(msgEl,hb('EDITAR CONFIGURACIÓN',()=>{editing=true;render()}))}
function clearMem(){Object.keys(cfg).forEach(k=>delete cfg[k]);facts.length=0;col.length=0}
function out(wipe){if(window.JACC){JACC.onLogout(wipe);return}A=null;saveA();['jsynced','jpass','jsynchash'].forEach(k=>localStorage.removeItem(k));
if(wipe){clearMem();SK.forEach(k=>localStorage.removeItem(k));setTimeout(()=>location.reload(),300)}else render()}
async function delAcc(){if(!confirm('Se borrará tu cuenta y tus datos de la nube. Los datos de este celular se quedan. ¿Seguro?'))return;
try{await fs('DELETE')}catch(e){}
const t=await token();await post(ID+'delete?key='+C.apiKey,{idToken:t});out(true)}
async function status(st){const j=await fs('GET');
if(!j||!j.fields||!j.fields.blob){st.textContent='Nube: vacía. Escribe tu clave de cifrado y toca SUBIR AHORA.';return}
const d=new Date(+j.fields.updated.integerValue);
st.textContent='Nube: datos del '+d.toLocaleString('es',{dateStyle:'medium',timeStyle:'short'})+(localStorage.jsynced=='1'?' · sincronización automática activa':' · aquí aún no sincronizas: toca DESCARGAR para traerlos, o SUBIR para reemplazarlos.')}
function userView(){
view.append(mk('div','font-size:14px;margin-bottom:4px','✔ '+A.email));
const st=mk('div','font-size:12px;color:#5b7a99;margin-bottom:10px;line-height:1.5','Revisando la nube…');view.append(st);
const pw=inp('clave de cifrado de tus datos','password',localStorage.jpass||'');
view.append(note('Tus datos se cifran con esta clave antes de subirse: ni Google ni yo podemos leerlos. Si la olvidas, no se pueden recuperar. Usa la misma en todos tus dispositivos.'),pw);
const need=()=>{if(pw.value.length<6)throw new Error('La clave de cifrado debe tener 6 o más caracteres');localStorage.jpass=pw.value};
view.append(hb('SUBIR AHORA',async()=>{need();say('Subiendo…');await upload(pw.value);say('Datos guardados en tu cuenta ✔',true);status(st).catch(()=>{})}),
hb('DESCARGAR DE LA NUBE',async()=>{need();say('Descargando…');await download(pw.value)}),
hb('CERRAR SESIÓN',()=>out(false)),
hb('CERRAR SESIÓN Y BORRAR ESTE CELULAR',()=>{if(confirm('Se borrarán los datos de este celular. Siguen en la nube si los subiste. ¿Seguro?'))out(true)}),
hb('ELIMINAR MI CUENTA',delAcc),
hb('EDITAR CONFIGURACIÓN',()=>{editing=true;render()}),msgEl);
status(st).catch(e=>{st.textContent='No pude revisar la nube: '+e.message})}
async function auto(){if(!A||!C.projectId||localStorage.jsynced!='1'||!localStorage.jpass)return;try{const h=await hashOf(snapObj());if(h==localStorage.jsynchash)return;await upload(localStorage.jpass)}catch(e){}}
setInterval(auto,90000);document.addEventListener('visibilitychange',()=>{if(document.hidden)auto()});
render();
})();
