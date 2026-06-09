// ══ TIMER SYSTEM MEJORADO ══
window.startTimerModal=function(){
 if(window.timerInterval)clearInterval(window.timerInterval);
 var m=parseInt(document.getElementById('timerMin').value)||0;
 var s=parseInt(document.getElementById('timerSec').value)||0;
 var total=(m*60)+s;
 if(total<=0){tst('Establece un tiempo válido');return;}
 var remaining=total;
 window.timerInterval=setInterval(function(){
  remaining--;
  var mm=Math.floor(remaining/60);
  var ss=remaining%60;
  var dsp=String(mm).padStart(2,'0')+':'+String(ss).padStart(2,'0');
  var el=document.getElementById('timerDisplay');
  if(el)el.textContent=dsp;
  if(remaining<=0){
   clearInterval(window.timerInterval);
   if('Notification' in window&&Notification.permission==='granted'){
    new Notification('⏱️ ¡Tiempo terminado!',{
     body:'Tu descanso ha finalizado',
     tag:'timer',
     requireInteraction:true
    });
   }
   tst('⏱️ ¡Descanso completado!');
  }
 },1000);
};

window.pauseTimerModal=function(){
 if(window.timerInterval){
  clearInterval(window.timerInterval);
  window.timerInterval=null;
  tst('⏸️ Temporizador pausado');
 }else{
  tst('▶️ Reanudando...');
  window.startTimerModal();
 }
};

