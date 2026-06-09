// ══ ACTIONS ══
window._cs=[{w:'',r:''},{w:'',r:''},{w:'',r:''}];
window._ctx={};

window.gT=function(t){
  st({tab:t,exView:null,modal:null});
  var c=document.querySelector('.content');
  if(c) c.scrollTop=0;
};
window.selD=function(k){
  st({sel:k});
  var c=document.querySelector('.content');
  if(c) c.scrollTop=0;
};
window.pM=function(){var c=S.cal;st({cal:c.m===0?{y:c.y-1,m:11}:{y:c.y,m:c.m-1}});};
window.nM=function(){var c=S.cal;st({cal:c.m===11?{y:c.y+1,m:0}:{y:c.y,m:c.m+1}});};
window.oM=function(type,extra){
 var extraObj=(extra&&typeof extra==='object')?extra:{};
 var p=Object.assign({type:type},extraObj);
 if(type==='picker'){window._ctx=extraObj;window._cs=[{w:'',r:''},{w:'',r:''},{w:'',r:''}];}
 if(type==='newTpl'){S.tplDraft={id:null,name:'',color:'#FF3B3B',exercises:[],_activeSets:{}};}
 if(type==='editTpl'){
  var tplId=typeof extra==='string'?extra:(extraObj.id||'');
  var t=S.data.templates.filter(function(x){return x.id===tplId;})[0];
  if(t)S.tplDraft=JSON.parse(JSON.stringify({id:t.id,name:t.name,color:t.color,exercises:t.exercises,_activeSets:{}}));
  p.id=tplId;
 }
 st({modal:p});
};
window.closeM=function(){st({modal:null});};

// ── EXPAND/COLLAPSE CONTROL ──
window.togExExpand=function(id){
 if(!S.expandedEx) S.expandedEx = {};
 S.expandedEx[id] = !S.expandedEx[id];
 render();
};

window.saveNote=function(v){
 if(!S.data.workoutNotes)S.data.workoutNotes={};
 S.data.workoutNotes[S.sel]=v;
 sv(S.data);
};
window.setPF=function(f,v){S.pf[f]=v;render();};

window.startRest=function(secs){
 if(S.restTimer){clearInterval(S.restTimer.interval);}
 var left=secs||90;
 var interval=setInterval(function(){
  left--;
  if(left<=0){clearInterval(interval);S.restTimer=null;tst('✅ Descanso terminado — ¡a por la siguiente serie!');render();return;}
  S.restTimer={left:left,interval:interval};
  var el=document.querySelector('.rest-timer');
  if(el){var m=Math.floor(left/60),sc=left%60;el.childNodes[0].textContent='⏱ '+m+':'+String(sc).padStart(2,'0')+'  ';}
 },1000);
 S.restTimer={left:left,interval:interval};render();
};
window.stopRest=function(){
 if(S.restTimer){clearInterval(S.restTimer.interval);}
 S.restTimer=null;render();
};
