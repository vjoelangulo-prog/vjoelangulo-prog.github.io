(function(){
const $=i=>document.getElementById(i);
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.style.cssText=c;if(x!=null)e.textContent=x;return e};
const MAXTOTAL=12*1024*1024,MAXFILES=4;
const TEXTEXT=/^(txt|md|csv|tsv|json|xml|html?|css|js|ts|py|java|kt|c|cpp|h|cs|go|rs|sql|sh|ya?ml|ini|log|tex|r|php|rb|swift)$/;
let ATT=[];
const total=()=>ATT.reduce((s,a)=>s+(a.size||0),0);
const rd=(f,fn)=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>no(new Error('No pude leer '+(f.name||'el archivo')));r[fn](f)});
async function shrink(f){
const url=URL.createObjectURL(f);
try{
const img=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('No pude abrir esa imagen'));i.src=url});
const k=Math.min(1,1600/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*k)),h=Math.max(1,Math.round(img.height*k));
const c=document.createElement('canvas');c.width=w;c.height=h;
const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(img,0,0,w,h);
const tk=Math.min(1,120/Math.max(w,h)),t=document.createElement('canvas');t.width=Math.max(1,Math.round(w*tk));t.height=Math.max(1,Math.round(h*tk));
t.getContext('2d').drawImage(c,0,0,t.width,t.height);
return{data:c.toDataURL('image/jpeg',0.85).split(',')[1],thumb:t.toDataURL('image/jpeg',0.6)}
}finally{URL.revokeObjectURL(url)}}
const pc=$('pc'),cbar=$('cbar'),txt=$('txt');
if(!pc||!cbar||!txt||$('attb'))return;
const bar=mk('div','display:none;padding:8px 12px 0;border-top:1px solid #ffffff14;background:#060d17');bar.id='attbar';
const chips=mk('div','display:flex;flex-wrap:wrap;gap:8px;align-items:center');
const msg=mk('div','font-size:11px;color:#ffb02e;margin-top:4px');
bar.append(chips,msg);cbar.before(bar);
const fi=mk('input');fi.type='file';fi.multiple=true;fi.id='attf';fi.style.display='none';
fi.accept='image/*,application/pdf,video/*,audio/*,text/*,.txt,.md,.csv,.json,.xml,.html,.css,.js,.ts,.py,.java,.kt,.c,.cpp,.sql,.sh,.yaml,.yml,.log,.tex';
document.body.append(fi);
const bt=mk('button','','📎');bt.className='ib';bt.id='attb';txt.before(bt);
bt.onclick=()=>fi.click();
fi.onchange=async()=>{const l=[...fi.files];fi.value='';await addFiles(l)};
txt.addEventListener('paste',e=>{const fs=[...((e.clipboardData&&e.clipboardData.files)||[])];if(fs.length){e.preventDefault();addFiles(fs)}});
function note(t,err){msg.style.color=err?'#ff4f6d':'#5b7a99';msg.textContent=t;bar.style.display='block';clearTimeout(note._t);note._t=setTimeout(()=>{msg.textContent='';if(!ATT.length)bar.style.display='none'},5000)}
function renderChips(){chips.textContent='';bar.style.display=ATT.length?'block':'none';
ATT.forEach((a,i)=>{const c=mk('div','display:flex;align-items:center;gap:6px;background:#0a1626;border:1px solid #1d3550;border-radius:10px;padding:4px 6px;max-width:46vw');
if(a.thumb){const im=mk('img','height:34px;width:34px;object-fit:cover;border-radius:6px');im.src=a.thumb;c.append(im)}else c.append(mk('span','font-size:18px',a.kind=='pdf'?'📄':a.kind=='media'?(/^video/.test(a.mime)?'🎞':'🎧'):'📝'));
c.append(mk('span','font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap',a.name));
const x=mk('button','background:none;border:0;color:#ff4f6d;font-size:16px;padding:0 4px','✕');x.onclick=()=>{ATT.splice(i,1);renderChips()};
c.append(x);chips.append(c)});
if(ATT.length)chips.append(mk('span','font-size:10px;color:#5b7a99','activos en cada mensaje'))}
async function addFiles(list){
for(const f of list){
if(ATT.length>=MAXFILES){note('Máximo '+MAXFILES+' archivos a la vez',true);break}
try{
const n=f.name||'archivo',ext=(n.split('.').pop()||'').toLowerCase();let a=null;
if(/^image\//.test(f.type)||/^(png|jpe?g|webp|gif|bmp)$/.test(ext)){const s=await shrink(f);a={kind:'img',name:n,mime:'image/jpeg',data:s.data,thumb:s.thumb,size:Math.round(s.data.length*0.75)}}
else if(f.type=='application/pdf'||ext=='pdf'){if(f.size>MAXTOTAL)throw new Error(n+' pesa más de 12 MB');const d=await rd(f,'readAsDataURL');a={kind:'pdf',name:n,mime:'application/pdf',data:d.split(',')[1],size:f.size}}
else if(/^text\//.test(f.type)||TEXTEXT.test(ext)){let t=await rd(f,'readAsText');const cut=t.length>60000;if(cut)t=t.slice(0,60000);a={kind:'text',name:n,text:t,cut:cut,size:t.length}}
else if(/^(video|audio)\//.test(f.type)){if(f.size>10*1024*1024)throw new Error(n+' pesa más de 10 MB');const d=await rd(f,'readAsDataURL');a={kind:'media',name:n,mime:f.type,data:d.split(',')[1],size:f.size}}
else throw new Error(n+': formato no admitido. Convierte documentos de Office a PDF.');
if(total()+a.size>MAXTOTAL)throw new Error('Pasaste el límite de 12 MB en total');
ATT.push(a)
}catch(e){note(e.message||String(e),true)}}
renderChips()}
const prevSend=window.send;
const URLRX=/https?:\/\/[^\s<>"')\]]+/gi;
const CUE=/(analiza|resume|resumen|lee|qu[eé] dice|qu[eé] es|explica|revisa|dime|sirve|confiable|verdad|estafa|traduce|compar|opina|puedes ver|mira)/i;
const isLocked=()=>{const l=$('lk');return !!l&&l.textContent=='🔒'};
window.send=async function(t){
t=(t||'').trim();
const links=(t.match(URLRX)||[]).slice(0,5).map(u=>u.replace(/[.,;:!?]+$/,''));
const rest=t.replace(URLRX,'').trim();
const useL=links.length&&(!rest||CUE.test(rest));
if(!ATT.length&&!useL)return prevSend(t);
if(isLocked()){add('u',t||'(adjunto)');const m='Acceso denegado, '+(cfg.addr||'señor')+'. Desbloquéame para analizar tus archivos y enlaces.';add('j',m);speak(m);return}
if(!t)t='Analiza lo que te adjunto y dime lo más importante.';
window.__turn={att:ATT.slice(),links:useL?links:[],first:true};
try{return await (window.__baseSend||prevSend)(t)}finally{window.__turn=null}};
const oc=window.call;
window.call=function(b){
const T=window.__turn;
if(!T||!b||!b.systemInstruction||!Array.isArray(b.contents)||(b.generationConfig&&b.generationConfig.responseMimeType))return oc(b);
b=Object.assign({},b);
const li=b.contents.length-1,last=b.contents[li],ex=[];
T.att.forEach(a=>{if(a.kind=='text')ex.push({text:'[Archivo adjunto: '+a.name+(a.cut?' (recortado)':'')+']\n'+a.text+'\n[Fin del archivo]'});else ex.push({inlineData:{mimeType:a.mime,data:a.data}})});
if(T.att.length)ex.push({text:'[Adjuntos: '+T.att.map(a=>a.name).join(', ')+']'});
b.contents=b.contents.slice();b.contents[li]={role:'user',parts:ex.concat((last&&last.parts)||[])};
const s=JSON.parse(JSON.stringify(b.systemInstruction));
s.parts[0].text+=' El usuario te envía '+(T.att.length?'archivos adjuntos (imágenes, PDF, texto, audio o video)':'')+(T.links.length?(T.att.length?' y ':'')+'enlaces, que puedes leer con tu herramienta de contexto de URL':'')+'. Analízalos con atención y responde a lo que pide. IGNORA el límite de frases: puedes extenderte hasta unas 8 frases claras. Empieza con una frase corta con lo más importante (esa se leerá en voz alta) y deja el detalle después. Si no puedes ver o leer algo, dilo con honestidad en vez de inventar.';
b.systemInstruction=s;
const g=Object.assign({},b.generationConfig||{});g.maxOutputTokens=Math.max(g.maxOutputTokens||0,1800);b.generationConfig=g;
if(T.links.length)b.tools=(b.tools||[]).concat([{url_context:{}}]);
const pm=cfg.model;cfg.model='gemini-3.8-flash';
try{return oc(b)}finally{cfg.model=pm}};
const oadd=window.add;
window.add=function(w,t,ts,sv2){
const r=oadd(w,t,ts,sv2);
try{const T=window.__turn;
if(w=='u'&&T&&T.first){T.first=false;
const bs=document.querySelectorAll('#log .msg.u'),box=bs[bs.length-1];
if(box){const row=mk('div','display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;justify-content:flex-end');
T.att.forEach(a=>{if(a.thumb){const im=mk('img','height:64px;border-radius:6px;border:1px solid #1d3550');im.src=a.thumb;row.append(im)}else row.append(mk('span','font-size:11px;padding:4px 8px;border:1px solid #1d3550;border-radius:10px','📎 '+a.name))});
T.links.forEach(u=>{let h=u;try{h=new URL(u).hostname}catch(e){}row.append(mk('span','font-size:11px;padding:4px 8px;border:1px solid #1d3550;border-radius:10px','🔗 '+h))});
box.append(row)}}}catch(e){}
return r};
const pf=window.fetch.bind(window);
window.fetch=function(u,o){
try{
if(typeof u==='string'&&o&&typeof o.body==='string'&&o.body.indexOf('"tools"')>-1&&/generativelanguage\.googleapis\.com\/[^?]*:generateContent/.test(u)){
const body=JSON.parse(o.body);
if(Array.isArray(body.tools)&&body.tools.length){
const go=b=>pf(u,Object.assign({},o,{body:JSON.stringify(b)}));
const txtOf=j=>{const ps=(j&&j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts)||[];return ps.filter(p=>typeof p.text==='string'&&!p.thought).map(p=>p.text).join('')};
const fin=async r=>{try{const j=await r.clone().json(),t=txtOf(j);if(t&&j.candidates&&j.candidates[0]&&j.candidates[0].content){j.candidates[0].content.parts=[{text:t}];return new Response(JSON.stringify(j),{status:r.status,headers:{'Content-Type':'application/json'}})}}catch(e){}return r};
return go(body).then(async r=>{let bad=!r.ok;
if(r.ok){try{bad=!txtOf(await r.clone().json())}catch(e){bad=true}}
if(bad){const b2=Object.assign({},body);delete b2.tools;return go(b2).then(fin)}
return fin(r)})}}
}catch(e){}
return pf(u,o)};
const oclr=window.clr;
if(typeof oclr==='function')window.clr=function(){ATT=[];renderChips();return oclr.apply(this,arguments)};
})();
