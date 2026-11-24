(function(){
const $=i=>document.getElementById(i);
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.style.cssText=c;if(x!=null)e.textContent=x;return e};
const tabs=document.querySelector('.tabs'),pb=document.querySelector('.pb');
if(!tabs||!pb||$('t7'))return;
const N=(window.Android&&typeof window.Android.agendaGet==='function')?window.Android:null;
const inApp=/JarvisApp/.test(navigator.userAgent);
const ld=(k,d)=>{try{return JSON.parse(localStorage[k])||d}catch(e){return d}};
cfg.rem=Array.isArray(cfg.rem)?cfg.rem:[];
const pad=n=>('0'+n).slice(-2);
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes())+':00';
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const A=()=>cfg.addr||'señor';
const say=t=>{add('j',t);speak(t)};
const IN='width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:10px;font:13px ui-monospace,monospace;margin-bottom:8px';
let T=[],R=[],showDone=false;
if(N){const old=ld('jtasks',[]);if(old.length){old.forEach(o=>{if(!o.done&&o.t)N.taskAdd(o.t,String(o.due||0))});localStorage.removeItem('jtasks')}}
function load(){
if(N){try{const o=JSON.parse(N.agendaGet());T=o.tasks||[];R=(o.rem||[]).map(r=>({id:r.id,t:r.t,at:r.at,src:'n'}))}catch(e){T=[];R=[]}}
else{T=ld('jtasks',[]);R=[]}
const now=Date.now();
(cfg.rem||[]).forEach(r=>{if(!r.done&&r.at>now)R.push({id:r.id,t:r.t,at:r.at,src:'w'})});
R.sort((a,b)=>a.at-b.at)}
const saveT=()=>{localStorage.jtasks=JSON.stringify(T)};
function tAdd(text,due){text=String(text||'').trim();if(!text)return false;
if(N){N.taskAdd(text,String(due||0))}else{T.push({id:Date.now(),t:text,due:due||0,done:false});saveT()}load();return true}
function tDone(id,v){if(N)N.taskDone(String(id),v?'1':'0');else{const o=T.find(x=>x.id==id);if(o){o.done=v;saveT()}}load()}
function tDel(id){if(N)N.taskDel(String(id));else{T=T.filter(x=>x.id!=id);saveT()}load()}
function rAdd(text,at){text=String(text||'').trim();if(!text||!(at>Date.now()))return false;
if(N){if(!N.remAdd(text,String(at)))return false}else{cfg.rem.push({id:String(Date.now()),t:text,at:at,done:false});sv()}load();return true}
function rDel(r){if(r.src=='n'&&N)N.remDel(String(r.id));else{cfg.rem=cfg.rem.filter(x=>String(x.id)!=String(r.id));sv()}load()}
const hhmm=ts=>new Date(ts).toLocaleTimeString('es',{hour:'numeric',minute:'2-digit'});
const longDay=ts=>new Date(ts).toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'});
function dayLabel(ts){const d=new Date(ts),n=new Date(),m=new Date(n.getTime()+864e5);
if(d.toDateString()==n.toDateString())return 'HOY';if(d.toDateString()==m.toDateString())return 'MAÑANA';return longDay(ts).toUpperCase()}
function fmt(ts){const l=dayLabel(ts);return (l=='HOY'?'hoy':l=='MAÑANA'?'mañana':longDay(ts))+' a las '+hhmm(ts)}
const tb=mk('button','','AGENDA'),t7=mk('div');
t7.className='tp';t7.id='t7';tb.dataset.t='t7';
tabs.insertBefore(tb,tabs.children[1]||null);pb.append(t7);
tb.onclick=()=>{document.querySelectorAll('.tabs button,.tp').forEach(x=>x.classList.remove('on'));tb.classList.add('on');t7.classList.add('on');load();draw();try{tb.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}};
const sum=mk('div','font-size:13px;color:#cfe8ff;margin-bottom:8px;line-height:1.6');sum.id='agsum';
const st=mk('div','font-size:11px;line-height:1.5;margin-bottom:12px;color:'+(N?'#2fffa0':'#ffb02e'),N?'✔ Conectada a la app: las alarmas y avisos suenan aunque cierres Jarvis.':inApp?'Actualiza el APK de Jarvis para compartir esta agenda con la burbuja y que suene con la app cerrada.':'Modo navegador: los avisos solo suenan con esta página abierta.');
const form=mk('div');form.className='row';
const ti=mk('input',IN);ti.placeholder='Escribe un pendiente, alarma o recordatorio…';
const di=mk('input',IN);di.type='datetime-local';
const hint=mk('div','font-size:11px;color:#5b7a99;margin-bottom:8px','Fecha y hora: opcional en pendientes, obligatoria en alarmas.');
const msg=mk('div','font-size:12px;min-height:16px;margin-top:6px;color:#5b7a99');
const say2=(t,ok)=>{msg.style.color=ok?'#2fffa0':'#ff4f6d';msg.textContent=t};
const mb=(x,f)=>{const b=mk('button','margin:0 8px 8px 0',x);b.className='hb';b.onclick=f;return b};
form.append(mk('label','','NUEVO'),ti,di,hint,
mb('+ PENDIENTE',()=>{if(!ti.value.trim()){say2('Escribe qué hay que hacer');return}const due=di.value?new Date(di.value).getTime():0;
if(tAdd(ti.value,isFinite(due)?due:0)){ti.value='';di.value='';say2('Pendiente guardado',true);draw()}}),
mb('⏰ ALARMA O RECORDATORIO',()=>{const at=di.value?new Date(di.value).getTime():0;if(!(at>Date.now())){say2('Elige una fecha y hora futuras');return}
if(rAdd(ti.value.trim()||'Alarma',at)){ti.value='';di.value='';say2('Guardada: sonará '+fmt(at),true);draw()}else say2('No se pudo guardar')}),msg);
const list=mk('div');list.id='aglist';
t7.append(sum,st,form,list);
function sec(t){list.append(mk('div','font-size:10px;letter-spacing:3px;color:var(--a);margin:22px 0 6px;padding-bottom:6px;border-bottom:1px solid #ffffff18',t))}
function rowEl(left,txt,sub,strike,onDel){const r=mk('div','display:flex;align-items:center;gap:10px;padding:10px 4px;border-bottom:1px solid #ffffff12');
if(left)r.append(left);
const b=mk('div','flex:1;min-width:0');
b.append(mk('div','font-size:14px;line-height:1.4;word-wrap:break-word;'+(strike?'text-decoration:line-through;opacity:.5':''),txt));
if(sub)b.append(mk('div','font-size:11px;color:#5b7a99;margin-top:2px',sub));
r.append(b);const x=mk('button','padding:6px 10px','✕');x.className='hb';x.onclick=onDel;r.append(x);return r}
function taskRow(o){const c=mk('button','flex:none;width:30px;height:30px;border-radius:50%;border:2px solid var(--a);background:'+(o.done?'var(--a)':'transparent')+';color:#04070d;font-size:14px',o.done?'✓':'');
c.onclick=()=>{tDone(o.id,!o.done);draw()};
let sub='';if(o.due>0)sub=((!o.done&&o.due<Date.now())?'⚠ vencido · ':'Para ')+fmt(o.due);
return rowEl(c,o.t,sub,o.done,()=>{tDel(o.id);draw()})}
function remRow(r){return rowEl(null,'⏰ '+hhmm(r.at)+'  '+r.t,r.src=='n'?'Suena aunque cierres la app':'Aviso web',false,()=>{rDel(r);draw()})}
function draw(){list.textContent='';
const open=T.filter(x=>!x.done).sort((a,b)=>(a.due||9e15)-(b.due||9e15)),done=T.filter(x=>x.done);
const hoy=R.filter(r=>dayLabel(r.at)=='HOY').length;
sum.textContent=open.length+(open.length==1?' pendiente':' pendientes')+' · '+hoy+(hoy==1?' aviso hoy':' avisos hoy')+' · '+R.length+' por venir';
sec('PENDIENTES ('+open.length+')');
if(!open.length)list.append(mk('div','font-size:12px;color:#5b7a99;margin:8px 0','No tienes pendientes. Escribe uno arriba o dile a Jarvis: «agrega a mis pendientes comprar pollo».'));
open.forEach(o=>list.append(taskRow(o)));
if(done.length){const b=mk('button','margin-top:12px',(showDone?'▾ ':'▸ ')+'HECHOS ('+done.length+')');b.className='hb';b.onclick=()=>{showDone=!showDone;draw()};list.append(b);
if(showDone){done.forEach(o=>list.append(taskRow(o)));const c=mk('button','margin:12px 0 0 0','BORRAR HECHOS');c.className='hb';c.onclick=()=>{done.forEach(o=>tDel(o.id));draw()};list.append(c)}}
sec('ALARMAS Y RECORDATORIOS ('+R.length+')');
if(!R.length)list.append(mk('div','font-size:12px;color:#5b7a99;margin:8px 0','Nada por venir. Dile: «ponme una alarma mañana a las 6» o «recuérdame el viernes a las 4 llamar al doctor».'));
let last='';R.forEach(r=>{const l=dayLabel(r.at);if(l!=last){last=l;list.append(mk('div','font-size:11px;letter-spacing:2px;color:#ffb02e;margin:14px 0 2px',l))}list.append(remRow(r))})}
function match(q){const w=norm(q).split(' ').filter(x=>x.length>2);let best=null,bs=0;
T.filter(x=>!x.done).forEach(o=>{const n=norm(o.t),s=w.filter(x=>n.includes(x)).length;if(s>bs){bs=s;best=o}});return best}
function dayText(at,addr){let d=at?new Date(String(at).length<=10?at+'T00:00:00':at):new Date();if(isNaN(d))d=new Date();
const s=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime(),e=s+864e5,today=Date.now()>=s&&Date.now()<e;
const rs=R.filter(r=>r.at>=s&&r.at<e),ts=T.filter(x=>!x.done&&((x.due>=s&&x.due<e)||(!x.due&&today)));
const lab=today?'Hoy':longDay(s),p=[];
if(ts.length)p.push('pendientes: '+ts.map(x=>x.t).join(', '));
if(rs.length)p.push('avisos y alarmas: '+rs.map(r=>'a las '+hhmm(r.at)+' '+r.t).join(', '));
return p.length?lab+', '+addr+', tiene '+p.join('. ')+'.':lab+' no tiene nada pendiente, '+addr+'.'}
async function parse(t){const n=new Date();
const p='Ahora es: '+n.toLocaleString('es',{dateStyle:'full',timeStyle:'short'})+' (hora local '+iso(n)+').\nEl usuario dijo: "'+t.replace(/"/g,"'")+'"\nResponde SOLO JSON con una de estas formas: {"a":"task_add","text":"el pendiente","at":"YYYY-MM-DDTHH:MM:SS o vacío"} para añadir un pendiente | {"a":"task_list"} si pregunta qué pendientes tiene | {"a":"task_done","text":"cuál"} para marcar uno como hecho | {"a":"task_remove","text":"cuál"} para borrar un pendiente | {"a":"alarm","text":"etiqueta corta","at":"YYYY-MM-DDTHH:MM:SS"} para despertador o alarma | {"a":"remind","text":"qué recordar","at":"YYYY-MM-DDTHH:MM:SS"} para recuérdame o avísame | {"a":"agenda","at":"YYYY-MM-DD"} si pregunta qué tiene hoy, mañana u otro día | {"a":"rem_list"} si pregunta qué alarmas o recordatorios tiene en general | {"a":"none"} si no es nada de eso.';
return JSON.parse(await call({contents:[{role:'user',parts:[{text:p}]}],generationConfig:{responseMimeType:'application/json',maxOutputTokens:200}}))}
function run(a){const addr=A();
switch(a.a){
case 'task_add':{const due=a.at?new Date(a.at).getTime():0,d=isFinite(due)&&due>0?due:0;
if(!a.text){say('¿Qué anoto, '+addr+'?');return}tAdd(a.text,d);draw();say('Anotado en sus pendientes, '+addr+': '+a.text+(d?', para '+fmt(d):'')+'.');return}
case 'task_list':{const o=T.filter(x=>!x.done);say(o.length?'Tiene '+o.length+(o.length==1?' pendiente: ':' pendientes: ')+o.map(x=>x.t).join(', ')+'.':'No tiene pendientes, '+addr+'.');return}
case 'task_done':case 'task_remove':{const m=match(a.text);if(!m){say('No encontré ese pendiente, '+addr+'.');return}
if(a.a=='task_done')tDone(m.id,true);else tDel(m.id);draw();say((a.a=='task_done'?'Hecho: ':'Eliminado: ')+m.t+'.');return}
case 'alarm':case 'remind':{let at=new Date(a.at).getTime();if(!isFinite(at)){say('No entendí la hora, '+addr+'.');return}
if(a.a=='alarm')while(at<=Date.now())at+=864e5;
if(at<=Date.now()+2000){say('Esa hora ya pasó, '+addr+'.');return}
const txt=String(a.text||'').trim()||(a.a=='alarm'?'Alarma':'Recordatorio');
if(!rAdd(txt,at)){say('No pude guardarlo, '+addr+'.');return}draw();
say('Listo, '+addr+'. '+(a.a=='alarm'?'Alarma ':'Aviso ')+fmt(at)+(txt!='Alarma'&&txt!='Recordatorio'?': '+txt:'')+'.');return}
case 'agenda':say(dayText(a.at,addr));return;
case 'rem_list':{const l=R.slice(0,6);say(l.length?'Tiene '+R.length+(R.length==1?' aviso: ':' avisos: ')+l.map(r=>fmt(r.at)+' '+r.t).join('. ')+'.':'No tiene alarmas ni recordatorios por venir, '+addr+'.');return}
}
say('No entendí, '+addr+'.')}
const GATE=/(pendiente|mi agenda|qu[eé] tengo|alarma|recordatorio|recu[eé]rdame|av[ií]same|d[ée]spi[eé]rtame|ya (hice|termin|compr|llam|pagu)|termin[eé])/i;
const isLocked=()=>{const l=$('lk');return !!l&&l.textContent=='🔒'};
const prev=window.send;
window.send=async function(t){t=(t||'').trim();
if(!t||!GATE.test(t)||t.split(/\s+/).length<2)return prev(t);
if(isLocked()){add('u',t);say('Acceso denegado, '+A()+'. Necesito la clave para mostrar su agenda.');return}
let a=null;S('thinking','ENTENDIENDO...');
try{a=await parse(t)}catch(e){S('','TOCA PARA HABLAR');return prev(t)}
S('','TOCA PARA HABLAR');
if(!a||a.a=='none')return prev(t);
if((a.a=='alarm'||a.a=='remind')&&!N)return prev(t);
load();add('u',t);run(a)};
const cb=$('cb');
if(cb){const ab=mk('button','','📅');ab.className='ib';ab.id='agb';cb.after(ab);
ab.onclick=()=>{if(isLocked()&&window.JSEC){JSEC.openUnlock('Para abrir la agenda, ingrese la clave');return}$('ps').classList.add('open');tb.click()}}
setInterval(()=>{if(t7.classList.contains('on')&&$('ps').classList.contains('open')){load();draw()}},3000);
load();draw();
})();
