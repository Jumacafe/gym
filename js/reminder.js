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
 },10000);
};

