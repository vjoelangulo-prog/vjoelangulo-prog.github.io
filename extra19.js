(function(){
const $=i=>document.getElementById(i);
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.style.cssText=c;if(x!=null)e.textContent=x;return e};
window.JVER='3.0';window.JBUILD='2026-11-23';
const tabs=document.querySelector('.tabs'),pb=document.querySelector('.pb');
if(!tabs||!pb||$('t6'))return;
document.head.append(mk('style','','.tabs{overflow-x:auto;scrollbar-width:none}.tabs::-webkit-scrollbar{display:none}.tabs button{flex:1 0 auto;padding:13px 12px;white-space:nowrap}.acc>label{cursor:pointer;display:flex!important;justify-content:space-between;margin-bottom:0!important;color:#cfe8ff!important;font-size:11px!important;letter-spacing:2px}.acc>.bd{display:none;margin-top:12px}.acc.open>.bd{display:block}.acc.open>label{color:var(--a)!important}'));
const tb=mk('button','','CUENTA'),t6=mk('div');
t6.className='tp';t6.id='t6';tb.dataset.t='t6';tabs.append(tb);pb.append(t6);
tb.onclick=()=>{document.querySelectorAll('.tabs button,.tp').forEach(x=>x.classList.remove('on'));tb.classList.add('on');t6.classList.add('on');try{tb.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}};
function acc(r,open){const l=r.firstElementChild;if(!l||l.tagName!='LABEL'||r.classList.contains('acc'))return;
const bd=mk('div');bd.className='bd';[...r.childNodes].forEach(n=>{if(n!==l)bd.append(n)});r.append(bd);r.classList.add('acc');
const ar=mk('span','',open?'▾':'▸');l.append(ar);
l.onclick=()=>{const o=r.classList.toggle('open');ar.textContent=o?'▾':'▸'};
if(open)r.classList.add('open')}
function init(){
const t4=$('t4');if(!t4)return;
const rows=()=>[...t4.children].filter(e=>e.classList&&e.classList.contains('row'));
const find=k=>rows().find(r=>{const l=r.firstElementChild;return l&&l.tagName=='LABEL'&&l.textContent.toUpperCase().indexOf(k)==0});
const card=t=>{const r=mk('div');r.className='row';r.append(mk('label','',t));return r};
const m=card('MEMORIA Y CHAT');
[...t4.children].filter(e=>e.tagName=='BUTTON'&&/clr\(|wipe\(/.test(e.getAttribute('onclick')||'')).forEach(b=>{b.style.margin='0 8px 8px 0';m.append(b)});
const res=find('RESPALDO'),ag=find('AGENDA');
if(res)t6.append(res);
t6.append(m);
if(ag)t6.append(ag);
const ab=card('ACERCA DE JARVIS'),inf=mk('div','font-size:13px;line-height:1.8;color:#cfe8ff');
inf.textContent='Jarvis v'+window.JVER+' · compilación '+window.JBUILD+' · '+(window.Android?'app de Android':'navegador');
ab.append(inf);t6.append(ab);
rows().forEach(r=>{if(r.style.display!='none'){const l=r.firstElementChild;acc(r,!!l&&l.textContent.indexOf('API KEYS')==0)}});
[...t6.children].forEach(r=>{if(r.classList&&r.classList.contains('row')){const l=r.firstElementChild;acc(r,!!l&&l.textContent=='CUENTA')}})}
if(document.readyState=='complete')setTimeout(init,60);else addEventListener('load',()=>setTimeout(init,60));
})();
