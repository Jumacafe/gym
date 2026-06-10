// ══ STREAK ══
function calcStreak(w){
 var allDates=Object.keys(w).filter(function(k){return w[k]&&w[k].length>0;}).sort();
 if(!allDates.length)return 0;
 var lastDate=allDates[allDates.length-1];
 var today=dk(new Date());
 var daysSinceLast=(new Date(today)-new Date(lastDate))/86400000;
 if(daysSinceLast>7)return 0;
 var streak=0;
 var d=new Date(lastDate+'T12:00:00');
 for(var i=0;i<365;i++){
  var k=dk(d);
  if(w[k]&&w[k].length>0){streak++;d.setDate(d.getDate()-1);}
  else{
   var prev=new Date(d);prev.setDate(prev.getDate()-1);
   var pk=dk(prev);
   if(w[pk]&&w[pk].length>0){d=prev;}
   else break;
  }
 }
 return streak;
}

// ══ ANALYTICS ══
function getHist(name,w){
 var h=[];
 Object.keys(w).sort().forEach(function(date){
  (w[date]||[]).forEach(function(ex){
   if(ex.name===name&&ex.sets&&ex.sets.length){
    var doneSets=ex.sets.filter(function(s){return s.done;});
    if(!doneSets.length)return;
    var best=doneSets.reduce(function(b,s){var rm=e1rm(s.weight||0,s.reps||1);return rm>b.rm?{w:s.weight||0,r:s.reps||0,rm:rm}:b},{w:0,r:0,rm:0});
    var vol=doneSets.reduce(function(a,s){return a+(s.weight||0)*(s.reps||0);},0);
    h.push({date:date,w:best.w,r:best.r,rm:best.rm,vol:vol,sets:doneSets.length});
   }
  });
 });
 return h;
}
function getLastSets(name,w){
 var lastDate=null,lastSets=null;
 Object.keys(w).sort().forEach(function(date){
  (w[date]||[]).forEach(function(ex){
   if(ex.name===name&&ex.sets&&ex.sets.length){
    var doneSets=ex.sets.filter(function(s){return s.done;});
    if(!doneSets.length)return;
    if(!lastDate||date>lastDate){lastDate=date;lastSets=doneSets;}
   }
  });
 });
 return lastSets;
}
function getUsed(w){
 var map={};
 Object.keys(w).forEach(function(d){
  (w[d]||[]).forEach(function(ex){
   var doneSets=(ex.sets||[]).filter(function(s){return s.done;});
   if(!doneSets.length)return;
   if(!map[ex.name])map[ex.name]={name:ex.name,muscle:ex.muscle||'',count:0,best:{w:0,r:0,rm:0}};
   map[ex.name].count++;
   doneSets.forEach(function(s){var rm=e1rm(s.weight||0,s.reps||1);if(rm>map[ex.name].best.rm)map[ex.name].best={w:s.weight||0,r:s.reps||0,rm:rm};});
  });
 });
 return Object.values(map).sort(function(a,b){return b.count-a.count;});
}
function weekVol(w,wb){
 var now=new Date(),res=[];
 for(var wk=wb;wk>=0;wk--){
  var ws=new Date(now);ws.setDate(now.getDate()-((now.getDay()||7)-1)-wk*7);
  var sessions=0;
  for(var d=0;d<7;d++){var dd=new Date(ws);dd.setDate(dd.getDate()+d);if(w[dk(dd)]&&w[dk(dd)].length)sessions++;}
  res.push({lbl:wk===0?'Esta sem':ws.toLocaleDateString('es-ES',{day:'numeric',month:'short'}),vol:sessions});
 }
 return res;
}
function thisWk(w){
 var now=new Date();var dow=(now.getDay()||7)-1;
 var ws=new Date(now);ws.setDate(now.getDate()-dow);
 var se=0,sets=0,exs=0,lSe=0,lSets=0,lExs=0;
 for(var d=0;d<7;d++){
  var dd=new Date(ws);dd.setDate(dd.getDate()+d);var k=dk(dd);
  if(w[k]&&w[k].length){se++;(w[k]||[]).forEach(function(ex){exs++;ex.sets.filter(function(s){return s.done;}).forEach(function(){sets++;});});}
  var ld2=new Date(ws);ld2.setDate(ld2.getDate()-7+d);var k2=dk(ld2);
  if(w[k2]&&w[k2].length){lSe++;(w[k2]||[]).forEach(function(ex){lExs++;ex.sets.filter(function(s){return s.done;}).forEach(function(){lSets++;});});}
 }
 return{se:se,sets:sets,exs:exs,lSe:lSe,lSets:lSets,lExs:lExs};
}
function muscDist(w){
 var m={};Object.values(w).forEach(function(day){day.forEach(function(ex){var k=ex.muscle||'Otro';m[k]=(m[k]||0)+1;});});return m;
}
function genRecs(data){
 var w=data.workouts;
 var dates=Object.keys(w).filter(function(d){return w[d].length>0;}).sort();
 if(!dates.length)return[
  {ic:'🎯',ti:'Empieza hoy',tx:'Registra tu primer entreno para recibir analisis personalizados.'},
  {ic:'🥩',ti:'Proteina primero',tx:'Necesitas 1.6-2.2g de proteina por kg al dia. Sin proteina suficiente el entrenamiento no se convierte en musculo.'},
 ];
 var tips=[];
 var last30=dates.filter(function(d){return (new Date()-new Date(d+'T12:00:00'))/86400000<=30;}).length;
 if(last30<8)tips.push({ic:'📅',ti:'Frecuencia baja',tx:'Solo '+last30+' entrenos en 30 dias. Para hipertrofia optima apunta a 3-5 sesiones por semana.'});
 else if(last30>=24)tips.push({ic:'😴',ti:'Posible sobreentrenamiento',tx:last30+' entrenos en 30 dias es mucho. El musculo crece durante el descanso.'});
 else tips.push({ic:'✅',ti:'Frecuencia optima',tx:last30+' entrenos en 30 dias. Estas en la zona ideal. Mantente constante.'});
 var md=muscDist(w);
 if(!md['Piernas']&&dates.length>5)tips.push({ic:'🦵',ti:'No olvides las piernas',tx:'Las piernas son el 70% de tu masa muscular. Squat y peso muerto son fundamentales.'});
 var mainLifts=['Press de Banca Plano','Sentadilla Libre','Peso Muerto','Press Militar con Barra'];
 mainLifts.forEach(function(lift){
  var h=getHist(lift,w);if(h.length<3)return;
  var recentRM=Math.max.apply(null,h.slice(-3).map(function(x){return x.rm;}));
  var oldRM=Math.max.apply(null,h.slice(0,Math.min(3,h.length)).map(function(x){return x.rm;}));
  var gain=recentRM-oldRM;
  if(gain>0&&h.length>=4)tips.push({ic:'📈',ti:'Progresando: '+lift,tx:'Tu 1RM estimado subio '+gain+'kg ('+oldRM+'→'+recentRM+'kg). Sigue aumentando peso gradualmente.'});
  else if(h.length>=5&&gain<=0)tips.push({ic:'⚠️',ti:'Estancamiento: '+lift,tx:'Sin progresion en los ultimos '+h.length+' registros. Prueba cambiar rep range o añadir una semana de descarga.'});
 });
 var gts=[
  {ic:'💤',ti:'El sueno construye musculo',tx:'El 70% de la GH se libera durante el sueno. Con menos de 7h por noche el crecimiento muscular se reduce notablemente.'},
  {ic:'🔄',ti:'Semana de descarga',tx:'Cada 6-8 semanas haz una semana al 50-60% del volumen habitual. El sistema nervioso necesita recuperarse.'},
  {ic:'🎯',ti:'Conexion mente-musculo',tx:'Concentrarte en el musculo que trabajas puede aumentar su activacion hasta un 20-25%. Mueve el peso conscientemente.'},
  {ic:'🔁',ti:'Sobrecarga progresiva',tx:'El principio mas importante del entrenamiento: cada semana intenta hacer algo mas que la anterior.'},
  {ic:'🥗',ti:'Carbohidratos antes del entreno',tx:'Los carbos son el combustible del entrenamiento de fuerza. Una comida con arroz o avena 1-2h antes mejora el rendimiento.'},
 ];
 var gIdx=(dates.length+new Date().getDate())%gts.length;
 tips.push(gts[gIdx]);
 return tips.slice(0,6);
}