// ══ ACTIONS WORKOUT ══
window.togSet=function(exId,idx){
 var d=cd();
 var prMsg='';
 var becameAllDone=false;
 d.workouts[S.sel]=(d.workouts[S.sel]||[]).map(function(ex){
  if(ex.id!==exId)return ex;
  var sets=ex.sets.map(function(s,i){
   if(i!==idx)return s;
   var newDone=!s.done;
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
 d.workouts[S.sel]=(d.workouts[S.sel]||[]).map(function(ex){
  if(ex.id!==exId)return ex;
  var allDone=ex.sets.every(function(s){return s.done;});
  var newDoneState = !allDone;
  if(newDoneState && ex.sets.length > 0) becameAllDone = true;
  return Object.assign({},ex,{sets:ex.sets.map(function(s){return Object.assign({},s,{done:newDoneState});})});
 });

 if(becameAllDone) {
  if(!S.expandedEx) S.expandedEx = {};
  S.expandedEx[exId] = false;
 }

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
  var last=ex.sets.length?ex.sets[ex.sets.length-1]:{weight:0,reps:0};
  return Object.assign({},ex,{sets:ex.sets.concat([{weight:last.weight||0,reps:last.reps||0,done:false}])});
 });
 sv(d);S.data=d;st({data:d});
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
   return Object.assign({},s,{weight:parseFloat(val)||0});
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
window.saveEE=function(exId){
 var name=document.getElementById('ename');if(!name||!name.value.trim()){tst('Pon el nombre');return;}
 var rows=document.querySelectorAll('#erows .serr');
 var sets=Array.prototype.slice.call(rows).map(function(row){
  var ins=row.querySelectorAll('input');
  return{weight:parseFloat(ins[0]?ins[0].value:0)||0,reps:parseInt(ins[1]?ins[1].value:0)||0,done:false};
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
  '<input class="si" type="number" inputmode="decimal" min="0" value="0"/>'+
  '<input class="si" type="number" inputmode="numeric" min="0" value="0"/>'+
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
  d.workouts[S.sel].push({id:uid(),name:e.name,muscle:e.muscle||'',dbId:e.dbId||'',sets:[]});
 });
 st({data:d,modal:null});
 tst('✅ '+t.name+' aplicada'+(skipped?' ('+skipped+' duplicado'+(skipped>1?'s':'')+' omitido'+(skipped>1?'s':'')+')':''));
};;

window.applyTFromCal=function(tId){
 applyT(tId);
 var content=document.querySelector('.content');
 if(content)content.scrollTo({top:0,behavior:'smooth'});
};
