// ══ ACTIONS WORKOUT ══
// Helper: registra/actualiza timestamps de inicio y fin del entreno
function trackWorkoutTime(d, marking){
 // marking=true → usuario está marcando una serie como hecha
 // marking=false → usuario está desmarcando
 var times=d.workoutTimes[S.sel]||{startedAt:null,endedAt:null};
 var now=new Date().toISOString();
 if(marking){
  if(!times.startedAt)times.startedAt=now;
  times.endedAt=now;
 } else {
  // Comprobar si quedan series hechas
  var hasAnyDone=(d.workouts[S.sel]||[]).some(function(ex){return (ex.sets||[]).some(function(s){return s.done;});});
  if(!hasAnyDone){
   // Todo desmarcado: reseteamos tiempos
   times.startedAt=null;
   times.endedAt=null;
  }
  // Si quedan series hechas, dejamos los tiempos como están (endedAt representa la última marcación real)
 }
 d.workoutTimes[S.sel]=times;
}

window.togSet=function(exId,idx){
 var d=cd();
 var prMsg='';
 var becameAllDone=false;
 var toggledOn=false;
 haptic(15);
 d.workouts[S.sel]=(d.workouts[S.sel]||[]).map(function(ex){
  if(ex.id!==exId)return ex;
  var sets=ex.sets.map(function(s,i){
   if(i!==idx)return s;
   var newDone=!s.done;
   toggledOn=newDone;
   if(newDone&&ex.name){
    var hist=getHist(ex.name,S.data.workouts);
    var prevBestRM=hist.length?Math.max.apply(null,hist.map(function(x){return x.rm;})):0;
    var thisRM=e1rm(s.weight||0,s.reps||1);
    if(thisRM>prevBestRM&&prevBestRM>0)prMsg='🏆 ¡NUEVO RÉCORD! '+ex.name+': '+thisRM+'kg 1RM';
   }
   return Object.assign({},s,{done:newDone});
  });

  // Revisamos si esta acción completó todo el ejercicio
  var allDoneNow = sets.length > 0 && sets.every(function(s){return s.done;});
  if(allDoneNow) becameAllDone = true;

  return Object.assign({},ex,{sets:sets});
 });

 // Track de tiempo en gym
 trackWorkoutTime(d, toggledOn);

 // Si se completó, forzamos que colapse (expanded = false)
 if(becameAllDone) {
  if(!S.expandedEx) S.expandedEx = {};
  S.expandedEx[exId] = false;
 }

 st({data:d});
 if(prMsg)tst(prMsg);

};
window.togAllSets=function(exId){
 var d=cd();
 var becameAllDone = false;
 var toggledOn = false;
 haptic(20);
 d.workouts[S.sel]=(d.workouts[S.sel]||[]).map(function(ex){
  if(ex.id!==exId)return ex;
  var allDone=ex.sets.every(function(s){return s.done;});
  var newDoneState = !allDone;
  toggledOn=newDoneState;
  if(newDoneState && ex.sets.length > 0) becameAllDone = true;
  return Object.assign({},ex,{sets:ex.sets.map(function(s){return Object.assign({},s,{done:newDoneState});})});
 });

 if(becameAllDone) {
  if(!S.expandedEx) S.expandedEx = {};
  S.expandedEx[exId] = false;
 }

 // Track de tiempo en gym
 trackWorkoutTime(d, toggledOn);

 var nowAllDone=(d.workouts[S.sel]||[]).filter(function(e){return e.id===exId;})[0];
 st({data:d});
 tst(nowAllDone&&nowAllDone.sets.every(function(s){return s.done;})?'✅ Todas las series completadas':'☐ Series desmarcadas');
};
window.delEx=function(id){
 var d=cd();
 d.workouts[S.sel]=(d.workouts[S.sel]||[]).filter(function(e){return e.id!==id;});
 st({data:d});tst('Ejercicio eliminado');
};
window.addSetToEx=function(exId){
 var d=cd();
 d.workouts[S.sel]=(d.workouts[S.sel]||[]).map(function(ex){
  if(ex.id!==exId)return ex;
  var last=(ex.sets||[]).length?(ex.sets[ex.sets.length-1]):{weight:0,reps:0};
  return Object.assign({},ex,{sets:(ex.sets||[]).concat([{weight:last.weight||0,reps:last.reps||0,done:false}])});
 });
 sv(d);S.data=d;st({data:d});
};
// Auto-rellena los inputs de peso/reps con lo último escrito (UX)
window.duplicateLastSet=function(exId){
 var d=cd();
 d.workouts[S.sel]=(d.workouts[S.sel]||[]).map(function(ex){
  if(ex.id!==exId)return ex;
  if((ex.sets||[]).length<2)return ex;
  var prev=ex.sets[ex.sets.length-2];
  return Object.assign({},ex,{sets:ex.sets.map(function(s,i){
   if(i!==ex.sets.length-1)return s;
   return Object.assign({},s,{weight:prev.weight,reps:prev.reps});
  })});
 });
 sv(d);S.data=d;st({data:d});
 tst('↩ Copiado del set anterior');
};
// Haptic feedback (vibración corta) si está disponible
function haptic(pattern){
 try{if(navigator.vibrate&&S.data.settings&&S.data.settings.haptic!==false)navigator.vibrate(pattern||15);}catch(e){}
}
// Marca/desmarca una serie como dropset (técnica de intensidad: bajar peso sin descanso)
window.togDropSet=function(exId,idx){
 var d=cd();
 d.workouts[S.sel]=(d.workouts[S.sel]||[]).map(function(ex){
  if(ex.id!==exId)return ex;
  var sets=ex.sets.map(function(s,i){
   if(i!==idx)return s;
   return Object.assign({},s,{dropSet:!s.dropSet});
  });
  return Object.assign({},ex,{sets:sets});
 });
 haptic(10);
 st({data:d});
};
// Coloca el caret al final del input al recibir foco.
// En iOS/Android los inputs numéricos suelen abrir el teclado con el caret al inicio,
// lo que impide borrar la cifra sin tocarla de nuevo. Esta helper lo corrige en todos
// los inputs donde el usuario tipea peso o reps.
function caretEnd(el){
 try{
  if(!el)return;
  // Para inputs vacíos, no hacemos nada (no hay nada al final).
  var v=el.value;
  var len=v?v.length:0;
  // Diferimos al próximo tick: iOS aplica el foco y el caret antes/después de forma asíncrona.
  setTimeout(function(){
   try{
    el.setSelectionRange(len,len);
    // type=number en algunos navegadores no soporta setSelectionRange; usamos tipo texto equivalente
    if(el.type==='number'&&el.setSelectionRange){
     try{el.setSelectionRange(len,len);}catch(e){}
    }
   }catch(e){}
  },0);
  // Reintento extra por si el teclado virtual aún no terminó de abrir.
  setTimeout(function(){
   try{el.setSelectionRange(len,len);}catch(e){}
  },60);
 }catch(e){}
}
window.saveMMCRating=function(exId,rating){
 var d=cd();
 if(!d.mmcRatings)d.mmcRatings={};
 var key=S.sel+'|'+exId;
 d.mmcRatings[key]=rating;
 st({data:d});
 tst(rating>=4?'💪 Buena conexion':rating>=3?'👍 OK':'⚠️ Proba a专注');
};
window.removeSetFromEx=function(exId,idx){
 var d=cd();
 d.workouts[S.sel]=(d.workouts[S.sel]||[]).map(function(ex){
  if(ex.id!==exId)return ex;
  return Object.assign({},ex,{sets:ex.sets.filter(function(_,i){return i!==idx;})});
 });
 sv(d);S.data=d;st({data:d});
};
window.openEditExSets=function(exId,name,muscle){
 var ex=(S.data.workouts[S.sel]||[]).filter(function(e){return e.id===exId;})[0];
 if(!ex){tst('Ejercicio no encontrado');return;}
 window._cs=ex.sets.map(function(s){return{w:s.weight||'',r:s.reps||''};});
 st({modal:{type:'configEx',name:name,muscle:muscle,dbId:ex.dbId,ctx:'calendar',exId:exId}});
};
window.bulkKg=function(exId){
 var inp=document.getElementById('bk-'+exId);
 var kg=parseFloat(inp?inp.value:0)||0;
 if(kg===0){tst('Introduce los kg a añadir');return;}
 var d=cd();
 d.workouts[S.sel]=(d.workouts[S.sel]||[]).map(function(ex){
  if(ex.id!==exId)return ex;
  return Object.assign({},ex,{sets:ex.sets.map(function(s){return Object.assign({},s,{weight:Math.max(0,Math.round((s.weight+kg)*2)/2)});})});
 });
 st({data:d});tst((kg>0?'+':'')+kg+'kg aplicado');
};
window.updateSetW=function(exId,idx,val){
 var d=cd();
 d.workouts[S.sel]=(d.workouts[S.sel]||[]).map(function(ex){
  if(ex.id!==exId)return ex;
  var sets=ex.sets.map(function(s,i){
   if(i!==idx)return s;
   return Object.assign({},s,{weight:parseFloat(String(val).replace(',','.'))||0});
  });
  return Object.assign({},ex,{sets:sets});
 });
 st({data:d});
};

window.updateSetR=function(exId,idx,val){
 var d=cd();
 d.workouts[S.sel]=(d.workouts[S.sel]||[]).map(function(ex){
  if(ex.id!==exId)return ex;
  var sets=ex.sets.map(function(s,i){
   if(i!==idx)return s;
   return Object.assign({},s,{reps:parseInt(val)||0});
  });
  return Object.assign({},ex,{sets:sets});
 });
 st({data:d});
};
// Aplica la sugerencia inteligente al set (peso + reps)
window.applySuggestion=function(exId,idx,w,r){
 var d=cd();
 d.workouts[S.sel]=(d.workouts[S.sel]||[]).map(function(ex){
  if(ex.id!==exId)return ex;
  var sets=ex.sets.map(function(s,i){
   if(i!==idx)return s;
   return Object.assign({},s,{weight:w,reps:r});
  });
  return Object.assign({},ex,{sets:sets});
 });
 st({data:d});
 tst('💡 Sugerencia aplicada: '+w+'kg × '+r);
};
window.saveEE=function(exId){
 var name=document.getElementById('ename');if(!name||!name.value.trim()){tst('Pon el nombre');return;}
 var rows=document.querySelectorAll('#erows .serr');
 var sets=Array.prototype.slice.call(rows).map(function(row){
  var ins=row.querySelectorAll('input');
  return{weight:parseFloat(String(ins[0]?ins[0].value:0).replace(',','.'))||0,reps:parseInt(ins[1]?ins[1].value:0)||0,done:false};
 });
 var d=cd();
 d.workouts[S.sel]=(d.workouts[S.sel]||[]).map(function(e){return e.id!==exId?e:Object.assign({},e,{name:name.value.trim(),sets:sets});});
 st({data:d,modal:null});tst('✅ Guardado');
};
window.rmER=function(i){
 var rows=document.querySelectorAll('#erows .serr');
 if(rows.length<=1){tst('Debe haber al menos una serie');return;}
 if(rows[i])rows[i].remove();
 document.querySelectorAll('#erows .serr').forEach(function(row,j){
  var sn=row.querySelector('.sn');if(sn)sn.textContent=j+1;
  var btn=row.querySelector('button.bism');if(btn)btn.setAttribute('onclick','rmER('+j+')');
 });
};
window.addER=function(){
 var c=document.getElementById('erows');if(!c)return;
 var i=c.children.length;
 var div=document.createElement('div');div.className='serr';
 div.innerHTML='<span class="sn" style="color:#FF3B3B">'+(i+1)+'</span>'+
  '<input class="si" type="number" inputmode="decimal" min="0" value="0" onfocus="caretEnd(this)"/>'+
  '<input class="si" type="number" inputmode="numeric" min="0" value="0" onfocus="caretEnd(this)"/>'+
  '<button class="bism" style="color:#FF3B3B" onclick="rmER('+i+')">'+IC.trash+'</button>';
 c.appendChild(div);
};
window.applyT=function(tId){
 var t=S.data.templates.filter(function(x){return x.id===tId;})[0];if(!t)return;
 var d=cd();
 d.workouts[S.sel]=d.workouts[S.sel]||[];
 var existNames=d.workouts[S.sel].map(function(e){return e.name;});
 var skipped=0;
 t.exercises.forEach(function(e){
  if(existNames.indexOf(e.name)>=0){skipped++;return;}
  var _ls=getLastSets(e.name,d.workouts);
  var _initSets=_ls?_ls.map(function(s){return{weight:s.weight||0,reps:s.reps||0,done:false};}):[];
  d.workouts[S.sel].push({id:uid(),name:e.name,muscle:e.muscle||'',dbId:e.dbId||'',sets:_initSets});
 });
 st({data:d,modal:null});
 tst('✅ '+t.name+' aplicada'+(skipped?' ('+skipped+' duplicado'+(skipped>1?'s':'')+' omitido'+(skipped>1?'s':'')+')':''));
};;

window.applyTFromCal=function(tId){
 applyT(tId);
 var content=document.querySelector('.content');
 if(content)content.scrollTo({top:0,behavior:'smooth'});
};