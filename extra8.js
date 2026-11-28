(function(){
const $=i=>document.getElementById(i);
cfg.dir=Array.isArray(cfg.dir)?cfg.dir:[];
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const clean=n=>String(n||'').replace(/[^\d+]/g,'');
const J=o=>new Response(JSON.stringify(o),{headers:{'Content-Type':'application/json'}});
const pf=window.fetch.bind(window);
window.fetch=function(u,o){
if(typeof u=='string'&&u.indexOf('/api/contacts')==0){
let q=[];try{q=norm(decodeURIComponent(u.split('q=')[1]||'')).split(' ').filter(Boolean)}catch(e){}
if(!cfg.dir.length)add('j','Tu agenda está vacía. Ve a ⚙ → SISTEMA → AGENDA DE CONTACTOS e importa tus contactos.',Date.now(),false);
const seen={},res=[];
const score=n=>{if(!q.length)return 0;
if(n==q.join(' '))return 100;
const words=n.split(' ');
if(q.every(w=>words.some(x=>x===w)))return 90;
if(q.every(w=>n.includes(w)))return 70;
const joined=q.join('');
if(words.some(x=>x.startsWith(joined)||joined.startsWith(x)))return 50;
let hit=0;q.forEach(w=>{if(words.some(x=>x.startsWith(w)||w.startsWith(x)))hit++});
return hit?30+hit*5:0};
cfg.dir.forEach(c=>{const n=norm(c.name),num=clean(c.number),sc=score(n);
if(sc>0&&num&&!seen[num]){seen[num]=1;res.push({name:c.name,number:num,x:sc})}});
res.sort((a,b)=>b.x-a.x);
return Promise.resolve(J({results:res.slice(0,5)}))}
if(typeof u=='string'&&u.indexOf('/api/call')==0){
try{const a=document.createElement('a');a.href='tel:'+clean(JSON.parse(o.body).number);document.body.append(a);a.click();a.remove()}catch(e){}
return Promise.resolve(J({ok:true}))}
if(typeof u=='string'&&u.indexOf('/api/wa')==0)return Promise.resolve(J({ok:false}));
return pf(u,o)};
const row=document.createElement('div');row.className='row';
row.innerHTML='<label>AGENDA DE CONTACTOS (SE GUARDA EN JARVIS)</label><div id="dl" style="font-size:12px;margin-bottom:8px"></div><button class="hb" id="di">IMPORTAR DESDE MI CELULAR</button><div class="add"><input id="dn" placeholder="nombre"><input id="dt" inputmode="tel" placeholder="número"><button class="hb" id="da">+</button></div>';
$('t4').append(row);
function draw(){const l=$('dl');l.textContent='';
if(!cfg.dir.length){l.style.color='#ffb02e';l.textContent='Vacía. Importa tus contactos o agrégalos abajo.';return}
l.style.color='#cfe8ff';
const h=document.createElement('div');h.style.cssText='color:#5b7a99;margin-bottom:6px';h.textContent=cfg.dir.length+' contactos';l.append(h);
cfg.dir.slice(0,6).forEach((c,i)=>{const r=document.createElement('div');r.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:4px';
const t=document.createElement('span');t.textContent=c.name+' · '+c.number;
const b=document.createElement('button');b.className='hb';b.style.padding='4px 9px';b.textContent='X';b.onclick=()=>{cfg.dir.splice(i,1);sv();draw()};
r.append(t,b);l.append(r)});
if(cfg.dir.length>6){const m=document.createElement('div');m.style.color='#5b7a99';m.textContent='…y '+(cfg.dir.length-6)+' más';l.append(m)}}
async function autoSync(){
if(!('contacts' in navigator&&'ContactsManager' in window))return;
try{const perm=await navigator.permissions.query({name:'contacts'}).catch(()=>null);
if(perm&&perm.state!=='granted')return;}catch(e){}
}
autoSync();
$('di').onclick=async()=>{
if(!('contacts' in navigator&&'ContactsManager' in window)){alert('Este navegador no permite importar. Agrégalos a mano abajo.');return}
try{const r=await navigator.contacts.select(['name','tel'],{multiple:true});let n=0;
r.forEach(c=>{const name=(c.name&&c.name[0])||'',tel=(c.tel&&c.tel[0])||'';
if(name&&tel&&!cfg.dir.some(d=>d.name==name&&clean(d.number)==clean(tel))){cfg.dir.push({name:name,number:tel});n++}});
sv();draw();alert(n+' contactos agregados')}catch(e){}};
$('da').onclick=()=>{const n=$('dn').value.trim(),t=$('dt').value.trim();
if(!n||clean(t).length<6){alert('Escribe nombre y número');return}
cfg.dir.push({name:n,number:t});$('dn').value='';$('dt').value='';sv();draw()};
draw();
})();
