'use strict';
const G={s:null,screen:'title',view:'home',cr:null,modal:null,sel:null,lgTab:null};
const R=Math.random,ri=(a,b)=>a+Math.floor(R()*(b-a+1)),pick=a=>a[Math.floor(R()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),gs=()=>(R()+R()+R()-1.5)*2,lerp=(a,b,f)=>a+(b-a)*f;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=ri(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const POS=['C','1B','2B','3B','SS','LF','CF','RF'],OFS=['LF','CF','RF'],IFS=['1B','2B','3B','SS'];
const PADJ={C:[-2,2,0,-8,4,8],'1B':[0,8,0,-6,-2,-4],'2B':[3,-4,2,4,4,-2],'3B':[0,4,0,-2,2,5],SS:[1,-3,0,5,7,4],LF:[1,4,0,2,-2,-2],CF:[2,-2,0,9,5,2],RF:[0,5,0,2,0,7]};
const FIRST=['Ren','Kai','Sora','Haru','Riku','Yuki','Akira','Taro','Jin','Leo','Mika','Nagi','Shun','Toma','Aoi','Daichi','Kaede','Hiro','Rei','Tsubasa','Ash','Finn','Milo','Juno','Ezra','Nova','Rio','Zane','Theo','Luca','Arlo','Kit','Wren','Sage','Io','Tavi','Oren','Bram','Cade','Dax'];
const LAST=['Hoshino','Kurogane','Amagiri','Tsukishiro','Hayate','Mizuhara','Kazama','Shirogane','Akatsuki','Fujimori','Tachibana','Onizuka','Starling','Vale','Ashford','Brightwater','Stormcrow','Emberly','Frost','Galewind','Ironwood','Larkspur','Moonfall','Nightingale','Oakheart','Quill','Ravenna','Skye','Thorne','Wilder','Kisaragi','Minazuki','Arashi','Hinomoto','Sumeragi','Tenma'];
const LG={u18:{n:'U18 Rising League',s:'U18'},prem:{n:'U18 Premier Crown',s:'Premier'}};
const TEAMS={prem:[['Aurelia','Griffins','#d4a017','#1a1f4d',4],['Kagemori','Ravens','#3a2a6b','#c44dff',3],['Port Lumen','Tides','#19b5b0','#f6f1e4',5],['Hoshizora','Comets','#3d8bff','#ffd23f',6],['Ironvale','Golems','#6b7280','#ff8a3c',9],['Sakurano','Blossoms','#ff5c8a','#f6f1e4',8],['Stormreach','Drakes','#e23d4b','#1a1f4d',2],['Glasswater','Herons','#35b37a','#f6f1e4',3]],
u18:[['Emberfield','Foxes','#ff8a3c','#1a1f4d',2],['Mistral','Kites','#57c7ff','#f6f1e4',3],['Tanuki Hill','Drums','#7a5230','#ffd23f',0],['Coppergate','Owls','#b45309','#f6f1e4',7],['Windmere','Otters','#19b5b0','#1a1f4d',5],['Dusk Hollow','Lanterns','#6a4cff','#ffd23f',1],['Sunpetal','Cicadas','#35b37a','#ffd23f',8],['Frostfen','Lynx','#9fb8d9','#1a1f4d',7]]};
const PALETTE=['#e23d4b','#ff8a3c','#ffd23f','#35b37a','#19b5b0','#3d8bff','#6a4cff','#c44dff','#ff5c8a','#f6f1e4','#1a1f4d','#7a5230'];
const EMB=[{n:'Star',d:'M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z'},{n:'Bolt',d:'M60 6 L24 54 H46 L38 94 L76 42 H54 Z'},{n:'Flame',d:'M50 6 C62 28 82 40 76 64 C72 84 58 94 50 94 C38 94 22 84 24 62 C25 50 34 44 36 32 C42 38 45 44 45 52 C54 40 55 22 50 6 Z'},{n:'Wing',d:'M8 60 C28 18 60 10 94 14 C82 24 78 28 86 34 C72 40 68 44 78 50 C62 54 58 58 66 66 C44 76 24 74 8 60 Z'},{n:'Crown',d:'M14 76 L8 30 L32 50 L50 18 L68 50 L92 30 L86 76 Z'},{n:'Wave',d:'M6 62 C20 36 40 36 50 56 C58 72 74 72 80 56 C76 54 72 48 74 38 C88 42 96 58 90 74 C84 90 16 90 6 62 Z'},{n:'Comet',d:'M70 14 a18 18 0 1 0 .1 0 Z M54 40 L6 94 L66 50 Z'},{n:'Fang',d:'M20 12 H80 L66 46 L57 30 L50 94 L43 30 L34 46 Z'},{n:'Blossom',d:[0,1,2,3,4].map(i=>{const a=i*1.2566-1.5708,x=50+26*Math.cos(a),y=50+26*Math.sin(a);return `M${x.toFixed(1)} ${(y-17).toFixed(1)} a17 17 0 1 0 .1 0 Z`}).join(' ')},{n:'Diamond',d:'M50 4 L96 50 L50 96 L4 50 Z M50 28 L72 50 L50 72 L28 50 Z'}];
const BADGES={
clutch:{n:'Clutch Heart',r:'B',d:'+10 Contact and Power with runners in scoring position'},
slugger:{n:'Thunder Bat',r:'B',d:'+8 Power'},
eagle:{n:'Eagle Eye',r:'B',d:'+10 Eye'},
sparkplug:{n:'First Spark',r:'B',d:'+12 Contact with nobody out and the bases empty'},
roadrunner:{n:'Gale Legs',r:'B',d:'+10 Speed and more stolen bases'},
lategame:{n:'Final Chapter',r:'B',d:'+10 Contact and Power from the 6th inning on'},
goldglove:{n:'Gold Glove',r:'B',d:'+10 Fielding'},
cannon:{n:'Cannon Arm',r:'B',d:'+12 Arm'},
captain:{n:'Captain',r:'A',d:'The whole team fills Zone gauges 10% faster'},
ace:{n:'Ace’s Pride',r:'P',d:'+6 to every pitch in innings 1–3 as the starter'},
iceveins:{n:'Ice Veins',r:'P',d:'+10 Control with runners on base'},
fang:{n:'Fang',r:'P',d:'Batters miss more often with two strikes'},
workhorse:{n:'Iron Lungs',r:'P',d:'Throws 10 more pitches before tiring'}};
const ABIL={
dragon:{n:'Dragon Fang Fastball',k:'P',res:'K',d:'A roaring heater nobody can touch. Strikes the batter out.',fx:'fire'},
phantom:{n:'Phantom Curve',k:'P',res:'K',d:'The ball vanishes mid-flight. Strikes the batter out.',fx:'ghost'},
comet:{n:'Comet Gyro',k:'P',res:'K',d:'A spiralling strikeout pitch that also refreshes the pitcher’s arm.',fx:'ice'},
seal:{n:'Sealing Sinker',k:'P',res:'GB',d:'Forces a weak grounder. A double play if a runner is on first.',fx:'ghost'},
meteor:{n:'Meteor Swing',k:'O',res:'HR',d:'Launches a guaranteed home run.',fx:'fire'},
lightning:{n:'Lightning Dash',k:'O',res:'3B',d:'Rips one into the corner and flies around the bases for a triple.',fx:'bolt'},
godeye:{n:'God’s Eye',k:'O',res:'2B',d:'Reads the pitch perfectly and drives a sure double.',fx:'gold'},
rally:{n:'Rally Flame',k:'O',res:'1B',d:'A sure single that fires up every teammate’s Zone gauge.',fx:'fire'},
skythief:{n:'Sky Thief',k:'D',d:'Steals a sure hit out of the air with an impossible leaping catch.',fx:'gold'},
ironwall:{n:'Iron Wall',k:'D',d:'Smothers a sure single with a full-stretch diving stop.',fx:'gold'},
mind:{n:'Mind Reader',k:'D',res:'K',d:'Calls the perfect pitch. The batter is frozen for strike three.',fx:'ice'}};
const ZK={P:{n:'Pitching Zone',c:'#57c7ff'},O:{n:'Offensive Zone',c:'#ff8a3c'},D:{n:'Defensive Zone',c:'#35d98a'}};
const SKILLS=[
['Dojo','Training',[['fundamentals','Fundamentals','All training gains +10%',1],['recovery','Recovery Science','Players shed 5 more fatigue every day',1],['mentor','Spotlight Mentor','A 4th spotlight slot, and spotlight players learn badges twice as often',1],['pitchlab','Pitching Lab','Pitchers train 20% faster and throw 8 more pitches before tiring',2],['awakening','Awakening','Your players start every game with +10 Zone gauge and grow more each offseason',2]]],
['Dugout','Tactics',[['scouting','Scouting Reports','Your pitchers get +2 to every pitch',1],['greenlight','Green Light','Runners steal more often and succeed 8% more',1],['bullpen','Bullpen Whisperer','Your relievers get +5 to every pitch',1],['rally','Rally Caller','From the 6th inning, tied or behind, your batters get +6 Contact and Power',2],['conductor','Zone Conductor','Zone gauges fill 25% faster and every Zone lasts one batter longer',2]]],
['Clubhouse','Leadership',[['teamtalk','Team Talk','Fatigue hurts your players 25% less in games',1],['charm','Sponsor Charm','Sponsor income +25%',1],['network','Staff Network','Assistant coaches cost 20% less and help 25% more',1],['whisper','Board Whisperer','Board confidence drops half as fast',2],['legend','Legend’s Aura','Better tryout prospects and +20% coach XP',2]]]];
const FOCUS={balanced:['Balanced','A bit of everything',[]],batting:['Batting cage','Contact, Power, Eye',['con','pow','eye']],pitching:['Bullpen work','Velocity, Control, Break',['vel','ctl','brk']],defense:['Fielding drills','Fielding, Arm, pitcher Control',['fld','arm','ctl']],cond:['Conditioning','Speed and Stamina',['spd','sta']],rest:['Rest day','No gains, big recovery',[]]};
const STAFFROLE={pitching:['Pitching coach',['vel','ctl','brk']],batting:['Batting coach',['con','pow','eye']],defense:['Catching & fielding coach',['fld','arm']],cond:['Conditioning coach',['spd','sta']]};
const NDAYS=17;
const sk=id=>!!(G.s&&G.s.coach&&G.s.coach.skills[id]);
const has=(p,b)=>p.badges.includes(b);
const abil=p=>ABIL[p.zone];
const isP=p=>p.pos==='P';
function ovr(p){const r=p.r;return isP(p)?r.vel*.3+r.ctl*.3+r.brk*.25+r.sta*.15:r.con*.3+r.pow*.25+r.eye*.15+r.spd*.1+r.fld*.15+r.arm*.05}
const batv=p=>p.r.con*.4+p.r.pow*.35+p.r.eye*.15+p.r.spd*.1;
const blank=()=>({g:0,ab:0,h:0,hr:0,rbi:0,bb:0,k:0,po:0,pk:0,per:0});
const sn=p=>p.name[0]+'. '+p.name.split(' ')[1];
function genPlayer(base,pos,age,role){
  age=age||ri(15,18);const b=base+(age-17)*2.5+gs()*4;const v=(adj=0)=>clamp(Math.round((b+adj+gs()*7)*10)/10,15,95);
  const r={con:20,pow:20,eye:20,spd:30,fld:30,arm:30,vel:20,ctl:20,brk:20,sta:20};
  if(pos==='P'){r.vel=v(role==='RP'?4:0);r.ctl=v();r.brk=v();r.sta=v(role==='RP'?-14:4);r.con=v(-28);r.pow=v(-30);r.eye=v(-26);r.arm=v(8);r.fld=v(-8);r.spd=v(-10)}
  else{const A=PADJ[pos];r.con=v(A[0]);r.pow=v(A[1]);r.eye=v(A[2]);r.spd=v(A[3]);r.fld=v(A[4]);r.arm=v(A[5])}
  const p={id:'p'+(G.s.nid++),name:pick(FIRST)+' '+pick(LAST),age,pos,role:pos==='P'?(role||'SP'):'',r,badges:[],spirit:ri(20,80),fatigue:0,look:{skin:ri(0,4),hair:ri(0,9),style:ri(0,5),eye:ri(0,5)},s:blank()};
  const o=ovr(p);p.pot=clamp(Math.round(o+ri(3,24)-(age-15)*3+gs()*3),Math.ceil(o)+1,96);
  p.zone=pos==='P'?pick(['dragon','phantom','comet','seal']):(R()<(['C','SS','CF'].includes(pos)?.55:.3)?(pos==='C'?'mind':OFS.includes(pos)?'skythief':'ironwall'):pick(['meteor','lightning','godeye','rally']));
  const pool=badgePool(p);
  if(R()<.4+(o-50)*.01)p.badges.push(pick(pool));if(R()<.1){const k=pick(pool);if(!p.badges.includes(k))p.badges.push(k)}
  return assignStyles(p)}
const badgePool=p=>Object.keys(BADGES).filter(k=>BADGES[k].r==='A'||BADGES[k].r===(isP(p)?'P':'B'));
function genRoster(base){const r=[];for(const pos of POS)r.push(genPlayer(base,pos));for(let i=0;i<3;i++)r.push(genPlayer(base-2,pick(POS)));for(let i=0;i<3;i++)r.push(genPlayer(base,'P',0,'SP'));for(let i=0;i<2;i++)r.push(genPlayer(base-1,'P',0,'RP'));return r}
function validLineup(t){const l=t.lineup;if(!l||l.length!==9)return false;const ids=new Set(),ps=new Set();for(const e of l){const p=t.roster.find(q=>q.id===e.pid);if(!p||isP(p)||ids.has(e.pid)||ps.has(e.pos))return false;ids.add(e.pid);ps.add(e.pos)}return POS.every(x=>ps.has(x))&&ps.has('DH')}
function autoLineup(t){
  const bats=t.roster.filter(p=>!isP(p)),used=new Set(),lu=[],fo=p=>ovr(p)*(1-p.fatigue*.004);
  for(const pos of POS){const c=bats.filter(p=>p.pos===pos&&!used.has(p.id)).sort((a,b)=>fo(b)-fo(a))[0];if(c)used.add(c.id);lu.push({pid:c?c.id:null,pos})}
  const rest=bats.filter(p=>!used.has(p.id)).sort((a,b)=>batv(b)*(1-b.fatigue*.004)-batv(a)*(1-a.fatigue*.004));
  for(const l of lu)if(!l.pid)l.pid=rest.shift().id;
  lu.push({pid:rest.shift().id,pos:'DH'});
  const by=id=>t.roster.find(p=>p.id===id);lu.sort((a,b)=>batv(by(b.pid))-batv(by(a.pid)));
  t.lineup=[2,3,0,1,4,5,6,7,8].map(i=>lu[i])}
function pickStarter(t){return t.roster.filter(isP).sort((a,b)=>(ovr(b)*(1-b.fatigue*.006)+(b.role==='SP'?6:0))-(ovr(a)*(1-a.fatigue*.006)+(a.role==='SP'?6:0)))[0]}
function teamOvr(t){const b=t.roster.filter(p=>!isP(p)).map(ovr).sort((a,b)=>b-a).slice(0,9),p=t.roster.filter(isP).map(ovr).sort((a,b)=>b-a).slice(0,4);const all=b.concat(p);return all.reduce((a,c)=>a+c,0)/all.length}
/* ================= PLAY STYLES (data contract: engine in core.js/match.js, screens in ui.js) ================= */
// Batters carry p.os (offence) and p.ds (defence). Pitchers carry p.ps and p.pitches (repertoire, first = primary).
// Teams carry t.style={off,def}. A style is "fit" when a player's style id is listed in the team style's fit array.
const OSTYLE={
contact:{n:'Contact Hitter',s:'CON',d:'Puts the ball in play. Fewer strikeouts and more singles, but less home run power and fewer doubles.'},
slugger:{n:'Power Slugger',s:'PWR',d:'Swings for the fences. More home runs and doubles, more strikeouts and more balls in the air.'},
patient:{n:'Patient Eye',s:'EYE',d:'Works deep counts. Chases less, fouls off two-strike pitches, draws more walks and runs up the pitch count.'},
speedster:{n:'Speedster',s:'SPD',d:'Beats out infield hits, steals far more often and rarely hits into double plays. Little home run power.'},
gap:{n:'Gap Hitter',s:'GAP',d:'Drives the ball into the alleys. More doubles and triples, and runners score from first more often.'}};
const DSTYLE={
vacuum:{n:'Vacuum',s:'VAC',d:'Sure hands on the ground. Half as many errors, and takes away ground-ball singles in the hole.'},
acrobat:{n:'Acrobat',s:'ACR',d:'Diving stops and quick pivots. Robs grounders and line drives and turns more double plays.'},
ballhawk:{n:'Ballhawk',s:'HWK',d:'Reads the ball off the bat. Runs down gap drives and bloopers that would be hits.'},
rocket:{n:'Rocket Arm',s:'ARM',d:'Runners think twice. Fewer extra bases taken, more runners thrown out and doubles held to singles. Behind the plate it shuts down steals.'},
general:{n:'Field General',s:'GEN',d:'Frames borderline pitches into called strikes and controls the running game. Fewer steal attempts, more pickoffs.'}};
const PSTYLE={
flame:{n:'Flamethrower',s:'FLM',d:'Overpowering fastballs. More swings and misses, but more pitches out of the zone and the odd long ball.'},
craft:{n:'Craftsman',s:'CRF',d:'Breaking balls and changes of speed. Batters chase and miss out of the zone and lift weak fly balls.'},
ground:{n:'Groundballer',s:'GRD',d:'Heavy sinkers. Many more ground balls and double plays and very few home runs, but fewer strikeouts.'},
painter:{n:'Painter',s:'PNT',d:'Lives on the corners. More strikes, fewer walks and more called strikes, at the cost of a few swings and misses.'}};
const PITCH={
FB:{n:'Four-seam fastball',s:'FB',mph:[84,96],brk:[0,2],c:'#ffffff'},
SI:{n:'Sinker',s:'SI',mph:[82,93],brk:[5,-6],c:'#ffb35c'},
CT:{n:'Cutter',s:'CT',mph:[80,90],brk:[-4,-1],c:'#ffd23f'},
SL:{n:'Slider',s:'SL',mph:[76,86],brk:[-9,-4],c:'#57c7ff'},
CU:{n:'Curveball',s:'CU',mph:[68,79],brk:[-4,-13],c:'#b06bff'},
CH:{n:'Changeup',s:'CH',mph:[72,82],brk:[5,-8],c:'#35d98a'},
SP:{n:'Splitter',s:'SP',mph:[76,86],brk:[1,-11],c:'#ff5c8a'}};// brk=[horizontal,vertical] break in inches for a right-hander; mph=range scaled by Velocity
const PREP={flame:['FB','SL','SP','CT'],craft:['CU','CH','SL','FB'],ground:['SI','SL','CH','CT'],painter:['FB','CT','CH','CU']};
const TOFF={
balanced:{n:'Balanced Attack',d:'No special instructions. Every hitter plays his own game.',fit:[]},
smallball:{n:'Small Ball',d:'Steal, hit-and-run and manufacture runs. Runners go more often, take the extra base and stay out of double plays. A little less home run power.',fit:['speedster','contact']},
bombers:{n:'Bash Brothers',d:'Sit on a pitch and drive it. More home runs and doubles at the cost of strikeouts.',fit:['slugger','gap']},
grinders:{n:'Grind It Out',d:'Take pitches and wear the starter down. Fewer chases, longer at-bats and the opposing pitcher tires sooner.',fit:['patient','contact']},
linedrive:{n:'Line Drive Machine',d:'Use the whole field. More hits and doubles and fewer strikeouts, but fewer home runs.',fit:['contact','gap']}};
const TDEF={
balanced:{n:'Standard Defence',d:'Straight-up positioning and no special pitching plan.',fit:[]},
power:{n:'Power Pitching',d:'Attack hitters and chase the strikeout. More swings and misses, slightly more walks.',fit:['flame','craft','general']},
groundpound:{n:'Ground and Pound',d:'Pitch to contact on the ground and turn two behind it. More ground balls and double plays, fewer errors.',fit:['ground','vacuum','acrobat']},
nofly:{n:'No-Fly Zone',d:'Let them hit it in the air. The outfield runs everything down, but a few more leave the park.',fit:['craft','painter','ballhawk']},
lockdown:{n:'Lockdown',d:'Shut down the running game and give away nothing for free. Fewer steals and extra bases against, fewer walks and errors.',fit:['painter','rocket','general']}};
function assignStyles(p){
  const r=p.r,w=(o)=>{let b=null,bv=-1e9;for(const k in o){const v=o[k]+gs()*5;if(v>bv){bv=v;b=k}}return b};
  if(isP(p)){
    if(!PSTYLE[p.ps])p.ps=w({flame:r.vel*1.15-r.ctl*.2,craft:r.brk*1.18-r.vel*.16,ground:(r.brk+r.sta)*.515,painter:r.ctl*1.15-r.vel*.2});
    if(!p.pitches||!p.pitches.length){const rep=PREP[p.ps],n=p.role==='RP'?2+(R()<.4?1:0):3+(R()<.35?1:0);p.pitches=[rep[0]].concat(shuffle(rep.slice(1))).slice(0,n)}
    p.os=p.os||'contact';p.ds=p.ds||'vacuum'}
  else{
    if(!OSTYLE[p.os])p.os=w({contact:r.con*1.12-r.pow*.1,slugger:r.pow*1.15-r.con*.2,patient:r.eye*1.1-7,speedster:r.spd*1.08-r.pow*.15,gap:(r.con+r.pow)*.512});
    if(!DSTYLE[p.ds]){const of=OFS.includes(p.pos);
      p.ds=p.pos==='C'?w({general:r.fld+8,rocket:r.arm}):of?w({ballhawk:r.fld+r.spd*.3-12,rocket:r.arm-1}):w({vacuum:r.fld,acrobat:r.fld*.6+r.spd*.4+2,rocket:r.arm-11})}}
  return p}
// [{k:'O'|'D'|'P',id,n,s,d}] for display. Pitchers show only their pitching style.
function pStyles(p){return isP(p)?[{k:'P',id:p.ps,...PSTYLE[p.ps]}]:[{k:'O',id:p.os,...OSTYLE[p.os]},{k:'D',id:p.ds,...DSTYLE[p.ds]}]}
// Team style fit. side='off' counts the nine in the lineup; side='def' counts the eight fielders plus every pitcher on the roster.
// lvl 0-3 is the synergy tier (needs 3 / 5 / 7 fitting players); mult is the strength of the team-style effect.
const SYN_NEED=[3,5,7],SYN_MULT=[.4,.7,1,1.35];
function teamFit(t,side){
  const off=side==='off',id=(t.style&&t.style[side])||'balanced',def=(off?TOFF:TDEF)[id]||(off?TOFF:TDEF).balanced,by=q=>t.roster.find(p=>p.id===q);
  const lu=(t.lineup||[]).map(l=>({p:by(l.pid),pos:l.pos})).filter(l=>l.p);
  const pool=off?lu.map(l=>({p:l.p,sid:l.p.os})):lu.filter(l=>l.pos!=='DH').map(l=>({p:l.p,sid:l.p.ds})).concat(t.roster.filter(isP).map(p=>({p,sid:p.ps})));
  const fits=pool.filter(e=>def.fit.includes(e.sid)).map(e=>e.p),count=fits.length;
  let lvl=0;for(const n of SYN_NEED)if(count>=n)lvl++;
  if(id==='balanced')lvl=0;
  return{id,side,n:def.n,d:def.d,fit:def.fit,count,total:pool.length,lvl,mult:id==='balanced'?0:SYN_MULT[lvl],next:lvl<3?SYN_NEED[lvl]:null,players:fits}}
function autoTeamStyle(t){const best=(side,D)=>{const c=Object.keys(D).filter(id=>id!=='balanced').map(id=>[id,teamFit({...t,style:{off:id,def:id}},side).count]),mx=Math.max(...c.map(e=>e[1]));
    return mx<3?'balanced':pick(c.filter(e=>e[1]>=mx-1).map(e=>e[0]))};// AI clubs pick an identity their roster fits, with some variety between clubs
  t.style={off:best('off',TOFF),def:best('def',TDEF)}}
// Save migration: fills in styles for players and teams created before play styles existed.
function ensureStyles(S){if(!S||!S.teams)return S;const g=G.s;G.s=S;
  for(const t of Object.values(S.teams)){t.roster.forEach(assignStyles);if(!t.lineup||!t.lineup.length)autoLineup(t);
    if(!t.style||!TOFF[t.style.off]||!TDEF[t.style.def]){if(t.id==='user')t.style={off:'balanced',def:'balanced'};else autoTeamStyle(t)}}
  G.s=g;return S}
const DIRN={LF:'left',CF:'center',RF:'right',SS:'short','2B':'second','3B':'third','1B':'first',P:'the mound',C:'the plate'};
/* ================= MATCH ENGINE ================= */
// Field geometry shared by the engine and the renderer. Feet, home plate at the origin, +y towards centre field, +x towards first base.
const FPOS={P:[0,60.5],C:[0,-5],'1B':[62,84],'2B':[32,138],SS:[-36,136],'3B':[-60,84],LF:[-150,255],CF:[0,305],RF:[150,255]};
const BASEXY=[[0,0],[63.64,63.64],[0,127.28],[-63.64,63.64],[0,0]];
const fenceR=a=>330+70*Math.cos(2*a);// a = spray angle in radians, 0 = dead centre
const SPRAY={P:0,C:0,'1B':33,'2B':13,SS:-13,'3B':-33,LF:-27,CF:0,RF:27};// degrees, -45 = left-field line
const HARD={FB:1,SI:1,CT:1},GBB={FB:-.06,SI:.12,CT:.02,SL:0,CU:-.02,CH:.05,SP:.08},HRB={FB:1.08,SI:.8,CT:1,SL:1,CU:1,CH:1,SP:.92};
const BASEN=['','first','second','third','home'];
// Handedness is cosmetic plus the direction a pitch breaks. Derived from the id so old saves need no migration.
const isL=p=>(parseInt(String(p.id).slice(1),10)||0)%(isP(p)?4:3)===0;
class Match{
  constructor(away,home,o={}){
    this.o=o;this.z={};this.box={};this.S=[this.mk(away),this.mk(home)];
    this.score=[0,0];this.inn=1;this.half=0;this.outs=0;this.bases=[null,null,null];this.line=[[0],[]];this.done=false;
    this.approach=0;this.autoPen=true;this.wantChange=false;this.moments=[];this.halfRuns=0;
    for(const s of this.S)for(const p of s.team.roster){this.z[p.id]={g:p.spirit*.3+(s.user&&sk('awakening')?10:0),on:0,used:false,fresh:false};this.box[p.id]={ab:0,h:0,hr:0,rbi:0,bb:0,k:0,r:0,po:0,pk:0,per:0,ph:0,pbb:0,np:0,sb:0,cs:0,fx:0}}
  }
  mk(team){
    if(team.id!=='user'||!validLineup(team))autoLineup(team);
    const by=id=>team.roster.find(p=>p.id===id);
    const lineup=team.lineup.map(l=>({p:by(l.pid),pos:l.pos}));
    const sp=by(team.starterPick)||pickStarter(team);
    const pen=team.roster.filter(p=>isP(p)&&p!==sp).sort((a,b)=>(a.fatigue-b.fatigue)||(ovr(b)-ovr(a)));
    const field={};lineup.forEach(l=>{if(l.pos!=='DH')field[l.pos]=l.p});
    for(const p of team.roster)if(isP(p)?!PSTYLE[p.ps]:!OSTYLE[p.os])assignStyles(p);
    const to=teamFit(team,'off'),td=teamFit(team,'def');
    return{team,lineup,field,pit:sp,starter:sp,pen,bi:0,user:team.id===this.o.user,pitUsed:[sp],capt:lineup.some(l=>has(l.p,'captain')),to:{id:to.id,m:to.mult},td:{id:td.id,m:td.mult}}
  }
  fm(p,s){return 1-p.fatigue*.003*(s.user&&sk('teamtalk')?.75:1)}
  fld(s,pos){const p=pos==='P'?s.pit:s.field[pos];let v=p.r.fld*this.fm(p,s);if(p.pos!==pos)v-=pos==='C'?25:12;if(has(p,'goldglove'))v+=10;if(this.z[p.id].on)v+=20;return v}
  arm(s,pos){const p=s.field[pos];return p.r.arm*this.fm(p,s)+(has(p,'cannon')?12:0)+(this.z[p.id].on?15:0)}
  defAvg(s){let t=0;for(const pos of POS)t+=this.fld(s,pos);return t/8}
  pst(s){const p=s.pit,z=this.z[p.id],bx=this.box[p.id];
    const lim=35+p.r.sta*.6+(s.user&&sk('pitchlab')?8:0)+(has(p,'workhorse')?10:0),tired=Math.max(0,bx.np+bx.fx-lim)*.5;
    let add=-tired;if(z.on)add+=12;if(has(p,'ace')&&this.inn<=3&&p===s.starter)add+=6;if(s.user&&sk('bullpen')&&p!==s.starter)add+=5;if(s.user&&sk('scouting'))add+=2;
    const f=this.fm(p,s),o={vel:p.r.vel*f+add,ctl:p.r.ctl*f+add,brk:p.r.brk*f+add,lim,tired};
    if(has(p,'iceveins')&&this.bases.some(b=>b))o.ctl+=10;return o}
  bst(s,p,si){const z=this.z[p.id],f=this.fm(p,s);let c=0,pw=0,e=0,sp=0;
    if(z.on&&abil(p).k==='O'){c+=12;pw+=12;e+=12}
    if(has(p,'clutch')&&(this.bases[1]||this.bases[2])){c+=10;pw+=10}
    if(has(p,'slugger'))pw+=8;if(has(p,'eagle'))e+=10;if(has(p,'sparkplug')&&this.outs===0&&!this.bases.some(x=>x))c+=12;
    if(has(p,'roadrunner'))sp+=10;if(has(p,'lategame')&&this.inn>=6){c+=10;pw+=10}
    if(s.user&&sk('rally')&&this.inn>=6&&this.score[si]<=this.score[1-si]){c+=6;pw+=6}
    return{con:p.r.con*f+c,pow:p.r.pow*f+pw,eye:p.r.eye*f+e,spd:p.r.spd*f+sp}}
  gain(p,s,amt,ev){const z=this.z[p.id];if(z.on||amt<=0)return;let m=1;if(s.capt)m+=.1;if(s.user&&sk('conductor'))m+=.25;
    z.g=Math.min(100,z.g+amt*m);
    if(z.g>=100){const k=abil(p).k;z.on=(k==='O'?2:k==='P'?5:8)+(s.user&&sk('conductor')?1:0);z.used=false;z.fresh=true;const si=this.S.indexOf(s);ev.push({t:'zoneOn',pid:p.id,side:si,k});this.moments.push({pid:p.id,side:si,txt:'entered the '+ZK[k].n})}}
  gB(p,s,a,ev){this.gain(p,s,a*(abil(p).k==='O'?1:.5),ev)}
  gF(p,s,a,ev){if(!isP(p))this.gain(p,s,a*(abil(p).k==='D'?1:.35),ev)}
  tick(p){const z=this.z[p.id];if(!z.on)return;if(z.fresh){z.fresh=false;return}if(--z.on<=0){z.on=0;z.g=0}}
  ids(){return this.bases.map(b=>b?b.id:null)}
  rspd(r){return r.r.spd+(has(r,'roadrunner')?10:0)}
  maybeChange(F,fi,ev){if(!F.pen.length)return;const px=this.box[F.pit.id],ps=this.pst(F);
    const cond=(ps.tired>4||(px.per>=4&&px.np>25))&&!this.z[F.pit.id].on;
    if(F.user?(this.wantChange||(this.autoPen&&cond)):cond){const np=F.pen.shift();F.pit=np;F.pitUsed.push(np);this.wantChange=false;ev.push({t:'change',side:fi,pid:np.id})}}
  /* ---- running game ---- */
  // Decides at the start of a plate appearance whether a runner will go, and on which pitch.
  stealPlan(B,F){const [a,c,d]=this.bases;let r,from;if(a&&!c){r=a;from=1}else if(c&&!d){r=c;from=2}else return null;
    const spd=this.rspd(r),cat=F.field.C,gl=B.user&&sk('greenlight');
    let p=(spd-44)*.0085*(from===2?.3:d?.75:1);
    if(r.os==='speedster')p*=1.55;if(B.to.id==='smallball')p*=1+B.to.m;if(cat.ds==='general')p*=.78;if(cat.ds==='rocket')p*=.8;if(F.td.id==='lockdown')p*=1-.4*F.td.m;
    if(this.outs===2)p*=1.15;p+=(gl?.05:0)+(B.user?this.approach*.03:0);
    return R()<clamp(p,0,.6)?{r,from,n:R()<.5?1:R()<.6?2:3}:null}
  doSteal(B,F,bi,pl,ev){const r=pl.r,from=pl.from,[a,c,d]=this.bases,cat=F.field.C,gl=B.user&&sk('greenlight'),spd=this.rspd(r);
    const jump=clamp(.5+gs()*.35,0,1),dbl=from===2&&a?a:null,thr=!(from===1&&d&&R()<.5);
    const pOK=clamp(.725+(spd-50)*.006-(this.arm(F,'C')-50)*.006+(jump-.5)*.16+(gl?.08:0)+(r.os==='speedster'?.03:0)+(B.to.id==='smallball'?.06*B.to.m:0)
      -(cat.ds==='general'?.04:0)-(cat.ds==='rocket'?.1:0)-(F.td.id==='lockdown'?.1*F.td.m:0)-(from===2?.03:0),.3,.95);
    const roll=R(),ok=!thr||roll<pOK,close=thr&&Math.abs(roll-pOK)<.14,to=from+1,runs=[{pid:r.id,from,to,out:!ok}];
    const nb=[a,c,d];nb[from-1]=null;if(ok)nb[to-1]=r;else{this.outs++;this.box[F.pit.id].po++}
    if(dbl){nb[0]=null;nb[1]=dbl;runs.push({pid:dbl.id,from:1,to:2,out:false});this.box[dbl.id].sb++}
    this.bases=nb;this.box[r.id][ok?'sb':'cs']++;
    const n=sn(r),desc=!thr?`${n} takes second. No throw.`:dbl?(ok?`Double steal! ${n} and ${sn(dbl)} both move up.`:`${n} is cut down at third on the double steal.`):ok?`${n} steals ${BASEN[to]}${close?' just ahead of the tag':''}!`:`${n} is thrown out stealing ${BASEN[to]}.`;
    ev.push({t:'steal',pid:r.id,ok,side:bi,runs,thr:thr?to:0,close,jump,outs:this.outs,bases:this.ids(),desc});
    if(!ok)this.gF(cat,F,16,ev);else this.gB(r,B,8,ev)}
  tryPick(B,F,bi,ev){const r=this.bases[0];if(!r||this.bases[1])return;const spd=this.rspd(r),cat=F.field.C;
    if(R()>=(spd>58||r.os==='speedster'?.07:.02))return;
    const out=R()<clamp(.07+(cat.ds==='general'?.03:0)+(F.td.id==='lockdown'?.06*F.td.m:0)+(r.os==='speedster'?.02:0),0,.25);
    if(out){this.bases[0]=null;this.outs++;this.box[F.pit.id].po++;this.box[r.id].cs++}
    ev.push({t:'pick',pid:r.id,side:bi,base:1,out,outs:this.outs,bases:this.ids(),desc:out?`${sn(r)} is picked off first!`:`${sn(F.pit)} throws over. ${sn(r)} dives back safely.`})}
  /* ---- pitches ---- */
  pickPitch(pit,ps,b,s){const rep=pit.pitches&&pit.pitches.length?pit.pitches:['FB'],W=[.5,.26,.16,.08];let tot=0;const w=[];
    for(let i=0;i<rep.length;i++){let v=W[i]||.05;const h=HARD[rep[i]];
      if(s===2&&!h)v*=1.6;if(b-s>=2&&i===0)v*=1.9;if(ps.tired>2&&i===0)v*=1.4;if(pit.ps==='flame'&&h)v*=1.2;if(pit.ps==='craft'&&!h)v*=1.25;w.push(v);tot+=v}
    let r=R()*tot,i=0;for(;i<w.length-1;i++)if((r-=w[i])<0)break;return rep[i]}
  // Builds the pitch event: type, speed, break and a location that agrees with the result.
  // loc/tgt are in strike-zone units from the catcher's view: |x|<=1 and |z|<=1 is a strike, +x is the first-base side, +z is up.
  pitchEv(d,pit,ps,b,s,n){const P=PITCH[d.ty]||PITCH.FB,lh=isL(pit),sg=lh?-1:1,hard=HARD[d.ty],u=R,
      mph=Math.round(lerp(P.mph[0],P.mph[1],clamp((ps.vel-25)/62,0,1.08))+gs()*1.2),bk=.75+clamp(ps.brk,20,100)*.006;
    let x,z;const vb=hard?(d.ty==='SI'?-.15:.2):-.3;
    if(d.frame){if(u()<.6){x=(u()<.5?-1:1)*(.94+u()*.06);z=clamp(vb+(u()-.5)*1.5,-.9,.9)}else{z=-(.94+u()*.06);x=(u()-.5)*1.7}}
    else if(d.inZ){x=(u()-.5)*1.84;z=clamp((u()-.5)*1.84+vb*.6,-.93,.93);
      if(pit.ps==='painter'&&u()<.6){if(u()<.5)x=(u()<.5?-1:1)*(.7+u()*.25);else z=(u()<.4?1:-1)*(.7+u()*.25)}
      if(d.res==='called'&&u()<.5){if(u()<.6)x=(x<0?-1:1)*(.6+u()*.36);else z=(z<0?-1:1)*(.6+u()*.36)}}
    else{const far=d.res==='ball'?1.08+u()*u()*1.1:1.05+u()*.42,side=-sg*(hard?(u()<.5?1:-1):(u()<.75?1:-1)),k=u();
      if(k<.45){x=(u()-.5)*1.7;z=(hard&&d.ty!=='SI'?(u()<.7?1:-1):(u()<.88?-1:1))*far}
      else if(k<.82){x=side*far;z=clamp((u()-.5)*1.7+vb*.5,-.95,.95)}
      else{x=side*(1.02+u()*.5);z=(hard&&d.ty!=='SI'?1:-1)*far}}
    const tx=clamp(x*.8,-.85,.85)+(u()-.5)*.2,tz=clamp(z*.75,-.85,.85)+(u()-.5)*.2;
    return{t:'pitch',res:d.res,b,s,fx:null,ty:d.ty,mph,loc:[+x.toFixed(3),+z.toFixed(3)],tgt:[+tx.toFixed(3),+tz.toFixed(3)],brk:[+(-sg*P.brk[0]*bk).toFixed(1),+(P.brk[1]*bk).toFixed(1)],n,pc:this.box[pit.id].np,lhp:lh,sw:!!d.sw,go:!!d.go,frame:!!d.frame}}
  /* ---- batted balls ---- */
  // kind G(rounder) L(iner) F(ly) P(op-up); ev = exit velocity mph; la = launch angle deg; spray deg (-45 left-field line .. +45 right-field line); dist = feet from the plate to where the ball lands or is fielded.
  bbGen(type,fpos,kind,pow,o={}){const j=n=>(R()-.5)*2*n,fd=pos=>Math.hypot(FPOS[pos][0],FPOS[pos][1]),of=OFS.includes(fpos),sgn=fpos==='LF'?-1:fpos==='RF'?1:(R()<.5?-1:1);
    let la,ev=0,spray=SPRAY[fpos]||0,dist;
    const fen=()=>fenceR(spray*Math.PI/180);
    switch(type){
      case'GO':kind='G';spray+=j(o.dive?9:5);la=ri(-14,5);ev=ri(70,99);dist=fpos==='P'?52+j(5):fd(fpos)+j(o.dive?4:9)-(o.ih?22:0);if(o.ih)ev=ri(52,68);break;
      case'LO':kind='L';spray+=j(o.dive?9:4);la=ri(8,15);ev=ri(88,105);dist=fd(fpos)+j(5);break;
      case'FO':if(of){kind='F';spray+=j(o.dive?15:11);la=ri(27,46);dist=o.rob?fen()-5:clamp(fd(fpos)+j(55)+(o.dive?-30:10),205,fen()-16)}
        else{kind='P';spray+=j(8);la=ri(56,74);dist=fd(fpos)+j(14);ev=ri(60,80)}break;
      case'1B':if(!of){kind='G';spray+=j(6);la=ri(-10,2);ev=ri(52,70);dist=fd(fpos)-18+j(6);break}
        if(kind==='G'){spray=fpos==='CF'?j(4):sgn*(R()<.85?22+j(3):41+j(2));la=ri(-8,6);ev=ri(88,106);dist=175+R()*45}
        else if(kind==='L'){spray=clamp(spray+j(13),-42,42);la=ri(9,18);dist=165+R()*60}
        else{spray=clamp(spray+j(13),-42,42);la=ri(28,40);dist=160+R()*42}break;
      case'2B':if(R()<.3){spray=sgn*(40+R()*3.5);kind=kind==='G'?'G':'L';la=kind==='G'?ri(2,8):ri(12,20);dist=235+R()*65}
        else{spray=fpos==='CF'?sgn*(13+R()*5):sgn*(13+R()*7);kind=kind==='G'?'L':kind;la=kind==='L'?ri(14,22):ri(23,32);dist=clamp(285+R()*90,270,fen()-8)}
        if(kind==='G')ev=ri(96,108);break;
      case'3B':spray=R()<.35?sgn*(40.5+R()*3):sgn*(14+R()*6);kind=kind==='F'?'F':'L';la=kind==='L'?ri(15,22):ri(23,30);dist=fen()-ri(4,28);break;
      case'HR':kind='F';spray=clamp(spray+j(15),-43.5,43.5);la=ri(23,37);dist=fen()+12+R()*R()*85+clamp((pow-50)*.6,-8,30);break;
      default:return null}
    if(!ev){const s2=Math.sin(2*la*Math.PI/180);ev=Math.round(clamp(Math.sqrt(Math.max(dist,60)*32.2/(Math.max(.25,s2)*.72))/1.467,58,119))}
    return{kind,ev,la,spray:+spray.toFixed(1),dist:Math.round(dist)}}
  endHalf(ev){
    const fi=1-this.half,F=this.S[fi];if(this.halfRuns===0)this.gain(F.pit,F,10,ev);
    this.outs=0;this.bases=[null,null,null];this.halfRuns=0;
    if(this.half===0){if(this.inn>=7&&this.score[1]>this.score[0])return this.finish(ev);this.half=1}
    else{if(this.inn>=7&&this.score[0]!==this.score[1])return this.finish(ev);this.inn++;this.half=0}
    this.line[this.half].push(0);
    if(this.inn>7){const B=this.S[this.half];this.bases[1]=B.lineup[(B.bi+8)%9].p}
    ev.push({t:'half',inn:this.inn,half:this.half,bases:this.ids()})}
  finish(ev){this.done=true;ev.push({t:'end'})}
  pa(){
    const ev=[];if(this.done)return ev;
    const bi=this.half,fi=1-bi,B=this.S[bi],F=this.S[fi];
    this.maybeChange(F,fi,ev);
    const p=B.lineup[B.bi].p,pit=F.pit,zb=this.z[p.id],zp=this.z[pit.id],bx=this.box[p.id],px=this.box[pit.id],ab=abil(p),cat=F.field.C;
    ev.push({t:'batter',pid:p.id,side:bi});
    this.tryPick(B,F,bi,ev);if(this.outs>=3){this.endHalf(ev);return ev}
    let forced=null,off=false,looking=false,late=[],fx=null,usedA=null;
    if(zb.on&&!zb.used&&ab.k==='O'&&R()<.75){zb.used=true;forced=ab.res;off=true;usedA=p.zone;fx=ab.fx;ev.push({t:'ability',pid:p.id,side:bi,a:p.zone});this.moments.push({pid:p.id,side:bi,txt:'unleashed '+ab.n})}
    else if(zp.on&&!zp.used&&R()<.4){zp.used=true;const a=abil(pit);forced=a.res;usedA=pit.zone;fx=a.fx;late.push({t:'ability',pid:pit.id,side:fi,a:pit.zone});this.moments.push({pid:pit.id,side:fi,txt:'unleashed '+a.n})}
    else{const zc=this.z[cat.id];if(zc.on&&!zc.used&&cat.zone==='mind'&&R()<.3){zc.used=true;forced='K';looking=true;usedA='mind';fx='ice';late.push({t:'ability',pid:cat.id,side:fi,a:'mind'});this.moments.push({pid:cat.id,side:fi,txt:'unleashed Mind Reader'})}}
    const bs=this.bst(B,p,bi),ps=this.pst(F),stuff=(ps.vel+ps.brk)/2,apr=B.user?this.approach:0;
    // play-style and team-style modifiers. Individual styles are trade-offs; team styles pay a small fixed cost and return a benefit that scales with fit.
    const os=p.os,pst=pit.ps,TO=B.to.id,tom=B.to.m,TD=F.td.id,tdm=F.td.m;
    const zAdj=(pst==='flame'?-.008:pst==='painter'?.045:pst==='craft'?-.012:0)+(TD==='power'?-.006:TD==='lockdown'?.022*tdm:0);
    const zSw=(os==='patient'?-.022:0)+(TO==='grinders'?-.012:0)+(pst==='painter'?-.03:0);
    const chase=(os==='patient'?-.092:os==='slugger'?.02:0)+(TO==='grinders'?-.058*tom:0)+(pst==='craft'?.05:0);
    const cAdj=(os==='contact'?.036:os==='slugger'?-.034:0)+(TO==='bombers'?-.016:TO==='linedrive'?.022*tom:0)+(pst==='flame'?-.052:pst==='ground'?.024:pst==='painter'?.014:0)+(TD==='power'?-.052*tdm:TD==='groundpound'?.01:0);
    const foul2=(os==='patient'?.07:0)+(TO==='grinders'?.05*tom:0),frame=cat.ds==='general'?.032:0,grind=TO==='grinders'?.19*tom:0;
    let balls=0,strikes=0,res=null,lastTy='FB',np=0;
    const emit=(d)=>{np++;lastTy=d.ty;if(d.res==='ball')balls++;else if(d.res==='called'||d.res==='swing')strikes++;else if(d.res==='foul'&&strikes<2)strikes++;const e=this.pitchEv(d,pit,ps,balls,strikes,np);ev.push(e);return e};
    if(forced){let n=ri(0,2);const pre=[];while(n--){px.np++;if(R()<.5&&balls+pre.filter(x=>x==='ball').length<3)pre.push('ball');else if(pre.filter(x=>x!=='ball').length<2)pre.push(R()<.5?'called':'foul')}
      for(const r of pre)emit({res:r,ty:this.pickPitch(pit,ps,balls,strikes),inZ:r!=='ball',sw:r==='foul'});
      px.np++;ev.push(...late);const aty={dragon:'FB',phantom:'CU',comet:'SL',seal:'SI'}[usedA]||this.pickPitch(pit,ps,balls,strikes);
      const e=emit({res:forced==='K'?(looking?'called':'swing'):'inplay',ty:aty,inZ:forced!=='K'||looking,sw:!(forced==='K'&&looking)});e.fx=fx;if(usedA==='dragon')e.mph+=6;
      res=forced==='K'?'K':'IP'}
    else{const plan=this.stealPlan(B,F);
      while(!res){
        px.np++;px.fx+=grind;
        const ty=this.pickPitch(pit,ps,balls,strikes),hard=HARD[ty],stf=hard?ps.vel*.75+ps.brk*.25:ps.brk*.75+ps.vel*.25,dif=bs.con-stf;
        const inZ=R()<clamp(.452+(ps.ctl-50)*.004+zAdj+(hard?.012:-.024)+(balls===3?.07:strikes===2&&balls<2?-.05:0),.28,.76);
        const go=plan&&plan.n===np+1&&strikes<2&&balls<3&&this.bases[plan.from-1]===plan.r&&!this.bases[plan.from];
        const d={ty,inZ,go,sw:false,res:null};
        if(!go)d.sw=R()<(inZ?.66+apr*.08+zSw:clamp(.3-(bs.eye-50)*.004+(ps.brk-50)*.002+chase+(hard?-.025:.045),.05,.56)+apr*.07);
        if(!d.sw){if(inZ||R()<frame){d.res='called';d.frame=!inZ;emit(d);if(strikes>=3){res='K';looking=true}}else{d.res='ball';emit(d);if(balls>=4)res='BB'}
          if(go){this.doSteal(B,F,bi,plan,ev);if(this.outs>=3){this.endHalf(ev);return ev}}
          continue}
        if(!(R()<clamp((inZ?.876:.656)+dif*.004+cAdj-(inZ?0:(hard?0:.03)+(pst==='craft'?.04:0))-(strikes===2&&has(pit,'fang')?.07:0),.3,.97))){d.res='swing';emit(d);if(strikes>=3)res='K';continue}
        if(R()<(strikes===2?.4+foul2:.36)){d.res='foul';emit(d);continue}
        d.res='inplay';emit(d);res='IP'}}
    let type=res,fpos=null,robbed=null,kind=null,ih=false,dive=false,ebase=null,held=false;
    if(res==='IP'){
      const gb=clamp(.43+GBB[lastTy]+(pst==='ground'?.12:pst==='craft'?-.06:0)+(TD==='groundpound'?.1*tdm:TD==='nofly'?-.07*tdm:0)+(os==='slugger'?-.04:os==='speedster'?.04:0),.2,.8);
      const hrM=HRB[lastTy]*(os==='slugger'?1.3:os==='contact'?.74:os==='speedster'?.86:os==='gap'?.92:1)*(TO==='bombers'?1+.15*tom:TO==='smallball'?.95:TO==='linedrive'?.88:1)*(pst==='flame'?1.03:pst==='ground'?.7:pst==='painter'?1.05:1)*(TD==='nofly'?1.07:1);
      if(forced==='GB')type='GO';else if(forced)type=forced;
      else if(R()<clamp((.0505+(bs.pow-50)*.0016-(stuff-50)*.0006)*hrM,.003,.2))type='HR';
      else if(R()<clamp(.342+(bs.con-stuff)*.0025-(this.defAvg(F)-50)*.0012+(os==='contact'?.026:os==='slugger'?-.006:0)+(TO==='linedrive'?.017*tom:0)+(pst==='ground'?.005:pst==='craft'?-.006:0),.15,.46)){const r=R();
        const p3=clamp(.04+(bs.spd-50)*.0012+(os==='gap'?.014:os==='speedster'?.012:0),.01,.13),p2=clamp(.285+(bs.pow-50)*.002+(os==='gap'?.075:os==='slugger'?.035:os==='contact'?-.045:0)+(TO==='bombers'?.03*tom:TO==='linedrive'?.03*tom:0)-(TD==='nofly'?.05*tdm:0),.1,.46);
        type=r<p3?'3B':r<p2?'2B':'1B'}
      else{const r=R();type=r<gb?'GO':r<.88?'FO':'LO'}
      const wp=(ks,ws)=>{let r=R(),i=0;for(;i<ks.length-1;i++){if((r-=ws[i])<0)break}return ks[i]};
      fpos=type==='GO'?wp(['SS','2B','3B','1B','P'],[.3,.27,.2,.16,.07]):type==='LO'?wp(['SS','2B','3B','1B'],[.3,.3,.2,.2]):type==='FO'?(R()<.14?pick(IFS):pick(OFS)):pick(OFS);
      if(type==='1B'||type==='2B'||type==='3B'){const r=R();kind=type==='1B'?(r<.45?'G':r<.8?'L':'F'):type==='2B'?(r<.12?'G':r<.62?'L':'F'):(r<.6?'L':'F')}
      if(!forced){
        const fs=pos=>pos==='P'?null:F.field[pos].ds;
        if((type==='GO'||type==='FO')&&fpos!=='P'&&R()<clamp(.036-(this.fld(F,fpos)-50)*.0008,.005,.08)*(fs(fpos)==='vacuum'?.5:1)*(TD==='groundpound'||TD==='lockdown'?1-.35*tdm:1)){ebase=type;type='E'}
        // slow roller beaten out for an infield single
        else if(type==='GO'&&fpos!=='P'&&R()<clamp(.022+(bs.spd-50)*.0016+(os==='speedster'?.065:0)-(fs(fpos)==='rocket'?.04:fs(fpos)==='vacuum'?.012:0),0,.14)){type='1B';kind='G';ih=true}
        // defensive styles take hits away
        else if(type==='1B'&&kind!=='F'){const c=fpos==='LF'?['3B','SS']:fpos==='CF'?['SS','2B']:['2B','1B'],q=pick(c),s=fs(q);
          if(kind==='G'&&(s==='vacuum'&&R()<.06||s==='acrobat'&&R()<.075||s==='rocket'&&R()<.05)){dive=s==='acrobat'||R()<.4;type='GO';fpos=q}
          else if(kind==='L'&&s==='acrobat'&&R()<.055){dive=true;type='LO';fpos=q}}
        else if((type==='2B'||type==='3B'||type==='1B'&&kind==='F')&&R()<(fs(fpos)==='ballhawk'?.1:0)+(TD==='nofly'?.06*tdm:0)){dive=true;type='FO'}
        else if(type==='2B'&&fs(fpos)==='rocket'&&R()<.13){type='1B';kind=kind==='G'?'L':kind;held=true}// a strong arm holds the hitter to a single
      }
      if(['1B','2B','3B','HR'].includes(type)&&!off&&!ih){
        const c=Object.entries(F.field).filter(([pos,q])=>{const z=this.z[q.id];return z.on&&!z.used&&(q.zone==='skythief'?OFS.includes(pos):q.zone==='ironwall'&&type==='1B'&&IFS.includes(pos))});
        if(c.length&&R()<.7){const [pos,q]=pick(c);this.z[q.id].used=true;usedA=q.zone;ev.push({t:'ability',pid:q.id,side:fi,a:q.zone});this.moments.push({pid:q.id,side:fi,txt:'unleashed '+abil(q).n});robbed=type;type=q.zone==='skythief'?'FO':'LO';fpos=pos;dive=true}}
    }
    const o0=this.outs,m=[],bz=this.bases,nb=[null,null,null],[a,c,d]=bz;let runs=0,outs=0,rbi=0,code=type,thr=null;
    const spd=r=>this.rspd(r),isOF=fpos&&OFS.includes(fpos);
    const sc=(r,from)=>{m.push({pid:r.id,from,to:4});runs++;this.box[r.id].r++};
    const mv=(r,from,to)=>{m.push({pid:r.id,from,to});nb[to-1]=r};
    const ofArm=isOF?this.arm(F,fpos):50,rock=isOF&&F.field[fpos].ds==='rocket';
    // extra-base decisions: xb shifts how often runners go, and a runner who goes can be thrown out.
    const xb=(TO==='smallball'?.18*tom:0)-(rock?.18:0)-(TD==='lockdown'?.1*tdm:0);
    const gun=(r,from,to,base)=>{// runner r tries for an extra base; returns true if he is thrown out
      const po=clamp(base+(ofArm-50)*.003-(spd(r)-50)*.003+(rock?.1:0)+(TD==='lockdown'?.03*tdm:0)-(r.os==='speedster'?.015:0),.01,.3),roll=R();
      if(roll<po&&o0+outs<3){m.push({pid:r.id,from,to,out:true,tag:true});outs++;thr={to,out:true,pid:r.id};return true}
      if(roll<po+.3&&!thr)thr={to,out:false,pid:r.id};return false};
    switch(type){
      case'K':outs=1;nb[0]=a;nb[1]=c;nb[2]=d;break;
      case'LO':outs=1;m.push({pid:p.id,from:0,to:1,out:true});nb[0]=a;nb[1]=c;nb[2]=d;break;
      case'BB':if(a){if(c){if(d){sc(d,3);rbi++}mv(c,2,3)}else if(d)nb[2]=d;mv(a,1,2)}else{nb[1]=c;nb[2]=d}mv(p,0,1);break;
      case'1B':case'E':
        if(ih||(type==='E'&&ebase==='GO')){// infield single or infield error: runners move up only when forced, a runner on third holds unless the bases are full
          if(a){if(c){if(d){sc(d,3);rbi++}mv(c,2,3)}else if(d)nb[2]=d;mv(a,1,2)}else{nb[1]=c;nb[2]=d}mv(p,0,1);if(type==='E')rbi=0;break}
        if(d){sc(d,3);rbi++}
        if(c){if(R()<clamp(.67+(spd(c)-50)*.006-(ofArm-50)*.004+xb+(kind==='G'?.05:0),.2,.95)){if(!gun(c,2,4,.07)){sc(c,2);rbi++}}else mv(c,2,3)}
        if(a){if(!nb[2]&&R()<clamp(.32+(spd(a)-50)*.006+xb+(fpos==='RF'?.08:fpos==='LF'?-.08:0),.05,.75)){if(!gun(a,1,3,.05))mv(a,1,3)}else mv(a,1,2)}
        mv(p,0,1);if(type==='E')rbi=0;break;
      case'2B':if(d){sc(d,3);rbi++}if(c){sc(c,2);rbi++}
        if(a){if(R()<clamp(.47+(spd(a)-50)*.006-(ofArm-50)*.004+xb+(os==='gap'?.12:0),.1,.9)){if(!gun(a,1,4,.08)){sc(a,1);rbi++}}else mv(a,1,3)}mv(p,0,2);break;
      case'3B':for(const [r,f] of [[d,3],[c,2],[a,1]])if(r){sc(r,f);rbi++}mv(p,0,3);break;
      case'HR':for(const [r,f] of [[d,3],[c,2],[a,1]])if(r){sc(r,f);rbi++}sc(p,0);rbi++;break;
      case'GO':{const fs=pos=>pos==='P'?null:F.field[pos].ds,piv=fpos==='SS'||fpos==='3B'?'2B':'SS';
        if(a&&o0<2&&(forced==='GB'||R()<clamp(.39-(bs.spd-50)*.004+(this.fld(F,fpos)-50)*.003+(fs(fpos)==='acrobat'?.05:fs(fpos)==='rocket'?.06:0)+(fs(piv)==='acrobat'?.06:0)+(pst==='ground'?.03:0)+(TD==='groundpound'?.1*tdm:0)-(TO==='smallball'?.13*tom:0)-(os==='speedster'?.09:0)-(dive?.2:0),.06,.8))){
          outs=2;code='DP';m.push({pid:a.id,from:1,to:2,out:true});m.push({pid:p.id,from:0,to:1,out:true});
          if(o0+2<3){if(d)sc(d,3);if(c)mv(c,2,3)}}
        else{outs=1;m.push({pid:p.id,from:0,to:1,out:true});const po=TO==='smallball'?.2*tom:0;
          if(o0+1<3){if(d){if(R()<.55+po){sc(d,3);rbi++}else nb[2]=d}if(c){if(!nb[2]&&R()<.6+po)mv(c,2,3);else nb[1]=c}if(a){if(!nb[1])mv(a,1,2);else nb[0]=a}}}
        break}
      case'FO':outs=1;m.push({pid:p.id,from:0,to:1,out:true});
        if(o0+1<3){
          if(d){if(isOF&&!robbed&&R()<clamp(.62+(spd(d)-50)*.006-(ofArm-50)*.005+xb,.2,.95)){if(gun(d,3,4,.06))code='FO';else{sc(d,3);rbi++;code='SF'}}else nb[2]=d}
          if(c){if(!nb[2]&&isOF&&R()<clamp(.22+xb+(fpos==='RF'?.12:0),.02,.6)){if(!gun(c,2,3,.05))mv(c,2,3)}else nb[1]=c}nb[0]=a}
        break;
    }
    this.outs+=outs;this.bases=nb;this.score[bi]+=runs;this.line[bi][this.line[bi].length-1]+=runs;this.halfRuns+=runs;
    if(!['BB','SF'].includes(code))bx.ab++;const hit=['1B','2B','3B','HR'].includes(type);
    if(hit){bx.h++;px.ph++}if(type==='HR')bx.hr++;if(type==='BB'){bx.bb++;px.pbb++}if(type==='K'){bx.k++;px.pk++}bx.rbi+=rbi;px.po+=outs;px.per+=runs;
    const bb=res==='IP'?this.bbGen(type==='E'?ebase:type,fpos,kind,bs.pow,{ih,dive,rob:!!robbed&&isOF}):null;
    const n=sn(p),dir=fpos?DIRN[fpos]:'',k=bb?bb.kind:'';
    let desc={K:`${n} strikes out ${looking?'looking':'swinging'}.`,BB:`${n} draws a walk.`,
      '1B':ih?`${n} beats out an infield single to ${dir}.`:held?`${n} drives one to ${dir} but is held to a single.`:k==='G'?`${n} grounds a single through to ${dir}.`:k==='L'?`${n} lines a single to ${dir}.`:`${n} drops a single into ${dir}.`,
      '2B':Math.abs(bb?bb.spray:0)>38?`${n} rips a double down the line.`:`${n} doubles into the gap in ${dir}.`,'3B':`${n} triples to ${dir}!`,
      HR:runs===4?`GRAND SLAM! ${n} clears the bases!`:`${n} crushes a ${bb?bb.dist:400}-foot home run to ${dir}!`,
      GO:dive?`${sn(F.field[fpos]||pit)} makes a diving stop and throws out ${n}.`:`${n} grounds out to ${dir}.`,DP:`${n} grounds into a double play.`,
      FO:dive&&!robbed?`${sn(F.field[fpos])} runs down ${n}'s drive in ${dir}.`:k==='P'?`${n} pops out to ${dir}.`:`${n} flies out to ${dir}.`,SF:`${n} lifts a sacrifice fly to ${dir}.`,
      LO:dive&&!robbed?`${sn(F.field[fpos])} dives to snare ${n}'s liner.`:`${n} lines out to ${dir}.`,E:`${n} reaches on an error at ${dir}.`}[code];
    if(robbed)desc=`${sn(F.field[fpos])} robs ${n} of a ${robbed==='HR'?'home run':'hit'}!`;
    if(runs&&code!=='HR')desc+=runs===1?' A run scores.':` ${runs} runs score.`;
    if(thr&&thr.out)desc+=` ${sn(this.S[bi].team.roster.find(q=>q.id===thr.pid))} is thrown out at ${thr.to===4?'the plate':BASEN[thr.to]}!`;
    ev.push({t:'play',res:code,type,fpos,moves:m,runs,outs:Math.min(3,this.outs),bases:this.ids(),score:this.score.slice(),pid:p.id,side:bi,robbed,desc,abil:usedA,looking,bb,thr,dive,ih,ebase});
    if(type==='HR')this.moments.push({pid:p.id,side:bi,txt:runs===4?'hit a grand slam':'homered'});
    // gauges
    this.gB(p,B,{'1B':27,'2B':33,'3B':38,HR:50,BB:11}[type]||0,ev);this.gB(p,B,rbi*8,ev);
    if(runs)for(const l of B.lineup)if(l.p!==p)this.gB(l.p,B,3,ev);
    if(usedA==='rally')for(const l of B.lineup)if(l.p!==p)this.gain(l.p,B,25,ev);
    if(usedA==='comet')px.np=Math.max(0,px.np-12);
    if(outs){this.gain(pit,F,code==='K'?13:code==='DP'?10:4,ev);for(const pos of POS)this.gF(F.field[pos],F,pos===fpos?(code==='DP'||robbed||dive||(thr&&thr.out)?22:14):pos==='C'&&code==='K'?6:1,ev)}
    else if(hit){const z=this.z[pit.id];if(!z.on)z.g=Math.max(0,z.g-(type==='HR'?10:4))}
    if(ab.k==='O')this.tick(p);this.tick(pit);for(const pos of POS){const q=F.field[pos];if(abil(q).k==='D')this.tick(q)}
    B.bi=(B.bi+1)%9;
    if(bi===1&&this.inn>=7&&this.score[1]>this.score[0]){this.finish(ev);return ev}
    if(this.outs>=3)this.endHalf(ev);
    return ev}
}
/* ================= SEASON / WORLD ================= */
function roundRobin(ids){const a=ids.slice(),n=a.length,rs=[];for(let r=0;r<n-1;r++){const pr=[];for(let i=0;i<n/2;i++){const h=a[i],w=a[n-1-i];pr.push(r%2?[h,w]:[w,h])}rs.push(pr);a.splice(1,0,a.pop())}return rs.concat(rs.map(pr=>pr.map(([h,w])=>[w,h])))}
const userLg=()=>G.s.lg.u18.includes('user')?'u18':'prem';
const UT=()=>G.s.teams.user;
const dayInfo=d=>d<7?{k:'L',r:d}:d<10?{k:'C',r:d-7}:{k:'L',r:d-3};
function standings(lg){return G.s.lg[lg].map(id=>G.s.teams[id]).sort((a,b)=>(b.w-a.w)||((b.rs-b.ra)-(a.rs-a.ra))||(b.rs-a.rs))}
function newCareer(c){
  const S=G.s={v:1,nid:1,season:1,day:0,money:c.lg==='prem'?3000:2000,coach:{name:c.name||'Coach',look:c.look,arch:c.arch,xp:0,lvl:1,sp:2,skills:{}},teams:{},lg:{u18:[],prem:[]},staff:{},pool:[],train:{focus:'balanced',int:1,spot:[]},board:{conf:60},missions:[],news:[],hist:[],cup:null,sched:null,career:{w:0,l:0,titles:0,cups:0}};
  S.coach.skills[['scouting','fundamentals','teamtalk'][c.arch]]=true;
  for(const lg of ['u18','prem'])TEAMS[lg].forEach((d,i)=>{const user=lg===c.lg&&i===7,id=user?'user':lg+i,base=(lg==='prem'?59:46)+(user?(lg==='prem'?-3:0):gs()*2.5);
    const t={id,city:user?(c.city||'Starfall'):d[0],nick:user?(c.team||'Nine'):d[1],c1:user?c.c1:d[2],c2:user?c.c2:d[3],logo:user?c.logo:d[4],roster:genRoster(base),lineup:[],starterPick:null,w:0,l:0,rs:0,ra:0};
    t.short=t.city.replace(/[^A-Za-z]/g,'').slice(0,3).toUpperCase()||'USR';S.teams[id]=t;S.lg[lg].push(id);autoLineup(t);if(user)t.style={off:'balanced',def:'balanced'};else autoTeamStyle(t)});
  startSeason(true)}
function startSeason(first){const S=G.s;S.day=0;S.cup=null;S.log={};S.sched={u18:roundRobin(shuffle(S.lg.u18)),prem:roundRobin(shuffle(S.lg.prem))};
  for(const t of Object.values(S.teams)){t.w=t.l=t.rs=t.ra=0;t.starterPick=null;for(const p of t.roster){p.s=blank();p.fatigue=0}}
  if(!first)S.money+=500;S.pool=genStaff();S.missions=genMissions();
  news(`Season ${S.season} begins in the ${LG[userLg()].n}.`)}
function genStaff(){const o=[];for(const role of Object.keys(STAFFROLE))for(let i=0;i<3;i++){const stars=clamp(Math.round(1.6+i*1.1+gs()*.7),1,5);o.push({id:'s'+ri(1e5,9e5),name:pick(FIRST)+' '+pick(LAST),role,stars,pay:stars*stars*18+ri(10,30)})}return o}
function genMissions(){const S=G.s,lg=userLg(),rk=S.lg[lg].map(id=>S.teams[id]).sort((a,b)=>teamOvr(b)-teamOvr(a)).indexOf(UT())+1;
  const fin=clamp(rk+1,2,7),cupT=rk<=3?2:1,dev=Math.round((teamOvr(UT())+1)*10)/10;
  return[{type:'finish',target:fin,text:`Finish ${ord(fin)} or better in the ${LG[lg].n}`,m:1000,xp:150,done:null},
    {type:'cup',target:cupT,text:cupT===2?'Reach the Starfall Cup final':'Win a Starfall Cup game',m:700,xp:100,done:null},
    {type:'dev',target:dev,text:`Raise the team rating to ${dev.toFixed(1)}`,m:500,xp:100,done:null}]}
const ord=n=>n+(['th','st','nd','rd'][n%10>3||Math.floor(n/10)===1?0:n%10]);
function missionProg(ms){const S=G.s;if(ms.type==='finish'){const r=standings(userLg()).indexOf(UT())+1;return{ok:r<=ms.target,txt:`Currently ${ord(r)}`}}
  if(ms.type==='cup'){const w=S.cup?S.cup.r.flat().filter(t=>t.w==='user').length:0;return{ok:w>=ms.target,txt:S.cup?`${w} cup win${w===1?'':'s'}`:'Cup starts after round 7'}}
  const o=teamOvr(UT());return{ok:o>=ms.target,txt:`Now ${o.toFixed(1)}`}}
function news(t){G.s.news.unshift(t);G.s.news.length=Math.min(G.s.news.length,14)}
function gainXP(n){const c=G.s.coach;n=Math.round(n*(sk('legend')?1.2:1));c.xp+=n;while(c.xp>=100+c.lvl*60){c.xp-=100+c.lvl*60;c.lvl++;c.sp++;news(`Coach ${c.name} reached level ${c.lvl}. A new skill point is ready.`)}return n}
function staffBonus(stat){const S=G.s;let b=0;for(const role in S.staff){const st=S.staff[role];if(st&&STAFFROLE[role][1].includes(stat))b+=st.stars*.08*(sk('network')?1.25:1)}return b}
const staffPay=()=>Math.round(Object.values(G.s.staff).reduce((a,s)=>a+(s?s.pay:0),0)*(sk('network')?.8:1));
function trainTeam(t,user){
  const S=G.s,cfg=user?S.train:{focus:'balanced',int:1,spot:[]},im=[.6,1,1.5][cfg.int],fs=FOCUS[cfg.focus][2],rep=[];
  for(const p of t.roster){
    const keys=isP(p)?['vel','ctl','brk','sta']:['con','pow','eye','spd','fld','arm'],o0=ovr(p);
    if(cfg.focus!=='rest'){
      const room=clamp((p.pot-o0)/25,.05,1.2),af=[1.2,1.1,1,.85][clamp(p.age-15,0,3)],spot=cfg.spot.includes(p.id)?2:1;
      for(const k of keys){const w=cfg.focus==='balanced'?.45:fs.includes(k)?1:.2;let bonus=user?staffBonus(k)+(sk('fundamentals')?.1:0)+(isP(p)&&sk('pitchlab')?.2:0):-.15;
        p.r[k]=clamp(p.r[k]+.22*room*af*im*(1+bonus)*w*spot*(.6+R()*.8),1,99)}
      if(user&&spot===2&&p.badges.length<3&&R()<(sk('mentor')?.1:.05)){const pool=badgePool(p).filter(b=>!p.badges.includes(b));if(pool.length){const b=pick(pool);p.badges.push(b);news(`${p.name} learned the ${BADGES[b].n} badge in spotlight training!`);rep.push({name:p.name,d:0,badge:BADGES[b].n})}}
    }
    const rec=28+(user?(sk('recovery')?5:0)+(S.staff.cond?S.staff.cond.stars*2:0):2)+(cfg.focus==='rest'?20:0)+[6,0,-7][cfg.int]*(cfg.focus==='rest'?0:1);
    p.fatigue=clamp(p.fatigue-rec,0,100);
    const d=ovr(p)-o0;if(user&&d>0)rep.push({name:p.name,d});
  }
  return rep.sort((a,b)=>(b.badge?9:b.d)-(a.badge?9:a.d)).slice(0,5)}
function initCup(){const S=G.s,st=standings(userLg()).map(t=>t.id);S.cup={lg:userLg(),champ:null,r:[[[0,7],[3,4],[1,6],[2,5]].map(([a,b])=>({a:st[a],b:st[b],w:null,sa:0,sb:0})),[],[]]};news('The Starfall Cup bracket is set. Eight teams, three rounds, no second chances.')}
function userGame(){const S=G.s;if(S.day>=NDAYS)return null;const inf=dayInfo(S.day),lg=userLg();
  if(inf.k==='L'){const pr=S.sched[lg][inf.r].find(p=>p.includes('user'));return{home:pr[0],away:pr[1],k:'L',r:inf.r}}
  if(!S.cup)initCup();const tie=S.cup.r[inf.r].find(t=>t.a==='user'||t.b==='user');return tie?{home:tie.a,away:tie.b,k:'C',r:inf.r,tie}:null}
function simGame(home,away,league){const S=G.s,m=new Match(S.teams[away],S.teams[home],{user:'user'});while(!m.done)m.pa();applyMatch(m,league);return m}
function applyMatch(m,league){const [a,h]=m.S,hw=m.score[1]>m.score[0];
  if(league){h.team.w+=hw?1:0;h.team.l+=hw?0:1;a.team.w+=hw?0:1;a.team.l+=hw?1:0;h.team.rs+=m.score[1];h.team.ra+=m.score[0];a.team.rs+=m.score[0];a.team.ra+=m.score[1]}
  for(const s of m.S){for(const l of s.lineup)l.p.fatigue=clamp(l.p.fatigue+(l.pos==='DH'?5:l.pos==='C'?14:10),0,100);
    for(const p of s.pitUsed)p.fatigue=clamp(p.fatigue+m.box[p.id].np*.9,0,100);
    for(const p of s.team.roster){const b=m.box[p.id];if(b.ab+b.bb+b.np>0)p.s.g++;for(const k of ['ab','h','hr','rbi','bb','k','po','pk','per'])p.s[k]+=b[k]}
    s.team.starterPick=null}}
function beginDay(watch){const S=G.s;const ug=userGame();G.dayRep=null;
  for(const t of Object.values(S.teams)){const r=trainTeam(t,t.id==='user');if(t.id==='user')G.dayRep=r}
  if(!ug)return finishDay(null);
  const m=new Match(S.teams[ug.away],S.teams[ug.home],{user:'user'});m.ug=ug;
  if(watch)startViewer(m);else{while(!m.done)m.pa();finishDay(m)}}
function finishDay(m){
  const S=G.s,inf=dayInfo(S.day),lg=userLg(),res={m,rep:G.dayRep,notes:[],dm:0,xp:0,ug:m?m.ug:null};
  let won=null;
  if(m){applyMatch(m,inf.k==='L');const us=m.S[0].user?0:1;won=m.score[us]>m.score[1-us];res.won=won;S.career[won?'w':'l']++}
  if(inf.k==='L'){for(const L of ['u18','prem'])for(const pr of S.sched[L][inf.r])if(!pr.includes('user'))simGame(pr[0],pr[1],true)}
  else{const rd=S.cup.r[inf.r];for(const tie of rd){let mm;if(m&&tie===m.ug.tie)mm=m;else mm=simGame(tie.a,tie.b,false);tie.sa=mm.score[1];tie.sb=mm.score[0];tie.w=tie.sa>tie.sb?tie.a:tie.b}
    if(inf.r<2){for(let i=0;i<rd.length;i+=2)S.cup.r[inf.r+1].push({a:rd[i].w,b:rd[i+1].w,w:null,sa:0,sb:0})}
    else{S.cup.champ=rd[0].w;const ct=S.teams[S.cup.champ];news(`${ct.city} ${ct.nick} lift the Starfall Cup!`);if(S.cup.champ==='user'){S.money+=1000;res.dm+=1000;S.career.cups++;res.notes.push('Starfall Cup champions! Prize money $1,000')}}}
  const prem=lg==='prem',inc=Math.round((prem?340:220)*(sk('charm')?1.25:1)),pay=staffPay();
  let dm=inc-pay;if(won){dm+=120;res.notes.push('Win bonus $120')}
  S.money+=dm;res.dm+=dm;res.inc=inc;res.pay=pay;
  if(m){res.xp=gainXP(25+(won?25:0)+(won&&inf.k==='C'?40:0));const dc=won?2:(sk('whisper')?-.5:-1);S.board.conf=clamp(S.board.conf+dc,0,100);
    const o=S.teams[m.S[0].user?m.S[1].team.id:m.S[0].team.id],us=m.S[0].user?0:1;S.log[S.day]=[won,m.score[us],m.score[1-us]];news(`${won?'Won':'Lost'} ${m.score[us]}–${m.score[1-us]} ${m.S[1].user?'vs':'at'} ${o.city} ${o.nick}${inf.k==='C'?' in the Starfall Cup':''}.`)}
  else res.xp=gainXP(10);
  if(S.money<0){S.board.conf=clamp(S.board.conf-3,0,100);res.notes.push('The club is in debt. The board is not pleased.')}
  S.day++;res.seasonEnd=S.day>=NDAYS;save();G.res=res;G.screen='result';render()}
function endSeason(){
  const S=G.s,lg=userLg(),st=standings(lg),rank=st.indexOf(UT())+1,se={rank,lg,ms:[],champ:st[0].id,st:st.map(t=>({id:t.id,w:t.w,l:t.l}))};
  if(rank===1){S.career.titles++;S.money+=1500;se.title=true}
  for(const ms of S.missions){const ok=missionProg(ms).ok;ms.done=ok;if(ok){S.money+=ms.m;gainXP(ms.xp);S.board.conf=clamp(S.board.conf+12,0,100)}else S.board.conf=clamp(S.board.conf-(sk('whisper')?5:10),0,100);se.ms.push({text:ms.text,ok,m:ms.m})}
  const up=standings('u18').slice(0,2).map(t=>t.id),down=standings('prem').slice(6).map(t=>t.id);se.up=up;se.down=down;
  se.fired=S.board.conf<=0;se.conf=S.board.conf;
  S.hist.unshift({season:S.season,lg,rank,w:UT().w,l:UT().l,cup:S.cup&&S.cup.champ==='user'});
  G.se=se;G.screen='season';render()}
function offseason(){
  const S=G.s,se=G.se;
  S.lg.u18=S.lg.u18.filter(id=>!se.up.includes(id)).concat(se.down);S.lg.prem=S.lg.prem.filter(id=>!se.down.includes(id)).concat(se.up);
  for(const lg of ['u18','prem'])for(const id of S.lg[lg]){const t=S.teams[id],user=id==='user';
    for(const p of t.roster){const o=ovr(p),g=clamp((p.pot-o)/6,0,5)*(.4+R()*.8)+(user&&sk('awakening')?1:0);for(const k of (isP(p)?['vel','ctl','brk','sta']:['con','pow','eye','spd','fld','arm']))p.r[k]=clamp(p.r[k]+g*(.5+R()),1,99);p.age++}
    t.roster=t.roster.filter(p=>p.age<=18);
    if(!user){const base=lg==='prem'?57:44;const need=pos=>{t.roster.push(genPlayer(base+3,pos,ri(15,16),pos==='P'?(t.roster.filter(q=>q.role==='SP').length<3?'SP':'RP'):''))};
      while(t.roster.filter(isP).length<5)need('P');for(const pos of POS)if(!t.roster.some(p=>p.pos===pos))need(pos);while(t.roster.length<16)need(pick(POS));while(t.roster.filter(p=>!isP(p)).length<10)need(pick(POS))}}
  S.season++;S.train.spot=[];
  const lg=userLg(),base=(lg==='prem'?57:44)+2,t=UT(),pool=[];
  const needP=Math.max(0,5-t.roster.filter(isP).length);
  for(let i=0;i<needP+2;i++)pool.push(genPlayer(base,'P',ri(15,16),i%2?'RP':'SP'));
  while(pool.length<14)pool.push(genPlayer(base,pick(POS),ri(15,16)));
  if(sk('legend'))for(const p of pool)p.pot=clamp(p.pot+6,0,97);
  G.try={pool,picked:[]};G.screen='tryouts';render()}
function tryoutState(){const t=UT(),sel=G.try.pool.filter(p=>G.try.picked.includes(p.id)),all=t.roster.concat(sel),np=all.filter(isP).length,nb=all.length-np;
  return{n:all.length,np,nb,ok:all.length===16&&np>=4&&nb>=10,slots:16-t.roster.length}}
function finishTryouts(auto){const t=UT();
  if(auto){G.try.picked=[];const pl=G.try.pool.slice().sort((a,b)=>(b.pot+ovr(b))-(a.pot+ovr(a)));const cnt=()=>{const s=tryoutState();return s};
    for(const p of pl.filter(isP)){if(cnt().np>=5)break;G.try.picked.push(p.id)}
    for(const p of pl.filter(p=>!isP(p))){if(cnt().n>=16)break;G.try.picked.push(p.id)}
    for(const p of pl){if(cnt().n>=16)break;if(!G.try.picked.includes(p.id))G.try.picked.push(p.id)}
    return render()}
  if(!tryoutState().ok)return;
  t.roster.push(...G.try.pool.filter(p=>G.try.picked.includes(p.id)));G.try=null;autoLineup(t);startSeason(false);save();G.screen='hub';G.view='home';render()}
function save(){try{localStorage.setItem('starfall9',JSON.stringify(G.s))}catch(e){}}
function load(){try{const s=localStorage.getItem('starfall9');if(s){const o=JSON.parse(s);if(o&&o.v===1&&o.teams&&o.teams.user)return ensureStyles(o)}}catch(e){}return null}
