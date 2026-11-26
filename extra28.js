(function(){
const $=i=>document.getElementById(i);
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.style.cssText=c;if(x!=null)e.textContent=x;return e};
const STRONG='gemini-3.8-flash',A=()=>cfg.addr||'señor';
const say=t=>{add('j',t);speak(t)};
if(cfg.mlevel===undefined)cfg.mlevel='auto';
if(cfg.mcode===undefined)cfg.mcode='1';
if(cfg.course===undefined)cfg.course=null;
let KT=null,KL=null;
function loadK(){if(KT)return Promise.resolve(KT);if(KL)return KL;
KL=new Promise(ok=>{const l=document.createElement('link');l.rel='stylesheet';l.href='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';document.head.append(l);
const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';s.onload=()=>{KT=window.katex||null;ok(KT)};s.onerror=()=>{KL=null;ok(null)};document.head.append(s)});return KL}
const sty=document.createElement('style');sty.textContent='.bub .katex-display{overflow-x:auto;overflow-y:hidden;margin:.6em 0;padding:2px 0}.bub .katex{font-size:1.05em}';document.head.append(sty);
const MRX=/\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$(?!\s)([^$\n]+?)(?<!\s)\$|\*\*([^*\n]+?)\*\*/g;
const HASM=/\$|\\\(|\\\[|\*\*/;
function renderInto(el,text){el.textContent='';let i=0,m;MRX.lastIndex=0;
while((m=MRX.exec(text))){if(m.index>i)el.append(document.createTextNode(text.slice(i,m.index)));
if(m[5]!==undefined){const b=document.createElement('b');b.textContent=m[5];el.append(b)}
else{const tex=m[1]||m[2]||m[3]||m[4],disp=m[1]!==undefined||m[2]!==undefined,sp=document.createElement(disp?'div':'span');
if(KT){try{KT.render(tex,sp,{displayMode:disp,throwOnError:false})}catch(e){sp.textContent=m[0]}}else sp.textContent=m[0];el.append(sp)}
i=m.index+m[0].length}
if(i<text.length)el.append(document.createTextNode(text.slice(i)))}
const oadd=window.add;
window.add=function(w,t,ts,sv2){const r=oadd(w,t,ts,sv2);
try{if(w=='j'&&HASM.test(String(t))){const bs=document.querySelectorAll('#log .msg.j .bub:not(.ty)'),el=bs[bs.length-1];
if(el){renderInto(el,String(t));if(!KT&&/\$|\\\(|\\\[/.test(String(t)))loadK().then(k=>{if(k)renderInto(el,String(t))})}}}catch(e){}
return r};
setTimeout(()=>{const l=[...document.querySelectorAll('#log .msg.j .bub:not(.ty)')].filter(e=>HASM.test(e.textContent));
if(l.length)loadK().then(()=>l.forEach(e=>renderInto(e,e.textContent)))},800);
const M={'\\cdot':' por ','\\times':' por ','\\div':' entre ','\\pm':' más menos ','\\leq':' menor o igual que ','\\le':' menor o igual que ','\\geq':' mayor o igual que ','\\ge':' mayor o igual que ','\\neq':' distinto de ','\\approx':' aproximadamente ','\\infty':' infinito ','\\pi':' pi ','\\theta':' theta ','\\alpha':' alfa ','\\beta':' beta ','\\lambda':' lambda ','\\mu':' mu ','\\sigma':' sigma ','\\tau':' tau ','\\Delta':' delta ','\\delta':' delta ','\\omega':' omega ','\\phi':' fi ','\\varphi':' fi ','\\int':' integral de ','\\sum':' suma de ','\\prod':' producto de ','\\lim':' límite de ','\\to':' tiende a ','\\rightarrow':' tiende a ','\\sin':' seno de ','\\cos':' coseno de ','\\tan':' tangente de ','\\ln':' logaritmo natural de ','\\log':' logaritmo de ','\\in':' pertenece a ','\\forall':' para todo ','\\exists':' existe ','\\partial':' derivada parcial de ','\\nabla':' nabla ','\\cdots':' puntos suspensivos ','\\ldots':' puntos suspensivos ','\\left':' ','\\right':' '};
function tex2s(s){let t=' '+s+' ';
for(let i=0;i<4;i++)t=t.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g,' $1 sobre $2 ');
t=t.replace(/\\sqrt\[(\d+)\]\{([^{}]*)\}/g,' raíz $1 de $2 ').replace(/\\sqrt\{([^{}]*)\}/g,' raíz cuadrada de $1 ');
t=t.replace(/\^\{?2\}?(?![\w{])/g,' al cuadrado ').replace(/\^\{?3\}?(?![\w{])/g,' al cubo ').replace(/\^\{([^{}]*)\}/g,' a la $1 ').replace(/\^(\w)/g,' a la $1 ');
t=t.replace(/_\{([^{}]*)\}/g,' sub $1 ').replace(/_(\w)/g,' sub $1 ');
Object.keys(M).forEach(k=>{t=t.replace(new RegExp(k.replace(/\\/g,'\\\\')+'(?![a-zA-Z])','g'),M[k])});
t=t.replace(/\\[a-zA-Z]+/g,' ').replace(/[{}\\]/g,' ').replace(/=/g,' igual a ').replace(/\+/g,' más ').replace(/(\w)\s*-\s*(\w)/g,'$1 menos $2').replace(/\*/g,' por ');
return t.replace(/\s+/g,' ').trim()}
function spoken(t){if(!HASM.test(t))return t;let cut=false;
t=t.replace(/\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]/g,()=>{cut=true;return ' '});
t=t.replace(/\\\(([\s\S]+?)\\\)|\$(?!\s)([^$\n]+?)(?<!\s)\$/g,(m,a,b)=>' '+tex2s(a||b)+' ');
t=t.replace(/\*\*/g,'').replace(/\s+/g,' ').trim();
return cut?t+' Las fórmulas están en pantalla.':t}
const osp=window.speak;
window.speak=function(t){return osp(spoken(String(t)))};
const gcd=(a,b)=>{a=a<0n?-a:a;b=b<0n?-b:b;while(b){const t=a%b;a=b;b=t}return a};
function Q(n,d){if(d===undefined)d=1n;if(d<0n){n=-n;d=-d}const g=gcd(n,d)||1n;return{n:n/g,d:d/g}}
function qparse(s){const m=/^(\d+)(?:\.(\d+))?$/.exec(s);if(!m)return null;const f=m[2]||'';return Q(BigInt(m[1]+f),10n**BigInt(f.length))}
function calc(src){
const toks=src.match(/\d+(?:\.\d+)?|[+\-*\/^()]/g);
if(!toks||toks.join('').length!==src.length)return null;
let p=0;const bad=new Error('calc');
const peek=()=>toks[p];
function expr(){let v=term();while(peek()=='+'||peek()=='-'){const o=toks[p++],r=term();v=o=='+'?Q(v.n*r.d+r.n*v.d,v.d*r.d):Q(v.n*r.d-r.n*v.d,v.d*r.d)}return v}
function term(){let v=unary();while(peek()=='*'||peek()=='/'){const o=toks[p++],r=unary();if(o=='*')v=Q(v.n*r.n,v.d*r.d);else{if(r.n===0n)throw new Error('div0');v=Q(v.n*r.d,v.d*r.n)}}return v}
function unary(){if(peek()=='-'){p++;const v=unary();return Q(-v.n,v.d)}if(peek()=='+'){p++;return unary()}return pw()}
function pw(){const b=prim();if(peek()=='^'){p++;const e=unary();if(e.d!==1n||e.n>1000n||e.n<-1000n)throw bad;const k=e.n<0n?-e.n:e.n;let r=Q(b.n**k,b.d**k);if(e.n<0n){if(r.n===0n)throw new Error('div0');r=Q(r.d,r.n)}return r}return b}
function prim(){const t=toks[p++];if(t===undefined)throw bad;if(t=='('){const v=expr();if(toks[p++]!=')')throw bad;return v}const q=qparse(t);if(!q)throw bad;return q}
const v=expr();if(p!==toks.length)throw bad;return v}
function fmtQ(v){const neg=v.n<0n,n=neg?-v.n:v.n,ip=n/v.d,sg=neg?'menos ':'';
if(v.d===1n){let s=ip.toString();if(s.length>40)s=s.slice(0,12)+'… ('+s.length+' dígitos)';return sg+s}
let rem=n%v.d,dec='';for(let i=0;i<8&&rem!==0n;i++){rem*=10n;dec+=(rem/v.d).toString();rem%=v.d}
const d=sg+ip.toString()+(dec?','+dec:'');
return rem!==0n?sg+n.toString()+'/'+v.d.toString()+', que es aproximadamente '+d:d}
const CUEC=/^(?:jarvis[,\s]+)?(?:por favor[,\s]+)?(?:cu[aá]nto (?:es|da|son|vale)|calcula|calc[uú]lame|resuelve|dime cu[aá]nto es|cu[aá]l es el resultado de)\s+/i;
function localCalc(t){
let s=t.trim().replace(/[¿?]+$/,'').replace(/=+\s*$/,'');
const eq=/[=?]\s*$/.test(t.trim()),cue=CUEC.test(s);
if(!cue&&!eq)return null;
s=s.replace(CUEC,'');
let m=/^(\d+(?:[.,]\d+)?)\s*(?:%|por ciento)\s*de\s*(\d+(?:[.,]\d+)?)$/i.exec(s);
if(m){const a=qparse(m[1].replace(',','.')),b=qparse(m[2].replace(',','.'));if(a&&b)return fmtQ(Q(a.n*b.n,a.d*b.d*100n))}
m=/^ra[ií]z(?: cuadrada)? de (\d+)$/i.exec(s);
if(m){const n=Number(m[1]);if(!Number.isSafeInteger(n))return null;const r=Math.sqrt(n);return Number.isInteger(r)?String(r):'aproximadamente '+String(+r.toFixed(8)).replace('.',',')}
s=s.toLowerCase().replace(/(\d)\s*,\s*(\d)/g,'$1.$2').replace(/\bal cuadrado\b/g,'^2').replace(/\bal cubo\b/g,'^3').replace(/\belevado a(?:l| la)?\b/g,'^').replace(/\bdividido (?:entre|por|para)\b/g,'/').replace(/\bentre\b/g,'/').replace(/\bpor\b/g,'*').replace(/\bm[aá]s\b/g,'+').replace(/\bmenos\b/g,'-').replace(/[×x·]/g,'*').replace(/÷/g,'/');
if(/\d\s+\d/.test(s))return null;
if(!cue&&/\d{1,2}\s*[\/.-]\s*\d{1,2}\s*[\/.-]\s*\d{2,4}/.test(s))return null;
s=s.replace(/\s+/g,'');
if(!/^[0-9+\-*\/^().]+$/.test(s)||!/[+\-*\/^]/.test(s))return null;
try{return fmtQ(calc(s))}catch(e){return e.message=='div0'?'DIV0':null}}
const MATH=/(\d\s*[+*^×÷=]\s*[\dxyz(]|\d\s[-\/]\s\d|\b[xyz]\s*[\^=]|ecuaci[oó]n|derivad|integral|calcul\w* (el )?l[ií]mite|matriz|matrices|vector|determinante|polinomio|factoriza|simplifica|despeja|pit[aá]goras|trigonometr|\bseno\b|coseno|tangente|logaritm|probabilidad|estad[ií]stic|desviaci[oó]n|mediana|geometr[ií]a|[aá]rea de|per[ií]metro|fracci[oó]n|fracciones|porcentaje|exponente|ra[ií]z cuadrada|n[uú]mero primo|divisib|combinatoria|permutaci|sucesi[oó]n|converge|teorema|demuestra|demostraci[oó]n|\b[aá]lgebra\b|\bc[aá]lculo\b|matem[aá]tic|aritm[eé]tica|topolog|an[aá]lisis (real|complejo)|n[uú]meros complejos|series de|taylor|fourier|laplace|autovalor|espacio vectorial|teor[ií]a de n[uú]meros)/i;
const TOPIC=/(matem|[aá]lgebra|c[aá]lculo|geometr|trigonom|estad[ií]stic|probabilidad|aritm[eé]tic|fraccion|ecuacion|derivad|integral|l[ií]mite|matric|vector|l[oó]gica|conjuntos|n[uú]meros|combinatoria|diferenciales|topolog|an[aá]lisis|discret|grafos|teor[ií]a de|series|sucesiones)/i;
const LVT={auto:'Nivel del usuario: desconocido; empieza simple y ajusta según cómo responde.',primaria:'Nivel del usuario: primaria; usa lenguaje muy sencillo, ejemplos cotidianos y números pequeños.',secundaria:'Nivel del usuario: secundaria; usa ejemplos concretos y formaliza poco a poco.',preparatoria:'Nivel del usuario: preparatoria o bachillerato; equilibra intuición y rigor.',universidad:'Nivel del usuario: universidad; usa notación formal y justifica con rigor.',posgrado:'Nivel del usuario: posgrado; puedes usar notación y teoría avanzada, con demostraciones cuando ayuden.'};
const SYS=' MODO MAESTRO DE MATEMÁTICAS. Eres un profesor paciente y riguroso: dominas desde la aritmética básica hasta matemáticas universitarias y de posgrado (álgebra, geometría, trigonometría, cálculo, álgebra lineal, ecuaciones diferenciales, probabilidad y estadística, matemática discreta, teoría de números, análisis real y complejo, topología y más). IGNORA el límite de frases. Estructura tu respuesta así: una frase corta con la respuesta o la idea principal, que se leerá en voz alta; luego el desarrollo paso a paso, numerado y justificando cada paso; luego la comprobación del resultado; y al final una pregunta o un ejercicio breve para practicar. Escribe las fórmulas en LaTeX: $...$ en línea y $$...$$ para ecuaciones destacadas. Haz las cuentas con cuidado y verifica cada operación; si usas tu herramienta de código para calcular, confía en su resultado. No inventes teoremas, fórmulas ni resultados: si algo es un problema abierto, depende de hipótesis o no estás seguro, dilo con claridad. Si el usuario solo quiere la respuesta, dásela, pero ofrece explicarla.';
const courseText=()=>cfg.course?' MODO CURSO. Tema: '+cfg.course.topic+'. Lección actual: '+cfg.course.n+'. Enseña esta lección con: (1) la idea central con un ejemplo cotidiano; (2) la regla o definición; (3) un ejemplo resuelto paso a paso; (4) un ejercicio corto para que lo intente, sin dar la respuesta. Si el usuario responde un ejercicio, corrígelo con amabilidad: di si está bien, señala el error exacto y explica por qué. Al final pregunta si quiere continuar con la siguiente lección.':'';
const oc=window.call;
window.call=function(b){
const Mt=window.__mth;
if(!Mt||!b||!b.systemInstruction||!Array.isArray(b.contents)||(b.generationConfig&&b.generationConfig.responseMimeType))return oc(b);
b=Object.assign({},b);
const s=JSON.parse(JSON.stringify(b.systemInstruction));
s.parts[0].text+=SYS+' '+(LVT[cfg.mlevel]||LVT.auto)+(Mt.course?courseText():'');
b.systemInstruction=s;
const g=Object.assign({},b.generationConfig||{});g.maxOutputTokens=Math.max(g.maxOutputTokens||0,2200);b.generationConfig=g;
if(cfg.mcode!=='0')b.tools=(b.tools||[]).concat([{code_execution:{}}]);
const pm=cfg.model;cfg.model=STRONG;
try{return oc(b)}finally{cfg.model=pm}};
const lvKey=w=>{w=w.toLowerCase().replace('í','i');return /maestr|doctor|posgrado/.test(w)?'posgrado':/bachill|prepa/.test(w)?'preparatoria':w};
const prev=window.send;
window.send=async function(t){
t=(t||'').trim();if(!t)return prev(t);
const r=localCalc(t);
if(r!==null){add('u',t);say(r=='DIV0'?'No se puede dividir entre cero, '+A()+'.':'El resultado es '+r+', '+A()+'.');return}
const hasC=!!cfg.course;
const lv=/(?:mi nivel es|estoy en|soy de|estudio en|cursando)\s+(primaria|secundaria|preparatoria|bachillerato|universidad|posgrado|maestr[ií]a|doctorado)/i.exec(t);
if(lv&&(hasC||/matem|[aá]lgebra|c[aá]lculo|n[uú]meros/i.test(t))){cfg.mlevel=lvKey(lv[1]);sv();const sl=$('mlv');if(sl)sl.value=cfg.mlevel;add('u',t);say('Anotado, '+A()+'. Te enseñaré matemáticas a nivel '+cfg.mlevel+'.');return}
if(hasC&&/^(?:jarvis[,\s]+)?(?:termina|terminemos|cancela|deja|salgamos de)\w*\s+(?:el|este|del)\s+curso/i.test(t)){const n=cfg.course.n;cfg.course=null;sv();add('u',t);say('Curso terminado, '+A()+'. Llegamos hasta la lección '+n+'.');return}
const st=/^(?:jarvis[,\s]+)?(?:por favor[,\s]+)?(?:ens[eé]ñame|quiero aprender|quiero estudiar|dame un curso de|empecemos (?:un )?curso de|vamos a aprender)\s+(.{3,})$/i.exec(t);
let on=false;
if(st&&TOPIC.test(st[1])){cfg.course={topic:st[1].replace(/[.!?]+$/,'').trim(),n:1};sv();on=true}
else if(hasC&&/^(?:jarvis[,\s]+)?(?:siguiente|sigue|contin[uú]a|adelante|pasemos a la siguiente|otra lecci[oó]n|siguiente lecci[oó]n)\s*[.!]?$/i.test(t)){cfg.course.n++;sv();on=true}
else if(hasC||MATH.test(t))on=true;
if(!on)return prev(t);
window.__mth={course:!!cfg.course};
try{return await prev(t)}finally{window.__mth=null}};
const t3=$('t3');
if(t3&&!$('mlv')){const IN='width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:10px;font:13px ui-monospace,monospace';
const bx=document.createElement('div');bx.className='row';
bx.innerHTML='<label>MAESTRO DE MATEMÁTICAS · NIVEL</label><select id="mlv" style="'+IN+'"><option value="auto">Automático</option><option value="primaria">Primaria</option><option value="secundaria">Secundaria</option><option value="preparatoria">Preparatoria / bachillerato</option><option value="universidad">Universidad</option><option value="posgrado">Posgrado</option></select><label style="margin-top:12px">CALCULADORA DE PYTHON PARA CUENTAS DIFÍCILES</label><select id="mcd" style="'+IN+'"><option value="1">Activada: más exacta, a veces más lenta</option><option value="0">Apagada: más rápida</option></select><div id="mcs" style="font-size:12px;margin-top:10px;color:#5b7a99;line-height:1.5"></div><button class="hb" id="mce" style="margin-top:8px">TERMINAR CURSO</button>';
t3.insertBefore(bx,t3.children[1]||null);
$('mlv').value=cfg.mlevel;$('mcd').value=cfg.mcode;
$('mlv').onchange=()=>{cfg.mlevel=$('mlv').value;sv()};
$('mcd').onchange=()=>{cfg.mcode=$('mcd').value;sv()};
$('mce').onclick=()=>{cfg.course=null;sv();stat()};
function stat(){const e=$('mcs'),b=$('mce');if(!e)return;e.textContent=cfg.course?'Curso activo: '+cfg.course.topic+' · lección '+cfg.course.n:'Sin curso activo. Di: «Jarvis, enséñame álgebra desde cero».';b.style.display=cfg.course?'inline-block':'none'}
stat();setInterval(stat,2000)}
})();
