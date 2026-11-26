(function(){
var noop=function(){};
if(!window.SpeechSynthesisUtterance){window.SpeechSynthesisUtterance=function(t){this.text=t||'';this.lang='';this.voice=null;this.rate=1;this.pitch=1;this.volume=1;this.onstart=null;this.onend=null;this.onerror=null}}
if(!window.speechSynthesis){
var U={},n=0;
var ss={speaking:false,pending:false,paused:false,onvoiceschanged:null,__stub:true,getVoices:function(){return[]},pause:noop,resume:noop,addEventListener:noop,removeEventListener:noop,
speak:function(u){var id='u'+(++n),ok=false;
try{ok=!!(window.Android&&typeof window.Android.ttsSpeak==='function'&&window.Android.ttsSpeak(id,String((u&&u.text)||''),+(u&&u.rate)||1,+(u&&u.pitch)||1))}catch(e){}
if(ok){U[id]=u;ss.speaking=true;try{if(u.onstart)u.onstart({})}catch(e){}}
else setTimeout(function(){try{if(u&&u.onerror)u.onerror({error:'synthesis-unavailable'})}catch(e){}},0)},
cancel:function(){try{if(window.Android&&typeof window.Android.ttsStop==='function')window.Android.ttsStop()}catch(e){}
var l=U;U={};ss.speaking=false;
for(var k in l){(function(u){setTimeout(function(){try{if(u.onerror)u.onerror({error:'interrupted'})}catch(e){}},0)})(l[k])}}};
window.speechSynthesis=ss;
window.__ttsEv=function(id,type){var u=U[id];if(!u)return;delete U[id];ss.speaking=false;for(var k in U){ss.speaking=true;break}
try{if(type=='end'){if(u.onend)u.onend({})}else if(u.onerror)u.onerror({error:'synthesis-failed'})}catch(e){}}}
var ES=[
[/This model is currently experiencing high demand\.?(?: Spikes in demand are usually temporary\.?)?(?: Please try again later\.?)?/gi,'Google tiene el modelo saturado en este momento. Suele ser pasajero: intenta de nuevo en unos segundos.'],
[/(?:This model )?models\/([\w.\-]+) is no longer available to new users[\s\S]*$/i,'El modelo $1 ya no está disponible para cuentas nuevas. Usa uno más nuevo.'],
[/API key not valid\.?(?: Please pass a valid API key\.?)?/gi,'La clave de API no es válida. Revísala en Ajustes, Sistema.'],
[/API key expired[^.]*\.?|API_KEY_INVALID/gi,'La clave de API venció o no es válida.'],
[/(?:You exceeded your current quota|Quota exceeded|RESOURCE_EXHAUSTED|Resource has been exhausted)[^.]*\.?/gi,'Se agotó la cuota de esta clave. Espera un rato o agrega otra clave.'],
[/The model is overloaded\.?(?: Please try again later\.?)?/gi,'El modelo está sobrecargado. Intenta de nuevo en unos segundos.'],
[/Failed to fetch|NetworkError when attempting to fetch resource\.?|Load failed|Network request failed/gi,'No hay conexión a internet'],
[/The user aborted a request\.?|The operation was aborted\.?|signal is aborted without reason|AbortError/gi,'La consulta tardó demasiado y se canceló'],
[/Uncaught ReferenceError: ([\w.$]+) is not defined/g,'Error de referencia: «$1» no existe en este dispositivo'],
[/([\w.$]+) is not defined/g,'«$1» no está definido'],
[/Uncaught TypeError: /g,'Error de tipo: '],
[/Uncaught SyntaxError: /g,'Error de sintaxis: '],
[/Uncaught Error: /g,'Error: '],
[/Cannot read propert(?:y|ies) of (?:undefined|null) \(reading '([^']*)'\)/g,'Se intentó leer «$1» de un valor vacío'],
[/Cannot set propert(?:y|ies) of (?:undefined|null) \(setting '([^']*)'\)/g,'Se intentó escribir «$1» en un valor vacío'],
[/([\w.$]+) is not a function/g,'«$1» no es una función'],
[/Unexpected end of input/g,'El código termina antes de tiempo (falta cerrar algo)'],
[/Invalid or unexpected token/g,'Símbolo no válido o inesperado'],
[/Unexpected token '?([^'\s]+)'?/g,'Símbolo inesperado «$1»'],
[/Unexpected identifier/g,'Palabra inesperada'],
[/Too many requests|Rate limit exceeded/gi,'Demasiadas consultas seguidas. Espera un momento.'],
[/Permission denied/gi,'Permiso denegado'],
[/Requested entity was not found\.?/gi,'No se encontró eso en el servidor'],
[/Internal error encountered\.?|Internal Server Error/gi,'Error interno del servicio. Intenta de nuevo.'],
[/Deadline expired[^.]*\.?/gi,'Se acabó el tiempo de espera.'],
[/Service Unavailable/gi,'Servicio no disponible por ahora'],
[/Bad Request/gi,'Petición no válida'],
[/Please try again later\.?/gi,'Intenta de nuevo más tarde.']
];
window.esErr=function(m){var s=String(m==null?'':m);for(var i=0;i<ES.length;i++)s=s.replace(ES[i][0],ES[i][1]);return s};
})();
