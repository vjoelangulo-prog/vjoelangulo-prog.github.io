(function(){
const core=document.getElementById('core');
const old2=document.getElementById('sc2');
if(!core)return;
if(old2)old2.remove();
const old=document.getElementById('sc');
const cv=document.createElement('canvas');cv.id='sc2';cv.style.cssText='display:block';
if(old)old.replaceWith(cv);else core.prepend(cv);
const style=document.createElement('style');style.textContent='#sc2{display:block}';document.head.append(style);
const cx=cv.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2);
let W=0;
function rs(){const s=Math.round(Math.min(innerWidth*.94,innerHeight*.52,420));if(s!=W&&s>50){W=s;cv.style.width=s+'px';cv.style.height=s+'px';cv.width=s*dpr;cv.height=s*dpr;buildNodes()}}
const h2=(h,a)=>{const n=parseInt(h.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'};
const LB={listening:'ESCUCHANDO',thinking:'PROCESANDO',speaking:'HABLANDO'};
const cl=()=>({listening:'#2fffa0',thinking:'#ffb02e',speaking:'#ff4fd8'}[window.state]||(window.cfg&&cfg.theme)||'#e8a33d');
let cr=232,cg=163,cb=61,a=0,amp=.03,spd=.2,glow=.55,lvl=0,tl=0,nl=0,last=0;
let NODES=[],LINKS=[],ARCS=[],TICKS=[];
function rnd(s){return Math.random()*2-1}
function buildNodes(){
NODES=[];LINKS=[];ARCS=[];TICKS=[];
const N=90;
for(let i=0;i<N;i++){
const rr=.2+Math.random()*.78,ang=Math.random()*6.2832;
NODES.push({r:rr,a0:ang,sp:(Math.random()<.5?-1:1)*(.08+Math.random()*.5),ph:Math.random()*6.283,sz:.4+Math.random()*1.6})}
for(let i=0;i<N;i++){
const a=NODES[i];let best=-1,bd=1e9;
for(let j=0;j<N;j++){if(i==j)continue;const b=NODES[j];
const dx=(a.r*Math.cos(a.a0)-b.r*Math.cos(b.a0)),dy=(a.r*Math.sin(a.a0)-b.r*Math.sin(b.a0));
const d=dx*dx+dy*dy;if(d<bd&&d>.0005){bd=d;best=j}}
if(best>=0&&Math.random()<.65)LINKS.push([i,best])}
const NA=28;
for(let i=0;i<NA;i++){
ARCS.push({r:.3+Math.random()*.65,a0:Math.random()*6.2832,span:(.3+Math.random()*1.6)*(Math.random()<.5?-1:1),sp:(Math.random()<.5?-1:1)*(.04+Math.random()*.3),w:.6+Math.random()*1.3,op:.15+Math.random()*.4})}
const NT=90;
for(let i=0;i<NT;i++){const rr=.82+Math.random()*.16;
TICKS.push({ang:i/NT*6.2832+rnd()*.02,len:.015+Math.random()*.035,r:rr})}
}
function frame(ts){
requestAnimationFrame(frame);if(document.hidden){last=ts/1000;return}rs();if(!W)return;
const t=ts/1000,dt=Math.min(.05,t-(last||t));last=t;
const st=window.state;
let ta=.03,tsp=.18,tg=.55;
if(st=='listening'){lvl=.4+.35*Math.sin(t*3.2);ta=.08+.1*lvl;tsp=.42;tg=.95}
else if(st=='thinking'){ta=.05;tsp=1.6;tg=.9;lvl=.5}
else if(st=='speaking'){if(ts>nl){tl=.25+Math.random()*.75;nl=ts+80+Math.random()*140}lvl+=(tl-lvl)*.25;ta=.06+.2*lvl;tsp=.6;tg=.8+.2*lvl}
else lvl*=.95;
amp+=(ta-amp)*.1;spd+=(tsp-spd)*.05;glow+=(tg-glow)*.08;a+=dt*spd;
const col=cl(),tc=parseInt(col.slice(1),16);
cr+=((tc>>16)-cr)*.08;cg+=(((tc>>8)&255)-cg)*.08;cb+=((tc&255)-cb)*.08;
const C='rgb('+(cr|0)+','+(cg|0)+','+(cb|0)+')';
const S=cv.width,c=S/2,R=S*.33;
cx.clearRect(0,0,S,S);
const gr=R*(1.65+amp*1.3),g=cx.createRadialGradient(c,c,R*.5,c,c,gr);
g.addColorStop(0,h2(C,Math.min(1,.48*glow)));g.addColorStop(.55,h2(C,.2*glow));g.addColorStop(1,h2(C,0));
cx.fillStyle=g;cx.beginPath();cx.arc(c,c,gr,0,6.2832);cx.fill();
cx.save();cx.translate(c,c);
cx.save();cx.rotate(a*.06);
cx.strokeStyle=h2(C,.22*glow);cx.lineWidth=1*dpr;
TICKS.forEach(tk=>{const rr=R*tk.r,l=R*tk.len,x1=Math.cos(tk.ang)*rr,y1=Math.sin(tk.ang)*rr,x2=Math.cos(tk.ang)*(rr+l),y2=Math.sin(tk.ang)*(rr+l);
cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(x2,y2);cx.stroke()});
cx.beginPath();cx.arc(0,0,R*.96,0,6.2832);cx.stroke();
cx.restore();
ARCS.forEach(ar=>{cx.save();const rot=a*ar.sp;cx.rotate(rot);
cx.strokeStyle=h2(C,ar.op*glow);cx.lineWidth=ar.w*dpr;
cx.beginPath();cx.arc(0,0,R*ar.r,ar.a0,ar.a0+ar.span);cx.stroke();cx.restore()});
const pos=i=>{const n=NODES[i],ang=n.a0+a*n.sp,rr=R*n.r*(1+amp*.3*Math.sin(t*1.5+n.ph));return[Math.cos(ang)*rr,Math.sin(ang)*rr]};
cx.lineWidth=.6*dpr;
LINKS.forEach(([i,j])=>{const[x1,y1]=pos(i),[x2,y2]=pos(j);
const d=Math.hypot(x2-x1,y2-y1);if(d>R*.55)return;
cx.strokeStyle=h2(C,(.1+.18*(1-d/(R*.55)))*glow);
cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(x2,y2);cx.stroke()});
NODES.forEach((n,i)=>{const[x,y]=pos(i),fl=.5+.5*Math.sin(t*n.sp*3+n.ph*2);
cx.fillStyle=h2(C,(.35+.5*fl)*glow);
const s=n.sz*dpr*(1+amp*2);
cx.beginPath();cx.arc(x,y,s,0,6.2832);cx.fill()});
cx.restore();
const pr=R*.16*(1+amp*2.4+.05*Math.sin(t*4.2));
const ng=cx.createRadialGradient(c,c,0,c,c,pr);
ng.addColorStop(0,'rgba(255,255,255,.95)');ng.addColorStop(.4,h2(C,.95));ng.addColorStop(1,h2(C,0));
cx.fillStyle=ng;cx.beginPath();cx.arc(c,c,pr,0,6.2832);cx.fill();
cx.font='bold '+Math.round(12.5*dpr)+'px ui-monospace,monospace';cx.textAlign='center';cx.textBaseline='middle';
try{cx.letterSpacing=(3*dpr)+'px'}catch(e){}
cx.shadowColor=C;cx.shadowBlur=14*dpr;cx.fillStyle='#fff8ea';
cx.fillText(LB[st]||'JARVIS',c,c+R*.6)}
buildNodes();
requestAnimationFrame(frame)})();
