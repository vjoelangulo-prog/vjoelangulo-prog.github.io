(function(){
const $=i=>document.getElementById(i);
const ld=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v===null?d:v}catch(e){return d}};
const sv2=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
const FAST='gemini-3.5-flash-lite',STRONG='gemini-3.8-flash';
const MK='jmods',BK='jboot28',GK='jgood28';
const note=t=>{try{add('j',String(t),Date.now(),false)}catch(e){}};
const talk=t=>{try{window.speak(String(t))}catch(e){}};
const AF=Object.getPrototypeOf(async function(){}).constructor;
let mods=ld(MK,[]),building=false,pending=null,awaiting=false,ideas=[],MAPC=null;
const saveMods=()=>sv2(MK,mods);
const byId=id=>mods.find(m=>m.id===id);
const CMDS=[],TIMERS={},WRAPPED={},live={};
const reloadSoon=()=>setTimeout(()=>{try{location.reload()}catch(e){}},900);
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const findMod=q=>{q=norm(q);return mods.find(m=>norm(m.name)==q)||mods.find(m=>norm(m.name).includes(q)||q.includes(norm(m.name)))};
const LS='jlock28',SALT='04e5261d16f9e236b7bba4ce27a0275a',HASH='0c9a30aed7ae0d0a3f1d2853d61e0c11e7415b7aa46777f09b42ce7b7b6ba39e',ITER=200000;
let unlocked=localStorage.getItem(LS)===HASH,bad=0,until=0;
const h2b=h=>new Uint8Array(h.match(/../g).map(x=>parseInt(x,16)));
const b2h=b=>[...b].map(x=>x.toString(16).padStart(2,'0')).join('');
async function pbk(pw){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);return b2h(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:h2b(SALT),iterations:ITER},k,256)))}
async function tryUnlock(pw){
const n=Date.now();if(n<until)return 'Espera '+Math.ceil((until-n)/1000)+' s antes de intentar otra vez';
let h;try{h=await pbk(String(pw||'').trim())}catch(e){return 'Este dispositivo no permite verificar la clave'}
if(h===HASH){unlocked=true;bad=0;try{localStorage.setItem(LS,HASH)}catch(e){}return ''}
bad++;if(bad>=5){until=n+60000;bad=0}return 'Clave incorrecta'}
const LOCKMSG='🔒 La auto-construcción está bloqueada. Solo el dueño de Jarvis la desbloquea en Ajustes → MÓDULOS con su clave.';
function keys(){const ks=[];
try{if(typeof key!=='undefined'&&key)ks.push(key)}catch(e){}
try{ld('jkeys',[]).forEach(o=>{if(o&&o.k&&ks.indexOf(o.k)<0)ks.push(o.k)})}catch(e){}
const k1=localStorage.getItem('jkey');if(k1&&ks.indexOf(k1)<0)ks.push(k1);
return ks}
async function gem(model,system,user,json,ms){
const ks=keys();if(!ks.length)throw new Error('No hay clave de Gemini guardada');
const body={systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text:user}]}],generationConfig:{temperature:json?0.2:0.7}};
if(json)body.generationConfig.responseMimeType='application/json';
let last=null;
for(const k of ks){
const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),ms||90000);
let retry=false;
try{
const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent',{method:'POST',headers:{'x-goog-api-key':k,'content-type':'application/json'},body:JSON.stringify(body),signal:ctl.signal});
const j=await r.json();
if(j.error){last=new Error(String(j.error.message||'error').slice(0,160));retry=(r.status==429||r.status>=500)}
else{const p=(((j.candidates||[])[0]||{}).content||{}).parts||[];const t=p.map(x=>x.text||'').join('');if(t)return t;last=new Error('Gemini no devolvió texto')}
}catch(e){last=e.name=='AbortError'?new Error('Gemini tardó demasiado'):e;retry=true}
finally{clearTimeout(tm)}
if(!retry)break}
throw last||new Error('sin respuesta')}
function fail(id,e){
const m=byId(id);if(!m)return;
const now=Date.now();if(m._t&&now-m._t<300)return;m._t=now;
const msg=String((e&&e.message)||e).slice(0,200);
m.lastErr=msg;m.errs=(m.errs||0)+1;saveMods();
if(m.errs>=3&&m.on){m.on=false;saveMods();unload(id);refreshPanel();
note('⚠️ Desactivé el módulo «'+m.name+'» porque falló 3 veces: '+msg);
if((m.repairs||0)<2)repairLive(m,msg);else reloadSoon()}}
function unload(id){
(TIMERS[id]||[]).forEach(t=>{clearInterval(t);clearTimeout(t)});TIMERS[id]=[];
for(let i=CMDS.length-1;i>=0;i--)if(CMDS[i].id===id)CMDS.splice(i,1);
live[id]=0;if(WRAPPED[id])reloadSoon()}
function mkJ(m){
const id=m.id,P='jm_'+id+'_';
const g=fn=>function(){try{const r=fn.apply(this,arguments);if(r&&typeof r.then=='function')return r.catch(e=>{fail(id,e)});return r}catch(e){fail(id,e)}};
const T=TIMERS[id]=TIMERS[id]||[];
const J={id:id,name:m.name};
J.say=t=>{try{add('j',String(t),Date.now(),false)}catch(e){}};
J.speak=t=>talk(t);
J.reply=t=>{J.say(t);J.speak(t)};
J.cmd=(re,fn)=>{if(!(re instanceof RegExp))throw new Error('J.cmd necesita una RegExp');
CMDS.push({id:id,re:re,fn:async(t,mt)=>{try{return await fn(t,mt)}catch(e){fail(id,e);return false}}})};
J.ask=async(p,o)=>{o=o||{};const out=await gem(o.strong?STRONG:FAST,'Eres un asistente breve. Responde en español.',String(p),!!o.json,60000);
if(!o.json)return out;try{return JSON.parse(out)}catch(e){const mt=out.match(/[\[{][\s\S]*[\]}]/);return JSON.parse(mt&&mt[0])}};
J.fetchJson=async(u,o)=>{u=String(u);if(!/^https:\/\//i.test(u))throw new Error('Solo https');
const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),12000);
try{const r=await fetch(u,Object.assign({},o||{},{signal:ctl.signal}));if(!r.ok)throw new Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(tm)}};
J.store={get:(k,d)=>{try{const v=localStorage.getItem(P+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
set:(k,v)=>{try{const s=JSON.stringify(v);if(s.length>200000)throw new Error('muy grande');localStorage.setItem(P+k,s);return true}catch(e){return false}}};
J.card=(title,html)=>{const host=$('mods28cards'),box=document.createElement('div');box.className='row';
const l=document.createElement('label');l.textContent=String(title);
const b=document.createElement('div');b.style.cssText='font-size:13px;line-height:1.6;color:#cfe8ff';b.innerHTML=String(html||'');
box.append(l,b);if(host)host.append(box);return{el:b,set:h=>{b.innerHTML=String(h)}}};
J.every=(ms,fn)=>{T.push(setInterval(g(fn),Math.max(1000,+ms||1000)))};
J.after=(ms,fn)=>{T.push(setTimeout(g(fn),Math.max(0,+ms||0)))};
J.wrap=(n,fn)=>{if(n!=='send'&&n!=='speak')throw new Error('J.wrap solo permite send y speak');
const orig=window[n];if(typeof orig!=='function')return;WRAPPED[id]=1;
window[n]=function(){const a=[].slice.call(arguments),self=this;
try{const r=fn.apply(self,[orig.bind(self)].concat(a));
if(r&&typeof r.then=='function')return r.catch(e=>{fail(id,e);return orig.apply(self,a)});return r}
catch(e){fail(id,e);return orig.apply(self,a)}}};
J.android=window.Android||null;
J.config=()=>{try{return JSON.parse(JSON.stringify(cfg))}catch(e){return{}}};
J.now=()=>Date.now();
J.test=()=>{};J.assert=()=>{};J.simulate=async()=>[];
return J}
function runMod(m){
if(live[m.id])return;live[m.id]=1;
try{const p=new AF('J','"use strict";\n'+m.code+'\n//# sourceURL=jmod_'+m.id+'.js')(mkJ(m));
if(p&&p.catch)p.catch(e=>fail(m.id,e))}catch(e){fail(m.id,e)}}
window.addEventListener('error',ev=>{try{const f=String(ev.filename||'')+String((ev.error&&ev.error.stack)||'');const mt=f.match(/jmod_([a-z0-9]+)\.js/);if(mt)fail(mt[1],ev.error||ev.message)}catch(e){}});
window.addEventListener('unhandledrejection',ev=>{try{const s=String((ev.reason&&ev.reason.stack)||'');const mt=s.match(/jmod_([a-z0-9]+)\.js/);if(mt)fail(mt[1],ev.reason)}catch(e){}});
function startMods(){
if(!unlocked)return;
const boot=ld(BK,null),good=+localStorage.getItem(GK)||0;
if(boot){const tries=(boot.tries||1)+1,off=[];
mods.forEach(m=>{if(m.on&&(tries>=3||m.ts>good)){m.on=false;m.why='arranque fallido';off.push(m.name)}});
if(off.length){saveMods();setTimeout(()=>note('🛡️ MODO SEGURO: Jarvis no arrancó bien la vez anterior y desactivé: '+off.join(', ')+'. Puedes reactivarlos en Ajustes → MÓDULOS.'),1500)}
sv2(BK,{tries:tries,t:Date.now()})}
else sv2(BK,{tries:1,t:Date.now()});
mods.filter(m=>m.on).forEach(runMod);
setTimeout(()=>{try{localStorage.removeItem(BK);localStorage.setItem(GK,String(Date.now()))}catch(e){}},4000)}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const KB=`Eres el INGENIERO de Jarvis, un asistente personal por voz que vive en un celular Android (una página web dentro de una app, servida desde GitHub Pages). El usuario te pide funciones nuevas hablando y tú las programas como MÓDULOS que se instalan solos.

REGLAS DE ORO
1. Nunca modificas el núcleo. Escribes un módulo: JavaScript moderno que se ejecuta como cuerpo de una función async. La variable J ya existe. Puedes usar await en el nivel superior. Sin import ni export, sin librerías externas.
2. Solo usas la API J (abajo). No uses localStorage, fetch, XMLHttpRequest, eval, location, cookies ni toques claves o cuentas: el sistema lo rechaza. Para pantallas usa J.card.
3. Todo lo asíncrono va dentro de try/catch. Nunca bucles que bloqueen ni while(true).
4. Idempotente: si el módulo se ejecuta dos veces no duplica nada.
5. Todo lo que se muestra o se dice es en español, MUY breve (1 o 2 frases), apto para voz.
6. Si algo puede fallar (sin internet, dato faltante), responde con un mensaje amable en vez de lanzar un error.

API J
J.say(texto) muestra un mensaje de Jarvis en el chat. J.speak(texto) lo dice en voz alta. J.reply(texto) hace las dos cosas.
J.cmd(regex, async (texto, match) => {...; return true}) registra un comando de voz o texto. Usa expresiones regulares tolerantes (flag i, acentos opcionales, sinónimos). Devuelve true si lo atendiste o false para que el mensaje siga al chat normal.
J.ask(prompt, {json:false, strong:false}) pregunta a la IA y devuelve texto (u objeto si json:true).
J.fetchJson(urlHttps, opciones) descarga JSON de una URL https (límite 12 s).
J.store.get(clave, valorPorDefecto) y J.store.set(clave, valor) guardan datos persistentes del módulo (JSON, máximo 200 KB).
J.every(ms, fn) repite cada ms (mínimo 1000). J.after(ms, fn) ejecuta una vez.
J.card(titulo, html) crea una tarjeta en Ajustes > MÓDULOS y devuelve {el, set(html)} para actualizarla.
J.wrap('send' o 'speak', (original, ...args) => ...) intercepta lo que escribe el usuario o lo que dice Jarvis; si tu función falla se usa la original sola.
J.android es el puente nativo (puede ser null): J.android.taskAdd(texto, venceMs), J.android.remAdd(texto, tiempoMs), J.android.agendaGet() devuelve JSON con tareas y recordatorios. Comprueba siempre que exista.
J.config() copia de la configuración. J.now() hora actual en ms.

PRUEBAS OBLIGATORIAS
Incluye al menos 2 pruebas con J.test('nombre', async () => {...}). Dentro usa J.simulate('frase del usuario'), que devuelve la lista de mensajes emitidos con J.say o J.reply, y J.assert(condicion, 'mensaje'). En el entorno de pruebas J.ask devuelve 'respuesta de prueba' (o {} si pides json), J.fetchJson devuelve {} y no hay red real: programa de forma defensiva con datos vacíos. Las pruebas no corren en producción.

FORMATO DE SALIDA
Responde SOLO un JSON: {"name":"nombre corto","description":"una frase","code":"el código completo del módulo"}.

EJEMPLO DE MÓDULO
J.cmd(/cu[eé]ntame un chiste/i, async () => { let t; try { t = await J.ask('Cuenta un chiste corto en español'); } catch (e) { t = 'No pude pensar un chiste ahora.'; } J.reply(t); return true; });
J.test('responde al comando', async () => { const o = await J.simulate('cuéntame un chiste'); J.assert(o.length > 0, 'no respondió'); });
J.test('ignora otras frases', async () => { const o = await J.simulate('qué hora es'); J.assert(o.length === 0, 'respondió sin que lo pidieran'); });`;
const BAN=[
[/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b/,'no uses localStorage; usa J.store'],
[/\bjkeys?\b|\bjacc\b|idToken|refreshToken|apiKey|x-goog-api-key/i,'no puede tocar claves ni cuentas'],
[/document\s*\.\s*cookie/,'cookies prohibidas'],
[/\beval\s*\(|\bnew\s+Function\b|\bFunction\s*\(|importScripts|\bimport\s*\(/,'código dinámico prohibido'],
[/\bXMLHttpRequest\b|\bWebSocket\b|sendBeacon|\bfetch\s*\(/,'no uses fetch directo; usa J.fetchJson'],
[/\blocation\s*\.\s*(href|replace|assign|reload)|\blocation\s*=|window\s*\.\s*open/,'no puede navegar ni recargar la página'],
[/\.\s*resetAccount\b/,'función nativa prohibida']];
function validate(code){
if(code.length>40000)return 'El módulo es demasiado largo (máximo 40000 caracteres)';
for(const b of BAN)if(b[0].test(code))return 'Regla rota: '+b[1];
if(!/J\s*\.\s*test\s*\(/.test(code))return 'Faltan las pruebas: agrega al menos 2 con J.test';
try{new AF('J','"use strict";\n'+code)}catch(e){return 'Error de sintaxis: '+e.message}
return ''}
const WSRC=`const dummy=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':(k==='then'?undefined:dummy()),apply:()=>dummy(),construct:()=>dummy(),set:()=>true});
self.window=self;self.document=dummy();self.navigator=dummy();
const AF=Object.getPrototypeOf(async function(){}).constructor;
onmessage=async e=>{
const code=e.data.code,say=[],cmds=[],evs=[],tests=[],store={},res={ok:true,err:'',tests:[],said:0,cmds:0};
const J={id:'sandbox',name:'sandbox',
say:t=>{say.push(String(t))},speak:t=>{say.push(String(t))},reply:t=>{say.push(String(t))},
cmd:(re,fn)=>{if(!(re instanceof RegExp))throw new Error('J.cmd necesita una RegExp');cmds.push([re,fn])},
ask:async(p,o)=>(o&&o.json)?{}:'respuesta de prueba',
fetchJson:async()=>({}),
store:{get:(k,d)=>(k in store)?store[k]:d,set:(k,v)=>{store[k]=v;return true}},
card:()=>({el:{},set(){}}),every:(ms,fn)=>{evs.push(fn)},after:(ms,fn)=>{evs.push(fn)},
wrap:(n)=>{if(n!=='send'&&n!=='speak')throw new Error('J.wrap solo permite send y speak')},
android:null,config:()=>({}),now:()=>Date.now(),
test:(n,fn)=>{tests.push([n,fn])},assert:(c,m)=>{if(!c)throw new Error(m||'assert falló')},
simulate:async t=>{say.length=0;for(const [re,fn] of cmds){const m=String(t).match(re);if(m){await fn(String(t),m);break}}return say.slice()}};
try{
await new AF('J','"use strict";\\n'+code)(J);
for(const f of evs){await f()}
for(const [n,f] of tests){
try{await Promise.race([f(),new Promise((_,rj)=>setTimeout(()=>rj(new Error('la prueba tardó más de 3 s')),3000))]);res.tests.push({n:n,ok:true})}
catch(x){res.tests.push({n:n,ok:false});res.ok=false;res.err=res.err||('Prueba «'+n+'» falló: '+(x&&x.message||x))}}
res.cmds=cmds.length;res.said=say.length;
}catch(x){res.ok=false;res.err=String((x&&x.message)||x)}
postMessage(res)};`;
function sandbox(code){return new Promise(res=>{
let w,url,done=false;
const end=r=>{if(done)return;done=true;try{w&&w.terminate()}catch(e){}try{url&&URL.revokeObjectURL(url)}catch(e){}res(r)};
try{url=URL.createObjectURL(new Blob([WSRC],{type:'text/javascript'}));w=new Worker(url)}catch(e){return end({ok:true,err:'',tests:[],skipped:true})}
w.onmessage=e=>end(e.data);
w.onerror=e=>end({ok:false,err:'Error al cargar el módulo: '+String((e&&e.message)||e),tests:[]});
setTimeout(()=>end({ok:false,err:'El módulo se colgó (bucle infinito o espera eterna)',tests:[]}),7000);
w.postMessage({code:code})})}
async function projectMap(){
if(MAPC)return MAPC;
let out='';
try{
const html=await(await fetch('index.html',{cache:'no-store'})).text();
const files=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(x=>x[1]).filter(f=>!/^https?:/.test(f));
out+='Archivos JS cargados: '+files.join(', ')+'\n';
out+='IDs del HTML: '+[...new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]))].slice(0,120).join(', ')+'\n';
const fn=new Set();
const srcs=[html].concat(await Promise.all(files.map(f=>fetch(f,{cache:'no-store'}).then(r=>r.text()).catch(()=>''))));
srcs.forEach(s=>{for(const x of s.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g))fn.add(x[1])});
out+='Funciones detectadas en el proyecto: '+[...fn].slice(0,250).join(', ')+'\n'
}catch(e){out+='(no pude leer el proyecto: '+e.message+')\n'}
return MAPC=out}
async function build(req,base,errCtx){
building=true;
try{
let code=base?base.code:'',name=base?base.name:'',desc=base?(base.desc||''):'',err=errCtx||'',gerr='',ok=false,res=null;
note('⚙️ Entendido. Estudio mi proyecto y escribo el módulo… (puede tardar ~30 s)');
const sys=KB+'\n\nMAPA DEL PROYECTO (solo lectura):\n'+await projectMap()+'\nMÓDULOS YA INSTALADOS: '+(mods.map(m=>m.name).join(', ')||'ninguno');
for(let a=1;a<=4;a++){
let user;
if(!code)user='PETICIÓN DEL USUARIO: '+req+'\nEscribe el módulo completo.';
else if(!err)user='MÓDULO ACTUAL «'+name+'»:\n'+code+'\n\nCAMBIO PEDIDO: '+req+'\nConserva lo que ya funciona. Devuelve el módulo completo.';
else user='MÓDULO «'+name+'»:\n'+code+'\n\nSE ENCONTRÓ ESTE ERROR:\n'+err+'\nCórrigelo sin quitar funciones y devuelve el módulo completo.'+(req?'\nContexto: '+req:'');
if(a>1)note('🔧 Intento '+a+'/4: corrigiendo → '+String(err).slice(0,120));
let out;
try{out=await gem(STRONG,sys,user,true,120000)}catch(e){if(/clave/i.test(e.message))throw e;gerr=e.message;await sleep(1500);continue}
let o;
try{o=JSON.parse(out)}catch(e){const mt=out.match(/\{[\s\S]*\}/);try{o=JSON.parse(mt&&mt[0])}catch(e2){err='La respuesta no era JSON válido';continue}}
if(!o||typeof o.code!=='string'||o.code.length<20){err='Falta el campo code';continue}
code=o.code.replace(/^\s*```(?:javascript|js)?\s*/i,'').replace(/```\s*$/,'');
name=String(o.name||name||'módulo').slice(0,40);desc=String(o.description||desc||'').slice(0,200);
const v=validate(code);if(v){err=v;continue}
res=await sandbox(code);
if(!res.ok){err=res.err||'falló una prueba';continue}
ok=true;break}
if(!ok){note('❌ No logré un módulo estable tras 4 intentos'+((err||gerr)?'. Último problema: '+String(err||gerr).slice(0,200):'')+'. No instalé nada, tu Jarvis sigue igual de seguro.');return null}
return{name:name,desc:desc,code:code,res:res}
}finally{building=false}}
function offer(r,base){
pending={name:r.name,desc:r.desc,code:r.code,base:base?base.id:null};
const t=r.res.tests||[],n=t.length;
const ok=n?(t.filter(x=>x.ok).length+'/'+n+' pruebas OK'):(r.res.skipped?'sin pruebas: este dispositivo no permite el entorno aislado':'sin pruebas');
note('✅ Listo: «'+r.name+'». '+r.desc+' ('+r.code.split('\n').length+' líneas, '+ok+'). Di «sí» para instalarlo, «no» para descartarlo o «ver código».');
talk('Terminé '+r.name+'. ¿Lo instalo?')}
function install(){
const p=pending;pending=null;if(!p)return;
let m=p.base&&byId(p.base);
if(m){m.hist=m.hist||[];m.hist.push({code:m.code,ts:m.ts,ver:m.ver||1});if(m.hist.length>5)m.hist.shift();
m.code=p.code;m.desc=p.desc;m.ver=(m.ver||1)+1;m.ts=Date.now();m.errs=0;m.on=true;saveMods();
note('Actualicé «'+m.name+'» a la versión '+m.ver+'. Reiniciando para aplicarlo…');reloadSoon()}
else{m={id:Math.random().toString(36).slice(2,8),name:p.name,desc:p.desc,code:p.code,on:true,ver:1,ts:Date.now(),errs:0,repairs:0,hist:[]};
mods.push(m);saveMods();runMod(m);note('🚀 Instalado «'+m.name+'». Ya está funcionando.');talk('Instalado. Ya puedes usar '+m.name)}
refreshPanel()}
async function repairLive(m,msg){
if(building){setTimeout(()=>repairLive(m,msg),15000);return}
m.repairs=(m.repairs||0)+1;saveMods();
note('🔧 Voy a arreglar «'+m.name+'» yo solo…');
try{
const r=await build('Arregla el fallo y mantén todas las funciones.',m,msg);
if(r){m.hist=m.hist||[];m.hist.push({code:m.code,ts:m.ts,ver:m.ver||1});if(m.hist.length>5)m.hist.shift();
m.code=r.code;m.ver=(m.ver||1)+1;m.ts=Date.now();m.errs=0;m.on=true;saveMods();
note('✅ Arreglé «'+m.name+'» (versión '+m.ver+'). Reiniciando…');reloadSoon()}
else note('No pude arreglar «'+m.name+'» solo. Quedó desactivado; puedes revertirlo en Ajustes → MÓDULOS.')
}catch(e){note('No pude arreglar «'+m.name+'»: '+e.message)}
refreshPanel()}
function toggle(m){
if(m.on){m.on=false;m.why='';saveMods();unload(m.id);refreshPanel();reloadSoon()}
else{m.on=true;m.errs=0;m.why='';saveMods();live[m.id]=0;runMod(m);refreshPanel()}}
function revert(m){
if(!m.hist||!m.hist.length)return;
const h=m.hist.pop();m.code=h.code;m.ver=h.ver;m.ts=Date.now();m.errs=0;m.on=true;saveMods();
note('Volví «'+m.name+'» a la versión '+m.ver+'. Reiniciando…');reloadSoon()}
function refreshPanel(){
const list=$('mods28list');if(!list)return;
list.innerHTML='';
if(!mods.length){const e=document.createElement('div');e.style.cssText='font-size:12px;color:#5b7a99';e.textContent='Todavía no hay módulos. Pídele uno a Jarvis.';list.append(e);return}
mods.forEach(m=>{
const r=document.createElement('div');r.style.cssText='padding:8px 0;border-bottom:1px solid #ffffff12';
const h=document.createElement('div');h.style.cssText='font-size:13px;color:'+(m.on?'#2fffa0':'#ff4f6d');h.textContent=(m.on?'● ':'○ ')+m.name+' · v'+(m.ver||1);
const d=document.createElement('div');d.style.cssText='font-size:12px;color:#5b7a99;margin:2px 0 4px';d.textContent=(m.desc||'')+(m.why?' ['+m.why+']':'')+(m.lastErr?' · último error: '+m.lastErr:'');
const pre=document.createElement('pre');pre.style.cssText='display:none;white-space:pre-wrap;word-break:break-word;font:11px/1.5 ui-monospace,monospace;max-height:240px;overflow:auto;color:#cfe8ff;user-select:text';pre.textContent=m.code;
const mb=(t,f)=>{const b=document.createElement('button');b.className='hb';b.style.cssText='margin:4px 6px 0 0';b.textContent=t;b.onclick=f;return b};
r.append(h,d,mb(m.on?'DESACTIVAR':'ACTIVAR',()=>toggle(m)),mb('VER CÓDIGO',()=>{pre.style.display=pre.style.display=='none'?'block':'none'}));
if(m.hist&&m.hist.length)r.append(mb('REVERTIR',()=>revert(m)));
r.append(mb('BORRAR',()=>{if(!confirm('¿Borrar «'+m.name+'»?'))return;unload(m.id);mods=mods.filter(x=>x!==m);saveMods();refreshPanel();reloadSoon()}),pre);
list.append(r)})}
function panel(){
const t2=$('t2');if(!t2||$('mods28'))return;
const row=document.createElement('div');row.className='row';row.id='mods28';
const lab=document.createElement('label');lab.textContent='MÓDULOS DE JARVIS (AUTO-CONSTRUCCIÓN)';
const info=document.createElement('div');info.style.cssText='font-size:12px;line-height:1.6;color:#5b7a99;margin:6px 0 10px';
info.textContent='Di: «Jarvis, quiero que tengas…» y lo programa, lo prueba y lo arregla solo. También: «lista de módulos», «mejora el módulo X: …», «propón mejoras».';
const list=document.createElement('div');list.id='mods28list';
const safe=document.createElement('button');safe.className='hb';safe.style.cssText='margin:8px 6px 0 0';safe.textContent='🛡️ DESACTIVAR TODOS';
safe.onclick=()=>{if(!confirm('¿Desactivar todos los módulos?'))return;mods.forEach(m=>{m.on=false});saveMods();reloadSoon()};
const cards=document.createElement('div');cards.id='mods28cards';
const lockBox=document.createElement('div');
const lt=document.createElement('div');lt.style.cssText='font-size:12px;line-height:1.6;color:#ff4f6d;margin:6px 0 8px';lt.textContent='🔒 BLOQUEADO. Solo el dueño de Jarvis puede activar la auto-construcción. Escribe la clave:';
const pw=document.createElement('input');pw.type='password';pw.placeholder='clave del dueño';pw.autocomplete='off';pw.style.cssText='width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:14px;font:15px ui-monospace,monospace;margin-bottom:10px';
const lm=document.createElement('div');lm.style.cssText='font-size:12px;min-height:18px;color:#ff4f6d;margin-bottom:6px';
const ub=document.createElement('button');ub.className='hb';ub.textContent='🔓 DESBLOQUEAR';
const show=()=>{const u=unlocked;lockBox.style.display=u?'none':'block';[list,safe,cards,info].forEach(x=>{x.style.display=u?'':'none'})};
ub.onclick=async()=>{ub.textContent='VERIFICANDO…';const rs=await tryUnlock(pw.value);ub.textContent='🔓 DESBLOQUEAR';pw.value='';if(rs){lm.textContent=rs;return}show();refreshPanel();startMods();note('🔓 Auto-construcción desbloqueada.')};
lockBox.append(lt,pw,lm,ub);
row.append(lab,lockBox,info,list,safe,cards);show();
const d=$('diag25');
if(d&&d.nextSibling)t2.insertBefore(row,d.nextSibling);else t2.insertBefore(row,t2.firstChild)}
async function proposeIdeas(){
if(building){note('Estoy ocupado construyendo. Espera a que termine.');return}
building=true;
try{
note('💡 Pensando mejoras para mí mismo…');
const out=await gem(STRONG,KB+'\n\nMAPA DEL PROYECTO:\n'+await projectMap()+'\nMÓDULOS INSTALADOS: '+(mods.map(m=>m.name).join(', ')||'ninguno'),'Propón 3 funciones nuevas, útiles y realistas para este asistente, que se puedan hacer como módulo. Responde SOLO JSON: {"ideas":[{"title":"...","desc":"una frase"}]}',true,60000);
let o;try{o=JSON.parse(out)}catch(e){o=JSON.parse(out.match(/\{[\s\S]*\}/)[0])}
ideas=(o.ideas||[]).slice(0,3);
if(!ideas.length){note('No se me ocurrió nada ahora. Dime tú qué quieres.');return}
note('💡 Ideas:\n'+ideas.map((x,i)=>(i+1)+'. '+x.title+' — '+x.desc).join('\n')+'\nDi «construye la 1», «construye la 2» o «construye la 3».');
talk('Tengo '+ideas.length+' ideas. Dime cuál construyo.')
}catch(e){note('No pude proponer ideas: '+e.message)}
finally{building=false}}
function startBuild(req,base,err){
if(building){note('Ya estoy construyendo algo. Espera a que termine.');return}
(async()=>{try{const r=await build(req,base||null,err||'');if(r)offer(r,base||null)}catch(e){note('No pude construir: '+e.message)}})()}
const YES=/^\s*(?:s[ií]|dale|aplica(?:r|lo)?|ok(?:ey)?|listo|inst[aá]lalo|adelante|hazlo|confirmo)(?=[\s,.!¡?]|$)/i;
const NO=/^\s*(?:no|cancela(?:r)?|descarta(?:r)?|olv[ií]dalo|mejor no)(?=[\s,.!¡?]|$)/i;
const SEE=/^\s*(?:ver|mu[eé]strame|ens[eé][ñn]ame)\s+(?:el\s+)?c[oó]digo/i;
const BUILD=/^\s*(?:jarvis[,:]?\s*)?(?:quiero que (?:tengas|puedas|sepas|hagas|te encargues de)|constr[uú]ye(?:te)?|cr[eé]ate|prog[rá]mate|agr[eé]gate|a[ñn][aá]de(?:te)?|desarrolla|implementa)\s+(.{6,})$/i;
const BUILDN=/^\s*(?:jarvis[,:]?\s*)?constr[uú]ye(?:me)?\s+la\s+(?:idea\s+)?(?:n[uú]mero\s+)?(\d)\s*$/i;
const MODE=/^\s*(?:jarvis[,:]?\s*)?(?:comienza|empieza|inicia|activa)\s+(?:el\s+)?(?:proceso|modo)\s+(?:de\s+)?(?:auto\s*-?\s*constru\w+|constructor|programaci[oó]n)/i;
const IDEAS=/^\s*(?:jarvis[,:]?\s*)?(?:prop[oó]n|sugiere|dame\s+ideas\s+de)\s+(?:algunas?\s+)?(?:mejoras|funciones|ideas)/i;
const MODM=/^\s*(?:jarvis[,:]?\s*)?(mejora|modifica|cambia|arregla|actualiza)\s+(?:el\s+)?m[oó]dulo\s+(.+?)(?:\s*[:,]\s*(.+))?$/i;
const LIST=/^\s*(?:jarvis[,:]?\s*)?(?:lista(?:r)?|mu[eé]strame|cu[aá]les\s+son)\s+(?:de\s+|los\s+|mis\s+|tus\s+)?m[oó]dulos/i;
const OFF=/^\s*(?:jarvis[,:]?\s*)?(desactiva|activa|elimina|borra|revierte)\s+(?:el\s+)?m[oó]dulo\s+(.+)$/i;
async function intercept(t){
let m;
if(!unlocked){if(MODE.test(t)||/^\s*(?:jarvis[,:]?\s*)?(?:quiero que tengas|prog[rá]mate|cr[eé]ate|agr[eé]gate)\b/i.test(t)){add('u',t);note(LOCKMSG);return true}return false}
if(pending){
if(YES.test(t)){add('u',t);install();return true}
if(NO.test(t)){add('u',t);pending=null;note('Descartado. No instalé nada.');return true}
if(SEE.test(t)){add('u',t);note(pending.code.length>2500?pending.code.slice(0,2500)+'\n… (recortado)':pending.code);return true}}
if(awaiting){add('u',t);awaiting=false;if(NO.test(t)||/^\s*(listo|salir|nada)/i.test(t)){note('Modo constructor cerrado.');return true}startBuild(t);return true}
if((m=t.match(BUILDN))){add('u',t);const x=ideas[+m[1]-1];if(!x){note('Primero dime «propón mejoras».');return true}startBuild(x.title+': '+x.desc);return true}
if((m=t.match(BUILD))){add('u',t);startBuild(m[1]);return true}
if(MODE.test(t)){add('u',t);awaiting=true;note('🧠 Modo constructor activo. Dime qué función quieres que tenga.');talk('Modo constructor activo. ¿Qué función quieres que tenga?');return true}
if(IDEAS.test(t)){add('u',t);proposeIdeas();return true}
if((m=t.match(MODM))){add('u',t);const x=findMod(m[2]);
if(!x){note('No encuentro ese módulo. Di «lista de módulos».');return true}
startBuild(m[3]||'Revisa y corrige errores.',x,m[3]?'':(x.lastErr||''));return true}
if(LIST.test(t)){add('u',t);note(mods.length?'Mis módulos:\n'+mods.map(x=>(x.on?'● ':'○ ')+x.name+' v'+(x.ver||1)+' — '+(x.desc||'')).join('\n'):'Todavía no tengo módulos.');return true}
if((m=t.match(OFF))){add('u',t);const x=findMod(m[2]),a=norm(m[1]);
if(!x){note('No encuentro ese módulo.');return true}
if(a=='activa'){if(!x.on)toggle(x);note('Activé «'+x.name+'».')}
else if(a=='revierte'){if(x.hist&&x.hist.length)revert(x);else note('«'+x.name+'» no tiene versiones anteriores.')}
else if(a=='desactiva'){if(x.on)toggle(x);note('Desactivé «'+x.name+'».')}
else{unload(x.id);mods=mods.filter(y=>y!==x);saveMods();refreshPanel();note('Borré «'+x.name+'».');reloadSoon()}
return true}
for(const c of CMDS){const mt=t.match(c.re);if(mt){add('u',t);const r=await c.fn(t,mt);if(r!==false)return true}}
return false}
const prevSend=window.send;
if(typeof prevSend=='function')window.send=async function(t){
t=(t||'').trim();if(!t)return;
try{if(await intercept(t))return}catch(e){note('Error en el constructor: '+e.message)}
return prevSend.apply(this,arguments)};
panel();refreshPanel();startMods();
window.addEventListener('load',()=>{panel();refreshPanel()});
})();
