// ══ RENDER CALENDAR ══
function rCal(workout){
 var cal=S.cal,sel=S.sel,data=S.data;
 var y=cal.y,m=cal.m;
 var days=getDIM(y,m),fd=getFDW(y,m),today=dk(new Date());
 var cells='';
 WDS.forEach(function(d){cells+='<div class="cdl">'+d+'</div>';});
 for(var i=0;i<fd;i++)cells+='<div></div>';
 for(var i=1;i<=days;i++){
  var k=y+'-'+String(m+1).padStart(2,'0')+'-'+String(i).padStart(2,'0');
  var has=data.workouts[k]&&data.workouts[k].length>0;
  var isSel=k===sel;
  var isTod=k===today&&!isSel;
  cells+='<button class="cd'+(isSel?' sel':'')+(isTod?' tod':'')+'" onclick="selD(\''+k+'\')">'+i+(has?'<div class="dot"></div>':'')+'</button>';
 }
 var totalDone=workout.reduce(function(a,ex){return a+(ex.sets||[]).filter(function(s){return s.done;}).length;},0);
 var totalSets=workout.reduce(function(a,ex){return a+(ex.sets||[]).length;},0);

 var exH;
 if(workout.length===0){
  exH='<div class="empty"><p class="emtt">Sin ejercicios</p><p class="emts">Añade ejercicios o aplica una plantilla</p></div>';
 } else {
  // Agrupar por músculo
  var groups={};
  var groupOrder=[];
  workout.forEach(function(ex){
   var muscle=ex.muscle||'Otros';
   if(!groups[muscle]){groups[muscle]=[];groupOrder.push(muscle);}
   groups[muscle].push(ex);
  });

  exH=groupOrder.map(function(muscle){
   var exList=groups[muscle];
   var totalEx=exList.length;
   var doneEx=exList.filter(function(ex){return ex.sets.length>0&&ex.sets.every(function(s){return s.done;});}).length;
   var allGroupDone=doneEx===totalEx&&totalEx>0;
   var isCollapsed=S.collapsedMuscle&&S.collapsedMuscle[muscle];

   // Si el grupo entero está hecho y no está explícitamente expandido: vista colapsada de grupo
   var headerStyle=allGroupDone
    ?'background:#0a140a;border:1px solid #142a14;'
    :'background:#141414;border:1px solid #1e1e1e;';
   var headerTextColor=allGroupDone?'#88b888':'#fff';
   var countColor=allGroupDone?'#558855':'#555';
   var chevron=isCollapsed?IC.chevD:IC.chevU;

   var header='<div style="'+headerStyle+'border-radius:10px;padding:9px 13px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;" onclick="togMuscleGroup(\''+muscle+'\')">'+
    '<div style="display:flex;align-items:center;gap:8px;">'+
    (allGroupDone?'<div style="background:#0c320c;color:#4CAF50;width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;">'+IC.check+'</div>':'')+
    '<span style="font-family:\'Barlow Condensed\',sans-serif;font-weight:800;font-size:15px;letter-spacing:0.5px;color:'+headerTextColor+';">'+muscle+'</span>'+
    '</div>'+
    '<div style="display:flex;align-items:center;gap:8px;">'+
    '<span style="font-size:11px;color:'+countColor+'">'+doneEx+'/'+totalEx+'</span>'+
    '<span style="color:'+countColor+';">'+chevron+'</span>'+
    '</div>'+
    '</div>';

   if(isCollapsed){
    return '<div style="margin-bottom:4px;">'+header+'</div>';
   }

   // Ordenar: pendientes primero, completados abajo
   var pending=[],completed=[];
   exList.forEach(function(ex){
    var allDone=ex.sets.length>0&&ex.sets.every(function(s){return s.done;});
    if(allDone)completed.push(ex);else pending.push(ex);
   });
   var sortedList=pending.concat(completed);

   return '<div style="margin-bottom:4px;">'+
    header+
    '<div style="padding-left:0;">'+sortedList.map(function(ex){return rExCard(ex);}).join('')+'</div>'+
    '</div>';
  }).join('');
 }

 return '<div class="card">'+
  '<div class="cal-hdr">'+
  '<button class="bi" onclick="pM()">'+IC.chevL+'</button>'+
  '<span class="cal-tit">'+MONTHS[m]+' '+y+'</span>'+
  '<button class="bi" onclick="nM()">'+IC.chevR+'</button>'+
  '</div>'+
  '<div class="cal-grid">'+cells+'</div>'+
  '</div>'+
  '<div class="dhdr">'+
  '<div style="flex:1"><div class="dtit">'+fmtD(sel)+'</div>'+
  '<div class="dmeta">'+(workout.length?workout.length+' ej · '+totalDone+'/'+totalSets+' series completadas':sel===today?'Hoy · sin entreno':'Sin entreno')+'</div></div>'+
  '<div style="display:flex;gap:5px;flex-shrink:0">'+
  '<button class="bs" onclick="oM(\'applyTpl\')">'+IC.tpl+' <span>Plantilla</span></button>'+
  '<button class="bp" onclick="oM(\'picker\',{ctx:\'calendar\'})">'+IC.plus+'</button>'+
  '</div></div>'+
  exH+
  (function(){
   var tpl=templatesForDate(sel,S.data.templates||[]);
   if(!tpl.length||workout.length>0)return'';
   if((S.data.dismissedRoutinePrompts||{})[sel])return'';
   var t=tpl[0];
   var extras=tpl.slice(1);
   var extrasH=extras.length?
    '<div style="font-size:10px;color:#777;margin-top:7px;line-height:1.5">o aplicar: '+extras.map(function(x){return '<span style="color:#aaa">'+x.name+'</span>';}).join(' · ')+'</div>'
    :'';
   var clr=t.color||'#FF3B3B';
   return '<div style="background:linear-gradient(135deg,#1a0a0a 0%,#0c0c0c 60%);border:1px solid #3a1818;border-left:4px solid '+clr+';border-radius:12px;padding:14px 14px;margin-bottom:14px;animation:slideUp .35s ease">'+
    '<div style="display:flex;align-items:center;gap:10px">'+
     '<div style="font-size:28px;line-height:1">💪</div>'+
     '<div style="flex:1">'+
      '<div style="font-size:10px;color:#aa1818;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:4px">📅 RUTINA DE HOY</div>'+
      '<div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:900;font-size:21px;color:#fff;letter-spacing:.5px;line-height:1.1">'+t.name+'</div>'+
      '<div style="font-size:11px;color:#888;margin-top:3px">'+t.exercises.length+' ejercicios configurados para este día</div>'+
      extrasH+
     '</div>'+
    '</div>'+
    '<div style="display:flex;gap:6px;margin-top:12px">'+
     '<button class="bp" style="flex:1;justify-content:center;padding:11px" onclick="applyTFromCal(\''+t.id+'\')">'+IC.check+' Aplicar rutina</button>'+
     '<button class="bs" style="padding:11px" onclick="dismissRutinaPrompt(\''+sel+'\')">Más tarde</button>'+
    '</div>'+
   '</div>';
  })()+
  '<div style="height:1px;background:#1e1e1e;margin:20px 0 14px"></div>'+
  '<div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:800;font-size:20px;color:#fff;letter-spacing:1px;margin-bottom:4px">Mis Rutinas</div>'+
  '<div style="font-size:11px;color:#555;margin-bottom:12px">Plantillas para aplicar rapidamente</div>'+
  rTplsInline();
}

function rExCard(ex){
 var done=ex.sets.filter(function(s){return s.done;}).length;
 var prog=ex.sets.length?done/ex.sets.length*100:0;
 var allDone=done===ex.sets.length&&ex.sets.length>0;
 var isExpanded=S.expandedEx&&S.expandedEx[ex.id];

 // Vista Colapsada para ejercicios terminados
 if(allDone && !isExpanded) {
  return '<div class="exc" style="padding:10px 13px; cursor:pointer; background:#0a140a; border:1px solid #142a14; margin-bottom:10px; transition:all 0.2s; display:flex; justify-content:space-between; align-items:center;" onclick="togExExpand(\''+ex.id+'\')">'+
   '<div style="display:flex; align-items:center; gap:10px;">'+
   '<div style="background:#0c320c; color:#4CAF50; width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center;">'+IC.check+'</div>'+
   '<div>'+
   '<div class="exn" style="color:#88b888; font-size:16px;">'+ex.name+'</div>'+
   '<div style="font-size:11px; color:#558855; margin-top:1px;">'+ex.sets.length+' series completadas</div>'+
   '</div></div>'+
   '<div style="color:#558855;">'+IC.chevD+'</div>'+
   '</div>';
 }

 var hist=getHist(ex.name,S.data.workouts);
 var allTimeRM=hist.length?Math.max.apply(null,hist.map(function(x){return x.rm;})):0;
 var lastRef=hist.length>=1?hist[hist.length-1]:null;
 var rows='';
 if(ex.sets.length>0){
  rows+='<div class="sh" style="grid-template-columns:28px 1fr 1fr 34px 30px"><span class="sl">Serie</span><span class="sl">KG</span><span class="sl">Reps</span><span class="sl" style="text-align:center">\u2713</span><span></span></div>';
  ex.sets.forEach(function(s,i){
   var thisRM=e1rm(s.weight||0,s.reps||1);
   var isPR=s.done&&allTimeRM>0&&thisRM>=allTimeRM;
   var sug=getSmartSuggestion(ex.name,i,S.data.workouts);
   rows+='<div class="sr'+(s.done?' done':'')+'" style="grid-template-columns:28px 1fr 1fr 34px 30px">'+
    '<span class="sn">'+(i+1)+'</span>'+
    '<div style="position:relative">'+
    '<input class="set-inp" id="sw-'+ex.id+'-'+i+'" type="text" inputmode="decimal" value="'+(s.weight||0)+'" onchange="updateSetW(\''+ex.id+'\','+i+',this.value)"/>'+
    (isPR?'<span class="pr-badge" style="position:absolute;top:-6px;right:-2px;z-index:1">PR</span>':'')+
    '</div>'+
    '<div style="position:relative">'+
    '<input class="set-inp" id="sr-'+ex.id+'-'+i+'" type="number" inputmode="numeric" min="0" value="'+(s.reps||0)+'"'+(sug?' placeholder="'+sug.reps+'"':'')+' onchange="updateSetR(\''+ex.id+'\','+i+',this.value)"/>'+
    (sug?'<button class="sug-chip" onclick="applySuggestion(\''+ex.id+'\','+i+','+sug.weight+','+sug.reps+')" title="Sem. pasada: '+sug.weight+'kg × '+sug.reps+' reps — click para aplicar">'+sug.reps+'</button>':'')+
    '</div>'+
    '<button class="ck'+(s.done?' done':'')+'" onclick="togSet(\''+ex.id+'\','+i+')">'+(s.done?IC.check:'')+'</button>'+
    '<button class="bism" style="color:#FF3B3B;padding:3px" onclick="removeSetFromEx(\''+ex.id+'\','+i+')">'+IC.trash+'</button>'+
    '</div>';
  });
 }
 var lastRefH=lastRef&&ex.sets.length>0?'<div style="font-size:10px;color:#3a3a3a;padding:5px 0;border-top:1px solid #1a1a1a;margin-top:6px">\u21ba \xdaltima sesi\xf3n: '+lastRef.w+'kg \xd7 '+lastRef.r+' reps (1RM ~'+lastRef.rm+'kg)</div>':'';
 var addSetBtn='<button class="bas" style="margin-top:8px" onclick="addSetToEx(\''+ex.id+'\')">'+IC.plus+' Agregar serie</button>';
 var topBtns='<div style="display:flex;gap:4px;align-items:center">'+
  (allDone ? '<button class="bism" style="color:#88b888; background:#142a14; border-radius:6px; padding:4px;" onclick="togExExpand(\''+ex.id+'\')">'+IC.chevU+'</button>' : '') +
  (ex.sets.length>0?'<button class="btn-all" onclick="togAllSets(\''+ex.id+'\')">'+( allDone?IC.check+' Hecho':'\u25a2 Todo')+'</button>':'')+
  '<button class="bism" style="color:#FF3B3B" onclick="delEx(\''+ex.id+'\')">'+IC.trash+'</button>'+
  '</div>';
 return '<div class="exc">'+
  '<div class="exch">'+
  '<div style="flex:1"><div class="exn">'+ex.name+'</div>'+
  (allTimeRM>0?'<div style="margin-top:2px;"><span style="font-size:10px;color:#555">1RM: '+allTimeRM+'kg</span></div>':'')+
  '</div>'+
  topBtns+
  '</div>'+
  (ex.sets.length>0?'<div class="pb"><div class="pf" style="width:'+prog+'%"></div></div>':'')+
  rows+lastRefH+
  addSetBtn+
  '</div>';
}
// ── RUTINAS INLINE ──
function rTplsInline(){
 var cards=S.data.templates.length===0
  ?'<div class="empty"><p class="emtt">Sin rutinas</p><p class="emts">Crea tu primera rutina abajo</p></div>'
  :S.data.templates.map(function(t){
   var clr=t.color||'#FF3B3B';
   var tags=t.exercises.map(function(e){return '<span class="etag" style="border-color:'+clr+';color:'+clr+'">'+e.name+'</span>';}).join('');
   var tDays=t.days||[];
   var daysH='';
   if(tDays.length){
    var sortedDays=tDays.slice().sort(function(a,b){return a-b;});
    var dayLabels=sortedDays.map(function(jsDay){return DAYS_LBL[jsDayToDispIdx(jsDay)];});
    daysH='<div style="display:flex;gap:3px;margin-top:6px;flex-wrap:wrap;align-items:center">'+
     '<span style="font-size:9px;color:#555;text-transform:uppercase;letter-spacing:.5px;margin-right:3px">Días:</span>'+
     sortedDays.map(function(jsDay){var lbl=DAYS_LBL[jsDayToDispIdx(jsDay)];return '<span style="font-size:10px;font-weight:800;color:#fff;background:'+clr+';padding:2px 6px;border-radius:5px;letter-spacing:.3px;font-family:\'Barlow Condensed\',sans-serif">'+lbl+'</span>';}).join('')+
     '</div>';
   }
   return '<div class="tc" style="border-left:4px solid '+clr+'">'+
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">'+
    '<div style="flex:1"><div class="tn">'+t.name+'</div><div class="tm">'+t.exercises.length+' ejercicios</div>'+daysH+'</div>'+
    '<div style="display:flex;gap:5px">'+
    '<button class="bp" style="padding:5px 10px;font-size:11px" onclick="applyTFromCal(\''+t.id+'\')">'+IC.check+' Aplicar</button>'+
    '<button class="bism" onclick="oM(\'editTpl\',\''+t.id+'\')">'+IC.edit+'</button>'+
    '<button class="bism" style="color:#FF3B3B" onclick="delTpl(\''+t.id+'\')">'+IC.trash+'</button>'+
    '</div></div><div>'+tags+'</div></div>';
  }).join('');
 return '<button class="bp bf" style="margin-bottom:12px" onclick="oM(\'newTpl\')">'+IC.plus+' Nueva Rutina</button>'+cards;
}
// ── EXERCISES TAB ──