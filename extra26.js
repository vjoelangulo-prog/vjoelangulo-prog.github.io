(function(){
const $=i=>document.getElementById(i);
if(cfg.speed===undefined)cfg.speed='1';
window.JLAT=0;
const NOTHINK=new Set(),pf=window.fetch.bind(window);
window.fetch=function(u,o){
try{
if(typeof u==='string'&&o&&typeof o.body==='string'&&/generativelanguage\.googleapis\.com\/[^?]*:generateContent/.test(u)&&!/tts/i.test(u)){
const mm=/models\/([^:?]+):/.exec(u),model=mm?mm[1]:'';
const body=JSON.parse(o.body),g=body.generationConfig=body.generationConfig||{};
const hard=(g.maxOutputTokens||0)>=700;
if(!g.thinkingConfig&&!NOTHINK.has(model))g.thinkingConfig={thinkingLevel:(cfg.speed=='2'||(g.maxOutputTokens||0)>=2000)?'medium':'low'};
const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),hard?24000:9000),t0=Date.now();
const go=b=>pf(new URL(u),Object.assign({},o,{body:JSON.stringify(b),signal:ctl.signal}));
return go(body).then(async r=>{
if(r.status==400&&g.thinkingConfig){let tx='';try{tx=await r.clone().text()}catch(e){}
if(/think/i.test(tx)){NOTHINK.add(model);delete g.thinkingConfig;return go(body)}}
return r}).then(r=>{window.JLAT=Date.now()-t0;const e=$('spdinfo');if(e)e.textContent='Última consulta a Gemini: '+(window.JLAT/1000).toFixed(1)+' s';return r}).finally(()=>clearTimeout(tm))}
}catch(e){}
return pf(u,o)};
const oc=window.call;
window.call=function(b){
try{const g=b&&b.generationConfig;
if(cfg.speed=='0'&&b&&b.systemInstruction&&!(g&&g.responseMimeType)&&((g&&g.maxOutputTokens)||0)<700){
b=Object.assign({},b);const s=JSON.parse(JSON.stringify(b.systemInstruction));
s.parts[0].text+=' Responde en UNA sola frase corta y directa, sin rodeos.';b.systemInstruction=s;
b.generationConfig=Object.assign({},g,{maxOutputTokens:180})}}catch(e){}
return oc(b)};
function ui(){const t3=$('t3');if(!t3||$('spd'))return;
const IN='width:100%;background:#0a1626;border:1px solid #1d3550;color:#cfe8ff;padding:10px;font:13px ui-monospace,monospace';
const bx=document.createElement('div');bx.className='row';
bx.innerHTML='<label>VELOCIDAD DE RESPUESTA</label><select id="spd" style="'+IN+'"><option value="0">Rápida: una frase y voz del celular</option><option value="1">Equilibrada: voz natural</option><option value="2">Pensativa: razona más, tarda más</option></select><div id="spdinfo" style="font-size:11px;color:#5b7a99;margin-top:8px;line-height:1.5">Aún no hay consultas.</div>';
t3.insertBefore(bx,t3.firstChild);
$('spd').value=cfg.speed;
$('spd').onchange=()=>{cfg.speed=$('spd').value;
if(cfg.speed=='0'){cfg.vmode='phone';cfg.len='1'}else if(cfg.speed=='1'&&cfg.vmode=='phone'){cfg.vmode='gemini'}
sv();const v=$('vm');if(v)v.value=cfg.vmode;const l=$('ln');if(l)l.value=cfg.len}}
ui();
})();
