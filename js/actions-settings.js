// ══ ACTIONS SETTINGS ══
window.saveRestConfig=function(){
 var c=parseInt(document.getElementById('cfg-rest-c')?document.getElementById('cfg-rest-c').value:180)||180;
 var i=parseInt(document.getElementById('cfg-rest-i')?document.getElementById('cfg-rest-i').value:90)||90;
 var d=cd();
 d.settings=d.settings||{};
 d.settings.restCompound=Math.max(30,Math.min(600,c));
 d.settings.restIso=Math.max(30,Math.min(600,i));
 st({data:d});tst('Tiempos de descanso guardados');
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
