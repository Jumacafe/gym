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
 var ex2=(d.workouts[S.sel]||[]).filter(function(e){return e.id===exId;})[0];
 var s2=ex2?ex2.sets[idx]:null;
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
window.confirmReset=function(){
 if(confirm('Borrar TODOS los datos de IronLog? Esta accion no se puede deshacer.')){
  localStorage.removeItem('ironlog_v7');
  S.data=defaultData();sv(S.data);
  st({data:S.data,tab:'calendar',modal:null});
  tst('Datos eliminados');
 }
};
window.delTpl=function(id){
 var d=cd();
 d.templates=d.templates.filter(function(t){return t.id!==id;});
 st({data:d});tst('Plantilla eliminada');
};
window.rmTex=function(i){
 S.tplDraft.exercises.splice(i,1);
 if(S.tplDraft._activeSets)delete S.tplDraft._activeSets[i];
 render();
};
window.saveTpl=function(){
 var nameEl=document.getElementById('tname');
 var currentName=nameEl?nameEl.value.trim():S.tplDraft.name.trim();
 if(!currentName){tst('Ponle nombre a la plantilla');return;}
 var draft=S.tplDraft;
 var exercises=draft.exercises.map(function(e){
  if(!Array.isArray(e.sets))e.sets=[];
  return e;
 });
 var t={id:draft.id||uid(),name:currentName,color:draft.color,exercises:exercises};
 var d=cd();
 if(draft.id){d.templates=d.templates.map(function(x){return x.id===t.id?t:x;});}
 else{d.templates=d.templates.concat([t]);}
 S.tplDraft={id:null,name:'',color:'#FF3B3B',exercises:[],_activeSets:{}};
 st({data:d,modal:null});tst(draft.id?'✅ Plantilla actualizada':'✅ Plantilla creada');
};
window.selCexMuscle=function(btn,m){
 document.querySelectorAll('#cexmuscles .mch').forEach(function(b){b.classList.remove('on');b.style.background='';b.style.borderColor='';b.style.color='';});
 btn.classList.add('on');btn.style.background='#FF3B3B';btn.style.borderColor='#FF3B3B';btn.style.color='#fff';
 var h=document.getElementById('cexmuscle');if(h)h.value=m;
};
window.saveCustomEx=function(){
 var name=document.getElementById('cexname')?document.getElementById('cexname').value.trim():'';
 var muscle=document.getElementById('cexmuscle')?document.getElementById('cexmuscle').value:'';
 var equip=document.getElementById('cexequip')?document.getElementById('cexequip').value.trim()||'Otro':'Otro';
 var emoji=document.getElementById('cexemoji')?document.getElementById('cexemoji').value.trim()||'💪':'💪';
 if(!name){tst('Pon el nombre del ejercicio');return;}
 if(!muscle){tst('Selecciona un grupo muscular');return;}
 var d=cd();
 d.customExercises=d.customExercises||[];
 if(d.customExercises.some(function(e){return e.n.toLowerCase()===name.toLowerCase();})||EDB.some(function(e){return e.n.toLowerCase()===name.toLowerCase();})){tst('Ya existe un ejercicio con ese nombre');return;}
 d.customExercises.push({id:'c'+uid(),n:name,m:muscle,q:equip,i:emoji,custom:true});
 st({data:d,modal:null});tst('✅ Ejercicio añadido a tu biblioteca');
};
window.saveGoals=function(){
 var s=parseInt(document.getElementById('gsessions')?document.getElementById('gsessions').value:4)||4;
 var d=cd();
 d.goals=Object.assign({},d.goals||{},{weeklySessions:Math.max(1,Math.min(7,s))});
 st({data:d,modal:null});tst('✅ Meta actualizada');
};
window.selGoalUnit=function(btn,u){
 document.querySelectorAll('#cg-units .mch').forEach(function(b){b.classList.remove('on');b.style.background='';b.style.borderColor='';b.style.color='';});
 btn.classList.add('on');btn.style.background='#FF3B3B';btn.style.borderColor='#FF3B3B';btn.style.color='#fff';
 var h=document.getElementById('cg-unit');if(h)h.value=u;
};
window.saveCustomGoal=function(idx){
 var name=document.getElementById('cg-name')?document.getElementById('cg-name').value.trim():'';
 var target=parseFloat(document.getElementById('cg-target')?document.getElementById('cg-target').value:0)||0;
 var current=parseFloat(document.getElementById('cg-current')?document.getElementById('cg-current').value:0)||0;
 var unit=document.getElementById('cg-unit')?document.getElementById('cg-unit').value:'kg';
 if(!name){tst('Ponle nombre a la meta');return;}
 if(!target){tst('Define un objetivo numérico');return;}
 var d=cd();
 d.goals.customGoals=d.goals.customGoals||[];
 var goal={id:uid(),name:name,target:target,current:current,unit:unit};
 if(idx>=0){d.goals.customGoals[idx]=goal;}else{d.goals.customGoals.push(goal);}
 st({data:d,modal:null});tst('✅ Meta guardada');
};
window.editCustomGoal=function(i){st({modal:{type:'editCustomGoal',idx:i}});};
window.delCustomGoal=function(i){
 var d=cd();
 d.goals.customGoals.splice(i,1);
 st({data:d});tst('Meta eliminada');
};
window.saveBodyWeight=function(){
 var rawVal=document.getElementById('bwkg')?document.getElementById('bwkg').value:'0';
 var normalizedVal=rawVal.replace(',','.');
 var kg=parseFloat(normalizedVal)||0;
 if(kg<30||kg>300){tst('Introduce un peso válido (30-300kg)');return;}
 var today=dk(new Date());
 var d=cd();
 d.bodyWeight=d.bodyWeight||[];
 d.bodyWeight=d.bodyWeight.filter(function(e){return e.date!==today;});
 d.bodyWeight.push({date:today,kg:kg});
 d.bodyWeight.sort(function(a,b){return a.date.localeCompare(b.date);});
 st({data:d,modal:null});tst('✅ Peso registrado: '+kg+'kg');
};
window.delBodyWeight=function(date){
 var d=cd();
 d.bodyWeight=(d.bodyWeight||[]).filter(function(e){return e.date!==date;});
 st({data:d,modal:{type:'logWeight'}});tst('Registro eliminado');
};
window.getTimezone=function(){
 try{
  var tz=Intl.DateTimeFormat().resolvedOptions().timeZone;
  if(tz.indexOf('Montevideo')!==-1||tz.indexOf('Buenos_Aires')!==-1||tz.indexOf('South_America')!==-1){
   return 'America/Montevideo';
  }
  return tz;
 }catch(e){
  return 'America/Montevideo';
 }
};
window.toggleReminder=function(){
 if(!('Notification' in window)){
  tst('⚠️ Tu navegador no soporta notificaciones');
  return;
 }
 
 if(!S.data.reminders.enabled){
  if(Notification.permission==='granted'){
   var d=cd();
   d.reminders=d.reminders||{};
   d.reminders.enabled=true;
   d.reminders.timezone=window.getTimezone();
   sv(d);S.data=d;
   st({data:d});
   tst('✅ Recordatorios activados ('+window.getTimezone()+')');
  }else if(Notification.permission==='denied'){
   tst('⚠️ Notificaciones bloqueadas. Actívalas en Configuración del navegador');
  }else{
   Notification.requestPermission().then(function(p){
    if(p==='granted'){
     var d=cd();
     d.reminders=d.reminders||{};
     d.reminders.enabled=true;
     d.reminders.timezone=window.getTimezone();
     sv(d);S.data=d;
     st({data:d});
     window.setupReminders();
     tst('✅ Recordatorios activados ('+window.getTimezone()+')');
    }else if(p==='denied'){
     tst('⚠️ Notificaciones bloqueadas. Actívalas en Configuración');
    }
   });
  }
 }else{
  var d=cd();
  d.reminders=d.reminders||{};
  d.reminders.enabled=false;
  sv(d);S.data=d;
  st({data:d});
  tst('⏸️ Recordatorios desactivados');
 }
};
window.toggleRemDay=function(i){
 var d=cd();
 d.reminders=d.reminders||{};
 var days=d.reminders.days||[0,1,2,3,4];
 var idx=days.indexOf(i);
 if(idx>=0)days.splice(idx,1);else days.push(i);
 d.reminders.days=days.sort(function(a,b){return a-b;});
 st({data:d});
};
window.setRemTime=function(v){
 S.data.reminders=S.data.reminders||{};
 S.data.reminders.time=v;
 sv(S.data);
 window.setupReminders();
 tst('Hora actualizada: '+v);
};
window.exportData=function(){
 try{
  var blob=new Blob([JSON.stringify(S.data,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;a.download='ironlog-backup-'+dk(new Date())+'.json';
  a.click();URL.revokeObjectURL(url);tst('✅ Datos exportados');
 }catch(e){tst('Error al exportar');}
};
window.importData=function(){
 var inp=document.createElement('input');
 inp.type='file';inp.accept='.json,application/json';
 inp.onchange=function(ev){
  var file=ev.target.files[0];
  if(!file){return;}
  var reader=new FileReader();
  reader.onload=function(e){
   try{
    var parsed=JSON.parse(e.target.result);
    if(typeof parsed!=='object'||!parsed.workouts){tst('❌ Archivo inválido: no parece un backup de IronLog');return;}
    var def=defaultData();
    if(!parsed.customExercises)parsed.customExercises=def.customExercises;
    if(!parsed.bodyWeight)parsed.bodyWeight=def.bodyWeight;
    if(!parsed.workoutNotes)parsed.workoutNotes=def.workoutNotes;
    if(!parsed.goals)parsed.goals=def.goals;
    if(!parsed.goals.customGoals)parsed.goals.customGoals=[];
    if(!parsed.reminders)parsed.reminders=def.reminders;
    if(!parsed.settings)parsed.settings=def.settings;
    if(!parsed.templates)parsed.templates=[];
    sv(parsed);S.data=parsed;
    st({data:parsed,modal:null});
    tst('✅ Datos importados correctamente');
   }catch(err){tst('❌ Error al leer el archivo: '+err.message);}
  };
  reader.readAsText(file);
 };
 inp.click();
};

