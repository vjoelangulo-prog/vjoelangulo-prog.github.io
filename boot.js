try{var x=new XMLHttpRequest();x.open('GET','/api/data?'+Date.now(),false);x.send();
if(x.status==200){var o=JSON.parse(x.responseText);for(var k in o){if(localStorage.getItem(k)===null)localStorage.setItem(k,o[k])}}}catch(e){}
