// ══ WAKE LOCK ══
// Mantiene la pantalla encendida durante el entreno para que no se apague
// entre series. Usa la Screen Wake Lock API (navigator.wakeLock) cuando está
// disponible. Se activa automáticamente al entrar al tab calendar y se
// libera al salir, al perder visibilidad y al cerrar la pestaña.

var _wlSentinel=null;
var _wlRequested=false;
var _wlAvailable=('wakeLock' in navigator);

function _wlEnabled(){
 // Default: activado si el navegador lo soporta.
 var s=(S.data&&S.data.settings)||{};
 if(typeof s.wakeLock==='boolean')return s.wakeLock;
 return _wlAvailable;
}

window.acquireWakeLock=async function(){
 if(!_wlAvailable)return;
 if(!_wlEnabled())return;
 if(_wlSentinel)return; // ya activo
 try{
  _wlSentinel=await navigator.wakeLock.request('screen');
  _wlSentinel.addEventListener('release',function(){
   // El sentinel se libera solo cuando el doc pierde visibilidad; lo limpiamos.
   _wlSentinel=null;
  });
 }catch(e){
  // Permiso denegado o no disponible en este contexto: silencio.
  _wlSentinel=null;
 }
};

window.releaseWakeLock=function(){
 try{
  if(_wlSentinel){
   _wlSentinel.release().catch(function(){});
   _wlSentinel=null;
  }
 }catch(e){}
};

// Re-adquirir cuando el documento vuelve a estar visible (PWA vuelve del fondo)
document.addEventListener('visibilitychange',function(){
 if(document.visibilityState==='visible'){
  // Solo re-adquirir si estamos en la pestaña calendar (donde se entrena).
  if(S&&S.tab==='calendar')window.acquireWakeLock();
 } else {
  window.releaseWakeLock();
 }
});

// Activación automática al cambiar de tab.
// Llamamos a esto desde render() cuando el tab es calendar.
window.updateWakeLock=function(){
 if(S&&S.tab==='calendar'){
  window.acquireWakeLock();
 } else {
  window.releaseWakeLock();
 }
};
