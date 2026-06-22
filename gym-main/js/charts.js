// ══ CHARTS ══
function svgLine(pts,W,H,clr){
 clr=clr||'#FF3B3B';
 if(!pts||pts.length<2)return '<svg width="'+W+'" height="'+H+'"><text x="'+(W/2)+'" y="'+(H/2)+'" text-anchor="middle" fill="#333" font-size="11" font-family="Barlow,sans-serif">Sin datos suficientes</text></svg>';
 var vs=pts.map(function(p){return p.v;});var mn=Math.min.apply(null,vs);var mx=Math.max.apply(null,vs);var rng=mx-mn||1;
 var pl=36,pr=10,pt=14,pb=22;var cw=W-pl-pr;var ch=H-pt-pb;var xs=cw/(pts.length-1);
 var co=pts.map(function(p,i){return{x:pl+i*xs,y:pt+ch-((p.v-mn)/rng)*ch,lbl:p.lbl,v:p.v};});
 var path=co.map(function(c,i){return(i?'L':'M')+c.x.toFixed(1)+','+c.y.toFixed(1);}).join(' ');
 var area=path+' L'+co[co.length-1].x.toFixed(1)+','+(pt+ch)+' L'+co[0].x.toFixed(1)+','+(pt+ch)+' Z';
 var gid='g'+Math.random().toString(36).slice(2,6);
 var yls=[mn,Math.round((mn+mx)/2),mx].map(function(v,i){return '<text x="'+(pl-4)+'" y="'+(pt+ch-i*ch/2+4)+'" text-anchor="end" fill="#444" font-size="9" font-family="Barlow,sans-serif">'+v+'</text>';}).join('');
 var si=pts.length<=6?pts.map(function(_,i){return i;}):[0,Math.floor(pts.length/2),pts.length-1];
 var xls=si.map(function(i){return '<text x="'+co[i].x.toFixed(1)+'" y="'+(H-3)+'" text-anchor="middle" fill="#444" font-size="9" font-family="Barlow,sans-serif">'+pts[i].lbl+'</text>';}).join('');
 var dots=co.map(function(c){return '<circle cx="'+c.x.toFixed(1)+'" cy="'+c.y.toFixed(1)+'" r="3.5" fill="'+clr+'" stroke="#141414" stroke-width="1.5"/>';}).join('');
 return '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" style="overflow:visible"><defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+clr+'" stop-opacity=".2"/><stop offset="100%" stop-color="'+clr+'" stop-opacity="0"/></linearGradient></defs><line x1="'+pl+'" y1="'+pt+'" x2="'+pl+'" y2="'+(pt+ch)+'" stroke="#1e1e1e" stroke-width="1"/><line x1="'+pl+'" y1="'+(pt+ch)+'" x2="'+(pl+cw)+'" y2="'+(pt+ch)+'" stroke="#1e1e1e" stroke-width="1"/><path d="'+area+'" fill="url(#'+gid+')"/><path d="'+path+'" stroke="'+clr+'" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+dots+yls+xls+'</svg>';
}
function svgBar(bars,W,H,clr){
 clr=clr||'#FF3B3B';
 var vs=bars.map(function(b){return b.v;});var mx=Math.max.apply(null,vs.concat([1]));
 var pl=6,pr=6,pt=8,pb=20;var cw=W-pl-pr;var ch=H-pt-pb;
 var bw=Math.max(Math.floor(cw/bars.length)-4,4);
 var rects=bars.map(function(b,i){
  var bh=Math.max((b.v/mx)*ch,b.v>0?4:2);var x=pl+i*(cw/bars.length)+1;var y=pt+ch-bh;
  return '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw+'" height="'+bh.toFixed(1)+'" rx="3" fill="'+(b.v>0?clr:'#1e1e1e')+'"/><text x="'+((x+bw/2)).toFixed(1)+'" y="'+(H-3)+'" text-anchor="middle" fill="#444" font-size="8.5" font-family="Barlow,sans-serif">'+b.lbl+'</text>';
 }).join('');
 return '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+rects+'</svg>';
}

