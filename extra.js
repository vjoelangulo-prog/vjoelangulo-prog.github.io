window.__baseSend=window.__baseSend||window.send;
(function(){
const U='https://generativelanguage.googleapis.com/v1beta/models/';
const SK=['jkey','jkeys','jkeyi','jcfg','jfacts','jhist','jlog','jcol'];
const g=(k,d)=>{try{return JSON.parse(localStorage[k])||d}catch(e){return d}};
let keys=g('jkeys',[]),ai=+localStorage.jkeyi||0,lastS='';
if(localStorage.jkey&&!keys.some(x=>x.k==localStorage.jkey))keys.push({n:'Clave '+(keys.length+1),k:localStorage.jkey});
if(ai>=keys.length)ai=0;
const st=document.createElement('style');
st.textContent='html,body{overflow:hidden;width:100%;max-width:100vw}.p{visibility:hidden;transition:transform .35s,visibility 0s .35s}.p.open{visibility:visible;transition:transform .35s,visibility 0s}';
document.head.append(st);
function push(){const o={};SK.forEach(k=>{const v=localStorage.getItem(k);if(v!==null)o[k]=v});const s=JSON.stringify(o);if(s===lastS)return;lastS=s;fetch('/api/data',{method:'POST',body:s}).catch(()=>{lastS=''})}
function save(){localStorage.jkeys=JSON.stringify(keys);localStorage.jkeyi=ai;const k=keys[ai]?keys[ai].k:'';key=k;localStorage.jkey=k;const h=document.getElementById('k');if(h)h.value=k;push()}
window.call=async function(b){
if(key&&!keys.some(x=>x.k==key)){keys.push({n:'Clave '+(keys.length+1),k:key});ai=keys.length-1;save();draw()}
if(!keys.length)throw new Error('Sin API key. Agrégala en Ajustes > Sistema');
let last=null;
for(let n=0;n<keys.length;n++){const i=(ai+n)%keys.length;let j;
try{const r=await fetch(U+cfg.model+':generateContent',{method:'POST',headers:{'x-goog-api-key':keys[i].k,'content-type':'application/json'},body:JSON.stringify(b)});j=await r.json()}catch(e){throw new Error('Sin conexión a internet')}
if(j.error){last=new Error(j.error.message);if(/API key|quota|exhaust|rate/i.test(j.error.message)||[401,403,429].includes(j.error.code))continue;throw last}
if(i!=ai){ai=i;save();draw()}
return j.candidates[0].content.parts[0].text}
throw last||new Error('Error')};
const hk=document.getElementById('k'),row=hk.closest('.row');row.style.display='none';
const box=document.createElement('div');box.className='row';
box.innerHTML='<label>API KEYS (SE GUARDAN EN EL CELULAR)</label><div id="kl"></div><div class="add"><input id="kn" placeholder="nombre" style="max-width:90px"><input id="kv" type="password" placeholder="pega la clave"><button class="hb" id="ka">+</button></div><div id="km" style="font-size:11px;margin-top:8px;color:#5b7a99;min-height:14px"></div>';
row.after(box);
const M=(t,c)=>{const m=document.getElementById('km');m.style.color=c||'#5b7a99';m.textContent=t};
function draw(){const l=document.getElementById('kl');l.textContent='';
if(!keys.length){const p=document.createElement('div');p.style.cssText='font-size:12px;color:#ffb02e;margin-bottom:8px';p.textContent='Sin claves. Agrega una abajo.';l.append(p);return}
keys.forEach((o,i)=>{const r=document.createElement('div');r.style.cssText='display:flex;align-items:center;gap:6px;margin-bottom:8px;padding:8px;border:1px solid '+(i==ai?'var(--a)':'#1d3550');
const t=document.createElement('div');t.style.cssText='flex:1;min-width:0;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';t.textContent=(i==ai?'● ':'○ ')+o.n+' '+o.k.slice(0,5)+'…'+o.k.slice(-4);r.append(t);
[['USAR','u'],['PROBAR','t'],['X','d']].forEach(([x,a])=>{const b=document.createElement('button');b.className='hb';b.style.padding='7px 8px';b.textContent=x;b.onclick=()=>act(a,i);r.append(b)});
l.append(r)})}
async function act(a,i){
if(a=='u'){ai=i;save();draw();M('Clave activa: '+keys[i].n,'#2fffa0')}
else if(a=='d'){if(confirm('Borrar '+keys[i].n+'?')){keys.splice(i,1);if(ai>=keys.length)ai=0;save();draw();M('Borrada')}}
else{M('Probando...','#ffb02e');
try{const r=await fetch(U+cfg.model+':generateContent',{method:'POST',headers:{'x-goog-api-key':keys[i].k,'content-type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:'hola'}]}],generationConfig:{maxOutputTokens:20}})});const j=await r.json();
if(j.error)M('✖ '+keys[i].n+': '+j.error.message,'#ff4f6d');else M('✔ '+keys[i].n+' funciona','#2fffa0')}
catch(e){M('✖ Sin internet','#ff4f6d')}}}
document.getElementById('ka').onclick=()=>{
const v=document.getElementById('kv').value.replace(/\s+/g,''),n=document.getElementById('kn').value.trim()||('Clave '+(keys.length+1));
if(v.length<20){M('La clave parece incompleta','#ff4f6d');return}
if(keys.some(x=>x.k==v)){M('Esa clave ya está','#ffb02e');return}
keys.push({n,k:v});ai=keys.length-1;save();draw();
document.getElementById('kv').value='';document.getElementById('kn').value='';M('Agregada. Pulsa PROBAR para verificarla','#2fffa0')};
save();draw();
setInterval(push,3000);addEventListener('visibilitychange',push);addEventListener('pagehide',push);
})();
