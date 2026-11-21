(function(){
const $=i=>document.getElementById(i);
const h2=(h,a)=>{const n=parseInt(h.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'};
const sty=document.createElement('style');
sty.textContent='#core i,#orb{display:none!important}#sc{display:block}';
document.head.append(sty);
const core=$('core'),sc=document.createElement('canvas');sc.id='sc';core.prepend(sc);
const cx=sc.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2);
let W=0;
function rs(){const s=Math.round(Math.min(innerWidth*.94,innerHeight*.52,420));if(s!=W&&s>50){W=s;sc.style.width=s+'px';sc.style.height=s+'px';sc.width=s*dpr;sc.height=s*dpr}}
const N=1100,P=[];
for(let i=0;i<N;i++){const y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y),th=i*2.399963;P.push({x:Math.cos(th)*r,y:y,z:Math.sin(th)*r,rr:.5+.5*Math.random(),ph:Math.random()*6.283,f:.8+Math.random()*1.6,sz:.7+Math.random()*1.5})}
const LB={listening:'ESCUCHANDO',thinking:'PROCESANDO',speaking:'HABLANDO'};
const cl=()=>({listening:'#2fffa0',thinking:'#ffb02e',speaking:'#ff4fd8'}[state]||cfg.theme);
const TC=.93,TS=.36;
let a=0,amp=.03,spd=.25,gl=.5,lvl=0,tl=0,nl=0,last=0;
function frame(ts){
requestAnimationFrame(frame);if(document.hidden)return;rs();if(!W)return;
const t=ts/1000,dt=Math.min(.05,t-last);last=t;
let ta=.03,tsp=.25,tg=.5;
if(state=='listening'){lvl=.4+.35*Math.sin(t*3.2);ta=.07+.08*lvl;tsp=.45;tg=.85}
else if(state=='thinking'){ta=.05;tsp=2.3;tg=.8;lvl=.5}
else if(state=='speaking'){if(ts>nl){tl=.25+Math.random()*.75;nl=ts+80+Math.random()*140}lvl+=(tl-lvl)*.25;ta=.06+.2*lvl;tsp=.8;tg=.7+.3*lvl}
else lvl=0;
amp+=(ta-amp)*.12;spd+=(tsp-spd)*.05;gl+=(tg-gl)*.1;a+=dt*spd;
const S=sc.width,c=S/2,R=S*.27,col=cl();
cx.clearRect(0,0,S,S);
const GR=R*(1.75+amp*.8),gr=cx.createRadialGradient(c,c,R*.9,c,c,GR);
gr.addColorStop(0,h2(col,Math.min(1,.95*gl)));gr.addColorStop(.3,h2(col,.55*gl));gr.addColorStop(1,h2(col,0));
cx.fillStyle=gr;cx.beginPath();cx.arc(c,c,GR,0,6.2832);cx.fill();
cx.fillStyle='#050a14';cx.beginPath();cx.arc(c,c,R,0,6.2832);cx.fill();
cx.strokeStyle=h2(col,.7);cx.lineWidth=2*dpr;cx.stroke();
const ca=Math.cos(a),sa=Math.sin(a);cx.fillStyle=col;
for(let i=0;i<N;i++){const p=P[i],rr=p.rr*(1+amp*Math.sin(t*p.f*3+p.ph)*2.2+amp*.8);
const x1=p.x*ca+p.z*sa,z1=-p.x*sa+p.z*ca,y2=p.y*TC-z1*TS,z2=p.y*TS+z1*TC,sk=1+z2*.22,k=R*.88*rr*sk;
cx.globalAlpha=.2+.7*(z2+1)/2;const s=p.sz*dpr*sk;cx.fillRect(c+x1*k-s/2,c+y2*k-s/2,s,s)}
cx.globalAlpha=1;
cx.save();cx.font='bold '+Math.round(13*dpr)+'px ui-monospace,monospace';cx.textAlign='center';cx.textBaseline='middle';
try{cx.letterSpacing=(3*dpr)+'px'}catch(e){}
cx.shadowColor=col;cx.shadowBlur=14*dpr;cx.fillStyle='#eafffb';cx.fillText(LB[state]||'JARVIS',c,c);cx.restore()}
requestAnimationFrame(frame);
})();
(function(){
const $=i=>document.getElementById(i),t1=$('t1');
const h2=(h,a)=>{const n=parseInt(h.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'};
t1.innerHTML='<div id="stats" style="display:flex;gap:8px"></div><div id="gw" style="position:relative;height:54vh;margin:10px 0;border:1px solid #1d3550;background:radial-gradient(circle at 50% 50%,#0b2036,#050a14 75%);overflow:hidden"><canvas id="gc" style="width:100%;height:100%;display:block;touch-action:none"></canvas><div style="position:absolute;left:8px;bottom:6px;font-size:9px;letter-spacing:1px;color:#5b7a99">ARRASTRA · PELLIZCA = ZOOM · TOCA UN NODO · DOBLE TOQUE = CENTRAR</div><div style="position:absolute;right:8px;top:6px;font-size:9px;letter-spacing:2px;color:var(--a)">● EN VIVO</div></div><div id="gd" style="min-height:44px"></div><div id="lg"></div><div class="add"><input id="nf" placeholder="nuevo recuerdo..."><select id="nc"></select><button class="hb" onclick="addF()">+</button></div>';
$('nc').innerHTML=CATS.map(c=>'<option>'+c+'</option>').join('');
let nodes=[],edges=[],cur=[],V={k:1,ox:0,oy:0},selF=null,GW=0,GH=0,run=false,fit=true,lastTap=0,MR=100;
const gc=$('gc'),g=gc.getContext('2d');
function layout(){
nodes=[];edges=[];MR=60;
const act=CATS.filter(c=>facts.some(f=>f.c==c)),n=act.length;
nodes.push({t:'hub',x:0,y:0,c:cfg.theme,l:'J.A.R.V.I.S',ph:0});
act.forEach((c,k)=>{
const a=-Math.PI/2+2*Math.PI*k/n,R1=95+(n>5?10:0);
const tn={t:'theme',x:Math.cos(a)*R1,y:Math.sin(a)*R1,c:COL[c],l:c,ph:k*1.3};
nodes.push(tn);const ti=nodes.length-1;edges.push([0,ti]);
MR=Math.max(MR,R1+20);
const its=facts.map((f,i)=>({f:f,i:i})).filter(o=>o.f.c==c),m=its.length,R2=62+7*m;
its.forEach((o,j)=>{
const w=Math.min(2.6,.55*m),aa=m>1?a+(j/(m-1)-.5)*w:a,x=tn.x+Math.cos(aa)*R2,y=tn.y+Math.sin(aa)*R2;
nodes.push({t:'fact',x:x,y:y,c:COL[c],l:o.f.t,i:o.i,ph:j+k});edges.push([ti,nodes.length-1]);
MR=Math.max(MR,Math.hypot(x,y))})});
fit=true}
function info(){
const act=CATS.filter(c=>facts.some(f=>f.c==c));
const box=(n,l)=>'<div style="flex:1;border:1px solid #1d3550;padding:8px 4px;text-align:center;background:#ffffff06"><div style="font-size:20px;color:var(--a);text-shadow:0 0 10px var(--a)">'+n+'</div><div style="font-size:9px;letter-spacing:2px;color:#5b7a99;margin-top:2px">'+l+'</div></div>';
$('stats').innerHTML=box(facts.length,'NEURONAS')+box(edges.length,'SINAPSIS')+box(act.length,'TEMAS');
$('lg').innerHTML=CATS.map(c=>'<span style="display:inline-block;margin:6px 12px 0 0;font-size:11px"><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+COL[c]+';box-shadow:0 0 6px '+COL[c]+';margin-right:6px"></i>'+c+' '+facts.filter(f=>f.c==c).length+'</span>').join('');
const si=facts.indexOf(selF),f=si>=0?facts[si]:null;
$('gd').innerHTML=f?'<div style="border-left:3px solid '+COL[f.c]+';padding:8px 10px;background:#ffffff06;display:flex;gap:8px;align-items:center"><div style="flex:1;font-size:13px"><span style="font-size:9px;letter-spacing:2px;color:'+COL[f.c]+'">'+f.c.toUpperCase()+'</span><br>'+esc(f.t)+'</div><button class="hb" onclick="del('+si+')">BORRAR</button></div>':''}
function size(){const r=gc.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=Math.round(r.width),h=Math.round(r.height);
if(w&&(w!=GW||h!=GH)){GW=w;GH=h;gc.width=w*d;gc.height=h*d;g.setTransform(d,0,0,d,0,0);fit=true}}
const vis=()=>$('ps').classList.contains('open')&&t1.classList.contains('on');
const start=()=>{if(!run){run=true;requestAnimationFrame(draw)}};
function draw(ts){
if(!vis()){run=false;return}
requestAnimationFrame(draw);size();if(!GW)return;
if(fit){V.k=Math.max(.25,Math.min((GW/2-75)/MR,(GH/2-35)/MR));V.ox=GW/2;V.oy=GH/2;fit=false}
const t=ts/1000;g.clearRect(0,0,GW,GH);
cur=nodes.map(n=>{const h=n.t=='hub';return[(n.x+(h?0:Math.sin(t*.7+n.ph)*3))*V.k+V.ox,(n.y+(h?0:Math.cos(t*.6+n.ph*1.7)*3))*V.k+V.oy]});
g.lineWidth=1;
edges.forEach(e=>{const A=cur[e[0]],B=cur[e[1]],c=nodes[e[1]].c;
g.globalAlpha=.4;g.strokeStyle=c;g.beginPath();g.moveTo(A[0],A[1]);g.lineTo(B[0],B[1]);g.stroke();
const u=(t*.35+nodes[e[1]].ph*.37)%1;g.globalAlpha=.95;g.fillStyle=c;g.beginPath();g.arc(A[0]+(B[0]-A[0])*u,A[1]+(B[1]-A[1])*u,2,0,6.2832);g.fill()});
g.globalAlpha=1;
nodes.forEach((n,i)=>{const x=cur[i][0],y=cur[i][1];
if(n.t=='hub'){const c=cfg.theme,r=44+4*Math.sin(t*2),gr=g.createRadialGradient(x,y,0,x,y,r);
gr.addColorStop(0,h2(c,.9));gr.addColorStop(.3,h2(c,.4));gr.addColorStop(1,h2(c,0));
g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,6.2832);g.fill();
g.strokeStyle=c;g.globalAlpha=.5;g.beginPath();g.arc(x,y,14,0,6.2832);g.stroke();
g.globalAlpha=.9;g.beginPath();g.arc(x,y,20,t,t+2.2);g.stroke();g.globalAlpha=1;
g.fillStyle='#fff';g.beginPath();g.arc(x,y,5,0,6.2832);g.fill();
g.font='bold 10px ui-monospace,monospace';g.textAlign='center';g.fillStyle=c;g.fillText(n.l,x,y+36)}
else if(n.t=='theme'){g.beginPath();
for(let k=0;k<6;k++){const q=Math.PI/3*k-Math.PI/6;g.lineTo(x+Math.cos(q)*12,y+Math.sin(q)*12)}
g.closePath();g.fillStyle='#07121f';g.fill();g.strokeStyle=n.c;g.lineWidth=1.5;g.shadowColor=n.c;g.shadowBlur=10;g.stroke();g.shadowBlur=0;
g.fillStyle=n.c;g.beginPath();g.arc(x,y,3.5,0,6.2832);g.fill();
g.font='bold 9px ui-monospace,monospace';g.textAlign='center';g.fillText(n.l.toUpperCase(),x,y+26);g.lineWidth=1}
else{const s=facts[n.i]===selF;
g.beginPath();g.arc(x,y,6.5,0,6.2832);g.fillStyle='#07121f';g.fill();g.strokeStyle=n.c;g.lineWidth=1.5;g.stroke();
g.fillStyle=n.c;g.beginPath();g.arc(x,y,2.5,0,6.2832);g.fill();
if(s){g.strokeStyle='#fff';g.globalAlpha=.6+.4*Math.sin(t*5);g.beginPath();g.arc(x,y,11,0,6.2832);g.stroke();g.globalAlpha=1}
const L=x>cur[0][0];g.font='11px system-ui,sans-serif';g.fillStyle='#e6f1ff';g.textAlign=L?'left':'right';
g.fillText(n.l.length>22?n.l.slice(0,21)+'…':n.l,x+(L?12:-12),y+4);g.lineWidth=1}});
if(nodes.length==1){g.font='12px system-ui,sans-serif';g.fillStyle='#5b7a99';g.textAlign='center';g.fillText('Habla con Jarvis y tu red crecerá aquí',GW/2,GH/2+70)}}
function zoomAt(cx,cy,f){const r=gc.getBoundingClientRect(),mx=cx-r.left,my=cy-r.top,nk=Math.min(4,Math.max(.15,V.k*f));f=nk/V.k;V.ox=mx-(mx-V.ox)*f;V.oy=my-(my-V.oy)*f;V.k=nk}
function tapAt(cx,cy){const r=gc.getBoundingClientRect(),x=cx-r.left,y=cy-r.top,n=Date.now();
if(n-lastTap<320){fit=true;lastTap=0;return}lastTap=n;
let b=-1,bd=24;nodes.forEach((o,i)=>{if(o.t!='fact'||!cur[i])return;const d=Math.hypot(cur[i][0]-x,cur[i][1]-y);if(d<bd){bd=d;b=i}});
selF=b>=0?facts[nodes[b].i]:null;info()}
const PT=new Map();let moved=0,tdn=0,pd=0;
const pdist=()=>{const v=[...PT.values()];return v.length==2?Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1]):0};
gc.addEventListener('pointerdown',e=>{try{gc.setPointerCapture(e.pointerId)}catch(x){}PT.set(e.pointerId,[e.clientX,e.clientY]);moved=0;tdn=Date.now();pd=pdist()});
gc.addEventListener('pointermove',e=>{if(!PT.has(e.pointerId))return;const o=PT.get(e.pointerId),n=[e.clientX,e.clientY];PT.set(e.pointerId,n);
if(PT.size==1){V.ox+=n[0]-o[0];V.oy+=n[1]-o[1];moved+=Math.abs(n[0]-o[0])+Math.abs(n[1]-o[1])}
else if(PT.size==2){const d=pdist(),v=[...PT.values()];if(pd)zoomAt((v[0][0]+v[1][0])/2,(v[0][1]+v[1][1])/2,d/pd);pd=d;moved+=10}});
const up=e=>{const had=PT.delete(e.pointerId);pd=0;if(had&&!PT.size&&moved<8&&Date.now()-tdn<400&&e.type=='pointerup')tapAt(e.clientX,e.clientY)};
gc.addEventListener('pointerup',up);gc.addEventListener('pointercancel',up);
gc.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.clientX,e.clientY,e.deltaY<0?1.12:.89)},{passive:false});
document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>setTimeout(start,50)));
window.renderMem=function(){layout();info();start()};
window.renderMem();
})();
