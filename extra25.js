(function(){
const $=i=>document.getElementById(i);
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.style.cssText=c;if(x!=null)e.textContent=x;return e};
const ld=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v===null?d:v}catch(e){return d}};
const OWNER='vjoelangulo-prog',REPO={web:'vjoelangulo-prog.github.io',android:'jarvis-android'};
const GEM='gemini-3.8-flash',CLAUDE='claude-sonnet-5-5',KP='app/src/main/java/com/vic/jarvis/';
const LOG=window.JDEVLOG||{get:()=>[],clear:()=>{},log:()=>{}};
const A=()=>cfg.addr||'señor';
const say=t=>{add('j',t);speak(t)};
const tok=()=>localStorage.getItem('jdevtoken')||'';
const MAPA={'index.html':'estructura de la página y carga de módulos','boot.js':'restaura datos al abrir','boot2.js':'cambio de cuenta al arrancar','devlog.js':'registro de errores','native.js':'puente con la app Android','extra.js':'varias claves de Gemini y respaldo','extra2.js':'ajustes de escucha','extra3.js':'esfera de partículas y árbol de memoria','extra4.js':'límite de tiempo y modelos de respaldo','extra5.js':'micrófono de la esfera y voz del celular','extra6.js':'WhatsApp por voz','extra7.js':'llamadas por voz','extra8.js':'agenda de contactos','extra9.js':'voz natural de Gemini','extra10.js':'respaldo cifrado','extra11.js':'abrir apps, YouTube, mapas y temporizadores','extra12.js':'recordatorios con aviso','extra13.js':'personalidad, manos libres y permisos por voz','extra14.js':'seguridad con Morse y palabra secreta','extra15.js':'pestaña SEGURIDAD','extra16.js':'calendario, hora y permisos','extra17.js':'voz natural fluida e interrupción','extra18.js':'modo siempre activo','extra19.js':'pestaña CUENTA y acordeones','extra20.js':'cuenta Firebase, cifrado y nube','extra21.js':'agenda de pendientes y alarmas','extra22.js':'elección de modelo y código en el chat','extra23.js':'precalentar conexión y sonidito','extra24.js':'inicio de sesión y varias cuentas','extra25.js':'autodiagnóstico y reparación de código','sw.js':'service worker de la app'};
async function gh(path,o){
o=o||{};const h={Accept:'application/vnd.github+json'};
if(tok())h.Authorization='Bearer '+tok();
if(o.body)h['Content-Type']='application/json';
let r;try{r=await fetch('https://api.github.com'+path,{method:o.method||'GET',headers:h,body:o.body,cache:'no-store'})}catch(e){throw new Error('Sin conexión a GitHub')}
const j=await r.json().catch(()=>({}));
if(r.status==401)throw new Error('El token de GitHub no es válido');
if(r.status==403||r.status==429)throw new Error(/rate limit/i.test(j.message||'')?'GitHub limitó las consultas: guarda un token en CÓDIGO':'GitHub rechazó el permiso: el token necesita repo');
if(r.status==404)throw new Error('No encontré eso en GitHub');
if(!r.ok)throw new Error(j.message||('Error de GitHub '+r.status));
return j}
const b64=s=>{const b=new TextEncoder().encode(s);let o='';for(let i=0;i<b.length;i+=8192)o+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return btoa(o)};
const unb64=c=>new TextDecoder().decode(Uint8Array.from(atob(String(c).replace(/\s/g,'')),x=>x.charCodeAt(0)));
const ep=p=>p.split('/').map(encodeURIComponent).join('/');
async function getFile(kind,p){const j=await gh('/repos/'+OWNER+'/'+REPO[kind]+'/contents/'+ep(p)+'?ref=main');return{text:unb64(j.content),sha:j.sha}}
async function putFile(kind,p,text,sha,msg){return gh('/repos/'+OWNER+'/'+REPO[kind]+'/contents/'+ep(p),{method:'PUT',body:JSON.stringify({message:msg,content:b64(text),sha:sha,branch:'main'})})}
async function readSrc(kind,p){try{return await getFile(kind,p)}catch(e){if(kind!='web')throw e;const r=await fetch(location.origin+'/'+p+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw e;return{text:await r.text(),sha:null}}}
function allowed(kind,p){p=String(p||'');if(/\.\.|^\/|\.github|fbconfig|\.gitignore|\.env|claves/i.test(p))return false;
return kind=='web'?/^[A-Za-z0-9_.-]+\.(js|html|json)$/.test(p):/^app\/src\/main\/.+\.(kt|xml)$/.test(p)}
function excerpt(t,line){if(t.length<=22000)return t;
const L=t.split('\n');if(!line||L.length<5)return t.slice(0,22000);
const a=Math.max(0,line-40),b=Math.min(L.length,line+40);
return '(fragmento: líneas '+(a+1)+' a '+b+')\n'+L.slice(a,b).join('\n')}
function keysList(){const ks=[];if(typeof key!=='undefined'&&key)ks.push(key);ld('jkeys',[]).forEach(o=>{if(o&&o.k&&ks.indexOf(o.k)<0)ks.push(o.k)});return ks}
const parseJ=t=>{t=String(t);const a=t.indexOf('{'),b=t.lastIndexOf('}');return JSON.parse(a>=0&&b>a?t.slice(a,b+1):t)};
async function gemJSON(system,user){let err=null;
for(const k of keysList()){const c=new AbortController(),t=setTimeout(()=>c.abort(),75000);
try{const r=await fetch(new URL('https://generativelanguage.googleapis.com/v1beta/models/'+GEM+':generateContent'),{method:'POST',headers:{'x-goog-api-key':k,'content-type':'application/json'},signal:c.signal,body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text:user}]}],generationConfig:{responseMimeType:'application/json',maxOutputTokens:6000}})});
const j=await r.json();clearTimeout(t);if(j.error){err=new Error(j.error.message);continue}
return j.candidates[0].content.parts[0].text}catch(e){clearTimeout(t);err=e}}
throw err||new Error('No hay clave de Gemini')}
async function claudeJSON(system,user){const k=localStorage.getItem('jdevclaude');if(!k)return null;
const c=new AbortController(),t=setTimeout(()=>c.abort(),90000);
try{const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':k,'anthropic-version':'2023-06-01','content-type':'application/json','anthropic-dangerous-direct-browser-access':'true'},signal:c.signal,body:JSON.stringify({model:CLAUDE,max_tokens:6000,system:system,messages:[{role:'user',content:user}]})});
const j=await r.json();clearTimeout(t);if(!r.ok)return null;return j.content[0].text}catch(e){clearTimeout(t);return null}}
async function askAI(s,u){const c=await claudeJSON(s,u);return c||gemJSON(s,u)}
const MODS=[['extra13.js',()=>!!$('hf')],['extra14.js',()=>!!window.JSEC],['extra15.js',()=>!!$('t5')],['extra19.js',()=>!!$('t6')],['extra21.js',()=>!!$('t7')],['extra24.js',()=>!!window.JACC]];
function health(){const p=[];
['send','speak','call','add','sv','S'].forEach(n=>{let ok=false;try{ok=new Function('return typeof '+n)()==='function'}catch(e){}if(!ok)p.push({k:'base',f:'',m:'Falta la función base '+n})});
MODS.forEach(m=>{const has=!!document.querySelector('script[src*="'+m[0]+'"]');let ok=false;try{ok=m[1]()}catch(e){}
if(!has)p.push({k:'modulo',f:m[0],m:'El módulo '+m[0]+' no está conectado a la página'});else if(!ok)p.push({k:'modulo',f:m[0],m:'El módulo '+m[0]+' no se inició'})});
if(!keysList().length)p.push({k:'config',f:'',m:'No hay ninguna clave de Gemini guardada'});
if(/JarvisApp/.test(navigator.userAgent)&&!window.Android)p.push({k:'nativo',f:'native.js',m:'La app nativa no expone su puente'});
return p}
const report=()=>({errs:LOG.get().filter(e=>Date.now()-e.ts<2*864e5),probs:health()});
function resumen(R){const n=R.errs.length+R.probs.length;
if(!n)return 'Todo en orden, '+A()+'. No tengo errores registrados y todos mis módulos están activos.';
const f=[];R.errs.concat(R.probs).forEach(x=>{if(x.f&&f.indexOf(x.f)<0)f.push(x.f)});
return 'Encontré '+n+(n==1?' problema':' problemas')+', '+A()+(f.length?' en '+f.slice(0,3).join(', '):'')+'.'}
const filesFor=R=>{const s=[];R.errs.concat(R.probs).forEach(x=>{if(x.f&&MAPA[x.f]&&s.indexOf(x.f)<0)s.push(x.f)});return s.slice(0,2)};
let PEND=null,PENDQ=null;
const SYS_WEB='Eres un ingeniero senior de JavaScript que mantiene la app web Jarvis. Recibirás errores registrados, problemas detectados y el código fuente actual de los archivos implicados. Responde SOLO un JSON: {"diagnostico":"qué falla y por qué, en español sencillo, máximo 2 frases","arreglo":"qué cambiarías, en 1 frase","riesgo":"bajo|medio|alto","edits":[{"file":"nombre exacto del archivo","find":"texto EXACTO y ÚNICO que aparece en el archivo, lo más corto posible","replace":"texto nuevo"}]}. Reglas: haz el cambio mínimo; copia find carácter por carácter del código recibido y debe aparecer una sola vez; no añadas dependencias, URLs externas, claves ni datos personales; conserva la estructura del archivo (los .js son funciones autoejecutables); si no estás seguro, o el problema no está en el código (por ejemplo una clave, el internet o un permiso), devuelve edits vacío y explica qué debe hacer el usuario.';
const SYS_KT='Eres un ingeniero senior de Kotlin y Android que mantiene la app Jarvis. Recibirás errores del compilador y el código fuente de los archivos implicados. Responde SOLO un JSON: {"diagnostico":"qué falla y por qué, en español sencillo, máximo 2 frases","arreglo":"qué cambiarías, en 1 frase","riesgo":"bajo|medio|alto","edits":[{"file":"ruta completa del archivo tal como aparece","find":"texto EXACTO y ÚNICO que aparece en el archivo","replace":"texto nuevo"}]}. Reglas: arregla solo el error indicado con el cambio más pequeño posible; copia find carácter por carácter y debe aparecer una sola vez; no cambies permisos, claves ni URLs; mantén las llaves balanceadas; si no estás seguro devuelve edits vacío.';
const bal=s=>(s.match(/\{/g)||[]).length-(s.match(/\}/g)||[]).length;
async function validate(kind,edits){const by={};
for(const e of edits){if(!e||!e.file||typeof e.find!=='string'||typeof e.replace!=='string'||!e.find)throw new Error('el arreglo propuesto está incompleto');
if(!allowed(kind,e.file))throw new Error('no se me permite cambiar '+e.file);
(by[e.file]=by[e.file]||[]).push(e)}
const out=[];
for(const f in by){const cur=await getFile(kind,f);let t=cur.text;
for(const e of by[f]){const n=t.split(e.find).length-1;if(n!==1)throw new Error('el cambio no coincide exactamente con el código ('+n+' coincidencias)');t=t.replace(e.find,()=>e.replace)}
if(/\.js$/.test(f)){try{new Function(t)}catch(x){throw new Error('dejaría un error de sintaxis: '+x.message)}}
if(/\.json$/.test(f)){try{JSON.parse(t)}catch(x){throw new Error('dejaría un JSON inválido')}}
if(/\.html$/.test(f)&&t.indexOf('</html>')<0)throw new Error('dañaría el HTML');
if(/\.kt$/.test(f)&&bal(t)!==bal(cur.text))throw new Error('dejaría llaves sin cerrar');
out.push({kind:kind,file:f,old:cur.text,sha:cur.sha,text:t})}
return out}
async function propose(kind,sys,user){
let a;const raw=await askAI(sys,user);
try{a=parseJ(raw)}catch(e){throw new Error('no entendí la respuesta del análisis, intenta de nuevo')}
const d={why:String(a.diagnostico||'').slice(0,400),fix:String(a.arreglo||'').slice(0,200),risk:/^(alto|medio|bajo)$/.test(a.riesgo)?a.riesgo:'medio'};
if(!Array.isArray(a.edits)||!a.edits.length){PEND=null;return{text:d.why||'No encontré un arreglo seguro.'}}
let files;try{files=await validate(kind,a.edits)}catch(e){PEND=null;return{text:d.why+' No pude armar un arreglo seguro: '+e.message+'.'}}
PEND={kind:kind,why:d.why,fix:d.fix,risk:d.risk,files:files,edits:a.edits,ts:Date.now(),tap:kind=='android'||d.risk=='alto'};
return{pend:true,text:d.why+' Propongo: '+d.fix+'. Riesgo '+d.risk+'. '+(PEND.tap?'Para aplicarlo, toque APLICAR en la pestaña CÓDIGO.':'¿Lo aplico?')}}
async function analyzeWeb(){const R=report();
if(!R.errs.length&&!R.probs.length)return{text:resumen(R)};
const fs=filesFor(R);
if(!fs.length)return{text:'Hay '+(R.errs.length+R.probs.length)+' avisos pero no puedo ubicar el archivo. Revisa el registro en la pestaña CÓDIGO.'};
const srcs=[];for(const f of fs){const c=await readSrc('web',f).catch(()=>null);if(c)srcs.push({f:f,t:c.text,line:(R.errs.find(e=>e.f==f&&e.l)||{}).l})}
if(!srcs.length)throw new Error('no pude leer mi código en GitHub');
const user='ERRORES:\n'+JSON.stringify(R.errs.slice(-10).map(e=>({tipo:e.t,mensaje:e.m,archivo:e.f,linea:e.l,veces:e.n})))+'\nPROBLEMAS:\n'+JSON.stringify(R.probs.map(p=>({archivo:p.f,mensaje:p.m})))+'\nAPP_NATIVA: '+(window.Android?'si':'no')+'\n'+srcs.map(s=>'\n### '+s.f+'\n'+excerpt(s.t,s.line)).join('\n');
return propose('web',SYS_WEB,user)}
async function buildInfo(){const j=await gh('/repos/'+OWNER+'/jarvis-android/actions/runs?per_page=3');return j.workflow_runs||[]}
async function buildErrors(run){
const jobs=await gh('/repos/'+OWNER+'/jarvis-android/actions/runs/'+run.id+'/jobs'),job=(jobs.jobs||[])[0];if(!job)return[];
const an=await gh('/repos/'+OWNER+'/jarvis-android/check-runs/'+job.id+'/annotations?per_page=30'),out=[];
(Array.isArray(an)?an:[]).forEach(a=>{const m=String(a.message||''),mm=/(app\/src\/main\/[^\s:]+\.(?:kt|xml)):(\d+)(?::\d+)?\s+(.*)/.exec(m);
if(mm)out.push({f:mm[1],l:+mm[2],m:mm[3].slice(0,200)});else if(/^e:/.test(m))out.push({f:'',l:0,m:m.slice(0,200)})});
return out}
async function analyzeBuild(run){
const errs=await buildErrors(run);
if(!errs.length)return{text:'La compilación falló, pero esa versión no dejó el detalle de los errores. Sube la versión nueva con subir_app.sh para activarlo, o escribe bash errores.sh en Termux.'};
const files=[];errs.forEach(e=>{if(e.f&&allowed('android',e.f)&&files.indexOf(e.f)<0)files.push(e.f)});
if(!files.length)return{text:'Hay errores de compilación pero no puedo ubicar el archivo: '+errs[0].m};
const srcs=[];for(const f of files.slice(0,2)){const c=await getFile('android',f).catch(()=>null);if(c)srcs.push({f:f,t:c.text,line:(errs.find(e=>e.f==f)||{}).l})}
if(!srcs.length)throw new Error('no pude leer el código de la app en GitHub');
const user='ERRORES DEL COMPILADOR:\n'+errs.slice(0,8).map(e=>(e.f||'?')+':'+e.l+' '+e.m).join('\n')+'\n'+srcs.map(s=>'\n### '+s.f+'\n'+excerpt(s.t,s.line)).join('\n');
return propose('android',SYS_KT,user)}
async function buildCheck(analyze){const r=(await buildInfo())[0];if(!r)return{text:'No encontré compilaciones de la app.'};
const when=new Date(r.created_at).toLocaleString('es',{dateStyle:'medium',timeStyle:'short'});
if(r.status!='completed')return{text:'La compilación del '+when+' sigue en marcha. Espera unos minutos.'};
if(r.conclusion=='success')return{text:'La última compilación ('+when+') salió bien. Ya puedes bajar el APK nuevo.'};
if(!analyze)return{text:'La última compilación ('+when+') falló. ¿Analizo el error?',ask:true};
return analyzeBuild(r)}
async function doApply(){const P=PEND;if(!P)throw new Error('no hay ninguna propuesta pendiente');
if(!tok())throw new Error('falta el token de GitHub: guárdalo en la pestaña CÓDIGO');
const done=[];
try{for(const f of P.files){const r=await putFile(P.kind,f.file,f.text,f.sha,'Jarvis: '+P.fix.replace(/[\r\n]+/g,' ').slice(0,70));done.push({kind:P.kind,file:f.file,old:f.old,sha:r.content.sha})}}
catch(e){for(const d of done){try{const c=await getFile(d.kind,d.file);await putFile(d.kind,d.file,d.old,c.sha,'Jarvis: revertido por error')}catch(x){}}
throw new Error('no pude subir el arreglo: '+e.message)}
try{localStorage.setItem('jdevundo',JSON.stringify({ts:Date.now(),kind:P.kind,fix:P.fix,items:done}))}catch(e){}
const h=ld('jdevhist',[]);h.unshift({ts:Date.now(),kind:P.kind,fix:P.fix,files:P.files.map(f=>f.file)});try{localStorage.setItem('jdevhist',JSON.stringify(h.slice(0,15)))}catch(e){}
PEND=null;if(P.kind=='web')LOG.clear();return P}
async function doUndo(){const u=ld('jdevundo',null);if(!u||!u.items)throw new Error('no hay ningún arreglo para deshacer');
if(!tok())throw new Error('falta el token de GitHub');
for(const it of u.items){const c=await getFile(it.kind,it.file);await putFile(it.kind,it.file,it.old,c.sha,'Jarvis: deshacer arreglo')}
localStorage.removeItem('jdevundo')}
const doneText=P=>P.kind=='web'?'Arreglo subido. En 1 o 2 minutos estará publicado: cierra y abre la app dos veces. Si usas Termux, escribe traer antes de publicar otra mejora.':'Arreglo subido. GitHub compilará una versión nueva en unos 8 minutos; luego instala el APK. En Termux, subir_app.sh ya integra el cambio solo.';
const YES=/^\s*(s[ií]|sip|claro|dale|adelante|apl[ií]calo|hazlo|procede|autorizo|autorizado|ok|okey)(\s|$|[.,!¡])/i;
const NO=/^\s*(no|cancela\w*|d[eé]jalo|descarta\w*|olv[ií]dalo)(\s|$|[.,!¡])/i;
const DIAG=/(qu[eé] te (falla|est[aá] fallando)|autodiagn[oó]stico|revisa (tu|tus|tú) (c[oó]digo|sistemas?|errores|m[oó]dulos)|tienes (alg[uú]n )?(error|problema|fallo)|por qu[eé] (te (fall[oó]|falla)|no funcionas)|funcionas bien)/i;
const FIX=/^\s*(?:jarvis[,\s]+)?(?:por favor[,\s]+)?(arr[eé]gl|corr[ií]g|soluci[oó]n|repar)\w*\s*(ya|ahora|eso)?[.!]?\s*$/i;
const UNDO=/((deshaz|deshacer|revierte|revertir|vuelve atr[aá]s|anula).{0,25}(arreglo|cambio|actualizaci[oó]n|correcci[oó]n))/i;
const BUILD=/((compil[oó]|compilaci[oó]n|el apk|la app nativa).{0,40}(bien|fall|error|termin|pas[oó]|listo|verde|rojo))|((qu[eé] pas[oó]|c[oó]mo (va|sali[oó])).{0,20}(compilaci[oó]n|apk))/i;
const CODEQ=/(en qu[eé] archivo|tu c[oó]digo|tu programaci[oó]n|est[aá] programad[oa]|c[oó]mo est[aá]s? hech[oa]|c[oó]mo funciona (tu|la agenda|la voz|el chat|la esfera|la burbuja|la seguridad|la cuenta|el borrado|la memoria|el manos libres)|expl[ií]came (tu|c[oó]mo (haces|funciona (tu|la|el))))/i;
const fresh=()=>PEND&&Date.now()-PEND.ts<180000;
const isLocked=()=>{const l=$('lk');return !!l&&l.textContent=='🔒'};
async function applyVoice(){
if(PEND.tap||cfg.devvoice=='0'){say('Por seguridad, '+A()+', este cambio hay que aplicarlo tocando APLICAR en la pestaña CÓDIGO.');return}
S('thinking','SUBIENDO EL ARREGLO...');const P=await doApply();S('','TOCA PARA HABLAR');
say('Hecho, '+A()+'. '+(P.kind=='web'?'Estará publicado en un par de minutos: cierre y abra la app dos veces.':'GitHub compilará la versión nueva en unos ocho minutos.'))}
async function undoVoice(){S('thinking','DESHACIENDO...');await doUndo();S('','TOCA PARA HABLAR');say('Deshecho, '+A()+'. En un par de minutos queda publicada la versión anterior.')}
async function runDiag(){S('thinking','REVISANDO MI CÓDIGO...');const x=await analyzeWeb();S('','TOCA PARA HABLAR');say(x.text)}
async function runBuild(an){S('thinking','REVISANDO LA COMPILACIÓN...');const x=await buildCheck(an);S('','TOCA PARA HABLAR');if(x.ask)PENDQ={ts:Date.now()};say(x.text)}
async function answerCode(q){S('thinking','BUSCANDO EN MI CÓDIGO...');
const list=Object.keys(MAPA).map(k=>k+': '+MAPA[k]).join('\n');
const pick=parseJ(await gemJSON('Elige los archivos de Jarvis más relevantes para responder la pregunta. Responde SOLO JSON {"files":["archivo1","archivo2"]} con máximo 2 nombres exactos de esta lista:\n'+list,q));
const fs=(pick.files||[]).filter(f=>MAPA[f]).slice(0,2);
if(!fs.length){S('','TOCA PARA HABLAR');say('No sé en qué archivo está eso, '+A()+'.');return}
const srcs=[];for(const f of fs){const c=await readSrc('web',f).catch(()=>null);if(c)srcs.push({f:f,t:c.text})}
const ans=parseJ(await gemJSON('Eres Jarvis y explicas cómo funciona tu propio código. Responde SOLO JSON {"respuesta":"explicación hablada en español, máximo 4 frases, sin código ni listas","archivos":"archivos implicados"}',q+'\n\n'+srcs.map(s=>'### '+s.f+'\n'+excerpt(s.t,0)).join('\n')));
S('','TOCA PARA HABLAR');say(String(ans.respuesta||'No pude explicarlo.')+(ans.archivos?' Está en '+ans.archivos+'.':''))}
const prev=window.send;
window.send=async function(t){t=(t||'').trim();if(!t)return prev(t);
let route='';
if(fresh()&&(YES.test(t)||FIX.test(t)))route='apply';
else if(fresh()&&NO.test(t))route='discard';
else if(PENDQ&&Date.now()-PENDQ.ts<180000&&YES.test(t))route='buildyes';
else if(PENDQ&&Date.now()-PENDQ.ts<180000&&NO.test(t))route='buildno';
else if(UNDO.test(t))route='undo';
else if(BUILD.test(t))route='build';
else if(FIX.test(t)||DIAG.test(t))route='diag';
else if(CODEQ.test(t))route='ask';
if(!route)return prev(t);
if(isLocked()){add('u',t);say('Acceso denegado, '+A()+'. Necesito la clave para tocar mi código.');return}
add('u',t);
try{
if(route=='apply')await applyVoice();
else if(route=='discard'){PEND=null;say('Descartado, '+A()+'.')}
else if(route=='buildyes'){PENDQ=null;await runBuild(true)}
else if(route=='buildno'){PENDQ=null;say('Entendido, '+A()+'.')}
else if(route=='undo')await undoVoice();
else if(route=='build')await runBuild(/analiza|arregl|corrig|error/i.test(t));
else if(route=='diag')await runDiag();
else await answerCode(t)
}catch(e){S('','TOCA PARA HABLAR');say('No pude, '+A()+': '+(e.message||e))}};
const tabs=document.querySelector('.tabs'),pb=document.querySelector('.pb');
if(!tabs||!pb||$('t8'))return;
let busy=false,showMap=false,STAT={t:'',ok:null};
const status=(t,ok)=>{STAT={t:String(t||''),ok:ok};const e=$('devst');if(e){e.textContent=STAT.t;e.style.color=ok===true?'#2fffa0':ok===false?'#ff4f6d':'#5b7a99'}};
const tb=mk('button','','CÓDIGO'),t8=mk('div');t8.className='tp';t8.id='t8';tb.dataset.t='t8';tabs.append(tb);pb.append(t8);
tb.onclick=()=>{document.querySelectorAll('.tabs button,.tp').forEach(x=>x.classList.remove('on'));tb.classList.add('on');t8.classList.add('on');draw();try{tb.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}};
const IN='width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:10px;font:13px ui-monospace,monospace;margin-bottom:8px';
const PRE='margin:2px 0;padding:8px;background:#0a1626;font:11px ui-monospace,monospace;white-space:pre-wrap;word-break:break-all;';
function draw(){t8.textContent='';
const R=report();
const row=l=>{const r=mk('div');r.className='row';if(l)r.append(mk('label','',l));t8.append(r);return r};
const hb=(x,f)=>{const b=mk('button','margin:4px 8px 4px 0',x);b.className='hb';b.onclick=async()=>{if(busy)return;busy=true;try{await f()}catch(e){status(e.message||String(e),false)}busy=false;draw()};return b};
const n=R.errs.length+R.probs.length;
let r=row('AUTODIAGNÓSTICO');
r.append(mk('div','font-size:13px;line-height:1.6;color:'+(n?'#ffb02e':'#2fffa0'),n?'⚠ '+R.errs.length+' errores registrados · '+R.probs.length+' problemas detectados':'✔ Sin errores registrados y con todos los módulos activos'));
r.append(mk('div','font-size:11px;color:#5b7a99;margin:4px 0 8px','Versión '+(window.JVER||'?')+' · '+(window.Android?'app de Android':'navegador')));
r.append(hb('REVISAR Y ANALIZAR',async()=>{status('Analizando mi código… puede tardar hasta un minuto');const x=await analyzeWeb();status(x.text,true)}),
hb('REVISAR COMPILACIÓN DE LA APP',async()=>{status('Consultando GitHub…');const x=await buildCheck(true);status(x.text,true)}));
const st=mk('div','font-size:12px;line-height:1.5;min-height:16px;margin-top:8px;color:'+(STAT.ok===true?'#2fffa0':STAT.ok===false?'#ff4f6d':'#5b7a99'),STAT.t);st.id='devst';r.append(st);
if(PEND){const c=row('PROPUESTA DE ARREGLO · RIESGO '+PEND.risk.toUpperCase()+(PEND.kind=='android'?' · APP ANDROID':' · WEB'));
c.append(mk('div','font-size:13px;line-height:1.6;margin-bottom:6px',PEND.why),mk('div','font-size:12px;color:#ffb02e;margin-bottom:8px','Cambio: '+PEND.fix));
PEND.edits.slice(0,6).forEach(e=>{c.append(mk('div','font-size:10px;letter-spacing:1px;color:#5b7a99;margin-top:8px',e.file),mk('pre',PRE+'border-left:2px solid #ff4f6d;color:#ffb3bf','- '+String(e.find).slice(0,400)),mk('pre',PRE+'border-left:2px solid #2fffa0;color:#b8ffd9','+ '+String(e.replace).slice(0,400)))});
c.append(hb('✔ APLICAR',async()=>{if(!confirm('¿Aplicar este arreglo? Se subirá a GitHub y se publicará en 1 o 2 minutos.'))return;status('Subiendo el arreglo…');const P=await doApply();status(doneText(P),true)}),hb('DESCARTAR',async()=>{PEND=null;status('Descartado',true)}))}
const U=ld('jdevundo',null);
if(U&&U.items){const u=row('ÚLTIMO ARREGLO APLICADO');u.append(mk('div','font-size:12px;line-height:1.5;color:#cfe8ff;margin-bottom:6px',new Date(U.ts).toLocaleString('es',{dateStyle:'medium',timeStyle:'short'})+' · '+U.fix),hb('↶ DESHACER',async()=>{if(!confirm('¿Deshacer este arreglo?'))return;status('Deshaciendo…');await doUndo();status('Arreglo deshecho. Se publicará en 1 o 2 minutos.',true)}))}
const e=row('REGISTRO DE ERRORES ('+R.errs.length+')');
if(!R.errs.length)e.append(mk('div','font-size:12px;color:#5b7a99','Ninguno en los últimos 2 días.'));
R.errs.slice(-8).reverse().forEach(x=>e.append(mk('div','font-size:11px;line-height:1.5;padding:6px 0;border-bottom:1px solid #ffffff12;color:#cfe8ff',new Date(x.ts).toLocaleTimeString('es',{hour:'numeric',minute:'2-digit'})+' · '+x.m+(x.f?' ('+x.f+(x.l?':'+x.l:'')+')':'')+(x.n>1?' ×'+x.n:''))));
R.probs.forEach(p=>e.append(mk('div','font-size:11px;color:#ffb02e;margin-top:6px','⚠ '+p.m)));
if(R.errs.length)e.append(hb('BORRAR REGISTRO',async()=>{LOG.clear();status('Registro borrado',true)}));
const s=row('CONEXIÓN CON GITHUB (PARA APLICAR ARREGLOS)');
s.append(mk('div','font-size:11px;line-height:1.5;color:#5b7a99;margin-bottom:8px','Sin token puedo leer mi código y proponer arreglos, pero no subirlos. El token se guarda solo en este dispositivo.'));
const ti=mk('input',IN);ti.type='password';ti.placeholder=tok()?'Token guardado (pega otro para reemplazarlo)':'pega tu token de GitHub';
s.append(ti,hb('GUARDAR TOKEN',async()=>{const v=ti.value.replace(/\s+/g,'');if(v.length<30)throw new Error('El token parece incompleto');localStorage.setItem('jdevtoken',v);status('Token guardado',true)}),hb('BORRAR TOKEN',async()=>{localStorage.removeItem('jdevtoken');status('Token borrado',true)}));
const ck=mk('input',IN);ck.type='password';ck.placeholder=localStorage.getItem('jdevclaude')?'Clave de Claude guardada':'clave de Claude (opcional, analiza mejor el código)';
s.append(ck,hb('GUARDAR CLAUDE',async()=>{const v=ck.value.replace(/\s+/g,'');if(v.length<20)throw new Error('La clave parece incompleta');localStorage.setItem('jdevclaude',v);status('Clave de Claude guardada',true)}),hb('QUITAR CLAUDE',async()=>{localStorage.removeItem('jdevclaude');status('Clave quitada',true)}));
const sel=mk('select',IN+';margin-top:10px');[['1','Sí: aplicas arreglos de riesgo bajo o medio si digo «sí»'],['0','No: solo con el botón APLICAR']].forEach(o=>{const op=mk('option','',o[1]);op.value=o[0];sel.append(op)});
sel.value=cfg.devvoice=='0'?'0':'1';sel.onchange=()=>{cfg.devvoice=sel.value;sv()};
s.append(mk('div','font-size:10px;letter-spacing:2px;color:#5b7a99;margin-top:10px','APLICAR POR VOZ'),sel);
const m=row('MAPA DE MI CÓDIGO');
m.append(hb(showMap?'▾ OCULTAR':'▸ MOSTRAR ('+Object.keys(MAPA).length+' ARCHIVOS)',async()=>{showMap=!showMap}));
if(showMap)Object.keys(MAPA).forEach(k=>m.append(mk('div','font-size:11px;line-height:1.5;color:#cfe8ff',k+' — '+MAPA[k])))}
})();
