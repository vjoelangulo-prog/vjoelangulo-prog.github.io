(function(){
const $=i=>document.getElementById(i);
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.style.cssText=c;if(x!=null)e.textContent=x;return e};
const ld=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v===null?d:v}catch(e){return d}};
const N=(window.Android&&typeof window.Android.agendaGet==='function')?window.Android:null;
const ID='https://identitytoolkit.googleapis.com/v1/accounts:';
const FB=()=>Object.assign({},window.JFB||{},ld('jfbcfg',{}));
const accs=()=>ld('jaccs',[]);
const saveAccs=a=>localStorage.setItem('jaccs',JSON.stringify(a));
const ERR={EMAIL_EXISTS:'Ese correo ya tiene cuenta. Toca ENTRAR.',INVALID_LOGIN_CREDENTIALS:'Correo o contraseña incorrectos',INVALID_PASSWORD:'Correo o contraseña incorrectos',EMAIL_NOT_FOUND:'Ese correo no tiene cuenta',WEAK_PASSWORD:'La contraseña es muy débil (mínimo 6)',INVALID_EMAIL:'Correo no válido',TOO_MANY_ATTEMPTS_TRY_LATER:'Demasiados intentos. Espera unos minutos.',OPERATION_NOT_ALLOWED:'En Firebase activa el acceso por correo y contraseña',USER_DISABLED:'Esta cuenta está desactivada'};
function errMsg(j){const m=(j&&j.error&&j.error.message)||'';const k=m.split(' ')[0];if(ERR[k])return ERR[k];if(/API key not valid|API_KEY_INVALID/i.test(m))return 'La API key de Firebase no es válida';return m||'Error de conexión'}
function pendSwitch(from,to,drop){
try{sv()}catch(e){}
if(from)try{if(N)localStorage.setItem('jnat_'+from,N.agendaGet())}catch(e){}
try{if(N&&typeof N.resetAccount==='function')N.resetAccount()}catch(e){}
localStorage.setItem('jpend',JSON.stringify({from:from,to:to,drop:!!drop}));
setTimeout(()=>location.reload(),150)}
const JACC=window.JACC={
onLogin(uid,email){
const l=accs(),i=l.findIndex(a=>a.uid==uid);if(i<0)l.push({uid:uid,email:email});else l[i].email=email;saveAccs(l);
localStorage.removeItem('jguest');
const act=localStorage.getItem('jactive')||'';
if(act===uid)return false;
if(act||localStorage.getItem('jprof_'+uid)){pendSwitch(act,uid,false);return true}
localStorage.setItem('jactive',uid);return false},
onLogout(wipe){
const act=localStorage.getItem('jactive')||'';
localStorage.removeItem('jacc');localStorage.removeItem('jguest');
if(wipe&&act)saveAccs(accs().filter(a=>a.uid!=act));
if(act)pendSwitch(act,'',wipe);else setTimeout(()=>location.reload(),120)}};
(function(){const s=ld('jacc',null);
if(s&&s.uid){const l=accs();if(!l.some(a=>a.uid==s.uid)){l.push({uid:s.uid,email:s.email});saveAccs(l)}if(!localStorage.getItem('jactive'))localStorage.setItem('jactive',s.uid)}})();
(function(){const to=localStorage.getItem('jrestorenat');if(!to||!N)return;localStorage.removeItem('jrestorenat');
try{const o=JSON.parse(localStorage.getItem('jnat_'+to)||'{}');
(o.tasks||[]).forEach(t=>{if(!t.done&&t.t)N.taskAdd(t.t,String(t.due||0))});
(o.rem||[]).forEach(r=>{if(r.at>Date.now())N.remAdd(r.t,String(r.at))})}catch(e){}})();
const IN='width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:14px;font:15px ui-monospace,monospace;margin-bottom:10px';
function gate(){
const C=FB();if(!(C.apiKey&&C.projectId))return;
if(ld('jacc',null)||localStorage.getItem('jguest')=='1'||localStorage.getItem('jgate')=='0'||$('gate'))return;
const g=mk('div','position:fixed;inset:0;z-index:100;background:radial-gradient(circle at 50% 28%,#0b1a2e,#04070d 75%);display:flex;align-items:center;justify-content:center;padding:24px;overflow-y:auto');g.id='gate';
const box=mk('div','width:100%;max-width:360px;text-align:center');
const e=mk('input',IN),p=mk('input',IN),msg=mk('div','font-size:12px;min-height:34px;margin:4px 0 10px;line-height:1.5;color:#5b7a99');
e.type='email';e.placeholder='correo electrónico';e.autocomplete='username';e.value=localStorage.getItem('jprefill')||'';localStorage.removeItem('jprefill');
p.type='password';p.placeholder='contraseña';p.autocomplete='current-password';
let busy=false;
const say=(t,ok)=>{msg.style.color=ok?'#2fffa0':'#ff4f6d';msg.textContent=t};
const btn=(t,f,main)=>{const b=mk('button','width:100%;margin-bottom:10px;padding:14px;'+(main?'background:var(--a);color:#04070d;':''),t);b.className='hb';b.onclick=async()=>{if(busy)return;busy=true;try{await f()}catch(x){say(x.message||String(x),false)}busy=false};return b};
async function go(kind){const em=e.value.trim();
if(!em.includes('@')||p.value.length<6)throw new Error('Escribe tu correo y una contraseña de 6 o más caracteres');
say('Conectando…',true);let r,j;
try{r=await fetch(ID+(kind=='up'?'signUp':'signInWithPassword')+'?key='+C.apiKey,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:em,password:p.value,returnSecureToken:true})});j=await r.json()}catch(x){throw new Error('Sin conexión a internet')}
if(!r.ok)throw new Error(errMsg(j));
localStorage.setItem('jacc',JSON.stringify({email:j.email,uid:j.localId,idToken:j.idToken,refreshToken:j.refreshToken,exp:Date.now()+(+j.expiresIn||3600)*1000-60000}));
say('¡Listo!',true);if(!JACC.onLogin(j.localId,j.email))location.reload()}
box.append(mk('div','font-size:30px;letter-spacing:6px;color:var(--a);text-shadow:0 0 16px var(--a);margin-bottom:6px','J.A.R.V.I.S'),mk('div','font-size:12px;color:#5b7a99;margin-bottom:26px;letter-spacing:2px','INICIA SESIÓN PARA CONTINUAR'),e,p,msg,
btn('ENTRAR',()=>go('in'),true),btn('CREAR CUENTA',()=>go('up')),
btn('OLVIDÉ MI CONTRASEÑA',async()=>{if(!e.value.includes('@'))throw new Error('Escribe tu correo arriba');
const r=await fetch(ID+'sendOobCode?key='+C.apiKey,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requestType:'PASSWORD_RESET',email:e.value.trim()})});
if(!r.ok)throw new Error(errMsg(await r.json()));say('Te mandé un correo para cambiar la contraseña',true)}),
btn('CONTINUAR SIN CUENTA',()=>{localStorage.setItem('jguest','1');g.remove()}));
g.append(box);document.body.append(g)}
function accCard(){const t6=$('t6');if(!t6)return;const old=$('acc24');if(old)old.remove();
const card=mk('div');card.className='row';card.id='acc24';card.append(mk('label','','CUENTAS EN ESTE DISPOSITIVO'));
const list=mk('div'),act=localStorage.getItem('jactive')||'',sess=ld('jacc',null),items=accs();
const hb=(t,f)=>{const b=mk('button','margin:4px 6px 0 0',t);b.className='hb';b.onclick=f;return b};
if(!items.length)list.append(mk('div','font-size:12px;line-height:1.5;margin:6px 0;color:#5b7a99','Todavía no hay cuentas. Crea una desde el cuadro de arriba.'));
items.forEach(a=>{const isA=!!sess&&a.uid==act,r=mk('div','display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:8px 0;border-bottom:1px solid #ffffff12');
r.append(mk('div','flex:1;min-width:120px;font-size:13px;word-break:break-all;color:'+(isA?'#2fffa0':'#cfe8ff'),(isA?'● ':'○ ')+a.email+(isA?' (activa)':'')));
if(!isA){r.append(hb('CAMBIAR',()=>{localStorage.setItem('jprefill',a.email);JACC.onLogout(false)}));
r.append(hb('QUITAR',()=>{if(!confirm('Se quitarán de este dispositivo los datos locales de '+a.email+'. Si los subiste a la nube, siguen allí. ¿Seguro?'))return;
localStorage.removeItem('jprof_'+a.uid);localStorage.removeItem('jnat_'+a.uid);saveAccs(accs().filter(x=>x.uid!=a.uid));accCard()}))}
list.append(r)});
const sel=mk('select',IN+';margin-top:14px');[['1','Sí: pedir cuenta al abrir Jarvis'],['0','No: abrir directo']].forEach(o=>{const op=mk('option','',o[1]);op.value=o[0];sel.append(op)});
sel.value=localStorage.getItem('jgate')=='0'?'0':'1';sel.onchange=()=>localStorage.setItem('jgate',sel.value);
card.append(list,hb('+ AGREGAR OTRA CUENTA',()=>JACC.onLogout(false)),mk('label','margin-top:16px','PANTALLA DE INICIO'),sel);
const first=t6.firstElementChild;if(first)first.after(card);else t6.append(card)}
function label(){const a=ld('jacc',null),sm=document.querySelector('#top small');
if(sm){sm.style.cssText='display:block;font-size:9px;color:#5b7a99;letter-spacing:2px;margin-top:2px;max-width:56vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';sm.textContent=a&&a.email?'● '+a.email:'SISTEMA EN LINEA'}}
gate();accCard();label();
})();
