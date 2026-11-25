(function(){try{
var D=['jkey','jkeys','jkeyi','jcfg','jfacts','jhist','jlog','jcol','jtasks','jsec','jpass','jsynced','jsynchash','jlastbk','jbkn'];
var p=localStorage.getItem('jpend');if(!p)return;
localStorage.removeItem('jpend');
var o=JSON.parse(p),from=o.from||'',to=o.to||'',cur={},any=false;
D.forEach(function(k){var v=localStorage.getItem(k);if(v!==null){cur[k]=v;any=true}});
if(o.drop&&from){localStorage.removeItem('jprof_'+from);localStorage.removeItem('jnat_'+from)}
else if(from&&any)localStorage.setItem('jprof_'+from,JSON.stringify(cur));
else if(!from&&any&&to&&localStorage.getItem('jprof_'+to))localStorage.setItem('jprof_guest',JSON.stringify(cur));
D.forEach(function(k){localStorage.removeItem(k)});
if(to){var t=localStorage.getItem('jprof_'+to);if(t){var d=JSON.parse(t);D.forEach(function(k){if(typeof d[k]=='string')localStorage.setItem(k,d[k])});localStorage.setItem('jrestorenat',to)}}
localStorage.setItem('jactive',to);
try{indexedDB.deleteDatabase('jarvis-bk')}catch(e){}
}catch(e){}})();
