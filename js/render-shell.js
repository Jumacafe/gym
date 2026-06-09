// ══ RENDER SHELL ══
var _cachedStreak=0;
function render(){
 var app=document.getElementById('app');
 var tab=S.tab,sel=S.sel,data=S.data,modal=S.modal,toast=S.toast;
 var workout=data.workouts[sel]||[];
var _activeEl = document.activeElement;
var _focusSave = null;
if (_activeEl && _activeEl.id &&
    (_activeEl.tagName === 'INPUT' || _activeEl.tagName === 'TEXTAREA')) {
  _focusSave = {
    id: _activeEl.id,
    ss: _activeEl.selectionStart,
    se: _activeEl.selectionEnd
  };
}
var _contentEl = app.querySelector('.content');
var _savedScroll = _contentEl ? _contentEl.scrollTop : 0;
 _cachedStreak=calcStreak(data.workouts);
 app.innerHTML=
  '<div class="hdr"><div><div class="logo">IRON<span>LOG</span></div><div class="logo-sub">Gym Tracker</div></div>'+
  '<div class="hdr-right">'+
  '<div class="sbadge" onclick="gT(\'motivation\')">🔥 '+_cachedStreak+' día'+(_cachedStreak!==1?'s':'')+'</div></div></div>'+
  '<div class="content">'+(
   tab==='calendar'?rCal(workout):
   tab==='exercises'?rExTab():
   tab==='progress'?rProg():
   tab==='motivation'?rMotivation():
   tab==='config'?rConfig():
   rCal(workout)
  )+'</div>'+
  '<nav class="nav">'+
  '<button class="nb '+(tab==='calendar'?'on':'')+' " onclick="gT(\'calendar\')">'+IC.cal+'<span class="nl">Entreno</span></button>'+
  '<button class="nb '+(tab==='exercises'?'on':'')+' " onclick="gT(\'exercises\')">'+IC.exs+'<span class="nl">Ejercicios</span></button>'+
  '<button class="nb '+(tab==='progress'?'on':'')+' " onclick="gT(\'progress\')">'+IC.stat+'<span class="nl">Progreso</span></button>'+
  '<button class="nb '+(tab==='motivation'?'on':'')+' " onclick="gT(\'motivation\')">'+IC.mot+'<span class="nl">Metas</span></button>'+
  '<button class="nb '+(tab==='config'?'on':'')+' " onclick="gT(\'config\')">'+IC.gear+'<span class="nl">Config</span></button>'+
  '</nav>'+restHTML+(modal?rModal(modal):'')+(toast?'<div class="toast">'+toast+'</div>':'');
  var _newContent = app.querySelector('.content');
if (_newContent && _savedScroll > 0) {
  _newContent.scrollTop = _savedScroll;
}
  if (_focusSave) {
  var _nel = document.getElementById(_focusSave.id);
  if (_nel) {
    _nel.focus({ preventScroll: true });
    if (_nel.setSelectionRange) {
      try { _nel.setSelectionRange(_focusSave.ss, _focusSave.se); } catch(e) {}
    }
  }
}
}
