(function(){
const rf=window.fetch.bind(window);
const ANT='sk'+'-ant-';
const isAnt=k=>String(k).indexOf(ANT)===0;
const isSk=k=>/^sk-/.test(String(k));
const prov=k=>isAnt(k)?'claude':(isSk(k)?'openai':'gemini');
const CL={fast:['claude-haiku-5-5','claude-haiku-4-5'],strong:['claude-sonnet-5-5','claude-sonnet-4-5']};
const OA={fast:['chat-latest','gpt-6-luna','gpt-5.6-luna','gpt-5.4-mini','gpt-4o-mini'],strong:['gpt-6.2-sol','gpt-6.1-sol','gpt-6-sol','gpt-5.6-sol','gpt-5.5','gpt-4o']};
const JNOTE='\n\nIMPORTANTE: responde ÚNICAMENTE con JSON válido, sin texto antes ni después y sin bloques de código.';
const ck=(p,t)=>'jmo_'+p+'_'+t;
const order=(p,t,list)=>{let c=null;try{c=localStorage.getItem(ck(p,t))}catch(e){}return c?[c].concat(list.filter(x=>x!==c)):list.slice()};
const remember=(p,t,m)=>{try{localStorage.setItem(ck(p,t),m)}catch(e){}};
const noModel=(s,m)=>s==404||(/model/i.test(m)&&/not found|does not exist|no access|not have access|unsupported|invalid model|not supported/i.test(m));
function jr(status,msg,text){
const body=(text!==undefined)?{candidates:[{content:{role:'model',parts:[{text:text}]}}]}:{error:{code:status,message:msg,status:'ERROR'}};
return new Response(JSON.stringify(body),{status:status,headers:{'content-type':'application/json'}})}
function errR(p,s,m){
const name=p=='claude'?'Claude':'OpenAI';
let code=s,msg=String(m||('HTTP '+s));
if(s==401||s==403||/invalid x-api-key|incorrect api key|invalid api key|authentication/i.test(msg)){
code=401;msg='API key not valid: la clave de '+name+' no es correcta'+(p=='claude'?' (debe empezar con '+ANT+'). ':'. ')+'Detalle: '+msg}
else if(/credit balance|insufficient_quota|exceeded your current quota|billing/i.test(msg)){
code=429;msg='quota: tu cuenta de '+name+' no tiene saldo o cuota. Carga crédito en '+(p=='claude'?'console.anthropic.com':'platform.openai.com')+'. Detalle: '+msg}
else if(s==429||s==529||s>=500){code=(s==429)?429:503;msg='rate/sobrecarga de '+name+': '+msg}
return jr(code,msg)}
function clean(t,json){
t=String(t||'').trim();
if(!json)return t;
const a=t.search(/[\[{]/),b=Math.max(t.lastIndexOf('}'),t.lastIndexOf(']'));
return(a>=0&&b>a)?t.slice(a,b+1):t}
function toMsgs(b){
const sys=((b.systemInstruction&&b.systemInstruction.parts)||[]).map(p=>p.text||'').join('\n');
const msgs=[];
(b.contents||[]).forEach(c=>{
const t=((c&&c.parts)||[]).map(p=>p.text||'').join('\n');if(!t)return;
const role=(c.role=='model')?'assistant':'user';
if(msgs.length&&msgs[msgs.length-1].role==role)msgs[msgs.length-1].content+='\n'+t;else msgs.push({role:role,content:t})});
if(!msgs.length||msgs[0].role!='user')msgs.unshift({role:'user',content:'(inicio de la conversación)'});
return{sys:sys,msgs:msgs}}
async function post(url,headers,body){
const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),60000);
try{const r=await rf(url,{method:'POST',headers:headers,body:JSON.stringify(body),signal:ctl.signal});
let j={};try{j=await r.json()}catch(e){}
return{r:r,j:j}}finally{clearTimeout(tm)}}
async function callClaude(k,tier,sys,msgs,mo,json){
let last='';
for(const model of order('claude',tier,CL[tier])){
const x=await post('https://api.anthropic.com/v1/messages',{'x-api-key':k,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true','content-type':'application/json'},
{model:model,max_tokens:mo?Math.max(300,mo):8192,system:sys+(json?JNOTE:''),messages:msgs});
if(x.r.ok&&x.j.content){remember('claude',tier,model);return jr(200,null,clean((x.j.content||[]).filter(c=>c.type=='text').map(c=>c.text).join(''),json))}
const em=(x.j.error&&x.j.error.message)||('HTTP '+x.r.status);
if(noModel(x.r.status,em)){last=em;continue}
return errR('claude',x.r.status,em)}
return errR('claude',404,'No encontré un modelo disponible en tu cuenta. '+last)}
async function callOpenAI(k,tier,sys,msgs,mo,json){
let last='';
const all=(sys?[{role:'system',content:sys+(json?JNOTE:'')}]:(json?[{role:'system',content:JNOTE.trim()}]:[])).concat(msgs);
for(const model of order('openai',tier,OA[tier])){
let useOld=false,useFmt=json;
for(let t=0;t<3;t++){
const body={model:model,messages:all};
if(useOld)body.max_tokens=mo?Math.max(300,mo):8192;else body.max_completion_tokens=mo?Math.max(1024,mo*4):8192;
if(useFmt)body.response_format={type:'json_object'};
const x=await post('https://api.openai.com/v1/chat/completions',{'Authorization':'Bearer '+k,'content-type':'application/json'},body);
if(x.r.ok&&x.j.choices&&x.j.choices[0]){
let c=x.j.choices[0].message&&x.j.choices[0].message.content;
if(Array.isArray(c))c=c.map(p=>p.text||'').join('');
if(!c)return jr(502,'OpenAI devolvió una respuesta vacía (el modelo gastó sus tokens pensando).');
remember('openai',tier,model);return jr(200,null,clean(c,json))}
const em=(x.j.error&&x.j.error.message)||('HTTP '+x.r.status);
if(!useOld&&/max_completion_tokens/i.test(em)){useOld=true;continue}
if(useFmt&&/response_format/i.test(em)){useFmt=false;continue}
if(noModel(x.r.status,em)||/model_not_found/i.test((x.j.error&&x.j.error.code)||'')){last=em;break}
return errR('openai',x.r.status,em)}}
return errR('openai',404,'No encontré un modelo disponible en tu cuenta. '+last)}
async function viaProvider(url,k,o){
try{
const m=(url.match(/models\/([^:?]+)/)||[])[1]||'';
if(/tts|image|embed|audio/i.test(m))return jr(400,'API key not valid para esta función: Claude y OpenAI no generan la voz natural de Jarvis (se usa la voz del celular).');
let b={};try{b=JSON.parse(o.body||'{}')}catch(e){}
const g=b.generationConfig||{},json=g.responseMimeType=='application/json';
const tier=/lite|nano|haiku|8b/i.test(m)?'fast':'strong';
const t=toMsgs(b);
return prov(k)=='claude'?await callClaude(k,tier,t.sys,t.msgs,g.maxOutputTokens||0,json):await callOpenAI(k,tier,t.sys,t.msgs,g.maxOutputTokens||0,json)
}catch(e){
if(e&&(e.name=='AbortError'))return jr(503,'rate/tiempo agotado hablando con el proveedor de IA');
if(e instanceof TypeError)throw e;
return jr(500,'Error interno del adaptador: '+(e&&e.message||e))}}
window.fetch=async function(u,o){
const url=(typeof u=='string')?u:((u&&u.url)||'');
if(url.indexOf('generativelanguage.googleapis.com')>-1&&url.indexOf(':generateContent')>-1&&o&&o.headers){
let k='';try{k=new Headers(o.headers).get('x-goog-api-key')||''}catch(e){}
k=String(k).trim();
if(isSk(k))return viaProvider(url,k,o)}
return rf(u,o)};
function wrapNative(){try{
const A=window.Android;if(!A||A.__j29||typeof A.syncConfig!=='function')return;
const o=A.syncConfig.bind(A);
const f=function(s){try{const c=JSON.parse(s);if(c&&Array.isArray(c.keys)){c.keys=c.keys.filter(x=>!isSk(x));s=JSON.stringify(c)}}catch(e){}return o(s)};
try{A.syncConfig=f;A.__j29=1}catch(e){}
if(A.syncConfig!==f){window.Android=new Proxy(A,{get:(t,p)=>p=='syncConfig'?f:(typeof t[p]=='function'?t[p].bind(t):t[p])})}
}catch(e){}}
wrapNative();
function badges(){try{
const l=document.getElementById('kl');if(!l)return;
let ks=[];try{ks=JSON.parse(localStorage.jkeys||'[]')}catch(e){}
[].forEach.call(l.children,(row,i)=>{
const t=row.firstElementChild,o=ks[i];if(!t||!o||t.textContent.indexOf(' · ')>-1)return;
t.textContent+=' · '+({claude:'Claude',openai:'OpenAI',gemini:'Gemini'})[prov(o.k)]})}catch(e){}}
try{
badges();
window.addEventListener('load',()=>{wrapNative();badges()});
if(typeof MutationObserver!=='undefined'){const l=document.getElementById('kl');if(l)new MutationObserver(()=>setTimeout(badges,0)).observe(l,{childList:true})}
}catch(e){}
})();
