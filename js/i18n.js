/* Idioma de la página (ES / EN). El español es el idioma original del contenido;
   el inglés se aplica con los diccionarios de js/en.js. Cambiar de idioma recarga la página. */
(function(){
  "use strict";
  var lang="";
  try{lang=localStorage.getItem("zidnz-lang")||""}catch(e){}
  if(lang!=="en"&&lang!=="es")lang=((navigator.language||"es")+"").toLowerCase().indexOf("en")===0?"en":"es";
  window.LANG=lang;
  document.documentElement.setAttribute("lang",lang);

  var D={},PAT=[];
  function norm(s){return String(s).replace(/\s+/g," ").trim()}
  var loaded=false;
  function ensure(){if(loaded||lang!=="en"||!window.EN_UI)return;loaded=true;Object.keys(window.EN_UI).forEach(function(k){D[k]=window.EN_UI[k]});PAT=window.EN_PAT||[]}
  window.T=function(s){ensure();return lang==="en"&&D[s]!==undefined?D[s]:s};
  window.setLang=function(l){try{localStorage.setItem("zidnz-lang",l==="en"?"en":"es")}catch(e){}location.reload()};

  function isProse(s){return /\s/.test(s)||/[^\x00-\x7f]/.test(s)}
  function walkStrings(o,fn){
    if(typeof o==="string")fn(o);
    else if(Array.isArray(o))o.forEach(function(v){walkStrings(v,fn)});
    else if(o&&typeof o==="object")Object.keys(o).forEach(function(k){walkStrings(o[k],fn)});
  }
  function replaceStrings(o,M){
    if(Array.isArray(o)){for(var i=0;i<o.length;i++){if(typeof o[i]==="string"){if(M.has(o[i]))o[i]=M.get(o[i])}else replaceStrings(o[i],M)}}
    else if(o&&typeof o==="object"){Object.keys(o).forEach(function(k){if(typeof o[k]==="string"){if(M.has(o[k]))o[k]=M.get(o[k])}else replaceStrings(o[k],M)})}
  }

  /* Traduce en el lugar los datos de las misiones (P y X) */
  function apply(P,X){
    if(lang!=="en"||!window.EN_A)return;
    ensure();
    var order=[],seen={};
    walkStrings(P,function(s){if(!seen[s]){seen[s]=1;if(isProse(s))order.push(s)}});
    walkStrings(X,function(s){if(!seen[s]){seen[s]=1;if(isProse(s))order.push(s)}});
    var EN=[].concat(window.EN_A,window.EN_B,window.EN_C),M=new Map();
    if(EN.length!==order.length&&window.console)console.warn("i18n: "+order.length+" textos y "+EN.length+" traducciones");
    order.forEach(function(s,i){
      var e=EN[i];
      if(e&&s.indexOf(e[0])===0)M.set(s,e[1]);
      else if(window.console)console.warn("i18n: sin traducción para",i,s.slice(0,40));
    });
    Object.keys(window.EN_SINGLE||{}).forEach(function(k){M.set(k,window.EN_SINGLE[k])});
    replaceStrings(P,M);replaceStrings(X,M);
    M.forEach(function(v,k){D[k]=v});
  }

  /* Traduce el texto ya dibujado y lo que se vaya agregando */
  function trText(raw){
    var k=norm(raw);
    if(D[k]!==undefined)return D[k];
    for(var i=0;i<PAT.length;i++){var m=PAT[i][0].exec(k);if(m)return k.replace(PAT[i][0],PAT[i][1])}
    return null;
  }
  function trTextNode(n){
    var t=n.nodeValue;if(!t||!t.trim())return;
    var p=n.parentNode;if(p&&(p.nodeName==="SCRIPT"||p.nodeName==="STYLE"))return;
    var r=trText(t);if(r===null||r===norm(t))return;
    n.nodeValue=t.replace(t.trim(),function(){return r});
  }
  var ATTR=["title","aria-label","alt","placeholder"];
  function trAttrs(e){
    ATTR.forEach(function(a){
      var v=e.getAttribute&&e.getAttribute(a);if(!v)return;
      var r=trText(v);if(r!==null&&r!==norm(v))e.setAttribute(a,r);
    });
  }
  function walk(root){
    if(!root)return;
    if(root.nodeType===3){trTextNode(root);return}
    if(root.nodeType!==1)return;
    trAttrs(root);
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),n;
    while((n=w.nextNode()))trTextNode(n);
    var els=root.querySelectorAll("[title],[aria-label],[alt],[placeholder]");
    for(var i=0;i<els.length;i++)trAttrs(els[i]);
  }
  function start(){
    if(lang!=="en")return;
    ensure();
    document.title="Omar Gutiérrez · Data Science Portfolio";
    var md=document.querySelector("meta[name=description]");
    if(md)md.setAttribute("content","Portfolio of Omar Gutiérrez Escoto: data science projects, Python, R and analytics in Mexico City.");
    var og=document.querySelector("meta[property='og:title']");if(og)og.setAttribute("content","Omar Gutiérrez · Data Science Portfolio");
    var od=document.querySelector("meta[property='og:description']");if(od)od.setAttribute("content","I turn messy data into decisions. Data science projects.");
    walk(document.body);
    new MutationObserver(function(list){
      list.forEach(function(m){
        if(m.type==="characterData")trTextNode(m.target);
        else if(m.type==="attributes")trAttrs(m.target);
        else m.addedNodes.forEach(walk);
      });
    }).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTR});
  }
  window.I18N={apply:apply,start:start,lang:lang};
})();
