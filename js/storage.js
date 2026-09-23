// ══ STORAGE ══
var SK='ironlog_v7';
function ld(){try{var r=localStorage.getItem(SK);if(!r)return null;var p=JSON.parse(r);return isOldFormat(p)?p:unpack(p);}catch(e){console.error('ld error',e);return null;}}
function sv(d){try{localStorage.setItem(SK,JSON.stringify(pack(d)));}catch(e){console.error('sv error',e);}}
function uid(){return Math.random().toString(36).slice(2,9);}
function dk(d){return d.toISOString().split('T')[0];}
function getDIM(y,m){return new Date(y,m+1,0).getDate();}
function getFDW(y,m){var d=new Date(y,m,1).getDay();return d===0?6:d-1;}
function fmtD(s){var d=new Date(s+'T12:00:00');return d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});}
function fmtS(s){var d=new Date(s+'T12:00:00');return d.toLocaleDateString('es-ES',{day:'numeric',month:'short'});}
function e1rm(w,r){if(r<=1)return w;return Math.round(w*(1+r/30));}

// ══ PACK/UNPACK — compact storage format ══
// Detect if data is in OLD (long) format — exercises have name/muscle
function isOldFormat(p){
 if(!p||!p.workouts)return false;
 var date=Object.keys(p.workouts)[0];
 if(!date)return false;
 var exs=p.workouts[date];
 if(!Array.isArray(exs)||!exs.length)return false;
 var ex=exs[0];
 return ex&&(('name' in ex)||('muscle' in ex));
}

// Detect if data is in NEW compact format — exercises have d/s
function isCompactFormat(p){
 if(!p||!p.workouts)return false;
 var date=Object.keys(p.workouts)[0];
 if(!date)return false;
 var exs=p.workouts[date];
 if(!Array.isArray(exs)||!exs.length)return false;
 var ex=exs[0];
 return ex&&(('d' in ex)&&('s' in ex));
}

// Pack a single set into compact tuple [w, r, d, count=1, 'w'?, rir?, 'D'?]
// Posición 3 es SIEMPRE count (default 1). setsEqual ignora esa posición.
function packSet(s,count){
 if(!s||typeof s!=='object')return null;
 var arr=[s.weight||0,s.reps||0,s.done?1:0,1];
 var c=count||s.c;
 if(c&&c>1)arr[3]=c;
 if(s.warmUp)arr.push('w');
 if(typeof s.rir==='number'&&s.rir>=0)arr.push(s.rir);
 if(s.dropSet)arr.push('D');
 return arr;
}

// Unpack a set tuple/object back to long form
function unpackSet(x){
 if(!x)return null;
 if(Array.isArray(x)){
  var s={weight:x[0]||0,reps:x[1]||0,done:!!x[2]};
  // Position 3 is count, but if it's just 1 we don't add it to long form
  if(typeof x[3]==='number'&&x[3]>1)s.c=x[3];
  for(var i=4;i<x.length;i++){
   if(x[i]==='w')s.warmUp=true;
   else if(x[i]==='D')s.dropSet=true;
   else if(typeof x[i]==='number')s.rir=x[i];
  }
  return s;
 }
 return x; // already long form
}

// Pack whole dataset into compact format (for storage/export/Drive)
// Idempotent: if called on already-packed data, returns equivalent compact form
function pack(data){
 if(!data||!data.workouts)return data;
 // If already packed (first exercise has 'd' and 's'), skip
 if(isCompactFormat(data))return data;
 var c={};
 // Scalars/objects passthrough (they're small)
 ['workoutTimes','workoutNotes','goals','reminders','settings','dismissedRoutinePrompts','injuries','mmcRatings','stagnationDismissed','googleAuth','lastBackupDate'].forEach(function(k){
  c[k]=data[k]||(k==='workoutTimes'||k==='workoutNotes'||k==='dismissedRoutinePrompts'?{}:k==='injuries'||k==='mmcRatings'||k==='stagnationDismissed'?{}:null);
 });
 if(c.reminders&&c.reminders.streakNudges===undefined)c.reminders.streakNudges={};
 // Workouts: drop empty dates, drop name/muscle (rebuild from dbId)
 var w={};
 Object.keys(data.workouts).forEach(function(date){
  var exs=data.workouts[date];
  if(!Array.isArray(exs)||!exs.length)return;
  w[date]=exs.map(function(ex){
   var dbNum=0;
   if(ex.dbId){
    var s=String(ex.dbId);
    dbNum=s.charAt(0)==='e'?parseInt(s.slice(1))||0:parseInt(s)||0;
   }
   var sets=(ex.sets||[]).map(function(s){return packSet(s);});
   // RLE: merge consecutive identical sets (bumping position 3 = count)
   var rle=[];
   for(var i=0;i<sets.length;i++){
    var cur=sets[i];
    var last=rle[rle.length-1];
    if(last&&setsEqual(last,cur)){
     last[3]=(last[3]||1)+1;
    } else {
     rle.push(cur);
    }
   }
   var cEx={d:dbNum,s:rle};
   if(ex.id)cEx.i=ex.id;
   // Preserve user's custom name if it differs from DB
   var dbInfo=lookupExercise('e'+dbNum);
   if(dbInfo && ex.name && ex.name!==dbInfo.n){
    cEx.n=ex.name;
   }
   if(dbInfo && ex.muscle && ex.muscle!==dbInfo.m){
    cEx.m=ex.muscle;
   }
   return cEx;
  });
 });
 c.workouts=w;
 // Templates: compact name, days, dbId-int, sets
 c.templates=(data.templates||[]).map(function(t){
  return {
   i:t.id,
   n:t.name,
   c:t.color,
   x:(t.exercises||[]).map(function(ex){
    var dbNum=0;
    if(ex.dbId){
     var s=String(ex.dbId);
     dbNum=s.charAt(0)==='e'?parseInt(s.slice(1))||0:parseInt(s)||0;
    }
    var sets=(ex.sets||[]).map(function(s){
     return [s.weight||0,s.reps||0];
    });
    var rle=[];
    for(var i=0;i<sets.length;i++){
     var cur=sets[i];
     var last=rle[rle.length-1];
     if(last&&last[0]===cur[0]&&last[1]===cur[1]){
      last.c=(last.c||1)+1;
     } else {
      rle.push(cur);
     }
    }
    var cEx={d:dbNum,s:rle};
    return cEx;
   }),
   y:t.days||[],
   xc:t.exCount  // optional metadata
  };
 });
 // Custom exercises: id, n, m, q, i
 c.customExercises=(data.customExercises||[]).map(function(ce){
  return {d:ce.id,n:ce.n,m:ce.m,q:ce.q,e:ce.i};
 });
 // BodyWeight: tuples [date, kg]
 c.bodyWeight=(data.bodyWeight||[]).map(function(b){
  return [b.date,b.kg];
 });
 return c;
}

// Compare two packed sets for RLE equality (ignores count position 3)
function setsEqual(a,b){
 if(!Array.isArray(a)||!Array.isArray(b))return false;
 // Compare weight, reps, done
 if(a[0]!==b[0]||a[1]!==b[1]||a[2]!==b[2])return false;
 // Compare optional flags at positions 4+ (warmUp, rir)
 var maxLen=Math.max(a.length,b.length);
 for(var i=4;i<maxLen;i++){
  var av=a[i]!==undefined?a[i]:0;
  var bv=b[i]!==undefined?b[i]:0;
  if(av!==bv)return false;
 }
 return true;
}

// Unpack compact data back to long form (for in-memory use)
// Idempotent: if called on already-long-form data, returns equivalent long form
function unpack(c){
 if(!c)return c;
 // If already long form (first exercise has 'name' and 'muscle'), skip
 if(isOldFormat(c))return c;
 var out={};
 // Scalars passthrough
 ['workoutTimes','workoutNotes','goals','reminders','settings','dismissedRoutinePrompts','injuries','mmcRatings','stagnationDismissed','googleAuth','lastBackupDate'].forEach(function(k){
  out[k]=c[k]!==undefined?c[k]:null;
 });
 if(out.reminders&&out.reminders.streakNudges===undefined)out.reminders.streakNudges={};
 // Workouts back to long form
 var w={};
 Object.keys(c.workouts||{}).forEach(function(date){
  var exs=c.workouts[date];
  if(!Array.isArray(exs))return;
  w[date]=exs.map(function(ce){
   var dbId='e'+(ce.d||0);
   var info=lookupExercise(dbId);
   var sets=(ce.s||[]).map(unpackSet).filter(Boolean);
   // Expand RLE c>1 into individual sets
   var expanded=[];
   sets.forEach(function(s){
    if(s.c&&s.c>1){
     for(var i=0;i<s.c;i++){
      var copy=Object.assign({},s);
      delete copy.c;
      expanded.push(copy);
     }
    } else {
     expanded.push(s);
    }
   });
   return {
    id:ce.i||uid(),
    name:ce.n||(info?info.n:'Ejercicio '+dbId), // custom name override
    muscle:ce.m||(info?info.m:''), // custom muscle override
    dbId:dbId,
    sets:expanded
   };
  });
 });
 out.workouts=w;
 // Templates back to long form
 out.templates=(c.templates||[]).map(function(t){
  return {
   id:t.i,
   name:t.n,
   color:t.c,
   exCount:t.xc,
   exercises:(t.x||[]).map(function(ce){
    var dbId='e'+(ce.d||0);
    var info=lookupExercise(dbId);
    var sets=(ce.s||[]).map(function(s){
     if(Array.isArray(s)&&s.c&&s.c>1){
      var out=[];
      for(var i=0;i<s.c;i++)out.push({weight:s[0]||0,reps:s[1]||0});
      return out;
     }
     return [{weight:s[0]||0,reps:s[1]||0}];
    }).flat();
    return {
     name:info?info.n:'Ejercicio '+dbId,
     muscle:info?info.m:'',
     dbId:dbId,
     sets:sets
    };
   }),
   days:t.y||[]
  };
 });
 // Custom exercises back
 out.customExercises=(c.customExercises||[]).map(function(ce){
  return {id:ce.d,n:ce.n,m:ce.m,q:ce.q,i:ce.e,custom:true};
 });
 // BodyWeight back
 out.bodyWeight=(c.bodyWeight||[]).map(function(b){
  return {date:b[0],kg:b[1]};
 });
 return out;
}

// O(1) exercise lookup by dbId (built once)
var _EDB_BY_ID=null;
function lookupExercise(dbId){
 if(!dbId)return null;
 if(!_EDB_BY_ID){
  _EDB_BY_ID={};
  EDB.forEach(function(e){_EDB_BY_ID[e.id]=e;});
 }
 return _EDB_BY_ID[dbId]||null;
}

function defaultData(){
 return {workouts:{},workoutTimes:{},templates:[],customExercises:[],bodyWeight:[],workoutNotes:{},goals:{weeklySessions:4,customGoals:[]},reminders:{enabled:false,days:[0,1,2,3,4],time:'18:00',streakNudges:{},streakHour:20},settings:{weightUnit:'kg'},dismissedRoutinePrompts:{},injuries:[],mmcRatings:{},stagnationDismissed:{},googleAuth:null,lastBackupDate:null};
}

// ══ STATE ══
var S={
 data:null,restTimer:null,
 tab:'calendar',sel:dk(new Date()),
 cal:{y:new Date().getFullYear(),m:new Date().getMonth()},
 modal:null,exView:null,
 pf:{q:'',muscle:'Todos'},
 toast:null,tt:null,
 quoteIdx:Math.floor(Math.random()*QUOTES.length),
 tplDraft:{id:null,name:'',color:'#FF3B3B',exercises:[],days:[]},
 expandedEx: {}, // Para manejar los ejercicios que se colapsan/expanden
 collapsedMuscle: {} // Para colapsar/expandir grupos de músculo
};

(function initData(){
 var saved=ld();
 if(saved){
  S.data=saved;
  if(!S.data.customExercises)S.data.customExercises=[];
  if(!S.data.bodyWeight)S.data.bodyWeight=[];
  if(!S.data.workoutNotes)S.data.workoutNotes={};
  if(!S.data.workoutTimes)S.data.workoutTimes={};
  if(!S.data.goals)S.data.goals={weeklySessions:4,customGoals:[]};
  if(!S.data.goals.customGoals)S.data.goals.customGoals=[];
  if(!S.data.reminders)S.data.reminders={enabled:false,days:[0,1,2,3,4],time:'18:00',streakNudges:{},streakHour:20};
 if(S.data.reminders.streakNudges===undefined)S.data.reminders.streakNudges={};
 if(S.data.reminders.streakHour===undefined)S.data.reminders.streakHour=20;
  if(!S.data.settings)S.data.settings={weightUnit:'kg'};
  if(!S.data.dismissedRoutinePrompts)S.data.dismissedRoutinePrompts={};
  if(!S.data.injuries)S.data.injuries=[];
  if(!S.data.mmcRatings)S.data.mmcRatings={};
  if(!S.data.stagnationDismissed)S.data.stagnationDismissed={};
  if(S.data.googleAuth===undefined)S.data.googleAuth=null;
  if(S.data.lastBackupDate===undefined)S.data.lastBackupDate=null;
 } else {
  S.data=defaultData();sv(S.data);
 }
})();

function allExercises(){
 var custom=S.data.customExercises||[];
 var cex=custom.map(function(e){return Object.assign({},e,{custom:true});});
 return EDB.concat(cex);
}
// O(1) tip lookup via Map built once
var _EDB_TIP_MAP=null;
function getExTip(name){
 if(!_EDB_TIP_MAP){_EDB_TIP_MAP={};EDB.forEach(function(e){if(e.tip)_EDB_TIP_MAP[e.n]=e.tip;});}
 return _EDB_TIP_MAP[name]||'';
}

function st(p){Object.assign(S,p);if(p.data!==undefined)sv(S.data);render();}
function tst(msg){if(S.tt)clearTimeout(S.tt);var t=setTimeout(function(){st({toast:null,tt:null});},2400);st({toast:msg,tt:t});}
function cd(){return JSON.parse(JSON.stringify(S.data));}