// ══ RENDER EXERCISES ══
function rExTab(){
 var data=S.data,exView=S.exView,pf=S.pf;
 if(exView){
  var h=getHist(exView,data.workouts);
  var bestRM=h.length?Math.max.apply(null,h.map(function(x){return x.rm;})):0;
  var bestS=h.length?h.reduce(function(b,x){return x.rm>b.rm?x:b;},h[0]):null;
  var tv=h.reduce(function(a,x){return a+x.vol;},0);
  var trend=h.length>=2?h[h.length-1].rm-h[0].rm:null;
  var cPts=h.slice(-12).map(function(x){return{v:x.w,lbl:fmtS(x.date)};});
  var vPts=h.slice(-8).map(function(x){return{v:x.vol,lbl:fmtS(x.date)};});
  var p3=bestRM?Math.round(bestRM*1.08):0,p6=bestRM?Math.round(bestRM*1.16):0,p12=bestRM?Math.round(bestRM*1.25):0;
  var hrs=h.slice(-10).reverse().map(function(x){return '<div class="hr"><span class="hd">'+fmtS(x.date)+'</span><span class="hv">'+x.w+'kg x'+x.r+'</span><span style="font-size:10px;color:#555">'+x.sets+'s</span><span class="hrm">~'+x.rm+'kg 1RM</span></div>';}).join('');
  var trendTx=trend===null?'-':trend>0?'+'+trend+'kg':trend<0?trend+'kg':'Estable';
  var trendClr=trend>0?'#4CAF50':trend<0?'#FF3B3B':'#666';
  var isCustom=(data.customExercises||[]).some(function(e){return e.n===exView;});
  var tip=getExTip(exView);
  var tipHTML=tip?'<div class="card" style="margin-bottom:12px;border-color:#2a1f00"><div class="ct" style="color:#FFD700;margin-bottom:6px">📋 TÉCNICA Y DATOS</div><div style="font-size:13px;color:#ccc;line-height:1.65">'+tip+'</div></div>':'';
  if(!h.length)return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px"><button class="bi" onclick="st({exView:null})">'+IC.back+'</button><div class="stitle" style="margin:0;font-size:17px">'+exView+'</div></div>'+tipHTML+'<div class="empty"><p class="emtt">Sin historial</p><p class="emts">Registra este ejercicio para ver estadísticas</p></div>';
  return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">'+
   '<button class="bi" onclick="st({exView:null})">'+IC.back+'</button>'+
   '<div class="stitle" style="margin:0;font-size:17px">'+exView+(isCustom?'<span class="custom-badge">Custom</span>':'')+'</div></div>'+
   tipHTML+
   '<div style="display:flex;gap:8px;margin-bottom:12px">'+
   '<div class="eds"><div class="edv">'+h.length+'</div><div class="edl">Sesiones</div></div>'+
   '<div class="eds"><div class="edv">'+bestRM+'kg</div><div class="edl">1RM Est.</div></div>'+
   '<div class="eds"><div class="edv">'+(tv/1000).toFixed(1)+'t</div><div class="edl">Vol. Total</div></div>'+
   '</div>'+
   (bestS?'<div class="card" style="margin-bottom:10px"><div class="ct">Mejor serie</div>'+
   '<div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:700;font-size:22px;color:#fff">'+bestS.w+'kg x '+bestS.r+' reps</div>'+
   '<div style="font-size:11px;color:#FF3B3B;margin-top:2px">'+fmtS(bestS.date)+' · 1RM est: '+bestS.rm+'kg · <span style="color:'+trendClr+'">'+trendTx+'</span></div></div>':'')+
   (p3?'<div class="card" style="margin-bottom:10px"><div class="ct">Predicciones</div>'+
   '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px">'+
   '<div class="eds"><div class="edv" style="color:#FF8C00">'+p3+'kg</div><div class="edl">3 meses</div></div>'+
   '<div class="eds"><div class="edv" style="color:#FFD700">'+p6+'kg</div><div class="edl">6 meses</div></div>'+
   '<div class="eds"><div class="edv" style="color:#00D084">'+p12+'kg</div><div class="edl">12 meses</div></div>'+
   '</div></div>':'')+
   '<div class="card" style="margin-bottom:10px"><div class="ct">Peso máx por sesión (kg)</div><div class="cw">'+svgLine(cPts,340,120)+'</div></div>'+
   '<div class="card" style="margin-bottom:10px"><div class="ct">Volumen por sesión</div><div class="cw">'+svgBar(vPts,340,100,'#7B68EE')+'</div></div>'+
   '<div class="card"><div class="ct">Últimas sesiones</div>'+hrs+'</div>';
 }
 var q=pf.q,muscle=pf.muscle;
 var used=getUsed(data.workouts);
 var allEx=allExercises();
 var filt=allEx.filter(function(e){return (muscle==='Todos'||e.m===muscle||(muscle==='Personalizado'&&e.custom))&&(!q||e.n.toLowerCase().indexOf(q.toLowerCase())>=0||e.m.toLowerCase().indexOf(q.toLowerCase())>=0);});
 var chips=MUSCLES.map(function(m){return '<button class="mch'+(muscle===m?' on':'')+'" onclick="setPF(\'muscle\',\''+m+'\')">'+m+'</button>';}).join('');
 var usedNames=used.map(function(x){return x.name;});
 filt.sort(function(a,b){var ua=usedNames.indexOf(a.n),ub=usedNames.indexOf(b.n);if(ua>=0&&ub>=0)return ua-ub;if(ua>=0)return -1;if(ub>=0)return 1;return a.n.localeCompare(b.n);});
 var dblist=filt.slice(0,40).map(function(e){
  var u=used.filter(function(x){return x.name===e.n;})[0];
  var tipPrev=e.tip?e.tip.split('.')[0]+'.':'';
  return '<div class="dbi" onclick="st({exView:\''+e.n.replace(/'/g,"\\'")+'\'})">'+
   '<div style="font-size:18px;width:28px;text-align:center">'+e.i+'</div>'+
   '<div style="flex:1"><div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:700;font-size:15px;color:#fff">'+e.n+(e.custom?'<span class="custom-badge">Custom</span>':'')+'</div>'+
   '<div style="font-size:10px;color:#555;margin-top:1px">'+e.m+' · '+e.q+'</div>'+
   (tipPrev&&!u?'<div style="font-size:10px;color:#3a3a3a;margin-top:3px;line-height:1.4">'+tipPrev+'</div>':'')+
   '</div>'+
   (u?'<div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:800;font-size:15px;color:#FF3B3B">'+u.count+'x</div>':'')+'</div>';
 }).join('');
 var myList='';
 if(used.length){
  myList='<div class="stitle" style="font-size:16px;margin-top:14px;margin-bottom:8px">Mis Ejercicios</div>';
  used.slice(0,10).forEach(function(e){
   var dbEx=allEx.filter(function(x){return x.n===e.name;})[0];
   myList+='<div class="dbi" onclick="st({exView:\''+e.name.replace(/'/g,"\\'")+'\',tab:\'exercises\'})">'+
    '<div style="font-size:18px;width:28px;text-align:center">'+(dbEx?dbEx.i:'💪')+'</div>'+
    '<div style="flex:1"><div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:700;font-size:15px;color:#fff">'+e.name+'</div>'+
    '<div style="font-size:10px;color:#555;margin-top:1px">'+e.muscle+' · '+e.count+' sesión'+(e.count!==1?'es':'')+' · 1RM: '+(e.best.rm>0?e.best.rm+'kg':'---')+'</div></div>'+
    '<div style="color:#3a3a3a;display:flex;align-items:center">'+IC.chevR+'</div></div>';
  });
 }
 return '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'+
  '<div class="stitle">Ejercicios</div>'+
  '<button class="bp" onclick="oM(\'addCustomEx\')">'+IC.plus+' <span>Añadir</span></button>'+
  '</div>'+
  '<input id="exs-search" class="ps" type="text" placeholder="🔍  Buscar ejercicio..." value="'+q+'" oninput="setPF(\'q\',this.value)"/>'+
  '<div class="mc">'+chips+'</div>'+
  (dblist||'<div class="empty"><p class="emtt">Sin resultados</p></div>')+myList;
}

// ── PROGRESS TAB ──
