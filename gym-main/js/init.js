// ══ INIT ══
(function(){
 var path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
 var pageMap={
  '': 'calendar',
  'index.html':'calendar',
  'entreno.html':'calendar',
  'ejercicios.html':'exercises',
  'progreso.html':'progress',
  'logros.html':'motivation',
  'configuracion.html':'config'
 };
 var titleMap={
  'index.html':'IronLog',
  'entreno.html':'IronLog · Entreno',
  'ejercicios.html':'IronLog · Ejercicios',
  'progreso.html':'IronLog · Progreso',
  'logros.html':'IronLog · Logros',
  'configuracion.html':'IronLog · Configuración'
 };
 if(pageMap[path]) S.tab=pageMap[path];
 if(titleMap[path]) document.title=titleMap[path];
 render();
 var appEl=document.getElementById('app');if(appEl)appEl.removeAttribute('aria-busy');
 window.setupReminders();
 document.addEventListener('visibilitychange',function(){
  if(!document.hidden){window.setupReminders();}
 });
})();

if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(function(){});}
