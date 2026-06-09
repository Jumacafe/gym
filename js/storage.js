// ══ STORAGE ══
var SK='ironlog_v7';
function ld(){try{var r=localStorage.getItem(SK);return r?JSON.parse(r):null;}catch(e){return null;}}
function sv(d){try{localStorage.setItem(SK,JSON.stringify(d));}catch(e){console.error(e);}}
function uid(){return Math.random().toString(36).slice(2,9);}
function dk(d){return d.toISOString().split('T')[0];}
function getDIM(y,m){return new Date(y,m+1,0).getDate();}
function getFDW(y,m){var d=new Date(y,m,1).getDay();return d===0?6:d-1;}
function fmtD(s){var d=new Date(s+'T12:00:00');return d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});}
function fmtS(s){var d=new Date(s+'T12:00:00');return d.toLocaleDateString('es-ES',{day:'numeric',month:'short'});}
function e1rm(w,r){if(r<=1)return w;return Math.round(w*(1+r/30));}

function defaultData(){
 return {workouts:{},templates:[],customExercises:[],bodyWeight:[],workoutNotes:{},goals:{weeklySessions:4,customGoals:[]},reminders:{enabled:false,days:[0,1,2,3,4],time:'18:00'},settings:{weightUnit:'kg'}};
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
 tplDraft:{id:null,name:'',color:'#FF3B3B',exercises:[]},
 expandedEx: {} // Para manejar los ejercicios que se colapsan/expanden
};

(function initData(){
 var saved=ld();
 if(saved){
  S.data=saved;
  if(!S.data.customExercises)S.data.customExercises=[];
  if(!S.data.bodyWeight)S.data.bodyWeight=[];
  if(!S.data.workoutNotes)S.data.workoutNotes={};
  if(!S.data.goals)S.data.goals={weeklySessions:4,customGoals:[]};
  if(!S.data.goals.customGoals)S.data.goals.customGoals=[];
  if(!S.data.reminders)S.data.reminders={enabled:false,days:[0,1,2,3,4],time:'18:00'};
  if(!S.data.settings)S.data.settings={weightUnit:'kg'};
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

