(function(){
if(!window.esErr)return;
const ENG=/high demand|API key|API_KEY|quota|exhausted|overloaded|Failed to fetch|NetworkError|aborted|AbortError|is not defined|is not a function|Cannot read|Cannot set|Unexpected|Uncaught|is no longer available|Permission denied|Internal error|Service Unavailable|Bad Request|try again later|Too many requests|Rate limit/i;
const oc=window.call;
window.call=function(b){return Promise.resolve(oc(b)).catch(e=>{throw new Error(esErr((e&&e.message)||String(e)))})};
const oadd=window.add;
window.add=function(w,t,ts,sv2){if(w=='j'&&ENG.test(String(t)))t=esErr(String(t));return oadd(w,t,ts,sv2)};
const osp=window.speak;
window.speak=function(t){t=String(t);return osp(ENG.test(t)?esErr(t):t)};
})();
