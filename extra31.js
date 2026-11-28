(function(){
const $=i=>document.getElementById(i);
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.style.cssText=c;if(x!=null)e.textContent=x;return e};
const OWNER='vjoelangulo-prog',REPO='vjoelangulo-prog.github.io',MODEL='gemini-3.8-flash';
const tok=()=>localStorage.getItem('jdevtoken')||'';
const A=()=>cfg.addr||'señor';
const say=t=>{add('j',t);speak(t)};
async function gh(path,o){o=o||{};const h={Accept:'application/vnd.github+json'};
if(tok())h.Authorization='Bearer '+tok();if(o.body)h['Content-Type']='application/json';
let r;try{r=await fetch('https://api.github.com'+path,{method:o.method||'GET',headers:h,body:o.body,cache:'no-store'})}catch(e){throw new Error('Sin conexión a GitHub')}
const j=await r.json().catch(()=>({}));
if(r.status==401)throw new Error('El token de GitHub no es válido');
if(r.status==403||r.status==429)throw new Error('GitHub rechazó el permiso o limitó las consultas');
if(r.status==404)throw new Error('No encontré eso en el repositorio');
if(!r.ok)throw new Error(j.message||('Error de GitHub '+r.status));return j}
const b64=s=>{const b=new TextEncoder().encode(s);let o='';for(let i=0;i<b.length;i+=8192)o+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return btoa(o)};
const unb64=c=>new TextDecoder().decode(Uint8Array.from(atob(String(c).replace(/\s/g,'')),x=>x.charCodeAt(0)));
const ep=p=>p.split('/').map(encodeURIComponent).join('/');
async function getFile(p){const j=await gh('/repos/'+OWNER+'/'+REPO+'/contents/'+ep(p)+'?ref=main');return{text:unb64(j.content),sha:j.sha}}
async function putFile(p,text,sha,msg){const body={message:msg,content:b64(text),branch:'main'};if(sha)body.sha=sha;return gh('/repos/'+OWNER+'/'+REPO+'/contents/'+ep(p),{method:'PUT',body:JSON.stringify(body)})}
async function nextFileName(){const list=await gh('/repos/'+OWNER+'/'+REPO+'/contents/?ref=main');
let max=30;(Array.isArray(list)?list:[]).forEach(f=>{const m=/^extra(\d+)\.js$/.exec(f.name||'');if(m)max=Math.max(max,+m[1])});return 'extra'+(max+1)+'.js'}
function wireScript(html,filename){if(html.indexOf('"'+filename+'"')>-1)return html;
const a='</script></body></html>';if(html.indexOf(a)<0)throw new Error('no encontré dónde conectar el archivo');
return html.replace(a,'</script><script src="'+filename+'"></script></body></html>')}
const SECRET=/(AIza[\w-]{20,}|sk-[\w-]{16,}|ghp_\w{20,}|github_pat_\w{20,}|xai-\w{16,})/;
const parseJ=t=>{t=String(t);const a=t.indexOf('{'),b=t.lastIndexOf('}');return JSON.parse(a>=0&&b>a?t.slice(a,b+1):t)};
async function askAI(sys,user){
const ks=[];if(typeof key!=='undefined'&&key)ks.push(key);
try{JSON.parse(localStorage.getItem('jkeys')||'[]').forEach(o=>{if(o&&o.k&&ks.indexOf(o.k)<0)ks.push(o.k)})}catch(e){}
if(!ks.length)throw new Error('No hay ninguna clave de Gemini guardada.');
let err=null;
for(let round=0;round<2;round++){for(const k of ks){
const c=new AbortController(),t=setTimeout(()=>c.abort(),70000);
try{const r=await fetch(new URL('https://generativelanguage.googleapis.com/v1beta/models/'+MODEL+':generateContent'),{method:'POST',headers:{'x-goog-api-key':k,'content-type':'application/json'},signal:c.signal,body:JSON.stringify({systemInstruction:{parts:[{text:sys}]},contents:[{role:'user',parts:[{text:user}]}],generationConfig:{responseMimeType:'application/json',maxOutputTokens:7000}})});
const j=await r.json();clearTimeout(t);
if(j.error){err=new Error(window.esErr?esErr(j.error.message):j.error.message);continue}
return j.candidates[0].content.parts[0].text}catch(e){clearTimeout(t);err=e}}
if(round==0)await new Promise(r=>setTimeout(r,2000))}
throw err||new Error('Gemini no respondió')}
const SYS="Eres un ingeniero senior de JavaScript que añade funciones NUEVAS y pequeñas a la app web Jarvis, sin tocar ni romper nada de lo existente. Vas a escribir el contenido COMPLETO de un archivo nuevo, independiente, que se cargará como <script> al final de la página, después de que todo lo demás ya existe. Ya existen estas variables y funciones GLOBALES que puedes usar directamente (no las redefinas ni las declares de nuevo): cfg (objeto de ajustes, usa sv() para guardarlo), key (clave de Gemini actual), hist (historial de la conversación), facts (lista de datos del usuario), add(quien,texto) (agrega un mensaje al chat, quien es 'u' o 'j'), send(texto) (envía un mensaje como si lo escribiera el usuario), speak(texto) (lee en voz alta), call(body) (llama a Gemini con el formato de la API), S(estado,texto) (cambia el estado visual), state (estado actual), sv() (guarda cfg en localStorage). Responde SOLO un JSON: {\"entendido\":\"qué vas a construir, en una frase clara\",\"riesgo\":\"bajo|medio|alto\",\"codigo\":\"el código JS completo, como un único IIFE: (function(){ ... })();\"}. Reglas estrictas: SOLO una función nueva, acotada y pequeña por pedido (si el pedido es muy grande o ambiguo, dilo en entendido, pon riesgo alto y deja codigo vacío). Usa SIEMPRE las variables globales ya existentes. Si necesitas interceptar lo que el usuario escribe, envuelve window.send guardando la función anterior y llamándola si no aplica. Nunca toques seguridad, cuentas, tokens ni claves de API. No escribas claves ni tokens de ejemplo ni reales en el código.";
let PEND=null;
function card(st){const box=$('featbox');if(!box)return;box.textContent='';
if(!PEND){box.style.display='none';return}
box.style.display='block';
box.append(mk('div','font-size:12px;color:#ffb02e;margin-bottom:6px','Propuesta ('+PEND.riesgo+'): '+PEND.entendido));
box.append(mk('div','font-size:11px;color:#5b7a99;margin-bottom:8px','Archivo nuevo: '+PEND.filename));
const pre=document.createElement('pre');pre.style.cssText='max-height:160px;overflow:auto;background:#0a1626;padding:8px;border-radius:8px;font:11px ui-monospace,monospace;white-space:pre-wrap;word-break:break-all;margin-bottom:8px';pre.textContent=PEND.codigo.slice(0,1800);
box.append(pre);
const row=mk('div');row.style.cssText='display:flex;gap:8px';
const ap=mk('button','','APLICAR'),ds=mk('button','','DESCARTAR');ap.className=ds.className='hb';
ap.onclick=async()=>{ap.disabled=true;st('Subiendo…');try{await apply();st('Aplicado. En 1-2 min se publica. Cierra y abre Jarvis dos veces.',true)}catch(e){st(e.message||String(e),false);ap.disabled=false}};
ds.onclick=()=>{PEND=null;card(st);st('Descartado.',true)};
row.append(ap,ds);box.append(row)}
async function propose(req){
if(!req||req.trim().length<6)throw new Error('Cuéntame con más detalle qué función quieres.');
const raw=await askAI(SYS,'Petición del usuario: '+req);
const a=parseJ(raw);
if(!a.codigo||!a.codigo.trim()){PEND=null;return a.entendido||'No pude proponer un cambio seguro para eso.'}
const code=a.codigo.trim();
if(code.length>9000)throw new Error('el código propuesto es demasiado grande para aplicarlo así');
if(SECRET.test(code))throw new Error('el código propuesto contenía algo parecido a una clave; lo descarté por seguridad');
try{new Function(code)}catch(e){throw new Error('el código tendría un error de sintaxis: '+e.message)}
if(!/^\(function\(\)\{[\s\S]*\}\)\(\);?\s*$/.test(code))throw new Error('el código no viene como función autoejecutable; pídela de nuevo con otras palabras');
const filename=await nextFileName();
PEND={entendido:a.entendido||req,riesgo:/^(alto|medio|bajo)$/.test(a.riesgo)?a.riesgo:'medio',filename:filename,codigo:code};
return 'Propongo: '+PEND.entendido+'. Riesgo '+PEND.riesgo+'. Revísalo en Ajustes, IA, y toca APLICAR si quieres.'}
async function apply(){
if(!PEND)throw new Error('no hay ninguna propuesta pendiente');
if(!tok())throw new Error('falta el token de GitHub: guárdalo en la pestaña CÓDIGO');
const idx=await getFile('index.html'),newHtml=wireScript(idx.text,PEND.filename),done=[];
try{
const r1=await putFile(PEND.filename,PEND.codigo,null,'Jarvis: nueva función — '+PEND.entendido.slice(0,60));
done.push({kind:'web',file:PEND.filename,old:'',sha:r1.content.sha});
const r2=await putFile('index.html',newHtml,idx.sha,'Jarvis: conectar '+PEND.filename);
done.push({kind:'web',file:'index.html',old:idx.text,sha:r2.content.sha})
}catch(e){
for(const d of done){try{const c=await getFile(d.file);await putFile(d.file,d.old,c.sha,'Jarvis: revertido por error')}catch(x){}}
throw new Error('no pude subir la función: '+(e.message||e))}
try{localStorage.setItem('jdevundo',JSON.stringify({ts:Date.now(),kind:'web',fix:'Función nueva: '+PEND.entendido,items:done}))}catch(e){}
PEND=null;card(()=>{})}
function buildUI(){
const t3=$('t3');if(!t3||$('featbox'))return;
const IN='width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:10px;font:13px ui-monospace,monospace;margin-bottom:8px';
const row=mk('div');row.className='row';
row.append(mk('label','','PEDIR UNA FUNCIÓN NUEVA (EXPERIMENTAL)'));
row.append(mk('div','font-size:11px;color:#5b7a99;margin-bottom:8px;line-height:1.5','Describe una función nueva. Se te muestra el código antes de aplicarlo: nunca se aplica solo, ni diciendo «sí».'));
const ta=document.createElement('textarea');ta.style.cssText=IN+';min-height:60px';ta.placeholder='Ej: cuando diga «buenas noches» que apague el modo siempre activo';
const st=mk('div','font-size:12px;min-height:16px;margin:6px 0;color:#5b7a99');
const setSt=(t,ok)=>{st.style.color=ok?'#2fffa0':ok===false?'#ff4f6d':'#5b7a99';st.textContent=t};
const btn=mk('button','','PROPONER');btn.className='hb';
btn.onclick=async()=>{btn.disabled=true;setSt('Pensando…');try{const r=await propose(ta.value);setSt(r,true);ta.value='';card(setSt)}catch(e){setSt(e.message||String(e),false)}btn.disabled=false};
const box=mk('div');box.id='featbox';box.style.cssText='display:none;margin-top:10px';
row.append(ta,btn,st,box);t3.append(row)}
buildUI();
const FEAT=/^(?:jarvis[,\s]+)?(?:agrega(?:me)?|a[ñn]ade|quiero que puedas|programa(?:me)?|crea(?:me)?|hazme)\s+(?:una|otra|la capacidad de|una funci[oó]n (?:que|para)|una funci[oó]n nueva (?:que|para))\s*(.+)/i;
const isLocked=()=>{const l=$('lk');return !!l&&l.textContent=='🔒'};
const prev=window.send;
window.send=async function(t){t=(t||'').trim();if(!t)return prev(t);
const m=FEAT.exec(t);if(!m)return prev(t);
if(isLocked()){add('u',t);say('Acceso denegado, '+A()+'. Desbloquéame primero.');return}
add('u',t);S('thinking','PENSANDO LA FUNCIÓN...');
try{const r=await propose(m[1]);S('','TOCA PARA HABLAR');say(r)}catch(e){S('','TOCA PARA HABLAR');say('No pude, '+A()+': '+(e.message||e))}};
})();
