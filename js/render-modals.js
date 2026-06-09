// ══ RENDER MODALS ══
function rModal(modal){
 var title='',body='';
 if(modal.type==='picker'){
  var q=S.pf.q,muscle=S.pf.muscle;
  var allEx=allExercises();
  var filt=allEx.filter(function(e){return(muscle==='Todos'||e.m===muscle)&&(!q||e.n.toLowerCase().indexOf(q.toLowerCase())>=0||e.m.toLowerCase().indexOf(q.toLowerCase())>=0);});
  var chips=MUSCLES.map(function(m){return '<button class="mch'+(muscle===m?' on':'')+'" onclick="setPF(\'muscle\',\''+m+'\')">'+m+'</button>';}).join('');
  var items=filt.slice(0,50).map(function(e){return '<div class="eli" onclick="pickEx(\''+e.id+'\',\''+e.n.replace(/'/g,"\\'").replace(/"/g,'&quot;')+'\',\''+e.m+'\')"><div class="elix">'+e.i+'</div><div><div class="eln">'+e.n+(e.custom?'<span class="custom-badge">Custom</span>':'')+'</div><div class="els">'+e.m+' · '+e.q+'</div></div></div>';}).join('');
  title='Elegir Ejercicio';
  body='<input id="picker-search" class="ps" type="text" placeholder="🔍  Buscar..." value="'+q+'" oninput="setPF(\'q\',this.value)"/>'+
   '<div class="mc">'+chips+'</div><div class="el">'+(items||'<p style="color:#444;text-align:center;padding:16px">Sin resultados</p>')+'</div>';
 }
 if(modal.type==='editTplEx'){
  var name=modal.name,muscle=modal.muscle,exIdx=modal.exIdx;
  title='Editar series: '+name;
 
  var seriesList=window._cs.map(function(x,i){
   return '<div class="series-row" style="display:grid;grid-template-columns:40px 1fr 1fr 40px;gap:8px;align-items:center;padding:12px;background:#1a1a1a;border-radius:8px;border:1px solid #2a2a2a;margin-bottom:8px">'+
    '<div style="text-align:center;font-size:11px;color:#555;font-weight:600">S'+(i+1)+'</div>'+
    '<div><label style="display:block;font-size:9px;color:#555;margin-bottom:3px;text-transform:uppercase;letter-spacing:.5px">Kg</label><input type="number" inputmode="decimal" min="0.1" step="0.1" placeholder="0" value="'+(x.w||'')+'" oninput="_cs['+i+'].w=this.value" style="background:#0d0d0d;border:1px solid #2a2a2a;border-radius:6px;padding:6px;color:#eee;font-size:13px;width:100%;text-align:center;outline:none"/></div>'+
    '<div><label style="display:block;font-size:9px;color:#555;margin-bottom:3px;text-transform:uppercase;letter-spacing:.5px">Reps</label><input type="number" inputmode="numeric" min="1" placeholder="0" value="'+(x.r||'')+'" oninput="_cs['+i+'].r=this.value" style="background:#0d0d0d;border:1px solid #2a2a2a;border-radius:6px;padding:6px;color:#eee;font-size:13px;width:100%;text-align:center;outline:none"/></div>'+
    '<button class="bi" onclick="rmCS('+i+')" style="color:#FF3B3B;padding:6px;justify-content:center">'+IC.trash+'</button>'+
    '</div>';
  }).join('');
  body='<div style="margin-bottom:14px"><span class="mtag">'+muscle+'</span></div>'+
   '<label class="il" style="margin-top:8px">SERIES CONFIGURADAS</label>'+
   '<div style="max-height:360px;overflow-y:auto;margin-bottom:14px;padding:2px 0">'+seriesList+'</div>'+
   '<button class="bas" style="width:100%;margin-bottom:14px;color:#FF3B3B" onclick="addCS()">+ Agregar serie</button>'+
   '<button class="bp bf" onclick="saveTplExEdit('+exIdx+')">✅ Guardar Series</button>'+
   '<button class="bs bf" style="margin-top:6px;color:#aaa" onclick="cancelConfigEx()">← Volver sin guardar</button>';
 }
 if(modal.type==='configEx'){
  var name=modal.name,muscle=modal.muscle;
  title=name;
 
  var seriesList=window._cs.map(function(x,i){
   return '<div class="series-row" style="display:grid;grid-template-columns:40px 1fr 1fr 40px;gap:8px;align-items:center;padding:12px;background:#1a1a1a;border-radius:8px;border:1px solid #2a2a2a;margin-bottom:8px">'+
    '<div style="text-align:center;font-size:11px;color:#555;font-weight:600">S'+(i+1)+'</div>'+
    '<div><label style="display:block;font-size:9px;color:#555;margin-bottom:3px;text-transform:uppercase;letter-spacing:.5px">Kg</label><input type="number" inputmode="decimal" min="0.1" step="0.1" placeholder="0" value="'+(x.w||'')+'" oninput="_cs['+i+'].w=this.value" style="background:#0d0d0d;border:1px solid #2a2a2a;border-radius:6px;padding:6px;color:#eee;font-size:13px;width:100%;text-align:center;outline:none"/></div>'+
    '<div><label style="display:block;font-size:9px;color:#555;margin-bottom:3px;text-transform:uppercase;letter-spacing:.5px">Reps</label><input type="number" inputmode="numeric" min="1" placeholder="0" value="'+(x.r||'')+'" oninput="_cs['+i+'].r=this.value" style="background:#0d0d0d;border:1px solid #2a2a2a;border-radius:6px;padding:6px;color:#eee;font-size:13px;width:100%;text-align:center;outline:none"/></div>'+
    '<button class="bi" onclick="rmCS('+i+')" style="color:#FF3B3B;padding:6px;justify-content:center">'+IC.trash+'</button>'+
    '</div>';
  }).join('');
 
  var cancelBtn=modal.ctx==='template'
   ?'<button class="bs bf" style="margin-top:6px;color:#aaa" onclick="cancelConfigEx()">← Volver (cancelar este ejercicio)</button>'
   :modal.ctx==='calendar'
   ?'<button class="bs bf" style="margin-top:6px;color:#aaa" onclick="closeM()">Cancelar</button>'
   :'<button class="bs bf" style="margin-top:6px;color:#aaa" onclick="closeM()">Cancelar</button>';
  var btnText=modal.ctx==='calendar'?'✅ Guardar Series':'✅ Añadir Ejercicio';
  body='<div style="margin-bottom:14px"><span class="mtag">'+muscle+'</span></div>'+
   '<label class="il" style="margin-top:8px">SERIES CONFIGURADAS</label>'+
   '<div style="max-height:360px;overflow-y:auto;margin-bottom:14px;padding:2px 0">'+seriesList+'</div>'+
   '<button class="bas" style="width:100%;margin-bottom:14px;color:#FF3B3B" onclick="addCS()">+ Agregar serie</button>'+
   '<button class="bp bf" onclick="saveCE(\''+modal.ctx+'\','+(modal.exId?'\''+modal.exId+'\'':'null')+')">'+btnText+'</button>'+cancelBtn;
 }
 if(modal.type==='editEx'){
  var ex=(S.data.workouts[S.sel]||[]).filter(function(e){return e.id===modal.id;})[0];
  if(!ex){closeM();return '';}
  title='Editar Ejercicio';
  var rows=ex.sets.map(function(s,i){return '<div class="serr">'+
   '<span class="sn" style="color:#FF3B3B">'+(i+1)+'</span>'+
   '<input class="si" type="number" inputmode="decimal" min="0" value="'+(s.weight||0)+'" data-i="'+i+'" data-f="w"/>'+
   '<input class="si" type="number" inputmode="numeric" min="0" value="'+(s.reps||0)+'" data-i="'+i+'" data-f="r"/>'+
   '<button class="bism" style="color:#FF3B3B" onclick="rmER('+i+')">'+IC.trash+'</button></div>';}).join('');
  body='<label class="il">Nombre</label><input type="text" id="ename" value="'+ex.name+'"/>'+
   '<div class="serh"><span class="sl">Serie</span><span class="sl">KG</span><span class="sl">Reps</span><span></span></div>'+
   '<div id="erows">'+rows+'</div>'+
   '<button class="bas" onclick="addER()">'+IC.plus+' Añadir serie</button>'+
   '<button class="bp bf" onclick="saveEE(\''+ex.id+'\')">Guardar Cambios</button>';
 }
 if(modal.type==='applyTpl'){
  title='Aplicar Rutina';
  body=S.data.templates.length
   ?S.data.templates.map(function(t){return '<div class="tc" style="border-left:4px solid '+(t.color||'#FF3B3B')+';cursor:pointer;margin-bottom:9px" onclick="applyT(\''+t.id+'\')"><div class="tn">'+t.name+'</div><div class="tm" style="margin-top:4px">'+t.exercises.map(function(e){return e.name;}).join(' · ')+'</div></div>';}).join('')
   :'<p style="color:#444;text-align:center;padding:20px">Crea plantillas primero.</p>';
 }
 if(modal.type==='newTpl'||modal.type==='editTpl'){
  var draft=S.tplDraft;
  var isEdit=!!draft.id;
  title=isEdit?'Editar Rutina':'Nueva Rutina';
  var colorDots=COLORS.map(function(c){return '<button class="cdd'+(draft.color===c?' on':'')+'" style="background:'+c+'" onclick="draftColor(\''+c+'\')"></button>';}).join('');
  var exRows=draft.exercises.map(function(e,i){return rTEB(e,i);}).join('');
  body='<label class="il">Nombre</label>'+
   '<input type="text" id="tname" value="'+draft.name.replace(/"/g,'&quot;')+'" placeholder="Ej: Push Day" oninput="draftName(this.value)"/>'+
   '<label class="il">Color</label>'+
   '<div style="display:flex;gap:7px;margin-bottom:14px">'+colorDots+'</div>'+
   '<label class="il">Ejercicios ('+draft.exercises.length+')</label>'+
   '<div id="texs">'+exRows+'</div>'+
   (draft.exercises.length===0?'<div style="text-align:center;padding:12px;color:#444;font-size:12px">Añade ejercicios desde la lista</div>':'')+
   '<button class="bas" onclick="openPickerForTemplate()">'+IC.plus+' Añadir ejercicio</button>'+
   '<button class="bp bf" onclick="saveTpl()">'+(isEdit?'Guardar Cambios':'Crear Rutina')+'</button>';
 }
 if(modal.type==='addCustomEx'){
  title='Nuevo Ejercicio Personalizado';
  body='<label class="il">Nombre del ejercicio</label><input type="text" id="cexname" placeholder="Ej: Hip Thrust Unilateral"/>'+
   '<label class="il">Grupo muscular</label>'+
   '<div class="mc" id="cexmuscles" style="flex-wrap:wrap;margin-bottom:12px">'+
   MUSCLES.filter(function(m){return m!=='Todos'&&m!=='Personalizado';}).map(function(m){return '<button class="mch" onclick="selCexMuscle(this,\''+m+'\')">'+m+'</button>';}).join('')+
   '</div>'+
   '<input type="hidden" id="cexmuscle" value=""/>'+
   '<label class="il">Equipamiento</label>'+
   '<input type="text" id="cexequip" placeholder="Ej: Mancuernas, Maquina..."/>'+
   '<label class="il">Emoji (opcional)</label>'+
   '<input type="text" id="cexemoji" placeholder="💪" maxlength="2"/>'+
   '<button class="bp bf" onclick="saveCustomEx()">Crear Ejercicio</button>';
 }
 if(modal.type==='editGoals'){
  var goals=S.data.goals||{};
  title='Meta Semanal';
  body='<label class="il">Sesiones por semana</label>'+
   '<input class="si" type="number" inputmode="numeric" min="1" max="7" id="gsessions" value="'+(goals.weeklySessions||4)+'" style="margin-bottom:14px;font-size:24px;padding:14px"/>'+
   '<button class="bp bf" onclick="saveGoals()">✅ Guardar Meta</button>';
 }
 if(modal.type==='logWeight'){
  var bw=S.data.bodyWeight||[];
  var lastw=bw.length?bw[bw.length-1]:null;
  var histRows=bw.slice(-8).reverse().map(function(e){return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:#1a1a1a;border-radius:8px;margin-bottom:5px">'+
   '<span style="font-size:11px;color:#666">'+fmtS(e.date)+'</span>'+
   '<span style="font-family:\'Barlow Condensed\',sans-serif;font-weight:700;font-size:15px;color:#fff">'+e.kg+' kg</span>'+
   '<button class="bism" style="color:#FF3B3B" onclick="delBodyWeight(\''+e.date+'\')">'+IC.trash+'</button>'+
   '</div>';}).join('');
  title='Peso Corporal';
  body='<label class="il">Peso de hoy (kg)</label>'+
   '<input class="si" type="text" inputmode="decimal" id="bwkg" value="'+(lastw?lastw.kg:'')+'" placeholder="Ej: 78.5" style="font-size:24px;padding:14px;margin-bottom:14px"/>'+
   '<button class="bp bf" onclick="saveBodyWeight()">Guardar</button>'+
   (bw.length?'<div style="margin-top:16px"><div class="ct" style="margin-bottom:8px">Últimos registros</div>'+histRows+'</div>':'');
 }

 if(modal.type==='addCustomGoal'||modal.type==='editCustomGoal'){
  var goals2=S.data.goals||{};
  var cg=goals2.customGoals||[];
  var editing=modal.type==='editCustomGoal'?cg[modal.idx]:null;
  title=editing?'Editar Meta':'Nueva Meta Personalizada';
  var typeOptions=['kg','Repeticiones','Sesiones','Días','Series','Otro'].map(function(t){
   return '<button class="mch'+((editing?editing.unit:'kg')===t?' on':'')+'" onclick="selGoalUnit(this,\''+t+'\')">'+t+'</button>';
  }).join('');
  body='<label class="il">Nombre de la meta</label>'+
   '<input type="text" id="cg-name" placeholder="Ej: Banca 100kg..." value="'+(editing?editing.name.replace(/"/g,'&quot;'):'')+'" style="margin-bottom:12px"/>'+
   '<label class="il">Unidad / Tipo</label>'+
   '<div class="mc" style="flex-wrap:wrap;margin-bottom:12px" id="cg-units">'+typeOptions+'</div>'+
   '<input type="hidden" id="cg-unit" value="'+(editing?editing.unit:'kg')+'"/>'+
   '<label class="il">Objetivo (número)</label>'+
   '<input class="si" type="number" inputmode="decimal" min="0" id="cg-target" value="'+(editing?editing.target:'')+'" placeholder="Ej: 100" style="font-size:22px;padding:12px;margin-bottom:12px"/>'+
   '<label class="il">Progreso actual</label>'+
   '<input class="si" type="number" inputmode="decimal" min="0" id="cg-current" value="'+(editing?editing.current||0:0)+'" placeholder="0" style="font-size:22px;padding:12px;margin-bottom:14px"/>'+
   '<button class="bp bf" onclick="saveCustomGoal('+(editing?modal.idx:-1)+')">'+(editing?'Guardar Cambios':'Crear Meta')+'</button>';
 }
 return '<div class="ov" id="ov" onclick="if(event.target.id===\'ov\')closeM()">'+
  '<div class="md">'+
  '<div class="mdh"><span class="mdt">'+title+'</span><button class="bi" onclick="closeM()">'+IC.close+'</button></div>'+
  '<div class="mdb">'+body+'</div>'+
  '</div></div>';
}

function rTEB(e,i){
 return '<div class="teb" id="tex-'+i+'">'+
  '<div style="display:flex;gap:7px;align-items:center">'+
  '<div style="flex:1">'+
  '<div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:700;font-size:14px;color:#fff">'+(e.name||'Ejercicio')+'</div>'+
  '<div style="font-size:10px;color:#555;margin-top:1px">'+(e.muscle||'')+'</div>'+
  '</div>'+
  '<button class="bism" style="color:#FF3B3B;margin-left:4px" onclick="rmTex('+i+')">'+IC.trash+'</button>'+
  '</div>'+
  '</div>';
}
