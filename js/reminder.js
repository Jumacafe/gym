// ══ REMINDER CHECK SYSTEM ══
window.setupReminders=function(){
 if(window.reminderCheckInterval)clearInterval(window.reminderCheckInterval);
 if(!S.data.reminders.enabled){return;}
 if(!('Notification' in window)){return;}
 if(Notification.permission!=='granted'){return;}

 window.reminderCheckInterval=setInterval(function(){
  var now=new Date();
  var hh=String(now.getHours()).padStart(2,'0');
  var mm=String(now.getMinutes()).padStart(2,'0');
  var ct=hh+':'+mm;
  var cwd=(now.getDay()+6)%7;
  var today=dk(now);

  // ── Recordatorio programado por hora/día ──
  if(S.data.reminders.time===ct&&S.data.reminders.days.indexOf(cwd)>=0){
   var lastNotified=S.data.reminders.lastNotified||{};
   if(!lastNotified[today]||lastNotified[today]!==ct){
    new Notification('🏋️ ¡Hora de entrenar!',{
     body:'Tu sesión de entrenamiento te espera\n'+window.getTimezone(),
     tag:'ironlog-reminder-'+today,
     requireInteraction:true,
     icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23FF3B3B" width="100" height="100"/><text x="50" y="70" font-size="60" text-anchor="middle" fill="white">💪</text></svg>'
    });
    S.data.reminders.lastNotified=lastNotified;
    S.data.reminders.lastNotified[today]=ct;
    sv(S.data);
   }
  }

  // ── Notificación de RACHA EN PELIGRO ──
  // Si el usuario tiene una racha activa (≥3 días) y aún no entrenó hoy,
  // se le recuerda a las 20:00 que la racha está por romperse.
  checkStreakReminder(now,today);
 },10000);
};

// Notificación especial cuando la racha está por romperse.
// Reglas:
//   • Solo si la racha actual ≥ 3 días.
//   • Solo una vez por día (control por S.data.reminders.streakNudge).
//   • Solo si NO entrenó hoy todavía.
//   • Dispara a las 20:00 hora local (configurable con reminders.streakHour).
window.checkStreakReminder=function(now,today){
 try{
  if(!('Notification' in window))return;
  if(Notification.permission!=='granted')return;
  if(!S.data.reminders)return;

  var streak=typeof calcStreak==='function'?calcStreak(S.data.workouts):0;
  if(streak<3)return; // solo si la racha vale la pena salvar

  var trainedToday=(S.data.workouts[today]||[]).length>0;
  if(trainedToday)return; // ya entrenó, no hay racha en peligro

  var hour=now.getHours();
  var min=now.getMinutes();
  var nudgeHour=typeof S.data.reminders.streakHour==='number'?S.data.reminders.streakHour:20;
  // Ventana de 10 minutos alrededor de la hora objetivo (una vez por día)
  if(hour!==nudgeHour||min>9)return;

  var nudges=S.data.reminders.streakNudges||{};
  if(nudges[today])return; // ya avisamos hoy

  nudges[today]=true;
  S.data.reminders.streakNudges=nudges;
  sv(S.data);

  new Notification('🔥 Tu racha de '+streak+' días está en peligro',{
   body:'Si no entrenás hoy, la racha se rompe mañana. ¡Sumá aunque sea una sesión corta!',
   tag:'ironlog-streak-'+today,
   requireInteraction:true,
   icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23FF6B00" width="100" height="100"/><text x="50" y="72" font-size="60" text-anchor="middle" fill="white">🔥</text></svg>'
  });
 }catch(e){console.error('checkStreakReminder',e);}
};

