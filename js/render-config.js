// ══ RENDER CONFIG ══
function rConfig(){
 var data=S.data;
 var rem=data.reminders||{};
 var settings=data.settings||{};
 var dayNames=['Lun','Mar','Mie','Jue','Vie','Sab','Dom'];
 var remDays=dayNames.map(function(name,i){
  var on=(rem.days||[0,1,2,3,4]).indexOf(i)>=0;
  return '<button class="mch'+(on?' on':'')+'" onclick="toggleRemDay('+i+')" style="'+(on?'background:#FF3B3B;border-color:#FF3B3B;color:#fff':'')+'">'+name+'</button>';
 }).join('');
 var notifStatus='';
 if(!('Notification' in window)){
  notifStatus='<div style="background:#2a1010;border-radius:8px;padding:10px;font-size:12px;color:#FF3B3B;text-align:center;margin-top:8px">Tu navegador no soporta notificaciones push</div>';
 } else if(Notification.permission==='denied'){
  notifStatus='<div style="background:#2a1010;border-radius:8px;padding:10px;font-size:12px;color:#FF6B6B;text-align:center;margin-top:8px">Notificaciones bloqueadas - ve a Ajustes > Safari > Notificaciones para activarlas</div>';
 } else if(Notification.permission==='granted'&&rem.enabled){
  notifStatus='<div style="background:#0c2a0c;border-radius:8px;padding:10px;font-size:12px;color:#4CAF50;text-align:center;margin-top:8px">Notificaciones activas</div>';
 } else {
  notifStatus='<div style="background:#1a1a1a;border-radius:8px;padding:10px;font-size:12px;color:#555;text-align:center;margin-top:8px">Activa el switch para recibir recordatorios</div>';
 }
 var restC=settings.restCompound||180;
 var restI=settings.restIso||90;
 return '<div class="stitle">Configuracion</div>'+
  '<div class="ct" style="color:#FF3B3B;margin-bottom:6px;font-size:11px">RECORDATORIOS</div>'+
  '<div class="card" style="margin-bottom:14px">'+
  '<div class="rem-row">'+
  '<div class="rem-info"><div class="rem-title">Recordatorios de entrenamiento</div><div class="rem-sub">Notificacion a la hora elegida</div></div>'+
  '<button class="tgl'+(rem.enabled?' on':'')+'" onclick="toggleReminder()"></button>'+
  '</div>'+
  '<div style="margin-top:14px">'+
  '<div class="il">Dias de entrenamiento</div>'+
  '<div class="mc" style="margin-bottom:12px;flex-wrap:wrap">'+remDays+'</div>'+
  '<div class="il">Hora del recordatorio</div>'+
  '<input type="time" value="'+(rem.time||'18:00')+'" onchange="setRemTime(this.value)" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:9px;padding:12px 14px;color:#eee;font-size:22px;font-family:\'Barlow Condensed\',sans-serif;font-weight:700;outline:none;width:100%;margin-bottom:6px;"/>'+
  notifStatus+
  '<div style="margin-top:12px;padding:10px;background:#0d0d0d;border-radius:8px;font-size:11px;color:#444;line-height:1.7">'+
  '<strong style="color:#555">iOS:</strong> La app debe estar anclada al inicio (Safari > Compartir > Anadir a pantalla de inicio). En iOS 16.4+ las notificaciones funcionan.<br>'+
  '<strong style="color:#555">Si no llegan:</strong> Ajustes > IronLog > Notificaciones > Permitir<br>'+
  '<strong style="color:#555">Funciona:</strong> La app necesita estar abierta o en segundo plano para recibir la notificacion.'+
  '</div>'+
  '</div></div>'+  '<div class="ct" style="color:#FF3B3B;margin-bottom:6px;font-size:11px">DATOS</div>'+
  '<div class="card" style="margin-bottom:14px">'+
  '<div style="font-size:11px;color:#555;margin-bottom:12px;line-height:1.5">Exporta tus datos para copia de seguridad. Puedes importarlos en otro dispositivo.</div>'+
  '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'+
  '<button class="bp bf" style="margin:0;background:#1e3a1e;border:1px solid #2a5a2a" onclick="exportData()">'+IC.export+' Exportar</button>'+
  '<button class="bs bf" style="margin:0" onclick="importData()">'+IC.import+' Importar</button>'+
  '</div>'+
  '<button class="bas" style="color:#FF3B3B;border-color:#3a1212" onclick="confirmReset()">Borrar todos los datos</button>'+
  '</div>';
}
