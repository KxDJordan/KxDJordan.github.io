'use strict';
window.addEventListener('resize',()=>{
  if(typeof V!=='undefined'&&V&&typeof vSize==='function')vSize();
  if(G.screen==='title'&&typeof titleBg==='function')titleBg();
});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(G.screen==='title')titleBg()});
G.screen='title';render();
