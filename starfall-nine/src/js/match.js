'use strict';
/* ================= MATCH VIEWER =================
   Two fixed 3D cameras (pitch camera behind the plate, field camera high behind home). Each static stadium is rendered once
   to an offscreen canvas; the frame loop pans/zooms that bitmap in 2D and draws players, ball and effects through the same camera. */
let V=null,DPR=1;
const RMO=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect)CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h){this.rect(x,y,w,h)};
const TAU=Math.PI*2,INK='#0a0e13',FONTD='"Barlow Condensed","Arial Narrow",system-ui,sans-serif';
const sstep=u=>u<=0?0:u>=1?1:u*u*(3-2*u),nrm=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l]};
const hex=c=>{c=c.replace('#','');if(c.length===3)c=c.replace(/./g,'$&$&');return[1,3,5].map(i=>parseInt(('#'+c).slice(i,i+2),16))};
const mixc=(a,b,f)=>{const p=hex(a),q=hex(b);return'rgb('+p.map((v,i)=>Math.round(v+(q[i]-v)*f)).join(',')+')'};
const lum=c=>{const p=hex(c);return(p[0]*.299+p[1]*.587+p[2]*.114)/255};
const seedRnd=s=>()=>(s=(s*16807)%2147483647)/2147483647;
const gz=(x,y)=>0;// the mound is drawn flat, so figures stand at ground level everywhere
/* ---------- cameras ---------- */
function mkCam(pos,look){const f=nrm([look[0]-pos[0],look[1]-pos[1],look[2]-pos[2]]),r=nrm([f[1],-f[0],0]),u=[r[1]*f[2]-r[2]*f[1],r[2]*f[0]-r[0]*f[2],r[0]*f[1]-r[1]*f[0]];return{p:pos,f,r,u,foc:500,cx:0,cy:0}}
function pj(c,x,y,z){const dx=x-c.p[0],dy=y-c.p[1],dz=z-c.p[2];let d=dx*c.f[0]+dy*c.f[1]+dz*c.f[2];if(d<.8)d=.8;const k=c.foc/d;
  return[c.cx+(dx*c.r[0]+dy*c.r[1])*k,c.cy-(dx*c.u[0]+dy*c.u[1]+dz*c.u[2])*k,k]}
// fit a camera so the given world points fill a screen rectangle
function fitCam(c,pts,r,pad=1){c.foc=1;c.cx=c.cy=0;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of pts){const q=pj(c,p[0],p[1],p[2]||0);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}
  c.foc=Math.min(r.w/(x1-x0),r.h/(y1-y0))*pad;c.cx=r.x+r.w/2-c.foc*(x0+x1)/2;c.cy=r.y+r.h/2-c.foc*(y0+y1)/2;return c}
// world polygon -> canvas path, clipped against the camera near plane
function pathW(x,c,pts,z0,open){const q=[],N=1.5;for(const p of pts){const dx=p[0]-c.p[0],dy=p[1]-c.p[1],dz=(p.length>2?p[2]:z0||0)-c.p[2];q.push([dx*c.r[0]+dy*c.r[1],dx*c.u[0]+dy*c.u[1]+dz*c.u[2],dx*c.f[0]+dy*c.f[1]+dz*c.f[2]])}
  const o=[],n=q.length;for(let i=0;i<n;i++){const a=q[i],b=q[(i+1)%n],ia=a[2]>=N,ib=b[2]>=N;if(ia)o.push(a);if(ia!==ib&&(!open||i<n-1)){const t=(N-a[2])/(b[2]-a[2]);o.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,N])}}
  x.beginPath();for(let i=0;i<o.length;i++){const p=o[i],k=c.foc/p[2],X=c.cx+p[0]*k,Y=c.cy-p[1]*k;i?x.lineTo(X,Y):x.moveTo(X,Y)}if(!open)x.closePath();return o.length}
/* ---------- stadium ---------- */
const FIELD_B=(()=>{const o=[];for(let i=0;i<=44;i++){const a=(-45+i*90/44)*Math.PI/180,r=fenceR(a);o.push([Math.sin(a)*r,Math.cos(a)*r,1])}
  const s=[[196,160],[160,92],[132,38],[108,-10],[86,-42],[48,-62],[0,-68]];for(const p of s)o.push([p[0],p[1],0]);for(let i=s.length-2;i>=0;i--)o.push([-s[i][0],s[i][1],0]);return o})();
const arcPts=(cx,cy,r,a0,a1,n)=>{const o=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push([cx+Math.sin(a)*r,cy+Math.cos(a)*r])}return o};
function drawStadium(x,c,W,H,tm,o={}){
  const rnd=seedRnd(11),c1=tm.c1||'#e23d4b',c2=tm.c2||'#ffd23f',q=o.q||1;
  const P=(pts,z)=>pathW(x,c,pts,z),fill=(pts,col,z)=>{if(P(pts,z)>2){x.fillStyle=col;x.fill()}};
  const out=(p,d,z)=>{const dx=p[0],dy=p[1]-95,l=Math.hypot(dx,dy)||1;return[p[0]+dx/l*d,p[1]+dy/l*d,z]};
  const hz=pj(c,c.p[0]+c.f[0]*4e4,c.p[1]+c.f[1]*4e4,c.p[2])[1],Y0=o.band?o.band[0]:0,Y1=o.band?o.band[1]:H;
  // sky
  let g;if(o.sky!==false){g=x.createLinearGradient(0,Math.min(hz-H*.9,0),0,Math.max(hz,40));g.addColorStop(0,'#04060d');g.addColorStop(.55,'#0a1124');g.addColorStop(.86,'#16203f');g.addColorStop(1,'#2a2f55');
  x.fillStyle=g;x.fillRect(0,Y0,W,Y1-Y0);
  x.fillStyle='#fff';for(let i=0;i<90*q;i++){const sx=rnd()*W,sy=Y0+rnd()*Math.max(hz-30-Y0,0);x.globalAlpha=.12+rnd()*.5;x.fillRect(sx,sy,rnd()<.15?1.6:1,1)}x.globalAlpha=1;
  x.fillStyle='#090d14';x.fillRect(0,Math.max(Y0,hz-2),W,Y1-Math.max(Y0,hz-2))}
  // seating bowl
  const B=FIELD_B,n=B.length,ring=(d,z)=>B.map(p=>out(p,d,z));
  const crowdCols=[c1,c1,c2,'#e9ecef','#c9ced6','#8d99ae','#39424f','#2a3240','#4a5568','#e9c46a','#b0413e','#5b7fa6'];
  const dim=(c,f)=>mixc(c,'#0a0f18',f),crowdD=crowdCols.map(c=>dim(c,.42)),skinD=SKIN.map(c=>dim(c,.4));
  const tier=(d0,z0,d1,z1,from,to,occ,base)=>{const a=ring(d0,z0),b=ring(d1,z1);
    for(let i=from;i<to;i++){if(pathW(x,c,[a[i],a[i+1],b[i+1],b[i]])>2){x.fillStyle=base;x.fill();x.strokeStyle=base;x.lineWidth=1;x.stroke()}}
    if(!occ)return;const rows=Math.max(3,Math.round((d1-d0)/3));
    for(let r=rows-1;r>=0;r--){const f=(r+.5)/rows,wz=lerp(z0,z1,f)+.5;
      for(let i=from;i<to;i++){const ax=lerp(a[i][0],b[i][0],f),ay=lerp(a[i][1],b[i][1],f),bx=lerp(a[i+1][0],b[i+1][0],f),by=lerp(a[i+1][1],b[i+1][1],f),nn=Math.max(1,Math.round(Math.hypot(bx-ax,by-ay)/2.1));
        for(let k=0;k<nn;k++){const u=(k+.2+rnd()*.6)/nn,pick2=rnd(),pk3=rnd();if(pick2>occ*q)continue;const wx=lerp(ax,bx,u),wy=lerp(ay,by,u);
          if((wx-c.p[0])*c.f[0]+(wy-c.p[1])*c.f[1]+(wz-c.p[2])*c.f[2]<8)continue;const s=pj(c,wx,wy,wz);if(s[0]<-4||s[0]>W+4||s[1]<Y0-4||s[1]>Y1+4)continue;
          const kk=s[2],w=kk*1.6,h=kk*1.55;x.fillStyle=pk3<.03?'#e9f1ff':crowdD[Math.floor(pk3*977)%crowdD.length];x.fillRect(s[0]-w/2,s[1]-h,w,h);
          x.fillStyle=skinD[Math.floor(pk3*311)%5];x.beginPath();x.arc(s[0],s[1]-h-kk*.25,kk*.45,0,TAU);x.fill()}}}};
  const iOF=44,iR=iOF+5,iL=n-5;// boundary index ranges: 0..44 outfield wall, then first-base side, backstop, third-base side
  if(o.stands!==false&&!o.close){
    tier(70,54,132,98,0,iOF,.8,'#10151f');tier(4,10,62,44,0,iOF,.86,'#131a26');
    tier(72,58,128,100,iOF,iR,.78,'#10151f');tier(72,58,128,100,iL,n-1,.78,'#10151f');tier(3,6,64,48,iOF,iR,.86,'#131a26');tier(3,6,64,48,iL,n-1,.86,'#131a26');
    if(!o.noBack)tier(3,4.8,70,30,iR,iL,0,'#0c1017');
    // upper-deck fascia light strip
    for(const rg of [[0,iOF],[iOF,iR],[iL,n-1]]){pathW(x,c,ring(66,50).slice(rg[0],rg[1]+1),0,true);x.strokeStyle='rgba(120,170,255,.35)';x.lineWidth=1.5;x.stroke()}
    // scoreboard
    const sb=[[-78,512,104],[78,512,104],[78,512,150],[-78,512,150]];if(P(sb)>2){x.fillStyle='#070a10';x.fill();x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=1;x.stroke();
      const a=pj(c,0,512,127);if(a[2]>.2){x.fillStyle=c1;x.globalAlpha=.9;x.textAlign='center';x.textBaseline='middle';x.font=`800 ${a[2]*26}px ${FONTD}`;x.fillText('STARFALL',a[0],a[1]-a[2]*8);x.fillStyle='#e9eef4';x.font=`700 ${a[2]*13}px ${FONTD}`;x.fillText('BALLPARK',a[0],a[1]+a[2]*13);x.globalAlpha=1}}
    // light towers
    const tw=[[5,150],[17,165],[27,165],[39,150],[iOF+2,140],[n-3,140]];
    for(const [i,ht] of tw){const b=out(B[i],150,0),t=[b[0],b[1],ht],s0=pj(c,b[0],b[1],40),s1=pj(c,t[0],t[1],t[2]);if(s1[2]<.05)continue;
      x.strokeStyle='#1b2230';x.lineWidth=Math.max(1.5,s1[2]*3);x.beginPath();x.moveTo(s0[0],s0[1]);x.lineTo(s1[0],s1[1]);x.stroke();
      const w=s1[2]*30,h=s1[2]*15;x.fillStyle='#0d1118';x.fillRect(s1[0]-w/2-1,s1[1]-h-1,w+2,h+2);
      for(let r=0;r<3;r++)for(let k=0;k<6;k++){x.fillStyle=(r+k)%5?'#fff7da':'#ffe9a8';x.fillRect(s1[0]-w/2+k*w/6+.5,s1[1]-h+r*h/3+.5,w/6-1,h/3-1)}
      x.globalCompositeOperation='lighter';const rr=Math.max(30,s1[2]*120);g=x.createRadialGradient(s1[0],s1[1]-h/2,1,s1[0],s1[1]-h/2,rr);g.addColorStop(0,'rgba(255,246,214,.75)');g.addColorStop(.25,'rgba(255,236,190,.22)');g.addColorStop(1,'rgba(255,236,190,0)');x.fillStyle=g;x.fillRect(s1[0]-rr,s1[1]-h/2-rr,rr*2,rr*2);x.globalCompositeOperation='source-over'}
  }
  if(o.close){// telephoto backdrop behind the plate: individual spectators, later softened by the caller
    const a=ring(3,4.8),b=ring(96,40);for(let i=iR;i<iL;i++)if(pathW(x,c,[a[i],a[i+1],b[i+1],b[i]])>2){x.fillStyle='#0c1119';x.fill();x.strokeStyle='#0c1119';x.lineWidth=2;x.stroke()}
    const cols=[c1,c2,'#e9ecef','#c9ced6','#8d99ae','#566074','#39424f','#7a8aa3','#e9c46a','#b0413e','#5b7fa6','#3d6b57','#d98d5c'];
    for(let r=22;r>=0;r--){const d=5+r*3.4,zz=5.3+r*1.28;for(let u=-34;u<=34;u++){const ang=u*.034+(r%2)*.017+(rnd()-.5)*.006,wx=Math.sin(ang)*(68+d)*1.02,wy=-Math.cos(ang)*(68+d),s=pj(c,wx,wy,zz);if(rnd()<.1||s[0]<-60||s[0]>W+60||s[1]<-60||s[1]>H+60)continue;
        const k=s[2],sh=clamp(1-r*.028,.3,1),col=mixc(cols[Math.floor(rnd()*cols.length)],'#0a0e13',1-sh*.8),sk=mixc(SKIN[Math.floor(rnd()*5)],'#0a0e13',1-sh*.85),lean=(rnd()-.5)*.25*k;
        x.fillStyle=col;x.beginPath();x.roundRect(s[0]-k*.95,s[1]-k*1.75,k*1.9,k*2.2,k*.55);x.fill();
        x.fillStyle=sk;x.beginPath();x.arc(s[0]+lean,s[1]-k*2.25,k*.47,0,TAU);x.fill();
        x.fillStyle=mixc(HAIR[Math.floor(rnd()*10)],'#0a0e13',.55);x.beginPath();x.arc(s[0]+lean,s[1]-k*2.35,k*.5,Math.PI*1.05,Math.PI*1.95);x.fill();
        if(rnd()<.18){x.fillStyle=sk;x.beginPath();x.roundRect(s[0]+(rnd()<.5?-1.25:.85)*k,s[1]-k*3.1,k*.4,k*1.5,k*.2);x.fill()}}}}
  // walls
  const wallC=mixc('#0d2030',c1,.16);if(o.walls!==false){
  for(let i=0;i<n-1;i++){const a=B[i],b=B[i+1],of=a[2]&&b[2],hgt=of?9:(i>=iR&&i<iL?4.6:5);
    if(pathW(x,c,[[a[0],a[1],0],[b[0],b[1],0],[b[0],b[1],hgt],[a[0],a[1],hgt]])>2){x.fillStyle=of?wallC:'#111a25';x.fill();x.strokeStyle=of?'rgba(0,0,0,.35)':'rgba(255,255,255,.05)';x.lineWidth=1;x.stroke()}}
  pathW(x,c,B.slice(0,iOF+1).map(p=>[p[0],p[1],9]),0,true);x.strokeStyle='#f2c14e';x.lineWidth=Math.max(1.2,pj(c,0,400,9)[2]*1.1);x.stroke();
  pathW(x,c,B.slice(iOF).map(p=>[p[0],p[1],5]),0,true);x.strokeStyle='rgba(255,255,255,.16)';x.lineWidth=1;x.stroke();
  x.textAlign='center';x.textBaseline='middle';
  for(const [deg,tx] of [[-43,'330'],[-22,'375'],[0,'400'],[22,'375'],[43,'330']]){const a=deg*Math.PI/180,r=fenceR(a),s=pj(c,Math.sin(a)*r,Math.cos(a)*r,4.6);if(s[2]<.25)continue;x.font=`700 ${s[2]*5.4}px ${FONTD}`;x.fillStyle='rgba(242,193,78,.92)';x.fillText(tx,s[0],s[1])}
  for(const sx of [-1,1]){const a=pj(c,sx*233.3,233.3,0),b=pj(c,sx*233.3,233.3,46);x.strokeStyle='#f2c14e';x.lineWidth=Math.max(1.5,a[2]*1.3);x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke()}
  if(o.close){// padded backstop with a soft club wordmark
    const top=B.slice(iR,iL+1).map(p=>[p[0],p[1],4.6]);pathW(x,c,top,0,true);x.strokeStyle=mixc('#1c3a4a',c1,.3);x.lineWidth=Math.max(2,pj(c,0,-68,4.6)[2]*.5);x.stroke();
    const s=pj(c,0,-67.6,2.3);x.fillStyle='rgba(233,238,244,.5)';x.font=`800 ${s[2]*1.25}px ${FONTD}`;x.fillStyle='rgba(233,238,244,.2)';x.font=`800 ${s[2]*1.05}px ${FONTD}`;for(const dx of [-17,0,17]){const t=pj(c,dx,-66.8,2.3);x.fillText(dx?'BALLPARK':'STARFALL NINE',t[0],t[1])}
    for(let i=-4;i<=4;i++){const a=pj(c,i*5.2+2.6,-67.9,0),b=pj(c,i*5.2+2.6,-67.9,4.6);x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=1;x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke()}}}
  if(o.ground===false)return;
  // ground
  const fieldPoly=B.map(p=>[p[0],p[1]]);
  x.save();P(fieldPoly);x.fillStyle='#2b7a45';x.fill();x.clip();
  // mowing pattern: outfield checker of sectors and rings, straight stripes inside 150 ft
  for(let i=0;i<24;i++){if(i%2)continue;const a0=(-72+i*6)*Math.PI/180,a1=a0+6*Math.PI/180;fill([[Math.sin(a0)*150,Math.cos(a0)*150],[Math.sin(a0)*440,Math.cos(a0)*440],[Math.sin(a1)*440,Math.cos(a1)*440],[Math.sin(a1)*150,Math.cos(a1)*150]],'rgba(255,255,255,.055)')}
  for(let r=150,i=0;r<440;r+=29,i++){if(i%2)continue;fill(arcPts(0,0,r,-1.3,1.3,36).concat(arcPts(0,0,r+29,1.3,-1.3,36)),'rgba(0,0,0,.075)')}
  for(let i=-16;i<16;i++){if(i&1)continue;const pts=[];for(const yy of [-70,-30,10,50,90,130,150])pts.push([i*10,yy]);for(const yy of [150,130,90,50,10,-30,-70])pts.push([i*10+10,yy]);
    x.save();P(arcPts(0,0,150,0,TAU,48));x.clip();fill(pts,'rgba(255,255,255,.05)');x.restore()}
  // warning track
  const wt=B.slice(0,iOF+1).map(p=>[p[0],p[1]]);
  {const inner=[];for(let i=iOF;i>=0;i--){const a=(-45+i*90/44)*Math.PI/180,r=fenceR(a)-15;inner.push([Math.sin(a)*r,Math.cos(a)*r])}fill(wt.concat(inner),'#8a623c')}
  {const s=B.slice(iOF),inn=s.map(p=>{const d=out(p,-11,0);return[d[0],d[1]]}).reverse();fill(s.map(p=>[p[0],p[1]]).concat(inn),'#8a623c')}
  // infield skin
  const skin=[];for(let i=0;i<=120;i++){const a=i/120*TAU,px=95*Math.sin(a),py=60.5+95*Math.cos(a);if(py>=Math.abs(px)-7)skin.push([px,py])}
  const DIRT='#b27d4d';
  fill(skin,DIRT);fill(arcPts(0,0,13.5,0,TAU,28),DIRT);
  for(const s of [1,-1])fill([[s*-3.2,3.2],[s*3.2,-3.2],[s*72,65.6],[s*65.6,72]],DIRT);
  // infield grass
  const ig=[[0,13],[50.6,63.64],[0,114.3],[-50.6,63.64]];
  x.save();P(ig);x.fillStyle='#2f8449';x.fill();x.clip();
  for(let k=-10;k<10;k++){if(k&1)continue;const u=[.7071,.7071],v=[-.7071,.7071],b0=k*9,b1=b0+9;fill([[u[0]*-20+v[0]*b0,u[1]*-20+v[1]*b0],[u[0]*140+v[0]*b0,u[1]*140+v[1]*b0],[u[0]*140+v[0]*b1,u[1]*140+v[1]*b1],[u[0]*-20+v[0]*b1,u[1]*-20+v[1]*b1]],'rgba(255,255,255,.06)');
    fill([[v[0]*-20+u[0]*b0,v[1]*-20+u[1]*b0],[v[0]*140+u[0]*b0,v[1]*140+u[1]*b0],[v[0]*140+u[0]*b1,v[1]*140+u[1]*b1],[v[0]*-20+u[0]*b1,v[1]*-20+u[1]*b1]],'rgba(0,0,0,.06)')}
  x.restore();
  fill(arcPts(0,0,13.5,0,TAU,28),DIRT);
  fill(arcPts(0,59,9.5,0,TAU,24),'#b98454');fill(arcPts(0,59.4,5.2,0,TAU,20),'#c6925f');
  for(const b of [1,2,3])fill(arcPts(BASEXY[b][0],BASEXY[b][1],b===2?9:7.5,0,TAU,18),DIRT);
  // texture: speckle
  const tex=(pts,nn,cols)=>{x.save();if(P(pts)>2){x.clip();for(let i=0;i<nn*q;i++){x.fillStyle=cols[i%cols.length];const s=(rnd()<.2?2:1)*(o.grain||1);x.fillRect(rnd()*W,Y0+rnd()*(Y1-Y0),s,o.grain||1)}}x.restore()};
  tex(skin.concat([[0,-14]]),2600,['rgba(60,35,15,.16)','rgba(255,225,190,.12)','rgba(60,35,15,.1)']);
  tex(fieldPoly,3800,['rgba(10,40,20,.13)','rgba(190,255,200,.05)']);
  x.restore();
  // chalk
  const chalk=(ax,ay,bx,by,w=.34)=>{const dx=bx-ax,dy=by-ay,l=Math.hypot(dx,dy),nx=-dy/l*w/2,ny=dx/l*w/2;fill([[ax+nx,ay+ny],[bx+nx,by+ny],[bx-nx,by-ny],[ax-nx,ay-ny]],'rgba(244,246,242,.93)')};
  for(const s of [1,-1]){chalk(s*2.6,2.6,s*233.3,233.3,.42);
    chalk(s*1.25,-2.6,s*5.25,-2.6);chalk(s*5.25,-2.6,s*5.25,3.9);chalk(s*5.25,3.9,s*1.25,3.9);chalk(s*1.25,3.9,s*1.25,-2.6);chalk(s*3.6,-2.6,s*3.6,-9);
    const od=arcPts(s*38,-14,3,0,TAU,20);for(let i=0;i<20;i++)chalk(od[i][0],od[i][1],od[i+1][0],od[i+1][1],.28)}
  chalk(-3.6,-9,3.6,-9);
  const sq=(b,r)=>[[b[0],b[1]-r],[b[0]+r,b[1]],[b[0],b[1]+r],[b[0]-r,b[1]]];
  for(const b of [1,2,3]){const p=BASEXY[b];fill(sq([p[0]+(b===1?-.9:b===3?.9:0),p[1]+(b===2?-.9:0)],1.15),'#fbfbf7')}
  fill([[-.71,1.42],[.71,1.42],[.71,.71],[0,0],[-.71,.71]],'#fbfbf7');fill([[-1,60.2],[1,60.2],[1,60.8],[-1,60.8]],'#fbfbf7');
  // lighting: bright pool over the infield, darker corners
  const m=o.lightAt?pj(c,o.lightAt[0],o.lightAt[1],0):pj(c,0,95,0),rad=Math.max(W,H)*.95;g=x.createRadialGradient(m[0],m[1],rad*.12,m[0],m[1],rad);g.addColorStop(0,'rgba(255,250,225,.09)');g.addColorStop(.45,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(2,5,12,.55)');x.fillStyle=g;x.fillRect(0,Y0,W,Y1-Y0)}
/* ---------- player rig: 3D skeleton with two-bone IK, drawn as cel-shaded capsules ---------- */
// Local frame: x = the player's right, y = forward, z = up, in feet. Poses give the pelvis, torso lean, shoulder/hip twist and hand/foot targets.
const RG={th:1.5,sn:1.45,ua:1.02,fa:.98,torso:1.72,sh:.64,hip:.3};
const P0={pv:[0,0,2.93],ch:[0,.06,1],tw:0,hw:0,hr:[.74,.12,2.8],hl:[-.74,.12,2.8],fr:[.36,0,0],fl:[-.36,0,0],er:[.5,-.8,-.3],el:[-.5,-.8,-.3],kr:[.2,1,.1],kl:[-.2,1,.1],hd:[0,.05,1],hy:0,bat:null};
const PZ=o=>Object.assign({},P0,o);
const PO={
  stand:PZ({}),
  ready:PZ({pv:[0,-.2,2.45],ch:[0,.42,1],hr:[.62,.95,2.1],hl:[-.62,.95,2.1],fr:[.85,0,0],fl:[-.85,0,0],kr:[.5,1,0],kl:[-.5,1,0],hd:[0,.3,1]}),
  lead:PZ({pv:[0,0,2.5],ch:[0,.38,1],hr:[.75,.6,2.2],hl:[-.75,.6,2.2],fr:[1.15,0,0],fl:[-1.15,0,0],kr:[.5,1,0],kl:[-.5,1,0],hd:[0,.2,1]}),
  field:PZ({pv:[0,0,1.75],ch:[0,.95,.7],hr:[.35,1.7,.8],hl:[-.15,2.05,.3],fr:[.95,.1,0],fl:[-.95,.1,0],kr:[.7,.9,0],kl:[-.7,.9,0],hd:[0,.7,.7]}),
  catchUp:PZ({hl:[-.25,.55,6.5],hr:[.55,.35,3.6],hd:[0,-.25,1],el:[-.6,.5,-.3]}),
  jump:PZ({hl:[-.2,.4,6.9],hr:[.7,.2,4.2],fr:[.35,-.5,.9],fl:[-.3,.3,.4],hd:[0,-.3,1],el:[-.6,.5,-.3]}),
  dive:PZ({pv:[0,0,.85],ch:[0,1,.1],hl:[-.15,4.2,.95],hr:[.75,2.6,.55],fr:[.3,-2.8,.7],fl:[-.3,-2.7,.45],hd:[0,1,.4],el:[-.4,0,-1],er:[.6,0,-.6],kr:[.2,0,-1],kl:[-.2,0,-1]}),
  slideH:PZ({pv:[0,0,.5],ch:[0,1,.08],hl:[-.3,4.1,.35],hr:[.3,4,.4],fr:[.3,-2.8,.3],fl:[-.3,-2.7,.25],hd:[0,1,.45],el:[-.4,0,-1],er:[.4,0,-1],kr:[.2,0,-1],kl:[-.2,0,-1]}),
  slideF:PZ({pv:[0,0,.55],ch:[0,-1,.55],fr:[.2,2.85,.3],fl:[-.45,1.2,.25],kl:[-.4,.4,1],kr:[.1,0,1],hr:[.95,-1,1.7],hl:[-.9,-1.5,.3],hd:[0,-.2,1],er:[.6,-.5,.2],el:[-.7,-.3,.4]}),
  tag:PZ({pv:[0,0,2],ch:[0,.8,.8],hl:[-.1,1.9,.5],hr:[.6,.9,1.6],fr:[.8,0,0],fl:[-.7,.5,0],kr:[.6,1,0],kl:[-.6,1,0],hd:[0,.6,.8]}),
  recv:PZ({pv:[0,.2,2.7],ch:[0,.25,1],hl:[-.2,2,4.2],hr:[.5,.9,3.4],fr:[.6,0,0],fl:[-.5,1,0]}),
  cheer:PZ({hr:[.7,.2,6.4],hl:[-.8,.3,3.4],er:[1,0,0]}),
  safe:PZ({pv:[0,0,2.6],ch:[0,.25,1],hr:[2.1,.4,4.3],hl:[-2.1,.4,4.3],fr:[.8,0,0],fl:[-.8,0,0],er:[0,0,-1],el:[0,0,-1]}),
  punch:PZ({ch:[0,.12,1],hr:[.9,1.3,5.6],hl:[-.6,.3,3.2],er:[1,.2,-.4]}),
  // pitcher (right-hander, facing home = +y)
  pSet:PZ({tw:-1.38,hw:-1.38,hr:[.5,.12,4],hl:[.46,.3,4.02],fr:[0,-.42,0],fl:[0,.75,0],kr:[1,.15,0],kl:[1,.15,0],er:[.3,-.6,-.7],el:[.3,.6,-.7]}),
  pLift:PZ({pv:[0,-.12,2.97],ch:[0,-.04,1],tw:-1.62,hw:-1.6,hr:[.5,-.05,4.3],hl:[.46,.12,4.32],fr:[0,-.42,0],fl:[.7,.15,2.05],kr:[1,.15,0],kl:[.9,.5,.7],er:[.3,-.6,-.7],el:[.3,.6,-.7]}),
  pStride:PZ({pv:[0,1.5,2.35],ch:[0,-.08,1],tw:-1.5,hw:-.9,hr:[.3,-1.5,3.6],hl:[-.3,3.5,4.3],fr:[0,-.38,.05],fl:[-.15,4.4,0],kr:[.6,.6,0],kl:[.3,1,.2],er:[.4,-.4,.8],el:[-.5,0,-.8]}),
  pCock:PZ({pv:[0,2.2,2.3],ch:[0,.14,1],tw:-.7,hw:.1,hr:[1.15,1.15,5.75],hl:[-.5,3.3,3.4],fr:[.1,-.2,.1],fl:[-.15,4.4,0],kr:[.5,.7,0],kl:[.2,1,.2],er:[1,-.3,.2],el:[-.6,0,-.7]}),
  pRel:PZ({pv:[0,2.6,2.3],ch:[-.15,.55,1],tw:1,hw:.9,hr:[.7,5.8,5.1],hl:[-.55,3,3],fr:[.35,.9,.35],fl:[-.15,4.4,0],kr:[.3,.6,-.6],kl:[.1,1,.2],er:[1,0,.5],el:[-.6,-.2,-.6],hd:[-.05,.3,1]}),
  pFollow:PZ({pv:[-.15,3.1,2.45],ch:[-.35,.95,.8],tw:1.9,hw:1.5,hr:[-1.1,4.6,1.6],hl:[-.75,2.9,3.4],fr:[.9,3.4,1.1],fl:[-.15,4.4,0],kr:[.6,.6,.6],kl:[0,1,.2],er:[.5,.5,-.6],el:[-.6,-.3,-.5],hd:[-.1,.6,.8]}),
  pEnd:PZ({pv:[0,3.9,2.5],ch:[0,.4,1],hr:[.62,4.7,2.3],hl:[-.62,4.8,2.5],fr:[.9,4.1,0],fl:[-.8,4.4,0],kr:[.5,1,0],kl:[-.5,1,0],hd:[0,.25,1]}),
  // generic throw
  tCock:PZ({pv:[0,.3,2.6],tw:-1.1,hw:-.8,hr:[.95,-.8,5.3],hl:[-.4,1.9,4.2],fl:[-.2,1.9,0],fr:[.2,-.6,0],er:[1,-.3,.2],el:[-.5,0,-.8]}),
  tRel:PZ({pv:[0,.9,2.6],ch:[-.1,.45,1],tw:.9,hw:.7,hr:[.7,3.2,5.4],hl:[-.5,1.2,3.2],fl:[-.2,1.9,0],fr:[.35,-.2,.3],er:[1,0,.5]}),
  tFol:PZ({pv:[-.1,1.2,2.6],ch:[-.3,.8,.8],tw:1.7,hw:1.3,hr:[-.9,2.6,2],hl:[-.7,1,3.4],fl:[-.2,1.9,0],fr:[.8,1.2,.7],er:[.5,.5,-.6]}),
  // batter (right-handed: the pitcher is on his left, -x)
  bStance:PZ({pv:[.15,0,2.68],ch:[.05,.26,1],tw:-.15,hr:[.95,.45,4.5],hl:[.88,.52,4.36],fr:[1,.1,0],fl:[-1.05,.15,0],kr:[.3,1,0],kl:[-.2,1,0],er:[.9,-.3,-.5],el:[-.3,.6,-.8],bat:[.35,-.3,1],hy:-1.45,hd:[-.05,.1,1]}),
  bLoad:PZ({pv:[.36,0,2.63],ch:[.08,.26,1],tw:-.42,hw:-.15,hr:[1.2,.3,4.55],hl:[1.12,.38,4.42],fr:[1,.1,0],fl:[-.95,.2,.5],kr:[.3,1,0],kl:[-.3,1,.3],er:[.9,-.4,-.3],el:[-.3,.6,-.8],bat:[.55,-.5,.72],hy:-1.45,hd:[-.08,.1,1]}),
  bStride:PZ({pv:[.1,0,2.58],ch:[.05,.26,1],tw:-.36,hw:.2,hr:[1.15,.3,4.45],hl:[1.07,.38,4.32],fr:[1,.1,0],fl:[-1.6,.2,0],kr:[.3,1,0],kl:[-.4,1,0],er:[.9,-.4,-.3],el:[-.3,.6,-.8],bat:[.6,-.62,.55],hy:-1.45,hd:[-.08,.1,1]}),
  bContact:PZ({pv:[-.25,.1,2.58],ch:[-.1,.3,1],tw:1.2,hw:1.25,hr:[-.55,1.45,3.3],hl:[-.75,1.55,3.2],fr:[.9,.25,.12],fl:[-1.6,.2,0],kr:[-.5,.9,0],kl:[-.6,.8,0],er:[.3,-.3,-.9],el:[-.6,.2,-.6],bat:[-.22,1,-.1],hy:-1.3,hd:[-.05,.25,1]}),
  bExt:PZ({pv:[-.4,.1,2.7],ch:[-.12,.25,1],tw:2,hw:1.5,hr:[-1.55,.75,4],hl:[-1.7,.7,3.9],fr:[.88,.28,.14],fl:[-1.6,.2,0],kr:[-.6,.8,0],kl:[-.6,.8,0],er:[.3,-.3,-.9],el:[-.6,.2,-.6],bat:[-.9,-.1,.45],hy:-1.3,hd:[-.05,.2,1]}),
  bFollow:PZ({pv:[-.45,.1,2.8],ch:[-.1,.12,1],tw:2.7,hw:1.6,hr:[-.8,-.6,5.1],hl:[-.9,-.75,5],fr:[.85,.3,.15],fl:[-1.6,.2,0],kr:[-.6,.8,0],kl:[-.6,.8,0],er:[0,1,-.3],el:[-1,0,0],bat:[.75,-.6,.3],hy:-1.2,hd:[-.05,.1,1]}),
  // catcher
  cCrouch:PZ({pv:[0,-.2,1.25],ch:[0,.6,1],hr:[.6,-.3,1.1],hl:[0,1.5,2.4],fr:[.8,.15,0],fl:[-.8,.15,0],kr:[1,.7,.3],kl:[-1,.7,.3],hd:[0,.15,1],el:[-.6,0,-.8]}),
  ump:PZ({pv:[0,0,2.4],ch:[0,.45,1],hr:[.6,.7,2],hl:[-.6,.7,2],fr:[.8,0,0],fl:[-.8,0,0],kr:[.5,1,0],kl:[-.5,1,0]})};
PO.pEnd.tw=0;PO.pEnd.hw=0;
function mixP(a,b,f){if(f<=0)return a;if(f>=1)return b;const o={};for(const k in a){const u=a[k],v=b[k];
  if(k==='bat'){o.bat=u&&v?[lerp(u[0],v[0],f),lerp(u[1],v[1],f),lerp(u[2],v[2],f)]:(f<.5?u:v);continue}
  o[k]=typeof u==='number'?lerp(u,v,f):[lerp(u[0],v[0],f),lerp(u[1],v[1],f),lerp(u[2],v[2],f)]}return o}
// keys: [[time,pose,ease?]], ease 1 = smooth into this key, 2 = accelerate into it
function seqP(keys,t){if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++){if(t<=keys[i][0]){let f=(t-keys[i-1][0])/(keys[i][0]-keys[i-1][0]);const e=keys[i][2];f=e===1?sstep(f):e===2?f*f:f;return mixP(keys[i-1][1],keys[i][1],f)}}return keys[keys.length-1][1]}
function poseRun(ph,k=1){const foot=o=>{const u=(((ph+o)/TAU)%1+1)%1;return u<.5?[lerp(1.3,-1.4,u*2),0]:[lerp(-1.4,1.3,(u-.5)*2),Math.sin((u-.5)*TAU)*1.1*k+(u<.75?.55*k*Math.sin((u-.5)*2*TAU):0)]},r=foot(0),l=foot(Math.PI),sr=r[0]/1.35,sl=l[0]/1.35;
  return{pv:[0,0,2.72+.1*Math.abs(Math.cos(ph))],ch:[0,.4*k+.08,1],tw:-sr*.3*k,hw:sr*.2*k,hr:[.62,.35-sr*.95*k,3.35-sr*.6*k],hl:[-.62,.35-sl*.95*k,3.35-sl*.6*k],fr:[.22,r[0]*k,r[1]],fl:[-.22,l[0]*k,l[1]],er:[.5,-1,-.2],el:[-.5,-1,-.2],kr:[.1,1,.3],kl:[-.1,1,.3],hd:[0,.2,1],hy:0,bat:null}}
const pitchPose=u=>seqP([[0,PO.pSet],[.42,PO.pLift,1],[.72,PO.pStride,1],[.82,PO.pCock],[.88,PO.pRel],[1,PO.pFollow],[1.3,PO.pEnd,1],[1.6,PO.pEnd],[2,PO.pSet,1]],u);
const throwPose=u=>seqP([[0,PO.ready],[.3,PO.tCock,1],[.5,PO.tRel,2],[.72,PO.tFol],[1,PO.stand,1]],u);
function ik(a,b,l1,l2,h){let dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],d=Math.hypot(dx,dy,dz)||1e-6,e=b;const mx=(l1+l2)*.998;if(d>mx){const k=mx/d;dx*=k;dy*=k;dz*=k;d=mx;e=[a[0]+dx,a[1]+dy,a[2]+dz]}
  const ux=dx/d,uy=dy/d,uz=dz/d,a1=(l1*l1-l2*l2+d*d)/(2*d),hh=Math.sqrt(Math.max(0,l1*l1-a1*a1)),hd=h[0]*ux+h[1]*uy+h[2]*uz;let px=h[0]-hd*ux,py=h[1]-hd*uy,pz=h[2]-hd*uz;const pl=Math.hypot(px,py,pz)||1;
  return[[a[0]+ux*a1+px/pl*hh,a[1]+uy*a1+py/pl*hh,a[2]+uz*a1+pz/pl*hh],e]}
// f: {x,y,g (ground height),z (height above ground),yaw,mir} -> world-space joints
function rig(po,f){const k=f.sc||1,c=Math.cos(f.yaw)*k,s=Math.sin(f.yaw)*k,m=f.mir?-1:1,ox=f.x,oy=f.y,oz=(f.g||0)+(f.z||0)*k,W=v=>[ox+v[0]*m*c+v[1]*s,oy-v[0]*m*s+v[1]*c,oz+v[2]*k];
  const pv=po.pv,cd=nrm(po.ch),ch=[pv[0]+cd[0]*RG.torso,pv[1]+cd[1]*RG.torso,pv[2]+cd[2]*RG.torso],ct=Math.cos(po.tw),st=Math.sin(po.tw),chw=Math.cos(po.hw),shw=Math.sin(po.hw);
  const sR=[ch[0]+ct*RG.sh,ch[1]+st*RG.sh,ch[2]-.1],sL=[ch[0]-ct*RG.sh,ch[1]-st*RG.sh,ch[2]-.1],hR=[pv[0]+chw*RG.hip,pv[1]+shw*RG.hip,pv[2]],hL=[pv[0]-chw*RG.hip,pv[1]-shw*RG.hip,pv[2]];
  const aR=ik(sR,po.hr,RG.ua,RG.fa,po.er),aL=ik(sL,po.hl,RG.ua,RG.fa,po.el),lR=ik(hR,[po.fr[0],po.fr[1],po.fr[2]+.16],RG.th,RG.sn,po.kr),lL=ik(hL,[po.fl[0],po.fl[1],po.fl[2]+.16],RG.th,RG.sn,po.kl);
  const hn=nrm(po.hd),hc=[ch[0]+hn[0]*.8,ch[1]+hn[1]*.8,ch[2]+hn[2]*.8],fw=[Math.sin(po.hy),Math.cos(po.hy)],toe=(a,flat)=>[a[0]-shw*.55,a[1]+chw*.55,Math.max(.06,a[2]-(flat?.14:.3))];
  const J={pv:W(pv),ch:W(ch),sR:W(sR),sL:W(sL),hR:W(hR),hL:W(hL),eR:W(aR[0]),haR:W(aR[1]),eL:W(aL[0]),haL:W(aL[1]),kR:W(lR[0]),fR:W(lR[1]),kL:W(lL[0]),fL:W(lL[1]),hc:W(hc),
    tR:W(toe(lR[1],po.fr[2]<.2)),tL:W(toe(lL[1],po.fl[2]<.2)),hf:W([hc[0]+fw[0]*.5,hc[1]+fw[1]*.5,hc[2]-.02]),hu:W([hc[0]+hn[0]*.5,hc[1]+hn[1]*.5,hc[2]+hn[2]*.5]),
    b0:W([hc[0]+hn[0]*.2,hc[1]+hn[1]*.2,hc[2]+hn[2]*.2]),bT:W([hc[0]+hn[0]*.14+fw[0]*.74,hc[1]+hn[1]*.14+fw[1]*.74,hc[2]+hn[2]*.14]),bS:W([hc[0]+hn[0]*.2+fw[1]*.43+fw[0]*.2,hc[1]+hn[1]*.2-fw[0]*.43+fw[1]*.2,hc[2]+hn[2]*.2]),
    eyR:W([hc[0]+fw[0]*.4+fw[1]*.17,hc[1]+fw[1]*.4-fw[0]*.17,hc[2]-.04]),eyL:W([hc[0]+fw[0]*.4-fw[1]*.17,hc[1]+fw[1]*.4+fw[0]*.17,hc[2]-.04])};
  if(po.bat){const b=nrm(po.bat),g=aL[1];J.bk=W([g[0]-b[0]*.4,g[1]-b[1]*.4,g[2]-b[2]*.4]);J.bt=W([g[0]+b[0]*2.5,g[1]+b[1]*2.5,g[2]+b[2]*2.5])}
  return J}
function capP(x,a,b,ra,rb){const an=Math.atan2(b[1]-a[1],b[0]-a[0]);x.beginPath();x.arc(a[0],a[1],ra,an+Math.PI/2,an-Math.PI/2);x.arc(b[0],b[1],rb,an-Math.PI/2,an+Math.PI/2);x.closePath()}
const lp2=(a,b,f)=>[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f];
// uniform colours. Home wears white with team trim, the visitors wear their colour over grey.
function mkKit(p,col,home,role){const dark=lum(col.c1)<.72?col.c1:(lum(col.c2)<.72?col.c2:'#1c2536'),num=((parseInt(String(p.id).slice(1),10)||7)*7)%98+1;
  const k={jersey:home?'#f1f2ee':col.c1,pants:home?'#eceee9':'#aeb5bf',cap:dark,sock:dark,under:dark,trim:home?dark:(lum(col.c1)>.6?'#16202e':(lum(col.c2)>.45?col.c2:'#f1f2ee')),skin:SKIN[(p.look.skin||0)%5],hair:HAIR[(p.look.hair||0)%10],num,role:role||'f',glove:'#8a5a2b',helm:dark};
  if(role==='u'){k.jersey='#1b2130';k.pants='#5d6673';k.cap='#11151d';k.sock='#11151d';k.under='#1b2130';k.trim='#8c98a8';k.num=0}
  return k}
function drawFig(x,c,f){
  const J=rig(f.po,f),K=f.kit,q={};for(const k in J){const v=J[k];q[k]=pj(c,v[0],v[1],v[2])}
  const s=q.pv[2],zv=V.view?V.view.z:1,ow=clamp(s*zv*.028,.5,2.4)/zv,big=s*zv>9;
  if(q.pv[0]<-80||q.pv[0]>V.W+80||q.pv[1]<-80||q.pv[1]>V.H+120)return;
  x.lineJoin='round';x.lineCap='round';if(f.a!=null)x.globalAlpha=f.a;
  // soft ground shadow
  {const g=f.g||0,a=pj(c,J.pv[0],J.pv[1],g),b=pj(c,J.ch[0],J.ch[1],g),d=Math.hypot(b[0]-a[0],b[1]-a[1]),rx=s*.95+d*.6,ry=Math.max(s*.26,s*.95*Math.abs(c.f[2])*.75);
    x.fillStyle=`rgba(0,0,0,${.3*(f.a==null?1:f.a)})`;x.beginPath();x.ellipse((a[0]+b[0])/2+s*.25,(a[1]+b[1])/2+s*.06,rx,ry,d>s*.5?Math.atan2(b[1]-a[1],b[0]-a[0]):0,0,TAU);x.fill()}
  if(f.zk){const zc=ZK[f.zk].c,cx=q.ch[0],cy=(q.ch[1]+q.pv[1])/2,rr=s*4.4,g=x.createRadialGradient(cx,cy,s*.4,cx,cy,rr);g.addColorStop(0,zc);g.addColorStop(1,'rgba(0,0,0,0)');
    x.save();x.globalCompositeOperation='lighter';x.globalAlpha=.3+.08*Math.sin(V.T*8);x.fillStyle=g;x.fillRect(cx-rr,cy-rr,rr*2,rr*2);
    const by=Math.max(q.fR[1],q.fL[1])+s*.2,lg=x.createLinearGradient(0,by,0,by-s*6.5);lg.addColorStop(0,zc);lg.addColorStop(.35,zc);lg.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=lg;x.globalAlpha=.3;
    for(let i=0;i<7;i++){const fx=q.pv[0]+(i-3)*s*.5,fh=s*(3.4+2.2*Math.abs(Math.sin(V.T*5+i*1.7)))*(1-Math.abs(i-3)*.12),sw=Math.sin(V.T*7+i*2.3)*s*.45;x.beginPath();x.moveTo(fx-s*.42,by);x.bezierCurveTo(fx-s*.5,by-fh*.45,fx+sw,by-fh*.7,fx+sw*.6,by-fh);x.bezierCurveTo(fx+sw+s*.2,by-fh*.6,fx+s*.5,by-fh*.4,fx+s*.42,by);x.fill()}x.restore()}
  const bk=f.bulk||1,seg=(list)=>{x.fillStyle=INK;for(const g of list){g[2]*=bk;g[3]*=bk;capP(x,g[0],g[1],g[2]*s+ow,g[3]*s+ow);x.fill()}for(const g of list){x.fillStyle=g[4];capP(x,g[0],g[1],g[2]*s,g[3]*s);x.fill()
      if(big&&g[5]!==0){x.fillStyle='rgba(255,255,255,.16)';const ox=-g[2]*s*.3,oy=-g[2]*s*.32;capP(x,[g[0][0]+ox,g[0][1]+oy],[g[1][0]+ox,g[1][1]+oy],g[2]*s*.45,g[3]*s*.45);x.fill()}}};
  const cat=K.role==='c',guard=cat?'#1c2536':null;
  const leg=S=>{const h=q['h'+S],k=q['k'+S],a=q['f'+S],t=q['t'+S],sk=lp2(k,a,.42);seg([[h,k,.3,.215,K.pants],[k,a,.21,.14,guard||K.pants],[sk,a,.185,.14,guard||K.sock],[a,t,.15,.12,'#161a22',0]])};
  const arm=S=>{const sh=q['s'+S],e=q['e'+S],h=q['ha'+S],me=lp2(sh,e,.62);seg([[sh,e,.2,.15,K.under],[sh,me,.215,.185,K.jersey],[e,h,.14,.105,K.skin]]);
    const glove=S==='L'&&K.role!=='b'&&K.role!=='u'&&K.role!=='r';
    if(glove){x.fillStyle=INK;x.beginPath();x.arc(h[0],h[1],.36*s+ow,0,TAU);x.fill();x.fillStyle=cat?'#3a2a1c':K.glove;x.beginPath();x.arc(h[0],h[1],.36*s,0,TAU);x.fill();if(big){x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=ow;x.beginPath();x.arc(h[0],h[1],.2*s,0,TAU);x.stroke()}}
    else{x.fillStyle=INK;x.beginPath();x.arc(h[0],h[1],.14*s+ow,0,TAU);x.fill();x.fillStyle=K.role==='b'||K.role==='r'?'#e9eef4':K.skin;x.beginPath();x.arc(h[0],h[1],.14*s,0,TAU);x.fill()}};
  // facing: +1 = chest towards the camera, -1 = back
  const mx=(J.sR[0]+J.sL[0])/2,my=(J.sR[1]+J.sL[1])/2,ax=J.sR[0]-J.sL[0],ay=J.sR[1]-J.sL[1],m=f.mir?-1:1,nx=-ay*m,ny=ax*m,nl=Math.hypot(nx,ny)||1,tx=c.p[0]-mx,ty=c.p[1]-my,tl=Math.hypot(tx,ty)||1,face=(nx*tx+ny*ty)/(nl*tl);
  const torso=()=>{const a=q.sL,b=q.sR,d=q.hR,e=q.hL,wd=.27*s*bk,b2=lp2(b,d,.8),e2=lp2(a,e,.8);
    x.fillStyle=INK;capP(x,e,d,.3*s+ow,.3*s+ow);x.fill();x.fillStyle=K.pants;capP(x,e,d,.3*s,.3*s);x.fill();
    x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.lineTo(b2[0],b2[1]);x.lineTo(e2[0],e2[1]);x.closePath();
    x.strokeStyle=INK;x.lineWidth=wd*2+ow*2;x.stroke();x.strokeStyle=x.fillStyle=cat?'#1c2536':K.jersey;x.lineWidth=wd*2;x.stroke();x.fill();
    if(big){const hi=x.createLinearGradient(a[0],Math.min(a[1],b[1])-wd,a[0],Math.max(d[1],e[1]));hi.addColorStop(0,'rgba(255,255,255,.2)');hi.addColorStop(.5,'rgba(255,255,255,0)');hi.addColorStop(1,'rgba(0,0,0,.2)');x.strokeStyle=x.fillStyle=hi;x.stroke();x.fill()}
    x.strokeStyle='#161a22';x.lineWidth=.17*s;x.beginPath();x.moveTo(e2[0]-(e2[0]-b2[0])*-.12,e2[1]);x.lineTo(b2[0]+(e2[0]-b2[0])*-.12,b2[1]);x.stroke();
    if(s*zv>4.5&&K.num&&Math.abs(face)>.45&&!(cat&&face>0)){const cx=(a[0]+b[0]+b2[0]+e2[0])/4,cy=(a[1]+b[1]+b2[1]+e2[1])/4,wsc=clamp(Math.hypot(b[0]-a[0],b[1]-a[1])/(1.28*s),.3,1),up=Math.atan2((a[0]+b[0])/2-(d[0]+e[0])/2,-((a[1]+b[1])/2-(d[1]+e[1])/2));
      x.save();x.translate(cx,cy);x.rotate(up);x.scale(wsc,1);x.fillStyle=K.trim;x.textAlign='center';x.textBaseline='middle';x.font=`800 ${(face<0?1.05:.6)*s}px ${FONTD}`;x.fillText(K.num,face<0?0:-.3*s,face<0?.06*s:-.22*s);x.restore()}
    if(big&&face>.3&&!cat){x.strokeStyle=K.trim;x.globalAlpha*=.5;x.lineWidth=Math.max(1,.05*s);const t=lp2(a,b,.5),u=lp2(e2,b2,.5);x.beginPath();x.moveTo(t[0],t[1]);x.lineTo(u[0],u[1]);x.stroke();x.globalAlpha=f.a==null?1:f.a}};
  const head=()=>{const h=q.hc,r=.47*h[2]*(bk>1?1.14:1),hf=q.hf,hu=q.hu,ua=Math.atan2(hu[1]-h[1],hu[0]-h[0]),toCam=hf[2]>h[2]+1e-6,helm=K.role==='b'||K.role==='r'||cat;
    seg([[q.ch,lp2(q.ch,h,.6),.16,.15,K.skin,0]]);
    const brim=()=>{const b0=q.b0,t=q.bT,sd=q.bS,ax=(t[0]-b0[0])/2,ay=(t[1]-b0[1])/2,cx=b0[0]+ax,cy=b0[1]+ay,bx=sd[0]-b0[0]-ax*.5,by=sd[1]-b0[1]-ay*.5,kk=helm?.72:1;
      x.beginPath();for(let i=0;i<16;i++){const th=i/16*TAU,co=Math.cos(th)*kk,si=Math.sin(th);x.lineTo(cx-ax*(1-kk)+ax*co+bx*si,cy-ay*(1-kk)+ay*co+by*si)}x.closePath();x.fillStyle=helm?K.helm:K.cap;x.fill();x.strokeStyle=INK;x.lineWidth=ow;x.stroke()};
    if(!toCam&&!cat)brim();
    x.fillStyle=INK;x.beginPath();x.arc(h[0],h[1],r+ow,0,TAU);x.fill();
    x.fillStyle=toCam?K.skin:K.hair;x.beginPath();x.arc(h[0],h[1],r,0,TAU);x.fill();
    if(toCam){// hair fringe at the sides, then the face
      x.fillStyle=K.hair;x.beginPath();x.arc(h[0],h[1],r,ua+1.5,ua+2.5);x.closePath();x.fill();x.beginPath();x.arc(h[0],h[1],r,ua-2.5,ua-1.5);x.closePath();x.fill();
      if(r*zv>2.6){x.fillStyle=f.zk?'#ffb000':'#121722';for(const e of [q.eyR,q.eyL]){if(e[2]<h[2])continue;x.beginPath();x.ellipse(e[0],e[1],Math.max(.7,r*.12),Math.max(1,r*.22),ua+Math.PI/2,0,TAU);x.fill()}}}
    // cap or helmet dome
    x.fillStyle=helm?K.helm:K.cap;x.beginPath();const sp=helm?(toCam?1.75:2.5):(toCam?1.62:2.05);x.arc(h[0],h[1],r+ow*.4,ua-sp,ua+sp);x.closePath();x.fill();
    if(helm&&big){x.strokeStyle='rgba(255,255,255,.45)';x.lineWidth=Math.max(1,r*.13);x.beginPath();x.arc(h[0],h[1],r*.72,ua-.9,ua-.25);x.stroke()}
    if(cat&&toCam&&r*zv>3){x.fillStyle='rgba(13,17,24,.5)';x.beginPath();x.ellipse(h[0],h[1]+r*.22,r*.78,r*.62,0,0,TAU);x.fill();x.strokeStyle='#0d1118';x.lineWidth=Math.max(1,r*.12);for(let i=0;i<3;i++){x.beginPath();x.moveTo(h[0]-r*.72,h[1]+i*r*.28-r*.06);x.lineTo(h[0]+r*.72,h[1]+i*r*.28-r*.06);x.stroke()}x.beginPath();x.moveTo(h[0],h[1]-r*.1);x.lineTo(h[0],h[1]+r*.8);x.stroke()}
    if(toCam&&!cat)brim()};
  const bat=()=>{if(!q.bk)return;const a=q.bk,b=q.bt,m1=lp2(a,b,.45);x.fillStyle=INK;capP(x,a,b,.07*s+ow,.15*s+ow);x.fill();x.fillStyle='#d8b377';capP(x,a,m1,.06*s,.08*s);x.fill();capP(x,m1,b,.08*s,.145*s);x.fill();
    if(big){x.fillStyle='rgba(255,255,255,.3)';capP(x,[m1[0]-s*.04,m1[1]-s*.04],[b[0]-s*.04,b[1]-s*.04],.03*s,.05*s);x.fill()}x.fillStyle='#2a1c10';x.beginPath();x.arc(a[0],a[1],.09*s,0,TAU);x.fill()};
  const parts=[[(q.kR[2]+q.fR[2])/2,()=>leg('R')],[(q.kL[2]+q.fL[2])/2,()=>leg('L')],[(q.eR[2]+q.haR[2])/2,()=>arm('R')],[(q.eL[2]+q.haL[2])/2,()=>arm('L')],[(q.ch[2]+q.pv[2])/2,torso],[q.hc[2]*1.0005,head]];
  if(q.bk)parts.push([q.bt[2],bat]);
  parts.sort((a,b)=>a[0]-b[0]);for(const p of parts)p[1]();
  x.globalAlpha=1;return q}
/* ---------- viewer shell: HUD, sizing, event loop ---------- */
const PNAME={FB:'Fastball',SI:'Sinker',CT:'Cutter',SL:'Slider',CU:'Curveball',CH:'Changeup',SP:'Splitter'};
const TC=1.3,THR=150,RSPD=p=>(22.5+p.r.spd*.08)*TC;// time compression against real life, throw and runner speed in ft/s on screen
const d2=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function startViewer(m){
  G.screen='match';const [a,h]=m.S,cd=(p,q)=>{const u=hex(p),v=hex(q);return Math.abs(u[0]-v[0])+Math.abs(u[1]-v[1])+Math.abs(u[2]-v[2])};
  const bs=n=>`<rect id="b${n}" x="${[23,14,5][n-1]}" y="${[12,3,12][n-1]}" width="10" height="10" rx="1.5" transform="rotate(45 ${[28,19,10][n-1]} ${[17,8,17][n-1]})"/>`;
  const tm=(s,i)=>`<div class="bt"><i style="background:${s.team.c1}"></i>${logoSVG(s.team,18)}<span>${esc(s.team.short)}</span><b id="s${i}">0</b></div>`;
  const card=(id,lab)=>`<div class="pc" id="${id}"><canvas id="${id}p" width="96" height="96"></canvas><div class="pcx"><div class="pcl"><span>${lab}</span><em id="${id}t"></em></div><b id="${id}n"></b><div class="pcs" id="${id}s"></div><div class="mbar st"><i id="${id}e"></i></div><div class="mbar zn"><i id="${id}z"></i></div></div></div>`;
  $('app').innerHTML=`<div class="mt" id="mt"><canvas id="cv"></canvas>
  <div class="bug" id="bug"><div class="bts">${tm(a,0)}${tm(h,1)}</div><div class="bi"><span id="innA">▲</span><b id="inn">1</b></div>
    <svg class="bd" viewBox="0 0 38 26" aria-label="Bases">${bs(1)}${bs(2)}${bs(3)}</svg>
    <div class="bc"><b id="cnt">0-0</b><div class="dots" id="outs"></div></div></div><div class="pinfo" id="pinfo"></div>
  <div class="low" id="low"><div class="tick" id="tick"><span>Play</span><p id="tickt">Play ball!</p></div>
    ${card('cb','At bat')}${card('cp','Pitching')}
    <div class="ctl"><div class="seg">${[1,2,4].map(n=>`<button class="${n===1?'on':''}" id="sp${n}" onclick="A.spd(${n})" aria-label="Speed ${n}x">${n}x</button>`).join('')}</div>
      <button id="apr" onclick="A.apr()"><small>Bats</small><span id="aprv">Balanced</span></button><button onclick="A.pen()"><small>Call</small>Bullpen</button><button class="go" onclick="A.skip()"><small>Sim</small>To end</button></div></div>
  <div id="banner"><b></b></div><div id="trans"><b id="trn"></b><span id="trs"></span></div>
  <div id="cut"><div class="dim"></div><div class="band"></div><div class="lines"></div><canvas id="cutc" width="360" height="360"></canvas><div class="tx"><div class="k" id="cutk"></div><div class="nm" id="cutn"></div><div class="ds" id="cutd"></div></div></div></div>`;
  V={m,q:[],cur:null,et:0,speed:1,T:0,last:0,run:true,half:0,inn:1,outs:0,b:0,s:0,bases:[null,null,null],score:[0,0],pit:[a.pit.id,h.pit.id],bat:null,batL:false,zon:{},fx:[],pop:[],shake:0,flash:0,anim:null,ballFx:null,P:{},kits:{},
    cam:'fld',view:null,cutA:0,punch:0,stop:0,plot:[],lines:null,rings:[],bursts:[],lastPitch:null,W:400,H:400,safe:{x:0,y:0,w:400,h:400},
    col:[cd(a.team.c1,h.team.c1)<150?{c1:a.team.c2,c2:a.team.c1}:{c1:a.team.c1,c2:a.team.c2},{c1:h.team.c1,c2:h.team.c2}]};
  m.S.forEach((s,i)=>s.team.roster.forEach(p=>V.P[p.id]={p,side:i}));
  V.ump={id:'u0',look:{skin:1,hair:0},r:{spd:40}};
  V.q=[{t:'intro'}];V.bat=a.lineup[a.bi].p.id;V.batL=isL(a.lineup[a.bi].p);hud();vSize();requestAnimationFrame(vFrame)}
function vSize(){if(!V)return;const app=$('app'),mt=$('mt');if(!mt)return;const r=app.getBoundingClientRect(),W=Math.max(240,Math.round(r.width)),H=Math.max(200,Math.round(r.height));
  V.land=W>H*1.15;mt.classList.toggle('land',V.land);mt.classList.toggle('tiny',!V.land&&W<372);
  DPR=Math.min(2,window.devicePixelRatio||1);const cv=$('cv');cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  const tb=$('bug').getBoundingClientRect(),lb=$('low').getBoundingClientRect(),top=tb.bottom-r.top+4,bot=lb.top-r.top-4;
  V.W=W;V.H=H;V.safe={x:0,y:top,w:W,h:Math.max(110,bot-top)};mt.style.setProperty('--st',top+'px');mt.style.setProperty('--sh',V.safe.h+'px');buildCams();V.view=null}
function buildCams(){const W=V.W,H=V.H,S=V.safe,home=V.m.S[1].team;
  const mk=(cam,k,o)=>{const c=document.createElement('canvas');c.width=Math.round(W*k*DPR);c.height=Math.round(H*k*DPR);const x=c.getContext('2d');x.scale(k*DPR,k*DPR);drawStadium(x,cam,W,H,home,o);return c};
  const th=lerp(34,26,clamp((S.w/S.h-.8)/1.7,0,1))*Math.PI/180,D=560,cf=mkCam([0,150-D*Math.cos(th),D*Math.sin(th)],[0,150,0]);
  fitCam(cf,[[-240,233,0],[240,233,0],[0,400,60],[0,-34,0],[-118,-10,0],[118,-10,0]],S,1);
  V.camF=cf;V.kf=clamp(Math.sqrt(4.4e6/(W*H*DPR*DPR)),1,1.8);
  {// the field master is a full-width band holding the whole park, rendered well above screen resolution so tight shots stay crisp
    const y0=Math.floor(Math.min(pj(cf,0,560,175)[1],pj(cf,-260,330,170)[1])-30),y1=Math.ceil(pj(cf,0,-78,0)[1]+24),rh=y1-y0,s=Math.min(Math.sqrt(5e6/(W*rh)),4000/W,4000/rh,DPR*3.4);
    const c=document.createElement('canvas');c.width=Math.round(W*s);c.height=Math.round(rh*s);const x=c.getContext('2d');x.scale(s,s);x.translate(0,-y0);drawStadium(x,cf,W,H,home,{noBack:true,band:[y0,y1],grain:Math.max(.5,DPR/s)});
    const TOPC='#04060c',BOTC='#06090e',fade=(a,b,col)=>{const g=x.createLinearGradient(0,a,0,b);g.addColorStop(0,col);g.addColorStop(1,'rgba(5,8,13,0)');x.fillStyle=g;x.fillRect(0,Math.min(a,b),W,Math.abs(b-a))};
    fade(y0,y0+36,TOPC);fade(y1,y1-46,BOTC);V.bgF=c;V.band={y:y0,h:rh,top:TOPC,bot:BOTC}}
  // pitch camera: the centre-field broadcast shot, a long lens looking in over the pitcher's shoulder
  const L=V.land,camH=L?22:47,sc=Math.min(S.w/13.2,S.h/(L?8.2:14.6)),zy=clamp((L?1:.93)-(2.5+camH*60.5/420)*sc/S.h,.3,.52),cp=mkCam([L?-56:-27,420,camH],[0,24,3.2]),zc=[0,.7,2.5];
  cp.foc=sc*((zc[0]-cp.p[0])*cp.f[0]+(zc[1]-cp.p[1])*cp.f[1]+(zc[2]-cp.p[2])*cp.f[2]);const q=pj(cp,zc[0],zc[1],zc[2]);cp.cx=S.x+S.w*(L?.6:.57)-q[0];cp.cy=S.y+S.h*zy-q[1];
  V.camP=cp;V.kp=Math.min(1.25,V.kf);
  {const c=document.createElement('canvas');c.width=Math.ceil(W/4);c.height=Math.ceil(H/4);const x=c.getContext('2d'),g=x.createRadialGradient(c.width/2,c.height*.5,Math.min(c.width,c.height)*.42,c.width/2,c.height*.5,Math.hypot(c.width,c.height)*.6);g.addColorStop(0,'rgba(3,6,12,0)');g.addColorStop(1,'rgba(3,6,12,.5)');x.fillStyle=g;x.fillRect(0,0,c.width,c.height);V.vig=c}
  {const k=V.kp,c=document.createElement('canvas');c.width=Math.round(W*k*DPR);c.height=Math.round(H*k*DPR);const x=c.getContext('2d'),ls=.34,lo=document.createElement('canvas');lo.width=Math.ceil(W*ls*DPR);lo.height=Math.ceil(H*ls*DPR);
    const lx=lo.getContext('2d');lx.scale(ls*DPR,ls*DPR);drawStadium(lx,cp,W,H,home,{close:true,ground:false});x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(lo,0,0,c.width,c.height);
    x.scale(k*DPR,k*DPR);drawStadium(x,cp,W,H,home,{sky:false,stands:false,walls:false,lightAt:[0,20]});V.bgP=c}}
function hud(){if(!V)return;const m=V.m;$('s0').textContent=V.score[0];$('s1').textContent=V.score[1];$('inn').textContent=V.inn;$('innA').textContent=V.half?'▼':'▲';
  $('outs').innerHTML=[0,1].map(i=>`<i class="${i<V.outs?'on':''}"></i>`).join('');$('cnt').textContent=V.b+'-'+V.s;
  for(let i=0;i<3;i++)$('b'+(i+1)).setAttribute('class',V.bases[i]?'on':'');
  const card=(pid,pre,txt,tag)=>{const f=V.P[pid],p=f.p,z=m.z[pid],zk=V.zon[pid],t=m.S[f.side].team,c=$(pre+'p');if(c.dataset.k!==pid+(zk||'')){c.dataset.k=pid+(zk||'');portrait(c,p.look,{c1:t.c1,c2:t.c2,cap:true,zone:zk?ZK[zk].c:null})}
    $(pre+'n').textContent=sn(p);$(pre+'s').textContent=zk?'In the Zone':txt;$(pre+'t').textContent=tag;$(pre+'z').style.width=(zk?100:z.g)+'%';$(pre).classList.toggle('zone',!!zk);$(pre).style.setProperty('--tc',t.c1)};
  if(V.bat){const l=m.S[V.half].lineup.find(x=>x.p.id===V.bat),p=V.P[V.bat].p,bx=m.box[V.bat];card(V.bat,'cb',`${l?l.pos:''} · ${avg(p.s)} · ${bx.h}-${bx.ab}`,OSTYLE[p.os]?OSTYLE[p.os].n:'')}
  const pid=V.pit[1-V.half],p=V.P[pid].p,bx=m.box[pid],st=clamp(100-(bx.np+bx.fx)/(45+p.r.sta*.6)*100,4,100),e=$('cpe');
  card(pid,'cp',`${bx.np} pitches · ${bx.pk} K`,PSTYLE[p.ps]?PSTYLE[p.ps].n:'');e.style.width=st+'%';e.style.background=st>55?'var(--good)':st>28?'var(--gold-2)':'var(--bad)'}
const tick=t=>{const e=$('tickt');if(e)e.textContent=t};
function banner(txt,cls,dur){const e=$('banner');if(!e)return;e.className='';void e.offsetWidth;e.firstChild.textContent=txt;e.style.setProperty('--bd',(dur/V.speed)+'s');e.className='go '+(cls||'')}
function trans(a,b,dur,html){const e=$('trans');if(!e)return;e.className='';void e.offsetWidth;$('trn').textContent=a;if(html)$('trs').innerHTML=b;else $('trs').textContent=b;e.style.setProperty('--bd',(dur/V.speed)+'s');e.className='go'}
function cut(pid,k,name,desc,col,dur){const e=$('cut'),f=V.P[pid],t=V.m.S[f.side].team;portrait($('cutc'),f.p.look,{c1:t.c1,c2:t.c2,cap:true,zone:col});$('cutk').textContent=k;$('cutn').textContent=name;$('cutd').textContent=desc;e.style.setProperty('--zc',col);e.style.setProperty('--cd',(dur/V.speed)+'s');e.className='';void e.offsetWidth;e.className='go'}
const pop=(txt,w,col,sz=1)=>{V.pop.push({txt,w,life:1,col,sz});if(V.pop.length>8)V.pop.shift()};
// particles live in world space (feet) so they stay put when the camera moves
function spark(w,n,col,spd=30,o={}){if(V.fx.length>240)return;for(let i=0;i<n;i++){const a=R()*TAU,b=R()*Math.PI-Math.PI/2,s=spd*(.3+R()*.7),c=Array.isArray(col)?pick(col):col;V.fx.push({x:w[0],y:w[1],z:w[2],vx:Math.cos(a)*Math.cos(b)*s,vy:Math.sin(a)*Math.cos(b)*s*(o.flat||1),vz:Math.abs(Math.sin(b))*s*(o.up||1)+(o.lift||0),life:(o.life||.5)*(.6+R()*.6),max:o.life||.5,col:c,sz:o.sz||.12,g:o.g==null?32:o.g,glow:o.glow})}}
const dust=(w,n=10)=>spark([w[0],w[1],.3],n,['rgba(214,178,134,.9)','rgba(190,150,104,.85)','rgba(232,204,168,.8)'],9,{life:.75,sz:.5,g:4,up:.6});
const shake=v=>{if(!RMO)V.shake=Math.max(V.shake,v)};
function setCam(k){const pi=$('pinfo');if(pi&&k!=='pit')pi.className='pinfo';if(V.cam!==k){V.cam=k;V.view=null;V.fx.length=0;V.pop.length=0;V.rings.length=0;V.bursts.length=0;V.lines=null;V.cutA=1}}
function vFrame(ts){
  if(!V||!V.run)return;let raw=Math.min(.05,(ts-(V.last||ts))/1000);V.last=ts;V.T+=raw;const rr=raw;
  if(V.stop>0){V.stop-=raw;raw=0}
  const dts=raw*V.speed;let acc=dts,guard=0;
  while(acc>0&&guard++<40){
    if(!V.cur){if(!V.q.length){if(V.m.done){vEnd();return}V.q=V.m.pa();if(!V.q.length)continue}V.cur=V.q.shift();V.et=0;vStart(V.cur);if(!V)return}
    const step=Math.min(V.cur.dur-V.et,acc);V.et+=step;acc-=step;
    if(V.cur.t==='pitch')pitchFx(V.cur);animFx();
    if(V.stop>0)break;
    if(V.et>=V.cur.dur-1e-6){const e=V.cur;V.cur=null;vFinish(e);if(!V||e.t==='end')return}else break}
  for(const p of V.fx){p.x+=p.vx*dts;p.y+=p.vy*dts;p.z+=p.vz*dts;p.vz-=p.g*dts;if(p.z<0){p.z=0;p.vz*=-.3;p.vx*=.6;p.vy*=.6}p.life-=dts}V.fx=V.fx.filter(p=>p.life>0);
  for(const p of V.pop)p.life-=dts*.85;V.pop=V.pop.filter(p=>p.life>0);
  for(const r of V.rings)r.t+=dts;V.rings=V.rings.filter(r=>r.t<r.d);for(const r of V.bursts)r.t+=dts;V.bursts=V.bursts.filter(r=>r.t<r.d);
  if(V.lines){V.lines.t+=Math.max(dts,rr);if(V.lines.t>.32)V.lines=null}
  V.punch*=Math.pow(.02,dts);V.cutA=Math.max(0,V.cutA-rr*7);
  vDraw(dts);requestAnimationFrame(vFrame)}
function vStart(e){const m=V.m;
  switch(e.t){
    case'intro':{e.dur=2.8;setCam('fld');const pip=n=>'<i>'+'●'.repeat(n)+'</i><u>'+'●'.repeat(3-n)+'</u>',row=s=>{const o=teamFit(s.team,'off'),d=teamFit(s.team,'def');return`<span class="ts"><b style="color:${lum(s.team.c1)<.25?'#e9eef4':s.team.c1}">${esc(s.team.short)}</b></span><span class="ts">${esc(o.n)} ${o.id==='balanced'?'':pip(o.lvl)}</span><span class="ts">${esc(d.n)} ${d.id==='balanced'?'':pip(d.lvl)}</span>`};
      trans('Play ball',`<div class="tsg">${row(m.S[0])}${row(m.S[1])}</div>`,e.dur,true);break}
    case'batter':e.dur=V.cam==='pit'?.6:.85;setCam('pit');V.bat=e.pid;V.batL=isL(V.P[e.pid].p);V.b=V.s=0;V.anim=null;V.ballFx=null;V.plot=[];for(const id in V.zon)if(!m.z[id].on)delete V.zon[id];hud();break;
    case'pitch':{if(e.go){e.dur=.001;e.skip=true;break}setCam('pit');V.anim=null;const pit=V.P[V.pit[1-V.half]].p,ro=V.bases.some(b=>b);
      e.tW=.1;e.WD=ro?.74:.86;e.tR=e.tW+e.WD*.88;e.fl=clamp(.52*(86/(e.mph||86)),.4,.74)*(e.fx?1.3:1);e.tP=e.tR+e.fl;
      e.dur=e.res==='inplay'?e.tP+.03:e.go?e.tP+.16:e.tP+(e.res==='foul'?.62:.52);
      const J=rig(PO.pRel,{x:0,y:60.5,g:gz(0,60.5),yaw:Math.PI,mir:e.lhp});e.Rp=J.haR;
      e.E=[e.loc[0]*.83,.7,2.5+e.loc[1]*.9];e.Bk=[e.brk[0]/12*1.7,0,(e.brk[1]-3.5)/12*1.7];e.col=(PITCH[e.ty]||PITCH.FB).c;
      e.fd=[(R()<.5?-1:1)*(15+R()*50),-10-R()*30,25+R()*45];e.miss=(e.ty==='FB'?1:-1)*(.35+R()*.3);
      if(e.fx)V.ballFx=e.fx;V.lastPitch=e;break}
    case'play':if(e.res==='K'){setCam('pit');e.dur=1.45;banner(e.looking?'Strike three':'Strikeout','k',1.3);tick(e.desc);V.outs=Math.min(3,V.outs+1);hud()}
      else{V.anim=buildPlay(e);setCam('fld');e.dur=V.anim.dur}break;
    case'steal':V.anim=buildSteal(e);setCam('fld');e.dur=V.anim.dur;break;
    case'pick':V.anim=buildPick(e);setCam('fld');e.dur=V.anim.dur;tick(e.desc);break;
    case'zoneOn':e.dur=1.9;V.zon[e.pid]=e.k;cut(e.pid,'In the Zone',V.P[e.pid].p.name,ZK[e.k].n+' awakened',ZK[e.k].c,e.dur);shake(5);hud();break;
    case'ability':{e.dur=2.3;const a=ABIL[e.a];cut(e.pid,sn(V.P[e.pid].p),a.n,a.d,ZK[a.k].c,e.dur);shake(6);break}
    case'half':e.dur=1.7;V.anim=null;V.pop.length=0;setCam('fld');trans((e.half?'Bottom ':'Top ')+ord(e.inn),`${m.S[0].team.short} ${V.score[0]}  ·  ${m.S[1].team.short} ${V.score[1]}`,e.dur);break;
    case'change':e.dur=1.6;V.pit[e.side]=e.pid;V.plot=[];banner('Pitching change','sm',1.4);tick('Pitching change: '+V.P[e.pid].p.name+' takes the mound.');hud();break;
    case'end':e.dur=2;V.anim=null;setCam('fld');trans('Final',`${m.S[0].team.short} ${m.score[0]}  ·  ${m.S[1].team.short} ${m.score[1]}`,e.dur);break}}
function vFinish(e){
  switch(e.t){
    case'pitch':if(!e.skip){V.b=e.b;V.s=e.s;hud()}break;
    case'play':V.outs=e.outs;V.bases=e.bases;V.score=e.score.slice();V.anim=null;V.b=V.s=0;hud();break;
    case'steal':case'pick':V.outs=e.outs;V.bases=e.bases;V.anim=null;hud();break;
    case'half':V.half=e.half;V.inn=e.inn;V.outs=0;V.bases=e.bases;V.bat=null;V.b=V.s=0;hud();break;
    case'end':vEnd();break}}
function vEnd(){const m=V.m;V.run=false;V=null;finishDay(m)}
function pitchFx(e){const t=V.et;if(e.skip)return;
  if(!e.rel&&t>=e.tR){e.rel=true;const pi=$('pinfo');if(pi){pi.innerHTML=`<i style="background:${e.col}"></i><b>${PNAME[e.ty]||'Pitch'}</b><span>${e.mph} mph</span>`;pi.className='pinfo on'}
    if(e.go)pop('RUNNER GOES!',[0,30,7.5],'#f2c14e',1.1)}
  if(e.done||t<e.tP)return;e.done=true;const E=e.E,mitt=[E[0],-2.6,Math.max(.8,E[2]-.25)];
  V.plot.push({x:e.loc[0],z:e.loc[1],res:e.res,ty:e.ty,n:e.n});
  if(e.res==='ball')pop('Ball',[E[0],.7,E[2]+1.1],'#4aa8ff',.85);
  else if(e.res==='called'){const k=e.s>=3;pop(k?'Strike three!':'Strike',[E[0],.7,E[2]+1.1],'#ef5b5b',k?1.25:.95);V.rings.push({w:mitt,t:0,d:k?.5:.3,r:k?3.4:1.6,col:k?'#ffffff':'#ef5b5b'});if(k){shake(6);spark(mitt,14,'#fff',14,{life:.35,sz:.07,g:8})}}
  else if(e.res==='swing'){pop(e.s>=3?'Strike three!':'Swing and a miss',[E[0],.7,E[2]+1.1],'#ef5b5b',e.s>=3?1.2:.9);V.rings.push({w:mitt,t:0,d:.3,r:1.4,col:'#ef5b5b'});if(e.s>=3)shake(4)}
  else if(e.res==='foul'){pop('Foul',[E[0],.7,E[2]+1.1],'#c9ced6',.85);spark(E,8,'#fff',18,{life:.25,sz:.06,g:10});shake(2)}
  else{const big=!!V.ballFx;spark(E,big?26:16,big?['#ffd23f','#fff','#ff8a3c']:['#fff','#ffe9a8'],big?40:26,{life:.4,sz:.08,g:12});shake(big?12:5);if(!RMO){V.flash=big?.6:.28;V.lines={t:0,w:E,big};V.stop=V.speed>=4?0:big?.14:.07}V.punch=big?.22:.12;V.rings.push({w:E,t:0,d:.3,r:big?5:2.6,col:'#fff'})}}
function animFx(){const A=V.anim,t=V.et;if(!A)return;for(const f of A.fx)if(!f.done&&t>=f.t){f.done=true;f.f()}}
Object.assign(A,{
  spd(n){if(!V)return;V.speed=n;for(const k of [1,2,4])$('sp'+k).classList.toggle('on',k===n)},
  skip(){if(!V)return;const m=V.m;while(!m.done)m.pa();vEnd()},
  apr(){if(!V)return;const m=V.m;m.approach=m.approach===1?-1:m.approach+1;$('aprv').textContent=({'-1':'Patient',0:'Balanced',1:'Aggressive'})[m.approach]},
  pen(){if(!V)return;const m=V.m,us=m.S[0].user?m.S[0]:m.S[1];if(!us.pen.length)return tick('The bullpen is empty.');m.wantChange=true;tick('Bullpen call made. The reliever comes in before your next batter faced.')}
});
/* ---------- play playback: the engine has already simulated the play (e.sim, in real seconds and feet); this turns that timeline into what the cameras draw ---------- */
const UMPS=[[0,-10],[82,68],[12,152],[-82,68]];// home, first, second, third
function newAnim(e){const A={dur:1.5,ball:[],fld:{},run:[],fx:[],cam:[],e,ump:[],keepBat:false,home:null};
  A.FL=pos=>A.fld[pos]||(A.fld[pos]={pos,st:FPOS[pos].slice(),mv:[],act:[]});
  A.mvF=(pos,to,t0,t1)=>{A.FL(pos).mv.push({t0,t1:Math.max(t1,t0+.08),to:[to[0],to[1]]})};
  A.act=(pos,t,k,face)=>A.FL(pos).act.push({t,k,face});
  A.at=(t,f)=>A.fx.push({t,f});
  A.thr=(t0,t1,a,b)=>A.ball.push({k:'thr',t0,t1,a:[a[0],a[1],5.4],b:[b[0],b[1],3.6],h:d2(a,b)*.026});
  // a runner follows the legs the engine timed, rounding any base he runs through
  A.runner=(pid,b,lead,ts,legs)=>{const p=V.P[pid].p,C=[0,63.64],B=BASEXY,un=(u,v)=>{const l=d2(u,v)||1;return[(v[0]-u[0])/l,(v[1]-u[1])/l]},r={pid,p,from:b,to:legs.length?legs[legs.length-1].to:b,legs:[],slide:null,outT:null,atBase:false,t0:ts,t1:ts,d:0};
    let a=b?(()=>{const d=un(B[b],B[b+1]);return[B[b][0]+d[0]*lead,B[b][1]+d[1]*lead]})():[(V.batL?1:-1)*3.2,.75],tp=ts;
    legs.forEach((L,i)=>{const e=B[L.to],d=un(a,e),pts=[a];if(i){const o=un(C,a);pts.push([a[0]+d[0]*16+o[0]*5,a[1]+d[1]*16+o[1]*5])}if(i<legs.length-1){const o=un(C,e);pts.push([e[0]-d[0]*22+o[0]*7,e[1]-d[1]*22+o[1]*7])}pts.push(e);
      const seg=[];let len=0;for(let j=1;j<pts.length;j++){const l=d2(pts[j],pts[j-1]);seg.push(l);len+=l}r.legs.push({pts,seg,len,t0:tp,t1:Math.max(L.t,tp+.05),acc:r.d});r.d+=len;tp=L.t;a=e});
    r.t1=tp;A.run.push(r);return r};
  return A}
function runAt(r,t,short=0){const n=r.legs.length;if(!n)return{x:0,y:0,dx:0,dy:1,rem:99,run:0,moving:false};let i=0;while(i<n-1&&t>=r.legs[i].t1)i++;const L=r.legs[i];let f=clamp((t-L.t0)/(L.t1-L.t0),0,1);if(!i)f=f*f*(3-2*f)*.3+f*.7;if(short&&i===n-1&&L.len>short*2)f=Math.min(f,1-short/L.len);
  let d=f*L.len,j=0;while(j<L.seg.length-1&&d>L.seg[j]){d-=L.seg[j];j++}const a=L.pts[j],b=L.pts[j+1],u=L.seg[j]?clamp(d/L.seg[j],0,1):1;
  return{x:lerp(a[0],b[0],u),y:lerp(a[1],b[1],u),dx:b[0]-a[0],dy:b[1]-a[1],rem:i===n-1?(1-f)*L.len:99,run:L.acc+f*L.len,moving:t>r.t0&&t<r.t1}}
function outCall(A,t,at,out,base,txt){A.at(t,()=>{pop(txt||(out?'OUT!':'SAFE!'),[at[0],at[1],7.5],out?'#ef5b5b':'#3ecf8e',1.2);if(out){V.outs=Math.min(3,V.outs+1);hud()}
    let u=base===4?0:base>0?base:0;if(!base){let bd=1e9;UMPS.forEach((q,i)=>{const d=d2(q,at);if(i&&d<bd){bd=d;u=i}})}A.ump[u]={t:V.et,k:out?'punch':'safe'};shake(out?4:2)})}
function buildPlay(e){
  const A=newAnim(e),S=e.sim,bs=e.side,k=1/TC,type=e.type,big=(t,txt,cls)=>A.at(t,()=>banner(txt,cls,1.25)),name=sn(V.P[e.pid].p);
  if(!S){// walk: forced runners jog up a base; stay with it if a run is walked in
    let tEnd=1.7;for(const mv of e.moves){const r=A.runner(mv.pid,mv.from,0,.3,[{to:mv.to,t:.3+(mv.to===4?2.6:3.4)}]);r.jog=true;if(mv.to===4){tEnd=3.3;A.home=[2.4,3.2];A.at(2.9,()=>{V.score[bs]=Math.min(e.score[bs],V.score[bs]+1);hud();pop('Run scores',[0,0,8.5],'#f2c14e',1.1)})}}
    big(0,'Walk','sm');A.dur=tEnd;A.cam=[{t:0,c:[14,20],r:50}];tick(e.desc);return A}
  for(const s of S.ball)A.ball.push(Object.assign({},s,{t0:s.t0*k,t1:s.t1*k,te:s.te!=null?s.te*k:null}));
  for(const pos in S.fld){const f=S.fld[pos],F=A.FL(pos);F.st=f.st.slice();F.mv=f.mv.map(m=>({t0:m.t0*k,t1:m.t1*k,to:m.to}));F.act=f.act.map(a=>({t:a.t*k,k:a.k,face:a.face}))}
  const air=A.ball[0],T=air.te!=null?air.te:air.t1,hr=S.hr,homeT=[];let bat=null,tDesc=1e9;
  if(hr){const tc=T+1.9;A.hr=true;for(const q of S.run){const isB=q.b===0,n=4-q.b,t0=isB?.75:.5,te=isB?tc-.4:tc-.3,legs=[];for(let i=1;i<=n;i++)legs.push({to:q.b+i,t:isB&&i===n?tc+2.3:t0+(te-t0)*i/(isB?n-1:n)});const r=A.runner(q.pid,q.b,q.lead,t0,legs);r.jog=true;if(isB)bat=r}
    big(T*.72,e.runs===4?'Grand slam':'Home run','hr');const L=air.b,W=[L[0],L[1],30];
    A.at(T,()=>{shake(e.runs===4?14:10);if(!RMO)V.flash=.5;spark(W,24,['#ffd23f','#fff'],30,{life:.6,sz:.5,g:14})});
    for(let i=0;i<(e.runs===4?10:7);i++)A.at(T+.1+i*.24,()=>{if(!RMO)V.bursts.push({w:[L[0]*(.98+R()*.12)+(R()-.5)*120,L[1]*(.98+R()*.12),38+R()*50],t:0,d:1.15,r:20+R()*14,s:R()*6,col:['#ffd23f','#ff5c8a','#57c7ff','#3ecf8e','#ffffff','#ff8a3c'][i%6]})});
    A.at(bat.t1,()=>{V.score=e.score.slice();hud();pop(e.runs>1?e.runs+' runs score':'Run scores',[0,0,8.5],'#f2c14e',1.15);spark([0,0,2],12,'#f2c14e',14,{life:.5,sz:.2,g:10})});
    A.dur=bat.t1+.7;A.cam=[{t:0,c:[0,24],r:48},{t:.35,r:70},{t:T,r:72},{t:T+1.5,r:80},{t:tc+.25,c:[-30,26],r:50},{t:bat.t1-.3,c:[0,6],r:36}];tDesc=T*.8}
  else{for(const q of S.run){if(!q.legs.length)continue;const r=A.runner(q.pid,q.b,q.lead,q.ts*k,q.legs.map(L=>({to:L.to,t:L.t*k})));if(q.b===0)bat=r;
      if(q.slide)r.slide=R()<.45?'H':'F';
      if(q.out){r.outT=q.out.t*k;r.atBase=q.out.base>0&&Math.abs(r.outT-r.t1)<.12;if(q.out.base===4)homeT.push(r.outT);if(q.out.base>0&&!r.atBase&&r.outT<r.t1&&q.out.base===2)r.slide=r.slide||'F'}
      else if(r.to===4){homeT.push(r.t1);A.at(r.t1,()=>{if(q.scored){V.score[bs]=Math.min(e.score[bs],V.score[bs]+1);hud();pop('Run scores',[0,0,8.5],'#f2c14e',1.1);spark([0,0,2],10,'#f2c14e',14,{life:.5,sz:.2,g:10})}})}
      if(r.slide)A.at(Math.max(r.t0,r.t1-.3),()=>{const p=runAt(r,V.et);dust([p.x,p.y,0],14)})}
    let nOut=0;for(const c of S.calls){const t=c.t*k+.04,at=c.at||BASEXY[c.base||1];if(c.out)tDesc=Math.min(tDesc,t);
      if(c.catch){outCall(A,t,at,true,0);const kd=e.bb.kind;big(t+.02,e.robbed?'Robbed!':e.dive?'What a catch':kd==='L'?'Line out':kd==='P'?'Pop out':'Fly out',e.robbed?'':'sm');if(e.dive||e.robbed)A.at(t,()=>{shake(6);dust(at,10)})}
      else outCall(A,t+.03,at,c.out,c.base,c.out&&c.base>0&&c.force===false?'TAGGED OUT!':null);
      if(c.out)nOut++}
    const lastOut=S.calls.filter(c=>c.out&&!c.catch).map(c=>c.t*k);
    if(e.res==='DP')big(Math.max(...lastOut,0)+.12,'Double play','');else if(e.res==='SF')big(T+.5,'Sac fly','sm');
    else if(type==='E')big(T+.1,'Error','sm');else if(e.thr&&e.thr.out)big(Math.max(...lastOut,0)+.15,e.thr.to===4?'Out at the plate':'Thrown out','');
    else if(['1B','2B','3B'].includes(type)){const tl=A.ball.length>1&&A.ball[1].k==='roll'&&air.k==='air'?air.t1:e.ih?Math.max(...S.calls.map(c=>c.t*k),T):air.k==='roll'?T*.7:T;big(tl+.05,e.ih?'Infield hit':type==='1B'?'Base hit':type==='2B'?'Double':'Triple',type==='1B'?'sm':'');tDesc=Math.min(tDesc,tl)}
    if(air.k==='air'&&air.te==null&&!hr)A.at(air.t1,()=>dust([air.b[0],air.b[1],0],5));
    if(e.dive&&air.k==='roll')A.at(T,()=>dust([air.b[0],air.b[1],0],12));
    A.dur=S.dur*k;for(const r of A.run)A.dur=Math.max(A.dur,(r.outT!=null?r.outT:r.t1)+.75);
    A.cam=autoCam(A);if(homeT.length){homeT.sort((a,b)=>a-b);A.home=[Math.max(.5,homeT[0]-1.15),homeT[homeT.length-1]+.55];A.dur=Math.max(A.dur,A.home[1]+.35)}
    if(tDesc>1e8)tDesc=T}
  // while the ball is live the ticker says what was hit; the result goes up when it is decided
  const kd=e.bb.kind,dir=DIRN[e.fpos]||'the field';tick(kd==='G'?`${name} hits a ground ball...`:kd==='L'?`${name} lines one towards ${dir}...`:kd==='P'?`${name} pops it up...`:`${name} lifts a fly ball to ${dir}...`);
  A.at(Math.max(.25,tDesc),()=>tick(e.desc));
  for(const s of A.ball)if(s.k==='roll'&&s.n>1&&s.h>1)for(let i=1;i<s.n;i++){const tt=s.t0+(s.t1-s.t0)*i/s.n;A.at(tt,()=>{const p=segPos(s,tt);dust([p[0],p[1],0],3)})}
  return A}
// A steal is shown whole from the field camera: the pitcher's delivery, the runner's jump, the catcher's throw and the tag.
function buildSteal(e){const A=newAnim(e),B=b=>BASEXY[b],tb=e.thr,S=e.sim,k=1/TC,pe=e.pitch,del=S.del*k,rel=S.rel*k,C=FPOS.C,M=[0,56];A.keepBat=true;let lead=null;
  e.runs.forEach((mv,i)=>{const r=A.runner(mv.pid,mv.from,mv.lead,mv.ts*k,[{to:mv.to,t:mv.t1*k}]);r.out=!!mv.out;if(!i)lead=r;r.slide=i||tb?(R()<.4?'H':'F'):null;A.at(Math.max(0,r.t1-.3),()=>{if(r.slide){const p=runAt(r,V.et);dust([p.x,p.y,0],14)}})});
  A.act('P',0,'pitch');A.FL('P').wd=rel/.88;A.ball.push({k:'thr',t0:rel,t1:del,a:[M[0],M[1],6],b:[C[0],C[1]+1.5,2.6],h:.5});
  A.at(rel,()=>{const pi=$('pinfo');if(pi&&pe){pi.innerHTML=`<i style="background:${(PITCH[pe.ty]||PITCH.FB).c}"></i><b>${PNAME[pe.ty]||'Pitch'}</b><span>${pe.mph} mph</span>`;pi.className='pinfo on'}});
  A.at(lead.t0+.02,()=>pop('Runner goes!',[lead.legs[0].pts[0][0],lead.legs[0].pts[0][1],8],'#f2c14e',1));
  A.at(del,()=>{if(pe){V.b=pe.b;V.s=pe.s;V.plot.push({x:pe.loc[0],z:pe.loc[1],res:pe.res,ty:pe.ty,n:pe.n});hud();pop(pe.res==='ball'?'Ball':'Strike',[0,0,8],pe.res==='ball'?'#4aa8ff':'#ef5b5b',.9)}});
  const tgt=B(tb||lead.to),mid=[(C[0]+tgt[0])/2,(C[1]+tgt[1])/2];A.cam=[{t:0,c:mid,r:d2(C,tgt)/2+14},{t:del,c:mid,r:d2(C,tgt)/2+10},{t:del+.55,c:tgt,r:34}];let tEnd=lead.t1+.8;
  if(tb){const to=B(tb),cv=tb===2?(V.batL?'SS':'2B'):'3B',tT=S.tT*k,tA=S.tA*k;A.mvF(cv,tb===2?[to[0],to[1]-1.5]:[to[0]+1.5,to[1]+.5],rel,Math.max(rel+.5,tA-.25));if(tb===2)A.act('P',del+.25,'duck');
    if(!e.ok){lead.outT=Math.max(lead.t1,tA)-.02;lead.atBase=true}
    A.act('C',tT,'throw',to);A.thr(tT,tA,C,to);A.act(cv,tA,'tag',C);outCall(A,Math.max(tA,lead.t1)+.07,to,!e.ok,tb,e.ok?null:'TAGGED OUT!');
    A.at(Math.max(tA,lead.t1)+.14,()=>banner(e.ok?'Stolen base':'Caught stealing',e.ok?'sm':'',1.15));tEnd=Math.max(tA,lead.t1)+1.05}
  else A.at(lead.t1,()=>banner('Stolen base','sm',1.1));
  for(const r of A.run)tEnd=Math.max(tEnd,r.t1+.6);A.dur=tEnd;tick(`${sn(lead.p)} takes off for ${BASEN[lead.to]}...`);A.at(tb?Math.max(S.tA*k,lead.t1)+.1:lead.t1,()=>tick(e.desc));return A}
function buildPick(e){const A=newAnim(e),b1=BASEXY[1],M=FPOS.P,tT=.4,tA=tT+d2(M,b1)/THR,ld=e.lead||11;A.keepBat=true;
  const r=A.runner(e.pid,1,ld,.3,[{to:1,t:e.out?tA+.12:tA-.07}]);r.slide='H';r.out=e.out;if(e.out){r.outT=tA+.08;r.atBase=true}
  const sp=r.legs[0].pts[0];A.mvF('1B',[b1[0]-1.5,b1[1]+.5],0,.35);A.act('P',tT,'throw',b1);A.thr(tT,tA,M,b1);A.act('1B',tA,'tag',M);outCall(A,tA+.1,b1,e.out,1,e.out?'PICKED OFF!':null);A.at(r.t0+.1,()=>dust([lerp(sp[0],b1[0],.5),lerp(sp[1],b1[1],.5),0],10));
  if(e.out)A.at(tA+.15,()=>banner('Picked off','',1.15));A.cam=[{t:0,c:[34,62],r:50},{t:tA,c:[54,63],r:34}];A.dur=tA+(e.out?1.2:.8);return A}
// default direction: start on the plate, follow the ball, tighten on whoever ends up with it
function autoCam(A){const K=[{t:0,c:[0,24],r:48}];let last=0;
  for(const s of A.ball){const d=d2(s.a,s.b),t1=s.te!=null?s.te:s.t1;if(s.k==='air')K.push({t:s.t0+.32,r:clamp(40+s.h*.36,44,76)},{t:Math.max(s.t0+.4,t1-.15),r:40});else if(s.k==='roll')K.push({t:Math.max(s.t0+.28,(s.t0+s.t1)/2),r:42});else K.push({t:s.t0+.06,r:clamp(30+d*.12,38,56)},{t:s.t1,r:33});last=Math.max(last,t1)}
  K.push({t:last+.35,r:32});K.sort((a,b)=>a.t-b.t);return K}
/* ---------- state sampling ---------- */
function ballAt(A,t){let s=null;for(const g of A.ball){if(t<g.t0)break;s=g}if(!s||t>(s.te!=null?s.te:s.t1))return null;return segPos(s,t)}
function segPos(s,t){const f=clamp((t-s.t0)/(s.t1-s.t0),0,1);if(s.k==='roll'){const e=1-Math.pow(1-f,1.55);return[lerp(s.a[0],s.b[0],e),lerp(s.a[1],s.b[1],e),lerp(s.a[2],s.b[2],f)*(1-f)+.25+Math.abs(Math.sin(f*Math.PI*s.n))*s.h*(1-f)*(1-f)]}
  const e=s.k==='air'?1-Math.pow(1-f,1.12):f;return[lerp(s.a[0],s.b[0],e),lerp(s.a[1],s.b[1],e),lerp(s.a[2],s.b[2],f)+4*s.h*f*(1-f)]}
function ballXY(A,t){let s=null;for(const g of A.ball){if(t<g.t0)break;s=g}if(!s)return A.ball.length?A.ball[0].a:[0,60];return segPos(s,Math.min(t,s.te!=null?s.te:s.t1))}
const ACTW={field:[.28,.2],catch:[.5,.35],dive:[.3,.75],jump:[.32,.4],throw:[.3,.35],recv:[.4,.2],tag:[.25,.6],duck:[.3,.6],look:[.6,3],pitch:[0,1.5]};
function fldAt(f,t){let x=f.st[0],y=f.st[1],mov=false,dx=0,dy=0,dist=0;
  for(const m of f.mv){if(t<=m.t0)break;const u=clamp((t-m.t0)/(m.t1-m.t0),0,1),e=u*u*(3-2*u)*.4+u*.6,L=d2(m.to,[x,y]);if(L>.3){dx=m.to[0]-x;dy=m.to[1]-y}dist+=L*e;if(u<1&&L>1.5)mov=true;x=lerp(x,m.to[0],e);y=lerp(y,m.to[1],e)}
  let act=null;for(const a of f.act){const w=ACTW[a.k];if(t>=a.t-w[0]&&t<=a.t+w[1])act=a}return{x,y,mov,dx,dy,dist,act,wd:f.wd}}
/* ---------- per-frame scene assembly and drawing ---------- */
const kitOf=(p,side,role)=>{const k=p.id+role;return V.kits[k]||(V.kits[k]=mkKit(p,side<2?V.col[side]:{c1:'#1b2130',c2:'#8c98a8'},side===1,role))};
const mkFig=(p,side,role,x,y,yaw,po,o)=>Object.assign({p,x,y,g:0,z:0,yaw,mir:false,po,sc:V.cam==='pit'?1:FSC,bulk:V.cam==='pit'?1:1.22,kit:kitOf(p,side,role),zk:V.zon[p.id]},o);
const FSC=1.85;// players are drawn larger than life in the field camera so they read on a phone
const yawTo=(x,y,tx,ty)=>Math.atan2(tx-x,ty-y);
function batPose(tau,e){const S=PO.bStance;if(!e)return mixP(S,PO.bLoad,.14+.1*Math.sin(V.T*2.6));
  if(!e.sw){const k=tau<-.5?0:tau<-.22?sstep((tau+.5)/.28):tau<.1?1:Math.max(0,1-(tau-.1)/.4);return mixP(S,PO.bLoad,k*.8)}
  const bx=(V.batL?1:-1)*3.2,ly=V.batL?bx-e.E[0]:e.E[0]-bx,zb=e.E[2]+(e.res==='swing'?e.miss:0),hz=clamp(2.5+(zb-1.5)*.5,2.4,3.9);
  const C=Object.assign({},PO.bContact,{hl:[-.75,ly-2,hz],hr:[-.55,ly-2.1,hz+.1],bat:[-.22,1,clamp((zb-hz)/2.1,-.7,.5)]});
  return seqP([[-.5,S],[-.3,PO.bLoad,1],[-.13,PO.bStride,1],[0,C,2],[.07,PO.bExt],[.26,PO.bFollow,1],[.9,PO.bFollow],[1.4,S,1]],tau)}
function catPose(e,t){const C=PO.cCrouch;if(!e)return C;const u=sstep(clamp((t-e.tR)/(e.tP-e.tR),0,1)*1.3-.3),gx=lerp(e.tgt[0],e.loc[0],u)*.83,g=clamp(2.5+lerp(e.tgt[1],e.loc[1],u)*.9,.7,4.4);
  const po=Object.assign({},C,{hl:[clamp(gx,-2.3,2.3),1.5,g]});return e.go&&t>e.tP?mixP(po,PO.tCock,sstep((t-e.tP)/.16)):po}
function pitchPos(e,t){const u=(t-e.tR)/(e.tP-e.tR);if(u<0)return null;
  if(u<=1||e.res==='ball'||e.res==='called'||e.res==='swing'){if(u>1.075)return null;const w=u*u;return[e.Rp[0]+(e.E[0]-e.Rp[0]-e.Bk[0])*u+e.Bk[0]*w,e.Rp[1]+(e.E[1]-e.Rp[1])*u,e.Rp[2]+(e.E[2]-e.Rp[2]-e.Bk[2])*u+e.Bk[2]*w,u]}
  if(e.res==='foul'){const v=(t-e.tP)/.55;return[e.E[0]+e.fd[0]*v,e.E[1]+e.fd[1]*v,e.E[2]+e.fd[2]*v-12*v*v,1+v]}
  return[e.E[0],e.E[1],e.E[2],1]}
function drawBall(x,c,w,o={}){const zv=V.view?V.view.z:1,q=pj(c,w[0],w[1],w[2]),r=Math.max((o.min||1.7)/zv,q[2]*(o.r||.17));
  if(o.shadow){const g=pj(c,w[0],w[1],gz(w[0],w[1])),a=clamp(.42-w[2]*.004,.12,.42),sr=r*clamp(1+w[2]*.012,1,2.2);x.fillStyle=`rgba(0,0,0,${a})`;x.beginPath();x.ellipse(g[0],g[1],sr*1.25,sr*.55,0,0,TAU);x.fill()}
  const fx=o.fx;if(fx&&!RMO){const tc={fire:'#ff6a2a',ghost:'#b06bff',ice:'#7fe3ff',gold:'#ffd23f',bolt:'#fff36b'}[fx]||'#fff';x.save();x.globalCompositeOperation='lighter';const g=x.createRadialGradient(q[0],q[1],r*.3,q[0],q[1],r*4.2);g.addColorStop(0,tc);g.addColorStop(1,'rgba(0,0,0,0)');x.globalAlpha=.75;x.fillStyle=g;x.fillRect(q[0]-r*4.2,q[1]-r*4.2,r*8.4,r*8.4);x.restore();
    if(R()<.7&&V.fx.length<220)V.fx.push({x:w[0]+(R()-.5)*.4,y:w[1]+(R()-.5)*.4,z:w[2]+(R()-.5)*.4,vx:(R()-.5)*4,vy:(R()-.5)*4,vz:fx==='fire'?6:fx==='ice'?-3:(R()-.5)*4,life:.35,max:.35,col:tc,sz:.16,g:0,glow:true})}
  x.globalAlpha=fx==='ghost'?.3+.7*Math.abs(Math.sin(V.T*26)):1;
  x.fillStyle=INK;x.beginPath();x.arc(q[0],q[1],r+Math.min(1.2/zv,r*.22),0,TAU);x.fill();
  const g=x.createRadialGradient(q[0]-r*.35,q[1]-r*.4,r*.1,q[0],q[1],r);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#cfd5dc');x.fillStyle=g;x.beginPath();x.arc(q[0],q[1],r,0,TAU);x.fill();
  if(r*zv>4.5){x.strokeStyle='rgba(214,58,58,.85)';x.lineWidth=Math.max(.8,r*.13);const a=V.T*22;x.beginPath();x.arc(q[0]+Math.cos(a)*r*.9,q[1]+Math.sin(a)*r*.9,r*.75,a+2.3,a+3.98);x.stroke();x.beginPath();x.arc(q[0]-Math.cos(a)*r*.9,q[1]-Math.sin(a)*r*.9,r*.75,a+5.44,a+7.12);x.stroke()}
  x.globalAlpha=1;return q}
function ribbon(x,c,pts,col,w0,a0){for(let i=0;i<pts.length-1;i++){const a=pj(c,pts[i][0],pts[i][1],pts[i][2]),b=pj(c,pts[i+1][0],pts[i+1][1],pts[i+1][2]),k=1-i/(pts.length-1);x.strokeStyle=col;x.globalAlpha=a0*k*k;x.lineWidth=Math.max(1/(V.view?V.view.z:1),a[2]*w0*(.35+.65*k));x.lineCap=i?'butt':'round';x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke()}x.globalAlpha=1}
function drawPit(x,c){
  const m=V.m,e=V.cur,t=V.et,fs=1-V.half,bs=V.half,F=m.S[fs],figs=[],pe=e&&e.t==='pitch'?e:null,pitP=V.P[V.pit[fs]].p,isK=e&&e.t==='play'&&e.res==='K',lp=pe||(isK?V.lastPitch:null);
  // umpire behind the catcher: punches out strikes
  const call=lp&&lp.done&&(lp.res==='called'||(lp.res==='swing'&&lp.s>=3))?(pe?t-pe.tP:t+lp.dur-lp.tP):-1;
  drawFig(x,c,mkFig(V.ump,2,'u',0,-8.4,0,call>=0&&call<.9?mixP(PO.ump,PO.punch,sstep(call/.12)-sstep((call-.6)/.3)):PO.ump));
  // batter and catcher
  let bq=null;if(V.bat){const bp=V.P[V.bat].p,L=V.batL,tau=lp?(pe?t-pe.tP:t+lp.dur-lp.tP):0,po=batPose(tau,lp),bf=mkFig(bp,bs,'b',(L?1:-1)*3.2,.75,L?-Math.PI/2:Math.PI/2,po,{mir:L});
    // bat swoosh
    if(lp&&lp.sw&&tau>-.12&&tau<.14&&!RMO){const pts=[];for(let i=0;i<7;i++){const J=rig(batPose(tau-i*.014,lp),bf);pts.push([pj(c,J.bk[0],J.bk[1],J.bk[2]),pj(c,J.bt[0],J.bt[1],J.bt[2])])}
      for(let i=0;i<pts.length-1;i++){x.fillStyle=`rgba(255,255,255,${.2*(1-i/6)})`;x.beginPath();x.moveTo(pts[i][0][0],pts[i][0][1]);x.lineTo(pts[i][1][0],pts[i][1][1]);x.lineTo(pts[i+1][1][0],pts[i+1][1][1]);x.lineTo(pts[i+1][0][0],pts[i+1][0][1]);x.closePath();x.fill()}}
    drawFig(x,c,mkFig(F.field.C,fs,'c',0,-4.6,0,catPose(pe,t)));bq=drawFig(x,c,bf)}
  else drawFig(x,c,mkFig(F.field.C,fs,'c',0,-4.6,0,catPose(pe,t)));
  // strike zone, pitch plot
  const zq=[[-.83,3.4],[.83,3.4],[.83,1.6],[-.83,1.6]].map(p=>pj(c,p[0],.7,p[1])),hot=pe&&pe.done&&(pe.res==='called'||pe.res==='swing')?clamp(1-(t-pe.tP)/.4,0,1):0;
  x.beginPath();zq.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fillStyle=hot?`rgba(239,91,91,${.16*hot})`:'rgba(255,255,255,.035)';x.fill();
  x.strokeStyle=hot?`rgba(255,${190-90*hot},${190-90*hot},.9)`:'rgba(255,255,255,.62)';x.lineWidth=1.4;x.stroke();
  x.strokeStyle='rgba(255,255,255,.16)';x.lineWidth=1;x.beginPath();for(const f of [1/3,2/3]){const a=lp2(zq[0],zq[1],f),b=lp2(zq[3],zq[2],f),d=lp2(zq[0],zq[3],f),g=lp2(zq[1],zq[2],f);x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.moveTo(d[0],d[1]);x.lineTo(g[0],g[1])}x.stroke();
  for(const p of V.plot){const q=pj(c,p.x*.83,.7,2.5+p.z*.9),r=Math.max(3.2,q[2]*.14),last=p===V.plot[V.plot.length-1],col=(PITCH[p.ty]||PITCH.FB).c;
    x.globalAlpha=last?1:.5;x.fillStyle=col;x.beginPath();x.arc(q[0],q[1],r,0,TAU);x.fill();x.strokeStyle=p.res==='ball'?'#4aa8ff':p.res==='inplay'?'#f2c14e':p.res==='foul'?'#8c98a8':'#ef5b5b';x.lineWidth=last?2:1.2;x.stroke();
    if(r>5){x.fillStyle=INK;x.font=`700 ${r*1.25}px ${FONTD}`;x.textAlign='center';x.textBaseline='middle';x.fillText(p.n,q[0],q[1]+r*.08)}x.globalAlpha=1}
  // the pitch
  if(pe){const b=pitchPos(pe,t),fl=pe.tP-pe.tR,path=u=>{const w=u*u;return[pe.Rp[0]+(pe.E[0]-pe.Rp[0]-pe.Bk[0])*u+pe.Bk[0]*w,pe.Rp[1]+(pe.E[1]-pe.Rp[1])*u,pe.Rp[2]+(pe.E[2]-pe.Rp[2]-pe.Bk[2])*u+pe.Bk[2]*w]};
    if(t>pe.tP&&t<pe.tP+.5){const pts=[];for(let i=0;i<=18;i++)pts.push(path(1-i/18));const a=1-(t-pe.tP)/.5;x.save();x.globalAlpha=a;ribbon(x,c,pts,pe.col,.1,.55*a);x.restore()}
    if(b){const u=Math.min(b[3],1),pts=[];if(b[3]<=1.08)for(let i=0;i<12;i++){const ui=u-i*.035;if(ui<0)break;pts.push(path(ui))}
      if(pts.length>1)ribbon(x,c,pts,V.ballFx?({fire:'#ff6a2a',ghost:'#b06bff',ice:'#7fe3ff',gold:'#ffd23f',bolt:'#fff36b'}[V.ballFx]||pe.col):pe.col,V.ballFx?.5:.3,V.ballFx?.9:.75);
      drawBall(x,c,b,{r:.19,min:2.2,fx:V.ballFx})}}
  drawFig(x,c,mkFig(pitP,fs,'f',0,60.5,Math.PI,pe?pitchPose((t-pe.tW)/pe.WD):isK?mixP(PO.pEnd,PO.punch,sstep(t/.25)):PO.pSet,{mir:isL(pitP)}));
  if(pe){const b=pitchPos(pe,t);if(b&&b[3]<.25)drawBall(x,c,b,{r:.19,min:2.2,fx:V.ballFx})}
  return bq}
function figFld(p,pos,st,bxy,A,t,side){let po=PO.ready,yaw=d2([st.x,st.y],bxy)>14?yawTo(st.x,st.y,bxy[0],bxy[1]):yawTo(st.x,st.y,0,0),z=0;const a=st.act;
  if(a){const u=t-a.t;if(a.face)yaw=yawTo(st.x,st.y,a.face[0],a.face[1]);else if(a.k==='dive'&&(st.dx||st.dy))yaw=Math.atan2(st.dx,st.dy);else if(a.k!=='look')yaw=yawTo(st.x,st.y,0,0);
    switch(a.k){
      case'field':case'duck':po=mixP(PO.ready,PO.field,u<0?sstep(1+u/.28):1-sstep(u/.2));break;
      case'catch':po=mixP(PO.stand,PO.catchUp,u<0?sstep(1+u/.5):1-sstep(u/.35)*.6);break;
      case'look':po=PO.stand;break;
      case'dive':if(u<0){po=mixP(poseRun(st.dist/6.6*TAU),PO.dive,sstep(1+u/.3));z=1.3*Math.sin(Math.PI*clamp(1+u/.3,0,1))}else po=mixP(PO.dive,PO.ready,sstep((u-.45)/.3));break;
      case'jump':po=PO.jump;z=5.4*Math.sin(Math.PI*clamp((u+.32)/.72,0,1));break;
      case'throw':po=throwPose((u+.3)/.65);break;
      case'pitch':po=pitchPose(u/(st.wd||.8));yaw=Math.PI;break;
      case'recv':po=mixP(PO.ready,PO.recv,u<0?sstep(1+u/.4):1-sstep(u/.2));break;
      case'tag':po=u<-.05?mixP(PO.ready,PO.recv,sstep(1+(u+.05)/.2)):mixP(PO.recv,PO.tag,sstep((u+.05)/.14)-sstep((u-.4)/.2));break}}
  else if(st.mov){po=poseRun(st.dist/6.6*TAU);yaw=Math.atan2(st.dx,st.dy)}
  else if(pos==='C'&&(!A||A.keepBat))po=PO.cCrouch;
  if(pos==='C'&&(!a||a.k!=='throw')&&!st.mov)yaw=0;
  return mkFig(p,side,pos==='C'?'c':'f',st.x,st.y,yaw,po,{z,mir:pos==='P'&&isL(p)&&a&&(a.k==='throw'||a.k==='pitch')})}
function drawFld(x,c){
  const m=V.m,A=V.anim,t=V.et,fs=1-V.half,bs=V.half,F=m.S[fs],figs=[],bxy=A?ballXY(A,t):[0,0],inA={};
  for(const pos of POS.concat('P')){const p=pos==='P'?V.P[V.pit[fs]].p:F.field[pos],st=A&&A.fld[pos]?fldAt(A.fld[pos],t):{x:FPOS[pos][0],y:FPOS[pos][1],mov:false,act:null,dist:0,dx:0,dy:0};figs.push(figFld(p,pos,st,bxy,A,t,fs))}
  UMPS.forEach((q,i)=>{const sg=A&&A.ump[i];figs.push(mkFig(V.ump,2,'u',q[0],q[1],i?yawTo(q[0],q[1],BASEXY[i][0],BASEXY[i][1]):0,sg&&t-sg.t<.95?mixP(PO.stand,PO[sg.k],sstep((t-sg.t)/.12)):i?PO.stand:PO.ump))});
  if(A)for(const r of A.run){inA[r.pid]=1;let tt=t,al=1;if(r.outT!=null&&t>r.outT){tt=r.atBase?Math.min(t,r.t1):Math.min(t,r.outT+.35);al=1-clamp((t-r.outT-.5)/.45,0,1);if(al<=0)continue}
    const s=runAt(r,tt,r.outT!=null&&r.slide?(r.slide==='H'?5.4:4):0),isBat=r.from===0;let po,yaw=Math.atan2(s.dx,s.dy),role='r',mir=false;
    if(t<r.t0){if(isBat){po=PO.bFollow;role='b';mir=V.batL;yaw=V.batL?-Math.PI/2:Math.PI/2}else{po=PO.lead;yaw=yawTo(s.x,s.y,0,40)}}
    else if(s.moving||tt<t){po=poseRun(s.run/6.6*TAU,r.jog?.6:1);
      if(r.slide&&s.rem<10)po=mixP(po,r.slide==='H'?PO.slideH:PO.slideF,sstep((10-s.rem)/4.5))}
    else if(r.slide&&t<r.t1+.5)po=r.slide==='H'?PO.slideH:PO.slideF;
    else if(r.slide)po=mixP(r.slide==='H'?PO.slideH:PO.slideF,PO.stand,sstep((t-r.t1-.5)/.3));
    else{po=r.to===4&&A.hr?PO.cheer:PO.stand}
    figs.push(mkFig(r.p,bs,role,s.x,s.y,yaw,po,{a:al<1?al:null,mir}))}
  V.bases.forEach((pid,i)=>{if(!pid||inA[pid])return;const a=BASEXY[i+1],b=BASEXY[i+2],rx=lerp(a[0],b[0],A?.03:.1),ry=lerp(a[1],b[1],A?.03:.1);figs.push(mkFig(V.P[pid].p,bs,'r',rx,ry,yawTo(rx,ry,0,30),A?PO.stand:PO.lead))});
  if(V.bat&&!inA[V.bat]&&(!A||A.keepBat)&&V.cur&&V.cur.t!=='half'&&V.cur.t!=='end'){const L=V.batL;figs.push(mkFig(V.P[V.bat].p,bs,'b',(L?1:-1)*3.2,.75,L?-Math.PI/2:Math.PI/2,PO.bStance,{mir:L}))}
  figs.sort((a,b)=>b.y-a.y);for(const f of figs)drawFig(x,c,f);
  if(A){const b=ballAt(A,t);if(b){const pts=[b];for(let i=1;i<9;i++){const q=ballAt(A,t-i*.022);if(!q)break;pts.push(q)}
      const first=A.e.t==='play'&&A.ball[0]&&t<A.ball[0].t1,fxk=first?(A.e.abil&&ABIL[A.e.abil]&&ABIL[A.e.abil].k==='O'?ABIL[A.e.abil].fx:A.hr?'gold':null):null;
      if(pts.length>1)ribbon(x,c,pts,fxk?({fire:'#ff6a2a',ghost:'#b06bff',ice:'#7fe3ff',gold:'#ffd23f',bolt:'#fff36b'}[fxk]):'#ffffff',fxk?1.1:.6,fxk?.9:.7);
      drawBall(x,c,b,{r:.55,min:3.1,shadow:true,fx:fxk})}}}
function frame(c,k,ex){const S=V.safe,r=k[2],pts=[[k[0]-r,k[1],0],[k[0]+r,k[1],0],[k[0],k[1]-r*.8,0],[k[0],k[1]+r*.8,0],[k[0],k[1]+r*.5,11]];if(ex)pts.push(ex);
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of pts){const q=pj(c,p[0],p[1],p[2]);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}
  return{x:(x0+x1)/2,y:(y0+y1)/2,z:clamp(Math.min(S.w/(x1-x0),S.h/(y1-y0)),1,5)}}
function camTarget(){const S=V.safe;if(V.cam==='pit')return{x:S.x+S.w/2,y:S.y+S.h/2,z:1+V.punch};
  const A=V.anim,t=V.et,e=V.cur;let k=[0,40,64],ex=null;
  if(A&&A.home&&t>A.home[0]-.4&&t<A.home[1]+.3){// a runner is coming home: the plate has priority, widened to keep an incoming throw in frame
    const w=Math.min(sstep((t-A.home[0]+.4)/.4),1),b=ballXY(A,t),sg=A.ball.find(s=>s.k==='thr'&&t>=s.t0&&t<=s.t1&&d2(s.b,[0,0])<8),near=sg?Math.min(1,d2(b,[0,0])/150):0;k=[lerp(0,b[0],near*.45),lerp(8,b[1],near*.45),34+near*30];
    if(w<1){const K=A.cam,b2=K[0].c||b;k=[lerp(V.camK?V.camK[0]:b2[0],k[0],w),lerp(V.camK?V.camK[1]:b2[1],k[1],w),lerp(V.camK?V.camK[2]:48,k[2],w)]}return frame(V.camF,k,null)}
  if(A){const K=A.cam,b0=ballXY(A,t),sg=A.ball.find(s=>s.k==='thr'&&t>=s.t0&&t<=s.t1),b=sg?[lerp(b0[0],sg.b[0],.5),lerp(b0[1],sg.b[1],.5),b0[2]]:b0,at=q=>q.c||b;let i=0;while(i<K.length-1&&t>=K[i+1].t)i++;const a=K[i],n=K[i+1],p=at(a);
    if(!n)k=[p[0],p[1],a.r];else{const f=sstep((t-a.t)/Math.max(.01,n.t-a.t)),q=at(n);k=[lerp(p[0],q[0],f),lerp(p[1],q[1],f),lerp(a.r,n.r,f)]}
    if(b[2]>8&&!(a.c&&(!n||n.c)))ex=[b[0],b[1],b[2]];V.camK=k}
  else if(e&&(e.t==='half'||e.t==='end'||e.t==='intro')){const b=V.band;if(!V.land&&b.h<S.h*1.15)return{x:V.W/2,y:b.h<=S.h?b.y+b.h/2:b.y+S.h/2-4,z:1+t*.012};k=[0,150,255-t*8]}
  return frame(V.camF,k,ex)}
function vDraw(dts){
  const cv=$('cv');if(!cv||!V)return;const x=cv.getContext('2d'),W=V.W,H=V.H,S=V.safe,scx=S.x+S.w/2,scy=S.y+S.h/2,pit=V.cam==='pit',c=pit?V.camP:V.camF,tg=camTarget();
  if(!V.view)V.view={x:tg.x,y:tg.y,z:tg.z};else{const a=1-Math.exp(-Math.max(dts,.004)*(pit?14:6.5)),v=V.view;v.x+=(tg.x-v.x)*a;v.y+=(tg.y-v.y)*a;v.z+=(tg.z-v.z)*a}
  const v=V.view,z=v.z,bd=pit?{y:0,h:H}:V.band,lo=scx/z,hi=W-(W-scx)/z,lo2=bd.y+scy/z,hi2=bd.y+bd.h-(H-scy)/z;v.x=lo>hi?W/2:clamp(v.x,lo,hi);v.y=lo2>hi2?clamp(v.y,hi2,lo2):clamp(v.y,lo2,hi2);
  const sh=V.shake;V.shake*=Math.pow(.0008,Math.max(dts,.008));const ox=sh>.3?(R()-.5)*sh:0,oy=sh>.3?(R()-.5)*sh:0;
  x.setTransform(DPR*z,0,0,DPR*z,DPR*(scx-v.x*z+ox),DPR*(scy-v.y*z+oy));
  x.imageSmoothingQuality='high';if(pit)x.drawImage(V.bgP,0,0,W,H);
  else{const b=V.band,ty=(b.y-v.y)*z+scy,by=(b.y+b.h-v.y)*z+scy;x.save();x.setTransform(DPR,0,0,DPR,0,0);if(ty>0){x.fillStyle=b.top;x.fillRect(0,0,W,ty+1)}if(by<H){x.fillStyle=b.bot;x.fillRect(0,by-1,W,H-by+1)}x.restore();x.drawImage(V.bgF,0,b.y,W,b.h)}
  if(pit)drawPit(x,c);else drawFld(x,c);
  // rings, particles, call text (all in world space)
  for(const r of V.rings){const q=pj(c,r.w[0],r.w[1],r.w[2]),f=r.t/r.d;x.strokeStyle=r.col;x.globalAlpha=(1-f)*.9;x.lineWidth=Math.max(1/z,q[2]*.22*(1-f));x.beginPath();x.arc(q[0],q[1],q[2]*r.r*(.25+.75*f),0,TAU);x.stroke()}x.globalAlpha=1;
  for(const p of V.fx){const q=pj(c,p.x,p.y,p.z),r=Math.max(.7/z,p.sz*q[2]*(p.glow?1:(1.6-p.life/p.max*.6)));x.globalAlpha=clamp(p.life/p.max*1.5,0,1)*(p.glow?1:.8);if(p.glow)x.globalCompositeOperation='lighter';x.fillStyle=p.col;x.beginPath();x.arc(q[0],q[1],r,0,TAU);x.fill();if(p.glow)x.globalCompositeOperation='source-over'}x.globalAlpha=1;
  if(V.bursts.length){x.save();x.globalCompositeOperation='lighter';x.lineCap='round';for(const b of V.bursts){const q=pj(c,b.w[0],b.w[1],b.w[2]),f=b.t/b.d,e=1-Math.pow(1-f,3),al=f<.55?1:1-(f-.55)/.45,lw=Math.max(1.3/z,q[2]*.55*(1-f*.5));
      if(f<.14){const g=x.createRadialGradient(q[0],q[1],0,q[0],q[1],q[2]*b.r*.5);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.globalAlpha=1-f/.14;x.fillStyle=g;x.fillRect(q[0]-q[2]*b.r,q[1]-q[2]*b.r,q[2]*b.r*2,q[2]*b.r*2)}
      for(let i=0;i<30;i++){const a=i/30*TAU+b.s,rr=q[2]*b.r*e*(.62+.38*((i*7)%5)/4),dr=q[2]*b.r*.45*f*f,dx=Math.cos(a),dy=Math.sin(a);x.globalAlpha=al*.85;x.strokeStyle=b.col;x.lineWidth=lw;x.beginPath();x.moveTo(q[0]+dx*rr*.7,q[1]+dy*rr*.7+dr*.75);x.lineTo(q[0]+dx*rr,q[1]+dy*rr+dr);x.stroke();
        x.globalAlpha=al;x.fillStyle='#fff';x.beginPath();x.arc(q[0]+dx*rr,q[1]+dy*rr+dr,lw*.7,0,TAU);x.fill()}}x.restore()}
  x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';
  for(const p of V.pop){const q=pj(c,p.w[0],p.w[1],p.w[2]),fs=(V.land?17:16)*p.sz/z,rise=(1-p.life)*18/z,px=clamp(q[0],v.x-(scx-46)/z,v.x+(W-scx-46)/z),py=clamp(q[1]-rise,v.y-(scy-S.y-14)/z,v.y+(S.y+S.h-scy-10)/z),k=Math.min(1,(1-p.life)*9);
    x.globalAlpha=clamp(p.life*2.4,0,1);x.font=`italic 800 ${fs*(1.35-.35*k)}px ${FONTD}`;x.lineWidth=3.2/z;x.strokeStyle='rgba(10,14,19,.92)';x.strokeText(p.txt.toUpperCase(),px,py);x.fillStyle=p.col;x.fillText(p.txt.toUpperCase(),px,py)}x.globalAlpha=1;
  // screen-space overlays
  x.setTransform(DPR,0,0,DPR,0,0);x.drawImage(V.vig,0,0,W,H);
  if(V.lines){const L=V.lines,q=pj(c,L.w[0],L.w[1],L.w[2]),sx=(q[0]-v.x)*z+scx,sy=(q[1]-v.y)*z+scy,f=L.t/.32,rr=Math.hypot(W,H);x.fillStyle=`rgba(255,255,255,${(1-f)*(L.big?.5:.32)})`;
    for(let i=0;i<30;i++){const a=i/30*TAU+(i%3)*.07,w=.012+(i%4)*.006,r0=(L.big?50:70)+f*120+(i%5)*14;x.beginPath();x.moveTo(sx+Math.cos(a)*r0,sy+Math.sin(a)*r0);x.lineTo(sx+Math.cos(a-w)*rr,sy+Math.sin(a-w)*rr);x.lineTo(sx+Math.cos(a+w)*rr,sy+Math.sin(a+w)*rr);x.closePath();x.fill()}}
  if(V.flash>.02){x.fillStyle=`rgba(255,255,255,${V.flash})`;x.fillRect(0,0,W,H);V.flash*=.8}
  if(V.cutA>.02){x.fillStyle=`rgba(4,6,10,${V.cutA*.8})`;x.fillRect(0,0,W,H)}}
