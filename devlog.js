(function(){
var K='jdeverr',MAX=40;
function red(s){return String(s||'').replace(/(AIza[\w-]{20,}|sk-[\w-]{16,}|ghp_\w{20,}|github_pat_\w{20,}|xai-\w{16,}|AQ\.[\w-]{20,})/g,'***').slice(0,400)}
function base(u){return String(u||'').split('?')[0].split('/').pop()}
function log(o){try{
var l=JSON.parse(localStorage.getItem(K)||'[]');o.m=red(o.m);o.f=base(o.f);
var d=null;for(var i=0;i<l.length;i++){var x=l[i];if(x.m==o.m&&x.f==o.f&&x.l==o.l&&x.t==o.t){d=x;break}}
if(d){d.n=(d.n||1)+1;d.ts=Date.now()}else{o.ts=Date.now();o.n=1;l.push(o)}
while(l.length>MAX)l.shift();
localStorage.setItem(K,JSON.stringify(l))}catch(e){}}
window.addEventListener('error',function(e){
var t=e.target;
if(t&&t!==window&&(t.src||t.href)){log({t:'carga',m:'No cargó el recurso',f:t.src||t.href});return}
if(/ResizeObserver/.test(e.message||''))return;
log({t:'js',m:e.message||'Error',f:e.filename,l:e.lineno,c:e.colno})},true);
window.addEventListener('unhandledrejection',function(e){var r=e.reason,m=(r&&r.message)||String(r);
if(/Failed to fetch|NetworkError|Load failed|abort/i.test(m))return;log({t:'promesa',m:m,f:''})});
window.JDEVLOG={get:function(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch(e){return[]}},clear:function(){localStorage.removeItem(K)},log:log};
})();
