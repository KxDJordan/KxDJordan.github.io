'use strict';
/* ================= UI =================
   Screens: title, create (wizard), hub (+views), result, season, tryouts. Player/team/confirm sheets live in G.modal.
   Globals other files rely on: $, esc, money, tname, avg, era, ipf, findP, logoSVG, portrait, paint, render, A, SKIN, HAIR, EYE. */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>(n<0?'−$':'$')+Math.abs(Math.round(n)).toLocaleString('en-US');
const tname=t=>esc(t.city+' '+t.nick);
const rc=v=>v>=75?'r3':v>=60?'r2':v<40?'r0':'';
const tier=v=>v>=75?'t5':v>=65?'t4':v>=55?'t3':v>=45?'t2':'t1';
const rt=(v,cls='')=>`<span class="rt ${tier(v)} ${cls}">${v.toFixed(0)}</span>`;
const potG=p=>p.pot>=85?'S':p.pot>=77?'A':p.pot>=69?'B':p.pot>=61?'C':'D';
const potB=p=>`<span class="pot ${potG(p)}">${potG(p)}</span>`;
const avg=s=>s.ab?(s.h/s.ab).toFixed(3).replace(/^0/,''):'.000';
const era=s=>s.po?(s.per*21/s.po).toFixed(2):'0.00';
const ipf=o=>Math.floor(o/3)+'.'+o%3;
const stars=n=>`<span class="stars" aria-label="${n} of 5 stars">${'★'.repeat(n)}<i>${'★'.repeat(Math.max(0,5-n))}</i></span>`;
function findP(id){for(const t of Object.values(G.s.teams)){const p=t.roster.find(q=>q.id===id);if(p)return{p,t}}if(G.try){const p=G.try.pool.find(q=>q.id===id);if(p)return{p,t:UT()}}return null}

/* ---------- colour helpers (club colours can be near-white or navy; derive contrast-safe accents) ---------- */
const hexRGB=h=>{h=String(h||'#888').replace('#','');if(h.length===3)h=h.replace(/./g,'$&$&');const n=parseInt(h,16)||0;return[n>>16&255,n>>8&255,n&255]};
const rgbHex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mixC=(a,b,f)=>{const x=hexRGB(a),y=hexRGB(b);return rgbHex(x.map((v,i)=>v+(y[i]-v)*f))};
const lumC=h=>{const[r,g,b]=hexRGB(h).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};
const shade=(h,f)=>f<0?mixC(h,'#000000',-f):mixC(h,'#ffffff',f);
const hslOf=h=>{const[r,g,b]=hexRGB(h).map(v=>v/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;let hh=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));hh=(mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4)*60;if(hh<0)hh+=360}return[hh,s,l]};
const hslHex=(h,s,l)=>{const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,[r,g,b]=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return rgbHex([r,g,b].map(v=>(v+m)*255))};
// raise lightness (keeping hue) until the colour has at least `ratio` contrast against the dark surface
function liftTo(hex,ratio){let[h,s,l]=hslOf(hex),c=hex,i=0;while((lumC(c)+.05)/.062<ratio&&i++<40){l=Math.min(1,l+.025);c=hslHex(h,s,l)}return c}
const onDark=h=>liftTo(h,4.6);
const inkOn=h=>lumC(h)>.34?'#0b0f15':'#ffffff';
function themeVars(c1,c2){const st=document.documentElement.style,a=onDark(c1),f=liftTo(c1,2.3),[r,g,b]=hexRGB(a);
  st.setProperty('--c1',c1);st.setProperty('--c2',c2);st.setProperty('--accent',a);st.setProperty('--accent-2',onDark(c2));st.setProperty('--accent-fill',f);st.setProperty('--accent-ink',inkOn(f));st.setProperty('--accent-soft',`rgba(${r},${g},${b},.15)`)}

/* ---------- icons ---------- */
const IC={
home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
roster:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.1.8 3.5 2.8 3.5 5.7"/>',
lineup:'<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1.2"/><circle cx="4" cy="12" r="1.2"/><circle cx="4" cy="18" r="1.2"/>',
tactics:'<path d="M12 3 21 12l-9 9-9-9z"/><path d="M12 8.5 15.5 12 12 15.5 8.5 12z"/>',
train:'<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
staff:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
coach:'<path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8z"/>',
sched:'<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
league:'<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M12 14v4M8 21h8"/>',
board:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',
more:'<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
x:'<path d="M6 6l12 12M18 6 6 18"/>',check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
chev:'<path d="m9 6 6 6-6 6"/>',play:'<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>',ff:'<path d="M4 6v12l8-6zM13 6v12l8-6z" fill="currentColor"/>',
back:'<path d="m15 6-6 6 6 6"/>'};
const ic=(n,s=20)=>`<svg class="ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;

/* ---------- club crest: shield, two-tone, emblem ---------- */
function logoSVG(t,sz){const e=EMB[(t.logo||0)%EMB.length],c1=t.c1||'#888',c2=t.c2||'#fff',dk=lumC(c1)<.06;
  return `<svg class="crest" viewBox="0 0 100 100" width="${sz}" height="${sz}" aria-hidden="true"><path d="M50 4 90 15v34c0 24-17 39-40 47C27 88 10 73 10 49V15z" fill="${c1}"/><path d="M50 4 90 15v34c0 24-17 39-40 47z" fill="#000" fill-opacity=".14"/><path d="M50 4 90 15v34c0 24-17 39-40 47C27 88 10 73 10 49V15z" fill="none" stroke="${dk?'rgba(255,255,255,.4)':'rgba(0,0,0,.35)'}" stroke-width="2"/><path d="M50 11.5 83.5 20.5v28.5c0 20-14 33-33.5 40-19.500-7-33.500-20-33.500-40V20.500z" fill="none" stroke="${c2}" stroke-width="2.600" stroke-linejoin="round"/><path d="${e.d}" fill="${c2}" fill-rule="evenodd" transform="translate(50 47) scale(.46) translate(-50 -50)"/></svg>`}

/* ---------- player portrait (canvas, 100x100 units, transparent background) ----------
   portrait(canvas, look, {c1,c2,cap,zone}) — signature shared with the match scene. */
const SKIN=['#ffe0c4','#f6c9a0','#e0a878','#b97a50','#8a5a3a'],HAIR=['#1b1b2a','#5a3a22','#f2c94c','#e2513f','#3d8bff','#19b5b0','#ff7ab0','#d9dee8','#8a4dff','#3fbf6a'],EYE=['#3d8bff','#35b37a','#c2410c','#8a4dff','#5a3a22','#e2513f'];
const HAIRP=['M22 46 L24 22 L34 8 L40 18 L50 4 L58 18 L68 8 L76 24 L78 46 L70 34 L64 44 L56 32 L50 44 L42 32 L36 44 L30 34 Z','M22 48 C20 12 80 12 78 48 L73 39 L27 39 Z','M22 48 C18 10 82 10 78 48 C74 36 66 30 56 30 C46 40 34 42 26 40 Z','M22 50 C18 12 82 12 78 50 L72 36 Q60 30 50 37 Q40 30 28 36 Z','M22 48 C18 10 82 10 78 48 C74 36 66 30 56 30 C46 40 34 42 26 40 Z','M26 40 C26 16 74 16 74 40 C62 31 38 31 26 40 Z'];
function portrait(cv,look,o={}){
  const c=cv.getContext('2d'),u=cv.width/100;c.setTransform(u,0,0,u,0,0);c.clearRect(0,0,100,100);c.lineJoin=c.lineCap='round';
  look=look||{};const skin=SKIN[(look.skin||0)%5],hair=HAIR[(look.hair||0)%10],eye=EYE[(look.eye||0)%6],st=(look.style||0)%6;
  const c1=o.c1||'#e23d4b',c2=o.c2||'#ffd23f',skD=shade(skin,-.2),hrD=shade(hair,-.38),hrL=shade(hair,.3),line='#1c1f2b';
  const lg=(x0,y0,x1,y1,a,b)=>{const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g};
  const edge=(col,w=1.1)=>{c.strokeStyle=col;c.lineWidth=w;c.stroke()};
  if(o.zone){const g=c.createRadialGradient(50,52,6,50,52,64);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.38,o.zone);g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,100,100)}
  // back hair
  c.fillStyle=hrD;
  if(st===3){c.beginPath();c.moveTo(22,44);c.quadraticCurveTo(12,80,22,99);c.lineTo(78,99);c.quadraticCurveTo(88,80,78,44);c.closePath();c.fill()}
  if(st===4){c.beginPath();c.moveTo(70,28);c.quadraticCurveTo(99,30,92,74);c.quadraticCurveTo(84,52,70,48);c.closePath();c.fillStyle=lg(70,28,95,70,hair,hrD);c.fill()}
  // jersey
  c.beginPath();c.moveTo(4,101);c.quadraticCurveTo(8,79,37,75);c.lineTo(63,75);c.quadraticCurveTo(92,79,96,101);c.closePath();
  c.fillStyle=lg(0,74,0,101,shade(c1,.1),shade(c1,-.28));c.fill();edge(shade(c1,-.5),1);
  c.save();c.clip();c.strokeStyle=c2;c.globalAlpha=.9;c.lineWidth=1.6;c.beginPath();c.moveTo(18,84);c.quadraticCurveTo(15,92,14,101);c.moveTo(82,84);c.quadraticCurveTo(85,92,86,101);c.stroke();c.restore();
  // neck
  c.beginPath();c.moveTo(42,62);c.lineTo(42,78);c.lineTo(50,88);c.lineTo(58,78);c.lineTo(58,62);c.closePath();c.fillStyle=lg(0,64,0,84,skD,skin);c.fill();
  // collar
  c.beginPath();c.moveTo(35,76.500);c.lineTo(42,74.500);c.lineTo(50,88);c.lineTo(58,74.500);c.lineTo(65,76.500);c.lineTo(50,97);c.closePath();c.fillStyle=c2;c.fill();edge(shade(c2,-.45),.8);
  // ears
  c.fillStyle=skin;for(const ex of [24.500,75.500]){c.beginPath();c.ellipse(ex,51,3.800,5.800,0,0,7);c.fill();edge(skD,.9)}
  // face
  const face=new Path2D();face.moveTo(25,44);face.bezierCurveTo(25,16,75,16,75,44);face.bezierCurveTo(75,64,62,78,50,80);face.bezierCurveTo(38,78,25,64,25,44);face.closePath();
  c.fillStyle=skin;c.fill(face);
  c.save();c.clip(face);c.fillStyle=skD;c.globalAlpha=.34;c.beginPath();c.ellipse(86,58,22,40,.15,0,7);c.fill();c.globalAlpha=.16;c.fillStyle='#ff6b6b';for(const bx of [33,67]){c.beginPath();c.ellipse(bx,63,5.500,2.800,0,0,7);c.fill()}c.restore();
  c.strokeStyle=shade(skin,-.42);c.lineWidth=1;c.stroke(face);
  // eyes
  for(const ex of [38,62]){
    c.fillStyle='#fff';c.beginPath();c.ellipse(ex,53.500,6.200,o.zone?5.600:7,0,0,7);c.fill();
    c.save();c.clip();const ir=o.zone?'#ffb000':eye;c.fillStyle=lg(0,47,0,61,shade(ir,-.45),shade(ir,.15));c.beginPath();c.ellipse(ex,54.200,4.500,5.900,0,0,7);c.fill();
    c.fillStyle='#10121c';c.beginPath();c.ellipse(ex,54.600,2,3,0,0,7);c.fill();c.fillStyle='rgba(20,22,34,.28)';c.fillRect(ex-8,45,16,4.500);c.restore();
    c.fillStyle='#fff';c.beginPath();c.arc(ex-1.700,51.400,1.500,0,7);c.fill();c.globalAlpha=.7;c.beginPath();c.arc(ex+1.600,57,.8,0,7);c.fill();c.globalAlpha=1;
    c.strokeStyle=line;c.lineWidth=2;c.beginPath();c.moveTo(ex-7.200,49.600);c.quadraticCurveTo(ex,44.200,ex+7.200,49.600);c.stroke()}
  // brows, nose, mouth
  const bz=o.zone?5:0;c.strokeStyle=shade(hair,-.5);c.lineWidth=1.900;c.beginPath();c.moveTo(30.500,41-bz*.3);c.quadraticCurveTo(37,38.800+bz*.5,45,40+bz);c.moveTo(69.500,41-bz*.3);c.quadraticCurveTo(63,38.800+bz*.5,55,40+bz);c.stroke();
  c.strokeStyle=shade(skin,-.4);c.lineWidth=1.100;c.beginPath();c.moveTo(50,61);c.lineTo(51.300,63.600);c.stroke();
  c.beginPath();if(o.zone){c.fillStyle='#7a1f2b';c.moveTo(42.500,67);c.quadraticCurveTo(50,77,57.500,67);c.closePath();c.fill();c.fillStyle='#fff';c.fillRect(44.500,67,11,1.600)}else{c.strokeStyle=shade(skin,-.55);c.lineWidth=1.500;c.moveTo(45,69.200);c.quadraticCurveTo(50,72,55,69.200);c.stroke()}
  // front hair
  const hp=new Path2D(HAIRP[st]),hairFill=()=>{c.fillStyle=lg(0,6,0,50,hrL,hair);c.fill(hp);c.save();c.clip(hp);c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=3.500;c.beginPath();c.moveTo(30,27);c.quadraticCurveTo(48,17,68,25);c.stroke();c.restore();c.strokeStyle=hrD;c.lineWidth=1;c.stroke(hp)};
  if(!o.cap)hairFill();
  else{
    c.save();c.beginPath();c.rect(0,34,100,66);c.clip();hairFill();c.restore();
    const crown=new Path2D();crown.moveTo(20.500,37);crown.bezierCurveTo(20.500,0,79.500,0,79.500,37);crown.closePath();
    c.fillStyle=lg(20,6,80,36,shade(c1,.14),shade(c1,-.3));c.fill(crown);c.strokeStyle=shade(c1,-.55);c.lineWidth=1;c.stroke(crown);
    c.save();c.clip(crown);c.strokeStyle='rgba(0,0,0,.16)';c.lineWidth=.9;c.beginPath();c.moveTo(50,9);c.quadraticCurveTo(36,20,33,37);c.moveTo(50,9);c.quadraticCurveTo(64,20,67,37);c.stroke();c.restore();
    c.fillStyle=c2;c.beginPath();c.arc(50,23.500,5.200,0,7);c.fill();c.fillStyle=shade(c1,-.1);c.beginPath();c.arc(50,23.500,2.300,0,7);c.fill();
    c.beginPath();c.moveTo(18.500,35.500);c.quadraticCurveTo(50,27.500,84,37.500);c.quadraticCurveTo(94,42,84,44.500);c.quadraticCurveTo(50,35.500,18.500,40.500);c.closePath();c.fillStyle=lg(0,30,0,45,shade(c2,.1),shade(c2,-.3));c.fill();edge(shade(c2,-.55),.9)}
  c.setTransform(1,0,0,1,0,0)}
const ptBg=c1=>`linear-gradient(160deg,${mixC(c1,'#1a2230',.35)},${mixC(c1,'#080b10',.72)})`;
function paint(){
  document.querySelectorAll('canvas[data-pid]').forEach(cv=>{const f=findP(cv.dataset.pid);if(f){cv.style.background=ptBg(f.t.c1);portrait(cv,f.p.look,{c1:f.t.c1,c2:f.t.c2,cap:true})}});
  document.querySelectorAll('canvas[data-coach]').forEach(cv=>{const S=G.s,l=S?S.coach.look:G.cr.look,t=S?UT():G.cr;cv.style.background=ptBg(t.c1);portrait(cv,l,{c1:t.c1,c2:t.c2})})}
const pt=(p,sz=36)=>`<canvas class="pt" data-pid="${p.id}" width="${sz*2}" height="${sz*2}" style="width:${sz}px;height:${sz}px"></canvas>`;

/* ---------- render ---------- */
function render(){
  const app=$('app'),S=G.s;if(G.screen==='match')return;
  if(G.screen==='create'&&G.cr)themeVars(G.cr.c1,G.cr.c2);else if(S&&G.screen!=='title')themeVars(UT().c1,UT().c2);else themeVars('#e23d4b','#ffd23f');
  let h={title:vTitle,create:vCreate,hub:vHub,result:vResult,season:vSeason,tryouts:vTryouts}[G.screen]();
  if(G.modal)h+=`<div class="modal ${G.modalCls||''} ${G._mk===G.modal?'still':''}" onclick="if(event.target===this)A.close()">${G.modal()}</div>`;
  const key=G.screen+G.view,old=app.querySelector('.main'),st=old?old.scrollTop:0,os=app.querySelector('.sheet-b'),sst=os?os.scrollTop:0;
  app.innerHTML=h;
  if(G._key===key){const m=app.querySelector('.main');if(m)m.scrollTop=st;const s=app.querySelector('.sheet-b');if(s&&G._mk===G.modal)s.scrollTop=sst}
  G._key=key;G._mk=G.modal;paint();if(G.screen==='title')titleBg()}
const sheet=(title,body,foot,flush)=>`<div class="sheet" role="dialog" aria-label="${esc(title)}"><div class="sheet-h"><h2>${title}</h2><button class="ibtn" aria-label="Close" onclick="A.close()">${ic('x',22)}</button></div><div class="sheet-b ${flush?'flush':''}">${body}</div>${foot?`<div class="sheet-f">${foot}</div>`:''}</div>`;
const card=(title,small,body,cls='')=>`<section class="card">${title?`<div class="card-h"><h2>${title}</h2>${small?`<small>${small}</small>`:''}</div>`:''}<div class="card-b ${cls}">${body}</div></section>`;

/* ---------- title ---------- */
function vTitle(){const sv=load();let cont='';
  if(sv){const t=sv.teams.user;cont=`<div class="tsave">${logoSVG(t,40)}<div class="who"><span class="nm">${tname(t)}</span><span class="sub">Season ${sv.season} · Day ${Math.min(sv.day+1,NDAYS)} of ${NDAYS} · ${t.w}–${t.l}</span></div></div><button class="btn gold" onclick="A.cont()">${ic('play',16)}Continue career</button>`}
  return `<div class="title"><canvas id="tbg"></canvas>
  <div class="lockup"><svg class="mk" viewBox="0 0 64 40" width="64" height="40" aria-hidden="true"><path d="M2 38 40 14" stroke="#f2c14e" stroke-width="2.500" stroke-linecap="round" opacity=".55"/><path d="M12 38 42 19" stroke="#fff" stroke-width="1.500" stroke-linecap="round" opacity=".4"/><path d="m47 2 3.300 7.400 8 .9-6 5.400 1.700 7.900L47 19.500l-7 4.100 1.700-7.900-6-5.400 8-.9z" fill="#f2c14e"/></svg>
  <svg class="lk" viewBox="0 0 400 150" role="img" aria-label="Starfall Nine"><text class="lk1" x="200" y="92" text-anchor="middle" textLength="384" lengthAdjust="spacingAndGlyphs">STARFALL</text><path d="M52 125h62M286 125h62" stroke="#f2c14e" stroke-width="2"/><text class="lk2" x="200" y="140" text-anchor="middle" textLength="140" lengthAdjust="spacing">NINE</text></svg><div class="lktag">Youth Baseball Manager</div></div>
  <div class="tcta">${cont}<button class="btn ${sv?'ghost':''}" onclick="A.newc()">Start a new career</button><div class="tfoot">Build a club. Find your style. Chase the Starfall Cup.</div></div></div>`}
/* key art: stadium at night, drawn in code */
function titleBg(){const cv=$('tbg');if(!cv)return;const r=cv.parentNode.getBoundingClientRect(),W=Math.max(2,Math.round(r.width)),H=Math.max(2,Math.round(r.height)),d=Math.min(2,window.devicePixelRatio||1);
  cv.width=W*d;cv.height=H*d;const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);
  let sd=7;const rnd=()=>(sd=sd*16807%2147483647)/2147483647;
  const land=W>H*1.2,hz=H*(land?.6:.66),U=Math.min(W,H*1.1);
  let g=c.createLinearGradient(0,0,0,hz);g.addColorStop(0,'#04060d');g.addColorStop(.55,'#0a1330');g.addColorStop(1,'#1c2f63');c.fillStyle=g;c.fillRect(0,0,W,hz+2);
  for(let i=0;i<150;i++){const x=rnd()*W,y=rnd()*hz*.82,s=rnd();c.globalAlpha=.25+s*.6;c.fillStyle=s>.9?'#ffe9b0':'#dfe8ff';c.beginPath();c.arc(x,y,.4+s*1.100,0,7);c.fill()}c.globalAlpha=1;
  // falling stars
  const streak=(x,y,len,w,a)=>{const dx=-len*.86,dy=len*.5,gr=c.createLinearGradient(x,y,x-dx,y-dy);gr.addColorStop(0,`rgba(255,244,214,${a})`);gr.addColorStop(1,'rgba(255,244,214,0)');c.strokeStyle=gr;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x-dx,y-dy);c.stroke();
    const gl=c.createRadialGradient(x,y,0,x,y,w*5);gl.addColorStop(0,`rgba(255,250,235,${a})`);gl.addColorStop(1,'rgba(255,220,150,0)');c.fillStyle=gl;c.beginPath();c.arc(x,y,w*5,0,7);c.fill()};
  streak(W*.2,hz*.34,U*.5,2.400,.95);streak(W*.6,hz*.16,U*.22,1.400,.6);streak(W*.86,hz*.5,U*.16,1.200,.45);streak(W*.42,hz*.62,U*.12,1,.35);
  // horizon glow
  g=c.createRadialGradient(W/2,hz,0,W/2,hz,Math.max(W*.7,H*.4));g.addColorStop(0,'rgba(120,160,255,.42)');g.addColorStop(1,'rgba(120,160,255,0)');c.fillStyle=g;c.fillRect(0,0,W,hz);
  // grandstand
  const sh=U*.15,top=x=>hz-sh*(.55+.45*Math.pow(Math.abs(x/W-.5)*2,1.6));
  c.beginPath();c.moveTo(0,hz);for(let i=0;i<=40;i++)c.lineTo(W*i/40,top(W*i/40));c.lineTo(W,hz);c.closePath();g=c.createLinearGradient(0,hz-sh,0,hz);g.addColorStop(0,'#0b1124');g.addColorStop(1,'#141d3a');c.fillStyle=g;c.fill();
  for(let i=0;i<Math.round(W*1.300);i++){const x=rnd()*W,t=top(x),y=t+4+rnd()*(hz-t-8),s=rnd();c.globalAlpha=.18+s*.5;c.fillStyle=s>.8?'#ffd98a':s>.5?'#b9c8f0':'#7f93c9';c.fillRect(x,y,1.300,1.300)}c.globalAlpha=1;
  c.strokeStyle='rgba(160,185,255,.35)';c.lineWidth=1;c.beginPath();for(let i=0;i<=40;i++)c.lineTo(W*i/40,top(W*i/40));c.stroke();
  // light towers
  const tower=(x,k)=>{const th=U*(land?.34:.25)*k,ty=top(x)-th,bw=U*.075*k,bh=U*.04*k;
    const gl=c.createRadialGradient(x,ty,0,x,ty,U*.42*k);gl.addColorStop(0,'rgba(210,228,255,.5)');gl.addColorStop(.25,'rgba(160,195,255,.16)');gl.addColorStop(1,'rgba(160,195,255,0)');c.fillStyle=gl;c.fillRect(x-U*.5,ty-U*.5,U,U);
    c.strokeStyle='#0a0f1f';c.lineWidth=Math.max(1.500,U*.006*k);c.beginPath();c.moveTo(x,top(x)+2);c.lineTo(x,ty);c.stroke();
    c.fillStyle='#0a0f1f';c.fillRect(x-bw/2-2,ty-bh/2-2,bw+4,bh+4);
    for(let i=0;i<5;i++)for(let j=0;j<3;j++){c.fillStyle='#f4f8ff';c.fillRect(x-bw/2+i*bw/5+1,ty-bh/2+j*bh/3+1,bw/5-2,bh/3-2)}
    const fl=c.createRadialGradient(x,ty,0,x,ty,bw*1.200);fl.addColorStop(0,'rgba(255,255,255,.85)');fl.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=fl;c.beginPath();c.arc(x,ty,bw*1.200,0,7);c.fill()};
  tower(W*.1,1);tower(W*.9,1);
  // outfield wall
  c.fillStyle='#0c2a22';c.fillRect(0,hz-U*.012,W,U*.03);c.fillStyle='#f2c14e';c.fillRect(0,hz-U*.012,W,1.500);
  // field, projected from a camera behind home plate (x = feet left/right, y = feet toward centre field)
  const fy=hz+U*.018,hx=W/2,CH=24,D0=30,K=(H*.985-hz)*D0,pr=(x,y)=>{const q=K/(y+D0)/CH;return[hx+x*q,hz+CH*q]};
  const poly=(pts,fill)=>{c.beginPath();pts.forEach((q,i)=>{const[a,b]=pr(q[0],q[1]);i?c.lineTo(a,b):c.moveTo(a,b)});c.closePath();c.fillStyle=fill;c.fill()};
  const ring=(cx,cy,r,a0=0,a1=6.2832,n=40)=>Array.from({length:n+1},(_,i)=>{const a=a0+(a1-a0)*i/n;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r]});
  g=c.createLinearGradient(0,fy,0,H);g.addColorStop(0,'#236f4c');g.addColorStop(1,'#124532');c.fillStyle=g;c.fillRect(0,fy,W,H-fy);
  c.save();c.beginPath();c.rect(0,fy,W,H-fy);c.clip();
  for(let y=150,i=0;y<420;y+=22,i++)if(i%2===0)poly([[-900,y],[900,y],[900,y+22],[-900,y+22]],'rgba(255,255,255,.05)');
  poly([[0,-14]].concat(ring(0,60.5,96,-.42,Math.PI+.42)),'#7d5638');
  poly([[0,10],[53,63.5],[0,117],[-53,63.5]],'#1f6646');
  for(let i=0;i<6;i+=2)poly([[-60,10+i*18],[60,10+i*18],[60,28+i*18],[-60,28+i*18]].map(q=>[clamp(q[0],-(53-Math.abs(q[1]-63.5)),53-Math.abs(q[1]-63.5)),q[1]]),'rgba(255,255,255,.045)');
  poly(ring(0,60.5,9),'#8e6543');poly(ring(0,0,13),'#7d5638');
  c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=Math.max(1.5,U*.004);c.lineCap='butt';
  for(const sx of [-1,1]){const[a,b]=pr(sx*4,4),[e,f]=pr(sx*330,330);c.beginPath();c.moveTo(a,b);c.lineTo(e,f);c.stroke()}
  for(const q of [[63.6,63.6],[0,127.3],[-63.6,63.6]])poly([[q[0],q[1]-2.2],[q[0]+2.2,q[1]],[q[0],q[1]+2.2],[q[0]-2.2,q[1]]],'#f4f6fa');
  poly([[-1.5,60],[1.5,60],[1.5,61],[-1.5,61]],'#f4f6fa');
  c.restore();
  // light spill + vignette
  g=c.createLinearGradient(0,fy,0,fy+U*.2);g.addColorStop(0,'rgba(200,225,255,.16)');g.addColorStop(1,'rgba(200,225,255,0)');c.fillStyle=g;c.fillRect(0,fy,W,U*.2);
  g=c.createLinearGradient(0,H*.5,0,H);g.addColorStop(0,'rgba(4,6,12,0)');g.addColorStop(1,'rgba(4,6,12,.88)');c.fillStyle=g;c.fillRect(0,H*.5,W,H*.5);
  g=c.createRadialGradient(W/2,H*.45,Math.min(W,H)*.3,W/2,H*.45,Math.max(W,H)*.8);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=g;c.fillRect(0,0,W,H)}

/* ---------- career creation wizard ---------- */
const ARCH=[['Tactician','Starts with Scouting Reports'],['Mentor','Starts with Fundamentals'],['Captain','Starts with Team Talk']];
const HSTY=['Spiky','Bowl cut','Side sweep','Long','Ponytail','Short crop'];
function vCreate(){const c=G.cr;let b;
  const sw=(arr,cur,fn,lab,cls='')=>`<div class="swgrid ${cls}">${arr.map((h,i)=>`<button class="sw ${cur===i||cur===h?'on':''}" style="background:${h}" aria-label="${lab} ${i+1}" onclick="${fn(h,i)}"></button>`).join('')}</div>`;
  if(c.step===0)b=`<div class="cols">${card('Your coach','',`<label class="fld" for="cn">Name</label><input id="cn" class="inp" maxlength="18" value="${esc(c.name)}" oninput="G.cr.name=this.value" placeholder="Coach name" autocomplete="off">
      <div class="fld">Coaching style</div><div class="grid3">${ARCH.map((a,i)=>`<button class="opt ${c.arch===i?'on':''}" onclick="A.cr('arch',${i})"><b>${a[0]}</b>${a[1]}</button>`).join('')}</div>`)}
    ${card('Appearance','',`<div class="row" style="align-items:flex-start;gap:14px"><canvas class="ptl" data-coach="1" width="264" height="264" style="width:108px;height:108px"></canvas><div style="flex:1;min-width:0"><div class="fld">Hairstyle</div><div class="grid3">${HSTY.map((n,i)=>`<button class="opt ${c.look.style===i?'on':''}" style="padding:6px;text-align:center;min-height:44px;font-size:12.500px;color:var(--text)" onclick="A.look('style',${i})">${n}</button>`).join('')}</div></div></div>
      <div class="fld">Hair colour</div>${sw(HAIR,c.look.hair,(h,i)=>`A.look('hair',${i})`,'Hair colour','c5')}
      <div class="fld">Skin tone</div>${sw(SKIN,c.look.skin,(h,i)=>`A.look('skin',${i})`,'Skin tone','c5')}<div class="fld">Eye colour</div>${sw(EYE,c.look.eye,(h,i)=>`A.look('eye',${i})`,'Eye colour')}`)}</div>`;
  else if(c.step===1)b=`<div class="cols">${card('Your club','',`<div class="grid2"><div><label class="fld" for="cc">City</label><input id="cc" class="inp" maxlength="14" value="${esc(c.city)}" oninput="G.cr.city=this.value;A.prev()" placeholder="City" autocomplete="off"></div><div><label class="fld" for="ct">Team name</label><input id="ct" class="inp" maxlength="14" value="${esc(c.team)}" oninput="G.cr.team=this.value;A.prev()" placeholder="Nickname" autocomplete="off"></div></div>
      <div class="fld">Main colour</div>${sw(PALETTE,c.c1,h=>`A.cr('c1','${h}')`,'Main colour')}
      <div class="fld">Trim colour</div>${sw(PALETTE,c.c2,h=>`A.cr('c2','${h}')`,'Trim colour')}`)}
    ${card('Crest','',`<div class="row" style="gap:14px;margin-bottom:14px;padding:12px;border-radius:10px;background:var(--surface-2);border:1px solid var(--line)">${logoSVG(c,72)}<div class="who"><div id="pvn" class="disp" style="font-size:24px;overflow-wrap:anywhere">${esc((c.city||'City')+' '+(c.team||'Team'))}</div><div class="mut" style="margin-top:4px">${EMB[c.logo].n} crest</div><div style="display:flex;height:6px;border-radius:3px;overflow:hidden;margin-top:8px;max-width:160px;box-shadow:0 0 0 1px var(--line-strong)"><i style="flex:2;background:${c.c1}"></i><i style="flex:1;background:${c.c2}"></i></div></div></div>
      <div class="swgrid c5">${EMB.map((e,i)=>`<button class="lg ${c.logo===i?'on':''}" aria-label="${e.n} crest" onclick="A.cr('logo',${i})">${logoSVG({c1:c.c1,c2:c.c2,logo:i},40)}</button>`).join('')}</div>`)}</div>`;
  else b=`<div class="vh"><h1>Where does your story start?</h1></div><div class="cols">
    <button class="opt ${c.lg==='u18'?'on':''}" style="padding:14px" onclick="A.cr('lg','u18')"><span class="chip gr" style="margin-bottom:8px">Recommended</span><b style="font-size:21px">U18 Rising League</b>The open division. Your squad is a fair match for the field, the board is patient, and the top two clubs earn promotion. A good place to learn the ropes.</button>
    <button class="opt ${c.lg==='prem'?'on':''}" style="padding:14px" onclick="A.cr('lg','prem')"><span class="chip r" style="margin-bottom:8px">Hard</span><b style="font-size:21px">U18 Premier Crown</b>The best of the best. Every opponent is stacked and your new club starts as the underdog. The bottom two are relegated. More sponsor money, far less mercy.</button></div>
    <p class="mut" style="margin-top:12px">Both leagues play 14 rounds with the Starfall Cup knockout in the middle of the season. Games last seven innings.</p>`;
  return `<div class="page wiz"><div class="page-h"><h1>New career</h1><div class="steps">${['Coach','Club','League'].map((s,i)=>`<span class="${i===c.step?'on':i<c.step?'done':''}"><i>${i<c.step?ic('check',12):i+1}</i><em>${s}</em></span>`).join('')}</div></div>
    <div class="main"><div class="wrap">${b}</div></div>
    <div class="page-f"><button class="btn ghost" onclick="A.step(-1)">${c.step?'Back':'Cancel'}</button><div class="sp"></div><button class="btn" onclick="A.step(1)">${c.step===2?'Start career':'Next'}</button></div></div>`}

/* ---------- shared bits ---------- */
const NAV=[['home','Home',1],['roster','Squad',1],['lineup','Lineup',1],['tactics','Tactics',1],['train','Training',0],['staff','Staff',0],['coach','Coach',0],['sched','Schedule',0],['league','League',0],['board','Board',0]];
const STY=id=>OSTYLE[id]||DSTYLE[id]||PSTYLE[id]||{n:id,s:'?',d:''};
const fat=p=>{const v=Math.round(p.fatigue);return `<div class="fat" role="img" aria-label="Fatigue ${v}" title="Fatigue ${v}"><div class="bar"><i style="width:${v}%;background:${v>=70?'var(--bad)':v>=40?'var(--warn)':'var(--text-mute)'}"></i></div></div>`};
const rtf=p=>{const v=Math.round(p.fatigue);return `<span class="rtf">${rt(ovr(p))}<span class="bar" role="img" aria-label="Fatigue ${v}" title="Fatigue ${v}"><i style="width:${v}%;background:${v>=70?'var(--bad)':v>=40?'var(--warn)':'var(--text-dim)'}"></i></span></span>`};
const zchip=p=>{const a=abil(p);return `<span class="chip ${a.k==='P'?'b':a.k==='O'?'o':'gr'}">${a.n}</span>`};
// play-style tags for a player; highlighted when the style fits team t's current team style (default: the user's club)
function styleFits(p,t){t=t||UT();const o=teamFit(t,'off').fit,d=teamFit(t,'def').fit;return pStyles(p).map(s=>({...s,fit:(s.k==='O'?o:d).includes(s.id)}))}
const styleTags=(p,t)=>`<span class="tags">${styleFits(p,t).map(s=>`<span class="tag t${s.k} ${s.fit?'fit':''}" title="${esc(s.n)}${s.fit?' (fits team style)':''}">${s.s}</span>`).join('')}</span>`;
// players counted for a side's synergy: off = the nine in the order; def = eight fielders + every pitcher
function fitPool(t,sd){const by=id=>t.roster.find(p=>p.id===id),lu=(t.lineup||[]).map(l=>({p:by(l.pid),pos:l.pos})).filter(l=>l.p);
  return sd==='off'?lu.map(l=>({p:l.p,sid:l.p.os,pos:l.pos})):lu.filter(l=>l.pos!=='DH').map(l=>({p:l.p,sid:l.p.ds,pos:l.pos})).concat(t.roster.filter(isP).map(p=>({p,sid:p.ps,pos:p.role})))}
const synNeed=()=>typeof SYN_NEED!=='undefined'?SYN_NEED:[3,5,7];
const tiers=l=>`<span class="tiers" role="img" aria-label="Synergy tier ${l} of 3">${[1,2,3].map(i=>`<i class="${l>=i?'on':''}"></i>`).join('')}</span>`;
function synStrip(){const t=UT();return `<div class="syn">${['off','def'].map(sd=>{const f=teamFit(t,sd);return `<button onclick="A.go('tactics')" aria-label="${sd==='off'?'Offensive':'Defensive'} team style"><span class="lbl">${sd==='off'?'Offence':'Defence'}</span><div class="v">${esc(f.n)}</div><div class="m">${f.id==='balanced'?'No style set':`${tiers(f.lvl)}<span>${f.count}/${f.total} fit</span>`}</div></button>`}).join('')}</div>`}
function missionsHTML(){return G.s.missions.map(ms=>{const pr=missionProg(ms);return `<div class="ms"><span class="chip ${pr.ok?'gr':'r'}">${pr.ok?'On track':'Behind'}</span><div><div class="t">${ms.text}</div><div class="mut">${pr.txt} · Reward ${money(ms.m)}</div></div></div>`}).join('')}
const confBar=v=>`<div class="bar lg ${v<30?'f':'a'}"><i style="width:${v}%"></i></div>`;
const clubCell=(t,w)=>`<div class="club ${w?'w':''}">${logoSVG(t,22)}<span>${tname(t)}</span></div>`;

/* ---------- hub shell ---------- */
function vHub(){const S=G.s,t=UT();if(!VIEWS[G.view])G.view='home';const sp=S.coach.sp,cur=NAV.find(n=>n[0]===G.view),dot='<i class="dot" aria-label="Skill points available"></i>';
  return `<div class="shell"><header class="hd">${logoSVG(t,38)}<div class="hd-club"><div class="hd-name" style="${(t.city+t.nick).length>20?'font-size:16px':(t.city+t.nick).length>15?'font-size:18px':''}">${tname(t)}</div><div class="hd-sub">Season ${S.season} · Day ${Math.min(S.day+1,NDAYS)} of ${NDAYS}<span class="w480"> · ${LG[userLg()].n}</span></div></div><div class="hd-kv"><b>${t.w}–${t.l}</b><span>Record</span></div><div class="hd-kv"><b>${money(S.money)}</b><span>Funds</span></div></header>
  <nav class="nav" aria-label="Sections"><div class="nav-brand">Starfall <em>Nine</em></div>${NAV.map(n=>`<button class="${n[2]?'pri':'nsec'} ${G.view===n[0]?'on':''}" ${G.view===n[0]?'aria-current="page"':''} onclick="A.go('${n[0]}')">${ic(n[0],22)}<span>${n[1]}</span>${n[0]==='coach'&&sp?dot:''}</button>`).join('')}<button class="more ${cur[2]?'':'on'}" onclick="A.more()">${ic('more',22)}<span>${cur[2]?'More':cur[1]}</span>${sp?dot:''}</button></nav>
  <main class="main"><div class="wrap">${VIEWS[G.view]()}</div></main></div>`}
function moreSheet(){const sp=G.s.coach.sp;return sheet('More',`<div class="moregrid">${NAV.filter(n=>!n[2]).map(n=>`<button class="${G.view===n[0]?'on':''}" onclick="A.go('${n[0]}')">${ic(n[0],26)}<span>${n[1]}</span>${n[0]==='coach'&&sp?'<i class="dot"></i>':''}</button>`).join('')}</div>`,'',true)}

const VIEWS={
home(){const S=G.s,ug=userGame(),t=UT();let g;
  if(S.day>=NDAYS)g=`<section class="card"><div class="card-h"><h2>Season complete</h2></div><div class="card-b"><p>The final out is in the books.</p><button class="btn block" onclick="A.endSeason()">See the season review</button></div></section>`;
  else if(ug){const h=S.teams[ug.home],a=S.teams[ug.away],opp=ug.home==='user'?a:h,sp=t.roster.find(p=>p.id===t.starterPick)||pickStarter(t),osp=pickStarter(opp);
    const side=x=>`<button class="mu-t" onclick="A.team('${x.id}')" aria-label="${tname(x)} team sheet">${logoSVG(x,60)}<span class="nm">${tname(x)}</span><span class="rc">${x.w}–${x.l} · OVR ${teamOvr(x).toFixed(0)}</span></button>`;
    const arm=(x,p)=>`<div><div class="lbl">${x.id==='user'?'Your starter':'Their starter'}</div><div class="v">${esc(p.name)}</div><div class="s">OVR ${ovr(p).toFixed(0)} · ${esc(STY(p.ps).n)}</div></div>`;
    const os=opp.style||{};
    g=`<section class="card"><div class="card-h"><h2>Today’s game</h2><small>${ug.k==='L'?`League round ${ug.r+1} of 14`:'Starfall Cup '+['quarterfinal','semifinal','final'][ug.r]}</small></div>
    <div class="mu">${side(a)}<div class="mu-v">at</div>${side(h)}</div>
    <div class="mu-x">${arm(a,a===t?sp:osp)}${arm(h,h===t?sp:osp)}</div>
    ${TOFF[os.off]&&TDEF[os.def]?`<div class="note">Scouting report: the ${esc(opp.nick)} play <b style="color:var(--text)">${esc(TOFF[os.off].n)}</b> on offence and <b style="color:var(--text)">${esc(TDEF[os.def].n)}</b> on defence.</div>`:''}
    <div class="acts"><button class="btn" onclick="A.play(1)">${ic('play',16)}Watch the game</button><button class="btn alt" onclick="A.play(0)">${ic('ff',16)}Quick sim</button><button class="btn ghost" onclick="A.go('lineup')">Edit lineup</button></div></section>`}
  else g=`<section class="card"><div class="card-h"><h2>No game today</h2></div><div class="card-b"><p>Your club is out of the Starfall Cup. The squad trains while the rest of the bracket plays.</p><button class="btn block" onclick="A.play(0)">Advance the day</button></div></section>`;
  return `<div class="cols w"><div>${g}${synStrip()}<section class="card"><div class="card-h"><h2>Clubhouse news</h2></div><div class="card-b flush">${S.news.slice(0,6).map(n=>`<div class="news">${esc(n)}</div>`).join('')||'<div class="empty">Nothing yet.</div>'}</div></section></div>
  <div><section class="card"><div class="card-h"><h2>Board missions</h2><small>Confidence ${Math.round(S.board.conf)}</small></div><div class="card-b" style="padding-bottom:10px">${confBar(S.board.conf)}</div><div>${missionsHTML()}</div></section>
  <section class="card"><div class="card-h"><h2>Training plan</h2><button class="btn ghost sm" onclick="A.go('train')">Change</button></div><div class="card-b"><b>${FOCUS[S.train.focus][0]}</b> · ${['Light','Normal','Hard'][S.train.int]} intensity<div class="mut" style="margin-top:4px">${S.train.spot.length} spotlight player${S.train.spot.length===1?'':'s'}. Training runs every day before the game.</div></div></section></div></div>`},

roster(){const t=UT(),tab=G.rTab||'ovw',cap=k=>k[0].toUpperCase()+k.slice(1);
  const tbl=(list,P)=>{const ks=P?['vel','ctl','brk','sta']:['con','pow','eye','spd','fld','arm'];
    return `<table class="${tab==='rat'?'show-rat':tab==='sta'?'show-sta':''}"><tr><th>${P?'Pitcher':'Player'}</th><th class="n c-ovw">OVR</th><th class="n c-ovw">Pot</th><th class="c-ovw">Fatigue</th>${ks.map(k=>`<th class="n c-rat">${cap(k)}</th>`).join('')}${(P?['G','IP','K','ER','ERA']:['AB','H','HR','RBI','BB','AVG']).map(k=>`<th class="n c-sta">${k}</th>`).join('')}</tr>
    ${list.map(p=>{const s=p.s;return `<tr class="tap" onclick="A.card('${p.id}')"><td class="pl"><div class="plc">${pt(p)}<div class="who"><span class="nm">${esc(p.name)}</span><span class="sub"><b>${P?p.role:p.pos}</b><span>${p.age}y</span>${styleTags(p)}${p.badges.length?`<span class="goldc" title="${p.badges.length} badge${p.badges.length>1?'s':''}">★${p.badges.length}</span>`:''}</span></div></div></td>
      <td class="n c-ovw">${rt(ovr(p))}</td><td class="n c-ovw">${potB(p)}</td><td class="c-ovw">${fat(p)}</td>
      ${ks.map(k=>`<td class="n c-rat ${tier(p.r[k])}">${p.r[k].toFixed(0)}</td>`).join('')}
      ${(P?[s.g,ipf(s.po),s.pk,s.per,era(s)]:[s.ab,s.h,s.hr,s.rbi,s.bb,avg(s)]).map(v=>`<td class="n c-sta">${v}</td>`).join('')}</tr>`}).join('')}</table>`};
  const bats=t.roster.filter(p=>!isP(p)).sort((a,b)=>ovr(b)-ovr(a)),pit=t.roster.filter(isP).sort((a,b)=>ovr(b)-ovr(a));
  return `<div class="vh"><h1>Squad</h1><span class="mut">${t.roster.length} players · rated ${teamOvr(t).toFixed(1)}</span></div>
  <div class="seg rseg" role="tablist">${[['ovw','Overview'],['rat','Ratings'],['sta','Season stats']].map(x=>`<button class="${tab===x[0]?'on':''}" onclick="A.rTab('${x[0]}')">${x[1]}</button>`).join('')}</div>
  <section class="card"><div class="card-h"><h2>Position players</h2><small>${bats.length}</small></div>${tbl(bats,false)}</section>
  <section class="card"><div class="card-h"><h2>Pitchers</h2><small>${pit.length}</small></div>${tbl(pit,true)}</section>
  <p class="mut" style="margin:0 2px">Green style tags fit your current team styles. Tap a player for the full card.</p>`},

lineup(){const t=UT();if(!validLineup(t))autoLineup(t);const by=id=>t.roster.find(p=>p.id===id),inl=new Set(t.lineup.map(l=>l.pid));
  const sp=by(t.starterPick)||pickStarter(t),bench=t.roster.filter(p=>!isP(p)&&!inl.has(p.id));
  return `<div class="vh"><h1>Lineup</h1><span class="mut">Tap two players to swap</span></div>${synStrip()}
  <div class="cols w"><section class="card"><div class="card-h"><h2>Batting order</h2><button class="btn ghost sm" onclick="A.auto()">Auto-pick</button></div><div class="list">${t.lineup.map((l,i)=>{const p=by(l.pid);return `<div class="li tap ${G.sel===i?'sel':''}" role="button" tabindex="0" onclick="A.slot(${i})"><span class="ord">${i+1}</span><select class="ps" aria-label="Position for slot ${i+1}" onclick="event.stopPropagation()" onchange="A.pos(${i},this.value)">${POS.concat('DH').map(x=>`<option ${x===l.pos?'selected':''}>${x}</option>`).join('')}</select><div class="who"><span class="nm">${esc(p.name)}</span><span class="sub">${styleTags(p)}${l.pos!=='DH'&&p.pos!==l.pos?`<span class="chip r">plays ${p.pos}</span>`:''}</span></div>${rtf(p)}</div>`}).join('')}</div>
    <div class="note">${G.sel!==null?'Now tap another batter or a bench player to swap.':'Green tags fit your team style. The bar under each rating is fatigue. Players out of position field worse.'}</div></section>
  <div><section class="card"><div class="card-h"><h2>Bench</h2><small>Tap to swap in</small></div><div class="list">${bench.map(p=>`<div class="li tap ${G.sel==='b'+p.id?'sel':''}" role="button" tabindex="0" onclick="A.bench('${p.id}')"><span class="pp">${p.pos}</span><div class="who"><span class="nm">${esc(p.name)}</span><span class="sub">${styleTags(p)}</span></div>${rtf(p)}</div>`).join('')||'<div class="empty">Everyone is in the lineup.</div>'}</div></section>
  <section class="card"><div class="card-h"><h2>Today’s starter</h2><small>Tap to choose</small></div><div class="list">${t.roster.filter(isP).sort((a,b)=>ovr(b)-ovr(a)).map(p=>`<div class="li tap ${p===sp?'me':''}" role="button" tabindex="0" onclick="A.starter('${p.id}')"><span class="chk ${p===sp?'on':''}">${ic('check',14)}</span><span class="pp">${p.role}</span><div class="who"><span class="nm">${esc(p.name)}</span><span class="sub">${styleTags(p)}<span>${(p.pitches||[]).map(k=>PITCH[k]?PITCH[k].s:k).join(' · ')}</span></span></div>${rtf(p)}</div>`).join('')}</div><div class="note">Everyone not starting waits in the bullpen. Tired arms pitch worse.</div></section></div></div>`},

tactics(){const t=UT();if(!validLineup(t))autoLineup(t);const need=synNeed(),inl=new Set(t.lineup.map(l=>l.pid));
  const side=sd=>{const off=sd==='off',D=off?TOFF:TDEF,f=teamFit(t,sd),pool=fitPool(t,sd),bal=f.id==='balanced',isFit=e=>f.fit.includes(e.sid);
    const opts=Object.keys(D).map(id=>{const c=id==='balanced'?null:teamFit({...t,style:{off:id,def:id}},sd).count;return `<button class="opt ${f.id===id?'on':''}" aria-pressed="${f.id===id}" onclick="A.style('${sd}','${id}')"><b>${esc(D[id].n)}</b>${c===null?'':`<span class="cnt chip ${c>=need[0]?'gr':''}" title="${c} players fit">${c}</span>`}</button>`}).join('');
    const rem=f.lvl<3?Math.max(1,need[f.lvl]-f.count):0;
    const msg=bal?'No team instructions, so there is no style bonus. Pick a style to build around. The number on each option is how many of your players would fit it today.':f.lvl>=3?`Maximum synergy. The style is at full strength (×${f.mult.toFixed(2)}).`:`${rem} more fitting player${rem===1?'':'s'} ${off?'in the batting order':'in the field or on the pitching staff'} for Tier ${f.lvl+1}. Style strength is ×${f.mult.toFixed(2)} now.`;
    const sorted=pool.slice().sort((a,b)=>isFit(b)-isFit(a));
    const row=(e,dim)=>`<div class="li tap ${!bal&&!isFit(e)?'nofit':''}" role="button" tabindex="0" onclick="A.card('${e.p.id}')"><i class="fitdot ${isFit(e)?'':'off'}"></i><span class="pp">${e.pos}</span><div class="who"><span class="nm">${esc(e.p.name)}</span><span class="sub">${esc(STY(e.sid).n)}</span></div><span class="tag ${isFit(e)?'fit':''}">${STY(e.sid).s}</span>${rt(ovr(e.p))}</div>`;
    const bench=bal?[]:t.roster.filter(p=>!isP(p)&&!inl.has(p.id)).map(p=>({p,sid:off?p.os:p.ds,pos:p.pos})).filter(isFit);
    return `<section class="card"><div class="card-h"><h2>${off?'Offensive style':'Defensive style'}</h2><small>${bal?'Not set':`Tier ${f.lvl} of 3`}</small></div>
    <div class="card-b"><div class="styopts">${opts}</div>
      <p style="margin:12px 0 8px">${esc(f.d)}</p>
      ${f.fit.length?`<div class="row wrapr" style="gap:6px"><span class="lbl">Fits</span>${f.fit.map(id=>`<span class="chip"><b style="font-family:var(--font-disp);letter-spacing:.05em;color:var(--good)">${STY(id).s}</b>${esc(STY(id).n)}</span>`).join('')}</div>`:''}
      <div class="synbox"><div class="top"><div><span class="lbl">Synergy</span><div class="big">${bal?'–':f.count}<small> / ${f.total} fit</small></div></div><div style="text-align:right"><span class="lbl">${bal?'No tier':'Tier '+f.lvl+' of 3'}</span><div style="display:flex;justify-content:flex-end;margin-top:8px">${tiers(f.lvl)}</div></div></div>
        <div class="pips" aria-hidden="true">${pool.map((_,i)=>`<i class="${!bal&&i<f.count?'on':''} ${need.includes(i+1)&&i+1<pool.length?'th':''}"></i>`).join('')}</div>
        <div class="mut" style="margin-top:10px">${msg}</div></div></div>
    <div class="subh"><span>${off?'Batting order':'Fielders and pitching staff'}</span><span>${bal?'':f.count+' fit'}</span></div>
    <div class="list">${sorted.map(e=>row(e)).join('')}</div>
    ${bench.length?`<div class="subh"><span>Fits from the bench</span><button class="btn ghost sm" onclick="A.go('lineup')">Edit lineup</button></div><div class="list">${bench.map(e=>row(e)).join('')}</div>`:''}</section>`};
  return `<div class="vh"><h1>Team style</h1><span class="mut">Build the club around an identity</span></div><div class="cols">${side('off')}${side('def')}</div>
  <p class="mut" style="margin:0 2px">Offence counts the nine batters in your order. Defence counts your eight fielders and every pitcher. Reach ${need.join(', ')} fitting players for tiers 1, 2 and 3.</p>`},

train(){const S=G.s,t=UT(),max=sk('mentor')?4:3;
  return `<div class="vh"><h1>Training</h1><span class="mut">Runs every day before the game</span></div><div class="cols"><div>
  <section class="card"><div class="card-h"><h2>Daily focus</h2></div><div class="card-b"><div class="grid2">${Object.entries(FOCUS).map(([k,f])=>`<button class="opt ${S.train.focus===k?'on':''}" onclick="A.focus('${k}')"><b>${f[0]}</b>${f[1]}</button>`).join('')}</div></div></section>
  <section class="card"><div class="card-h"><h2>Intensity</h2></div><div class="card-b"><div class="seg" style="margin-bottom:8px">${['Light','Normal','Hard'].map((x,i)=>`<button class="${S.train.int===i?'on':''}" onclick="A.int(${i})">${x}</button>`).join('')}</div><div class="mut">${['60% gains, extra recovery.','Steady work.','150% gains, more fatigue.'][S.train.int]}</div></div></section></div>
  <section class="card"><div class="card-h"><h2>Spotlight players</h2><small>${S.train.spot.length} of ${max}</small></div><div class="note" style="border-top:0;border-bottom:1px solid var(--line)">Spotlight players train at double speed and can learn new badges.</div>
  <div class="list">${t.roster.slice().sort((a,b)=>(b.pot-ovr(b))-(a.pot-ovr(a))).map(p=>{const on=S.train.spot.includes(p.id);return `<div class="li tap ${on?'me':''}" role="button" tabindex="0" onclick="A.spot('${p.id}')"><span class="chk ${on?'on':''}">${ic('check',14)}</span><span class="pp">${isP(p)?p.role:p.pos}</span><div class="who"><span class="nm">${esc(p.name)}</span><span class="sub">Age ${p.age}${p.badges.length?` · <span class="goldc">${p.badges.length} badge${p.badges.length>1?'s':''}</span>`:''}</span></div>${rt(ovr(p))}<span style="width:44px;text-align:right;white-space:nowrap"><span class="lbl">Pot</span> ${potB(p)}</span></div>`}).join('')}</div></section></div>`},

staff(){const S=G.s;const eff=(r,s)=>`+${Math.round(s.stars*8*(sk('network')?1.25:1))}% ${r==='cond'?'Speed and Stamina gains, faster recovery':STAFFROLE[r][1].map(k=>k[0].toUpperCase()+k.slice(1)).join(', ')+' gains'}`;
  return `<div class="vh"><h1>Staff</h1><span class="mut">Payroll ${money(staffPay())} per day</span></div>
  <section class="card"><div class="card-h"><h2>Assistant coaches</h2></div><div class="list">${Object.entries(STAFFROLE).map(([r,d])=>{const s=S.staff[r];return `<div class="li" style="align-items:flex-start;padding-top:10px;padding-bottom:10px"><div class="who"><span class="lbl">${d[0]}</span>${s?`<span class="nm" style="margin-top:2px">${esc(s.name)} ${stars(s.stars)}</span><div class="mut" style="white-space:normal;margin-top:2px">${eff(r,s)}. ${money(s.pay)} per day</div>`:'<div class="mut" style="margin-top:2px">Nobody hired yet.</div>'}</div>${s?`<button class="btn danger sm" onclick="A.release('${r}')">Release</button>`:''}</div>`}).join('')}</div></section>
  <section class="card"><div class="card-h"><h2>Available this season</h2></div><div class="list">${S.pool.map(s=>`<div class="li"><div class="who"><span class="nm">${esc(s.name)} ${stars(s.stars)}</span><span class="sub">${STAFFROLE[s.role][0]} · ${money(s.pay)} / day</span></div><button class="btn sm ${S.staff[s.role]?'alt':''}" onclick="A.hire('${s.id}')">${S.staff[s.role]?'Replace':'Hire'}</button></div>`).join('')||'<div class="empty">Everyone has signed elsewhere.</div>'}</div></section>`},

coach(){const c=G.s.coach,need=100+c.lvl*60,flat=SKILLS.flatMap(b=>b[2]),sel=flat.find(n=>n[0]===G.nodeSel)||flat.find(n=>canLearn(n[0]))||flat[0],own=c.skills[sel[0]],can=canLearn(sel[0]);
  return `<div class="vh"><h1>Coach</h1><span class="mut">${c.sp} skill point${c.sp===1?'':'s'} to spend</span></div><div class="cols w">
  <section class="card"><div class="card-h"><h2>Skill tree</h2><small>${Object.keys(c.skills).length} of ${flat.length} learned</small></div><div class="card-b"><div class="tree">${SKILLS.map(b=>`<div class="branch"><div class="bh"><b>${b[0]}</b><span>${b[1]}</span></div>${b[2].map((n,i)=>{const o=c.skills[n[0]],k=canLearn(n[0]);return `${i?`<div class="ln ${o?'on':''}"></div>`:''}<button class="nd ${o?'own':k?'can':''} ${sel[0]===n[0]?'cur':''}" aria-label="${n[1]}${o?', learned':k?', available':', locked'}" onclick="A.node('${n[0]}')">${o?ic('check',14):k?'':ic('lock',13)}<span>${n[1]}</span></button>`}).join('')}</div>`).join('')}</div></div></section>
  <div><section class="card"><div class="card-h"><h2>${sel[1]}</h2><small>${own?'Learned':`${sel[3]} point${sel[3]>1?'s':''}`}</small></div><div class="card-b"><p>${sel[2]}.</p>${own?`<span class="chip g">${ic('check',12)}Learned</span>`:`<button class="btn block" ${can&&c.sp>=sel[3]?'':'disabled'} onclick="A.learn('${sel[0]}')">Learn for ${sel[3]} point${sel[3]>1?'s':''}</button>${can?(c.sp>=sel[3]?'':'<div class="mut" style="margin-top:8px">Not enough skill points yet. Level up to earn more.</div>'):'<div class="mut" style="margin-top:8px">Learn the skill above it first.</div>'}`}</div></section>
  <section class="card"><div class="card-h"><h2>Coach ${esc(c.name)}</h2><small>${ARCH[c.arch][0]}</small></div><div class="card-b"><div class="row" style="gap:14px"><canvas class="ptl" data-coach="1" width="144" height="144" style="width:64px;height:64px"></canvas><div style="flex:1;min-width:0"><div class="row" style="justify-content:space-between"><b class="disp" style="font-size:20px">Level ${c.lvl}</b><span class="mut n">${c.xp} / ${need} XP</span></div><div class="bar lg z" style="margin:8px 0"><i style="width:${c.xp/need*100}%"></i></div><div class="mut">Games, wins and missions earn XP.</div></div></div></div></section></div></div>`},

sched(){const S=G.s,lg=userLg(),rows=[];for(let d=0;d<NDAYS;d++){const inf=dayInfo(d);let txt,res='';
    if(inf.k==='L'){const pr=S.sched[lg][inf.r].find(p=>p.includes('user')),home=pr[0]==='user',o=S.teams[home?pr[1]:pr[0]];txt=`<div class="club"><i class="mut" style="font-style:normal;width:16px;flex:none">${home?'vs':'at'}</i>${logoSVG(o,22)}<span>${tname(o)}</span></div>`}
    else{const tie=S.cup&&S.cup.r[inf.r].find(t=>t.a==='user'||t.b==='user'),o=tie?S.teams[tie.a==='user'?tie.b:tie.a]:null;txt=o?`<div class="club"><i class="mut" style="font-style:normal;width:16px;flex:none">${tie.a==='user'?'vs':'at'}</i>${logoSVG(o,22)}<span>${tname(o)}</span></div>`:`<span class="mut">${S.cup&&S.cup.r[inf.r].length?'Your club is out':'To be decided'}</span>`}
    const r=(S.log||{})[d];if(r)res=`<span class="chip ${r[0]?'gr':'r'}">${r[0]?'W':'L'} ${r[1]}–${r[2]}</span>`;else if(d===S.day)res='<span class="chip g">Today</span>';
    rows.push(`<tr class="${d===S.day?'me':''}"><td class="n" style="width:34px"><span class="pos">${d+1}</span></td><td>${inf.k==='L'?`<span class="mut">R${inf.r+1}</span>`:`<span class="chip g">${['QF','SF','Final'][inf.r]}</span>`}</td><td class="pl">${txt}</td><td class="n">${res}</td></tr>`)}
  return `<div class="vh"><h1>Schedule</h1><span class="mut">Season ${S.season} · ${LG[lg].n}</span></div><section class="card"><table><tr><th class="n">Day</th><th>Round</th><th>Opponent</th><th class="n">Result</th></tr>${rows.join('')}</table></section>`},

league(){const S=G.s,tab=G.lgTab||userLg();let b;
  if(tab==='cup'){if(!S.cup)b=`<section class="card"><div class="empty">The Starfall Cup starts after league round 7. The bracket is seeded from the standings on that day.</div></section>`;
    else{const tm=(id,sc,t)=>`<div class="club ${t.w===id?'w':t.w?'l':''}">${logoSVG(S.teams[id],22)}<span>${tname(S.teams[id])}</span>${t.w?`<b>${sc}</b>`:''}</div>`;
      b=`<section class="card">${S.cup.champ?`<div class="hero"><span class="chip g">Champions</span><div class="big" style="margin-top:8px">${tname(S.teams[S.cup.champ])}</div></div>`:''}<div class="bracket">${['Quarterfinals','Semifinals','Final'].map((n,i)=>`<div class="rnd"><span class="lbl">${n}</span><div class="ties">${S.cup.r[i].map(t=>`<div class="tie">${tm(t.a,t.sa,t)}${tm(t.b,t.sb,t)}</div>`).join('')||`<div class="tie tbd">To be decided</div>`}</div></div>`).join('')}</div></section>`}}
  else if(tab==='lead'){const all=S.lg[userLg()].flatMap(id=>S.teams[id].roster.map(p=>({p,t:S.teams[id]})));const mab=Math.max(6,S.day*1.5),mip=Math.max(6,S.day*2);
    const top=(title,f,flt,fmt)=>`<section class="card"><div class="card-h"><h2>${title}</h2></div><div class="list">${all.filter(flt).sort((a,b)=>f(b.p)-f(a.p)).slice(0,5).map((x,i)=>`<div class="li tap ${x.t.id==='user'?'me':''}" role="button" tabindex="0" style="min-height:46px" onclick="A.card('${x.p.id}')"><span class="ord">${i+1}</span>${logoSVG(x.t,22)}<div class="who"><span class="nm">${esc(x.p.name)}</span></div><b class="num" style="font-size:19px">${fmt(x.p)}</b></div>`).join('')||'<div class="empty">No qualifiers yet.</div>'}</div></section>`;
    b=`<div class="cols" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">${top('Batting average',p=>p.s.h/p.s.ab,x=>x.p.s.ab>=mab,p=>avg(p.s))}${top('Home runs',p=>p.s.hr,x=>x.p.s.ab>0,p=>p.s.hr)}${top('Strikeouts',p=>p.s.pk,x=>x.p.s.po>=mip,p=>p.s.pk)}</div>`}
  else b=`<section class="card"><table><tr><th class="n">#</th><th>Club</th><th class="n">W</th><th class="n">L</th><th class="n c-wide">RS</th><th class="n c-wide">RA</th><th class="n">Diff</th><th class="n">Rtg</th></tr>${standings(tab).map((t,i)=>{const d=t.rs-t.ra;return `<tr class="tap ${t.id==='user'?'me':''} ${tab==='u18'&&i<2?'up':tab==='prem'&&i>5?'dn':''}" onclick="A.team('${t.id}')"><td class="n" style="width:34px"><span class="pos">${i+1}</span></td><td class="pl">${clubCell(t,t.id==='user')}</td><td class="n"><b>${t.w}</b></td><td class="n">${t.l}</td><td class="n c-wide">${t.rs}</td><td class="n c-wide">${t.ra}</td><td class="n ${d>0?'good':d<0?'bad':''}">${d>0?'+':d<0?'−':''}${Math.abs(d)}</td><td class="n">${teamOvr(t).toFixed(1)}</td></tr>`}).join('')}</table><div class="note">${tab==='u18'?'The top two clubs are promoted to the Premier Crown.':'The bottom two clubs are relegated to the Rising League.'} Tap a club for its team sheet.</div></section>`;
  return `<div class="vh"><h1>League</h1><span class="mut">Season ${S.season}</span></div><div class="seg" role="tablist">${[['u18','Rising'],['prem','Premier'],['cup','Cup'],['lead','Leaders']].map(x=>`<button class="${tab===x[0]?'on':''}" onclick="A.lgTab('${x[0]}')">${x[1]}</button>`).join('')}</div>${b}`},

board(){const S=G.s,prem=userLg()==='prem',inc=Math.round((prem?340:220)*(sk('charm')?1.25:1));
  return `<div class="vh"><h1>Board</h1><span class="mut">Career ${S.career.w}–${S.career.l}</span></div><div class="cols"><div><section class="card"><div class="card-h"><h2>Board confidence</h2><small>${Math.round(S.board.conf)} of 100</small></div><div class="card-b">${confBar(S.board.conf)}<p class="mut" style="margin:10px 0 0">Wins and completed missions raise confidence. If it is empty when the season ends, the board replaces you.</p></div><div>${missionsHTML()}</div></section></div>
  <div><section class="card"><div class="card-h"><h2>Money</h2></div><table class="kv"><tr><td>Balance</td><td><b class="num" style="font-size:18px">${money(S.money)}</b></td></tr><tr><td>Sponsors, per day</td><td class="good">${money(inc)}</td></tr><tr><td>Win bonus</td><td class="good">${money(120)}</td></tr><tr><td>Assistant coaches, per day</td><td class="${staffPay()?'bad':''}">${money(-staffPay())}</td></tr></table></section>
  <section class="card"><div class="card-h"><h2>Career</h2><small>${S.career.w}–${S.career.l}</small></div><div class="card-b flush">${S.hist.map(h=>`<div class="news">Season ${h.season}: ${ord(h.rank)} in ${LG[h.lg].s}, ${h.w}–${h.l}${h.cup?', Cup winners':''}</div>`).join('')||'<div class="empty">Your first season is under way.</div>'}</div><div class="card-f"><button class="btn ghost sm" onclick="A.quit()">Save and exit to title</button></div></section></div></div>`}
};
const canLearn=id=>{const c=G.s.coach;if(c.skills[id])return false;for(const b of SKILLS){const i=b[2].findIndex(n=>n[0]===id);if(i>=0)return i===0||!!c.skills[b[2][i-1][0]]}return false};

/* ---------- player card (sheet) ---------- */
function cardHTML(pid){const f=findP(pid);if(!f)return'';const p=f.p,t=f.t,P=isP(p),ks=P?[['vel','Velocity'],['ctl','Control'],['brk','Break'],['sta','Stamina']]:[['con','Contact'],['pow','Power'],['eye','Eye'],['spd','Speed'],['fld','Fielding'],['arm','Arm']],a=abil(p),s=p.s,sf=styleFits(p,t);
  const tl=(v,l)=>`<div class="tile"><b>${v}</b><span>${l}</span></div>`,mine=t.id==='user';
  const body=`<div class="pc-top"><canvas class="ptl" data-pid="${p.id}" width="192" height="192" style="width:84px;height:84px"></canvas>
    <div class="pc-id"><div class="nm">${esc(p.name)}</div><div class="sub">${P?(p.role==='SP'?'Starting pitcher':'Relief pitcher'):p.pos} · Age ${p.age}</div><div class="row" style="margin-top:6px;gap:6px">${logoSVG(t,18)}<span class="mut" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${tname(t)}</span></div></div>
    <div class="pc-ovr">${rt(ovr(p),'big')}<span class="lbl">Overall</span></div></div>
  <div class="tiles">${tl(potB(p),'Potential')}${tl(p.spirit,'Spirit')}${tl(Math.round(p.fatigue),'Fatigue')}${tl(p.badges.length,'Badges')}</div>
  <div class="pc-cols"><div>
    <div class="sec"><span class="lbl">Ratings</span>${ks.map(k=>{const v=p.r[k[0]];return `<div class="stat"><span>${k[1]}</span><div class="bar"><i style="width:${v}%;background:${v>=75?'var(--gold-2)':v>=65?'var(--good)':v>=55?'var(--info)':v>=45?'#9aa7b8':'#5d6878'}"></i></div><span class="n">${v.toFixed(0)}</span></div>`}).join('')}</div>
    <div class="sec"><span class="lbl">This season</span><div class="tiles" style="margin-top:0">${P?tl(s.g,'Games')+tl(ipf(s.po),'IP')+tl(era(s),'ERA')+tl(s.pk,'K'):tl(avg(s),'AVG')+tl(s.hr,'HR')+tl(s.rbi,'RBI')+tl(s.bb,'BB')}</div></div>
  </div><div>
    <div class="sec"><span class="lbl">Play style</span>${sf.map(x=>`<div class="sty"><span class="tag lg ${x.fit?'fit':''}">${x.s}</span><div><b>${esc(x.n)}${x.fit?` <span class="good" style="font-weight:500;font-size:12px">· fits ${mine?'your':'their'} ${x.k==='O'?'offence':'defence'}</span>`:''}</b><p>${esc(x.d)}</p></div></div>`).join('')}</div>
    ${P&&p.pitches&&p.pitches.length?`<div class="sec"><span class="lbl">Repertoire</span><div class="row wrapr" style="gap:6px">${p.pitches.map((k,i)=>{const d=PITCH[k]||{n:k,c:'#fff'};return `<span class="pitch"><i style="background:${d.c}"></i>${esc(d.n)}${i?'':' <span class="mut" style="font-size:11px">primary</span>'}</span>`}).join('')}</div></div>`:''}
    <div class="sec"><span class="lbl">Zone ability</span><div class="zone" style="--zc:${ZK[a.k].c}"><div class="k">${ZK[a.k].n}</div><div class="t">${a.n}</div><p>${a.d}</p></div></div>
    <div class="sec"><span class="lbl">Badges</span>${p.badges.map(b=>`<div class="sty"><span class="chip g">${BADGES[b].n}</span><p style="margin:2px 0 0;font-size:12.500px;color:var(--text-dim)">${BADGES[b].d}</p></div>`).join('')||'<div class="mut">None yet. Spotlight training can teach one.</div>'}</div>
  </div></div>`;
  return sheet('Player card',body)}

/* ---------- team sheet (scouting) ---------- */
function teamHTML(id){const S=G.s,t=S.teams[id];if(!t)return'';if(id!=='user'&&!validLineup(t))autoLineup(t);const by=q=>t.roster.find(p=>p.id===q),st=t.style||{},lu=(t.lineup||[]).map(l=>({p:by(l.pid),pos:l.pos})).filter(l=>l.p);
  const tl=(v,l)=>`<div class="tile"><b>${v}</b><span>${l}</span></div>`,inLg=S.lg.u18.includes(id)?'u18':'prem',rank=standings(inLg).indexOf(t)+1;
  const li=(p,pos)=>`<div class="li tap" role="button" tabindex="0" onclick="A.card('${p.id}')"><span class="pp">${pos}</span><div class="who"><span class="nm">${esc(p.name)}</span><span class="sub">${styleTags(p,t)}${isP(p)?`<span>${(p.pitches||[]).map(k=>PITCH[k]?PITCH[k].s:k).join(' · ')}</span>`:''}</span></div>${rt(ovr(p))}</div>`;
  const body=`<div style="padding:14px 16px"><div class="pc-top">${logoSVG(t,64)}<div class="pc-id"><div class="nm">${tname(t)}</div><div class="sub">${LG[inLg].n}</div></div></div>
    <div class="tiles">${tl(t.w+'–'+t.l,'Record')}${tl(ord(rank),'Position')}${tl(teamOvr(t).toFixed(1),'Rating')}${tl((t.rs-t.ra>0?'+':'')+(t.rs-t.ra),'Run diff')}</div>
    ${TOFF[st.off]&&TDEF[st.def]?`<div class="sec">${['off','def'].map(sd=>{const f=teamFit(t,sd);return `<div class="sty"><span class="lbl" style="width:58px;flex:none;margin-top:3px">${sd==='off'?'Offence':'Defence'}</span><div><b>${esc(f.n)}${f.id==='balanced'?'':` <span class="mut" style="font-weight:400">· tier ${f.lvl}, ${f.count}/${f.total} fit</span>`}</b><p>${esc(f.d)}</p></div></div>`}).join('')}</div>`:''}</div>
    <div class="subh"><span>Batting order</span></div><div class="list">${lu.map(l=>li(l.p,l.pos)).join('')}</div>
    <div class="subh"><span>Pitching staff</span></div><div class="list">${t.roster.filter(isP).sort((a,b)=>ovr(b)-ovr(a)).map(p=>li(p,p.role)).join('')}</div>`;
  return sheet(id==='user'?'Your club':'Scouting report',body,'',true)}

/* ---------- day result ---------- */
function vResult(){const r=G.res,S=G.s,m=r.m;let top='';
  if(m){const [a,h]=m.S,n=Math.max(m.line[0].length,m.line[1].length),bx=id=>m.box[id]||{},hits=s=>s.lineup.reduce((x,l)=>x+(bx(l.p.id).h||0),0),us=a.user?0:1;
    const best=s=>{const sc=l=>{const b=bx(l.p.id);return (b.h||0)+(b.hr||0)*2+(b.rbi||0)},l=s.lineup.slice().sort((x,y)=>sc(y)-sc(x))[0],b=bx(l.p.id);return `<b>${esc(l.p.name)}</b><div class="mut">${b.h}-for-${b.ab}${b.hr?', '+b.hr+' HR':''}${b.rbi?', '+b.rbi+' RBI':''}</div>`};
    const bt=G.boxTab===0||G.boxTab===1?G.boxTab:us,bs=m.S[bt];
    const side=(s,i)=>`<div class="side">${logoSVG(s.team,44)}<div class="nm">${esc(s.team.short||s.team.nick)}</div><small>${i?'Home':'Away'}</small></div>`;
    top=`<section class="card"><div class="verdict ${r.won?'w':'l'}">${r.won?'Victory':'Defeat'}</div>
    <div class="final">${side(a,0)}<div class="sc"><span class="${m.score[0]<m.score[1]?'lose':''}">${m.score[0]}</span><i>FINAL</i><span class="${m.score[1]<m.score[0]?'lose':''}">${m.score[1]}</span></div>${side(h,1)}</div>
    <div class="tscroll" style="border-top:1px solid var(--line)"><table class="ls"><tr><th>${r.ug.k==='C'?'Starfall Cup':'Round '+(r.ug.r+1)}</th>${Array.from({length:n},(_,i)=>`<th>${i+1}</th>`).join('')}<th>R</th><th>H</th></tr>${[a,h].map((s,i)=>`<tr><td class="pl"><div class="club">${logoSVG(s.team,20)}<span>${esc(s.team.nick)}</span></div></td>${Array.from({length:n},(_,j)=>`<td>${m.line[i][j]===undefined?'x':m.line[i][j]}</td>`).join('')}<td class="tot">${m.score[i]}</td><td class="tot">${hits(s)}</td></tr>`).join('')}</table></div>
    <div class="perf">${[a,h].map(s=>`<div><span class="lbl">${esc(s.team.nick)} top bat</span><div style="margin-top:3px">${best(s)}</div></div>`).join('')}</div>
    ${m.moments&&m.moments.length?`<div class="card-b" style="border-top:1px solid var(--line)"><span class="lbl">Zone moments</span><div class="row wrapr" style="gap:6px;margin-top:8px">${m.moments.slice(0,10).map(x=>{const f=findP(x.pid);return f?`<span class="chip wrapc ${m.S[x.side].user?'g':''}">${esc(sn(f.p))} ${esc(x.txt)}</span>`:''}).join('')}</div></div>`:''}</section>
    <section class="card"><div class="card-h"><h2>Box score</h2></div><div class="card-b" style="padding-bottom:0"><div class="seg">${[a,h].map((s,i)=>`<button class="${bt===i?'on':''}" onclick="A.boxTab(${i})">${esc(s.team.nick)}</button>`).join('')}</div></div>
    <table class="box"><tr><th>Batting</th><th class="n">AB</th><th class="n">R</th><th class="n">H</th><th class="n">HR</th><th class="n">RBI</th><th class="n">BB</th><th class="n">K</th></tr>${bs.lineup.map(l=>{const b=bx(l.p.id);return `<tr class="tap" onclick="A.card('${l.p.id}')"><td class="pl"><div class="club"><i class="mut" style="font-style:normal;width:22px;flex:none">${l.pos}</i><span>${esc(sn(l.p))}</span></div></td>${['ab','r','h','hr','rbi','bb','k'].map(k=>`<td class="n ${b[k]&&(k==='h'||k==='hr'||k==='rbi')?'':'r0'}">${b[k]||0}</td>`).join('')}</tr>`}).join('')}</table>
    <table class="box"><tr><th style="top:auto;position:static">Pitching</th>${['IP','H','R','BB','K','NP'].map(k=>`<th class="n" style="position:static">${k}</th>`).join('')}</tr>${bs.pitUsed.map(p=>{const b=bx(p.id);return `<tr class="tap" onclick="A.card('${p.id}')"><td class="pl"><div class="club"><span>${esc(sn(p))}</span></div></td><td class="n">${ipf(b.po||0)}</td>${['ph','per','pbb','pk','np'].map(k=>`<td class="n">${b[k]||0}</td>`).join('')}</tr>`}).join('')}</table></section>`}
  else top=`<section class="card"><div class="hero" style="border-bottom:0"><span class="lbl">No game today</span><div class="big" style="margin-top:6px">Training day</div><p class="mut" style="margin:8px 0 0">The squad put in the work while the bracket played on.</p></div></section>`;
  return `<div class="page"><div class="page-h">${logoSVG(UT(),36)}<h1>Day ${S.day} report<small>Season ${S.season} · ${UT().w}–${UT().l}</small></h1></div><div class="main"><div class="wrap"><div class="cols w"><div>${top}</div><div>
  <section class="card"><div class="card-h"><h2>Day report</h2></div><table class="kv"><tr><td>Sponsors</td><td class="good">${money(r.inc)}</td></tr><tr><td>Assistant coaches</td><td class="${r.pay?'bad':''}">${money(-r.pay)}</td></tr><tr><td><b>Balance change</b></td><td><b class="num" style="font-size:18px">${money(r.dm)}</b></td></tr><tr><td>Coach XP</td><td>+${r.xp}</td></tr></table>${r.notes.length?`<div class="card-f">${r.notes.map(n=>`<span class="chip g wrapc">${n}</span>`).join('')}</div>`:''}</section>
  <section class="card"><div class="card-h"><h2>Training gains</h2></div><div class="card-b flush">${(r.rep||[]).map(x=>`<div class="li" style="min-height:44px"><div class="who"><span class="nm">${esc(x.name)}</span></div>${x.badge?`<span class="chip g">${x.badge}</span>`:`<span class="good num" style="font-size:17px">+${x.d.toFixed(2)}</span><span class="mut">OVR</span>`}</div>`).join('')||'<div class="empty">A rest day. Legs are fresher.</div>'}</div></section></div></div></div></div>
  <div class="page-f"><div class="sp"></div><button class="btn" onclick="A.next()">${r.seasonEnd?'See the season review':'Continue'}</button></div></div>`}

/* ---------- season review ---------- */
function vSeason(){const se=G.se,S=G.s,me=UT(),mv=se.up.includes('user')?'up':se.down.includes('user')?'down':'';
  return `<div class="page"><div class="page-h">${logoSVG(me,36)}<h1>Season ${S.season} review<small>${LG[se.lg].n}</small></h1></div><div class="main"><div class="wrap"><div class="cols">
  <section class="card"><div class="hero"><span class="lbl">Final position</span><div class="big ${se.title?'goldc':''}" style="margin-top:6px">${se.title?'League champions!':'You finished '+ord(se.rank)}</div><div class="mut" style="margin-top:6px">${me.w}–${me.l}${S.cup&&S.cup.champ==='user'?' · Starfall Cup winners':''}</div></div>
  <table><tr><th class="n">#</th><th>Club</th><th class="n">W–L</th><th></th></tr>${se.st.map((x,i)=>`<tr class="${x.id==='user'?'me':''}"><td class="n" style="width:34px"><span class="pos">${i+1}</span></td><td class="pl">${clubCell(S.teams[x.id],x.id==='user')}</td><td class="n">${x.w}–${x.l}</td><td class="n">${se.up.includes(x.id)?'<span class="chip gr">Promoted</span>':se.down.includes(x.id)?'<span class="chip r">Relegated</span>':''}</td></tr>`).join('')}</table></section>
  <div><section class="card"><div class="card-h"><h2>Board verdict</h2><small>Confidence ${Math.round(se.conf)}</small></div><div class="card-b" style="padding-bottom:10px">${confBar(se.conf)}</div><div>${se.ms.map(x=>`<div class="ms"><span class="chip ${x.ok?'gr':'r'}">${x.ok?'Done':'Missed'}</span><div><div class="t">${x.text}</div>${x.ok?`<div class="mut">Paid ${money(x.m)}</div>`:''}</div></div>`).join('')}</div>
  <div class="note">${se.fired?'<b style="color:var(--bad)">The board has run out of patience and is replacing you.</b> Your career with this club is over.':`${mv==='up'?'<b class="good">Your club is going up to the Premier Crown!</b>':mv==='down'?'<b class="bad">Your club drops to the Rising League.</b>':'Your club stays in the same league.'} Eighteen-year-olds graduate now, so tryouts come next.`}</div></section></div></div></div></div>
  <div class="page-f"><div class="sp"></div><button class="btn" onclick="${se.fired?'A.fired()':'A.off()'}">${se.fired?'Start a new career':'Hold tryouts'}</button></div></div>`}

/* ---------- tryouts ---------- */
function vTryouts(){const st=tryoutState(),t=UT(),flt=G.tryF||'all',fo=teamFit(t,'off'),fd=teamFit(t,'def');
  const anyFit=p=>styleFits(p,t).some(s=>s.fit),pool=G.try.pool.filter(p=>flt==='all'||(flt==='p'?isP(p):flt==='b'?!isP(p):anyFit(p)));
  const tile=(v,max,l,ok)=>`<div class="tile ${ok?'ok':''}"><b>${v}<small> / ${max}</small></b><span>${l}</span></div>`;
  return `<div class="page"><div class="page-h">${logoSVG(t,36)}<h1>Tryouts<small>Sign prospects for season ${G.s.season}</small></h1></div><div class="main"><div class="wrap">
  <div class="cols" style="gap:0 12px"><div class="need">${tile(st.n,16,'Roster',st.n===16)}${tile(st.np,'4+','Pitchers',st.np>=4)}${tile(st.nb,'10+','Batters',st.nb>=10)}</div>
  <section class="card"><div class="card-b" style="font-size:13px"><div class="row wrapr" style="gap:6px 14px"><span><span class="lbl">Offence</span> <b>${esc(fo.n)}</b></span><span><span class="lbl">Defence</span> <b>${esc(fd.n)}</b></span></div><div class="mut" style="margin-top:6px">${fo.fit.length||fd.fit.length?'Prospects with a green style tag fit the way your club plays.':'You have not set a team style yet, so no prospect is marked as a fit. You can set one under Tactics once the season starts.'} Tap a prospect for the full card.</div></div></section></div>
  <div class="seg">${[['all','All'],['b','Batters'],['p','Pitchers'],['fit','Style fits']].map(x=>`<button class="${flt===x[0]?'on':''}" onclick="A.tryF('${x[0]}')">${x[1]}</button>`).join('')}</div>
  <section class="card"><div class="list">${pool.map(p=>{const on=G.try.picked.includes(p.id);return `<div class="li ${on?'me':''}"><div class="row tap" role="button" tabindex="0" style="flex:1;gap:10px;min-height:44px" onclick="A.card('${p.id}')">${pt(p,40)}<div class="who"><span class="nm">${esc(p.name)}</span><span class="sub"><b>${isP(p)?p.role:p.pos}</b><span>${p.age}y</span>${styleTags(p,t)}</span></div>${rt(ovr(p))}<span style="width:20px;text-align:center">${potB(p)}</span></div><button class="btn sm ${on?'gold':'alt'}" ${!on&&st.n>=16?'disabled':''} onclick="A.sign('${p.id}')">${on?'Signed':'Sign'}</button></div>`}).join('')||'<div class="empty">No prospects match this filter.</div>'}</div></section>
  <p class="mut" style="margin:0 2px">Sign prospects until the roster reaches 16. You need at least 4 pitchers and 10 position players. The letter next to each rating is potential.</p></div></div>
  <div class="page-f"><button class="btn ghost" onclick="finishTryouts(true)">Auto-fill</button><div class="sp"></div><button class="btn" ${st.ok?'':'disabled'} onclick="finishTryouts(false)">Start season ${G.s.season}</button></div></div>`}

/* ---------- actions ---------- */
const A={
  go(v){G.view=v;G.sel=null;G.modal=null;render()},close(){G.modal=null;G.modalCls='';render()},
  open(fn,cls){G.modal=fn;G.modalCls=cls||'';render()},
  more(){A.open(moreSheet)},
  newc(force){if(!force&&load())return A.open(()=>sheet('Start over?','<p>Starting a new career replaces your saved career once the new club is created. This cannot be undone.</p>','<button class="btn ghost" onclick="A.close()">Keep my career</button><button class="btn" onclick="A.newc(1)">New career</button>'),'sm');
    G.modal=null;G.cr={step:0,name:'',arch:0,look:{skin:1,hair:0,style:2,eye:0},city:'',team:'',c1:'#e23d4b',c2:'#ffd23f',logo:0,lg:'u18'};G.screen='create';render()},
  cont(){const s=load();if(!s)return render();G.s=s;G.modal=null;G.screen='hub';G.view='home';render()},
  cr(k,v){G.cr[k]=v;render()},look(k,v){const l=G.cr.look;l[k]=v===undefined?(l[k]+1)%({style:6,skin:5,eye:6,hair:10}[k]):v;render()},
  prev(){const e=$('pvn');if(e)e.textContent=(G.cr.city||'City')+' '+(G.cr.team||'Team')},
  step(d){const c=G.cr;if(c.step+d<0){G.screen='title';return render()}if(c.step+d>2){if(c.c1===c.c2)c.c2=c.c1==='#f6f1e4'?'#1a1f4d':'#f6f1e4';newCareer(c);save();G.screen='hub';G.view='home';return render()}c.step+=d;G._key=null;render()},
  play(w){const t=UT();if(!validLineup(t))autoLineup(t);G.sel=null;G.modal=null;G.boxTab=null;beginDay(!!w)},
  next(){G.modal=null;if(G.res.seasonEnd)return endSeason();G.screen='hub';G.view='home';render()},
  endSeason(){endSeason()},off(){G.modal=null;G.tryF=null;offseason()},fired(){try{localStorage.removeItem('starfall9')}catch(e){}G.s=null;G.modal=null;G.screen='title';render()},
  quit(){save();G.modal=null;G.screen='title';render()},
  card(id){A.open(()=>cardHTML(id))},team(id){A.open(()=>teamHTML(id))},
  slot(i){const t=UT(),l=t.lineup;if(G.sel===null)G.sel=i;else if(typeof G.sel==='number'){if(G.sel!==i){const a=l[G.sel].pid;l[G.sel].pid=l[i].pid;l[i].pid=a}G.sel=null}else{l[i].pid=G.sel.slice(1);G.sel=null}save();render()},
  bench(id){if(typeof G.sel==='number'){UT().lineup[G.sel].pid=id;G.sel=null;save()}else G.sel=G.sel==='b'+id?null:'b'+id;render()},
  pos(i,v){const l=UT().lineup,j=l.findIndex(x=>x.pos===v);if(j>=0)l[j].pos=l[i].pos;l[i].pos=v;save();render()},
  auto(){autoLineup(UT());G.sel=null;save();render()},starter(id){UT().starterPick=id;save();render()},
  style(sd,id){const t=UT();if(!t.style)t.style={off:'balanced',def:'balanced'};if(!(sd==='off'?TOFF:TDEF)[id])return;t.style[sd]=id;save();render()},
  focus(k){G.s.train.focus=k;save();render()},int(i){G.s.train.int=i;save();render()},
  spot(id){const s=G.s.train.spot,i=s.indexOf(id),max=sk('mentor')?4:3;if(i>=0)s.splice(i,1);else if(s.length<max)s.push(id);save();render()},
  hire(id){const S=G.s,i=S.pool.findIndex(s=>s.id===id);if(i<0)return;const s=S.pool[i];if(S.staff[s.role])S.pool.push(S.staff[s.role]);S.staff[s.role]=s;S.pool.splice(i,1);news(`${s.name} joins the club as ${STAFFROLE[s.role][0].toLowerCase()}.`);save();render()},
  release(r){const S=G.s;if(S.staff[r]){S.pool.push(S.staff[r]);S.staff[r]=null}save();render()},
  node(id){G.nodeSel=id;render()},
  learn(id){const c=G.s.coach,n=SKILLS.flatMap(b=>b[2]).find(x=>x[0]===id);if(!canLearn(id)||c.sp<n[3])return;c.sp-=n[3];c.skills[id]=true;save();render()},
  lgTab(k){G.lgTab=k;render()},rTab(k){G.rTab=k;render()},boxTab(i){G.boxTab=i;render()},tryF(k){G.tryF=k;render()},
  sign(id){const p=G.try.picked,i=p.indexOf(id);if(i>=0)p.splice(i,1);else if(tryoutState().n<16)p.push(id);render()}
};
// keyboard activation for role=button rows
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.getAttribute&&e.target.getAttribute('role')==='button'){e.preventDefault();e.target.click()}else if(e.key==='Escape'&&G.modal)A.close()});
