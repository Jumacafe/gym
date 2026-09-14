// ══ RENDER PROGRESS ══
function rProg(){
 var data=S.data;
 var streak=_cachedStreak;
 var ws=thisWk(data.workouts);
 var wv=weekVol(data.workouts,7);
 var allD=Object.keys(data.workouts).filter(function(d){return data.workouts[d].length>0;});
 var totW=allD.length;
 var totS=allD.reduce(function(a,d){return a+data.workouts[d].reduce(function(b,e){return b+e.sets.filter(function(s){return s.done;}).length;},0);},0);
 var used=getUsed(data.workouts);
 var recs=genRecs(data);
 function delt(a,b){if(!b)return'';var p=Math.round((a-b)/Math.max(b,1)*100);return '<div class="sd '+(p>0?'du':p<0?'dd':'de')+'">'+(p>0?'↑':p<0?'↓':'=')+' '+Math.abs(p)+'%</div>';}
 var vBars=wv.map(function(w){return{lbl:w.lbl,v:w.vol};});
 var md=muscDist(data.workouts);var mdT=Object.values(md).reduce(function(a,b){return a+b;},0)||1;
 var mdS=Object.entries(md).sort(function(a,b){return b[1]-a[1];}).slice(0,6);
 var mdH=mdS.map(function(e){var mc=e[0],c2=e[1];return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:7px">'+
  '<div style="width:80px;font-size:11px;color:#999;flex-shrink:0">'+mc+'</div>'+
  '<div style="flex:1;height:6px;border-radius:3px;background:#1e1e1e"><div style="height:100%;border-radius:3px;background:#FF3B3B;width:'+Math.round(c2/mdT*100)+'%"></div></div>'+
  '<div style="font-size:11px;color:#FF3B3B;font-weight:700;width:28px;text-align:right">'+Math.round(c2/mdT*100)+'%</div></div>';}).join('');
 var top3=used.slice(0,3);
 var medals=['🥇','🥈','🥉'];
 var top3H=top3.length?top3.map(function(e,i){return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#1a1a1a;border-radius:10px;margin-bottom:6px">'+
  '<div style="font-size:20px">'+medals[i]+'</div>'+
  '<div style="flex:1"><div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:700;font-size:15px;color:#fff">'+e.name+'</div>'+
  '<div style="font-size:10px;color:#555;margin-top:1px">'+e.muscle+' · '+e.count+' sesión'+(e.count!==1?'es':'')+'</div></div>'+
  '<div style="text-align:right"><div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:800;font-size:15px;color:#FF3B3B">'+(e.best.rm>0?e.best.rm+'kg 1RM':e.best.w>0?e.best.w+'kg':'---')+'</div></div>'+
  '</div>';}).join(''):'<div class="empty"><p class="emtt">Sin datos</p><p class="emts">Completa series para ver tus favoritos</p></div>';
 var mainL=['Press de Banca Plano','Sentadilla Libre','Peso Muerto','Press Militar con Barra'];
 var predH='';
 mainL.forEach(function(lift){
  var h=getHist(lift,data.workouts);if(!h.length)return;
  var best=Math.max.apply(null,h.map(function(x){return x.rm;}));
  var p3=Math.round(best*1.08),p6=Math.round(best*1.16),p12=Math.round(best*1.25);
  var td=h.length>=2?h[h.length-1].rm-h[0].rm:0;
  predH+='<div style="background:#1a1a1a;border-radius:10px;padding:11px;margin-bottom:8px">'+
   '<div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:700;font-size:15px;color:#fff;margin-bottom:4px">'+lift+' <span style="font-size:11px;color:'+(td>0?'#4CAF50':td<0?'#FF3B3B':'#666')+'">'+(td>0?'+'+td+'kg':td<0?td+'kg':'Estable')+'</span></div>'+
   '<div style="font-size:11px;color:#777;margin-bottom:8px">1RM actual est: <span style="color:#FF3B3B;font-weight:700">'+best+'kg</span></div>'+
   '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">'+
   '<div style="text-align:center;background:#141414;border-radius:8px;padding:7px"><div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:800;font-size:17px;color:#FF8C00">'+p3+'kg</div><div style="font-size:9px;color:#444;text-transform:uppercase">3 meses</div></div>'+
   '<div style="text-align:center;background:#141414;border-radius:8px;padding:7px"><div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:800;font-size:17px;color:#FFD700">'+p6+'kg</div><div style="font-size:9px;color:#444;text-transform:uppercase">6 meses</div></div>'+
   '<div style="text-align:center;background:#141414;border-radius:8px;padding:7px"><div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:800;font-size:17px;color:#00D084">'+p12+'kg</div><div style="font-size:9px;color:#444;text-transform:uppercase">12 meses</div></div>'+
   '</div></div>';
 });
 var goals=data.goals||{};
 var goalSePct=Math.min(Math.round(ws.se/(goals.weeklySessions||4)*100),100);
 var bw=data.bodyWeight||[];
 var lastBW=bw.length?bw[bw.length-1]:null;
 var prevBW=bw.length>1?bw[bw.length-2]:null;
 var bwDiff=lastBW&&prevBW?lastBW.kg-prevBW.kg:null;
 var bwDiffStr=bwDiff!==null?((bwDiff>0?'+':'')+bwDiff.toFixed(1)):'';
 var bwPts=bw.slice(-10).map(function(e){return{v:e.kg,lbl:fmtS(e.date)};});
 var recsH=recs.map(function(r){return '<div class="rc"><div class="ri">'+r.ic+'</div><div><div class="rt">'+r.ti+'</div><div class="rx">'+r.tx+'</div></div></div>';}).join('');
 var sIc=(streak>=30?'🏆':streak>=14?'💎':streak>=7?'🔥':streak>=3?'⚡':'🎯');
 var sTx=(streak===0?'Empieza hoy — sin racha activa':streak<7?'¡No la rompas!':streak<30?'¡Racha increíble!':'¡Leyenda del gym!');
 var sLv=(streak>=30?'Leyenda':streak>=14?'Elite':streak>=7?'En Racha':streak>=3?'Arrancando':'Comienza');
 return (
  /* ── RACHA HERO ── */
  '<div class="streak-hero">'+
  '<div style="display:flex;align-items:center;justify-content:space-between">'+
  '<div>'+
  '<div class="p-label" style="color:#8a2020">Racha actual</div>'+
  '<div class="streak-num" style="color:'+(streak>0?'#FF3B3B':'#2a2a2a')+'">'+streak+'</div>'+
  '<div style="font-family:\'Barlow Condensed\',sans-serif;font-size:13px;font-weight:700;color:'+(streak>0?'#aa1818':'#2a2a2a')+';letter-spacing:2px;margin-top:3px">'+(streak===1?'DÍA':'DÍAS')+'</div>'+
  '<div style="font-size:11px;color:#484848;margin-top:10px;max-width:170px;line-height:1.4">'+sTx+'</div>'+
  '</div>'+
  '<div style="text-align:center">'+
  '<div style="font-size:52px;line-height:1;margin-bottom:8px">'+sIc+'</div>'+
  '<div style="font-size:9px;color:#2e2e2e;text-transform:uppercase;letter-spacing:2px;font-weight:700">'+sLv+'</div>'+
  '</div>'+
  '</div>'+
  '</div>'+

  /* ── TOTALES HISTÓRICOS ── */
  '<div class="p-label">Historial total</div>'+
  '<div class="sg">'+
  '<div class="sc"><div class="sv2">'+totW+'</div><div class="sl2">Entrenos</div></div>'+
  '<div class="sc"><div class="sv2">'+totS+'</div><div class="sl2">Series</div></div>'+
  '<div class="sc"><div class="sv2">'+used.length+'</div><div class="sl2">Ejercicios</div></div>'+
  '</div>'+

  /* ── GRÁFICA SEMANAS ── */
  '<div class="card"><div class="ct">Sesiones/semana · últ. 8 semanas</div><div class="cw">'+svgBar(vBars,340,90,'#FF3B3B')+'</div></div>'+
  '<div class="divider"></div>'+

  /* ── VOLUMEN SEMANAL POR MÚSCULO ── */
  (function(){
   var vol=weeklyVolumeByMuscle(data.workouts,7);
   var muscles=['Pecho','Espalda','Hombros','Biceps','Triceps','Piernas','Gluteos','Pantorrillas','Core'];
   var hasData=Object.keys(vol).some(function(k){return vol[k].sets>0;});
   if(!hasData)return'';
   var rows=muscles.map(function(m){
    var v=vol[m]||{sets:0,hardSets:0,target:null};
    var st=volumeStatus(v.hardSets,v.target);
    var pct=0;
    if(v.target&&v.target.mrv)pct=Math.min(100,v.hardSets/v.target.mrv*100);
    else if(v.sets>0)pct=50;
    var barColor=v.hardSets>=v.target&&v.target?v.target.mrv:st.color;
    var targetTxt=v.target?'MEV '+v.target.mev+' · MAV '+v.target.mav[0]+'-'+v.target.mav[1]+' · MRV '+v.target.mrv:'';
    return '<div style="margin-bottom:9px">'+
     '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">'+
      '<div style="display:flex;align-items:center;gap:6px">'+
       '<span style="font-size:11px;font-weight:700;color:#e2e2e2;min-width:70px">'+m+'</span>'+
      '</div>'+
      '<div style="display:flex;align-items:center;gap:6px">'+
       '<span style="font-size:10px;color:#888">'+v.sets+(v.hardSets!==v.sets?' <span style="color:#aaa">('+v.hardSets+' duras)</span>':'')+' series</span>'+
      '</div>'+
     '</div>'+
     '<div style="height:8px;background:#1a1a1a;border-radius:4px;overflow:hidden;position:relative">'+
      // Zonas MEV/MAV/MRV
      (v.target?'<div style="position:absolute;left:'+(v.target.mev/v.target.mrv*100)+'%;top:0;bottom:0;width:1px;background:#00D084"></div>'+
       '<div style="position:absolute;left:'+(v.target.mav[1]/v.target.mrv*100)+'%;top:0;bottom:0;width:1px;background:#FF8C00"></div>':'')+
      '<div style="height:100%;background:'+st.color+';width:'+pct+'%;border-radius:4px;transition:width .4s"></div>'+
     '</div>'+
     '<div style="font-size:9px;color:#666;margin-top:2px;display:flex;justify-content:space-between">'+
      '<span style="color:'+st.color+'">'+st.label+'</span>'+
      (v.target?'<span>'+targetTxt+'</span>':'')+
     '</div>'+
    '</div>';
   }).join('');
   return '<div class="p-label">Volumen semanal por músculo</div>'+
    '<div class="card" style="margin-bottom:14px">'+
     '<div style="font-size:10px;color:#666;margin-bottom:10px;line-height:1.5">Series <strong style="color:#aaa">duras</strong> (RIR 0-3) en los últimos 7 días. Para hipertrofia apuntá a la zona MAV.'+
      '<br><span style="color:#00D084">━</span> MEV &nbsp; <span style="color:#FF8C00">━</span> MRV</div>'+
     rows+
    '</div>'+
    '<div class="divider"></div>';
  })()+

  /* ── DETECCIÓN DE MESETAS ── */
  (function(){
   var stag=getStagnantExercises(data.workouts,3);
   var keys=Object.keys(stag).filter(function(k){return!data.stagnationDismissed[k];});
   if(!keys.length)return'';
   var rows=keys.slice(0,4).map(function(name){
    var info=stag[name];
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1a1a1a">'+
     '<div style="flex:1">'+
      '<div style="font-size:12px;color:#e2e2e2;font-weight:600">'+name+'</div>'+
      '<div style="font-size:10px;color:#888;margin-top:2px">Mejor 1RM: '+info.olderBest+'kg · Sin cambios hace ~'+info.weeksStagnant+' sem</div>'+
     '</div>'+
     '<button class="bism" style="color:#888" onclick="dismissStagnation(\''+name.replace(/'/g,"\\'")+'\')">'+IC.check+'</button>'+
    '</div>';
   }).join('');
   return '<div class="p-label">⚠ Ejercicios estancados</div>'+
    '<div class="card" style="margin-bottom:14px;border-color:#3a2a1a">'+
     '<div style="font-size:10px;color:#FF8C00;margin-bottom:8px;line-height:1.5">Llevás 3+ semanas sin progresar en estos ejercicios. Probá una semana de deload o cambiá el rango de reps.</div>'+
     rows+
    '</div>';
  })()+

  /* ── RESUMEN MENSUAL ── */
  (function(){
   var months=availableMonths(data.workouts);
   if(months.length===0)return'';
   // Mostrar los últimos 6 meses como máximo
   var monthsToShow=months.slice(0,6);
   var cards=monthsToShow.map(function(ym,idx){
    var sum=monthlySummary(data.workouts,ym,data.workoutTimes);
    if(!sum)return'';
    var exRows=sum.exercises.map(function(e){
     if(e.progressKg<=0&&e.progressPct<=0)return'';
     var pct=Math.min(100,Math.max(0,e.progressPct));
     var pctColor=e.progressPct>=10?'#4CAF50':e.progressPct>=5?'#FFD700':e.progressPct>=0?'#FF8C00':'#666';
     var barBg=pctColor;
     var sign=e.progressKg>0?'+':'';
     return '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #1a1a1a">'+
      '<div style="flex:1;min-width:0">'+
       '<div style="font-size:12px;color:#e2e2e2;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+e.name+'</div>'+
       '<div style="font-size:10px;color:#777;margin-top:1px">'+e.startW+'kg×'+e.startR+' → '+e.endW+'kg×'+e.endR+'</div>'+
      '</div>'+
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:1px;min-width:90px">'+
       '<div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:800;font-size:14px;color:'+pctColor+'">'+sign+e.progressKg+'kg</div>'+
       '<div style="font-size:10px;color:'+pctColor+';font-weight:700">'+sign+e.progressPct+'%</div>'+
      '</div>'+
      '<div style="flex:none;width:60px">'+
       '<div style="height:5px;background:#1a1a1a;border-radius:3px;overflow:hidden">'+
        '<div style="height:100%;background:'+barBg+';width:'+pct+'%;border-radius:3px"></div>'+
       '</div>'+
      '</div>'+
     '</div>';
    }).join('');
    var totalVol=sum.totalVolume>=1000?(sum.totalVolume/1000).toFixed(1)+'t':sum.totalVolume+'kg';
    var timeStr=sum.totalMinutes?fmtDuration(sum.totalMinutes):'—';
    // Solo mostrar ejercicios que progresaron
    var exWithProgress=sum.exercises.filter(function(e){return e.progressKg>0||e.progressPct>0;});
    var exList=exRows?'<div style="margin-top:6px">'+exRows+'</div>':'<div style="font-size:11px;color:#555;text-align:center;padding:14px">Sin progresión registrada este mes (entrenaste pero no subiste peso ni reps)</div>';
    var id='ms-'+ym;
    return '<div class="ms-card" style="margin-bottom:10px;background:#101010;border:1px solid #191919;border-radius:14px;overflow:hidden">'+
     '<div onclick="document.getElementById(\''+id+'\').classList.toggle(\'ms-hidden\');this.querySelector(\'.ms-arrow\').textContent=document.getElementById(\''+id+'\').classList.contains(\'ms-hidden\')?\'▸\':\'▾\'" style="padding:13px 14px;cursor:pointer;display:flex;justify-content:space-between;align-items:center">'+
      '<div style="flex:1">'+
       '<div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:900;font-size:20px;color:#fff;letter-spacing:1px">'+fmtMonthLabel(ym).toUpperCase()+'</div>'+
       '<div style="font-size:10px;color:#777;margin-top:3px">'+sum.sessions+' sesiones · '+sum.totalSets+' series · '+totalVol+' · '+timeStr+' gym</div>'+
      '</div>'+
      '<div style="display:flex;align-items:center;gap:8px">'+
       '<div style="font-size:10px;color:#888;text-align:right">'+exWithProgress.length+' con progreso</div>'+
       '<div class="ms-arrow" style="color:#888;font-size:14px">'+(idx===0?'▾':'▸')+'</div>'+
      '</div>'+
     '</div>'+
     '<div id="'+id+'" class="'+(idx===0?'':'ms-hidden')+'" style="padding:0 14px 14px">'+
      exList+
     '</div>'+
    '</div>';
   }).join('');
   return '<div class="p-label">Resumen mensual</div>'+
    '<div style="font-size:10px;color:#666;margin-bottom:10px;line-height:1.5">Evolución por ejercicio: comparamos el <strong style="color:#aaa">mejor 1RM</strong> (estimado) de la <strong style="color:#aaa">primera sesión</strong> del mes vs la <strong style="color:#aaa">última</strong>.</div>'+
    cards;
  })()+

  /* ── ESTA SEMANA ── */
  '<div class="p-label">Esta semana</div>'+
  '<div class="sg">'+
  '<div class="sc"><div class="sv2">'+ws.se+'</div><div class="sl2">Entrenos</div>'+delt(ws.se,ws.lSe)+'</div>'+
  '<div class="sc"><div class="sv2">'+ws.sets+'</div><div class="sl2">Series</div>'+delt(ws.sets,ws.lSets)+'</div>'+
  '<div class="sc"><div class="sv2">'+ws.exs+'</div><div class="sl2">Ejercicios</div>'+delt(ws.exs,ws.lExs)+'</div>'+
  '</div>'+

  /* ── TIEMPO EN GIMNASIO ── */
  (function(){
   var wt=data.workoutTimes||{};
   var todayK=dk(new Date());
   var todayT=wt[todayK];
   var todayDur=todayT&&todayT.startedAt&&todayT.endedAt?sessionDurationMin(todayK,wt):0;
   var todayActive=todayDur>0;
   var daily30=dailyAvgDuration(wt,30);
   var weekly4=weeklyAvgDuration(wt,4);
   var totalT=totalGymTime(wt);
   var sessionsT=getSessionsWithTime(wt);
   var recentSess=sessionsT.slice(0,5);
   function timeShort(iso){try{var d=new Date(iso);return d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});}catch(e){return'--:--';}}
   var todayCard=todayActive?
    '<div style="background:linear-gradient(135deg,#1a0808 0%,#0c0c0c 100%);border:1px solid #2a1010;border-radius:14px;padding:14px;margin-bottom:12px">'+
     '<div style="display:flex;justify-content:space-between;align-items:center">'+
      '<div>'+
       '<div style="font-size:10px;color:#aa1818;text-transform:uppercase;letter-spacing:1.2px;font-weight:700;margin-bottom:4px">⏱️ SESIÓN DE HOY</div>'+
       '<div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:900;font-size:28px;color:#fff;letter-spacing:1px">'+fmtDuration(todayDur)+'</div>'+
      '</div>'+
      '<div style="text-align:right;font-size:11px;color:#888;line-height:1.5">'+
       '<div>🟢 Inicio: <span style="color:#fff;font-weight:700">'+timeShort(todayT.startedAt)+'</span></div>'+
       '<div>🔴 Última: <span style="color:#fff;font-weight:700">'+timeShort(todayT.endedAt)+'</span></div>'+
      '</div>'+
     '</div>'+
    '</div>'
    :'';
   var statsRow=
    '<div class="sg">'+
     '<div class="sc"><div class="sv2">'+fmtDuration(daily30)+'</div><div class="sl2">Prom. diario · 30d</div></div>'+
     '<div class="sc"><div class="sv2">'+fmtDuration(weekly4)+'</div><div class="sl2">Prom. semanal · 4sem</div></div>'+
     '<div class="sc"><div class="sv2">'+fmtDuration(totalT)+'</div><div class="sl2">Total acumulado</div></div>'+
    '</div>';
   var sessList=recentSess.length?
    '<div style="margin-top:10px">'+
     recentSess.map(function(s,i){
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 11px;background:#181818;border-radius:9px;margin-bottom:5px">'+
       '<div style="display:flex;align-items:center;gap:8px">'+
        '<div style="width:22px;height:22px;border-radius:50%;background:'+(i===0?'#FF3B3B':'#2a2a2a')+';color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800">'+(i+1)+'</div>'+
        '<div>'+
         '<div style="font-size:12px;color:#e2e2e2;font-weight:600">'+fmtS(s.date)+'</div>'+
         '<div style="font-size:10px;color:#555">'+timeShort(s.startedAt)+' → '+timeShort(s.endedAt)+'</div>'+
        '</div>'+
       '</div>'+
       '<div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:800;font-size:15px;color:'+(i===0?'#FF3B3B':'#999')+'">'+fmtDuration(s.duration)+'</div>'+
      '</div>';
     }).join('')+
    '</div>'
    :'';
   var emptyMsg=sessionsT.length===0?
    '<div style="font-size:11px;color:#444;text-align:center;padding:14px;background:#101010;border-radius:10px;border:1px dashed #222">'+
     'Marca alguna serie como hecha y se empezará a contar tu tiempo en el gym automáticamente.'+
    '</div>'
    :'';
   return (
    '<div class="p-label">Tiempo en el gym</div>'+
    todayCard+
    (sessionsT.length?statsRow+sessList:emptyMsg)
   );
  })()+

  /* ── METAS ── */
  '<div class="card" style="margin-bottom:10px"><div class="ct">Meta semanal</div>'+
  '<div class="goal-row"><div class="goal-info"><div class="goal-name">Sesiones: '+ws.se+' / '+(goals.weeklySessions||4)+'</div><div class="goal-bar"><div class="goal-fill" style="width:'+goalSePct+'%;background:'+(goalSePct>=100?'#4CAF50':'#FF3B3B')+'"></div></div></div><div class="goal-pct" style="color:'+(goalSePct>=100?'#4CAF50':'#FF3B3B')+'">'+goalSePct+'%</div></div>'+
  '<button class="bs" style="margin-top:8px;font-size:11px" onclick="oM(\'editGoals\')">✏️ Editar meta</button></div>'+
  '<div class="card"><div class="ct">Metas personalizadas</div>'+(goals.customGoals&&goals.customGoals.length?goals.customGoals.map(function(g,i){var gp=Math.min(Math.round((g.current||0)/Math.max(g.target,1)*100),100);var gc=gp>=100?'#4CAF50':'#FF3B3B';return '<div style="background:#181818;border-radius:11px;padding:11px;margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:700;font-size:14px;color:#e2e2e2">'+g.name+'</div><div style="display:flex;align-items:center;gap:6px"><span style="font-size:12px;color:#383838">'+(g.current||0)+'/'+g.target+' '+(g.unit||'')+'</span><button class="bism" onclick="oM(\'editCustomGoal\',{idx:'+i+'})" style="color:#444">'+IC.edit+'</button><button class="bism" onclick="delCustomGoal('+i+')" style="color:#FF3B3B">'+IC.trash+'</button></div></div><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;border-radius:3px;background:#111"><div style="height:100%;border-radius:3px;background:'+gc+';width:'+gp+'%;transition:width .4s"></div></div><span style="font-size:11px;color:'+gc+';font-weight:700;min-width:30px;text-align:right">'+gp+'%</span></div>'+(gp>=100?'<div style="font-size:11px;color:#4CAF50;margin-top:6px">🎉 ¡Meta alcanzada!</div>':'')+'</div>';}).join(''):'<div style="font-size:11px;color:#383838;text-align:center;padding:12px">Sin metas personalizadas</div>')+
  '<button class="bas" style="margin-top:8px" onclick="oM(\'addCustomGoal\')">'+IC.plus+' Añadir meta</button></div>'+
  '<div class="divider"></div>'+

  /* ── PESO CORPORAL ── */
  '<div class="p-label">Peso corporal</div>'+
  '<div class="card" style="margin-bottom:14px">'+
  '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'+
  '<div class="ct" style="margin:0">Registro</div>'+
  '<button class="bp" style="padding:6px 12px;font-size:12px" onclick="oM(\'logWeight\')">'+IC.plus+' Registrar</button>'+
  '</div>'+
  (lastBW?'<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'+
  '<div class="eds" style="flex:none;width:88px"><div class="edv">'+lastBW.kg+'kg</div><div class="edl">Último</div></div>'+
  (bwDiff!==null?'<div class="eds" style="flex:none;width:88px"><div class="edv" style="color:'+(bwDiff>0?'#FF3B3B':bwDiff<0?'#4CAF50':'#555')+'">'+bwDiffStr+'kg</div><div class="edl">Cambio</div></div>':'')+
  '<div class="eds"><div class="edv">'+bw.length+'</div><div class="edl">Registros</div></div>'+
  '</div>'+
  (bwPts.length>=2?'<div class="cw">'+svgLine(bwPts,340,110,'#00D084')+'</div>':'<div style="font-size:11px;color:#383838;text-align:center;padding:8px">Añade más registros para ver la gráfica</div>')
  :'<div style="font-size:12px;color:#383838;text-align:center;padding:12px">Sin registros. Pulsa + Registrar para empezar.</div>')+
  '</div>'+
  '<div class="divider"></div>'+

  /* ── DISTRIBUCIÓN MUSCULAR ── */
  (mdS.length?'<div class="p-label">Distribución muscular</div><div class="card">'+mdH+'</div><div class="divider"></div>':'')+

  /* ── TOP EJERCICIOS ── */
  '<div class="p-label">Top ejercicios</div>'+
  '<div class="card">'+top3H+'</div>'+

  /* ── PREDICCIONES ── */
  (predH?'<div class="divider"></div><div class="p-label">Predicciones de fuerza</div>'+predH:'')+
  '<div class="divider"></div>'+

  /* ── CONSEJOS ── */
  '<div class="p-label">Análisis y consejos</div>'+
  recsH
 );
}

// ── MOTIVATION TAB ──
