// ══ RENDER MOTIVATION ══
function rMotivation(){
 var data=S.data;
 var streak=_cachedStreak;
 var cats={};
 ACHIEVEMENTS.forEach(function(a){var cat=a.cat||'General';if(!cats[cat])cats[cat]=[];cats[cat].push(a);});
 var unlockedCount=ACHIEVEMENTS.filter(function(a){return a.check(data,streak);}).length;
 var achHTML=Object.entries(cats).map(function(ce){
  var cat=ce[0],achs=ce[1];
  var catUnlocked=achs.filter(function(a){return a.check(data,streak);}).length;
  var rows=achs.map(function(a){
   var unlocked=a.check(data,streak);
   return '<div class="ach'+(unlocked?' unlocked':'')+'">'+
    '<div class="ach-ic">'+a.ic+'</div>'+
    '<div class="ach-n">'+a.n+'</div>'+
    '<div class="ach-d">'+a.d+'</div>'+
    (unlocked?'<div style="font-size:9px;color:#FFD700;margin-top:2px">✓ Desbloqueado</div>':'')+
    '</div>';
  }).join('');
  return '<div style="margin-bottom:16px">'+
   '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
   '<div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:700;font-size:13px;color:#FF3B3B;text-transform:uppercase;letter-spacing:1px">'+cat+'</div>'+
   '<div style="font-size:10px;color:#555">'+catUnlocked+'/'+achs.length+'</div>'+
   '<div style="flex:1;height:2px;background:#1e1e1e;border-radius:1px"><div style="height:100%;background:#FF3B3B;border-radius:1px;width:'+(achs.length?Math.round(catUnlocked/achs.length*100):0)+'%"></div></div>'+
   '</div><div class="ach-grid">'+rows+'</div></div>';
 }).join('');
 var goals=data.goals||{};
 return '<div class="stitle">Metas</div>'+
  '<div class="stitle" style="font-size:16px;margin-bottom:8px;margin-top:4px">🏆 Logros <span style="font-size:12px;color:#555;font-family:\'Barlow\',sans-serif;font-weight:400">'+unlockedCount+'/'+ACHIEVEMENTS.length+' desbloqueados</span></div>'+
  '<div style="background:#141414;border-radius:12px;padding:12px;border:1px solid #1e1e1e;margin-bottom:14px">'+
  '<div style="flex:1;height:8px;background:#111;border-radius:4px"><div style="height:100%;background:linear-gradient(90deg,#FF3B3B,#FFD700);border-radius:4px;width:'+Math.round(unlockedCount/ACHIEVEMENTS.length*100)+'%"></div></div>'+
  '</div>'+achHTML+
  '</div>';
}

// ── CONFIG TAB ──
