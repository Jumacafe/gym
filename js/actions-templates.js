// ══ ACTIONS TEMPLATES ══
window.draftName=function(v){S.tplDraft.name=v;};
window.draftColor=function(c){
 S.tplDraft.color=c;
 document.querySelectorAll('.cdd').forEach(function(b){b.classList.toggle('on',b.style.background===c);});
};
window.draftExSetField=function(exIdx,setIdx,f,v){
 var ex=S.tplDraft.exercises[exIdx];if(!ex)return;
 if(!Array.isArray(ex.sets))ex.sets=[{weight:ex.weight||0,reps:ex.reps||10}];
 if(!ex.sets[setIdx])ex.sets[setIdx]={weight:0,reps:0};
 ex.sets[setIdx][f]=(f==='weight'?parseFloat(v):parseInt(v))||0;
};
window.texSetTab=function(exIdx,setIdx){
 if(!S.tplDraft._activeSets)S.tplDraft._activeSets={};
 S.tplDraft._activeSets[exIdx]=setIdx;render();
};
window.texAddSet=function(exIdx){
 var ex=S.tplDraft.exercises[exIdx];if(!ex)return;
 if(!Array.isArray(ex.sets))ex.sets=[{weight:ex.weight||0,reps:ex.reps||10}];
 var last=ex.sets[ex.sets.length-1]||{weight:0,reps:0};
 ex.sets.push({weight:last.weight||0,reps:last.reps||0});
 if(!S.tplDraft._activeSets)S.tplDraft._activeSets={};
 S.tplDraft._activeSets[exIdx]=ex.sets.length-1;render();
};
window.texRmSet=function(exIdx,setIdx){
 var ex=S.tplDraft.exercises[exIdx];if(!ex)return;
 if(!Array.isArray(ex.sets)||ex.sets.length<=1)return;
 ex.sets.splice(setIdx,1);
 if(!S.tplDraft._activeSets)S.tplDraft._activeSets={};
 S.tplDraft._activeSets[exIdx]=Math.min(setIdx,ex.sets.length-1);render();
};

window.cancelConfigEx=function(){
 st({modal:{type:S.tplDraft.id?'editTpl':'newTpl',id:S.tplDraft.id}});
};
window.openTplExEdit=function(exIdx){
 var ex=S.tplDraft.exercises[exIdx];
 if(!ex)return;
 var setsArr=Array.isArray(ex.sets)?ex.sets:[].concat(Array.from({length:ex.sets||3},function(){return{weight:ex.weight||0,reps:ex.reps||10};}));
 window._cs=setsArr.map(function(s){return{w:s.weight||0,r:s.reps||0};});
 window._editTplExIdx=exIdx;
 st({modal:{type:'editTplEx',name:ex.name,muscle:ex.muscle,exIdx:exIdx}});
};
window.saveTplExEdit=function(exIdx){
 var inputs=document.querySelectorAll('.series-row input[type="number"]');
 inputs.forEach(function(inp,idx){
  var row=Math.floor(idx/2);var field=idx%2===0?'w':'r';
  if(window._cs[row]){if(field==='w')window._cs[row].w=inp.value;else window._cs[row].r=inp.value;}
 });
 var sets=window._cs.map(function(s){return{weight:parseFloat(s.w)||0,reps:parseInt(s.r)||0,done:false};});
 var hasInvalid=sets.some(function(s){return s.reps<=0;});
 if(hasInvalid){tst('❌ Las repeticiones no pueden ser 0');return;}
 var ex=S.tplDraft.exercises[exIdx];
 if(!ex){tst('Error: ejercicio no encontrado');return;}
 ex.sets=sets;
 st({modal:{type:S.tplDraft.id?'editTpl':'newTpl',id:S.tplDraft.id}});
 tst('✅ Series actualizadas');
};
window.pickEx=function(dbId,name,muscle){
 var ctx=window._ctx;
 if(ctx.ctx==='calendar'){
  if((S.data.workouts[S.sel]||[]).some(function(e){return e.name===name;})){
   tst('⚠️ "'+name+'" ya está en el entreno de hoy');
   return;
  }
  var d=cd();
  d.workouts[S.sel]=d.workouts[S.sel]||[];
  var ex={id:uid(),name:name,muscle:muscle,dbId:dbId,sets:[]};
  d.workouts[S.sel].push(ex);
  sv(d);S.data=d;
  st({data:d,modal:null});
  tst('✅ "'+name+'" añadido — agrega tus series');
  return;
 } else if(ctx.ctx==='template'){
  if(S.tplDraft.exercises.some(function(e){return e.name===name;})){
   tst('⚠️ "'+name+'" ya está en la rutina');
   return;
  }
  S.tplDraft.exercises.push({name:name,muscle:muscle,dbId:dbId,sets:[]});
  st({modal:{type:S.tplDraft.id?'editTpl':'newTpl',id:S.tplDraft.id}});
  tst('✅ "'+name+'" añadido a la rutina');
  return;
 }
};
window.openPickerForTemplate=function(){
 window._ctx={ctx:'template'};
 window._cs=[{w:'',r:''},{w:'',r:''},{w:'',r:''}];
 st({modal:{type:'picker',ctx:'template'}});
};
window.addCS=function(){
 window._cs.push({w:'',r:''});
 st({modal:S.modal});
};
window.rmCS=function(i){
 if(window._cs.length>1){
  window._cs.splice(i,1);
  st({modal:S.modal});
 }
};
window.saveCE=function(ctx,exId){
 var inputs=document.querySelectorAll('.series-row input[type="number"]');
 inputs.forEach(function(inp,idx){
  var row=Math.floor(idx/2);
  var field=idx%2===0?'w':'r';
  if(window._cs[row]){
   if(field==='w')window._cs[row].w=parseFloat(inp.value)||0;
   else window._cs[row].r=parseInt(inp.value)||0;
  }
 });
 var sets=window._cs.map(function(s){return{weight:parseFloat(s.w)||0,reps:parseInt(s.r)||0,done:false};});
 
 var hasInvalid=sets.some(function(s){return s.reps<=0;});
 if(hasInvalid){tst('❌ Las repeticiones no pueden ser 0');return;}
 
 var modal=S.modal;
 var isEdit=exId&&exId!=='undefined'&&exId!=='null';
 if(ctx==='calendar'){
  if(isEdit){
   var d=cd();
   d.workouts[S.sel]=(d.workouts[S.sel]||[]).map(function(ex){
    if(ex.id!==exId)return ex;
    return Object.assign({},ex,{sets:sets});
   });
   sv(d);S.data=d;
   st({data:d,modal:null});
   tst('✅ Series guardadas');
  } else {
   var d=cd();
   d.workouts[S.sel]=d.workouts[S.sel]||[];
   if(d.workouts[S.sel].some(function(e){return e.name===modal.name;})){tst('⚠️ Ese ejercicio ya está en el entreno');st({modal:null});return;}
   var ex={id:uid(),name:modal.name,muscle:modal.muscle,dbId:modal.dbId,sets:sets};
   d.workouts[S.sel].push(ex);
   sv(d);S.data=d;
   st({data:d,modal:null});tst('✅ Ejercicio añadido');
  }
 } else if(ctx==='template'){
  if(S.tplDraft.exercises.some(function(e){return e.name===modal.name;})){tst('⚠️ Ese ejercicio ya está en la rutina');st({modal:{type:S.tplDraft.id?'editTpl':'newTpl',id:S.tplDraft.id}});return;}
  S.tplDraft.exercises.push({name:modal.name,muscle:modal.muscle,dbId:modal.dbId,sets:sets});
  st({modal:{type:S.tplDraft.id?'editTpl':'newTpl',id:S.tplDraft.id}});
 }
};
