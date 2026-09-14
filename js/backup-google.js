// ══ GOOGLE DRIVE BACKUP ══
// Conexión OAuth con Google Identity Services + subida a Drive usando SIEMPRE el mismo archivo
// en la carpeta appDataFolder (oculta, no aparece en tu Drive normal, no se acumula basura).

// 1) IMPORTANTE: Reemplaza este Client ID por el tuyo de Google Cloud Console.
//    Pasos: console.cloud.google.com → API y servicios → Credenciales → Crear credenciales
//    → ID de cliente OAuth 2.0 → Tipo "Aplicación web" → Orígenes JS autorizados:
//    añade tu dominio (https://tudominio.github.io) → Copia el Client ID aquí abajo.
const GOOGLE_CLIENT_ID='REEMPLAZAR_CON_TU_CLIENT_ID.apps.googleusercontent.com';

// 2) Scopes: drive.file = solo puede acceder a archivos que la app creó (no a tus otros docs).
//    Eso es más seguro y suficiente para backups.
const DRIVE_SCOPES='https://www.googleapis.com/auth/drive.file';

// 3) Nombre del archivo y carpeta. SIEMPRE el mismo → se sobrescribe, no se acumulan copias.
const BACKUP_FILENAME='ironlog_backup.json';
const BACKUP_MIME='application/json';

// 4) APIs de Google Drive v3
const DRIVE_LIST_API='https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_API='https://www.googleapis.com/upload/drive/v3/files';

// Tokens en memoria
let _tokenClient=null;
let _currentToken=null;
let _tokenExp=0;

// Inicializa Google Identity Services
function initGoogleAuth(){
 if(typeof google==='undefined'||!google.accounts||!google.accounts.oauth2)return false;
 try{
  _tokenClient=google.accounts.oauth2.initTokenClient({
   client_id:GOOGLE_CLIENT_ID,
   scope:DRIVE_SCOPES,
   callback:function(){} // se sobreescribe en cada request
  });
  return true;
 }catch(e){
  console.error('Error init Google auth:',e);
  return false;
 }
}

// Solicita acceso (popup OAuth)
window.gdriveConnect=function(){
 return new Promise(function(resolve,reject){
  if(!_tokenClient&&!initGoogleAuth()){
   reject(new Error('Google Identity Services no disponible. Revisá que el script esté cargado y que el Client ID esté bien configurado.'));
   return;
  }
  _tokenClient.callback=function(resp){
   if(resp.error){
    reject(new Error(resp.error_description||resp.error));
    return;
   }
   _currentToken=resp.access_token;
   _tokenExp=Date.now()+(resp.expires_in*1000);
   var d=cd();
   d.googleAuth={
    connected:true,
    accessToken:_currentToken,
    expiresAt:_tokenExp,
    email:'', // se completa cuando pidamos info de usuario
    connectedAt:Date.now()
   };
   st({data:d});
   // Traer email del usuario (best-effort)
   gdriveGetUserInfo().then(function(info){
    var d2=cd();
    if(d2.googleAuth&&info&&info.email)d2.googleAuth.email=info.email;
    st({data:d2});
    resolve(info);
   }).catch(function(){resolve({email:''});});
  };
  _tokenClient.requestAccessToken({prompt:'consent'});
 });
};

window.gdriveDisconnect=function(){
 var d=cd();
 delete d.googleAuth;
 delete d.lastBackupDate;
 st({data:d});
 tst('☁️ Desconectado de Google');
};

function gdriveGetUserInfo(){
 if(!_currentToken)return Promise.reject(new Error('no token'));
 return fetch('https://www.googleapis.com/oauth2/v2/userinfo',{
  headers:{Authorization:'Bearer '+_currentToken}
 }).then(function(r){return r.json();});
}

// Devuelve token válido (refresh implícito pidiendo nuevo token)
function ensureToken(){
 if(_currentToken&&Date.now()<_tokenExp-60000)return Promise.resolve(_currentToken);
 // Token expirado o no existe → reconectar
 return window.gdriveConnect().then(function(){return _currentToken;});
}

// Busca el archivo backup en appDataFolder. Si existe devuelve id, si no null.
function gdriveFindBackup(token){
 var q="name='"+BACKUP_FILENAME+"' and 'appDataFolder' in parents and trashed=false";
 return fetch(DRIVE_LIST_API+"?q="+encodeURIComponent(q)+"&spaces=appDataFolder&fields=files(id,name,modifiedTime)",{
  headers:{Authorization:'Bearer '+token}
 }).then(function(r){return r.json();}).then(function(d){return d.files&&d.files.length?d.files[0]:null;});
}

// Genera el contenido del backup (incluye timestamp dentro del archivo para trazabilidad)
function buildBackupPayload(){
 return Object.assign({},S.data,{
  _backupMeta:{
   date:new Date().toISOString(),
   version:1,
   app:'IronLog',
   device:navigator.userAgent.substring(0,80)
  }
 });
}

// Backup principal: SIEMPRE sobrescribe. Nunca crea archivo nuevo.
window.gdriveBackupNow=function(manual){
 return ensureToken().then(function(token){
  var payload=buildBackupPayload();
  var body=JSON.stringify(payload);
  return gdriveFindBackup(token).then(function(existing){
   if(existing){
    // Sobrescribir archivo existente (PATCH con mismo nombre SIEMPRE mantiene id)
    return fetch(DRIVE_UPLOAD_API+'/'+existing.id,{
     method:'PATCH',
     headers:{Authorization:'Bearer '+token,'Content-Type':BACKUP_MIME},
     body:body
    }).then(function(r){
     if(!r.ok)throw new Error('PATCH fallo: '+r.status);
     return r.json();
    });
   }else{
    // Crear nuevo (primera vez)
    var meta={name:BACKUP_FILENAME,parents:['appDataFolder'],mimeType:BACKUP_MIME};
    var form=new FormData();
    form.append('metadata',new Blob([JSON.stringify(meta)],{type:'application/json'}));
    form.append('file',new Blob([body],{type:BACKUP_MIME}));
    return fetch(DRIVE_UPLOAD_API+'?uploadType=multipart&fields=id,name',{
     method:'POST',
     headers:{Authorization:'Bearer '+token},
     body:form
    }).then(function(r){
     if(!r.ok)throw new Error('POST fallo: '+r.status);
     return r.json();
    });
   }
  }).then(function(file){
   var d=cd();
   d.lastBackupDate=Date.now();
   d.googleAuth=d.googleAuth||{};
   d.googleAuth.lastFileId=file.id;
   st({data:d});
   if(manual)tst('☁️ Backup guardado · '+(Math.round(body.length/1024))+'KB');
   return file;
  });
 });
};

// Borra versiones viejas (por seguridad, si quedó algo). NO debería haber más de 1.
window.gdriveCleanupOld=function(){
 return ensureToken().then(function(token){
  var q="name='"+BACKUP_FILENAME+"' and trashed=false";
  return fetch(DRIVE_LIST_API+"?q="+encodeURIComponent(q)+"&spaces=appDataFolder&fields=files(id,name,modifiedTime)",{
   headers:{Authorization:'Bearer '+token}
  }).then(function(r){return r.json();}).then(function(d){
   if(!d.files||d.files.length<=1)return 0; // solo hay 0 o 1, está OK
   // Hay más de 1 — borrar todos menos el más reciente
   d.files.sort(function(a,b){return new Date(b.modifiedTime)-new Date(a.modifiedTime);});
   var toDelete=d.files.slice(1);
   return Promise.all(toDelete.map(function(f){
    return fetch(DRIVE_UPLOAD_API+'/'+f.id,{method:'DELETE',headers:{Authorization:'Bearer '+token}});
   })).then(function(){return toDelete.length;});
  });
 }).then(function(deleted){
  if(deleted>0)tst('🧹 Borradas '+deleted+' copias viejas');
 });
};

// Auto-backup semanal: chequea si pasaron 7+ días y sugiere al usuario
window.gdriveCheckAutoBackup=function(){
 var d=S.data;
 if(!d.googleAuth||!d.googleAuth.connected)return;
 if(!d.lastBackupDate){
  // Nunca se hizo backup → ofrecer
  setTimeout(function(){tst('☁️ Hacé tu primera copia tocando "Copia ahora"');},3000);
  return;
 }
 var daysSince=(Date.now()-d.lastBackupDate)/(1000*60*60*24);
 if(daysSince>=7){
  // Sugerir backup (silencioso pero con toast al terminar)
  gdriveBackupNow().then(function(){
   tst('☁️ Backup semanal hecho automáticamente · hace '+(Math.round(daysSince))+' días era el último');
  }).catch(function(){
   tst('⚠️ No pude hacer el backup automático — tocá "Copia ahora"');
  });
 }
};

// Configuración reactiva: si el usuario edita GOOGLE_CLIENT_ID en runtime, reinicializa
function getConfigClientId(){return GOOGLE_CLIENT_ID;}
