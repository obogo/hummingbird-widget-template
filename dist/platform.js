!function(){function a(a){for(var e=a.split(" "),f=function(a){return function(){var b=Array.prototype.slice.call(arguments);return b.unshift(a),c.push(b),c}},g=0;g<e.length;g++){var h=e[g];c[h]=f(h)}var i=document.getElementsByTagName("script")[0];i.parentNode.insertBefore(d,i),window.platform=c,b()}function b(){var a,b,c=document.querySelectorAll("script");for(a=0;a<c.length;a++)if(b=c[a].src.split("/"),b.pop()===f){b=window[e].baseUrl=b.join("/")+"/",d.src=b+"/dist/platform.dist.js".split("/").pop(),console.log(d.src);break}d.src||(d.src="/dist/platform.dist.js")}var c=[],d=document.createElement("script"),e="platform",f=e+".js".split("/").pop();d.type="text/javascript",d.async=!0,d.onload=d.onerror=function(){setTimeout(function(){var a,b;for(a=0,b=c.length,a;b>a;a++){var d=c[a],e=d.shift();if(c.hasOwnProperty(e))try{c[e].apply(c,d)}catch(f){console.warn(f.message)}}c.length=0})},a("boot")}();