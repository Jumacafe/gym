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
 st({modal:{type:'confirmDelTpl',id:id}});
};
window.confirmDelTpl=function(id){
 var d=cd();
 d.templates=d.templates.filter(function(t){return t.id!==id;});
 st({data:d,modal:null});tst('Plantilla eliminada');
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
 var t={id:draft.id||uid(),name:currentName,color:draft.color,exercises:exercises,days:(draft.days||[]).slice().sort()};
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
// Activa/desactiva el Wake Lock (mantener pantalla encendida)
window.toggleWakeLock=function(){
 var d=cd();
 d.settings=d.settings||{};
 d.settings.wakeLock=!(d.settings.wakeLock!==false);
 sv(d);S.data=d;
 if(d.settings.wakeLock){
  if(typeof window.acquireWakeLock==='function')window.acquireWakeLock();
  tst('📱 Pantalla se mantendrá encendida');
 }else{
  if(typeof window.releaseWakeLock==='function')window.releaseWakeLock();
  tst('📱 Wake lock desactivado');
 }
 st({data:d});
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
  var compact=pack(S.data);
  var json=JSON.stringify(compact);
  // Try gzip via CompressionStream; fallback to plain JSON
  if(typeof CompressionStream!=='undefined'){
   (async function(){
    try{
     var stream=new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
     var buffer=await new Response(stream).arrayBuffer();
     var bytes=new Uint8Array(buffer);
     var bin='';
     for(var i=0;i<bytes.length;i++)bin+=String.fromCharCode(bytes[i]);
     var b64=btoa(bin);
     var blob=new Blob(['gz:'+b64],{type:'application/octet-stream'});
     var url=URL.createObjectURL(blob);
     var a=document.createElement('a');
     a.href=url;a.download='ironlog-backup-'+dk(new Date())+'.json.gz';
     a.click();URL.revokeObjectURL(url);
     tst('✅ Datos exportados (compactos + gzip)');
    }catch(ge){
     // fallback plain
     var blob=new Blob([json],{type:'application/json'});
     var url=URL.createObjectURL(blob);
     var a=document.createElement('a');
     a.href=url;a.download='ironlog-backup-'+dk(new Date())+'.json';
     a.click();URL.revokeObjectURL(url);
     tst('✅ Datos exportados');
    }
   })();
  } else {
   var blob=new Blob([json],{type:'application/json'});
   var url=URL.createObjectURL(blob);
   var a=document.createElement('a');
   a.href=url;a.download='ironlog-backup-'+dk(new Date())+'.json';
   a.click();URL.revokeObjectURL(url);
   tst('✅ Datos exportados');
  }
 }catch(e){tst('Error al exportar');console.error(e);}
};
window.importData=function(){
 var inp=document.createElement('input');
 inp.type='file';inp.accept='.json,.gz,application/json,application/octet-stream';
 inp.onchange=function(ev){
  var file=ev.target.files[0];
  if(!file){return;}
  var reader=new FileReader();
  reader.onload=function(e){
   (async function(){
    try{
     var text=e.target.result;
     var parsed;
     // Detect gzipped
     if(text.startsWith && text.startsWith('gz:')){
      try{
       var b64=text.slice(3);
       var bin=atob(b64);
       var bytes=new Uint8Array(bin.length);
       for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
       var stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
       var json=await new Response(stream).text();
       parsed=JSON.parse(json);
      }catch(de){tst('❌ Error descomprimiendo gzip');return;}
     } else {
      parsed=JSON.parse(text);
     }
     if(typeof parsed!=='object'||!parsed.workouts){tst('❌ Archivo inválido: no parece un backup de IronLog');return;}
     // Convert compact -> long if needed
     var longData=isOldFormat(parsed)?parsed:unpack(parsed);
     var def=defaultData();
     if(!longData.customExercises)longData.customExercises=def.customExercises;
     if(!longData.bodyWeight)longData.bodyWeight=def.bodyWeight;
     if(!longData.workoutNotes)longData.workoutNotes=def.workoutNotes;
     if(!longData.workoutTimes)longData.workoutTimes={};
     if(!longData.goals)longData.goals=def.goals;
     if(!longData.goals.customGoals)longData.goals.customGoals=[];
     if(!longData.reminders)longData.reminders=def.reminders;
     if(!longData.settings)longData.settings=def.settings;
     if(!longData.templates)longData.templates=[];
     sv(longData);S.data=longData;
     st({data:longData,modal:null});
     tst('✅ Datos importados correctamente');
    }catch(err){tst('❌ Error al leer el archivo: '+err.message);console.error(err);}
   })();
  };
  reader.readAsText(file);
 };
 inp.click();
};