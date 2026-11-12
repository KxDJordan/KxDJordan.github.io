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
seal:{n:'Sealing Sinker',k:'P',res:'GB',d:'Forces a hard grounder straight at the middle infield, set up for a double play.',fx:'ghost'},
meteor:{n:'Meteor Swing',k:'O',res:'HR',d:'Launches a guaranteed home run.',fx:'fire'},
lightning:{n:'Lightning Dash',k:'O',res:'3B',d:'Rips one into the corner and flies around the bases, usually all the way to third.',fx:'bolt'},
godeye:{n:'God’s Eye',k:'O',res:'2B',d:'Reads the pitch perfectly and drives it into the gap for extra bases.',fx:'gold'},
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
const STAFFROLE={pitching:['Pitching coach',['vel','ctl','brk']],batting:['Batting coach',['con','pow','eye']],defense:['Catching & fielding coach',['fld','arm']],cond:['Conditioning coach',['spd','sta']],scout:['Head scout',[]]};
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
const BIPPOS=['P','C','1B','2B','SS','3B','LF','CF','RF'];
const RUNV=s=>23.6+s*.07,FLDV=s=>21.5+s*.085,THRV=a=>100+a*.4;// runner, fielder and throw speed in ft/s from the 0-99 ratings
let EVB=91.9,LAB=11.3,FOULB=.37,ACCF=.74;// league tuning: exit-velocity ceiling base, mean launch angle, foul rate
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
  /* ---- physical model: plays are resolved in feet and seconds from the players' ratings; the viewer replays the same timeline ---- */
  rv(r,s){return RUNV(r.r.spd*this.fm(r,s)+(has(r,'roadrunner')?10:0))*(r.os==='speedster'?1.045:1)*(s.to.id==='smallball'?1+.015*s.to.m:1)*(this.z[r.id].on&&abil(r).k==='O'?1.04:1)}
  // fielder as the simulation sees him: start spot, reaction, foot speed, reach, arm
  fs(F,pos){const p=pos==='P'?F.pit:F.field[pos],z=this.z[p.id],of=OFS.includes(pos),td=F.td,ds=pos==='P'?'':p.ds,fld=pos==='P'?p.r.fld*this.fm(p,F)+(z.on?10:0):this.fld(F,pos),arm=pos==='P'?p.r.arm*this.fm(p,F):this.arm(F,pos);
    let spd=FLDV(p.r.spd*this.fm(p,F)+(has(p,'roadrunner')?10:0)),react=(of?.44:.42)-(fld-50)*.004+(pos==='P'?.3:pos==='C'?.4:0),reach=of?3:3.2,lay=3,xfer=(of?1.08:.72)-(fld-50)*.003,thr=THRV(arm)*(of?1.05:1);
    if(ds==='ballhawk'){react-=.07;spd*=1.04}else if(ds==='vacuum'){react-=.035;reach+=.8}else if(ds==='acrobat')lay+=3;else if(ds==='rocket'){thr*=1.16;xfer-=.12}
    if(td.id==='nofly'&&of){react-=.1*td.m;spd*=1+.05*td.m}if(td.id==='groundpound'&&!of){react-=.02*td.m;xfer-=.04*td.m}if(td.id==='lockdown')thr*=1+.03*td.m;
    const zb=z.on&&!z.used&&(p.zone==='skythief'?of:p.zone==='ironwall'&&IFS.includes(pos)),f={pos,p,x:FPOS[pos][0],y:FPOS[pos][1],spd,react,reach,lay,leap:10.5,fld,arm,thr,xfer,ds,of,zb,s0:spd,r0:react,l0:lay};
    if(zb){f.spd*=1.5;f.react=Math.max(.08,react-.2);f.lay+=6;f.leap=17}return f}
  /* ---- running game ---- */
  // A runner goes when his own read of lead + jump + speed beats the pitcher's delivery plus the catcher's pop time.
  stealPlan(B,F,pit,ps){const [a,c,d]=this.bases;let r,from;if(a&&!c){r=a;from=1}else if(c&&!d){r=c;from=2}else return null;
    const cat=F.field.C,gl=B.user&&sk('greenlight'),v=this.rv(r,B),spd=r.r.spd+(has(r,'roadrunner')?10:0),sm=B.to.id==='smallball'?B.to.m:0,ld=F.td.id==='lockdown'?F.td.m:0,sp=r.os==='speedster';
    const lead=(from===2?13:10)+(spd-50)*.05+1.2*sm-1.2*ld-(isL(pit)&&from===1?1.2:0)+(sp?.8:0),jump=.24-(spd-50)*.002-(sp?.035:0)-.03*sm,tr=jump+.3+(90-lead)/v;
    const del=1.4-(ps.vel-50)*.004-(pit.ps==='painter'?.03:0)-.05*ld,pop=(2.03-(this.arm(F,'C')-50)*.007-(cat.ds==='rocket'?.1:cat.ds==='general'?.05:0)-.07*ld)*(from===2?.8:1),need=-.1-(gl?.05:0)-(B.user?this.approach*.03:0)-(sp?.03:0)-.05*sm-(this.outs===2?.02:0)+(d&&from===1?-.04:0);
    if(del+pop-tr<need||R()>(from===2?.2:.3)+(cat.ds==='general'?-.12:0))return null;
    return{r,from,n:R()<.5?1:R()<.6?2:3,lead,jump,tr,del,pop,v}}
  doSteal(B,F,bi,pl,ev,pe){const r=pl.r,from=pl.from,[a,c,d]=this.bases,cat=F.field.C,to=from+1,hard=HARD[pe.ty];
    const jump=Math.max(.08,pl.jump+gs()*.05),tr=jump+.3+(90-pl.lead)/pl.v,thr=!(from===1&&d&&R()<.5),del=pl.del+(hard?-.02:.05),pop=pl.pop+gs()*.085+(pe.loc[1]<-1?.08:0),tA=del+pop;
    const ok=!thr||tr<tA+.06,close=thr&&Math.abs(tr-tA-.06)<.12,dbl=from===2&&a?a:null,runs=[{pid:r.id,from,to,out:!ok,ts:jump,t1:tr,lead:pl.lead}];
    const nb=[a,c,d];nb[from-1]=null;if(ok)nb[to-1]=r;else{this.outs++;this.box[F.pit.id].po++}
    if(dbl){nb[0]=null;nb[1]=dbl;const v2=this.rv(dbl,B);runs.push({pid:dbl.id,from:1,to:2,out:false,ts:jump+.12,t1:jump+.42+80/v2,lead:10});this.box[dbl.id].sb++}
    this.bases=nb;this.box[r.id][ok?'sb':'cs']++;
    const n=sn(r),desc=!thr?`${n} takes second. No throw.`:dbl?(ok?`Double steal! ${n} and ${sn(dbl)} both move up.`:`${n} is cut down at third on the double steal.`):ok?`${n} steals ${BASEN[to]}${close?' just ahead of the tag':''}!`:`${n} is thrown out stealing ${BASEN[to]}${close?' by a step':''}.`;
    ev.push({t:'steal',pid:r.id,ok,side:bi,runs,thr:thr?to:0,close,jump,outs:this.outs,bases:this.ids(),desc,sim:{del,rel:del-.44,tT:del+pop*.36,tA},pitch:pe});
    if(!ok)this.gF(cat,F,16,ev);else this.gB(r,B,8,ev)}
  tryPick(B,F,bi,ev){const r=this.bases[0];if(!r||this.bases[1])return;const spd=r.r.spd+(has(r,'roadrunner')?10:0),cat=F.field.C,ld=F.td.id==='lockdown'?F.td.m:0,sm=B.to.id==='smallball'?B.to.m:0;
    if(R()>=(spd>58||r.os==='speedster'?.07:.02))return;
    const v=this.rv(r,B),lead=10+(spd-50)*.05+1.2*sm+(r.os==='speedster'?.8:0)+Math.abs(gs())*1.6,ret=.27+gs()*.06+(lead-4)/(v*.62),thr=.99-.07*ld-(isL(F.pit)?.07:0)-(cat.ds==='general'?.03:0)+gs()*.06,out=ret>thr;
    if(out){this.bases[0]=null;this.outs++;this.box[F.pit.id].po++;this.box[r.id].cs++}
    ev.push({t:'pick',pid:r.id,side:bi,base:1,out,lead,outs:this.outs,bases:this.ids(),desc:out?`${sn(r)} is picked off first!`:`${sn(F.pit)} throws over. ${sn(r)} dives back safely.`})}
  /* ---- pitches ---- */
  pickPitch(pit,ps,b,s){const rep=pit.pitches&&pit.pitches.length?pit.pitches:['FB'],W=[.5,.26,.16,.08];let tot=0;const w=[];
    for(let i=0;i<rep.length;i++){let v=W[i]||.05;const h=HARD[rep[i]];
      if(s===2&&!h)v*=1.6;if(b-s>=2&&i===0)v*=1.9;if(ps.tired>2&&i===0)v*=1.4;if(pit.ps==='flame'&&h)v*=1.2;if(pit.ps==='craft'&&!h)v*=1.25;w.push(v);tot+=v}
    let r=R()*tot,i=0;for(;i<w.length-1;i++)if((r-=w[i])<0)break;return rep[i]}
  // One pitch: the pitcher picks a target for the count, misses it by his command, and the ball ends up where it ends up.
  // loc/tgt are strike-zone units from the catcher's view: |x|<=1 and |z|<=1 is a strike, +x is the first-base side, +z is up.
  throwPitch(pit,ps,b,s,M){const ty=M.ty||this.pickPitch(pit,ps,b,s),P=PITCH[ty]||PITCH.FB,lh=isL(pit),sg=lh?-1:1,hard=HARD[ty],pst=pit.ps;
    const mph=Math.round(lerp(P.mph[0],P.mph[1],clamp((ps.vel-25)/62,0,1.08))+gs()*1.2+(M.mph||0)),bk=.75+clamp(ps.brk+(M.brk||0),20,130)*.006;
    let tx,tz;const u=R(),side=-sg*(hard?(R()<.5?1:-1):(R()<.75?1:-1)),vz=hard&&ty!=='SI'?(R()<.62?1:-1):(R()<.85?-1:1);
    if(M.paint){tx=side*.8;tz=vz*.55}
    else if(b>=3||b-s>=2){tx=gs()*.3;tz=gs()*.3}// behind in the count: challenge him
    else if(s===2&&b<3&&u<(pst==='craft'?.68:pst==='flame'?.5:.55)){if(R()<.6){tx=gs()*.4;tz=vz*1.22}else{tx=side*1.22;tz=gs()*.4+vz*.2}}// ahead: make him chase
    else{const e=pst==='painter'?.84:.7;if(R()<.5){tx=side*e;tz=vz*(.25+R()*.5)}else{tx=side*(.2+R()*.5);tz=vz*e}}
    const sig=M.paint?.07:clamp(.74-(ps.ctl-50)*.0068+(pst==='flame'?.015:pst==='painter'?-.09:0)+M.sig+(hard?-.02:.035),.2,1.05);
    const x=tx+gs()*sig,z=tz+gs()*sig*1.08;
    return{t:'pitch',res:null,b,s,fx:null,ty,mph,loc:[+x.toFixed(3),+z.toFixed(3)],tgt:[+clamp(tx,-1.3,1.3).toFixed(3),+clamp(tz,-1.3,1.3).toFixed(3)],brk:[+(-sg*P.brk[0]*bk).toFixed(1),+(P.brk[1]*bk).toFixed(1)],n:0,pc:this.box[pit.id].np,lhp:lh,sw:false,go:false,frame:false}}
  /* ---- balls in play ---- */
  // Flies the ball, lets every fielder run for it, then lets runners and throws race. Returns the result plus the timeline (sim) the viewer replays.
  bip(B,F,p,ev,la,spray,M){
    const S={ball:[],fld:{},run:[],calls:[],dur:0,hr:false},sa=spray*Math.PI/180,dx=Math.sin(sa),dy=Math.cos(sa),fen=fenceR(sa),o0=this.outs,[ba,bc,bd]=this.bases,TD=F.td,tdm=TD.m,TO=B.to,tom=TO.m;
    const FSl=[];for(const pos of BIPPOS)FSl.push(this.fs(F,pos));const by=pos=>FSl[BIPPOS.indexOf(pos)];
    const FL=f=>S.fld[f.pos]||(S.fld[f.pos]={st:[FPOS[f.pos][0],FPOS[f.pos][1]],mv:[],act:[]});
    const go=(f,to,t0,t1)=>{FL(f).mv.push({t0,t1:Math.max(t1,t0+.06),to:[to[0],to[1]]});f.x=to[0];f.y=to[1]},act=(f,t,k,face)=>FL(f).act.push({t,k,face});
    const mvt=(f,d)=>d<=0?0:d/f.spd+(f.of?.18:ACCF)*(1-Math.exp(-d/10)),dst=(f,pt)=>Math.hypot(f.x-pt[0],f.y-pt[1]),tthr=(d,thr)=>d/thr*(1+d/700),BX=BASEXY;
    const errP=f=>clamp(.02-(f.fld-50)*.0007,.004,.06)*(f.ds==='vacuum'?.5:1)*(TD.id==='groundpound'||TD.id==='lockdown'?1-.35*tdm:1);
    // runners, lead runner first; the batter is last
    const agg=(TO.id==='smallball'?.12*tom:0)-(TD.id==='lockdown'?.06*tdm:0),rn=[];
    const mkR=(r,b)=>{const spd=r.r.spd+(has(r,'roadrunner')?10:0),v=this.rv(r,B)*(b===0&&M.sprint||1),lead=b?9+(spd-50)*.05:0;return{p:r,b,v,lead,ts:b?.12:(isL(r)?.22:.3)-(r.os==='speedster'?.08:0),dest:b,out:null,legs:[],agg:agg+(r.os==='speedster'?.05:0)+(b===0&&p.os==='gap'?.04:0),forced:false,held:false}};
    if(bd)rn.push(mkR(bd,3));if(bc)rn.push(mkR(bc,2));if(ba)rn.push(mkR(ba,1));const bat=mkR(p,0);rn.push(bat);
    const arr=(r,b)=>r.ts+(r.b?.3:.62)+((b-r.b)*90-r.lead)/r.v+(b-r.b-1)*.14;
    let type,code,fpos=null,outs=0,dive=false,robbed=null,usedD=null,thr=null,kind,runsIn=0,err=false,fc=false,lastOutForce=false;const outT=[];
    const putOut=(r,t,base,force)=>{r.out={t,base};outs++;outT.push(t);lastOutForce=!!force;S.calls.push({t,base,out:true,at:base?BX[base]:null,pid:r.p.id})};
    // ---------- ball flight ----------
    const air=la>=8;let T=0,L=null,pick=null,tR=0,Rp=null;
    if(air){const v=ev*1.467,th=la*Math.PI/180,k=clamp(.8-.008*(la-15),.5,.82)+(100-ev)*.0012,dist=v*v*Math.sin(2*th)/32.2*k,h=Math.pow(v*Math.sin(th),2)/64.4*.8;T=2*v*Math.sin(th)/32.2*.95;
      kind=la<20?'L':la>50&&dist<170?'P':'F';
      const fAt=d=>1-Math.pow(1-clamp(d/dist,0,1),1/1.12),zAt=f=>3*(1-f)+4*h*f*(1-f),seg={k:'air',t0:0,t1:T,a:[0,1.5,3],b:[dx*dist,dy*dist,0],h};S.ball.push(seg);
      const two=o0===2;for(const r of rn)if(r.b)r.ts=two?.12:kind==='L'?.55:T*.62;
      let wallF=0,over=false;if(dist>fen-1){wallF=fAt(fen-1);over=zAt(wallF)>9}
      // who can catch it, and how comfortably (m = seconds to spare)
      let best=null,bm=-9,bpt=null,bt=0,bz=0;
      const fc0=wallF||clamp(1-6.5/(3+4*h),.35,1),cd=wallF?fen-2.5:dist*(1-Math.pow(1-fc0,1.12)),cpt=[dx*cd,dy*cd],ct=fc0*T,cz=wallF?zAt(wallF):6;
      for(const f of FSl){if(f.pos==='C'&&cd>70)continue;
        let m=-9,pt=cpt,t=ct,z=cz;if(!(wallF&&cz>f.leap)){m=ct-(f.react+mvt(f,dst(f,cpt)-f.reach))}
        if(!f.of&&la<24){const d0=f.x*dx+f.y*dy;if(d0>25&&d0<cd){const fi=fAt(d0),zi=zAt(fi);if(zi<=f.leap-2){const m2=fi*T-(f.react*.72+mvt(f,Math.abs(f.x*dy-f.y*dx)-f.reach));if(m2>m||m2>-f.lay/f.spd){m=m2;pt=[dx*d0,dy*d0];t=fi*T;z=zi}}}}
        if(m>bm){bm=m;best=f;bpt=pt;bt=t;bz=z}}
      let caught=false;
      if(best){const f=best,m=bm,hi=bz>7.6;let P=0;
        if(m>=.3)P=1-errP(f)*.35;else if(m>=0)P=clamp(.7+m+(f.fld-50)*.006,.35,.985);else if(m+f.lay/f.spd>=0){P=clamp(.34+(f.fld-50)*.009+(f.ds==='acrobat'||f.ds==='ballhawk'?.1:0),.05,.82);dive=true}
        if(f.zb&&P>0)P=1;if(hi&&!f.zb&&P>0)P*=wallF?.6+(f.fld-50)*.008:.92;
        const tf=f.react+mvt(f,dst(f,bpt)-f.reach);if(P>0||m>-1.2)go(f,bpt,f.react,Math.min(bt,Math.max(tf,f.react+.1)));
        if(P>0&&R()<P){caught=true;fpos=f.pos;seg.te=bt;seg.cz=dive?1.6:hi?bz:6.2;if(m>=0&&m<.12)dive=true;
          act(f,bt,hi&&wallF?'jump':dive?'dive':hi?'jump':'catch');
          if(f.zb){const m0=bt-(f.r0+Math.max(0,Math.hypot(FPOS[f.pos][0]-bpt[0],FPOS[f.pos][1]-bpt[1])-f.reach)/f.s0);if(m0+f.l0/f.s0<0||bz>10.5){usedD=f.p;robbed=over?'HR':'hit'}}
          else if(over)robbed='HR';
          type=kind==='L'?'LO':'FO';code=type;T=bt;bat.out={t:bt,base:0};outs++;outT.push(bt);S.calls.push({t:bt,base:0,out:true,at:bpt,pid:p.id,catch:true});
          // tag-ups: go if the runner thinks he beats the throw
          if(o0+1<3&&f.of){let ahead=5,tgt=null;for(const r of rn){if(r===bat)continue;r.ts=bt+.08;r.lead=0;const nb=r.b+1;if(nb>=ahead){ahead=r.b;continue}
              const B2=BX[nb],dd=Math.hypot(B2[0]-bpt[0],B2[1]-bpt[1]),tt=bt+f.xfer+(dive?.8:0)+tthr(dd,f.thr)+(dd>250?.5:0),ta=arr(r,nb);
              if(ta+.1-r.agg<tt+gs()*.2&&(nb===4||dd>170)){r.dest=nb;if(!tgt)tgt={r,nb,tt,ta,dd};if(nb<4)ahead=nb}else ahead=r.b}
            if(tgt){const tA=tgt.tt+gs()*.1,to=BX[tgt.nb];act(f,tA-tthr(tgt.dd,f.thr),'throw',to);S.ball.push({k:'thr',t0:tA-tthr(tgt.dd,f.thr),t1:tA,a:[bpt[0],bpt[1],5.4],b:[to[0],to[1],3.6],h:tgt.dd*.03});
              const cv=by(tgt.nb===4?'C':tgt.nb===3?'3B':sa<0?'2B':'SS');if(cv!==f){go(cv,cvSpot(tgt.nb),.4,Math.min(tA-.3,1.6));act(cv,tA,'tag',bpt)}
              if(tA+.08<tgt.ta){putOut(tgt.r,tgt.ta,tgt.nb,false);tgt.r.slide=1;thr={to:tgt.nb,out:true,pid:tgt.r.p.id}}else{tgt.r.slide=1;thr={to:tgt.nb,out:false,pid:tgt.r.p.id};S.calls.push({t:Math.max(tA,tgt.ta),base:tgt.nb,out:false,at:to,pid:tgt.r.p.id})}}}
        }else if(P>0){if(dive){act(f,bt,'dive');f.down=1.1}else{act(f,bt,'catch');err=m>=.3;f.down=.9}dive=false}
      }
      if(!caught){
        if(over){type=code='HR';S.hr=true;seg.b=[dx*dist,dy*dist,dist>fen+45?34:20];fpos=Math.abs(spray)<15?'CF':spray<0?'LF':'RF';const f=by(fpos);if(!S.fld[fpos])go(f,[dx*(fen-7),dy*(fen-7)],f.react,Math.min(T*.85,f.react+dst(f,[dx*(fen-7),dy*(fen-7)])/f.spd));act(f,T,'look')}
        else{// drops in: bounce and roll, nearest outfielders give chase
          const ld=wallF?fen-3:dist,tl=wallF?wallF*T+.15:T,vh=wallF?30:dist/T*.7*(kind==='L'?.6:.42),k2=1,rmax=wallF?-17:Math.min(vh/k2*.97,fen-2.5-ld);L=[dx*ld,dy*ld];if(wallF)seg.te=wallF*T,seg.cz=zAt(wallF);
          const posT=f=>{if(f===best)return;const t=Math.max(0,tl-f.react),d=dst(f,L),k=d>1?Math.min(1,t*f.spd*.85/d):1;if(k>.02)go(f,[f.x+(L[0]-f.x)*k,f.y+(L[1]-f.y)*k],f.react,tl)};
          const ch=FSl.filter(f=>f.pos!=='C'&&f.pos!=='P').sort((u,v)=>dst(u,L)-dst(v,L)).slice(0,2);for(const f of ch)posT(f);
          let bestT=1e9;const steps=14;
          for(const f of ch){const t0=tl+(f.down||0);for(let i=0;i<=steps;i++){const s=rmax*i/steps,tb=tl+(Math.abs(s)<.5?0:-Math.log(1-k2*Math.abs(s)/vh)/k2),pt=[dx*(ld+s),dy*(ld+s)],tf=t0+mvt(f,dst(f,pt)-f.reach);
              if(tf<=tb||i===steps){const t=Math.max(tb,tf);if(t<bestT){bestT=t;pick=f;Rp=pt}break}}}
          tR=bestT;fpos=pick.pos;if(Math.hypot(Rp[0]-L[0],Rp[1]-L[1])>1)S.ball.push({k:'roll',t0:tl,t1:tR,a:[L[0],L[1],.3],b:[Rp[0],Rp[1],.3],h:kind==='L'?2.6:3.4,n:2});
          go(pick,Rp,tl+(pick.down||0),tR);act(pick,tR,'field')}}
    }else{// ---------- ground ball ----------
      kind='G';const v0=ev*1.467*Math.cos(la*Math.PI/180)*(la<0?.8+la*.007:.88),kg=.24,dmax=v0/kg*.97,tb=d=>-Math.log(1-kg*d/v0)/kg;
      for(const r of rn)if(r.b)r.ts=.12;
      let bf=null,bt=1e9,bd0=0,bm=0;
      for(const f of FSl){if(f.of)continue;const d0=Math.max(12,f.x*dx+f.y*dy),lat=Math.abs(f.x*dy-f.y*dx);if(d0>dmax||(f.pos==='C'&&d0>30))continue;
        const m=tb(d0)-(f.react+mvt(f,lat-f.reach));if(m<-f.lay/f.spd)continue;
        let de=d0;if(m>0)for(let d=Math.max(14,d0-50);d<d0;d+=5){if(f.react+mvt(f,Math.hypot(f.x-dx*d,f.y-dy*d)-f.reach)<=tb(d)){de=d;break}}
        const t=tb(de);if(t<bt){bt=t;bf=f;bd0=de;bm=m}}
      let through=!bf,slow=1;
      if(bf){const f=bf,pt=[dx*bd0,dy*bd0];let P=1;if(bm<0){P=clamp(.42+(f.fld-50)*.009+(f.ds==='acrobat'?.14:0),.08,.88);dive=true}else if(bm<.1)P=clamp(.84+(f.fld-50)*.005,.5,.98);if(f.zb)P=1;
        go(f,pt,f.react,bt);
        if(R()<P){if(f.zb){const m0=tb(bd0)-(f.r0+Math.max(0,Math.hypot(FPOS[f.pos][0]-pt[0],FPOS[f.pos][1]-pt[1])-f.reach)/f.s0);if(m0<-f.l0/f.s0){usedD=f.p;robbed='hit'}}
          act(f,bt,dive?'dive':'field');S.ball.push({k:'roll',t0:0,t1:bt,a:[0,1.2,2.4],b:[pt[0],pt[1],.35],h:2.3,n:3});pick=f;Rp=pt;tR=bt+(dive?.75:0);fpos=f.pos;
          if(!f.zb&&R()<errP(f)*(ev>100?1.35:1)*(dive?.5:1)){err=true;tR+=1.25;const p2=[pt[0]+dx*7+5,pt[1]+dy*7];S.ball.push({k:'roll',t0:bt,t1:bt+.6,a:[pt[0],pt[1],1.4],b:[p2[0],p2[1],.3],h:2,n:2});go(f,p2,bt+.25,bt+1);act(f,bt+1.05,'field');Rp=p2}
        }else{through=true;slow=.85;act(f,bt,'dive');dive=false}}
      if(through){// into the outfield
        const v1=v0*slow,end=Math.min(v1/kg*.97,fen-3),tb2=d=>-Math.log(1-kg*d/v1)/kg;let bestT=1e9;
        for(const f of FSl){if(!f.of)continue;const d0=clamp(f.x*dx+f.y*dy,150,end);for(let d=Math.max(150,d0-80);;d+=8){const dd=Math.min(d,end),pt=[dx*dd,dy*dd],tf=f.react+mvt(f,dst(f,pt)-f.reach),tq=tb2(dd);
            if(tf<=tq||dd>=end){const t=Math.max(tf,tq);if(t<bestT){bestT=t;pick=f;Rp=pt}break}}}
        tR=bestT;fpos=pick.pos;S.ball.push({k:'roll',t0:0,t1:tR,a:[0,1.2,2.4],b:[Rp[0],Rp[1],.35],h:2.2,n:4});go(pick,Rp,pick.react,tR);act(pick,tR,'field')}
    }
    function cvSpot(b){const q=BX[b];return b===4?[0,1.5]:b===1?[q[0]-1.5,q[1]+.5]:b===3?[q[0]+1.5,q[1]+.5]:[q[0],q[1]-1.5]}
    const throwTo=(f,from,b,t0,thrower)=>{const to=BX[b],dd=Math.hypot(to[0]-from[0],to[1]-from[1]),tf=tthr(dd,f.thr)+(dd>250?.5:0),cvp=b===4?'C':b===1?(f.pos==='1B'?'P':'1B'):b===3?'3B':(f.pos==='SS'||f.pos==='3B'||sa<0&&f.of?'2B':'SS'),cv=by(cvp);
      act(f,t0,'throw',to);S.ball.push({k:'thr',t0,t1:t0+tf,a:[from[0],from[1],5.4],b:[to[0],to[1],3.6],h:dd*.03});if(cv!==f&&dst(cv,cvSpot(b))>2)go(cv,cvSpot(b),Math.min(.35,t0),Math.max(.6,Math.min(t0+tf-.25,cv.react+dst(cv,cvSpot(b))/cv.spd)));return{t:t0+tf,cv}};
    // ---------- runners against the throw ----------
    const loose=type!=='HR'&&type!=='FO'&&type!=='LO'&&pick&&(air||pick.of);
    if(type==='HR'){for(const r of rn){r.dest=4;r.jog=true}}
    else if(type==='FO'||type==='LO'){}
    else if(loose){// the ball is loose (dropped in, or through the infield): runners take what the throw allows
      const f=pick,tt=b=>{const q=BX[b],dd=Math.hypot(q[0]-Rp[0],q[1]-Rp[1]);return tR+f.xfer+tthr(dd,f.thr)+(dd>250?.5:0)};let ahead=5;const cand=[];
      for(const r of rn){let b=r.b;const min=r===bat?1:(r.b===1||r.b===2&&ba||r.b===3&&ba&&bc)?r.b+1:r.b;
        for(;;){const nb=b+1;if(nb>4||nb>=ahead)break;if(b<min||arr(r,nb)+.08-r.agg<tt(nb)+gs()*.18)b=nb;else break}
        r.dest=b;if(b<4)ahead=b;if(b>r.b&&arr(r,b)>tR)cand.push(r)}
      // the fielder throws where he has the best chance of an out
      let play=null;for(const r of cand){const tA=tt(r.dest)+gs()*.1+(50-f.arm)*.002,mrg=arr(r,r.dest)-tA-.08;if(mrg<-.5||r===bat&&r.dest===1&&mrg<=0)continue;if(!play||(mrg>0)!==(play.mrg>0)?mrg>0:r.dest>play.r.dest)play={r,tA,mrg}}
      const o=throwTo(f,Rp,play?play.r.dest:bat.dest>=3?3:2,tR+f.xfer);
      if(play){const r=play.r,to=BX[r.dest];act(o.cv,play.tA,'tag',Rp);S.ball[S.ball.length-1].t1=play.tA;r.slide=1;
        if(play.mrg>0){putOut(r,arr(r,r.dest),r.dest,false);thr={to:r.dest,out:true,pid:r.p.id};r.dest--}else{thr={to:r.dest,out:false,pid:r.p.id};S.calls.push({t:Math.max(play.tA,arr(r,r.dest)),base:r.dest,out:false,at:to,pid:r.p.id})}}
      else act(o.cv,o.t,'recv',Rp);
      if(err)type=code='E';else{const hb=bat.dest;type=code=hb>=3?'3B':hb===2?'2B':hb===1?'1B':'GO';if(hb>=2&&!bat.out&&!bat.slide)bat.slide=hb===3||R()<.35?1:0}
    }else if(pick){// ---------- infield play ----------
      const f=pick,un=(b)=>Math.hypot(BX[b][0]-Rp[0],BX[b][1]-Rp[1]),tT=b=>un(b)<13?tR+un(b)/f.spd+.1:tR+f.xfer+tthr(un(b),f.thr),r1=rn.find(r=>r.b===1),r2=rn.find(r=>r.b===2),r3=rn.find(r=>r.b===3);
      if(r1){r1.forced=true;if(r2){r2.forced=true;if(r3)r3.forced=true}}
      const tb1=arr(bat,1);for(const r of rn)if(r.forced)r.dest=r.b+1;bat.dest=1;
      const doThrow=(b)=>{if(un(b)<13){go(f,cvSpot(b),tR,tT(b));return{t:tT(b),cv:f}}return throwTo(f,Rp,b,tR+f.xfer)};
      if(err){type=code='E';if(r3&&!r3.forced&&o0===2)r3.dest=4;if(r2&&!r2.forced)r2.dest=3}
      else{
        // unforced runners decide on contact
        if(r3&&!r3.forced&&(o0===2||!['P','3B','1B'].includes(f.pos)&&R()<.5+(r3.p.r.spd-50)*.01+r3.agg))r3.dest=4;
        if(r2&&!r2.forced&&!(r3&&r3.dest===3)&&(o0===2||f.pos==='2B'||f.pos==='1B'))r2.dest=3;
        const pv=by(f.pos==='SS'||f.pos==='3B'?'2B':'SS'),piv=.85+gs()*.15-(pv.fld-50)*.003-(pv.ds==='acrobat'?.1:0)-(TD.id==='groundpound'?.05*tdm:0),slideIn=r=>r?(r.p.r.spd-50)*.002+(TO.id==='smallball'?.1*tom:0):0;
        let done=false;
        if(o0<2&&r3&&r3.forced&&tT(4)<arr(r3,4)-.03){const o=doThrow(4);putOut(r3,o.t,4,true);act(o.cv,o.t,'recv',Rp);const t1=o.t+.55+tthr(90,o.cv.thr);if(t1<tb1){act(o.cv,o.t+.55,'throw',BX[1]);S.ball.push({k:'thr',t0:o.t+.55,t1,a:[0,1,5.4],b:[BX[1][0],BX[1][1],3.6],h:2.6});go(by('1B'),cvSpot(1),.2,1.2);act(by('1B'),t1,'recv',[0,0]);putOut(bat,t1,1,true);code='DP'}else{code='FC';fc=true}type='GO';done=true}
        else if(o0<2&&r1&&tT(2)<arr(r1,2)-.02){const o=doThrow(2);putOut(r1,o.t,2,true);r1.slide=1;const cv=o.cv===f?f:o.cv,tp=o.t+piv+slideIn(r1),t1=tp+tthr(90,cv.thr);act(cv,o.t,'recv',Rp);
          if(t1<tb1&&!(f.pos==='1B'&&false)){act(cv,tp,'throw',BX[1]);S.ball.push({k:'thr',t0:tp,t1,a:[BX[2][0],BX[2][1],5.4],b:[BX[1][0],BX[1][1],3.6],h:2.6});const fb=by(f.pos==='1B'?'P':'1B');if(fb!==f)go(fb,cvSpot(1),.2,Math.min(t1-.2,1.4));act(fb,t1,'recv',BX[2]);putOut(bat,t1,1,true);code='DP'}else{code='FC';fc=true}type='GO';done=true}
        else if(r3&&!r3.forced&&r3.dest===4&&o0<2&&tT(4)+.1<arr(r3,4)){const o=doThrow(4);act(o.cv,o.t,'tag',Rp);putOut(r3,arr(r3,4),4,false);r3.slide=1;r3.dest=3;thr={to:4,out:true,pid:r3.p.id};type='GO';code='FC';fc=true;done=true}
        if(!done){if(tT(1)<tb1){const o=doThrow(1);if(o.cv!==f)act(o.cv,o.t,'recv',Rp);putOut(bat,o.t,1,true);type=code='GO'}
          else{const alt=[[r3,4],[r2,3],[r1,2]].find(([r,b])=>r&&r.forced&&tT(b)<arr(r,b)-.02);
            if(alt){const o=doThrow(alt[1]);if(o.cv!==f)act(o.cv,o.t,'recv',Rp);putOut(alt[0],o.t,alt[1],true);type='GO';code='FC';fc=true}
            else{const o=doThrow(1);if(o.cv!==f)act(o.cv,o.t,'recv',Rp);S.calls.push({t:Math.max(o.t,tb1),base:1,out:false,at:BX[1],pid:p.id});type=code='1B'}}}
      }
    }
    // ---------- book-keeping: legs, runs, bases ----------
    const nb=[null,null,null],moves=[];let tEnd=0,rbi=0;const third=o0+outs>=3,tLast=third?outT.slice().sort((x,y)=>x-y)[2-o0]:1e9,noRun=third&&(lastOutForce||type==='FO'||type==='LO');
    for(const r of rn){const tgt=r.out?r.out.base:r.dest;if(r.jog)r.ts=r===bat?.9:.6;
      for(let b=r.b+1;b<=tgt;b++)r.legs.push({to:b,t:r.jog?0:arr(r,b)});
      if(r.out&&r.out.base===0)r.legs.push({to:1,t:arr(r,1)});
      if(r.out)moves.push({pid:r.p.id,from:r.b,to:r.out.base||1,out:true,tag:r.out.base>1&&!lastOutForce});
      else if(r.dest>r.b){moves.push({pid:r.p.id,from:r.b,to:r.dest});if(r.dest===4){if(!noRun&&(!third||arr(r,4)<tLast||r.jog)){runsIn++;this.box[r.p.id].r++;r.scored=true}}else nb[r.dest-1]=r.p}
      else if(r.b)nb[r.b-1]=r.p;
      if(r.legs.length&&!r.jog)tEnd=Math.max(tEnd,r.legs[r.legs.length-1].t);
      S.run.push({pid:r.p.id,b:r.b,ts:r.ts,lead:r.lead,legs:r.legs,out:r.out,slide:r.slide||0,jog:!!r.jog,scored:!!r.scored})}
    rbi=code==='E'||code==='DP'?0:runsIn;if(type==='FO'&&runsIn&&!third)code='SF';
    for(const s of S.ball)tEnd=Math.max(tEnd,s.te||s.t1);for(const c of S.calls)tEnd=Math.max(tEnd,c.t);S.dur=tEnd+.9;
    return{type,code,fpos,outs,runs:runsIn,rbi,nb,moves,thr,dive,robbed,usedD,kind,err,S,bb:{kind,ev:Math.round(ev),la:Math.round(la),spray:+spray.toFixed(1),dist:Math.round(air?Math.hypot(S.ball[0].b[0],S.ball[0].b[1]):Rp?Math.hypot(Rp[0],Rp[1]):0)}}}
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
    // Zone abilities do not pick a result; they push the inputs of this plate appearance to the extreme and the play is still simulated.
    let off=null,pab=null,mind=false,fx=null,usedA=null;
    const fire=(q,side,a)=>{usedA=a;fx=ABIL[a].fx;ev.push({t:'ability',pid:q.id,side,a});this.moments.push({pid:q.id,side,txt:'unleashed '+ABIL[a].n})};
    if(zb.on&&!zb.used&&ab.k==='O'&&R()<.75){zb.used=true;off=p.zone;fire(p,bi,p.zone)}
    else if(zp.on&&!zp.used&&R()<.4){zp.used=true;pab=pit.zone;fire(pit,fi,pit.zone)}
    else{const zc=this.z[cat.id];if(zc.on&&!zc.used&&cat.zone==='mind'&&R()<.3){zc.used=true;mind=true;fire(cat,fi,'mind')}}
    const bs=this.bst(B,p,bi),ps=this.pst(F),apr=B.user?this.approach:0,os=p.os,pst=pit.ps,TO=B.to.id,tom=B.to.m,TD=F.td.id,tdm=F.td.m,lhb=isL(p);
    const pM={ty:null,mph:0,brk:0,sig:TD==='power'?.01:TD==='lockdown'?-.045*tdm:0,paint:mind};let stuffAdd=0;
    if(pab==='dragon'){pM.ty='FB';pM.mph=7;stuffAdd=75;pM.paint=true}else if(pab==='phantom'){pM.ty='CU';pM.brk=70;stuffAdd=75;pM.paint=true}else if(pab==='comet'){pM.ty='SL';pM.brk=50;stuffAdd=75;pM.paint=true}else if(pab==='seal'){pM.ty='SI';pM.brk=45;pM.paint=true}
    const eyeW=clamp(.36-(bs.eye-50)*.005,.13,.66)*(os==='patient'?.7:1)*(TO==='grinders'?1-.22*tom:1),frame=cat.ds==='general'?.07:0,grind=TO==='grinders'?.19*tom:0,foul2=(os==='patient'?.07:0)+(TO==='grinders'?.05*tom:0);
    const cA=(os==='contact'?.045:os==='slugger'?-.05:0)+(TO==='bombers'?-.03:TO==='linedrive'?.03*tom:TO==='smallball'?.012*tom:0)+(pst==='ground'?.03:pst==='painter'?.012:0);
    let balls=0,strikes=0,res=null,np=0,looking=false,hit=null;const plan=off||pab||mind?null:this.stealPlan(B,F,pit,ps);
    while(!res){
      px.np++;px.fx+=grind;np++;
      const e=this.throwPitch(pit,ps,balls,strikes,pM),hard=HARD[e.ty],x=e.loc[0],z=e.loc[1],dist=Math.max(Math.abs(x),Math.abs(z)),inZ=dist<=1;
      const stf=(hard?ps.vel*.75+ps.brk*.25:ps.brk*.75+ps.vel*.25)+stuffAdd+(TD==='power'?6*tdm:0)+(pst==='flame'&&hard?8:pst==='craft'&&!hard?3:0);
      const goNow=plan&&plan.n===np&&strikes<2&&balls<3&&this.bases[plan.from-1]===plan.r&&!this.bases[plan.from];
      let sw=false;
      if(!goNow&&!mind){
        if(off)sw=dist<1.5;else if(pab==='seal')sw=R()<.93;
        else{const dec=dist>1?(hard?0:.1+(ps.brk-50)*.003)+(pst==='craft'?.06:0):0,A=.9+apr*.08+(strikes===2?.04:0)+(balls===3&&strikes<2?-.22:0)+(balls+strikes===0?-.07:0)+(os==='patient'?-.03:os==='slugger'?.04:0)+(TO==='grinders'?-.01*tom:0);
          sw=R()<clamp(A/(1+Math.exp(-(1.06-dist+dec-(os==='patient'?.02:0)-(TO==='grinders'?.015*tom:0))/eyeW)),.02,.96)}}
      e.sw=sw;e.go=!!goNow;if(pab||mind)e.fx=fx;
      if(!sw){if(inZ||dist<=1+frame&&R()<.65){if(!inZ){e.frame=true;const k=.99/dist;e.loc=[+(x*k).toFixed(3),+(z*k).toFixed(3)]}strikes++;e.res='called';if(strikes>=3){res='K';looking=true}}else{balls++;e.res='ball';if(balls>=4)res='BB'}}
      else if(R()>=(off||pab==='seal'?1:stuffAdd?.02:clamp(.852+(bs.con-stf)*.0046-Math.max(0,dist-.75)*.3-(hard?0:.025)+cA-(strikes===2&&has(pit,'fang')?.07:0),.04,.985))){strikes++;e.res='swing';if(strikes>=3)res='K'}
      else{// contact: how squarely he met it decides exit velocity and launch angle; timing decides where it goes
        const sq=clamp(1-Math.abs(gs())*(.42+(stf-bs.con)*.004+Math.max(0,dist-.6)*.35),0,1),pull=lhb?1:-1;
        const evMax=EVB+bs.pow*.25+(os==='slugger'?1:os==='contact'?-.8:os==='speedster'?-.4:0)+(TO==='bombers'?.7*tom:TO==='linedrive'?-.4:0)-(pst==='craft'?1.2:0)+(hard?(e.mph-88)*.1:0);
        let EV=52+(evMax-52)*(.3+.7*sq)+gs()*2,LA=LAB+(bs.pow-50)*.07+z*4.5-GBB[e.ty]*35+(os==='slugger'?3:os==='contact'?1:os==='speedster'?-1:os==='gap'?1.5:0)+(pst==='ground'?-3.5:pst==='craft'?2.5:0)+(TD==='groundpound'?-.8*tdm:TD==='nofly'?1*tdm:0)+(TO==='bombers'?1.2*tom:0)
          +gs()*(15+(1-sq)*22)*(os==='contact'?.82:os==='gap'||TO==='linedrive'?.9:1),spray=os==='gap'&&R()<.5?(R()<.5?-1:1)*16+gs()*12:pull*7+gs()*26;
        let foul=Math.abs(spray)>45||R()<FOULB+(strikes===2?.05+foul2:0)-sq*.1;
        if(off==='meteor'){EV=118+R()*4;LA=29+gs()*2;spray=pull*(14+R()*20);foul=false}
        else if(off==='lightning'){EV=108+R()*3;LA=12+R()*3;spray=(R()<.5?-1:1)*(41.5+R()*2);foul=false}
        else if(off==='godeye'){EV=99+R()*3;LA=15+R()*3;spray=(R()<.5?-1:1)*(15+R()*4);foul=false}
        else if(off==='rally'){EV=90+R()*4;LA=13+R()*3;spray=R()<.3?gs()*2:(R()<.5?-1:1)*(24+R()*2.5);foul=false}
        else if(pab==='seal'){EV=84+R()*8;LA=-9+R()*6;spray=(R()<.5?-1:1)*(10+R()*6);foul=false}
        if(foul){e.res='foul';if(strikes<2)strikes++}else{e.res='inplay';res='IP';hit={ev:clamp(EV,40,122),la:clamp(LA,-30,80),spray:clamp(spray,-44.5,44.5)}}}
      e.b=balls;e.s=strikes;e.n=np;if(off&&e.res==='inplay')e.fx=fx;ev.push(e);
      if(goNow&&(e.res==='ball'||e.res==='called')){this.doSteal(B,F,bi,plan,ev,e);if(this.outs>=3){this.endHalf(ev);return ev}}}
    const o0=this.outs,n=sn(p);let type=res,code=res,fpos=null,runs=0,rbi=0,outs=0,m=[],nb,r=null,desc;
    if(res==='IP'){r=this.bip(B,F,p,hit.ev,hit.la,hit.spray,{sprint:off==='lightning'?1.7:1});type=r.type;code=r.code;fpos=r.fpos;runs=r.runs;rbi=r.rbi;outs=r.outs;m=r.moves;nb=r.nb;
      if(r.usedD){const q=r.usedD,z=this.z[q.id];z.used=true;usedA=q.zone;ev.push({t:'ability',pid:q.id,side:fi,a:q.zone});this.moments.push({pid:q.id,side:fi,txt:'unleashed '+abil(q).n})}}
    else{const [a,c,d]=this.bases;nb=[a,c,d];
      if(res==='K')outs=1;
      else{nb=[null,null,null];const sc=(q,f)=>{m.push({pid:q.id,from:f,to:4});runs++;rbi++;this.box[q.id].r++},mv=(q,f,t)=>{m.push({pid:q.id,from:f,to:t});nb[t-1]=q};
        if(a){if(c){if(d)sc(d,3);mv(c,2,3)}else if(d)nb[2]=d;mv(a,1,2)}else{nb[1]=c;nb[2]=d}mv(p,0,1)}}
    this.outs+=outs;this.bases=nb;this.score[bi]+=runs;this.line[bi][this.line[bi].length-1]+=runs;this.halfRuns+=runs;
    if(!['BB','SF'].includes(code))bx.ab++;const isHit=['1B','2B','3B','HR'].includes(type);
    if(isHit){bx.h++;px.ph++}if(type==='HR')bx.hr++;if(type==='BB'){bx.bb++;px.pbb++}if(type==='K'){bx.k++;px.pk++}bx.rbi+=rbi;px.po+=outs;px.per+=runs;
    const dir=fpos?DIRN[fpos]:'',k=r?r.kind:'',fn=r&&fpos?sn(fpos==='P'?pit:F.field[fpos]):'',bb=r?r.bb:null,ih=type==='1B'&&fpos&&!OFS.includes(fpos),thr=r?r.thr:null,dive=r?r.dive:false,robbed=r&&r.outs?r.robbed:null;
    desc={K:`${n} strikes out ${looking?'looking':'swinging'}.`,BB:`${n} draws a walk.`,
      '1B':ih?`${n} beats out an infield single to ${dir}.`:k==='G'?`${n} grounds a single through to ${dir}.`:k==='L'?`${n} lines a single to ${dir}.`:`${n} drops a single into ${dir}.`,
      '2B':bb&&Math.abs(bb.spray)>38?`${n} rips a double down the line.`:`${n} doubles to ${dir}.`,'3B':`${n} triples to ${dir}!`,
      HR:runs===4?`GRAND SLAM! ${n} clears the bases!`:`${n} crushes a ${bb?bb.dist:400}-foot home run to ${dir}!`,
      GO:dive?`${fn} makes a diving stop and throws out ${n}.`:`${n} grounds out to ${dir}.`,DP:`${n} grounds into a double play.`,FC:`${n} reaches on a fielder's choice.`,
      FO:dive&&!robbed?`${fn} makes a diving catch on ${n}'s drive to ${dir}.`:k==='P'?`${n} pops out to ${dir}.`:`${n} flies out to ${dir}.`,SF:`${n} lifts a sacrifice fly to ${dir}.`,
      LO:dive&&!robbed?`${fn} dives to snare ${n}'s liner.`:`${n} lines out to ${dir}.`,E:`${n} reaches on an error by ${fn}.`}[code]||`${n} puts it in play.`;
    if(robbed)desc=`${fn} robs ${n} of a ${robbed==='HR'?'home run':'hit'}!`;
    if(runs&&code!=='HR')desc+=runs===1?' A run scores.':` ${runs} runs score.`;
    if(thr&&thr.out)desc+=` ${sn(B.team.roster.find(q=>q.id===thr.pid))} is thrown out at ${thr.to===4?'the plate':BASEN[thr.to]}!`;
    ev.push({t:'play',res:code,type,fpos,moves:m,runs,outs:Math.min(3,this.outs),bases:this.ids(),score:this.score.slice(),pid:p.id,side:bi,robbed,desc,abil:usedA,looking,bb,thr,dive,ih,sim:r?r.S:null});
    if(type==='HR')this.moments.push({pid:p.id,side:bi,txt:runs===4?'hit a grand slam':'homered'});
    // gauges
    this.gB(p,B,{'1B':27,'2B':33,'3B':38,HR:50,BB:11}[type]||0,ev);this.gB(p,B,rbi*8,ev);
    if(runs)for(const l of B.lineup)if(l.p!==p)this.gB(l.p,B,3,ev);
    if(usedA==='rally'&&isHit)for(const l of B.lineup)if(l.p!==p)this.gain(l.p,B,25,ev);
    if(pab==='comet')px.np=Math.max(0,px.np-12);
    if(outs){this.gain(pit,F,code==='K'?13:code==='DP'?10:4,ev);for(const pos of POS)this.gF(F.field[pos],F,pos===fpos?(code==='DP'||robbed||dive||(thr&&thr.out)?22:14):pos==='C'&&code==='K'?6:1,ev)}
    else if(isHit){const z=this.z[pit.id];if(!z.on)z.g=Math.max(0,z.g-(type==='HR'?10:4))}
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
  if(S.repSeason!==S.season){const r0=clubRep(),cw=S.cup?S.cup.r.flat().filter(t=>t.w==='user').length:0,score=clamp([100,80,65,50,38,26,14,5][rank-1]+(lg==='prem'?12:0)+cw*8+(S.cup&&S.cup.champ==='user'?6:0),0,100);
    S.rep=Math.round(lerp(r0,score,.6));S.repSeason=S.season;se.rep=S.rep;se.repD=S.rep-r0}
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
  const t=UT(),pool=[],needP=Math.max(0,5-t.roster.filter(isP).length),q=scoutInfo(),n=24+q.stars;
  for(let i=0;i<needP+5;i++)pool.push(genProspect('P',i%2?'RP':'SP',q));
  for(const pos of POS)if(!t.roster.some(p=>p.pos===pos))pool.push(genProspect(pos,'',q));
  while(pool.length<n)pool.push(genProspect(pick(POS),'',q));
  if(q.rep>=70){const st=pool.slice().sort((a,b)=>b.pot-a.pot)[0];st.pot=clamp(st.pot+8,0,97);st.star=true}
  G.try={pool,picked:[],info:q,searches:0};G.screen='tryouts';render()}
/* ---- recruiting: what drives prospect quality ---- */
const REPN=[[85,'Powerhouse'],[65,'Renowned'],[45,'Respected'],[25,'Local name'],[0,'Unknown']];
function clubRep(){const S=G.s;return S.rep==null?(userLg()==='prem'?45:30):S.rep}
const repName=r=>REPN.find(x=>r>=x[0])[1];
// Everything that shapes a tryout class: league level, club reputation (last seasons' finish and cup runs), the head scout, the Legend's Aura skill.
function scoutInfo(){const S=G.s,lg=userLg(),rp=clubRep(),sc=S.staff.scout,stars=sc?sc.stars*(sk('network')?1.25:1):0,rf=(rp-40)/60;
  const q={lg,rep:rp,repName:repName(rp),stars:sc?sc.stars:0,scout:sc?sc.name:null,lgBase:(lg==='prem'?57:44)+2,repBase:Math.round(rf*4*10)/10,repPot:Math.round(rf*5*10)/10,scBase:Math.round(stars*.4*10)/10,scPot:Math.round(stars*1.2*10)/10,legend:sk('legend')?6:0,fitChance:clamp(.4+stars*.08,0,.85)};
  q.base=q.lgBase+q.repBase+q.scBase;q.pot=q.repPot+q.scPot+q.legend;return q}
const fitsTeam=(p,t)=>isP(p)?TDEF[t.style.def].fit.includes(p.ps):TOFF[t.style.off].fit.includes(p.os)||TDEF[t.style.def].fit.includes(p.ds);
// One prospect. Scouts look for players who suit the club's team styles: with chance q.fitChance they keep looking (up to 5 candidates) until one fits.
function genProspect(pos,role,q,bonus=0){const t=UT(),want=R()<q.fitChance&&(isP({pos})?t.style.def!=='balanced':t.style.off!=='balanced'||t.style.def!=='balanced');let p;
  for(let i=0;i<(want?5:1);i++){p=genPlayer(q.base+bonus,pos,ri(15,16),role);if(!want||fitsTeam(p,t))break}
  p.pot=clamp(Math.round(p.pot+q.pot),Math.ceil(ovr(p))+1,97);return p}
// Paid scouting trips during tryouts. Each adds prospects found further afield, slightly better than the local class.
const SEARCH=[{n:'Regional search',cost:800,add:6,bonus:1},{n:'National search',cost:1800,add:6,bonus:2.5}];
function widerSearch(){const S=G.s,T=G.try,o=T&&SEARCH[T.searches];if(!o||S.money<o.cost)return false;S.money-=o.cost;T.searches++;
  for(let i=0;i<o.add;i++)T.pool.push(genProspect(i<2?'P':pick(POS),i<2?(i?'RP':'SP'):'',T.info,o.bonus));save();return true}
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
