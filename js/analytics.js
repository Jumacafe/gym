// ══ ROUTINE DAYS ══
// Etiquetas y orden de días en español (Lunes primero)
var DAYS_LBL=['L','M','X','J','V','S','D'];
var DAYS_FULL=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

// displayIdx (0=Lunes..6=Domingo) → JS getDay (0=Dom..6=Sáb)
function dispIdxToJsDay(idx){return idx===6?0:idx+1;}
// JS getDay → displayIdx
function jsDayToDispIdx(jsDay){return jsDay===0?6:jsDay-1;}

// Devuelve las plantillas asignadas al día de la semana de dateKey
function templatesForDate(dateKey,templates){
 if(!templates||!dateKey)return[];
 var jsDay=new Date(dateKey+'T12:00:00').getDay();
 return templates.filter(function(t){return(t.days||[]).indexOf(jsDay)>=0;});
}

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

// ══ SMART SUGGESTION ══
// Busca la última sesión con series HECHAS del ejercicio en los últimos 7 días
// (excluye el día actual para no sugerirte los sets que acabas de hacer)
// Devuelve {weight, reps} para el set en la posición setIndex, o null
function getSmartSuggestion(name, setIndex, workouts){
 if(!workouts||!name)return null;
 var todayKey=dk(new Date());
 var dates=Object.keys(workouts).filter(function(d){
  if(d===todayKey)return false;
  if(!workouts[d]||workouts[d].length===0)return false;
  var diff=Math.floor((Date.now()-new Date(d+'T12:00:00').getTime())/86400000);
  return diff>=1&&diff<=7;
 }).sort();
 var lastSets=null;
 dates.forEach(function(d){
  (workouts[d]||[]).forEach(function(ex){
   if(ex.name===name){
    var done=(ex.sets||[]).filter(function(s){return s.done;});
    if(done.length>0)lastSets=done;
   }
  });
 });
 if(!lastSets||!lastSets[setIndex])return null;
 var last=lastSets[setIndex];
 return {weight:last.weight||0,reps:last.reps||0};
}

// ══ INTELLIGENT PROGRESSION (doble progresión) ══
// Rango de reps por defecto (hipertrofia). Subir peso solo al alcanzar el tope.
var REP_RANGE={min:8,max:12};

// Incremento de peso (kg) por ejercicio cuando se llega al tope del rango.
// Valores conservadores (parte baja del rango que da la guía) — "son referencias, no obligaciones"
var EXERCISE_INCREMENT={
 // Bíceps — +1–2 kg
 'Curl con Barra':1,'Curl con Mancuernas':1,'Curl Martillo':1,'Curl en Polea Baja':1,
 'Curl Concentrado':1,'Curl en Banco Scott':1,'Curl Inclinado Mancuernas':1,
 'Curl con Barra EZ':1,'Curl Spider':1,'Curl en Polea Alta':1,'Curl con Banda Elastica':1,
 'Curl Invertido':1,'Curl en Banco Predicador con Mancuernas':1,'Curl Inclinado Alternado con Mancuernas':1,
 'Curl con Apoyo de Hombro en Banco':1,'Curl Sentado con Mancuernas':1,'Zottman Curl':1,
 'Curl de Arrastre':1,'Curl Bayesian':1,'Curl Crucifijo':1,'Curl en Polea con Agarre Ancho':1,
 'Curl 21s':1,'Curl Trasnuca en Polea':1,
 // Tríceps — +1–2,5 kg
 'Press Frances':2,'Extension Polea Alta':2,'Fondos en Banco':2,'Press Cerrado':2,
 'Patada de Triceps':2,'Extension Triceps Sobre Cabeza':2,'Extension Polea Cuerda':2,
 'Press Frances con Mancuernas':2,'Extension de Triceps en Polea Baja':2,
 'Fondos en Paralelas para Triceps':2,'Press Frances en Polea':2,'Extension Unilateral en Polea':2,
 'JM Press':2,'Diamond Push-ups':2,'Press Cerrado con Mancuernas':2,'Tate Press':2,
 'Tricep Kickback en Polea':2,'Skull Crusher con Mancuerna':2,'Fondos en Paralelas Lastrados':2,
 'Press Frances con Agarre Neutro':2,'Extension con Mancuerna Tras Nuca':2,'Triceps en Polea con Agarre Inverso':2,
 // Elevaciones laterales — +0,5–1 kg
 'Elevaciones Laterales':0.5,'Elevaciones Laterales Polea':0.5,'Elevaciones Laterales en Maquina':0.5,
 'Lateral Raises Inclinadas':0.5,'Lateral Raises con Polea Cruzada':0.5,
 'Elevaciones Frontales':0.5,'Elevaciones Frontales con Disco':0.5,
 'Y Raise con Mancuernas':0.5,
 // Pecho — +2,5–5 kg
 'Press de Banca Plano':2.5,'Press de Banca Inclinado':2.5,'Press de Banca Declinado':2.5,
 'Press con Mancuernas Plano':2.5,'Press con Mancuernas Inclinado':2.5,
 'Press con Mancuernas Declinado':2.5,'Aperturas con Mancuernas':2.5,
 'Aperturas en Polea Cruzada':2.5,'Press en Maquina Pecho':2.5,'Fondos en Paralelas':2.5,
 'Pullover con Mancuerna':2.5,'Peck Deck':2.5,'Aperturas Inclinadas en Polea':2.5,
 'Press Inclinado en Polea':2.5,'Flexiones':2.5,'Flexiones con Aplauso':2.5,
 'Press Neutro con Mancuernas':2.5,'Press de Banca Agarre Neutro':2.5,'Fondos Lastrados':2.5,
 'Flexiones Declinadas':2.5,'Flexiones Diamante':2.5,'Press Svend':2.5,
 'Press de Banca con Bandas':2.5,
 // Espalda — +2,5–5 kg (peso muerto es más)
 'Peso Muerto':5,'Dominadas':2.5,'Jalon al Pecho':2.5,'Jalon Agarre Cerrado':2.5,
 'Remo con Barra':2.5,'Remo con Mancuerna':2.5,'Remo en Polea Baja':2.5,'Remo en Maquina':2.5,
 'Pull-Over en Polea':2.5,'Hiperextensiones':2.5,'Encogimientos con Barra':2.5,
 'Remo Invertido':2.5,'Dominadas Supinas':2.5,'Remo Pendlay':2.5,
 'Jalon al Pecho Agarre Reverso':2.5,'Remo con Mancuerna a Dos Brazos':2.5,
 'Encogimientos con Mancuernas':2.5,'Buenos Dias':2.5,'Remo con Banda Elastica':2.5,
 'Remo en T':2.5,'Remo con Agarre Ancho en Polea':2.5,'Rack Pull':5,'Yates Row':2.5,
 'Seal Row':2.5,'Dominadas Lastradas':2.5,'Encogimientos en Maquina Smith':2.5,
 'Remo a Un Brazo en Polea':2.5,'Dominadas con Agarre Neutro':2.5,
 // Hombros — +2,5–5 kg (laterales son excepción)
 'Press Militar con Barra':2.5,'Press Hombro con Mancuernas':2.5,'Vuelos Posteriores':0.5,
 'Face Pull':1,'Arnold Press':2.5,'Press Hombro Maquina':2.5,
 'Press Militar Sentado con Barra':2.5,'Press Militar con Mancuernas':2.5,
 'Remo al Menton':2.5,'Remo al Menton con Mancuernas':2.5,
 'Vuelos Posteriores en Maquina Peck Deck':0.5,'Press Z':2.5,
 'Flexiones Pike':2.5,'Flexiones en Pared':2.5,
 'Press de Hombro con Kettlebell':2.5,'Cuban Press':1,'Press Detras de Nuca':2.5,
 'Press de Hombro Landmine':2.5,
 // Piernas — +2,5–5 kg (prensa más)
 'Sentadilla Libre':2.5,'Sentadilla Goblet':2.5,'Prensa de Piernas':5,
 'Extension de Cuadriceps':2.5,'Curl Femoral Tumbado':2.5,'Curl Femoral de Pie':2.5,
 'Peso Muerto Rumano':2.5,'Zancadas con Mancuernas':2.5,'Sentadilla Bulgara':2.5,
 'Sentadilla Hack':5,'Step-Up':2.5,'Sentadilla Frontal':2.5,'Peso Muerto Sumo':2.5,
 'Zancadas Caminando':2.5,'Curl Femoral Sentado':2.5,'Sentadilla con Salto':2.5,
 'Nordicos de Isquiotibiales':2.5,'Sentadilla en Cajón':2.5,'Sentadilla Zercher':2.5,
 'Sissy Squat':2.5,'Leg Press Horizontal':5,'Cossack Squat':2.5,
 'Hiperextensiones Inversas':2.5,'Glute Ham Raise':2.5,'Estocada Lateral':2.5,
 'Curtsy Lunge':2.5,'RDL con Mancuernas':2.5,'RDL a Una Pierna':2.5,
 'Extension de Cadera':2.5,'Peso Muerto con Deficiencia':5,
 'Sentadilla Sumo en Smith':2.5,'Sentadilla con Banda':2.5,
 'Press de Piernas a Una Pierna':5,'Curl Femoral con Mancuerna':2.5,
 'Sentadilla en Smith':2.5,'Peso Muerto Rumano en Smith':2.5,
 // Gemelos — +5–10 kg
 'Elevacion de Talones de Pie':5,'Elevacion de Talones Sentado':5,
 'Elevacion Talones con Barra':5,'Elevacion de Talones con Mancuernas':5,
 'Elevacion de Talones Unilateral':5,'Saltos de Pantorrilla':5,
 'Donkey Calf Raise':5,'Elevacion de Talones en Prensa':5,
 'Elevacion de Tibial Anterior':1,'Elevacion de Talones en Smith':5,'Saltos al Cajón':5,
};

function getIncrement(name){
 return (EXERCISE_INCREMENT[name]!==undefined)?EXERCISE_INCREMENT[name]:2.5;
}

// Redondea a 0.5 kg (microcargas)
function round05(n){return Math.round(n*2)/2;}

// ══ WARM-UP GENERATION ══
// Genera series de calentamiento progresivo para un peso objetivo
function generateWarmups(workingWeight, exerciseName){
 if(!workingWeight||workingWeight<=0)return[];
 var compoundKws=['Press de Banca','Press Banca','Sentadilla','Peso Muerto','Hack','Prensa','Remo con Barra','RDL','Sentadilla Smith','Sentadilla Frontal'];
 var en=(exerciseName||'').toLowerCase();
 var isCompound=compoundKws.some(function(k){return en.indexOf(k.toLowerCase())>=0;});
 var steps=isCompound?[
  {pct:0.4,reps:10},
  {pct:0.6,reps:6},
  {pct:0.8,reps:3},
  {pct:0.9,reps:1}
 ]:[
  {pct:0.5,reps:10},
  {pct:0.75,reps:5}
 ];
 return steps.map(function(step){
  return{
   weight:round05(workingWeight*step.pct),
   reps:step.reps,
   warmUp:true,
   done:false
  };
 });
}

// Sugerencia de progresión inteligente para el set `setIndex` de un ejercicio.
// Busca la última sesión con sets HECHOS (cualquier fecha, no solo 7 días) y aplica
// progresión doble: misma carga → +1 rep → tope del rango → +peso → volver al piso del rango.
function getProgressionSuggestion(name, setIndex, workouts){
 if(!workouts||!name)return null;
 var todayKey=dk(new Date());
 var dates=Object.keys(workouts).filter(function(d){
  if(d===todayKey)return false; // no sugerirte tus propios sets de hoy
  if(!workouts[d]||!workouts[d].length)return false;
  return workouts[d].some(function(ex){return ex.name===name;});
 }).sort(); // asc

 // Buscar la sesión más reciente que tenga sets HECHOS para este ejercicio
 var lastSets=null;
 for(var i=dates.length-1;i>=0;i--){
  var ex=(workouts[dates[i]]||[]).find(function(e){return e.name===name;});
  if(!ex)continue;
  var done=(ex.sets||[]).filter(function(s){return s.done;});
  if(done.length>0){lastSets=done;break;}
 }
 if(!lastSets||!lastSets[setIndex])return null;
 var last=lastSets[setIndex];
 if(!last.weight||last.weight<=0)return null;
 var inc=getIncrement(name);
 var min=REP_RANGE.min,max=REP_RANGE.max;

 if(last.reps>=max){
  // Tope del rango → subimos peso, volvemos al piso
  return {
   weight:round05(last.weight+inc),
   reps:min,
   type:'weight_up',
   reason:'Llegaste a '+max+' reps en tu última sesión → toca subir peso (+'+inc+'kg). Volvés al piso del rango ('+min+') para construir de nuevo.'
  };
 } else if(last.reps>=min){
  // Dentro del rango → mismo peso, +1 rep
  return {
   weight:last.weight,
   reps:Math.min(last.reps+1,max),
   type:'reps_up',
   reason:'Mismo peso ('+last.weight+'kg). Intentá +1 rep (última vez hiciste '+last.reps+', meta: '+(last.reps+1)+').'
  };
 } else {
  // Por debajo del rango → mismo peso, +1 rep hasta llegar al piso
  return {
   weight:last.weight,
   reps:Math.min(last.reps+1,min),
   type:'reps_up',
   reason:'Por debajo del rango ('+min+'-'+max+'). Construyendo reps hasta '+min+' con '+last.weight+'kg antes de plantear subir peso.'
  };
 }
}

// ══ GYM TIME STATS ══
// Devuelve la duración de una sesión en minutos (0 si no hay datos)
function sessionDurationMin(dateKey,wt){
 var t=wt&&wt[dateKey];
 if(!t||!t.startedAt||!t.endedAt)return 0;
 var ms=new Date(t.endedAt)-new Date(t.startedAt);
 if(isNaN(ms)||ms<=0)return 0;
 return Math.round(ms/60000);
}

// Devuelve todas las sesiones con duración > 0, ordenadas de más reciente a más antigua
function getSessionsWithTime(wt){
 var out=[];
 Object.keys(wt).forEach(function(k){
  var t=wt[k];
  if(!t||!t.startedAt||!t.endedAt)return;
  var ms=new Date(t.endedAt)-new Date(t.startedAt);
  if(isNaN(ms)||ms<=0)return;
  out.push({date:k,startedAt:t.startedAt,endedAt:t.endedAt,duration:Math.round(ms/60000)});
 });
 return out.sort(function(a,b){return b.date.localeCompare(a.date);});
}

// Promedio de duración por sesión en los últimos N días (en minutos)
function dailyAvgDuration(wt,days){
 var cutoff=new Date();cutoff.setDate(cutoff.getDate()-days);
 var cutoffKey=dk(cutoff);
 var sessions=getSessionsWithTime(wt).filter(function(s){return s.date>=cutoffKey;});
 if(!sessions.length)return 0;
 var total=sessions.reduce(function(a,s){return a+s.duration;},0);
 return Math.round(total/sessions.length);
}

// Promedio semanal de tiempo total en gym (en minutos) — últimas N semanas
function weeklyAvgDuration(wt,weeks){
 if(!weeks||weeks<1)return 0;
 var now=new Date();var dow=(now.getDay()||7)-1;
 var total=0;
 for(var i=0;i<weeks;i++){
  var ws=new Date(now);ws.setDate(now.getDate()-dow-i*7);
  var we=new Date(ws);we.setDate(we.getDate()+7);
  var weekSessions=getSessionsWithTime(wt).filter(function(s){
   var d=new Date(s.date+'T12:00:00');
   return d>=ws&&d<we;
  });
  total+=weekSessions.reduce(function(a,s){return a+s.duration;},0);
 }
 return Math.round(total/weeks);
}

// Tiempo total acumulado en minutos
function totalGymTime(wt){
 return getSessionsWithTime(wt).reduce(function(a,s){return a+s.duration;},0);
}

// ══ RESUMEN MENSUAL ══
// Devuelve un resumen por mes con sesiones, series, volumen, tiempo y progresión por ejercicio
// workoutTimes se pasa aparte para incluir el tiempo total
function monthlySummary(workouts, yearMonth, workoutTimes){
 if(!workouts||!yearMonth)return null;
 var sessions=Object.keys(workouts).filter(function(d){
  return d.substring(0,7)===yearMonth&&workouts[d]&&workouts[d].length>0;
 }).sort();
 if(!sessions.length)return null;
 var wt=workoutTimes||{};

 // Agrupar ejercicios por nombre con su mejor 1RM en primera y última sesión del mes
 var byEx={};
 sessions.forEach(function(date,idx){
  (workouts[date]||[]).forEach(function(ex){
   var doneSets=(ex.sets||[]).filter(function(s){return s.done&&!s.warmUp;});
   if(!doneSets.length)return;
   var best=doneSets.reduce(function(b,s){
    var rm=e1rm(s.weight||0,s.reps||1);
    return rm>b.rm?{w:s.weight||0,r:s.reps||0,rm:rm}:b;
   },{w:0,r:0,rm:0});
   if(!byEx[ex.name])byEx[ex.name]={name:ex.name,muscle:ex.muscle||'',firstIdx:idx,lastIdx:idx,first:best,last:best,sessions:0,sets:0};
   byEx[ex.name].sessions++;
   byEx[ex.name].sets+=doneSets.length;
   if(idx<byEx[ex.name].firstIdx){byEx[ex.name].firstIdx=idx;byEx[ex.name].first=best;}
   if(idx>byEx[ex.name].lastIdx){byEx[ex.name].lastIdx=idx;byEx[ex.name].last=best;}
  });
 });

 // Stats globales del mes
 var totalSets=sessions.reduce(function(a,d){
  return a+(workouts[d]||[]).reduce(function(b,ex){
   return b+(ex.sets||[]).filter(function(s){return s.done&&!s.warmUp;}).length;
  },0);
 },0);
 var totalVolume=sessions.reduce(function(a,d){
  return a+(workouts[d]||[]).reduce(function(b,ex){
   return b+(ex.sets||[]).filter(function(s){return s.done&&!s.warmUp;}).reduce(function(c,s){return c+(s.weight||0)*(s.reps||0);},0);
  },0);
 },0);
 var totalMinutes=sessions.reduce(function(a,d){
  var t=wt[d];
  if(!t||!t.startedAt||!t.endedAt)return a;
  var min=Math.round((new Date(t.endedAt)-new Date(t.startedAt))/60000);
  return a+(min>0?min:0);
 },0);

 // Progresión por ejercicio
 var exArr=Object.values(byEx).map(function(e){
  var pKg=e.first&&e.last?(e.last.rm-e.first.rm):0;
  var pPct=e.first&&e.first.rm>0?Math.round((e.last.rm-e.first.rm)/e.first.rm*1000)/10:0;
  return{
   name:e.name,muscle:e.muscle,
   startW:e.first?e.first.w:0,startR:e.first?e.first.r:0,startRm:e.first?e.first.rm:0,
   endW:e.last?e.last.w:0,endR:e.last?e.last.r:0,endRm:e.last?e.last.rm:0,
   progressKg:Math.round(pKg*10)/10,
   progressPct:pPct,
   sessions:e.sessions,sets:e.sets
  };
 });
 exArr.sort(function(a,b){return b.progressPct-a.progressPct;});

 return{
  month:yearMonth,
  sessions:sessions.length,
  totalSets:totalSets,
  totalVolume:totalVolume,
  totalMinutes:totalMinutes,
  exercises:exArr
 };
}

function availableMonths(workouts){
 if(!workouts)return[];
 var months={};
 Object.keys(workouts).forEach(function(d){
  if(workouts[d]&&workouts[d].length>0){
   months[d.substring(0,7)]=true;
  }
 });
 return Object.keys(months).sort().reverse(); // más reciente primero
}

function fmtMonthLabel(ym){
 var parts=ym.split('-');
 var monthNames=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
 return monthNames[parseInt(parts[1])-1]+' '+parts[0];
}


// MEV (mínimo efectivo) / MAV (máximo adaptativo) / MRV (máximo recuperable) por semana
// Referencia: Renaissance Periodization (Dr. Mike Israetel) — rangos para intermedio
var VOLUME_TARGETS={
 'Pecho':     {mev:8,  mav:[14,18], mrv:22},
 'Espalda':   {mev:8,  mav:[16,20], mrv:25},
 'Piernas':   {mev:10, mav:[16,20], mrv:25},
 'Hombros':   {mev:6,  mav:[14,18], mrv:22},
 'Biceps':    {mev:6,  mav:[12,14], mrv:18},
 'Triceps':   {mev:6,  mav:[12,14], mrv:18},
 'Gluteos':   {mev:6,  mav:[14,18], mrv:22},
 'Pantorrillas':{mev:8,mav:[14,16], mrv:22},
 'Core':      {mev:4,  mav:[10,12], mrv:16}
};

// Factor de efectividad según RIR (cuánto cuenta como serie "dura")
// RIR 0-1: full (1.0) · RIR 2: 0.85 · RIR 3: 0.5 · RIR 4-5: 0.25 (junk)
function rirFactor(rir){
 if(rir===undefined||rir===null||rir==='')return 0.85; // default conservador
 if(rir<=1)return 1.0;
 if(rir===2)return 0.85;
 if(rir===3)return 0.5;
 return 0.25;
}

// Calcula el volumen semanal por músculo (últ. N días) en series efectivas
// Devuelve {musculo: {sets, hardSets, target: VOLUME_TARGETS[musculo]}}
function weeklyVolumeByMuscle(workouts,days){
 days=days||7;
 var cutoff=new Date();cutoff.setDate(cutoff.getDate()-days);
 var cutoffKey=dk(cutoff);
 var counts={};
 Object.keys(workouts).forEach(function(dateKey){
  if(dateKey<cutoffKey)return;
  (workouts[dateKey]||[]).forEach(function(ex){
   var m=ex.muscle||'Otro';
   if(!counts[m])counts[m]={sets:0,hardSets:0};
   (ex.sets||[]).forEach(function(s){
    if(!s.done||s.warmUp)return;
    counts[m].sets++;
    counts[m].hardSets+=rirFactor(s.rir);
   });
  });
 });
 // Merge con targets
 Object.keys(counts).forEach(function(m){
  counts[m].target=VOLUME_TARGETS[m]||null;
  counts[m].hardSets=Math.round(counts[m].hardSets*10)/10;
 });
 return counts;
}

// Determina el estado del volumen: bajo / óptimo / alto / mr
function volumeStatus(hardSets,target){
 if(!target)return{label:'Sin datos',color:'#555',zone:'unknown'};
 if(hardSets<target.mev)return{label:'BAJO · suma series',color:'#FF8C00',zone:'low'};
 if(hardSets>=target.mav[0]&&hardSets<=target.mav[1])return{label:'ÓPTIMO · zona MAV',color:'#4CAF50',zone:'optimal'};
 if(hardSets>target.mav[1]&&hardSets<target.mrv)return{label:'PRODUCTIVO · por encima de MAV',color:'#FFD700',zone:'productive'};
 if(hardSets>=target.mrv)return{label:'⚠ MÁXIMO RECUPERABLE · riesgo de overreaching',color:'#FF3B3B',zone:'max'};
 if(hardSets<target.mav[0]&&hardSets>=target.mev)return{label:'EN MAV · podés sumar más',color:'#00D084',zone:'building'};
 return{label:'OK',color:'#888',zone:'ok'};
}

// ══ DETECCIÓN DE MESETA / DELOAD ══
// Devuelve ejercicios estancados (3+ semanas sin progresar)
function getStagnantExercises(workouts, weeks){
 weeks=weeks||3;
 var dateKeys=Object.keys(workouts).filter(function(d){return workouts[d]&&workouts[d].length>0;}).sort();
 if(dateKeys.length<2)return[];
 var stagnation={};
 // Para cada ejercicio, revisar últimas `weeks` sesiones con sets hechos
 var byExName={};
 dateKeys.forEach(function(dateKey){
  (workouts[dateKey]||[]).forEach(function(ex){
   if(!ex.name)return;
   var done=(ex.sets||[]).filter(function(s){return s.done&&!s.warmUp;});
   if(!done.length)return;
   if(!byExName[ex.name])byExName[ex.name]=[];
   // Mejor set de la sesión (por 1RM estimado)
   var best=done.reduce(function(b,s){var rm=e1rm(s.weight||0,s.reps||1);return rm>b.rm?{w:s.weight,r:s.reps,rm:rm}:b;},{w:0,r:0,rm:0});
   byExName[ex.name].push({date:dateKey,best:best});
  });
 });
 Object.keys(byExName).forEach(function(name){
  var sessions=byExName[name];
  if(sessions.length<weeks)return;
  // Comparar mejor 1RM de las últimas `weeks` sesiones vs las `weeks` anteriores
  var recent=sessions.slice(-weeks);
  var older=sessions.slice(-weeks*2,-weeks);
  if(older.length<2)return;
  var recentBest=Math.max.apply(null,recent.map(function(s){return s.best.rm;}));
  var olderBest=Math.max.apply(null,older.map(function(s){return s.best.rm;}));
  if(recentBest<=olderBest){
   // Estancado o retrocedió
   stagnation[name]={recentBest:recentBest,olderBest:olderBest,sessionsTested:recent.length,weeksStagnant:weeks};
  }
 });
 return stagnation;
}

// ══ LESIONES ══
// Devuelve lesiones activas (sin fecha de resolución) que afectan un músculo dado
function activeInjuriesFor(data,muscle){
 return (data.injuries||[]).filter(function(inj){
  if(inj.resolved)return false;
  return inj.muscle===muscle;
 });
}

// ¿Algún ejercicio reciente usó demasiada carga en un músculo lesionado?
function checkInjuryRisk(data,muscle){
 var injuries=activeInjuriesFor(data,muscle);
 if(!injuries.length)return null;
 // Buscar sesiones recientes en ese músculo
 var today=new Date();
 var cutoffKey=dk(new Date(today.getTime()-7*86400000));
 var recentSets=0;
 Object.keys(data.workouts).forEach(function(dateKey){
  if(dateKey<cutoffKey)return;
  (data.workouts[dateKey]||[]).forEach(function(ex){
   if(ex.muscle!==muscle)return;
   (ex.sets||[]).forEach(function(s){if(s.done&&!s.warmUp)recentSets++;});
  });
 });
 if(recentSets>10)return{injuries:injuries,recentSets:recentSets,risk:'high'};
 if(recentSets>6)return{injuries:injuries,recentSets:recentSets,risk:'moderate'};
 return null;
}

// Formatea minutos a "Xh Ymin" o "Xmin"
function fmtDuration(min){
 if(!min||min<=0)return'0min';
 if(min<60)return min+'min';
 var h=Math.floor(min/60);var m=min%60;
 return h+'h '+(m?m+'min':'');
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