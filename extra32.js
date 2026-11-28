(function(){
const core=document.getElementById('core');
if(!core||document.getElementById('sc2'))return;
const old=document.getElementById('sc');
const cv=document.createElement('canvas');cv.id='sc2';cv.style.cssText='display:block';
if(old)old.replaceWith(cv);else core.prepend(cv);
const style=document.createElement('style');style.textContent='#sc2{display:block}';document.head.append(style);
const cx=cv.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2);
let W=0;
function rs(){const s=Math.round(Math.min(innerWidth*.94,innerHeight*.52,420));if(s!=W&&s>50){W=s;cv.style.width=s+'px';cv.style.height=s+'px';cv.width=s*dpr;cv.height=s*dpr}}
const h2=(h,a)=>{const n=parseInt(h.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'};
const LB={listening:'ESCUCHANDO',thinking:'PROCESANDO',speaking:'HABLANDO'};
const cl=()=>({listening:'#2fffa0',thinking:'#ffb02e',speaking:'#ff4fd8'}[window.state]||(window.cfg&&cfg.theme)||'#e8a33d');
let cr=232,cg=163,cb=61,a=0,amp=.03,spd=.2,glow=.55,lvl=0,tl=0,nl=0,last=0;
function frame(ts){
requestAnimationFrame(frame);if(document.hidden){last=ts/1000;return}rs();if(!W)return;
const t=ts/1000,dt=Math.min(.05,t-(last||t));last=t;
const st=window.state;
let ta=.03,tsp=.2,tg=.55;
if(st=='listening'){lvl=.4+.35*Math.sin(t*3.2);ta=.07+.08*lvl;tsp=.5;tg=.9}
else if(st=='thinking'){ta=.045;tsp=1.9;tg=.85;lvl=.5}
else if(st=='speaking'){if(ts>nl){tl=.25+Math.random()*.75;nl=ts+80+Math.random()*140}lvl+=(tl-lvl)*.25;ta=.05+.18*lvl;tsp=.7;tg=.75+.25*lvl}
else lvl*=.95;
amp+=(ta-amp)*.1;spd+=(tsp-spd)*.05;glow+=(tg-glow)*.08;a+=dt*spd;
const col=cl(),tc=parseInt(col.slice(1),16);
cr+=((tc>>16)-cr)*.08;cg+=(((tc>>8)&255)-cg)*.08;cb+=((tc&255)-cb)*.08;
const C='rgb('+(cr|0)+','+(cg|0)+','+(cb|0)+')';
const S=cv.width,c=S/2,R=S*.32;
cx.clearRect(0,0,S,S);
const gr=R*(1.7+amp*1.2),g=cx.createRadialGradient(c,c,R*.55,c,c,gr);
g.addColorStop(0,h2(C,Math.min(1,.5*glow)));g.addColorStop(.55,h2(C,.22*glow));g.addColorStop(1,h2(C,0));
cx.fillStyle=g;cx.beginPath();cx.arc(c,c,gr,0,6.2832);cx.fill();
cx.save();cx.translate(c,c);
function ring(rad,w,n,rot,dash,op){
cx.save();cx.rotate(rot);
cx.strokeStyle=h2(C,op*glow);cx.lineWidth=w*dpr;
if(dash)cx.setLineDash(dash.map(x=>x*dpr));
cx.beginPath();cx.arc(0,0,rad,0,6.2832);cx.stroke();
cx.setLineDash([]);
for(let i=0;i<n;i++){const ang=i/n*6.2832,l=w*2.4*dpr;
cx.beginPath();cx.moveTo(Math.cos(ang)*(rad-l),Math.sin(ang)*(rad-l));cx.lineTo(Math.cos(ang)*(rad+l),Math.sin(ang)*(rad+l));cx.stroke()}
cx.restore()}
ring(R*.98,1,36,a*.22,[1,3],.28);
ring(R*.8,1.4,24,-a*.4,null,.5);
ring(R*.6,1.1,48,a*.65,[3,5],.38);
ring(R*.42,1.8,12,-a*.9,null,.65);
cx.save();cx.rotate(a*1.3);
for(let i=0;i<8;i++){const ang=i/8*6.2832,inner=R*.22,outer=R*(.34+.03*Math.sin(t*2+i));
const grd=cx.createLinearGradient(Math.cos(ang)*inner,Math.sin(ang)*inner,Math.cos(ang)*outer,Math.sin(ang)*outer);
grd.addColorStop(0,h2(C,.05));grd.addColorStop(1,h2(C,.75*glow));
cx.strokeStyle=grd;cx.lineWidth=2*dpr;cx.beginPath();
cx.moveTo(Math.cos(ang)*inner,Math.sin(ang)*inner);cx.lineTo(Math.cos(ang)*outer,Math.sin(ang)*outer);cx.stroke()}
cx.restore();
const pr=R*.17*(1+amp*2.2+.06*Math.sin(t*4));
const ng=cx.createRadialGradient(0,0,0,0,0,pr);
ng.addColorStop(0,'rgba(255,255,255,.95)');ng.addColorStop(.4,h2(C,.95));ng.addColorStop(1,h2(C,0));
cx.fillStyle=ng;cx.beginPath();cx.arc(0,0,pr,0,6.2832);cx.fill();
cx.restore();
cx.font='bold '+Math.round(12.5*dpr)+'px ui-monospace,monospace';cx.textAlign='center';cx.textBaseline='middle';
try{cx.letterSpacing=(3*dpr)+'px'}catch(e){}
cx.shadowColor=C;cx.shadowBlur=14*dpr;cx.fillStyle='#fff8ea';
cx.fillText(LB[st]||'JARVIS',c,c+R*.62)}
requestAnimationFrame(frame)})();
