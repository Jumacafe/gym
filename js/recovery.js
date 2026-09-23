// ══ MUSCLE RECOVERY HEAT MAP ══
// Modelo simple y transparente: cada set efectivo (hecha, no warmup, no drop)
// causa una "fatiga" instantánea que decae exponencialmente con el tiempo.
// La fatiga total de un músculo = suma de las fatigas de los últimos N días.
// El % de recuperación se deriva de esa fatiga.
//
// Notas:
//   • warmups y dropsets no cuentan como carga (solo las series "trabajadas").
//   • Si el usuario no entrenó un músculo en N días, su fatiga cae a ~0 → 100% recuperado.
//   • Volumen modula la magnitud: a más peso × reps, más fatiga.
//   • Grupos grandes tardan más en recuperarse (half-life mayor).

// Half-life de recuperación en DÍAS por músculo. Grupos grandes/pequeños según literatura.
// Valores conservadores: pecho/espalda/piernas ~3 días, brazos ~1.5, pantorrillas ~1.
var RECOVERY_HALFLIFE={
 'Pecho':3.0,'Espalda':3.0,'Piernas':3.5,'Gluteos':3.0,
 'Hombros':2.0,'Biceps':1.5,'Triceps':1.5,'Core':1.5,
 'Pantorrillas':1.0,'Cardio':1.0
};

// Lista de músculos que mostramos en el heat map (mismo orden siempre).
var RECOVERY_MUSCLES=['Pecho','Espalda','Hombros','Biceps','Triceps','Piernas','Gluteos','Pantorrillas','Core'];

// Calcula la fatiga instantánea de un set efectivo.
// Heurística: 1 base + 0.0008 × (peso × reps). Una serie de banca 80kg×8 = 1 + 0.5 ≈ 1.5.
// Drop sets y warmups devuelven 0 (no cuentan como carga).
function setFatigue(s){
 if(!s||!s.done)return 0;
 if(s.warmUp)return 0;
 if(s.dropSet)return 0;
 var w=Math.max(0,parseFloat(s.weight)||0);
 var r=Math.max(0,parseInt(s.reps)||0);
 var load=w*r; // kg·reps totales movidos
 return 1+load*0.0008;
}

// Devuelve para cada músculo el % de recuperación actual (0–100) y la fatiga total.
// work: S.data.workouts (formato long).
// now: fecha de referencia (default hoy).
function calcRecovery(work,now){
 now=now||new Date();
 // Construimos "hoy" y los dateKeys como fechas locales a mediodía para evitar
 // drift por zonas horarias (dk usa UTC; en zonas negativas puede "perder" un día).
 var today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12,0,0);
 var todayKey=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
 var out={};

 // Inicializa cada músculo
 RECOVERY_MUSCLES.forEach(function(m){out[m]={pct:100,fatigue:0,lastDate:null};});

 // Itera días hacia atrás
 var dates=Object.keys(work||{}).filter(function(d){return work[d]&&work[d].length>0;});
 dates.forEach(function(dateKey){
  // Parseamos el dateKey como local (no UTC), usando un truco de split para evitar TZ.
  var parts=dateKey.split('-');
  if(parts.length!==3)return;
  var dt=new Date(parseInt(parts[0]),parseInt(parts[1])-1,parseInt(parts[2]),12,0,0);
  var daysAgo=Math.round((today-dt)/86400000);
  if(daysAgo<0)daysAgo=0; // entreno "hoy" o por TZ cuenta como día actual
  if(daysAgo>14)return; // solo últimos 14 días
  // Sólo contar la fatiga del día actual si la fecha coincide exactamente con hoy
  if(daysAgo===0&&dateKey!==todayKey)return;

  // Factor de decaimiento exponencial: e^(-ln2/halfLife × daysAgo)
  (work[dateKey]||[]).forEach(function(ex){
   var m=ex.muscle;
   if(!out[m])return; // músculo fuera de la lista visualizada
   var hf=RECOVERY_HALFLIFE[m]||2.0;
   var decay=Math.exp(-Math.LN2*daysAgo/hf);
   var fat=(ex.sets||[]).reduce(function(a,s){return a+setFatigue(s);},0);
   if(fat<=0)return;
   out[m].fatigue+=fat*decay;
   if(out[m].lastDate===null||daysAgo<out[m].lastDate){
    out[m].lastDate=daysAgo;
   }
  });
 });

 // Convierte fatiga → % recuperación (curva sigmoide para que fatigue≈3 ≈ 50%)
 Object.keys(out).forEach(function(m){
  var f=out[m].fatigue;
  // pct = 100 / (1 + f/k) con k=3 → mapea fatiga 0→100%, 3→50%, 9→25%, etc.
  var pct=100/(1+f/3);
  out[m].pct=Math.max(0,Math.min(100,Math.round(pct)));
 });

 return out;
}

// Devuelve el color CSS según % de recuperación.
// Rojo cuando está fatigado (<40), amarillo en zona media, verde cuando listo (>75).
function recoveryColor(pct){
 if(pct<30)return '#FF3B3B';       // muy fatigado
 if(pct<55)return '#FF8C00';       // fatigado
 if(pct<75)return '#FFD700';       // recuperándose
 return '#00D084';                 // listo
}

function recoveryLabel(pct,lastDaysAgo){
 if(lastDaysAgo===null)return 'Sin entrenar';
 if(pct<30)return 'Muy fatigado';
 if(pct<55)return 'Fatigado';
 if(pct<75)return 'Recuperándose';
 return 'Listo';
}

// Texto de sugerencia: si está fatigado, sugiere evitar; si está listo, "podés ir fuerte".
function recoveryTip(pct){
 if(pct<30)return 'Entrená otro grupo';
 if(pct<55)return 'Mejor serie ligera';
 if(pct<75)return 'Volumen moderado';
 return 'Podés ir fuerte';
}
