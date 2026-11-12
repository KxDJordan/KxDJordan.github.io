'use strict';
/* ================= MATCH VIEWER ================= */
let VW=800,DPR=1,V=null;const VH=420,PR={hz:118,cx:400,D0:95,F:420,H:57.5};
function setVW(w){VW=w;PR.cx=w/2}
function pj(x,y,z=0){const s=PR.F/(y+PR.D0);return[PR.cx+x*s,PR.hz+(PR.H-z)*s,s]}
const fenceR=a=>330+70*Math.cos(2*a);
const FP={P:[0,60],C:[0,-6],'1B':[58,80],'2B':[30,130],SS:[-34,128],'3B':[-58,80],LF:[-135,250],CF:[0,300],RF:[135,250]};
const BX=[[0,0],[63.6,63.6],[0,127.3],[-63.6,63.6],[0,0]];
function buildField(tm){
  DPR=Math.min(2,window.devicePixelRatio||1);
  const cv=document.createElement('canvas');cv.width=VW*DPR;cv.height=VH*DPR;const x=cv.getContext('2d');x.scale(DPR,DPR);
  let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
  let g=x.createLinearGradient(0,0,0,210);g.addColorStop(0,'#0c1036');g.addColorStop(.45,'#3b2a78');g.addColorStop(.78,'#c4477c');g.addColorStop(1,'#ffa35c');x.fillStyle=g;x.fillRect(0,0,VW,VH);
  x.fillStyle='#fff';for(let i=0;i<80;i++){x.globalAlpha=.3+rnd()*.7;x.fillRect(rnd()*VW,rnd()*95,1.5,1.5)}x.globalAlpha=1;
  g=x.createRadialGradient(PR.cx,178,4,PR.cx,178,250);g.addColorStop(0,'rgba(255,236,170,.95)');g.addColorStop(.3,'rgba(255,170,90,.45)');g.addColorStop(1,'rgba(255,150,90,0)');x.fillStyle=g;x.fillRect(0,0,VW,270);
  const B=[];for(let i=0;i<=8;i++){const f=i/8;B.push([lerp(-125,-233,f),lerp(-30,233,f)])}
  for(let i=1;i<40;i++){const a=-Math.PI/4+i/40*Math.PI/2,r=fenceR(a);B.push([Math.sin(a)*r,Math.cos(a)*r])}
  for(let i=0;i<=8;i++){const f=i/8;B.push([lerp(233,125,f),lerp(233,-30,f)])}
  const bot=B.map(p=>pj(p[0],p[1],0)),top=B.map(p=>pj(p[0],p[1],11)),up=B.map(p=>pj(p[0]*1.3,100+(p[1]-100)*1.3,62));
  const line=(pts,rev)=>{if(rev)for(let i=pts.length-1;i>=0;i--)x.lineTo(pts[i][0],pts[i][1]);else pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]))};
  x.beginPath();line(top);line(up,1);x.closePath();x.fillStyle='#201a4d';x.fill();
  const cc=[tm.c1,tm.c2,'#f6f1e4','#ff5c8a','#57c7ff','#ffd23f','#8f88c9','#8f88c9'];
  for(let i=0;i<2800;i++){const k=Math.floor(rnd()*(B.length-1)),f=rnd(),row=(Math.floor(rnd()*9)+.5)/9;const ax=lerp(top[k][0],top[k+1][0],f),ay=lerp(top[k][1],top[k+1][1],f),bx=lerp(up[k][0],up[k+1][0],f),by=lerp(up[k][1],up[k+1][1],f);x.fillStyle=cc[Math.floor(rnd()*cc.length)];x.globalAlpha=.55+rnd()*.45;const s=1.6+row*1.2;x.fillRect(lerp(ax,bx,row),lerp(ay,by,row)-2,s,s)}x.globalAlpha=1;
  for(const k of [7,19,37,49]){const p=up[k];x.fillStyle='#0b0d24';x.fillRect(p[0]-2,p[1]-46,4,48);x.fillStyle='#fff8d6';x.fillRect(p[0]-13,p[1]-56,26,12);g=x.createRadialGradient(p[0],p[1]-50,2,p[0],p[1]-50,64);g.addColorStop(0,'rgba(255,248,214,.85)');g.addColorStop(1,'rgba(255,248,214,0)');x.fillStyle=g;x.fillRect(p[0]-64,p[1]-114,128,128)}
  x.beginPath();line(bot);x.lineTo(VW+60,VH+60);x.lineTo(-60,VH+60);x.closePath();x.fillStyle='#23875f';x.fill();
  x.beginPath();line(bot);line(top,1);x.closePath();x.fillStyle='#123f37';x.fill();
  x.beginPath();line(top);x.strokeStyle=tm.c2;x.lineWidth=2;x.stroke();
  const W=pts=>{x.beginPath();pts.forEach((p,i)=>{const q=pj(p[0],p[1]);i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1])});x.closePath()};
  const arc=(r0,fn)=>{const o=[];for(let i=0;i<=40;i++){const a=-Math.PI/4+i/40*Math.PI/2,r=fn?fn(a):r0;o.push([Math.sin(a)*r,Math.cos(a)*r])}return o};
  W([[0,0]].concat(arc(0,fenceR)));x.fillStyle='#2fae74';x.fill();x.save();x.clip();
  for(let r=30,i=0;r<420;r+=30,i++){if(i%2)continue;W(arc(r).concat(arc(r+30).reverse()));x.fillStyle='rgba(255,255,255,.075)';x.fill()}
  W(arc(0,a=>fenceR(a)-14).concat(arc(0,fenceR).reverse()));x.fillStyle='#b98250';x.fill();x.restore();
  const dirt=[];for(let i=0;i<=120;i++){const a=i/120*Math.PI*2,px=95*Math.cos(a),py=60.5+95*Math.sin(a);if(py>=Math.abs(px))dirt.push([px,py])}
  dirt.push([0,0]);W(dirt);x.fillStyle='#c98f58';x.fill();
  W([[0,20],[45,64],[0,108],[-45,64]]);x.fillStyle='#35b97c';x.fill();
  const circ=(cx,cy,r)=>{const o=[];for(let i=0;i<24;i++){const a=i/24*6.283;o.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}return o};
  W(circ(0,0,13));x.fillStyle='#c98f58';x.fill();W(circ(0,60.5,9));x.fillStyle='#d9a56e';x.fill();
  x.strokeStyle='rgba(255,255,255,.92)';x.lineWidth=1.6;for(const s of [1,-1]){const a=pj(s*3,3),b=pj(s*233,233);x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke()}
  x.lineWidth=1;for(const s of [1,-1]){W([[s*2.5,-3],[s*6.5,-3],[s*6.5,3],[s*2.5,3]]);x.stroke()}
  x.fillStyle='#fff';for(const b of BX.slice(1,4)){W([[b[0],b[1]-2.4],[b[0]+2.4,b[1]],[b[0],b[1]+2.4],[b[0]-2.4,b[1]]]);x.fill()}
  W([[-1.3,.9],[1.3,.9],[1.3,-.4],[0,-1.5],[-1.3,-.4]]);x.fill();W([[-1.6,60],[1.6,60],[1.6,61.2],[-1.6,61.2]]);x.fill();
  g=x.createRadialGradient(PR.cx,VH*.6,VH*.4,PR.cx,VH*.6,VW*.75);g.addColorStop(0,'rgba(11,13,36,0)');g.addColorStop(1,'rgba(11,13,36,.5)');x.fillStyle=g;x.fillRect(0,0,VW,VH);
  return cv}
function startViewer(m){
  G.screen='match';const [a,h]=m.S,bs=n=>`<rect id="b${n}" x="${[25,15,5][n-1]}" y="${[13,3,13][n-1]}" width="10" height="10" transform="rotate(45 ${[30,20,10][n-1]} ${[18,8,18][n-1]})" fill="none" stroke="#f6f1e4" stroke-width="1.6"/>`;
  $('app').innerHTML=`<div class="mt"><canvas id="cv"></canvas>
  <div class="hudp sb"><div><div class="tm">${logoSVG(a.team,20)}<span>${a.team.short}</span><span class="n" id="s0">0</span></div><div class="tm">${logoSVG(h.team,20)}<span>${h.team.short}</span><span class="n" id="s1">0</span></div></div>
  <div class="inn"><div id="inn">Top 1</div><div class="dots" id="outs"></div><div id="cnt">0-0</div></div><svg viewBox="0 0 40 28" width="44" height="31" aria-label="Bases">${bs(1)}${bs(2)}${bs(3)}</svg></div>
  <div class="hudp ctl">${[1,2,4].map(n=>`<button class="btn alt sm ${n===1?'on':''}" id="sp${n}" onclick="A.spd(${n})">${n}x</button>`).join('')}<button class="btn sm" onclick="A.skip()">Sim to end</button><button class="btn sky sm" id="apr" onclick="A.apr()">Bats: balanced</button><button class="btn sky sm" onclick="A.pen()">Call bullpen</button></div>
  <div class="hudp tick" id="tick">Play ball!</div>
  <div class="hudp pc l" id="cb"><canvas id="cbp" width="96" height="96"></canvas><div style="min-width:0"><span class="mut">At bat</span><b id="cbn"></b><span id="cbs"></span><div class="bar z"><i id="cbz"></i></div></div></div>
  <div class="hudp pc r" id="cp"><canvas id="cpp" width="96" height="96"></canvas><div style="min-width:0"><span class="mut">Pitching</span><b id="cpn"></b><span id="cps"></span><div class="bar"><i id="cpe"></i></div><div class="bar z"><i id="cpz"></i></div></div></div>
  <div id="banner"></div>
  <div id="cut"><div class="dim"></div><div class="band"></div><div class="lines"></div><canvas id="cutc" width="360" height="360"></canvas><div class="tx"><div class="k" id="cutk"></div><div class="nm" id="cutn"></div><div class="ds" id="cutd"></div></div></div></div>`;
  const cd=(p,q)=>{const hx=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)),u=hx(p),v=hx(q);return Math.abs(u[0]-v[0])+Math.abs(u[1]-v[1])+Math.abs(u[2]-v[2])};
  V={m,q:[],cur:null,et:0,speed:1,T:0,last:0,run:true,half:0,inn:1,outs:0,b:0,s:0,bases:[null,null,null],score:[0,0],pit:[a.pit.id,h.pit.id],bat:null,zon:{},fx:[],pop:[],trail:[],shake:0,flash:0,anim:null,ballFx:null,P:{},
    col:[cd(a.team.c1,h.team.c1)<130?{c1:a.team.c2,c2:a.team.c1}:{c1:a.team.c1,c2:a.team.c2},{c1:h.team.c1,c2:h.team.c2}]};
  m.S.forEach((s,i)=>s.team.roster.forEach(p=>V.P[p.id]={p,side:i}));
  vSize();hud();requestAnimationFrame(vFrame)}
function vSize(){if(!V)return;const r=$('app').getBoundingClientRect(),asp=clamp(r.width/r.height,1.25,2.4);setVW(Math.round(VH*asp));const sc=Math.min(r.width/VW,r.height/VH),cv=$('cv');DPR=Math.min(2,window.devicePixelRatio||1);cv.width=VW*DPR;cv.height=VH*DPR;cv.style.width=VW*sc+'px';cv.style.height=VH*sc+'px';V.bg=buildField(V.m.S[1].team)}
function hud(){if(!V)return;const m=V.m;$('s0').textContent=V.score[0];$('s1').textContent=V.score[1];$('inn').textContent=(V.half?'Bot ':'Top ')+V.inn;
  $('outs').innerHTML=[0,1,2].map(i=>`<i class="${i<V.outs?'on':''}"></i>`).join('');$('cnt').textContent=V.b+'-'+V.s;
  for(let i=0;i<3;i++)$('b'+(i+1)).setAttribute('fill',V.bases[i]?'#ffd23f':'none');
  const card=(pid,pre,txt)=>{const f=V.P[pid],p=f.p,z=m.z[pid],zk=V.zon[pid],t=m.S[f.side].team;portrait($(pre+'p'),p.look,{c1:t.c1,c2:t.c2,cap:true,zone:zk?ZK[zk].c:null});$(pre+'n').textContent=sn(p);$(pre+'s').textContent=zk?'In the Zone!':txt;$(pre+'z').style.width=(zk?100:z.g)+'%';$(pre).classList.toggle('zone',!!zk)};
  if(V.bat){const l=m.S[V.half].lineup.find(x=>x.p.id===V.bat);card(V.bat,'cb',`${l?l.pos:''}, ${avg(V.P[V.bat].p.s)} avg`)}
  const pid=V.pit[1-V.half],p=V.P[pid].p,np=m.box[pid].np;card(pid,'cp',np+' pitches');$('cpe').style.width=clamp(100-np/(45+p.r.sta*.6)*100,4,100)+'%'}
const tick=t=>{const e=$('tick');if(e)e.textContent=t};
function banner(txt,cls,dur){const e=$('banner');if(!e)return;e.className='';void e.offsetWidth;e.textContent=txt;e.style.setProperty('--bd',(dur/V.speed)+'s');e.className='go '+cls}
function cut(pid,k,name,desc,col,dur){const e=$('cut'),f=V.P[pid],t=V.m.S[f.side].team;portrait($('cutc'),f.p.look,{c1:t.c1,c2:t.c2,cap:true,zone:col});$('cutk').textContent=k;$('cutn').textContent=name;$('cutd').textContent=desc;e.style.setProperty('--zc',col);e.style.setProperty('--cd',(dur/V.speed)+'s');e.className='';void e.offsetWidth;e.className='go'}
const pop=(txt,x,y,col)=>V.pop.push({txt,x,y,life:1,col});
function spark(x,y,n,col,spd=80,g=120){for(let i=0;i<n;i++){const a=R()*6.283,s=spd*(.3+R()*.7);V.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.5+R()*.5,col,sz:1.5+R()*2,g})}}
function vFrame(ts){
  if(!V||!V.run)return;const raw=Math.min(.05,(ts-(V.last||ts))/1000);V.last=ts;V.T+=raw;let acc=raw*V.speed,guard=0;
  while(acc>0&&guard++<30){
    if(!V.cur){if(!V.q.length){if(V.m.done){vEnd();return}V.q=V.m.pa();if(!V.q.length)continue}V.cur=V.q.shift();V.et=0;vStart(V.cur)}
    const step=Math.min(V.cur.dur-V.et,acc);V.et+=step;acc-=step;
    if(V.cur.t==='pitch')pitchFx(V.cur);animFx();
    if(V.et>=V.cur.dur-1e-6){const e=V.cur;V.cur=null;vFinish(e);if(e.t==='end')return}else break}
  for(const p of V.fx){p.x+=p.vx*raw;p.y+=p.vy*raw;p.vy+=(p.g||0)*raw;p.life-=raw}V.fx=V.fx.filter(p=>p.life>0);if(V.fx.length>400)V.fx.splice(0,V.fx.length-400);
  for(const p of V.pop){p.y-=22*raw;p.life-=raw*.9}V.pop=V.pop.filter(p=>p.life>0);
  vDraw();requestAnimationFrame(vFrame)}
function vStart(e){const m=V.m;
  switch(e.t){
    case'batter':e.dur=.5;V.bat=e.pid;V.b=V.s=0;V.anim=null;V.ballFx=null;for(const id in V.zon)if(!m.z[id].on)delete V.zon[id];hud();break;
    case'pitch':e.dur=1.2;e.off=(R()<.5?-1:1)*(.4+R()*.6);if(e.fx)V.ballFx=e.fx;break;
    case'play':V.anim=buildPlay(e);e.dur=V.anim.dur;tick(e.desc);break;
    case'zoneOn':e.dur=1.9;V.zon[e.pid]=e.k;cut(e.pid,'In the Zone',V.P[e.pid].p.name,ZK[e.k].n+' awakened',ZK[e.k].c,e.dur);V.shake=7;hud();break;
    case'ability':{e.dur=2.3;const a=ABIL[e.a];cut(e.pid,sn(V.P[e.pid].p),a.n,a.d,ZK[a.k].c,e.dur);V.shake=9;break}
    case'half':e.dur=1.3;banner((e.half?'Bottom ':'Top ')+e.inn,'sm',e.dur);break;
    case'steal':e.dur=1.3;V.anim={dur:1.3,ball:[{t0:.25,t1:.85,a:[0,-4,4],b:[0,125,4],h:6}],fld:[{pos:'SS',to:[-3,124],t0:0,t1:.7}],run:[{pid:e.pid,from:1,to:2,t0:0,t1:.9,out:!e.ok}],ban:null};tick(e.desc);break;
    case'change':e.dur=1.1;V.pit[e.side]=e.pid;tick('Pitching change: '+V.P[e.pid].p.name+' takes the mound.');hud();break;
    case'end':e.dur=1.3;banner('Game set!','',1.3);break}}
function vFinish(e){
  switch(e.t){
    case'pitch':V.b=e.b;V.s=e.s;hud();break;
    case'play':V.outs=e.outs;V.bases=e.bases;V.score=e.score;V.anim=null;V.b=V.s=0;hud();break;
    case'steal':V.outs=e.outs;V.bases=e.bases;V.anim=null;hud();break;
    case'half':V.half=e.half;V.inn=e.inn;V.outs=0;V.bases=e.bases;V.bat=null;hud();break;
    case'end':vEnd();break}}
function vEnd(){const m=V.m;V.run=false;V=null;finishDay(m)}
function pitchFx(e){if(e.done||V.et/e.dur<.8)return;e.done=true;const s=pj(0,0,6);
  if(e.res==='ball')pop('Ball',s[0],s[1]-20,'#57c7ff');
  else if(e.res==='called'){pop('Strike!',s[0],s[1]-20,'#ff5c8a');spark(s[0],s[1]+6,8,'#fff',50)}
  else if(e.res==='swing')pop('Swing and a miss!',s[0],s[1]-20,'#ff5c8a');
  else if(e.res==='foul')pop('Foul',s[0],s[1]-20,'#f6f1e4');
  else{spark(s[0],s[1],22,V.ballFx?'#ffd23f':'#fff',170);V.shake=Math.max(V.shake,V.ballFx?10:4)}}
function animFx(){const A=V.anim,t=V.et;if(!A)return;
  if(A.ban&&!A.ban.done&&t>=A.ban.t){A.ban.done=true;banner(A.ban.txt,A.ban.cls,1.2);if(!A.ban.cls)V.shake=Math.max(V.shake,A.hr?14:7);if(A.hr)V.flash=1}
  if(A.hr&&t>1.9&&R()<.22)spark(R()*VW,20+R()*95,26,pick(['#ffd23f','#ff5c8a','#57c7ff','#fff']),95,45);
  for(const r of A.run)if(!r.pop&&t>=r.t1){if(r.out){r.pop=true;const q=runAt(r,r.t1),s=pj(q[0],q[1],9);pop('Out!',s[0],s[1],'#ff5c8a')}else if(r.to===4){r.pop=true;const s=pj(0,0,10);pop('Run scores!',s[0]+(R()-.5)*40,s[1]-10,'#ffd23f');spark(s[0],s[1],12,'#ffd23f',70)}}}
function buildPlay(e){
  const A={dur:1.2,ball:[],fld:[],run:[],ban:null},F=FP[e.fpos]||[0,0],j=()=>(R()-.5)*24,plate=[0,1,3],base=b=>[BX[b][0],BX[b][1],4],big=(t,txt,cls)=>A.ban={t,txt,cls,done:false};
  let cap=0;
  switch(e.res){
    case'K':A.dur=1.3;big(0,e.looking?'Strike three!':'Strikeout!','');break;
    case'BB':A.dur=1.6;big(0,'Walk','sm');break;
    case'GO':case'DP':case'E':{const f=[F[0]+j()*.5,F[1]+j()*.5];A.ball.push({t0:0,t1:.75,a:plate,b:[f[0],f[1],2],h:2.5,bounce:3});A.fld.push({pos:e.fpos,to:f,t0:0,t1:.7});
      if(e.res==='E'){A.ball.push({t0:.75,t1:1.3,a:[f[0],f[1],2],b:[f[0]+14,f[1]-10,0],h:8});A.dur=2.2;big(.8,'Error!','sm')}
      else if(e.res==='DP'){const cov=e.fpos==='SS'||e.fpos==='3B'?'2B':'SS';A.fld.push({pos:cov,to:[BX[2][0],BX[2][1]-2],t0:0,t1:.8});if(e.fpos!=='1B')A.fld.push({pos:'1B',to:[61,62],t0:0,t1:.8});A.ball.push({t0:.9,t1:1.3,a:[f[0],f[1],5],b:base(2),h:5});A.ball.push({t0:1.42,t1:1.9,a:base(2),b:base(1),h:7});A.dur=2.5;big(1.9,'Double play!','')}
      else{if(e.fpos!=='1B')A.fld.push({pos:'1B',to:[61,62],t0:0,t1:.8});A.ball.push({t0:.9,t1:1.4,a:[f[0],f[1],5],b:base(1),h:7});A.dur=1.95;big(1.4,'Out','sm')}
      break}
    case'FO':case'SF':case'LO':{const ln=e.res==='LO',of=OFS.includes(e.fpos);let f=[F[0]+j(),F[1]+j()];cap=.5;
      if(e.robbed&&of){const a=Math.atan2(F[0],F[1]),r=fenceR(a)-6;f=[Math.sin(a)*r,Math.cos(a)*r]}
      const ft=ln?.6:e.robbed&&of?2.3:of?1.9:1.5;A.ball.push({t0:0,t1:ft,a:plate,b:[f[0],f[1],e.robbed?13:6],h:ln?5:e.robbed&&of?105:of?85:60});A.fld.push({pos:e.fpos,to:f,t0:0,t1:ft*.92,jump:e.robbed?ft:0});
      A.dur=ft+(e.res==='SF'?1.6:.8);big(ft,e.robbed?'Robbed!':e.res==='SF'?'Sac fly':'Out',e.robbed?'':'sm');
      if(e.res==='SF')A.ball.push({t0:ft+.2,t1:ft+1.3,a:[f[0],f[1],6],b:[0,2,3],h:22});
      break}
    case'1B':{const s=.68+R()*.1,l=[F[0]*s+j(),F[1]*s+j()],g=[lerp(l[0],F[0],.35),lerp(l[1],F[1],.35)];A.ball.push({t0:0,t1:1.05,a:plate,b:[l[0],l[1],0],h:22});A.ball.push({t0:1.05,t1:1.6,a:[l[0],l[1],0],b:[g[0],g[1],2],h:5});A.fld.push({pos:e.fpos,to:g,t0:.2,t1:1.6});A.ball.push({t0:1.8,t1:2.5,a:[g[0],g[1],6],b:base(2),h:14});A.fld.push({pos:'SS',to:[-4,125],t0:.3,t1:1.6});A.dur=2.7;big(1.05,'Base hit!','sm');break}
    case'2B':case'3B':{const tr=e.res==='3B',a=(e.fpos==='LF'?-1:e.fpos==='RF'?1:(R()<.5?-.35:.35))*(tr?.7:.6),r=fenceR(a),l=[Math.sin(a)*r*.8,Math.cos(a)*r*.8],w=[Math.sin(a)*(r-6),Math.cos(a)*(r-6)],T=tr?3.4:2.8,tb=tr?3:2;
      A.ball.push({t0:0,t1:1.7,a:plate,b:[l[0],l[1],0],h:55});A.ball.push({t0:1.7,t1:2.4,a:[l[0],l[1],0],b:[w[0],w[1],1],h:7});A.fld.push({pos:e.fpos,to:w,t0:.2,t1:T});A.ball.push({t0:T+.1,t1:T+1,a:[w[0],w[1],6],b:base(tb),h:30});A.fld.push({pos:tr?'3B':'SS',to:[BX[tb][0],BX[tb][1]-2],t0:.5,t1:2});A.dur=T+1.2;big(1.7,tr?'Triple!':'Double!','');break}
    case'HR':{const a=(e.fpos==='LF'?-.5:e.fpos==='RF'?.5:0)+(R()-.5)*.3;A.ball.push({t0:0,t1:2.5,a:plate,b:[Math.sin(a)*470,Math.cos(a)*470,40],h:120});A.dur=4.6;big(1.9,e.runs===4?'Grand slam!!':'Home run!!','');A.hr=true;break}
  }
  const d=A.dur;for(const mv of e.moves)A.run.push({pid:mv.pid,from:mv.from,to:mv.to,t0:mv.from===0?.12:.25,t1:mv.out?(e.res==='DP'&&mv.from===1?1.3:Math.max(.6,d-.5)):d-.22,out:mv.out,cap:mv.out?cap:0});
  return A}
function ballAt(A,t){let s=null;for(const g of A.ball){if(t<g.t0)break;s=g}if(!s){const g=A.ball[0];return{x:g.a[0],y:g.a[1],z:g.a[2],held:true}}
  const f=clamp((t-s.t0)/(s.t1-s.t0),0,1);let z=lerp(s.a[2],s.b[2],f)+s.h*4*f*(1-f);if(s.bounce)z=Math.abs(Math.sin(f*Math.PI*s.bounce))*s.h*(1-f*.5)+1;
  return{x:lerp(s.a[0],s.b[0],f),y:lerp(s.a[1],s.b[1],f),z,held:t>s.t1}}
function runAt(r,t){let f=clamp((t-r.t0)/(r.t1-r.t0),0,1);if(r.cap)f*=r.cap;const legs=r.to-r.from,g=f*legs,i=Math.min(legs-1,Math.floor(g)),u=g-i,a=BX[r.from+i],b=BX[r.from+i+1];return[lerp(a[0],b[0],u),lerp(a[1],b[1],u)]}
function fldAt(pos,t){const b=FP[pos];let x=b[0],y=b[1],z=0;if(V.anim)for(const f of V.anim.fld)if(f.pos===pos){const u=clamp((t-f.t0)/(f.t1-f.t0),0,1),e=u*u*(3-2*u);x=lerp(b[0],f.to[0],e);y=lerp(b[1],f.to[1],e);if(f.jump&&Math.abs(t-f.jump)<.35)z=10*(1-Math.abs(t-f.jump)/.35)}return[x,y,z]}
function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
function chibi(x,a){
  const [sx,sy,s]=pj(a.x,a.y,a.z||0),g=pj(a.x,a.y,0),h=clamp(s*8.6,16,40),col=V.col[a.side],p=a.p,zk=V.zon[p.id],T=V.T,INK='#0b0d24';
  x.fillStyle='rgba(0,0,0,.28)';x.beginPath();x.ellipse(g[0],g[1],h*.28,h*.09,0,0,7);x.fill();
  if(zk){const c=ZK[zk].c,gr=x.createRadialGradient(sx,sy-h*.5,1,sx,sy-h*.5,h*1.15);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(255,255,255,0)');x.globalAlpha=.5+.25*Math.sin(T*9);x.fillStyle=gr;x.fillRect(sx-h*1.2,sy-h*1.7,h*2.4,h*2.3);x.globalAlpha=.85;x.fillStyle=c;
    for(let i=0;i<5;i++){const fx=sx+(i-2)*h*.2,fh=h*(.85+.35*Math.sin(T*11+i*2.1));x.beginPath();x.moveTo(fx-h*.13,sy-h*.15);x.quadraticCurveTo(fx+Math.sin(T*7+i)*h*.12,sy-fh*.9,fx,sy-fh*1.3);x.quadraticCurveTo(fx+h*.06,sy-fh*.8,fx+h*.13,sy-h*.15);x.fill()}
    x.globalAlpha=1;if(R()<.25)V.fx.push({x:sx+(R()-.5)*h*.7,y:sy-h*R(),vx:(R()-.5)*10,vy:-30-R()*30,life:.6,col:c,sz:1.4+R()*1.6})}
  const cr=a.pose==='crouch',bh=cr?h*.26:h*.34,lg=cr?h*.1:h*.2,by=sy-lg-bh,sw=a.run?Math.sin(T*18+a.x)*h*.13:0,lw=Math.max(1,h*.055);
  x.lineCap='round';x.lineJoin='round';
  const limb=(x0,y0,x1,y1,w,c)=>{x.strokeStyle=INK;x.lineWidth=w+lw*1.6;x.beginPath();x.moveTo(x0,y0);x.lineTo(x1,y1);x.stroke();x.strokeStyle=c;x.lineWidth=w;x.stroke()};
  limb(sx-h*.08,sy-lg,sx-h*.08+sw,sy-1,h*.09,'#f6f1e4');limb(sx+h*.08,sy-lg,sx+h*.08-sw,sy-1,h*.09,'#f6f1e4');
  x.lineWidth=lw;x.strokeStyle=INK;x.fillStyle=col.c1;rr(x,sx-h*.17,by,h*.34,bh,h*.08);x.fill();x.stroke();x.fillStyle=col.c2;x.fillRect(sx-h*.03,by+lw,h*.06,bh-lw*2);
  const skin=SKIN[p.look.skin%5],shx=sx+h*.16,shy=by+h*.07;
  if(a.pose==='pitch'){const th=a.ph<.6?lerp(1.3,-2,a.ph/.6):lerp(-2,.9,(a.ph-.6)/.4);limb(shx,shy,shx+Math.cos(th)*h*.3,shy+Math.sin(th)*h*.3,h*.08,skin);x.fillStyle='#7a5230';x.beginPath();x.arc(sx-h*.24,by+bh*.55,h*.09,0,7);x.fill();x.stroke()}
  else if(a.pose==='bat'){const th=lerp(-1.9,1.1,a.ph),hx=sx+h*.1,hy2=by+h*.12;limb(hx,hy2,hx+Math.cos(th)*h*.62,hy2+Math.sin(th)*h*.62,h*.07,'#f0cf8e');if(a.ph>0&&a.ph<1){x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=h*.05;x.beginPath();x.arc(hx,hy2,h*.6,-1.9,th);x.stroke()}}
  else{const up=a.z>1;limb(sx-h*.17,shy,sx-h*.27,up?by-h*.25:by+bh*.7,h*.07,skin);x.strokeStyle=INK;x.lineWidth=lw;x.fillStyle='#7a5230';x.beginPath();x.arc(sx-h*.28,up?by-h*.3:by+bh*.75,h*.09,0,7);x.fill();x.stroke()}
  const hr=h*.24,hy=by-hr*.78;x.lineWidth=lw;x.strokeStyle=INK;
  x.fillStyle=a.back?HAIR[p.look.hair%10]:skin;x.beginPath();x.arc(sx,hy,hr,0,7);x.fill();x.stroke();
  if(!a.back){x.fillStyle=HAIR[p.look.hair%10];x.beginPath();x.arc(sx,hy,hr*.98,Math.PI*.95,Math.PI*2.05);x.fill();
    if(h>17){x.fillStyle=zk?'#ffb000':INK;x.fillRect(sx-hr*.5,hy+hr*.12,hr*.24,hr*.42);x.fillRect(sx+hr*.26,hy+hr*.12,hr*.24,hr*.42)}}
  x.fillStyle=col.c1;x.beginPath();x.arc(sx,hy-hr*.12,hr*1.03,Math.PI,0);x.closePath();x.fill();x.stroke();
  if(!a.back){x.fillStyle=col.c2;x.beginPath();x.ellipse(sx,hy-hr*.1,hr*1.18,hr*.24,0,0,Math.PI);x.fill();x.stroke()}}
function vDraw(){
  const cv=$('cv');if(!cv||!V)return;const x=cv.getContext('2d');x.setTransform(DPR,0,0,DPR,0,0);
  const sh=V.shake;V.shake*=.86;if(sh>.4)x.translate((R()-.5)*sh,(R()-.5)*sh);
  x.drawImage(V.bg,0,0,VW,VH);
  const m=V.m,fs=1-V.half,bs=V.half,F=m.S[fs],e=V.cur,A=V.anim,t=V.et,act=[];
  for(const pos of POS){const q=fldAt(pos,t);act.push({x:q[0],y:q[1],z:q[2],p:F.field[pos],side:fs,pose:pos==='C'&&!A?'crouch':'field',back:pos==='C',run:!!A&&A.fld.some(f=>f.pos===pos&&t>f.t0&&t<f.t1)})}
  act.push({x:0,y:60,p:V.P[V.pit[fs]].p,side:fs,pose:'pitch',ph:e&&e.t==='pitch'?clamp(V.et/e.dur/.6,0,1):0});
  if(V.bat&&!(A&&A.run.some(r=>r.pid===V.bat))){const swing=e&&e.t==='pitch'&&e.res!=='ball'&&e.res!=='called';act.push({x:-7.5,y:1,p:V.P[V.bat].p,side:bs,pose:'bat',back:true,ph:swing?clamp((V.et/e.dur-.66)/.14,0,1):0})}
  V.bases.forEach((pid,i)=>{if(pid&&!(A&&A.run.some(r=>r.pid===pid))){const a=BX[i+1],b=BX[i+2];act.push({x:lerp(a[0],b[0],.07),y:lerp(a[1],b[1],.07),p:V.P[pid].p,side:bs,pose:'run'})}});
  if(A)for(const r of A.run){if(r.out&&t>r.t1+.25)continue;const q=runAt(r,t);act.push({x:q[0],y:q[1],p:V.P[r.pid].p,side:bs,pose:'run',run:t>r.t0&&t<r.t1,back:r.from+ (t-r.t0)/(r.t1-r.t0)*(r.to-r.from)<2})}
  act.sort((a,b)=>b.y-a.y);for(const a of act)chibi(x,a);
  let b=null;
  if(e&&e.t==='pitch'){const f=V.et/e.dur;if(f>.5&&f<=.8){const u=(f-.5)/.3,miss=e.res==='ball';b={x:e.off*(miss?2.4:.5)*u+Math.sin(u*3.14)*e.off*1.6,y:lerp(57,1,u),z:lerp(6.2,miss?(e.off>0?5.2:.9):3,u)+Math.sin(u*3.14)*.8}}
    else if(f>.8&&e.res==='foul'){const u=(f-.8)/.2;b={x:e.off*38*u,y:-12*u,z:3+46*u}}}
  else if(A&&A.ball.length){b=ballAt(A,t);if(b.held&&A.hr)b=null}
  if(b){const q=pj(b.x,b.y,b.z),gq=pj(b.x,b.y,0),r=clamp(q[2]*.95,1.6,5.5),fx=V.ballFx;
    x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(gq[0],gq[1],r*1.1,r*.4,0,0,7);x.fill();
    V.trail.push([q[0],q[1],r]);if(V.trail.length>(fx?18:9))V.trail.shift();
    const tc={fire:'#ff6a2a',ghost:'#b06bff',ice:'#7fe3ff',gold:'#ffd23f',bolt:'#fff36b'}[fx]||'#ffffff';
    V.trail.forEach((p,i)=>{const k=(i+1)/V.trail.length;x.globalAlpha=k*(fx?.7:.35);x.fillStyle=tc;x.beginPath();x.arc(p[0],p[1],p[2]*(fx?.6+k*1.3:k),0,7);x.fill()});x.globalAlpha=1;
    if(fx&&R()<.6)V.fx.push({x:q[0],y:q[1],vx:(R()-.5)*40,vy:(R()-.5)*40,life:.4,col:tc,sz:1.5+R()*2});
    x.globalAlpha=fx==='ghost'?.35+.65*Math.abs(Math.sin(V.T*30)):1;x.fillStyle='#fff';x.strokeStyle='#0b0d24';x.lineWidth=1;x.beginPath();x.arc(q[0],q[1],r,0,7);x.fill();x.stroke();x.globalAlpha=1}
  else V.trail.length=0;
  for(const p of V.fx){x.globalAlpha=clamp(p.life*1.6,0,1);x.fillStyle=p.col;x.fillRect(p.x-p.sz/2,p.y-p.sz/2,p.sz,p.sz)}x.globalAlpha=1;
  x.textAlign='center';x.font='800 15px "M PLUS Rounded 1c",system-ui,sans-serif';x.lineWidth=4;x.strokeStyle='#0b0d24';x.lineJoin='round';
  for(const p of V.pop){x.globalAlpha=clamp(p.life*2,0,1);x.strokeText(p.txt,p.x,p.y);x.fillStyle=p.col;x.fillText(p.txt,p.x,p.y)}x.globalAlpha=1;
  if(V.flash>.02){x.fillStyle=`rgba(255,255,255,${V.flash*.7})`;x.fillRect(-20,-20,VW+40,VH+40);V.flash*=.85}}
Object.assign(A,{
  spd(n){if(!V)return;V.speed=n;for(const k of [1,2,4])$('sp'+k).classList.toggle('on',k===n)},
  skip(){if(!V)return;const m=V.m;while(!m.done)m.pa();vEnd()},
  apr(){if(!V)return;const m=V.m;m.approach=m.approach===1?-1:m.approach+1;$('apr').textContent='Bats: '+({'-1':'patient',0:'balanced',1:'aggressive'})[m.approach]},
  pen(){if(!V)return;const m=V.m,us=m.S[0].user?m.S[0]:m.S[1];if(!us.pen.length)return tick('The bullpen is empty.');m.wantChange=true;tick('Bullpen call made. The reliever comes in before your next batter faced.')}
});
