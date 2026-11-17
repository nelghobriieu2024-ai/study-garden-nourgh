(function(){
"use strict";
function $(id){return document.getElementById(id)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function ease(t){return 1-Math.pow(1-t,3)}
var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- colour + random helpers ---------- */
function h2r(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function r2h(c){return "#"+c.map(function(v){var s=Math.round(clamp(v,0,255)).toString(16);return s.length<2?"0"+s:s}).join("")}
function mixHex(a,b,t){var x=h2r(a),y=h2r(b);return r2h([x[0]+(y[0]-x[0])*t,x[1]+(y[1]-x[1])*t,x[2]+(y[2]-x[2])*t])}
function shade(h,a){return a>=0?mixHex(h,"#ffffff",a):mixHex(h,"#000000",-a)}
function lum(h){var c=h2r(h);return (.2126*c[0]+.7152*c[1]+.0722*c[2])/255}
function rh(n){n=n|0;n=Math.imul(n^n>>>15,2246822507);n=Math.imul(n^n>>>13,3266489909);return((n^n>>>16)>>>0)/4294967296}

/* ---------- data ---------- */
var SPECIES={
 rose:{label:"Rose",em:"🌹",col:"#E9718A"}, fern:{label:"Fern",em:"🌿",col:"#7E9A6B"}, tulip:{label:"Tulip",em:"🌷",col:"#F4B6BE"},
 sunflower:{label:"Sunflower",em:"🌻",col:"#F7C873"}, lavender:{label:"Lavender",em:"💜",col:"#9B7EC8"}, blossom:{label:"Blossom tree",em:"🌸",col:"#F2A0B5"}
};
SPECIES.tomato={label:"Tomato",em:"🍅",col:"#E5483D"};
SPECIES.oak={label:"Oak",em:"🌳",col:"#4F8F4F"};SPECIES.pine={label:"Pine",em:"🌲",col:"#2F6B45"};SPECIES.daisy={label:"Daisy",em:"🌼",col:"#FBF6E8"};
var SEED_ORDER=["tomato","sunflower","rose","tulip","lavender","daisy","fern","blossom","oak","pine"];
var SEEDNOTE={tomato:"the classic",sunflower:"sun-hungry",rose:"slow, romantic",tulip:"quick & bright",lavender:"calming",daisy:"easy-going",fern:"shade lover",blossom:"a spring tree",oak:"patience",pine:"evergreen"};
var STAGE_G=[.3,.42,.54,.66,.78,.9,1],STAGE_NAMES=["seedling","sprout","young plant","budding","blooming","flourishing","fully grown"];
function seedSp(){return SPECIES[D.prefs.seed]?D.prefs.seed:"tomato"}
var DURS=[{m:.5,b:.17,L:.25,l:"30 sec demo"},{m:15,b:3,L:10,l:"15 / 3 min"},{m:25,b:5,L:15,l:"25 / 5 min"},{m:50,b:10,L:20,l:"50 / 10 min"}];
var CITIES=[
 {id:"madrid",name:"Madrid",country:"Spain",flag:"🇪🇸",tag:"Terracotta rooftops and long golden hours",tint:"#F0A878",ta:.2,h1:"#CDB892",h2:"#B6A06F",g1:"#A3A872",g2:"#818A5A",bl:"#66703F",scale:[0,3,7,8,12,15],
  lm:[{n:5,x:.5,draw:"debod",em:"🏛️",name:"Templo de Debod",desc:"An Egyptian temple by the water"},{n:15,x:.2,draw:"alcala",em:"🏙️",name:"Puerta de Alcalá",desc:"The triumphal arch"},{n:25,x:.82,draw:"crystal",em:"🔮",name:"Crystal Palace",desc:"A glass pavilion in the Retiro"}]},
 {id:"paris",name:"Paris",country:"France",flag:"🇫🇷",tag:"Mansard roofs and a tower on the skyline",tint:"#C9A6C4",ta:.28,h1:"#B9C0B0",h2:"#A3B096",g1:"#8FAF82",g2:"#6F9468",bl:"#56794F",scale:[0,2,4,7,9,12],
  lm:[{n:5,x:.5,draw:"carousel",em:"🎠",name:"Carousel",desc:"Painted horses going round"},{n:15,x:.2,draw:"cafe",em:"☕",name:"Café terrace",desc:"Striped awning, small tables"},{n:25,x:.82,draw:"arc",em:"🏛️",name:"Arc de Triomphe",desc:"Twelve avenues meet here"}]},
 {id:"london",name:"London",country:"England",flag:"🇬🇧",tag:"Red buses, a river and a tower that keeps time",tint:"#B8C2D0",ta:.25,h1:"#AEBBB0",h2:"#97AB8E",g1:"#7FA874",g2:"#5F8C58",bl:"#4A7545",scale:[0,2,4,5,7,9,11],
  lm:[{n:5,x:.5,draw:"bigben",em:"🕰️",name:"Elizabeth Tower",desc:"Big Ben keeps the hours"},{n:15,x:.2,draw:"bus",em:"🚌",name:"Red double-decker",desc:"There is always one more stop"},{n:25,x:.82,draw:"towerbridge",em:"🌉",name:"Tower Bridge",desc:"Blue chains over the Thames"}]},
 {id:"kyoto",name:"Kyoto",country:"Japan",flag:"🇯🇵",tag:"Pagodas, mountains and blossom",tint:"#F2C2CF",ta:.25,h1:"#B8C8C0",h2:"#9DB59A",g1:"#8DB38A",g2:"#6B9A6E",bl:"#527F57",scale:[0,2,3,7,8,12],
  lm:[{n:5,x:.5,draw:"torii",em:"⛩️",name:"Torii gate",desc:"A red gate to somewhere calm"},{n:15,x:.2,draw:"lantern",em:"🏮",name:"Stone lantern",desc:"It glows after dark"},{n:25,x:.82,draw:"koi",em:"🐟",name:"Koi pond",desc:"A small bridge and slow fish"}]},
 {id:"lisbon",name:"Lisbon",country:"Portugal",flag:"🇵🇹",tag:"Hillside houses and a yellow tram",tint:"#F4C98A",ta:.26,h1:"#D9C7A0",h2:"#C2B47E",g1:"#A9B26E",g2:"#879A57",bl:"#6B7E43",scale:[0,2,3,5,7,8],
  lm:[{n:5,x:.5,draw:"tram",em:"🚋",name:"Tram 28",desc:"Rattling up the hill"},{n:15,x:.2,draw:"azulejo",em:"🟦",name:"Azulejo wall",desc:"Hand-painted blue tiles"},{n:25,x:.82,draw:"belem",em:"🏰",name:"Belém Tower",desc:"Guarding the river"}]},
 {id:"newyork",name:"New York",country:"USA",flag:"🇺🇸",tag:"A skyline that never sleeps",tint:"#9FB4D6",ta:.3,h1:"#A9B8B0",h2:"#8FA596",g1:"#86AA7E",g2:"#689068",bl:"#4F7650",scale:[0,3,5,6,7,10],
  lm:[{n:5,x:.5,draw:"taxi",em:"🚕",name:"Yellow cab",desc:"Always one on the corner"},{n:15,x:.2,draw:"liberty",em:"🗽",name:"Lady Liberty",desc:"Torch held high"},{n:25,x:.8,draw:"bridge",em:"🌉",name:"Brooklyn Bridge",desc:"Stone towers and steel cables"}]},
 {id:"lebanon",name:"Lebanon",country:"Beirut",flag:"🇱🇧",tag:"Sea, snowy mountains and cedar trees",tint:"#F0C79A",ta:.22,h1:"#C9C0A4",h2:"#A9B58A",g1:"#9CB070",g2:"#7C9658",bl:"#5F7C3F",scale:[0,1,4,5,7,8,11],
  lm:[{n:5,x:.5,draw:"raouche",em:"🌊",name:"Raouche Rocks",desc:"The Pigeon Rocks rise from the sea"},{n:15,x:.2,draw:"cedar",em:"🌲",name:"Cedar of Lebanon",desc:"The tree on the flag"},{n:25,x:.82,draw:"baalbek",em:"🏛️",name:"Baalbek columns",desc:"Roman giants in the Bekaa Valley"}]},
 {id:"dream",name:"Dream destination",country:"Your pick",flag:"✨",tag:"Name the place you have always wanted to go",tint:"#B9A6F0",ta:.3,h1:"#B7B4D8",h2:"#8FB8B0",g1:"#7FC4A8",g2:"#5BA38A",bl:"#3F8F78",scale:[0,2,4,7,9,11],
  lm:[{n:5,x:.5,draw:"balloon",em:"🎈",name:"Hot air balloon",desc:"Drifting over your dream"},{n:15,x:.2,draw:"lighthouse",em:"🏝️",name:"Lighthouse",desc:"Its beam sweeps the night"},{n:25,x:.82,draw:"hammock",em:"🌴",name:"Palm hammock",desc:"The best seat on the island"}]}
];
var CMETA={
 madrid:{c:"40.4168° N · 3.7038° W",hi:"¡Hola!",n:"Golden hour starts at six. The shade is colder than it looks, bring a jacket."},
 paris:{c:"48.8566° N · 2.3522° E",hi:"Bonjour",n:"Every café chair faces the street. Study like you are watching a film."},
 london:{c:"51.5074° N · 0.1278° W",hi:"Alright?",n:"It might rain. That is the point: stay in, keep growing."},
 kyoto:{c:"35.0116° N · 135.7681° E",hi:"こんにちは",n:"Moss, bamboo, silence. A good place for the long session."},
 lisbon:{c:"38.7223° N · 9.1393° W",hi:"Olá",n:"Seven hills, one yellow tram and tiles on every wall."},
 newyork:{c:"40.7128° N · 74.0060° W",hi:"Hey",n:"Nobody sleeps here. You can, after your fourth pomodoro."},
 lebanon:{c:"33.8938° N · 35.5018° E",hi:"مرحبا",n:"Snow on the mountain, sea at the bottom. Cedar for the long breaks."},
 dream:{c:"??.????° ? · ??.????° ?",hi:"Someday…",n:"Write the place you really want to go. Then earn it, one tomato at a time."}
};
function CITY(id){for(var i=0;i<CITIES.length;i++)if(CITIES[i].id===id)return CITIES[i];return CITIES[0]}
function unlockList(cid){
  var C=CITY(cid),l=[{n:3,em:"🦋",name:"Butterflies",desc:"Three plants in"},{n:8,em:"🏮",name:"Lanterns",desc:"They glow after dark"},{n:40,em:"🌈",name:"Rainbow",desc:"The grand finale"}];
  C.lm.forEach(function(m){l.push({n:m.n,em:m.em,name:m.name,desc:m.desc})});
  return l.sort(function(a,b){return a.n-b.n});
}
var KEY="studygarden.v2";
var D=null;var D=null;
function defaults(){
  var subs=[{id:"u1",name:"Marketing",sp:"rose"},{id:"u2",name:"Statistics",sp:"fern"},{id:"u3",name:"Essay",sp:"tulip"},{id:"u4",name:"Spanish",sp:"lavender"},{id:"u5",name:"Thesis",sp:"blossom"},{id:"u6",name:"Design",sp:"sunflower"}];
  var now=Date.now(),day=864e5;
  var plan=[["madrid",9,0,25],["madrid",9,2,45],["madrid",8,1,25],["madrid",7,3,60],["madrid",6,0,25],["madrid",6,4,25],["madrid",5,5,45],["madrid",4,1,25],["madrid",4,2,15],["madrid",3,0,45],["madrid",3,3,25],["madrid",2,4,60],["madrid",2,1,25,0],["madrid",1,5,45],["madrid",1,2,25],["madrid",0,0,25],
    ["paris",14,0,25],["paris",13,2,45],["paris",12,4,25],["paris",11,1,25],["paris",10,5,45],["kyoto",20,3,25],["kyoto",19,4,45],["kyoto",18,0,25],["lisbon",25,2,25],["london",16,1,25],["london",15,3,25],["lebanon",22,0,25]];
  var ses=plan.map(function(p,i){
    var d=new Date(now-p[1]*day); d.setHours(9+(i%6)*2,10,0,0);
    return {id:"d"+i,city:p[0],subj:subs[p[2]].id,mins:p[3],ts:Math.min(d.getTime(),now-60000*(30-i)),ok:p.length>4?false:true,seed:1000+i*37,demo:true};
  });
  return {subjects:subs,sessions:ses,prefs:{sound:false,strict:true,sky:"auto",season:"auto",pip:true,mix:{rain:0,birds:0,wind:0,city:0,master:.7},subj:"u1",dur:25,city:"madrid",dreamName:""},badges:{},found:{},flags:{}};
}
function load(){
  try{var raw=localStorage.getItem(KEY); if(raw){var o=JSON.parse(raw); if(o&&o.subjects&&o.sessions&&o.prefs){if(!o.prefs.city)o.prefs.city="madrid";if(!o.prefs.season)o.prefs.season="auto";if(o.prefs.pip===undefined)o.prefs.pip=true;if(!o.prefs.mix||typeof o.prefs.mix!=="object")o.prefs.mix={rain:0,birds:0,wind:0,city:0,master:.7};["rain","birds","wind","city"].forEach(function(k){if(typeof o.prefs.mix[k]!=="number")o.prefs.mix[k]=0});if(typeof o.prefs.mix.master!=="number")o.prefs.mix.master=.7;o.badges=o.badges||{};o.found=o.found||{};o.flags=o.flags||{};o.sessions.forEach(function(s){if(!s.city)s.city="madrid"});return o;}}}catch(e){}
  return defaults();
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}}
D=load();
function applyDream(){var n=String(D.prefs.dreamName||"").replace(/[<>&"']/g,"").trim().slice(0,24);CITY("dream").name=n||"Dream destination"}
applyDream();
$("mastDate").textContent=new Date().toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"});
function subjById(id){for(var i=0;i<D.subjects.length;i++)if(D.subjects[i].id===id)return D.subjects[i];return D.subjects[0]}
function okSes(){return D.sessions.filter(function(s){return s.ok})}
function curCity(){return CITY(D.prefs.city)}
function okCity(id){return D.sessions.filter(function(s){return s.ok&&s.city===id}).length}
function firstVisit(id){var t=null;D.sessions.forEach(function(s){if(s.ok&&s.city===id&&(t===null||s.ts<t))t=s.ts});return t}
function dayKey(ts){var d=new Date(ts);return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()}
function minsFmt(m){return m<1?Math.round(m*60)+" sec":(Math.round(m*10)/10)+" min"}
function hoursFmt(m){return (Math.round(m/6)/10)+""}
function totalMins(){return okSes().reduce(function(a,s){return a+s.mins},0)}
function streak(){
  var set={};okSes().forEach(function(s){set[dayKey(s.ts)]=1});
  var d=new Date(); if(!set[dayKey(d.getTime())]) d=new Date(d.getTime()-864e5);
  var n=0; while(set[dayKey(d.getTime())]){n++; d=new Date(d.getTime()-864e5);} return n;
}
function dateFmt(ts){return new Date(ts).toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"})}

/* ---------- plants (procedural, deterministic per seed) ---------- */
function qpt(p0,p1,p2,t){var a=1-t;return [a*a*p0[0]+2*a*t*p1[0]+t*t*p2[0],a*a*p0[1]+2*a*t*p1[1]+t*t*p2[1]]}
function stemPath(c,p0,p1,p2,w,col,upto){
  c.strokeStyle=col;c.lineWidth=w;c.lineCap="round";c.beginPath();c.moveTo(p0[0],p0[1]);
  var n=12;for(var i=1;i<=n;i++){var p=qpt(p0,p1,p2,upto*i/n);c.lineTo(p[0],p[1]);}c.stroke();
}
function leaf(c,x,y,a,l,w,col){c.save();c.translate(x,y);c.rotate(a);c.fillStyle=col;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(l*.5,-w,l,0);c.quadraticCurveTo(l*.5,w,0,0);c.fill();c.restore()}
function petal(c,x,y,a,l,w,col){c.save();c.translate(x,y);c.rotate(a);c.fillStyle=col;c.beginPath();c.ellipse(l*.5,0,l*.5,w,0,0,Math.PI*2);c.fill();c.restore()}
var GREEN="#5E9150", GREEN2="#4E7A45";

function rose(c,R,col,g,h){
  var gr=ease(clamp(g/.65,0,1)), top=h*.8*gr, bend=(R(1)-.5)*h*.2;
  var P0=[0,0],P1=[bend,-top*.5],P2=[bend*.6,-top];
  stemPath(c,P0,P1,P2,Math.max(2,h*.022),GREEN2,1);
  if(g>.2){var lg=clamp((g-.2)/.4,0,1);for(var i=0;i<3;i++){var p=qpt(P0,P1,P2,.2+i*.22);leaf(c,p[0],p[1],i%2?-.35:-Math.PI+.35,h*.15*lg,h*.05*lg,GREEN)}}
  var e=P2;
  if(g<.5){c.fillStyle=shade(col,-.1);c.beginPath();c.ellipse(e[0],e[1]-h*.02,h*.025*(.5+g),h*.04*(.5+g),0,0,Math.PI*2);c.fill();return}
  var bg=clamp((g-.5)/.5,0,1), r=h*.1*(.35+.65*bg);
  for(var ring=0;ring<3;ring++){var n=5+ring*2;for(var k=0;k<n;k++){var a=k/n*Math.PI*2+ring*.55;var rad=r*(.15+ring*.33);petal(c,e[0]+Math.cos(a)*rad*.5,e[1]+Math.sin(a)*rad*.5-r*.1,a,r*(1.05-ring*.2),r*(.42-ring*.06),shade(col,.12-ring*.13))}}
  c.fillStyle=shade(col,-.3);c.beginPath();c.arc(e[0],e[1]-r*.1,r*.16,0,Math.PI*2);c.fill();
}
function fern(c,R,col,g,h){
  var gr=ease(clamp(g/.85,0,1)), n=Math.floor(3+gr*8), base=mixHex("#5E9150",col,.12);
  for(var i=0;i<n;i++){
    var t=n===1?.5:i/(n-1), ang=(-1.15+t*2.3), len=h*(.55+R(i+3)*.3)*gr;
    var P0=[0,0],P2=[Math.sin(ang)*len,-Math.cos(ang)*len*.95],P1=[Math.sin(ang)*len*.25-Math.sign(ang||1)*len*.12,-len*.7];
    stemPath(c,P0,P1,P2,Math.max(1.5,h*.012),shade(base,-.2),1);
    var m=16;for(var j=2;j<=m;j++){var tt=j/m,p=qpt(P0,P1,P2,tt),q=qpt(P0,P1,P2,Math.min(1,tt+.04));var a=Math.atan2(q[1]-p[1],q[0]-p[0]);var ll=len*.2*(1-tt*.8);
      leaf(c,p[0],p[1],a-1.1,ll,ll*.3,shade(base,(j%2?.05:-.05)));leaf(c,p[0],p[1],a+1.1,ll,ll*.3,shade(base,(j%2?-.05:.05)))}
  }
}
function tulip(c,R,col,g,h){
  var gr=ease(clamp(g/.6,0,1)),o=clamp((g-.5)/.5,0,1);
  for(var s=-1;s<=1;s++){
    var sh=h*(s===0?.82:.68)*gr, x=s*h*.12, P0=[x*.3,0],P1=[x*.9,-sh*.5],P2=[x*1.2,-sh];
    stemPath(c,P0,P1,P2,Math.max(2,h*.02),GREEN2,1);
    var r=h*.075*(.3+.7*o), e=P2;
    c.fillStyle=shade(col,-.06);c.beginPath();c.moveTo(e[0]-r,e[1]-r*.2);c.quadraticCurveTo(e[0]-r*1.1,e[1]+r*.8,e[0],e[1]+r*.9);c.quadraticCurveTo(e[0]+r*1.1,e[1]+r*.8,e[0]+r,e[1]-r*.2);c.quadraticCurveTo(e[0],e[1]+r*.2,e[0]-r,e[1]-r*.2);c.fill();
    c.fillStyle=shade(col,.08);c.beginPath();c.moveTo(e[0]-r*.1,e[1]-r*1.4*(.5+.5*o));c.quadraticCurveTo(e[0]-r*.9,e[1]-r*.1,e[0]-r*.6,e[1]+r*.8);c.quadraticCurveTo(e[0],e[1]+r*.3,e[0]+r*.6,e[1]+r*.8);c.quadraticCurveTo(e[0]+r*.9,e[1]-r*.1,e[0]+r*.1,e[1]-r*1.4*(.5+.5*o));c.fill();
  }
  if(g>.15){var lg=clamp((g-.15)/.5,0,1);leaf(c,0,0,-Math.PI/2-.55,h*.55*lg,h*.07*lg,GREEN);leaf(c,0,0,-Math.PI/2+.55,h*.5*lg,h*.07*lg,GREEN2)}
}
function sunflower(c,R,col,g,h){
  var gr=ease(clamp(g/.65,0,1)), top=h*.82*gr, bend=(R(2)-.5)*h*.1, P0=[0,0],P1=[bend,-top*.5],P2=[bend*.7,-top];
  stemPath(c,P0,P1,P2,Math.max(3,h*.03),GREEN2,1);
  if(g>.2){var lg=clamp((g-.2)/.4,0,1);leaf(c,0,-top*.25,-.4,h*.22*lg,h*.08*lg,GREEN);leaf(c,0,-top*.42,-Math.PI+.4,h*.2*lg,h*.07*lg,GREEN)}
  var e=P2,hg=clamp((g-.45)/.55,0,1), r=h*.16*(.3+.7*hg);
  var n=22;for(var i=0;i<n;i++){var a=i/n*Math.PI*2;petal(c,e[0]+Math.cos(a)*r*.45,e[1]+Math.sin(a)*r*.45,a,r*.75,r*.17,shade(col,i%2?.08:-.04))}
  c.fillStyle="#5A3A2E";c.beginPath();c.arc(e[0],e[1],r*.52,0,Math.PI*2);c.fill();
  c.fillStyle="#9A6B4A";for(var k=0;k<70;k++){var rr=Math.sqrt(k/70)*r*.46,aa=k*2.39996;c.beginPath();c.arc(e[0]+Math.cos(aa)*rr,e[1]+Math.sin(aa)*rr,Math.max(.6,r*.025),0,Math.PI*2);c.fill()}
}
function lavender(c,R,col,g,h){
  var gr=ease(clamp(g/.8,0,1));
  for(var i=0;i<7;i++){
    var t=i/6, ang=-.55+t*1.1, len=h*(.62+R(i+5)*.3)*gr;
    var P0=[0,0],P2=[Math.sin(ang)*len*.75,-Math.cos(ang)*len],P1=[Math.sin(ang)*len*.25,-len*.55];
    stemPath(c,P0,P1,P2,Math.max(1.4,h*.011),"#6E9B62",1);
    if(g>.35){var bg=clamp((g-.35)/.5,0,1),m=11;for(var j=0;j<m;j++){var tt=.58+.42*(j/m)*bg,p=qpt(P0,P1,P2,tt),s=h*.02*(1-j/m*.35);
      c.fillStyle=shade(col,(j%3-1)*.1);c.beginPath();c.ellipse(p[0]-s*.5,p[1],s,s*1.5,.5,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(p[0]+s*.5,p[1]-s*.3,s,s*1.5,-.5,0,Math.PI*2);c.fill()}}
  }
}
function blossom(c,R,col,g,h){
  var maxD=6,gl=g*maxD,seed0=R(77)*1e6|0;
  function br(x,y,a,len,d,w,k){
    var f=clamp(gl-d+1,0,1);if(f<=0)return;
    var L=len*f,x2=x+Math.sin(a)*L,y2=y-Math.cos(a)*L;
    c.strokeStyle=d<3?"#5A3A2E":"#7A5646";c.lineWidth=Math.max(1,w);c.lineCap="round";c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();
    if(d<maxD){
      var j1=.35+rh(seed0+k*3)*.3,j2=.35+rh(seed0+k*3+1)*.3;
      br(x2,y2,a-j1,len*.74,d+1,w*.68,k*2+1);br(x2,y2,a+j2,len*.74,d+1,w*.68,k*2+2);
    }
    if(d>=maxD-2&&gl>maxD*.55){
      var bl=clamp((gl-maxD*.55)/(maxD*.45),0,1),n=3;
      for(var i=0;i<n;i++){var ox=(rh(seed0+k*7+i)-.5)*h*.07,oy=(rh(seed0+k*11+i)-.5)*h*.07;c.fillStyle=shade(col,(i-1)*.1);c.beginPath();c.arc(x2+ox,y2+oy,h*.022*bl,0,Math.PI*2);c.fill()}
    }
  }
  br(0,0,0,h*.27,1,Math.max(3,h*.04),0);
}
function tomato(c,R,col,g,h){
  var gr=ease(clamp(g/.7,0,1)),top=h*.78*gr,bend=(R(3)-.5)*h*.12,P0=[0,0],P1=[bend,-top*.5],P2=[bend*.6,-top];
  stemPath(c,P0,P1,P2,Math.max(2.5,h*.026),GREEN2,1);
  if(g>.12){var lg=clamp((g-.12)/.4,0,1);for(var i=0;i<5;i++){var p=qpt(P0,P1,P2,.15+i*.17),s=i%2?1:-1;leaf(c,p[0],p[1],s>0?-.3:-Math.PI+.3,h*.2*lg,h*.055*lg,i%2?GREEN:GREEN2);leaf(c,p[0],p[1],s>0?-.75:-Math.PI+.75,h*.14*lg,h*.04*lg,GREEN)}}
  if(g>.4){var tg=clamp((g-.4)/.6,0,1),ripe=clamp((tg-.35)/.65,0,1);
    for(var k=0;k<3;k++){var p2=qpt(P0,P1,P2,.3+k*.22),dir=k%2?1:-1,tx=p2[0]+dir*h*.1,ty=p2[1]+h*.07,r=h*.065*(.4+.6*tg);
      c.strokeStyle=GREEN2;c.lineWidth=Math.max(1.5,h*.01);c.beginPath();c.moveTo(p2[0],p2[1]);c.quadraticCurveTo(p2[0]+dir*h*.05,p2[1]-h*.01,tx,ty-r);c.stroke();
      c.fillStyle=mixHex("#7FB35A","#E5483D",ripe);c.beginPath();c.ellipse(tx,ty,r*1.1,r,0,0,Math.PI*2);c.fill();
      c.fillStyle="rgba(255,255,255,.3)";c.beginPath();c.ellipse(tx-r*.4,ty-r*.4,r*.3,r*.17,-.5,0,Math.PI*2);c.fill();
      for(var q=0;q<5;q++)leaf(c,tx,ty-r*.85,-Math.PI/2+(q-2)*.7,r*.6,r*.17,GREEN2)}}
  leaf(c,P2[0],P2[1],-Math.PI/2-.4,h*.1*gr,h*.035*gr,GREEN);leaf(c,P2[0],P2[1],-Math.PI/2+.4,h*.1*gr,h*.035*gr,GREEN2);
}
function oak(c,R,col,g,h){
  var gr=ease(clamp(g/.8,0,1)),th=h*.5*gr,tw=Math.max(3,h*.05*gr);
  c.strokeStyle="#5A3E2B";c.lineCap="round";c.lineWidth=tw;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo((R(1)-.5)*h*.06,-th*.5,0,-th);c.stroke();
  if(g>.35){c.lineWidth=tw*.5;[[-1,.55],[1,.7]].forEach(function(b){c.beginPath();c.moveTo(0,-th*b[1]);c.lineTo(b[0]*h*.14*gr,-th*b[1]-h*.1*gr);c.stroke()})}
  var cg=clamp((g-.12)/.88,0,1),n=9+Math.floor(cg*14),cy=-th-h*.08*cg,R0=h*.3*(.25+.75*cg);
  for(var i=0;i<n;i++){var a=R(i+5)*6.283,d=Math.sqrt(R(i+40))*R0,x=Math.cos(a)*d,y=cy+Math.sin(a)*d*.75,r=R0*(.28+R(i+80)*.22);c.fillStyle=shade("#4F8F4F",(R(i+120)-.5)*.35+(y<cy?.08:-.08));c.beginPath();c.arc(x,y,r,0,6.283);c.fill()}
}
function pine(c,R,col,g,h){
  var gr=ease(clamp(g/.85,0,1)),th=h*.85*gr;
  c.fillStyle="#5A3E2B";c.fillRect(-h*.02,-h*.12*gr,h*.04,h*.12*gr);
  var tiers=2+Math.floor(5*gr);
  for(var i=0;i<tiers;i++){var t=i/Math.max(1,tiers-1),y=-h*.1*gr-(th*.9)*t*.92,w=h*.2*gr*(1-t*.72),hh=th*.3;c.fillStyle=shade("#2F6B45",(i%2?.06:-.06));c.beginPath();c.moveTo(-w,y);c.lineTo(0,y-hh);c.lineTo(w,y);c.closePath();c.fill()}
}
function daisy(c,R,col,g,h){
  var gr=ease(clamp(g/.7,0,1)),o=clamp((g-.4)/.6,0,1);
  for(var s=0;s<3;s++){var x=(s-1)*h*.14,sh=h*(s===1?.62:.46)*gr,P0=[x*.3,0],P1=[x*.9,-sh*.5],P2=[x*1.15,-sh];stemPath(c,P0,P1,P2,Math.max(1.8,h*.015),GREEN2,1);
    if(g>.3){var r=h*.07*(.2+.8*o);for(var k=0;k<12;k++)petal(c,P2[0]+Math.cos(k/12*6.283)*r*.5,P2[1]+Math.sin(k/12*6.283)*r*.5,k/12*6.283,r*.9,r*.2,"#FBF6E8");c.fillStyle="#E9B93A";c.beginPath();c.arc(P2[0],P2[1],r*.32,0,6.283);c.fill()}}
  leaf(c,0,0,-Math.PI/2-.6,h*.25*gr,h*.05*gr,GREEN);leaf(c,0,0,-Math.PI/2+.6,h*.22*gr,h*.05*gr,GREEN2);
}
var DRAW={rose:rose,fern:fern,tulip:tulip,sunflower:sunflower,lavender:lavender,blossom:blossom,tomato:tomato,oak:oak,pine:pine,daisy:daisy};
function drawPlant(c,sp,seed,col,g,h){
  var R=function(i){return rh(seed*131+i*977)};
  c.save();c.lineJoin="round";DRAW[sp](c,R,col,g,h);c.restore();
}
function drawWilted(c,h){
  c.save();c.lineCap="round";c.strokeStyle="#8A7058";c.lineWidth=Math.max(2,h*.03);
  c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(h*.05,-h*.35,h*.25,-h*.42);c.stroke();
  leaf(c,h*.04,-h*.2,.7,h*.2,h*.05,"#A08968");leaf(c,h*.08,-h*.28,2.6,h*.17,h*.045,"#8F7A5C");
  c.fillStyle="#9A8470";c.beginPath();c.arc(h*.27,-h*.4,h*.035,0,Math.PI*2);c.fill();c.restore();
}
var SEASON="summer";
var SEASONS={
 spring:{sky:"#CDE8D8",sa:.12,gmix:"#8FD16E",ga:.28,hmix:"#A5CF8A",ha:.25},
 summer:{sky:"#E4EEF2",sa:.10,gmix:"#A9B65A",ga:.14,hmix:"#B2BB7A",ha:.12},
 autumn:{sky:"#E3C9B6",sa:.12,gmix:"#A58A4E",ga:.3,hmix:"#B09A63",ha:.28},
 winter:{sky:"#DCE6F0",sa:.35,gmix:"#EAF0F4",ga:.78,hmix:"#D5DEE6",ha:.62}
};
function curSeason(){var p=D.prefs.season||"auto";if(p!=="auto"&&SEASONS[p])return p;var m=new Date().getMonth();return m>=2&&m<=4?"spring":m>=5&&m<=7?"summer":m>=8&&m<=10?"autumn":"winter"}
var SZ_EM={spring:"🌸",summer:"☀️",autumn:"🍂",winter:"❄️"};
SPECIES.olive={label:"Olive tree",em:"🫒",col:"#8FA37A"};SPECIES.pot={label:"Geranium pot",em:"🏺",col:"#D6363F"};
SPECIES.peony={label:"Peony",em:"💮",col:"#F3A6BE"};SPECIES.hydrangea={label:"Hydrangea",em:"💠",col:"#7C9BE0"};
SPECIES.maple={label:"Japanese maple",em:"🍁",col:"#B3262E"};SPECIES.bonsai={label:"Bonsai",em:"🪴",col:"#4F8F4F"};
SPECIES.bamboo={label:"Bamboo",em:"🎋",col:"#5FA05A"};SPECIES.bougainvillea={label:"Bougainvillea",em:"🌺",col:"#D6336C"};
SPECIES.citrus={label:"Orange tree",em:"🍊",col:"#F29A1F"};SPECIES.ginkgo={label:"Ginkgo",em:"🍃",col:"#F0C419"};
SPECIES.cedar={label:"Cedar",em:"🏔️",col:"#2F6B45"};SPECIES.jasmine={label:"Jasmine",em:"🤍",col:"#FFFFFF"};
SPECIES.palm={label:"Palm",em:"🌴",col:"#3FA66C"};SPECIES.glowflower={label:"Dream flower",em:"✨",col:"#6FE3D2"};
var NATIVE={madrid:["olive","pot","sunflower"],paris:["peony","rose","lavender"],london:["hydrangea","rose","daisy"],kyoto:["maple","bonsai","bamboo","blossom"],lisbon:["bougainvillea","citrus","pot"],newyork:["ginkgo","tomato","tulip"],lebanon:["cedar","jasmine","olive"],dream:["palm","glowflower","blossom"]};
var FLOWERY={rose:1,tulip:1,sunflower:1,lavender:1,daisy:1,peony:1,pot:1,hydrangea:1,bougainvillea:1,jasmine:1,glowflower:1,tomato:1};
var DECOR={
 madrid:[{sp:"olive",x:.07,r:0,k:.95,f:"Olive trees here can live a thousand years. Yours has time."},{sp:"pot",x:.36,r:1,k:.7,f:"Terracotta keeps roots cool. Madrid summers are no joke."},{sp:"sunflower",x:.66,r:0,k:.7,f:"Fields of girasoles turn to face the same sun you do."},{sp:"pot",x:.9,r:1,k:.6,f:"A balcony is just a garden that learned to stack."},{sp:"olive",x:.97,r:0,k:.8,f:"Silver on one side, green on the other. Wind shows both."}],
 paris:[{sp:"peony",x:.08,r:1,k:.8,f:"Peonies bloom for about a week. Paris is romantic about that."},{sp:"rose",x:.36,r:0,k:.8,f:"Climbing roses on iron balconies: Paris never skips the drama."},{sp:"lavender",x:.64,r:1,k:.7,f:"Lavender has nothing to do with Paris and fits anyway."},{sp:"peony",x:.92,r:0,k:.9,f:"Bring flowers. Bring a book. Stay till the light goes soft."}],
 london:[{sp:"hydrangea",x:.08,r:1,k:.85,f:"Hydrangea colour depends on the soil. Same plant, different mood."},{sp:"rose",x:.4,r:0,k:.8,f:"The English rose: gentle, tough, pretends not to be impressed."},{sp:"hydrangea",x:.66,r:1,k:.75,f:"Rain is not a problem. Rain is the whole garden plan."},{sp:"daisy",x:.93,r:1,k:.7,f:"Daisy comes from 'day's eye': it opens with the sun."}],
 kyoto:[{sp:"maple",x:.08,r:0,k:1.05,f:"Momiji: Japanese maples turn whole hillsides red every November."},{sp:"bonsai",x:.36,r:1,k:.7,f:"A bonsai is a long conversation between a person and a tree."},{sp:"bamboo",x:.62,r:0,k:.95,f:"Bamboo can grow almost a metre in a day. Study like bamboo."},{sp:"maple",x:.92,r:1,k:.8,f:"Hanami is for blossom, momijigari for leaves. Both are for sitting still."}],
 lisbon:[{sp:"bougainvillea",x:.08,r:0,k:.9,f:"Magenta bracts pour over white walls. The flowers are tiny, the show is not."},{sp:"citrus",x:.38,r:1,k:.8,f:"Orange trees line the streets. Nobody picks them. Everyone stares."},{sp:"pot",x:.66,r:1,k:.65,f:"Pots on the tiled steps: Lisbon's front gardens are vertical."},{sp:"bougainvillea",x:.93,r:0,k:.85,f:"Seven hills, so every garden is a staircase."}],
 newyork:[{sp:"ginkgo",x:.08,r:0,k:1.05,f:"Ginkgos survived the atomic bomb and now line the sidewalks. Unbothered."},{sp:"tulip",x:.38,r:1,k:.7,f:"Tulips in the median strip: the city's most optimistic landscaping."},{sp:"tomato",x:.64,r:1,k:.7,f:"Rooftop tomatoes: yes, people really do that. It works."},{sp:"ginkgo",x:.93,r:0,k:.9,f:"Fan leaves turn pure gold for about a week every autumn."}],
 lebanon:[{sp:"cedar",x:.08,r:0,k:1.15,f:"Cedars of Lebanon grow slowly, for thousands of years. They are on the flag."},{sp:"jasmine",x:.36,r:1,k:.75,f:"Jasmine climbs old stone walls and perfumes the whole evening."},{sp:"olive",x:.64,r:0,k:.8,f:"Some olive trees here were planted before the Romans arrived."},{sp:"cedar",x:.93,r:1,k:.95,f:"Slow growth is still growth."}],
 dream:[{sp:"palm",x:.08,r:0,k:1,f:"Nobody knows where this palm is. That is exactly why you should go."},{sp:"glowflower",x:.36,r:1,k:.8,f:"A flower that only opens for places you have not been yet."},{sp:"glowflower",x:.66,r:0,k:.8,f:"Wish list item number one. Keep it close."},{sp:"palm",x:.93,r:1,k:.9,f:"You will get there. One tomato at a time."}]
};
function seedList(){var nat=NATIVE[D.prefs.city]||[];return nat.concat(SEED_ORDER.filter(function(k){return nat.indexOf(k)<0}))}

var CEL=null,NEWID=null,NEWAT=0,NEWSET=0,pendingNew=null,bloomAt=0;
function lc(base){
  if(SEASON==="autumn")return mixHex(base,"#D2792B",.7);
  if(SEASON==="spring")return mixHex(base,"#A6E36E",.3);
  if(SEASON==="summer")return mixHex(base,"#2E7D32",.12);
  return base;
}
function snowCap(c,x,y,r){if(SEASON!=="winter")return;c.fillStyle="rgba(255,255,255,.92)";c.beginPath();c.ellipse(x,y-r*.35,r*.8,r*.35,0,0,6.2832);c.fill()}
function olive(c,R,col,g,h){
  var gr=ease(clamp(g/.85,0,1)),th=h*.42*gr;
  c.strokeStyle="#6B5A48";c.lineCap="round";c.lineWidth=Math.max(3,h*.06*gr);
  c.beginPath();c.moveTo(-h*.02,0);c.quadraticCurveTo(-h*.07,-th*.5,-h*.02,-th);c.stroke();
  c.lineWidth=Math.max(2,h*.035*gr);c.beginPath();c.moveTo(h*.02,0);c.quadraticCurveTo(h*.08,-th*.5,h*.03,-th*.95);c.stroke();
  var cg=clamp((g-.1)/.9,0,1),n=10+Math.floor(cg*16),R0=h*.26*(.25+.75*cg),cy=-th-h*.04,i;
  for(i=0;i<n;i++){var a=R(i+3)*6.283,d=Math.sqrt(R(i+30))*R0,x=Math.cos(a)*d,y=cy+Math.sin(a)*d*.62;c.fillStyle=shade(mixHex("#8FA37A","#6E8A5E",R(i+60)),(R(i+90)-.5)*.3);c.beginPath();c.ellipse(x,y,R0*.3,R0*.15,R(i+7)*1.2-.6,0,6.283);c.fill()}
  if(cg>.7&&SEASON!=="spring"){c.fillStyle="#3C3A2A";for(i=0;i<5;i++){c.beginPath();c.arc((R(i+120)-.5)*R0*1.4,cy+(R(i+140)-.3)*R0*.5,h*.011,0,6.283);c.fill()}}
  snowCap(c,0,cy-R0*.4,R0);
}
function pot(c,R,col,g,h){
  var ph=h*.16,pw=h*.13;
  c.fillStyle="#B8562F";c.beginPath();c.moveTo(-pw,-ph);c.lineTo(pw,-ph);c.lineTo(pw*.72,0);c.lineTo(-pw*.72,0);c.closePath();c.fill();
  c.fillStyle="#C96A3E";c.fillRect(-pw*1.1,-ph*1.12,pw*2.2,ph*.2);
  var gr=ease(clamp(g/.7,0,1));
  for(var s=-1;s<=1;s++){var sh=h*(s===0?.5:.38)*gr,x=s*pw*.8;stemPath(c,[x*.5,-ph],[x*.9,-ph-sh*.5],[x*1.3,-ph-sh],Math.max(1.8,h*.014),GREEN2,1);
    if(g>.15)leaf(c,x*.9,-ph-sh*.4,s>=0?-.4:-Math.PI+.4,h*.12*gr,h*.05*gr,lc(GREEN));
    if(g>.35){var r=h*.075*clamp((g-.35)/.5,0,1);for(var k=0;k<7;k++){var a=k*.9;c.fillStyle=shade("#D6363F",(k%3-1)*.1);c.beginPath();c.arc(x*1.3+Math.cos(a)*r*.6,-ph-sh+Math.sin(a)*r*.6,r*.42,0,6.283);c.fill()}}}
}
function peony(c,R,col,g,h){
  var gr=ease(clamp(g/.65,0,1)),top=h*.62*gr,P0=[0,0],P1=[(R(2)-.5)*h*.1,-top*.5],P2=[0,-top];
  stemPath(c,P0,P1,P2,Math.max(2,h*.02),GREEN2,1);
  if(g>.2){var lg=clamp((g-.2)/.4,0,1);for(var i=0;i<4;i++){var p=qpt(P0,P1,P2,.2+i*.18);leaf(c,p[0],p[1],i%2?-.5:-Math.PI+.5,h*.16*lg,h*.06*lg,lc(GREEN))}}
  var e=P2,bg=clamp((g-.45)/.55,0,1),r=h*.13*(.3+.7*bg);
  for(var ring=0;ring<4;ring++){var n=7-ring;for(var k=0;k<n;k++){var a=k/n*6.283+ring*.5,rad=r*(.75-ring*.17);c.fillStyle=shade("#F3A6BE",.14-ring*.1);c.beginPath();c.arc(e[0]+Math.cos(a)*rad*.7,e[1]+Math.sin(a)*rad*.7,r*(.42-ring*.05),0,6.283);c.fill()}}
  c.fillStyle="#F6D26B";c.beginPath();c.arc(e[0],e[1],r*.13,0,6.283);c.fill();
}
function hydrangea(c,R,col,g,h){
  var gr=ease(clamp(g/.8,0,1)),i;
  for(i=0;i<6;i++){var a=-Math.PI/2+(i-2.5)*.3,len=h*.4*gr;stemPath(c,[0,0],[Math.sin(a)*len*.3,-len*.5],[Math.sin(a)*len*.6,-len*.95],Math.max(1.5,h*.012),GREEN2,1)}
  if(g>.2){var lg=clamp((g-.2)/.4,0,1);for(i=0;i<7;i++)leaf(c,0,-h*.04*i,i%2?-.2:-Math.PI+.2,h*.17*lg,h*.07*lg,lc(GREEN))}
  if(g>.4){var bg=clamp((g-.4)/.6,0,1),R0=h*.2*(.3+.7*bg),cy=-h*.5*gr;
    for(i=0;i<46;i++){var aa=R(i+4)*6.283,d=Math.sqrt(R(i+50))*R0,x=Math.cos(aa)*d,y=cy+Math.sin(aa)*d*.8;c.fillStyle=shade(mixHex("#7C9BE0","#B58AD8",R(i+90)),(R(i+120)-.5)*.3);c.beginPath();c.arc(x,y,R0*.14,0,6.283);c.fill()}}
}
function maple(c,R,col,g,h){
  var gr=ease(clamp(g/.8,0,1)),th=h*.42*gr;
  c.strokeStyle="#4A3A30";c.lineCap="round";c.lineWidth=Math.max(3,h*.04*gr);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo((R(1)-.5)*h*.1,-th*.5,h*.02,-th);c.stroke();
  c.lineWidth=Math.max(2,h*.02*gr);[[-1,.6],[1,.75]].forEach(function(b){c.beginPath();c.moveTo(h*.01,-th*b[1]);c.quadraticCurveTo(b[0]*h*.08,-th*b[1]-h*.04,b[0]*h*.17*gr,-th*b[1]-h*.08*gr);c.stroke()});
  if(SEASON==="winter"){snowCap(c,0,-th-h*.05,h*.12);return}
  var cg=clamp((g-.12)/.88,0,1),n=14+Math.floor(cg*20),R0=h*.32*(.25+.75*cg),cy=-th-h*.04,base=SEASON==="spring"?"#C75A4F":SEASON==="autumn"?"#E3501F":"#9E1F2C";
  for(var i=0;i<n;i++){var a=R(i+5)*6.283,d=Math.sqrt(R(i+40))*R0,x=Math.cos(a)*d*1.2,y=cy+Math.sin(a)*d*.7;c.fillStyle=shade(base,(R(i+90)-.5)*.35);c.beginPath();c.ellipse(x,y,R0*.2,R0*.12,R(i+8)*2-1,0,6.283);c.fill()}
}
function bonsai(c,R,col,g,h){
  var gr=ease(clamp(g/.8,0,1)),ph=h*.1;
  c.fillStyle="#3E7A78";c.beginPath();c.moveTo(-h*.12,-ph);c.lineTo(h*.12,-ph);c.lineTo(h*.09,0);c.lineTo(-h*.09,0);c.fill();c.fillStyle="#2E5E5C";c.fillRect(-h*.13,-ph*1.15,h*.26,ph*.22);
  var th=h*.36*gr;c.strokeStyle="#4A3A30";c.lineCap="round";c.lineWidth=Math.max(3,h*.035*gr);c.beginPath();c.moveTo(0,-ph);c.bezierCurveTo(-h*.1,-ph-th*.3,h*.1,-ph-th*.6,0,-ph-th);c.stroke();
  [[-.13,.55,.15],[.14,.75,.14],[0,1.02,.17]].forEach(function(p,i){if(gr<.25+i*.2)return;var s=clamp((gr-(.25+i*.2))/.4,0,1),x=p[0]*h,y=-ph-th*p[1];c.fillStyle=lc(shade("#4F8F4F",i*.06-.06));c.beginPath();c.ellipse(x,y,h*p[2]*s,h*p[2]*.5*s,0,0,6.283);c.fill();snowCap(c,x,y,h*p[2]*s)});
}
function bamboo(c,R,col,g,h){
  var gr=ease(clamp(g/.85,0,1));
  for(var s=0;s<4;s++){var x=(s-1.5)*h*.07,sh=h*(.7+R(s+1)*.25)*gr;
    c.strokeStyle=lc(s%2?"#5FA05A":"#4E8F50");c.lineCap="round";c.lineWidth=Math.max(3,h*.03);c.beginPath();c.moveTo(x,0);c.lineTo(x+(R(s+9)-.5)*h*.04,-sh);c.stroke();
    c.strokeStyle="#2F5E34";c.lineWidth=Math.max(1.5,h*.01);for(var k=1;k<6;k++){var y=-sh*k/6;c.beginPath();c.moveTo(x-h*.018,y);c.lineTo(x+h*.018,y);c.stroke()}
    if(g>.4){for(k=0;k<3;k++){leaf(c,x,-sh*(.55+k*.15),-.6-k*.3,h*.1*gr,h*.018*gr,lc("#6FB367"));leaf(c,x,-sh*(.6+k*.13),-Math.PI+.6+k*.3,h*.1*gr,h*.018*gr,lc("#5FA05A"))}}}
}
function bougainvillea(c,R,col,g,h){
  var gr=ease(clamp(g/.75,0,1));
  for(var s=0;s<3;s++){var dir=s-1,P0=[dir*h*.04,0],P1=[dir*h*.2,-h*.5*gr],P2=[dir*h*.34,-h*.62*gr];stemPath(c,P0,P1,P2,Math.max(2,h*.016),"#6B4F3A",1);
    for(var k=1;k<=7;k++){var p=qpt(P0,P1,P2,k/7);if(g>.2)leaf(c,p[0],p[1],k%2?-.4:-Math.PI+.4,h*.07*gr,h*.03*gr,lc(GREEN));
      if(g>.4&&SEASON!=="winter"){var bg=clamp((g-.4)/.5,0,1);for(var q=0;q<3;q++){c.fillStyle=shade(SEASON==="autumn"?"#C0436A":"#D6336C",(q-1)*.12);c.beginPath();c.ellipse(p[0]+(R(k*5+q)-.5)*h*.07,p[1]+(R(k*5+q+30)-.5)*h*.07,h*.032*bg,h*.022*bg,R(k+q)*3,0,6.283);c.fill()}}}}
}
function citrus(c,R,col,g,h){
  var gr=ease(clamp(g/.8,0,1)),th=h*.38*gr,i;
  c.strokeStyle="#6B4F3A";c.lineCap="round";c.lineWidth=Math.max(3,h*.045*gr);c.beginPath();c.moveTo(0,0);c.lineTo(0,-th);c.stroke();
  var cg=clamp((g-.12)/.88,0,1),n=14+Math.floor(cg*14),R0=h*.25*(.25+.75*cg),cy=-th-h*.03;
  for(i=0;i<n;i++){var a=R(i+5)*6.283,d=Math.sqrt(R(i+40))*R0,x=Math.cos(a)*d,y=cy+Math.sin(a)*d*.85;c.fillStyle=shade("#2F7A3E",(R(i+90)-.5)*.3);c.beginPath();c.arc(x,y,R0*.26,0,6.283);c.fill()}
  if(cg>.55&&SEASON!=="spring"){for(i=0;i<7;i++){c.fillStyle="#F29A1F";c.beginPath();c.arc((R(i+150)-.5)*R0*1.5,cy+(R(i+170)-.4)*R0*1.2,h*.02,0,6.283);c.fill()}}
  if(cg>.4&&SEASON==="spring"){for(i=0;i<9;i++){c.fillStyle="#FFFFFF";c.beginPath();c.arc((R(i+150)-.5)*R0*1.6,cy+(R(i+170)-.5)*R0*1.4,h*.011,0,6.283);c.fill()}}
  snowCap(c,0,cy-R0*.6,R0);
}
function ginkgo(c,R,col,g,h){
  var gr=ease(clamp(g/.8,0,1)),th=h*.55*gr;
  c.strokeStyle="#6B5A48";c.lineCap="round";c.lineWidth=Math.max(3,h*.04*gr);c.beginPath();c.moveTo(0,0);c.lineTo(h*.01,-th);c.stroke();
  if(SEASON==="winter"){snowCap(c,0,-th,h*.1);return}
  var cg=clamp((g-.12)/.88,0,1),n=18+Math.floor(cg*20),R0=h*.2*(.25+.75*cg),cy=-th-h*.06,base=SEASON==="autumn"?"#F0C419":SEASON==="spring"?"#9ED36A":"#5FA84F";
  for(var i=0;i<n;i++){var a=R(i+5)*6.283,d=Math.sqrt(R(i+40))*R0,x=Math.cos(a)*d*.8,y=cy+Math.sin(a)*d*1.25;c.fillStyle=shade(base,(R(i+90)-.5)*.3);c.beginPath();c.moveTo(x,y);c.arc(x,y,R0*.17,Math.PI,0);c.lineTo(x,y);c.fill()}
}
function cedar(c,R,col,g,h){
  var gr=ease(clamp(g/.85,0,1)),th=h*.5*gr;
  c.fillStyle="#6B4F3A";c.fillRect(-h*.03,-th,h*.06,th);
  var tiers=2+Math.floor(4*gr);
  for(var i=0;i<tiers;i++){var y=-th*.4-i*h*.11*gr,w=h*(.27-i*.04)*gr;c.fillStyle=shade("#2F6B45",(i%2?.07:-.05));c.beginPath();c.ellipse(R(i)*h*.03,y,w,h*.045*gr+1,0,0,6.283);c.fill();snowCap(c,0,y-h*.02,w*.8)}
}
function jasmine(c,R,col,g,h){
  var gr=ease(clamp(g/.75,0,1));
  for(var s=0;s<2;s++){var d=s?1:-1,P0=[d*h*.05,0],P1=[-d*h*.12,-h*.35*gr],P2=[d*h*.1,-h*.7*gr];stemPath(c,P0,P1,P2,Math.max(1.6,h*.014),GREEN2,1);
    for(var k=1;k<=9;k++){var p=qpt(P0,P1,P2,k/9);if(g>.15)leaf(c,p[0],p[1],k%2?-.6:-Math.PI+.6,h*.06*gr,h*.025*gr,lc(GREEN));
      if(g>.4&&SEASON!=="winter"&&SEASON!=="autumn"){var f=clamp((g-.4)/.5,0,1);c.fillStyle="#FFFFFF";for(var q=0;q<5;q++){var a=q*1.2566;c.beginPath();c.ellipse(p[0]+Math.cos(a)*h*.013*f,p[1]+Math.sin(a)*h*.013*f,h*.012*f,h*.006*f,a,0,6.283);c.fill()}}}}
}
function palm(c,R,col,g,h){
  var gr=ease(clamp(g/.85,0,1)),th=h*.6*gr;
  c.strokeStyle="#8A6A44";c.lineCap="round";c.lineWidth=Math.max(3,h*.04*gr);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(h*.08,-th*.5,h*.05,-th);c.stroke();
  var tx=h*.05,ty=-th;
  if(g>.2){for(var k=0;k<7;k++){var a=-Math.PI+k*Math.PI/6;leaf(c,tx,ty,a+(a<-Math.PI/2?.35:-.35),h*.3*gr,h*.05*gr,shade("#3FA66C",(k%2)*.1-.05))}}
  if(g>.5){c.fillStyle="#6B4F3A";c.beginPath();c.arc(tx,ty+h*.02,h*.018,0,6.283);c.fill();c.beginPath();c.arc(tx+h*.025,ty+h*.03,h*.018,0,6.283);c.fill()}
}
function glowflower(c,R,col,g,h){
  var gr=ease(clamp(g/.7,0,1)),top=h*.55*gr;
  stemPath(c,[0,0],[h*.03,-top*.5],[0,-top],Math.max(2,h*.018),"#2C7A7B",1);
  if(g>.2){var lg=clamp((g-.2)/.4,0,1);leaf(c,0,-top*.3,-.6,h*.16*lg,h*.05*lg,"#35A29F");leaf(c,0,-top*.45,-Math.PI+.6,h*.14*lg,h*.045*lg,"#2C8E8C")}
  var e=[0,-top],bg=clamp((g-.4)/.6,0,1),r=h*.11*(.3+.7*bg);
  var gg=c.createRadialGradient(e[0],e[1],0,e[0],e[1],r*2.4);gg.addColorStop(0,"rgba(160,255,240,.55)");gg.addColorStop(1,"rgba(160,255,240,0)");c.fillStyle=gg;c.beginPath();c.arc(e[0],e[1],r*2.4,0,6.283);c.fill();
  for(var k=0;k<8;k++){var a=k/8*6.283;petal(c,e[0],e[1],a,r*1.3,r*.32,k%2?"#9B7BEA":"#6FE3D2")}
  c.fillStyle="#FFF6B0";c.beginPath();c.arc(e[0],e[1],r*.25,0,6.283);c.fill();
}

DRAW.olive=olive;DRAW.pot=pot;DRAW.peony=peony;DRAW.hydrangea=hydrangea;DRAW.maple=maple;DRAW.bonsai=bonsai;DRAW.bamboo=bamboo;DRAW.bougainvillea=bougainvillea;DRAW.citrus=citrus;DRAW.ginkgo=ginkgo;DRAW.cedar=cedar;DRAW.jasmine=jasmine;DRAW.palm=palm;DRAW.glowflower=glowflower;
Object.assign(SEEDNOTE,{olive:"silver & ancient",pot:"balcony classic",peony:"fleeting",hydrangea:"moody blue",maple:"red in autumn",bonsai:"slow art",bamboo:"fast grower",bougainvillea:"wall of pink",citrus:"zesty",ginkgo:"gold fans",cedar:"for centuries",jasmine:"smells like night",palm:"far away",glowflower:"dreams only"});
/* ---------- seasons + city atmosphere ---------- */
function spCol(sp){var c0=SPECIES[sp].col;
  if(sp==="oak"){if(SEASON==="autumn")return mixHex(c0,"#D2792B",.7);if(SEASON==="winter")return mixHex(c0,"#9B8F80",.65);if(SEASON==="spring")return mixHex(c0,"#9ED36A",.3)}
  if(sp==="blossom"){if(SEASON==="autumn")return mixHex(c0,"#E3A04A",.55);if(SEASON==="winter")return mixHex(c0,"#FFFFFF",.6)}
  return c0}
var ZG={spring:["#6DB35A","#58A04C"],summer:["#5E9150","#4E7A45"],autumn:["#8E8A3E","#7A6B34"],winter:["#6F8A78","#5E7868"]};
function setGreen(){var g=ZG[SEASON];GREEN=g[0];GREEN2=g[1]}
var SZC={};
function seasonCity(C){
  var k=C.id+SEASON+C.name;if(SZC[k])return SZC[k];
  var S=SEASONS[SEASON],r={},p;for(p in C)r[p]=C[p];
  r.g1=mixHex(C.g1,S.gmix,S.ga);r.g2=mixHex(C.g2,S.gmix,S.ga*.9);r.h1=mixHex(C.h1,S.hmix,S.ha);r.h2=mixHex(C.h2,S.hmix,S.ha);r.bl=mixHex(C.bl,S.gmix,S.ga*.8);
  SZC[k]=r;return r}
function bird(c,x,y,s,fl,col){c.strokeStyle=col;c.lineWidth=Math.max(1.2,s*.16);c.lineCap="round";c.beginPath();c.moveTo(x-s,y-s*.3*fl-s*.1);c.quadraticCurveTo(x-s*.45,y-s*.6*fl,x,y);c.quadraticCurveTo(x+s*.45,y-s*.6*fl,x+s,y-s*.3*fl-s*.1);c.stroke()}
function seasonFx(c,W,H,u,t,dk){
  var i,x,y,s;
  if(SEASON==="spring"){for(i=0;i<24;i++){x=((rh(i*5+1)+t*.012*(.5+rh(i*5+2))+Math.sin(t*.6+i)*.03)%1+1)%1*W;y=((rh(i*5+3)+t*.035*(.5+rh(i*5+4)))%1)*H*.95;c.save();c.translate(x,y);c.rotate(t*(.6+rh(i))+i);c.fillStyle="rgba("+(250-(i%3)*8)+",178,"+(198+(i%4)*10)+","+(.85-dk*.35)+")";c.beginPath();c.ellipse(0,0,5.5*u+1,2.8*u+.6,0,0,6.2832);c.fill();c.restore()}}
  else if(SEASON==="autumn"){var LC=["#D9541E","#E8962E","#B5321F","#E6B83A","#9C4A1C"];for(i=0;i<20;i++){x=((rh(i*5+1)+t*.02*(.5+rh(i*5+2))+Math.sin(t*.8+i*2)*.04)%1+1)%1*W;y=((rh(i*5+3)+t*.05*(.6+rh(i*5+4)))%1)*H;c.save();c.translate(x,y);c.rotate(Math.sin(t*1.3+i)*.9+i);c.fillStyle=mixHex(LC[i%5],"#0F1B45",dk*.65);c.beginPath();c.ellipse(0,0,7*u+1.4,3.6*u+.8,0,0,6.2832);c.fill();c.restore()}}
  else if(SEASON==="winter"){c.fillStyle=dk>.4?"rgba(220,232,255,.9)":"rgba(255,255,255,.92)";for(i=0;i<66;i++){x=((rh(i*3+1)+Math.sin(t*.5+i)*.02)%1+1)%1*W;y=((rh(i*3+2)+t*.04*(.4+rh(i*3+3)*.8))%1)*H;s=(1+rh(i*3+4)*2.4)*u+.4;c.beginPath();c.arc(x,y,s,0,6.2832);c.fill()}}
}
function cityFx(c,W,H,u,t,dk,cid){
  var i,x,y;
  if((cid==="madrid"||cid==="lisbon")&&dk<.6){var bc=cid==="madrid"?"rgba(30,33,27,.72)":"rgba(255,255,255,.9)";for(i=0;i<4;i++){x=((t*.014*(1+i*.15)+rh(i+3)*1.2)%1.2-.1)*W;y=H*(.13+.055*i)+Math.sin(t*.8+i)*6*u;bird(c,x,y,(7+i)*u,reduce?.6:.5+.5*Math.sin(t*7+i*2),bc)}}
  if(cid==="paris"){for(i=0;i<14;i++){x=((rh(i*4+1)+t*.008*(.6+rh(i))+Math.sin(t*.5+i)*.03)%1+1)%1*W;y=H*(.3+((rh(i*4+2)-t*.012*(.5+rh(i*4+3)))%1+1)%1*.55);c.fillStyle="rgba(255,182,203,"+(.55-dk*.25)+")";c.save();c.translate(x,y);c.rotate(t*.8+i);c.beginPath();c.ellipse(0,0,4*u+.8,2.2*u+.5,0,0,6.2832);c.fill();c.restore()}}
  if(cid==="london"){c.save();c.globalAlpha=.18-dk*.06;for(i=0;i<3;i++){x=((t*.01*(1+i*.4)+i*.37)%1.4-.2)*W;y=H*(.55+i*.045);var mg=c.createRadialGradient(x,y,0,x,y,W*.3);mg.addColorStop(0,"#FFFFFF");mg.addColorStop(1,"rgba(255,255,255,0)");c.save();c.translate(0,y);c.scale(1,.18);c.translate(0,-y);c.fillStyle=mg;c.beginPath();c.arc(x,y,W*.3,0,6.2832);c.fill();c.restore()}c.restore();
    c.strokeStyle="rgba(200,215,235,"+(.26-dk*.1)+")";c.lineWidth=Math.max(1,1.1*u);c.beginPath();for(i=0;i<44;i++){x=((rh(i*4)*1.2+t*.015)%1.2)*W;y=((rh(i*4+1)+t*.55*(.6+rh(i*4+2)*.6))%1)*H*.75;c.moveTo(x,y);c.lineTo(x-3*u,y+11*u)}c.stroke()}
  if(cid==="kyoto"&&SEASON!=="winter"){for(i=0;i<10;i++){x=((rh(i*5+1)+t*.012*(.5+rh(i*5+2))+Math.sin(t*.7+i)*.03)%1+1)%1*W;y=((rh(i*5+3)+t*.03*(.6+rh(i*5+4)))%1)*H*.9;c.save();c.translate(x,y);c.rotate(Math.sin(t*1.1+i)*.8+i);c.fillStyle=mixHex(SEASON==="spring"?"#F6A6BE":"#C2262E","#0F1B45",dk*.6);c.beginPath();c.ellipse(0,0,6*u+1.2,3*u+.7,0,0,6.2832);c.fill();c.restore()}}
  if(cid==="newyork"){c.save();c.globalAlpha=.2*(1-dk*.4);for(i=0;i<7;i++){var ph=((t*.12+i*.14)%1);x=W*.5+Math.sin(ph*6+i)*10*u;y=H*.745-ph*H*.2;c.fillStyle="#FFFFFF";c.beginPath();c.arc(x,y,(8+ph*22)*u,0,6.2832);c.globalAlpha=.2*(1-dk*.4)*(1-ph);c.fill()}c.restore()}
  if(cid==="lebanon"&&dk<.7){c.fillStyle="rgba(255,214,140,.55)";for(i=0;i<18;i++){x=((rh(i*3+1)+Math.sin(t*.4+i)*.03)%1+1)%1*W;y=H*(.78-((rh(i*3+2)+t*.02*(.4+rh(i*3+3)))%1)*.5);c.beginPath();c.arc(x,y,(1+rh(i)*1.6)*u,0,6.2832);c.fill()}}
  if(cid==="dream"){c.save();c.globalCompositeOperation="screen";var cols=["#6FE3D2","#9B7BEA","#F59AD0"];for(i=0;i<3;i++){c.globalAlpha=(.1+dk*.2);c.strokeStyle=cols[i];c.lineWidth=(34-i*8)*u;c.lineCap="round";c.beginPath();var y0=H*(.12+i*.045);c.moveTo(-20*u,y0);for(x=0;x<=W+40*u;x+=W/12)c.lineTo(x,y0+Math.sin(x/W*5+t*.5+i*1.3)*H*.04);c.stroke()}c.restore();
    for(i=0;i<20;i++){x=rh(i*7+1)*W;y=rh(i*7+2)*H*.6;var tw=.35+.65*Math.abs(Math.sin(t*1.2+i*2.3));c.fillStyle="rgba(255,255,255,"+tw*.8+")";c.fillRect(x,y,2.2*u+.4,2.2*u+.4)}}
}

/* ---------- scene ---------- */
function wins(c,x,y,w,h,u,dk,s){if(dk<.25)return;c.fillStyle="rgba(255,226,150,"+(dk*.85)+")";var k=0;for(var yy=y+6*u;yy<y+h-8*u;yy+=12*u)for(var xx=x+5*u;xx<x+w-7*u;xx+=10*u){if(rh(s*977+k++)>.5)c.fillRect(xx,yy,4*u,6*u)}}
var BACK={},LM={};
BACK.madrid=function(c,W,H,u,ng,dk,t){
  var base=H*.64,cols=["#C98F6E","#D9B38A","#B7745A","#E3C7A0","#A9694F"],x=-10*u,i=0;
  while(x<W){var w=(36+rh(i*5+1)*44)*u,h=(40+rh(i*5+2)*80)*u;c.fillStyle=ng(cols[i%cols.length]);c.fillRect(x,base-h,w,h);wins(c,x,base-h,w,h,u,dk,i);x+=w+2*u;i++}
  var mx=W*.62;c.fillStyle=ng("#E8DCC4");c.fillRect(mx-34*u,base-130*u,68*u,130*u);wins(c,mx-34*u,base-130*u,68*u,130*u,u,dk,91);
  c.fillStyle=ng("#7A8A9A");c.beginPath();c.arc(mx,base-130*u,26*u,Math.PI,0);c.fill();c.fillStyle=ng("#D9A84A");c.fillRect(mx-2*u,base-190*u,4*u,34*u);
};
BACK.paris=function(c,W,H,u,ng,dk,t){
  var base=H*.64,x=-10*u,i=0;
  while(x<W){var w=(50+rh(i*5+1)*30)*u,h=(46+rh(i*5+2)*20)*u;c.fillStyle=ng(i%2?"#D8CFC4":"#E6DDD0");c.fillRect(x,base-h,w,h);
    c.fillStyle=ng("#5F6B7C");c.beginPath();c.moveTo(x-3*u,base-h);c.lineTo(x+w*.18,base-h-24*u);c.lineTo(x+w*.82,base-h-24*u);c.lineTo(x+w+3*u,base-h);c.fill();
    c.fillStyle=ng("#8F7B70");c.fillRect(x+w*.7,base-h-34*u,5*u,14*u);wins(c,x,base-h,w,h,u,dk,i);x+=w+3*u;i++}
  var ex=W*.7,eh=H*.5,bw=70*u;c.fillStyle=ng("#5C4E5E");
  c.beginPath();c.moveTo(ex-bw,base);c.lineTo(ex-bw*.5,base-eh*.3);c.lineTo(ex-bw*.16,base-eh*.62);c.lineTo(ex-bw*.04,base-eh);c.lineTo(ex+bw*.04,base-eh);c.lineTo(ex+bw*.16,base-eh*.62);c.lineTo(ex+bw*.5,base-eh*.3);c.lineTo(ex+bw,base);c.lineTo(ex+bw*.62,base);c.lineTo(ex,base-eh*.2);c.lineTo(ex-bw*.62,base);c.closePath();c.fill();
  c.fillRect(ex-bw*.52,base-eh*.3-3*u,bw*1.04,5*u);c.fillRect(ex-bw*.17,base-eh*.62-3*u,bw*.34,4*u);
  if(dk>.3){var gl=c.createRadialGradient(ex,base-eh*.5,0,ex,base-eh*.5,eh*.5);gl.addColorStop(0,"rgba(255,214,120,"+dk*.35+")");gl.addColorStop(1,"rgba(255,214,120,0)");c.fillStyle=gl;c.fillRect(ex-eh*.5,base-eh*1.05,eh,eh*1.1)}
};
BACK.kyoto=function(c,W,H,u,ng,dk,t){
  var base=H*.64;
  [["#9FB3C2",.45,.34],["#8DA3B4",.8,.4],["#A9BDC9",.15,.28]].forEach(function(m){c.fillStyle=ng(m[0]);c.beginPath();c.moveTo(W*(m[1]-.3),base);c.quadraticCurveTo(W*m[1],base-H*(m[2]+.1),W*(m[1]+.3),base);c.fill()});
  var px=W*.27,hh=22*u,y=base,i;
  for(i=0;i<5;i++){var w=64*u*(1-i*.14);c.fillStyle=ng("#A64B4B");c.fillRect(px-w*.4,y-hh,w*.8,hh);
    c.fillStyle=ng("#4A3A3A");c.beginPath();c.moveTo(px-w*.75,y-hh);c.lineTo(px+w*.75,y-hh);c.lineTo(px+w*.55,y-hh-8*u);c.lineTo(px-w*.55,y-hh-8*u);c.fill();
    if(dk>.3){c.fillStyle="rgba(255,206,130,"+dk*.8+")";c.fillRect(px-4*u,y-hh*.8,8*u,9*u)}y-=hh+4*u}
  c.fillStyle=ng("#4A3A3A");c.fillRect(px-1.5*u,y-22*u,3*u,26*u);
  for(i=0;i<10;i++){var tx=W*(.5+rh(i+40)*.45),ty=base-rh(i+50)*14*u;c.fillStyle=ng("#6B4A3A");c.fillRect(tx-1.5*u,ty-12*u,3*u,14*u);c.fillStyle=ng(i%2?"#F2B6C4":"#F7CBD3");c.beginPath();c.arc(tx,ty-14*u,(16+rh(i)*8)*u,0,Math.PI*2);c.fill()}
};
BACK.lisbon=function(c,W,H,u,ng,dk,t){
  var base=H*.64,i;c.fillStyle=ng("#D9B98A");c.beginPath();c.moveTo(0,base);c.quadraticCurveTo(W*.3,base-H*.2,W*.62,base-H*.04);c.lineTo(W*.62,base);c.fill();
  for(i=0;i<26;i++){var x=W*(i/26)*.72+rh(i)*14*u,hy=base-(H*.14)*Math.sin(Math.PI*Math.min(1,x/(W*.62)))*(.6+rh(i+3)*.4)-4*u,w=(22+rh(i+7)*14)*u,h=(18+rh(i+9)*14)*u;
    c.fillStyle=ng(["#F1E3C9","#EAD2A8","#F4C9B0","#E8DCC4"][i%4]);c.fillRect(x,hy-h,w,h);c.fillStyle=ng("#C0623C");c.beginPath();c.moveTo(x-2*u,hy-h);c.lineTo(x+w/2,hy-h-9*u);c.lineTo(x+w+2*u,hy-h);c.fill();
    if(dk>.25){c.fillStyle="rgba(255,226,150,"+dk*.8+")";c.fillRect(x+w*.35,hy-h*.65,w*.25,h*.3)}}
  var cx=W*.34,cy=base-H*.2;c.fillStyle=ng("#CDB89A");c.fillRect(cx-60*u,cy-34*u,120*u,34*u);for(i=0;i<8;i++)c.fillRect(cx-60*u+i*16*u,cy-42*u,9*u,9*u);c.fillRect(cx-70*u,cy-60*u,20*u,60*u);c.fillRect(cx+50*u,cy-60*u,20*u,60*u);
  [-60,40].forEach(function(o){c.beginPath();c.moveTo(cx+o*u-4*u,cy-60*u);c.lineTo(cx+o*u+10*u,cy-80*u);c.lineTo(cx+o*u+24*u,cy-60*u);c.fill()});
  var rg=c.createLinearGradient(0,base-6*u,0,base+8*u);rg.addColorStop(0,ng("#9DC4D6"));rg.addColorStop(1,ng("#7FA9BD"));c.fillStyle=rg;c.fillRect(W*.62,base-8*u,W*.4,16*u);
};
BACK.newyork=function(c,W,H,u,ng,dk,t){
  var base=H*.64,x=-6*u,i=0,cols=["#5A6B86","#6E7F99","#4C5B75","#7A8AA3"];
  while(x<W){var w=(28+rh(i*5+1)*34)*u,h=(50+rh(i*5+2)*130)*u;c.fillStyle=ng(cols[i%4]);c.fillRect(x,base-h,w,h);if(rh(i*5+3)>.6)c.fillRect(x+w*.45,base-h-18*u,2*u,18*u);wins(c,x,base-h,w,h,u,dk,i);x+=w+1.5*u;i++}
  var ex=W*.58;c.fillStyle=ng("#7C8CA6");c.fillRect(ex-26*u,base-150*u,52*u,150*u);c.fillRect(ex-18*u,base-190*u,36*u,40*u);c.fillRect(ex-11*u,base-222*u,22*u,32*u);c.fillRect(ex-5*u,base-246*u,10*u,24*u);c.fillRect(ex-1.2*u,base-290*u,2.4*u,46*u);
  wins(c,ex-26*u,base-150*u,52*u,150*u,u,dk,77);
  if(dk>.3){c.fillStyle="rgba(255,150,170,"+dk*.9+")";c.fillRect(ex-5*u,base-246*u,10*u,6*u)}
};
LM.debod=function(c,W,H,u,ng,dk,t,x){var y=H*.745;
  c.fillStyle=ng("#9FC3D2");c.beginPath();c.ellipse(x,y+12*u,110*u,20*u,0,0,Math.PI*2);c.fill();
  c.globalAlpha=.3;c.fillStyle=ng("#D6C3A0");c.fillRect(x-70*u,y+4*u,34*u,26*u);c.fillRect(x+36*u,y+4*u,34*u,26*u);c.globalAlpha=1;
  c.fillStyle=ng("#D6C3A0");c.fillRect(x-74*u,y-78*u,34*u,78*u);c.fillRect(x+40*u,y-78*u,34*u,78*u);c.fillRect(x-84*u,y-98*u,168*u,14*u);c.fillRect(x-76*u,y-86*u,152*u,10*u);
  c.fillStyle=ng("#8A7A5E");c.fillRect(x-60*u,y-70*u,6*u,18*u);c.fillRect(x+54*u,y-70*u,6*u,18*u);
  if(dk>.3){c.fillStyle="rgba(255,200,120,"+dk*.5+")";c.fillRect(x-74*u,y-78*u,34*u,10*u);c.fillRect(x+40*u,y-78*u,34*u,10*u)}};
LM.alcala=function(c,W,H,u,ng,dk,t,x){var y=H*.745;c.fillStyle=ng("#E0D2B4");c.fillRect(x-95*u,y-84*u,190*u,84*u);c.fillRect(x-100*u,y-96*u,200*u,12*u);c.fillRect(x-30*u,y-116*u,60*u,22*u);c.fillRect(x-4*u,y-130*u,8*u,16*u);
  c.fillStyle=ng("#A89873");[[-70,26,50],[70,26,50],[0,36,70]].forEach(function(a){var r=a[1]*u/2,cx=x+a[0]*u,top=y-a[2]*u+r;c.beginPath();c.moveTo(cx-r,y);c.lineTo(cx-r,top);c.arc(cx,top,r,Math.PI,0);c.lineTo(cx+r,y);c.fill()});
  if(dk>.3){c.fillStyle="rgba(255,200,120,"+dk*.5+")";c.fillRect(x-100*u,y-96*u,200*u,5*u)}};
LM.crystal=function(c,W,H,u,ng,dk,t,x){var y=H*.745;c.fillStyle="rgba(210,235,245,"+(.6-dk*.15)+")";c.fillRect(x-70*u,y-62*u,140*u,62*u);c.beginPath();c.moveTo(x-80*u,y-62*u);c.lineTo(x,y-110*u);c.lineTo(x+80*u,y-62*u);c.fill();c.beginPath();c.arc(x,y-62*u,26*u,Math.PI,0);c.fill();
  c.strokeStyle=ng("#7E9AA6");c.lineWidth=1.6*u;for(var i=-3;i<=3;i++){c.beginPath();c.moveTo(x+i*20*u,y);c.lineTo(x+i*20*u,y-62*u);c.stroke()}c.strokeRect(x-70*u,y-62*u,140*u,62*u);c.beginPath();c.moveTo(x-80*u,y-62*u);c.lineTo(x,y-110*u);c.lineTo(x+80*u,y-62*u);c.closePath();c.stroke();
  if(dk>.3){c.fillStyle="rgba(255,214,140,"+dk*.35+")";c.fillRect(x-70*u,y-62*u,140*u,62*u)}};
LM.carousel=function(c,W,H,u,ng,dk,t,x){var y=H*.745,i;c.fillStyle=ng("#B98F7E");c.beginPath();c.ellipse(x,y,70*u,14*u,0,0,Math.PI*2);c.fill();
  var rot=reduce?0:t*.8;c.strokeStyle=ng("#E8D7A8");c.lineWidth=3*u;
  for(i=0;i<6;i++){var a=rot+i*Math.PI/3,px=x+Math.cos(a)*48*u,bob=Math.sin(t*2+i)*3*u;c.beginPath();c.moveTo(px,y);c.lineTo(px,y-50*u+bob);c.stroke();c.fillStyle=ng(i%2?"#F6D3D8":"#fff");c.beginPath();c.ellipse(px,y-24*u+bob,9*u,7*u,0,0,Math.PI*2);c.fill()}
  for(i=0;i<6;i++){c.fillStyle=ng(i%2?"#fff":"#D9758F");c.beginPath();c.moveTo(x,y-96*u);c.lineTo(x-82*u+i*27.3*u,y-52*u);c.lineTo(x-82*u+(i+1)*27.3*u,y-52*u);c.fill()}
  c.fillStyle=ng("#E8D7A8");c.fillRect(x-2*u,y-110*u,4*u,16*u);if(dk>.3){c.fillStyle="rgba(255,226,150,"+dk+")";for(i=0;i<5;i++){c.beginPath();c.arc(x-60*u+i*30*u,y-52*u,3*u,0,Math.PI*2);c.fill()}}};
LM.cafe=function(c,W,H,u,ng,dk,t,x){var y=H*.745,i;c.fillStyle=ng("#E6DDD0");c.fillRect(x-70*u,y-80*u,140*u,80*u);
  for(i=0;i<7;i++){c.fillStyle=ng(i%2?"#fff":"#B64B5C");c.fillRect(x-70*u+i*20*u,y-64*u,20*u,16*u)}
  c.fillStyle=ng("#B64B5C");c.beginPath();c.moveTo(x-76*u,y-48*u);c.lineTo(x+76*u,y-48*u);c.lineTo(x+66*u,y-36*u);c.lineTo(x-66*u,y-36*u);c.fill();
  c.fillStyle=dk>.3?"rgba(255,214,140,"+(.4+dk*.5)+")":ng("#A9C4D0");c.fillRect(x-56*u,y-34*u,112*u,30*u);
  [-44,44].forEach(function(o){c.fillStyle=ng("#4B2E26");c.fillRect(x+o*u-1.5*u,y+4*u,3*u,14*u);c.fillStyle=ng("#F4EEE2");c.beginPath();c.ellipse(x+o*u,y+4*u,14*u,4.5*u,0,0,Math.PI*2);c.fill();c.fillStyle=ng("#4B2E26");c.beginPath();c.arc(x+o*u-22*u,y+8*u,5*u,0,Math.PI*2);c.arc(x+o*u+22*u,y+8*u,5*u,0,Math.PI*2);c.fill()})};
LM.arc=function(c,W,H,u,ng,dk,t,x){var y=H*.745;c.fillStyle=ng("#E3D3B3");c.fillRect(x-80*u,y-120*u,160*u,120*u);c.fillRect(x-86*u,y-132*u,172*u,14*u);c.fillStyle=ng("#CDB993");c.fillRect(x-80*u,y-108*u,160*u,8*u);
  c.fillStyle=ng("#9C8B6E");c.beginPath();c.moveTo(x-30*u,y);c.lineTo(x-30*u,y-70*u);c.arc(x,y-70*u,30*u,Math.PI,0);c.lineTo(x+30*u,y);c.fill();
  if(dk>.3){c.fillStyle="rgba(255,200,120,"+dk*.6+")";c.fillRect(x-30*u,y-8*u,60*u,8*u)}};
LM.torii=function(c,W,H,u,ng,dk,t,x){var y=H*.745;c.fillStyle=ng("#C0392B");c.fillRect(x-48*u,y-100*u,12*u,100*u);c.fillRect(x+36*u,y-100*u,12*u,100*u);c.fillRect(x-58*u,y-92*u,116*u,8*u);
  c.beginPath();c.moveTo(x-72*u,y-102*u);c.quadraticCurveTo(x,y-90*u,x+72*u,y-102*u);c.lineTo(x+72*u,y-112*u);c.quadraticCurveTo(x,y-100*u,x-72*u,y-112*u);c.fill();c.fillStyle=ng("#2B2B2B");c.fillRect(x-48*u,y-6*u,12*u,6*u);c.fillRect(x+36*u,y-6*u,12*u,6*u)};
LM.lantern=function(c,W,H,u,ng,dk,t,x){var y=H*.745,s=ng("#A8A39A");c.fillStyle=s;c.fillRect(x-18*u,y-8*u,36*u,8*u);c.fillRect(x-6*u,y-50*u,12*u,42*u);c.fillRect(x-20*u,y-58*u,40*u,8*u);
  c.fillStyle=dk>.25?"rgba(255,206,120,"+(.5+dk*.5)+")":ng("#6E6A62");c.fillRect(x-13*u,y-82*u,26*u,24*u);c.fillStyle=s;c.beginPath();c.moveTo(x-26*u,y-82*u);c.lineTo(x,y-100*u);c.lineTo(x+26*u,y-82*u);c.fill();c.beginPath();c.arc(x,y-103*u,5*u,0,Math.PI*2);c.fill();
  if(dk>.25){var g=c.createRadialGradient(x,y-70*u,0,x,y-70*u,70*u);g.addColorStop(0,"rgba(255,206,120,"+dk*.5+")");g.addColorStop(1,"rgba(255,206,120,0)");c.fillStyle=g;c.fillRect(x-80*u,y-150*u,160*u,160*u)}};
LM.koi=function(c,W,H,u,ng,dk,t,x){var y=H*.745,i;c.fillStyle=ng("#8FB8C4");c.beginPath();c.ellipse(x,y+8*u,100*u,22*u,0,0,Math.PI*2);c.fill();
  c.strokeStyle=ng("#B8412F");c.lineWidth=7*u;c.lineCap="round";c.beginPath();c.moveTo(x-70*u,y+6*u);c.quadraticCurveTo(x,y-44*u,x+70*u,y+6*u);c.stroke();
  for(i=0;i<3;i++){var kx=x+Math.sin(t*.6+i*2)*60*u,ky=y+14*u+Math.cos(t*.5+i*3)*6*u;c.fillStyle=ng(i%2?"#F08A4B":"#FFF4EA");c.beginPath();c.ellipse(kx,ky,8*u,3.5*u,Math.cos(t*.6+i*2)*.6,0,Math.PI*2);c.fill()}};
LM.tram=function(c,W,H,u,ng,dk,t,x){var y=H*.745,bob=reduce?0:Math.sin(t*3)*.8*u,i;c.fillStyle=ng("#F2C230");c.fillRect(x-60*u,y-52*u+bob,120*u,38*u);c.fillStyle=ng("#E8E0D0");c.fillRect(x-60*u,y-30*u+bob,120*u,6*u);
  c.fillStyle=dk>.25?"rgba(255,226,150,"+(.5+dk*.5)+")":ng("#7FA9BD");for(i=0;i<4;i++)c.fillRect(x-52*u+i*28*u,y-46*u+bob,20*u,14*u);
  c.fillStyle=ng("#4B2E26");c.beginPath();c.arc(x-38*u,y-14*u,7*u,0,Math.PI*2);c.arc(x+38*u,y-14*u,7*u,0,Math.PI*2);c.fill();c.strokeStyle=ng("#4B2E26");c.lineWidth=1.6*u;c.beginPath();c.moveTo(x,y-52*u+bob);c.lineTo(x+14*u,y-78*u);c.lineTo(x+30*u,y-78*u);c.stroke();c.fillStyle=ng("#C0392B");c.fillRect(x-60*u,y-14*u+bob,120*u,4*u)};
LM.azulejo=function(c,W,H,u,ng,dk,t,x){var y=H*.745;c.fillStyle=ng("#F4EEE2");c.fillRect(x-70*u,y-96*u,140*u,96*u);
  for(var r=0;r<6;r++)for(var k=0;k<9;k++){var px=x-66*u+k*14.6*u,py=y-92*u+r*15.2*u;c.fillStyle=ng((r+k)%2?"#2F5FA8":"#7FA7D9");c.fillRect(px,py,12*u,12*u);c.fillStyle=ng("#F4EEE2");c.beginPath();c.arc(px+6*u,py+6*u,2.6*u,0,Math.PI*2);c.fill()}
  c.strokeStyle=ng("#B9A27A");c.lineWidth=4*u;c.strokeRect(x-70*u,y-96*u,140*u,96*u)};
LM.belem=function(c,W,H,u,ng,dk,t,x){var y=H*.745,s=ng("#E6D8B8"),i;c.fillStyle=ng("#9DC4D6");c.beginPath();c.ellipse(x,y+10*u,90*u,14*u,0,0,Math.PI*2);c.fill();
  c.fillStyle=s;c.fillRect(x-30*u,y-110*u,60*u,110*u);c.fillRect(x-36*u,y-122*u,72*u,12*u);for(i=0;i<5;i++)c.fillRect(x-36*u+i*16*u,y-130*u,9*u,9*u);
  [-46,46].forEach(function(o){c.fillStyle=s;c.fillRect(x+o*u-9*u,y-72*u,18*u,72*u);c.fillStyle=ng("#C8B590");c.beginPath();c.moveTo(x+o*u-11*u,y-72*u);c.lineTo(x+o*u,y-92*u);c.lineTo(x+o*u+11*u,y-72*u);c.fill()});
  c.fillStyle=ng("#B49E78");c.fillRect(x-9*u,y-70*u,18*u,22*u);c.beginPath();c.arc(x,y-70*u,9*u,Math.PI,0);c.fill();c.fillStyle=ng("#7E6C4E");c.fillRect(x-2*u,y-146*u,4*u,16*u)};
LM.taxi=function(c,W,H,u,ng,dk,t,x){var y=H*.745;c.fillStyle=ng("#F6C21A");c.beginPath();c.moveTo(x-62*u,y-12*u);c.lineTo(x-62*u,y-32*u);c.lineTo(x-34*u,y-36*u);c.lineTo(x-20*u,y-56*u);c.lineTo(x+28*u,y-56*u);c.lineTo(x+42*u,y-36*u);c.lineTo(x+62*u,y-32*u);c.lineTo(x+62*u,y-12*u);c.fill();
  c.fillStyle=dk>.25?"rgba(255,226,150,"+(.5+dk*.5)+")":ng("#7FA9BD");c.beginPath();c.moveTo(x-16*u,y-52*u);c.lineTo(x-30*u,y-36*u);c.lineTo(x+36*u,y-36*u);c.lineTo(x+24*u,y-52*u);c.fill();
  c.fillStyle=ng("#2B2B2B");c.beginPath();c.arc(x-36*u,y-10*u,9*u,0,Math.PI*2);c.arc(x+36*u,y-10*u,9*u,0,Math.PI*2);c.fill();c.fillStyle=ng("#fff");c.fillRect(x-8*u,y-64*u,20*u,8*u)};
LM.liberty=function(c,W,H,u,ng,dk,t,x){var y=H*.745,g=ng("#7FB7A4"),i;c.fillStyle=ng("#C9BBA6");c.fillRect(x-30*u,y-40*u,60*u,40*u);c.fillRect(x-22*u,y-62*u,44*u,22*u);
  c.fillStyle=g;c.beginPath();c.moveTo(x-18*u,y-62*u);c.lineTo(x-12*u,y-110*u);c.lineTo(x+12*u,y-110*u);c.lineTo(x+18*u,y-62*u);c.fill();c.beginPath();c.arc(x,y-120*u,11*u,0,Math.PI*2);c.fill();
  for(i=-3;i<=3;i++){c.beginPath();c.moveTo(x+i*3.5*u,y-129*u);c.lineTo(x+i*8*u,y-146*u+Math.abs(i)*4*u);c.lineTo(x+i*3.5*u+3*u,y-128*u);c.fill()}
  c.strokeStyle=g;c.lineWidth=5*u;c.lineCap="round";c.beginPath();c.moveTo(x+10*u,y-106*u);c.lineTo(x+26*u,y-148*u);c.stroke();
  c.fillStyle=dk>.2?"rgba(255,206,100,1)":ng("#F2C230");c.beginPath();c.ellipse(x+26*u,y-154*u,6*u,9*u,0,0,Math.PI*2);c.fill()};
LM.bridge=function(c,W,H,u,ng,dk,t,x){var y=H*.745,s=ng("#8A7A6A");
  c.fillStyle=ng("#6B5E52");c.fillRect(x-200*u,y-24*u,400*u,8*u);
  [-110,110].forEach(function(o){c.fillStyle=s;c.fillRect(x+o*u-16*u,y-124*u,32*u,124*u);c.fillStyle=ng("#5A4E44");c.beginPath();c.moveTo(x+o*u-8*u,y-30*u);c.lineTo(x+o*u-8*u,y-80*u);c.arc(x+o*u,y-80*u,8*u,Math.PI,0);c.lineTo(x+o*u+8*u,y-30*u);c.fill()});
  c.strokeStyle=ng("#C9C0B2");c.lineWidth=2*u;c.beginPath();c.moveTo(x-110*u,y-124*u);c.quadraticCurveTo(x,y+10*u,x+110*u,y-124*u);c.stroke();
  c.beginPath();c.moveTo(x-200*u,y-24*u);c.quadraticCurveTo(x-150*u,y-100*u,x-110*u,y-124*u);c.stroke();c.beginPath();c.moveTo(x+200*u,y-24*u);c.quadraticCurveTo(x+150*u,y-100*u,x+110*u,y-124*u);c.stroke();
  c.lineWidth=1*u;for(var s2=.08;s2<1;s2+=.08){var a=1-s2,px=a*a*(x-110*u)+2*a*s2*x+s2*s2*(x+110*u),py=a*a*(y-124*u)+2*a*s2*(y+10*u)+s2*s2*(y-124*u);c.beginPath();c.moveTo(px,py);c.lineTo(px,y-24*u);c.stroke()}
  if(dk>.3){c.fillStyle="rgba(255,214,140,"+dk+")";for(var k=-4;k<=4;k++){c.beginPath();c.arc(x+k*40*u,y-26*u,2.2*u,0,Math.PI*2);c.fill()}}};
BACK.london=function(c,W,H,u,ng,dk,t){
  var base=H*.64,cols=["#8E7B72","#A28F83","#76665F","#B3A294","#9A8478"],x=-10*u,i=0;
  while(x<W){var w=(34+rh(i*5+1)*40)*u,h=(34+rh(i*5+2)*58)*u;c.fillStyle=ng(cols[i%cols.length]);c.fillRect(x,base-h,w,h);
    c.fillStyle=ng("#5B4F4A");c.fillRect(x+w*.2,base-h-9*u,4*u,9*u);c.fillRect(x+w*.55,base-h-12*u,4*u,12*u);wins(c,x,base-h,w,h,u,dk,i);x+=w+2*u;i++}
  var ex=W*.32,ey=base-92*u,r=70*u;
  c.strokeStyle=ng("#E8EEF2");c.lineWidth=3*u;c.beginPath();c.arc(ex,ey,r,0,Math.PI*2);c.stroke();
  c.lineWidth=1*u;for(i=0;i<12;i++){var a=i/12*Math.PI*2+(reduce?0:t*.03);c.beginPath();c.moveTo(ex,ey);c.lineTo(ex+Math.cos(a)*r,ey+Math.sin(a)*r);c.stroke();c.fillStyle=ng("#CFE3EE");c.beginPath();c.arc(ex+Math.cos(a)*r,ey+Math.sin(a)*r,3*u,0,Math.PI*2);c.fill()}
  c.lineWidth=4*u;c.beginPath();c.moveTo(ex-18*u,base);c.lineTo(ex,ey);c.lineTo(ex+18*u,base);c.stroke();
  var sx2=W*.72;c.fillStyle=ng("#9FB8C8");c.beginPath();c.moveTo(sx2-26*u,base);c.lineTo(sx2,base-190*u);c.lineTo(sx2+26*u,base);c.closePath();c.fill();
  c.strokeStyle=ng("#DCE9F0");c.lineWidth=1*u;for(i=1;i<8;i++){var yy=base-190*u*i/8,hw=26*u*(1-i/8);c.beginPath();c.moveTo(sx2-hw,yy);c.lineTo(sx2+hw,yy);c.stroke()}
  if(dk>.3){c.fillStyle="rgba(255,226,160,"+dk*.25+")";c.beginPath();c.moveTo(sx2-26*u,base);c.lineTo(sx2,base-190*u);c.lineTo(sx2+26*u,base);c.fill()}
};
BACK.lebanon=function(c,W,H,u,ng,dk,t){
  var base=H*.64,i;
  [[.22,.3],[.52,.38],[.82,.3]].forEach(function(m){var px=W*m[0],ph=H*m[1],hw=W*.2;c.fillStyle=ng("#8CA2BE");c.beginPath();c.moveTo(px-hw,base);c.lineTo(px,base-ph);c.lineTo(px+hw,base);c.fill();
    c.fillStyle=ng("#F4F8FC");c.beginPath();c.moveTo(px-hw*.26,base-ph*.74);c.lineTo(px,base-ph);c.lineTo(px+hw*.26,base-ph*.74);c.lineTo(px+hw*.1,base-ph*.82);c.lineTo(px,base-ph*.72);c.lineTo(px-hw*.12,base-ph*.8);c.fill()});
  var cols=["#E3CFA8","#D9BE92","#EBDDBF","#C9A87C"],x=-8*u;i=0;
  while(x<W){var w=(36+rh(i*5+1)*34)*u,h=(28+rh(i*5+2)*46)*u;c.fillStyle=ng(cols[i%4]);c.fillRect(x,base-h,w,h);c.fillStyle=ng("#B79A72");c.fillRect(x+w*.6,base-h-6*u,9*u,6*u);wins(c,x,base-h,w,h,u,dk,i);x+=w+2*u;i++}
  [.14,.58,.86].forEach(function(tx,ti){var w=24*u,h=(120+ti*18)*u,px=W*tx;c.fillStyle=ng("#7E9BB0");c.fillRect(px-w/2,base-h,w,h);c.fillStyle=ng("#A9C2D2");c.fillRect(px-w/2,base-h,4*u,h);wins(c,px-w/2,base-h,w,h,u,dk,60+ti)});
  for(i=0;i<6;i++){var qx=W*(.08+i*.17+rh(i+70)*.05);c.strokeStyle=ng("#6B5238");c.lineWidth=3*u;c.beginPath();c.moveTo(qx,base);c.lineTo(qx+3*u,base-34*u);c.stroke();for(var k=0;k<5;k++)leaf(c,qx+3*u,base-34*u,-Math.PI+k*Math.PI/4,22*u,4*u,ng("#4C8A52"))}
};
BACK.dream=function(c,W,H,u,ng,dk,t){
  var base=H*.64,i;
  c.fillStyle=ng("#CBB8F2");c.beginPath();c.arc(W*.5,H*.2,34*u,0,Math.PI*2);c.fill();
  c.strokeStyle=ng("#F2D9FF");c.lineWidth=4*u;c.beginPath();c.ellipse(W*.5,H*.2,62*u,13*u,-.35,0,Math.PI*2);c.stroke();
  [["#C3B5E6",.18,.26],["#B2CBE6",.5,.32],["#C9E0D8",.84,.25]].forEach(function(m){c.fillStyle=ng(m[0]);c.beginPath();c.moveTo(W*(m[1]-.3),base);c.quadraticCurveTo(W*m[1],base-H*(m[2]+.1),W*(m[1]+.3),base);c.fill()});
  [[.12,.36,.9],[.3,.27,.6],[.7,.31,.8],[.9,.23,.55]].forEach(function(f,fi){var fx=W*f[0],fy=H*f[1]+(reduce?0:Math.sin(t*.7+fi*2)*6*u),s=f[2]*u;
    c.fillStyle=ng("#7A6A8F");c.beginPath();c.moveTo(fx-52*s,fy);c.lineTo(fx,fy+62*s);c.lineTo(fx+52*s,fy);c.fill();
    c.fillStyle=ng("#7FC9A4");c.beginPath();c.ellipse(fx,fy,56*s,12*s,0,0,Math.PI*2);c.fill();
    c.fillStyle=ng("#6B4F3A");c.fillRect(fx+14*s,fy-22*s,4*s,22*s);c.fillStyle=ng("#3F9A72");c.beginPath();c.arc(fx+16*s,fy-28*s,13*s,0,Math.PI*2);c.fill();
    if(dk>.3){c.fillStyle="rgba(255,226,170,"+dk*.8+")";c.fillRect(fx-20*s,fy-8*s,5*s,7*s)}});
  for(i=0;i<9;i++){var gx=W*(.05+i*.11),gh=(24+rh(i+90)*50)*u;c.fillStyle=ng("#9C8AD0");c.beginPath();c.moveTo(gx-9*u,base);c.lineTo(gx,base-gh);c.lineTo(gx+9*u,base);c.fill();if(dk>.3){c.fillStyle="rgba(190,240,255,"+dk*.7+")";c.fillRect(gx-1.5*u,base-gh*.5,3*u,5*u)}}
};
LM.bigben=function(c,W,H,u,ng,dk,t,x){var y=H*.745,i;
  c.fillStyle=ng("#D2BE94");c.fillRect(x-24*u,y-130*u,48*u,130*u);c.fillRect(x-30*u,y-24*u,60*u,24*u);
  c.fillStyle=ng("#C2AC80");c.fillRect(x-28*u,y-150*u,56*u,22*u);
  c.fillStyle=ng("#4F5A52");c.beginPath();c.moveTo(x-26*u,y-150*u);c.lineTo(x,y-205*u);c.lineTo(x+26*u,y-150*u);c.closePath();c.fill();c.fillRect(x-1.5*u,y-222*u,3*u,18*u);
  c.fillStyle=dk>.3?"rgba(255,233,168,.95)":ng("#FFFFFF");c.beginPath();c.arc(x,y-138*u,13*u,0,Math.PI*2);c.fill();
  c.strokeStyle="#2B2B2B";c.lineWidth=1.6*u;c.beginPath();c.moveTo(x,y-138*u);c.lineTo(x,y-146*u);c.moveTo(x,y-138*u);c.lineTo(x+6*u,y-135*u);c.stroke();
  for(i=0;i<4;i++){c.fillStyle=dk>.3?"rgba(255,214,140,"+dk*.8+")":ng("#8E7C58");c.fillRect(x-4*u,y-110*u+i*20*u,8*u,12*u)}
};
LM.bus=function(c,W,H,u,ng,dk,t,x){var y=H*.745,bob=reduce?0:Math.sin(t*3)*.6*u,i;
  c.fillStyle=ng("#D12B2B");c.fillRect(x-64*u,y-60*u+bob,128*u,52*u);c.fillStyle=ng("#F2F2F2");c.fillRect(x-64*u,y-32*u+bob,128*u,3*u);
  for(i=0;i<6;i++){c.fillStyle=dk>.3?"rgba(255,226,160,.9)":ng("#CFE6F2");c.fillRect(x-58*u+i*20*u,y-54*u+bob,14*u,16*u);c.fillRect(x-58*u+i*20*u,y-26*u+bob,14*u,14*u)}
  [-38,38].forEach(function(d){c.fillStyle="#1E1E1E";c.beginPath();c.arc(x+d*u,y-6*u,9*u,0,Math.PI*2);c.fill();c.fillStyle="#9A9A9A";c.beginPath();c.arc(x+d*u,y-6*u,4*u,0,Math.PI*2);c.fill()});
};
LM.towerbridge=function(c,W,H,u,ng,dk,t,x){var y=H*.745,s=ng("#9AA8B8"),r=ng("#55657D");
  c.fillStyle=ng("#7FA6C4");c.beginPath();c.ellipse(x,y+6*u,150*u,12*u,0,0,Math.PI*2);c.fill();
  [-60,60].forEach(function(d){c.fillStyle=s;c.fillRect(x+d*u-14*u,y-120*u,28*u,120*u);c.fillStyle=r;c.beginPath();c.moveTo(x+d*u-18*u,y-120*u);c.lineTo(x+d*u,y-152*u);c.lineTo(x+d*u+18*u,y-120*u);c.fill();
    if(dk>.3){c.fillStyle="rgba(255,214,140,"+dk*.8+")";c.fillRect(x+d*u-3*u,y-100*u,6*u,10*u);c.fillRect(x+d*u-3*u,y-70*u,6*u,10*u)}});
  c.fillStyle=s;c.fillRect(x-60*u,y-96*u,120*u,7*u);c.fillStyle=ng("#6F7F95");c.fillRect(x-150*u,y-22*u,300*u,7*u);
  c.strokeStyle=ng("#3F6FB0");c.lineWidth=3*u;c.beginPath();c.moveTo(x-150*u,y-22*u);c.quadraticCurveTo(x-110*u,y-100*u,x-60*u,y-110*u);c.moveTo(x+150*u,y-22*u);c.quadraticCurveTo(x+110*u,y-100*u,x+60*u,y-110*u);c.moveTo(x-46*u,y-96*u);c.quadraticCurveTo(x,y-60*u,x+46*u,y-96*u);c.stroke();
};
LM.raouche=function(c,W,H,u,ng,dk,t,x){var y=H*.745;
  c.fillStyle=ng("#7FB0C8");c.beginPath();c.ellipse(x,y+6*u,120*u,18*u,0,0,Math.PI*2);c.fill();
  c.fillStyle=ng("#9A9488");c.beginPath();c.moveTo(x-78*u,y+4*u);c.quadraticCurveTo(x-82*u,y-70*u,x-52*u,y-104*u);c.quadraticCurveTo(x-16*u,y-112*u,x-8*u,y-60*u);c.quadraticCurveTo(x-2*u,y-20*u,x+2*u,y+4*u);c.closePath();c.fill();
  c.fillStyle=ng("#B6D4E2");c.beginPath();c.ellipse(x-42*u,y-22*u,13*u,22*u,0,0,Math.PI*2);c.fill();
  c.fillStyle=ng("#8A8478");c.beginPath();c.moveTo(x+30*u,y+4*u);c.quadraticCurveTo(x+34*u,y-50*u,x+60*u,y-70*u);c.quadraticCurveTo(x+90*u,y-40*u,x+98*u,y+4*u);c.closePath();c.fill();
  c.fillStyle="rgba(255,255,255,.14)";c.beginPath();c.ellipse(x-60*u,y-70*u,8*u,24*u,.3,0,Math.PI*2);c.fill();
  c.strokeStyle="rgba(255,255,255,.7)";c.lineWidth=2*u;for(var i=0;i<5;i++){var wx=x-70*u+i*38*u,wb=reduce?0:Math.sin(t*2+i)*2*u;c.beginPath();c.ellipse(wx,y+5*u+wb*.3,14*u,3*u,0,0,Math.PI);c.stroke()}
};
LM.cedar=function(c,W,H,u,ng,dk,t,x){var y=H*.745;
  c.fillStyle=ng("#6B4F3A");c.beginPath();c.moveTo(x-10*u,y);c.lineTo(x-6*u,y-70*u);c.lineTo(x+6*u,y-70*u);c.lineTo(x+10*u,y);c.fill();
  [[0,-70,78,16],[8,-92,66,14],[-6,-112,52,13],[2,-130,36,11]].forEach(function(l,li){c.fillStyle=ng(["#2F6B45","#3A7B50","#2A5F3E","#44895A"][li]);c.beginPath();c.ellipse(x+l[0]*u,y+l[1]*u,l[2]*u,l[3]*u,0,0,Math.PI*2);c.fill()});
};
LM.baalbek=function(c,W,H,u,ng,dk,t,x){var y=H*.745,i;
  c.fillStyle=ng("#D6C49C");c.fillRect(x-100*u,y-14*u,200*u,14*u);c.fillRect(x-92*u,y-24*u,184*u,10*u);
  for(i=0;i<6;i++){var cx2=x-80*u+i*32*u;c.fillStyle=ng("#E9D8AE");c.fillRect(cx2-6*u,y-120*u,12*u,96*u);c.fillStyle=ng("#CDB98C");c.fillRect(cx2-4*u,y-120*u,3*u,96*u);c.fillStyle=ng("#E2D0A4");c.fillRect(cx2-9*u,y-126*u,18*u,6*u)}
  c.fillStyle=ng("#DCC9A0");c.fillRect(x-96*u,y-140*u,192*u,14*u);c.fillRect(x-86*u,y-152*u,172*u,12*u);
  if(dk>.3){c.fillStyle="rgba(255,200,130,"+dk*.18+")";c.fillRect(x-100*u,y-152*u,200*u,152*u)}
};
LM.balloon=function(c,W,H,u,ng,dk,t,x){var y=H*.745,bob=reduce?0:Math.sin(t*.9)*6*u,cy=y-130*u+bob,r=46*u,i;
  c.strokeStyle=ng("#6B4F3A");c.lineWidth=1.2*u;[[-18,-8],[18,8]].forEach(function(p){c.beginPath();c.moveTo(x+p[0]*u,cy+r*.85);c.lineTo(x+p[1]*u,cy+r+28*u);c.stroke()});
  c.fillStyle=ng("#9A6B45");c.fillRect(x-12*u,cy+r+28*u,24*u,16*u);
  c.fillStyle=ng("#E85D75");c.beginPath();c.moveTo(x-r*.55,cy+r*.8);c.lineTo(x+r*.55,cy+r*.8);c.lineTo(x+14*u,cy+r+6*u);c.lineTo(x-14*u,cy+r+6*u);c.fill();
  var cs=["#E85D75","#FFD166","#7FDCEB","#B39CF0"];
  c.fillStyle=ng(cs[0]);c.beginPath();c.arc(x,cy,r,0,Math.PI*2);c.fill();
  for(i=1;i<4;i++){c.fillStyle=ng(cs[i]);c.beginPath();c.ellipse(x,cy,r*(1-i*.24),r,0,0,Math.PI*2);c.fill()}
  if(dk>.2){c.save();c.globalCompositeOperation="screen";var bg=c.createRadialGradient(x,cy+r+24*u,0,x,cy+r+24*u,36*u);bg.addColorStop(0,"rgba(255,190,100,"+dk*.7+")");bg.addColorStop(1,"rgba(255,190,100,0)");c.fillStyle=bg;c.fillRect(x-40*u,cy+r-12*u,80*u,70*u);c.restore()}
};
LM.lighthouse=function(c,W,H,u,ng,dk,t,x){var y=H*.745;
  c.fillStyle=ng("#6F6A78");c.beginPath();c.ellipse(x,y+2*u,70*u,12*u,0,0,Math.PI*2);c.fill();
  function hw(h){return 20*u-8*u*(h/120)}
  c.fillStyle=ng("#F4F1EA");c.beginPath();c.moveTo(x-hw(0),y);c.lineTo(x-hw(120),y-120*u);c.lineTo(x+hw(120),y-120*u);c.lineTo(x+hw(0),y);c.fill();
  [[14,40],[68,94]].forEach(function(s){c.fillStyle=ng("#D94A4A");c.beginPath();c.moveTo(x-hw(s[0]),y-s[0]*u);c.lineTo(x+hw(s[0]),y-s[0]*u);c.lineTo(x+hw(s[1]),y-s[1]*u);c.lineTo(x-hw(s[1]),y-s[1]*u);c.fill()});
  c.fillStyle=ng("#3A3F55");c.fillRect(x-16*u,y-126*u,32*u,6*u);
  c.fillStyle=dk>.2?"rgba(255,236,160,.95)":ng("#CFE6F2");c.fillRect(x-9*u,y-142*u,18*u,16*u);
  c.fillStyle=ng("#D94A4A");c.beginPath();c.moveTo(x-12*u,y-142*u);c.lineTo(x,y-158*u);c.lineTo(x+12*u,y-142*u);c.fill();
  if(dk>.25){var sn=Math.sin(t*.8),dir=sn>0?1:-1;c.save();c.globalCompositeOperation="screen";c.fillStyle="rgba(255,240,170,"+dk*.28*Math.abs(sn)+")";c.beginPath();c.moveTo(x,y-134*u);c.lineTo(x+dir*520*u,y-190*u);c.lineTo(x+dir*520*u,y-80*u);c.fill();c.restore()}
};
LM.hammock=function(c,W,H,u,ng,dk,t,x){var y=H*.745;
  c.fillStyle=ng("#E9D8A6");c.beginPath();c.ellipse(x,y+4*u,100*u,10*u,0,0,Math.PI*2);c.fill();
  function palm(px,lean){c.strokeStyle=ng("#7A5A3E");c.lineWidth=7*u;c.lineCap="round";c.beginPath();c.moveTo(px,y);c.quadraticCurveTo(px+lean*10*u,y-60*u,px+lean*26*u,y-108*u);c.stroke();
    for(var k=0;k<7;k++)leaf(c,px+lean*26*u,y-108*u,-Math.PI+k*Math.PI/6+(reduce?0:Math.sin(t*.8+k)*.05),54*u,11*u,ng(k%2?"#2F8F5B":"#3FA66C"))}
  palm(x-70*u,-1);palm(x+70*u,1);
  c.strokeStyle=ng("#E88AA6");c.lineWidth=5*u;c.beginPath();c.moveTo(x-83*u,y-72*u);c.quadraticCurveTo(x,y-34*u,x+83*u,y-72*u);c.stroke();
  if(dk>.2){c.save();c.globalCompositeOperation="screen";var lg=c.createRadialGradient(x,y-50*u,0,x,y-50*u,36*u);lg.addColorStop(0,"rgba(255,206,130,"+dk*.7+")");lg.addColorStop(1,"rgba(255,206,130,0)");c.fillStyle=lg;c.fillRect(x-40*u,y-90*u,80*u,80*u);c.restore()}
};
var KEYS=[[0,"#050A1C","#142447"],[4.5,"#0B1633","#2B3F73"],[5.8,"#2A3F78","#E68F78"],[7,"#4F86C6","#F5C9A0"],[9,"#3C86D2","#B9DDF0"],[12,"#2776D0","#A9D6F2"],[16,"#3B82CC","#C5DFEE"],[17.8,"#5A7FBD","#F4C48F"],[19,"#3A4E92","#F08C6B"],[20.3,"#18224E","#6A5A9A"],[22,"#0A1230","#1C2F5A"],[24,"#050A1C","#142447"]];
function skyAt(h){
  for(var i=0;i<KEYS.length-1;i++){var a=KEYS[i],b=KEYS[i+1];if(h>=a[0]&&h<=b[0]){var t=(h-a[0])/(b[0]-a[0]);var top=mixHex(a[1],b[1],t);return {top:top,bot:mixHex(a[2],b[2],t),dark:clamp((.40-lum(top))/.30,0,1)}}}
  return {top:KEYS[0][1],bot:KEYS[0][2],dark:1};
}
var STARS=[],BLADES=[],i0;
for(i0=0;i0<170;i0++)STARS.push([rh(i0*3+1),rh(i0*3+2)*.55,rh(i0*3+3)]);
for(i0=0;i0<720;i0++)BLADES.push([rh(i0*5+11),rh(i0*5+12),rh(i0*5+13)]);
var FLW=[];for(i0=0;i0<120;i0++)FLW.push([rh(i0*7+21),rh(i0*7+22)]);
var SPR={};
function nightOf(cv){var nv=document.createElement("canvas");nv.width=cv.width;nv.height=cv.height;var nx=nv.getContext("2d");nx.drawImage(cv,0,0);nx.globalCompositeOperation="source-atop";nx.fillStyle="rgba(14,26,72,.62)";nx.fillRect(0,0,nv.width,nv.height);return nv}
function stageMap(cid){var all=D.sessions.filter(function(s){return s.city===cid&&s.ok}).sort(function(a,b){return a.ts-b.ts}),m={};all.forEach(function(s,i){var g=clamp(.28+(all.length-1-i)*.09,.28,1);m[s.id]=Math.min(6,Math.floor((g-.28)/.12+1e-6))});return m}
function sprite(s,stage,K0){
  var K=K0||1.3,sp0=s.sp||subjById(s.subj).sp,st=stage==null?6:stage,key=s.id+(s.ok?"o"+st:"w")+sp0+SEASON+K;
  if(!SPR[key]){
    if(Object.keys(SPR).length>240)SPR={};
    var cv=document.createElement("canvas");cv.width=Math.round(260*K);cv.height=Math.round(300*K);var cx=cv.getContext("2d");cx.scale(K,K);cx.translate(130,290);
    if(s.ok) drawPlant(cx,sp0,s.seed,spCol(sp0),STAGE_G[st],235); else drawWilted(cx,130);
    cx.setTransform(1,0,0,1,0,0);cx.globalCompositeOperation="source-atop";
    var lg=cx.createLinearGradient(0,0,0,cv.height);lg.addColorStop(0,"rgba(255,248,210,.22)");lg.addColorStop(.55,"rgba(0,0,0,0)");lg.addColorStop(1,"rgba(0,18,12,.34)");cx.fillStyle=lg;cx.fillRect(0,0,cv.width,cv.height);
    if(SEASON==="winter"){var fg2=cx.createLinearGradient(0,0,0,cv.height*.8);fg2.addColorStop(0,"rgba(255,255,255,.5)");fg2.addColorStop(1,"rgba(255,255,255,.04)");cx.fillStyle=fg2;cx.fillRect(0,0,cv.width,cv.height)}
    cx.globalCompositeOperation="source-over";
    SPR[key]={d:cv,n:null};
  }
  return SPR[key];
}
function layout(W,H,cid){
  var all=D.sessions.filter(function(s){return s.city===cid}).sort(function(a,b){return a.ts-b.ts}),sm=stageMap(cid),start=Math.max(0,all.length-22),out=[];
  var rows=[.7,.8,.92],sc=[.6,.78,1];
  (DECOR[cid]||[]).forEach(function(d,j){out.push({s:{id:"dc-"+cid+j,sp:d.sp,seed:500+j*91+cid.charCodeAt(0),ok:true,city:cid,decor:true},x:W*d.x*.9+W*.05,y:H*(d.r?.755:.7)+rh(j*5+9)*H*.01,k:d.k*.8*W/1000,stage:6,decor:true,f:d.f})});
  for(var i=start;i<all.length;i++){
    var row=Math.floor(rh(i*13+5)*3),x=(((i+1)*.618034)%1)*W*.88+W*.06;
    out.push({s:all[i],x:x,y:H*rows[row]+rh(i*7+3)*H*.02,k:sc[row]*W/1000,stage:all[i].ok?sm[all[i].id]:6});
  }
  out.sort(function(a,b){return a.y-b.y});
  return out;
}
function hourNow(sky){
  if(sky==="day")return 12;if(sky==="dusk")return 18.8;if(sky==="night")return 1;
  var d=new Date();return d.getHours()+d.getMinutes()/60;
}
function rgba(h,a){var c=h2r(h);return "rgba("+c[0]+","+c[1]+","+c[2]+","+a+")"}
var GRAIN=null;
function grainPat(c){
  if(GRAIN===null){try{var g=document.createElement("canvas");g.width=g.height=128;var gc=g.getContext("2d"),id=gc.createImageData(128,128);for(var q=0;q<id.data.length;q+=4){var v=rh(q)*255|0;id.data[q]=id.data[q+1]=id.data[q+2]=v;id.data[q+3]=255}gc.putImageData(id,0,0);GRAIN=g}catch(e){GRAIN=false}}
  return GRAIN?c.createPattern(GRAIN,"repeat"):null;
}
function cloudPuff(c,cx,cy,s,lit,shd,al){
  var P=[[0,0,1],[.95,-.22,.8],[-.9,-.12,.78],[1.75,.06,.58],[-1.7,.1,.55],[.35,-.5,.7],[-.4,.1,.9]];
  c.save();c.translate(cx,cy);c.scale(1,.6);
  for(var pass=0;pass<2;pass++){for(var q=0;q<P.length;q++){var p=P[q],r=46*s*p[2],x=p[0]*46*s,y=p[1]*30*s+(pass?-r*.14:r*.16),col=pass?lit:shd;
    var g=c.createRadialGradient(x,y,r*.08,x,y,r);g.addColorStop(0,rgba(col,al));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,6.2832);c.fill()}}
  c.restore();
}
function drawScene(c,W,H,o){
  SEASON=curSeason();setGreen();var SZ=SEASONS[SEASON];
  var u=W/1000,hr=o.hour,sk=skyAt(hr),dk=sk.dark,t=o.t,CT=seasonCity(o.city),i,k;
  var tn=CT.ta*.5*(1-dk);sk={top:mixHex(sk.top,CT.tint,tn*.35),bot:mixHex(sk.bot,CT.tint,tn),dark:dk};sk.top=mixHex(sk.top,SZ.sky,SZ.sa*.55*(1-dk));sk.bot=mixHex(sk.bot,SZ.sky,SZ.sa*(1-dk));
  var ng=function(col){return mixHex(col,"#0F1B45",dk*.74)};
  var hz=mixHex(sk.bot,"#FFFFFF",.12);
  var day=hr>=6&&hr<=19,p=0,el=0,sx=0,sy=0,warm=0,mp=0,mx=0,my=0,LI={dx:0,len:.6,a:.1};
  if(day){p=(hr-6)/13;el=Math.sin(Math.PI*p);sx=W*(.08+.84*p);sy=H*(.55-.43*el);warm=clamp(1-el*1.7,0,1);LI.dx=-(p-.5)*2;LI.len=.35+(1-el)*1.5;LI.a=.38*(.3+.7*el)*(1-dk*.85)}
  else{mp=clamp(((hr>=19?hr-19:hr+5))/10.5,0,1);mx=W*(.1+.8*mp);my=H*(.5-.34*Math.sin(Math.PI*mp));LI.dx=-(mp-.5)*2;LI.len=.8;LI.a=.16*dk}
  var gr=c.createLinearGradient(0,0,0,H*.68);gr.addColorStop(0,sk.top);gr.addColorStop(.6,mixHex(sk.top,sk.bot,.6));gr.addColorStop(1,sk.bot);c.fillStyle=gr;c.fillRect(0,0,W,H);
  if(o.hits)CEL={x:day?sx:mx,y:day?sy:my,r:40*u,day:day};
  if(dk>.12){
    c.save();c.translate(W*.55,H*.2);c.rotate(-.5);c.scale(1,.16);var mg=c.createRadialGradient(0,0,0,0,0,W*.7);mg.addColorStop(0,"rgba(190,205,255,"+dk*.2+")");mg.addColorStop(1,"rgba(190,205,255,0)");c.fillStyle=mg;c.beginPath();c.arc(0,0,W*.7,0,6.2832);c.fill();c.restore();
    for(i=0;i<STARS.length;i++){var s=STARS[i],sz=(.7+s[2]*1.8)*u+.3;c.globalAlpha=dk*(.3+.7*Math.abs(Math.sin(t*(.8+s[2]*1.6)+s[2]*9)))*(s[1]<.35?1:.7);c.fillStyle=s[2]>.8?"#BFD8FF":s[2]<.2?"#FFE2C0":"#F2F7FF";c.fillRect(s[0]*W,s[1]*H,sz,sz)}
    c.globalAlpha=1;
    if(dk>.6&&!reduce){var ph=(t%12)/1.2;if(ph<1){var x0=W*(.15+.4*rh(Math.floor(t/12))),y0=H*.08;c.strokeStyle="rgba(230,240,255,"+(1-ph)*.8+")";c.lineWidth=1.6*u;c.beginPath();c.moveTo(x0+ph*W*.2,y0+ph*H*.1);c.lineTo(x0+ph*W*.2-60*u,y0+ph*H*.1-30*u);c.stroke()}}
  }
  if(day){
    c.save();c.globalCompositeOperation="screen";
    var hg=c.createRadialGradient(sx,sy,0,sx,sy,380*u);hg.addColorStop(0,rgba(mixHex("#FFF1CC","#FF9A66",warm),.55*(1-dk*.5)));hg.addColorStop(.3,rgba(mixHex("#FFD9A0","#FF7A55",warm),.2));hg.addColorStop(1,"rgba(255,200,150,0)");c.fillStyle=hg;c.fillRect(0,0,W,H);
    if(warm>.05){c.save();c.translate(sx,H*.6);c.scale(1,.22);var hl=c.createRadialGradient(0,0,0,0,0,W*.6);hl.addColorStop(0,rgba("#FF8A55",.5*warm));hl.addColorStop(1,"rgba(255,138,85,0)");c.fillStyle=hl;c.beginPath();c.arc(0,0,W*.6,0,6.2832);c.fill();c.restore()}
    if(el<.6){for(k=0;k<9;k++){var an=Math.PI/2+(k-4)*.19+(reduce?0:Math.sin(t*.1+k)*.02);c.fillStyle="rgba(255,226,170,"+.05*(1-el)+")";c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+Math.cos(an-.035)*1100*u,sy+Math.sin(an-.035)*1100*u);c.lineTo(sx+Math.cos(an+.035)*1100*u,sy+Math.sin(an+.035)*1100*u);c.fill()}}
    c.restore();
    var sd=c.createRadialGradient(sx,sy,0,sx,sy,30*u);sd.addColorStop(0,"#FFFFFF");sd.addColorStop(.7,mixHex("#FFF6DC","#FF9A66",warm*.9));sd.addColorStop(1,mixHex("#FFE9B0","#FF7A4F",warm));c.fillStyle=sd;c.beginPath();c.arc(sx,sy,28*u,0,6.2832);c.fill();
  } else {
    c.save();c.globalCompositeOperation="screen";var mh=c.createRadialGradient(mx,my,0,mx,my,200*u);mh.addColorStop(0,"rgba(190,210,255,"+.4*dk+")");mh.addColorStop(.25,"rgba(150,180,240,"+.14*dk+")");mh.addColorStop(1,"rgba(120,160,230,0)");c.fillStyle=mh;c.fillRect(0,0,W,H);c.restore();
    var md=c.createRadialGradient(mx-8*u,my-8*u,2*u,mx,my,26*u);md.addColorStop(0,"#FFFFFF");md.addColorStop(1,"#C6D0E8");c.fillStyle=md;c.beginPath();c.arc(mx,my,25*u,0,6.2832);c.fill();
    c.fillStyle="rgba(120,135,175,.32)";[[-.3,-.2,.24],[.28,.12,.3],[-.1,.38,.18],[.38,-.36,.13]].forEach(function(m){c.beginPath();c.arc(mx+m[0]*25*u,my+m[1]*25*u,m[2]*25*u,0,6.2832);c.fill()});
  }
  var lit=ng(mixHex("#FFFFFF",mixHex(sk.bot,"#FFB07A",.4),warm*.7+.1)),shd=ng(mixHex("#8FA6C6",sk.top,.35));
  [[0,.15,1.25,5],[330,.25,.9,8],[700,.12,1.1,4],[1000,.3,.8,9]].forEach(function(q){var cx=((t*q[3]+q[0]*u*1.3)%(W+500*u))-250*u;cloudPuff(c,cx,H*q[1],q[2]*u*1.1,lit,shd,.5*(1-dk*.35))});
  if(o.unl&&o.unl.rainbow){var cols=["#F08A8A","#F6B67A","#F7E08A","#9ED08A","#8AB8E0","#B79AE0"];cols.forEach(function(rc,i){c.strokeStyle=rc;c.globalAlpha=.3*(1-dk*.6);c.lineWidth=11*u;c.beginPath();c.arc(W*.76,H*.7,(300-i*11)*u,Math.PI*1.08,Math.PI*1.92);c.stroke()});c.globalAlpha=1}
  function hy(x,base,amp,fr,ph){return H*base+Math.sin(x/W*fr*6.283+ph)*amp*H+Math.sin(x/W*fr*13+ph*2)*amp*H*.4}
  function mount(base,amp,sd,col,topc){
    var n=64,st=W/n;c.beginPath();c.moveTo(0,H);
    for(var q=0;q<=n;q++){var x=q*st,yy=H*base-amp*H*(Math.abs(Math.sin(x/W*2.6+sd))*.62+Math.abs(Math.sin(x/W*6.1+sd*2.3))*.28+rh(q+sd*40)*.1);c.lineTo(x,yy)}
    c.lineTo(W,H);c.closePath();var g=c.createLinearGradient(0,H*(base-amp),0,H*base);g.addColorStop(0,topc);g.addColorStop(1,col);c.fillStyle=g;c.fill()}
  function hill(base,amp,fr,ph,col,lt){var g=c.createLinearGradient(0,H*(base-amp*1.6),0,H*(base+.1));g.addColorStop(0,lt);g.addColorStop(1,col);c.fillStyle=g;c.beginPath();c.moveTo(0,H);for(var x=0;x<=W+1;x+=W/50)c.lineTo(x,hy(x,base,amp,fr,ph));c.lineTo(W,H);c.closePath();c.fill()}
  function trees(base,amp,fr,ph,col,sz,gap,sd){c.fillStyle=col;for(var x=sz,q=0;x<W;x+=gap*(.7+rh(q+sd)*.6),q++){var y=hy(x,base,amp,fr,ph),r=sz*(.7+rh(q*3+sd)*.7);c.beginPath();c.ellipse(x,y-r*.35,r*.8,r,0,0,6.2832);c.fill()}}
  mount(.54,.2,CT.id.charCodeAt(0),ng(mixHex("#6E8DB4",hz,.5)),ng(mixHex("#8AA6C8",hz,.35)));
  mount(.555,.1,CT.id.charCodeAt(0)*2,ng(mixHex("#587A9E",hz,.38)),ng(mixHex("#7494B6",hz,.3)));
  hill(.56,.035,1.2,0,ng(mixHex(CT.h1,hz,.4)),ng(mixHex(shade(CT.h1,.12),hz,.5)));
  trees(.56,.035,1.2,0,ng(mixHex(shade(CT.h1,-.2),hz,.45)),6*u,11*u,10);
  BACK[CT.id](c,W,H,u,ng,dk,t);
  var vg2=c.createLinearGradient(0,H*.42,0,H*.65);vg2.addColorStop(0,rgba(hz,0));vg2.addColorStop(1,rgba(hz,.34*(1-dk*.4)));c.fillStyle=vg2;c.fillRect(0,H*.42,W,H*.23);
  hill(.63,.03,.9,2,ng(mixHex(CT.h2,hz,.15)),ng(mixHex(shade(CT.h2,.16),hz,.25)));
  trees(.63,.03,.9,2,ng(shade(CT.h2,-.28)),9*u,15*u,40);
  var G0=H*.68,gg=c.createLinearGradient(0,G0,0,H);gg.addColorStop(0,ng(mixHex(CT.g1,hz,.2)));gg.addColorStop(.35,ng(CT.g1));gg.addColorStop(1,ng(shade(CT.g2,-.12)));c.fillStyle=gg;c.fillRect(0,G0,W,H-G0);
  for(k=0;k<9;k++){var ya=G0+(H-G0)*Math.pow(k/9,1.6),yb=G0+(H-G0)*Math.pow((k+1)/9,1.6);c.fillStyle=k%2?"rgba(255,255,230,"+.04*(1-dk)+")":"rgba(0,20,10,.05)";c.fillRect(0,ya,W,yb-ya)}
  var FL=SEASON==="autumn"?["#E8A23A","#C75A2B","#F2D27A","#B5482A","#E9C46A"]:SEASON==="winter"?["#FFFFFF","#EAF4FF","#FFFFFF","#D6E6F5","#FFFFFF"]:SEASON==="spring"?["#FFB3D1","#FFFFFF","#FFF3A0","#C8B6FF","#FF9EC4"]:["#FFF3A0","#FFFFFF","#FF9EC4","#B7A3FF","#8FE0FF"];
  c.globalAlpha=SEASON==="winter"?.5:.8;for(i=0;i<FLW.length;i++){var f=FLW[i];c.fillStyle=ng(FL[i%5]);c.beginPath();c.arc(f[0]*W,G0+f[1]*(H-G0)*.98,(1+f[1]*2.6)*u,0,6.2832);c.fill()}c.globalAlpha=1;
  var bt=[ng(shade(CT.bl,-.28)),ng(CT.bl),ng(mixHex(CT.bl,"#D8F08A",.4*(1-dk)))];
  function blades(front){
    c.lineCap="round";
    for(var tone=0;tone<3;tone++){c.strokeStyle=bt[tone];c.lineWidth=(front?2.6:1.3)*u+.3;c.beginPath();
      for(var q=tone;q<BLADES.length;q+=3){var b=BLADES[q],d=b[1];if((d>.93)!==front)continue;var bx=b[0]*W,by=G0+d*(H-G0),bl=(5+d*d*24+b[2]*10)*u*(front?1.8:1),sw=reduce?0:Math.sin(t*1.2+b[0]*20+d*3)*(1+d*2.4)*u*1.6;c.moveTo(bx,by);c.quadraticCurveTo(bx+sw*.3,by-bl*.6,bx+sw+(b[2]-.5)*4*u,by-bl)}
      c.stroke()}}
  blades(false);
  function shadowAt(x,y,w,h){
    var L=LI.dx*LI.len,rx=w*.28+Math.abs(L)*h*.28;
    c.save();c.translate(x+L*h*.3,y);c.scale(1,.2);var g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,"rgba(6,20,16,"+Math.min(1,LI.a*1.5)+")");g.addColorStop(1,"rgba(6,20,16,0)");c.fillStyle=g;c.beginPath();c.arc(0,0,rx,0,6.2832);c.fill();c.restore();
    c.save();c.translate(x,y);c.scale(1,.25);var g2=c.createRadialGradient(0,0,0,0,0,w*.16);g2.addColorStop(0,"rgba(6,20,16,.45)");g2.addColorStop(1,"rgba(6,20,16,0)");c.fillStyle=g2;c.beginPath();c.arc(0,0,w*.16,0,6.2832);c.fill();c.restore();
  }
  var U=o.unl||{};
  if(U.lanterns){[.1,.32,.68,.93].forEach(function(lx,i){var x=W*lx,y=H*(.74+(i%2)*.03);c.fillStyle=ng("#2A3A44");c.fillRect(x-2*u,y-70*u,4*u,70*u);
    var glow=.25+dk*.75;c.save();c.globalCompositeOperation="screen";var lg=c.createRadialGradient(x,y-76*u,0,x,y-76*u,70*u);lg.addColorStop(0,"rgba(255,214,140,"+glow*.8+")");lg.addColorStop(1,"rgba(255,214,140,0)");c.fillStyle=lg;c.fillRect(x-80*u,y-150*u,160*u,160*u);c.restore();
    c.fillStyle="rgba(255,226,170,"+(.55+dk*.45)+")";c.beginPath();c.arc(x,y-76*u,9*u,0,6.2832);c.fill()})}
  CT.lm.forEach(function(l,li){if(U.lm&&U.lm[li]){
    if(dk>.2){c.save();c.globalCompositeOperation="screen";var ug=c.createRadialGradient(W*l.x,H*.62,0,W*l.x,H*.62,150*u);ug.addColorStop(0,"rgba(255,200,130,"+.28*dk+")");ug.addColorStop(1,"rgba(255,200,130,0)");c.fillStyle=ug;c.fillRect(W*l.x-160*u,H*.62-160*u,320*u,320*u);c.restore()}
    LM[l.draw](c,W,H,u,ng,dk,t,W*l.x)}});
  if(o.focus){
    var f2=o.focus;shadowAt(W*.5,H*.9,110*u,H*.5);
    c.save();c.translate(W*.5,H*.9);c.scale(1,.2);var sg=c.createRadialGradient(0,0,0,0,0,100*u);sg.addColorStop(0,ng("#4E382D"));sg.addColorStop(.7,ng("#65483A"));sg.addColorStop(1,"rgba(90,64,50,0)");c.fillStyle=sg;c.beginPath();c.arc(0,0,100*u,0,6.2832);c.fill();c.restore();
    c.save();c.translate(W*.5,H*.9);
    if(f2.pop!=null&&f2.pop<1)c.scale(1+.07*Math.sin(f2.pop*Math.PI),1+.1*Math.sin(f2.pop*Math.PI));
    if(f2.wilt) drawWilted(c,H*.35); else drawPlant(c,f2.sp,f2.seed,spCol(f2.sp),f2.g,H*.62);
    c.restore();
    if(f2.pop!=null&&f2.pop<2.6){var pp=f2.pop/2.6;c.save();c.globalCompositeOperation="screen";
      for(i=0;i<3;i++){var q=clamp(pp*1.4-i*.18,0,1);if(q>0&&q<1){c.strokeStyle="rgba(255,236,170,"+(1-q)*.8+")";c.lineWidth=(6-i*1.6)*u;c.beginPath();c.ellipse(W*.5,H*.62,q*W*.46,q*H*.3,0,0,6.2832);c.stroke()}}
      for(i=0;i<26;i++){var an=i/26*6.2832+rh(i)*.5,rr=pp*(.18+rh(i+9)*.34)*W,sx2=W*.5+Math.cos(an)*rr,sy2=H*.62+Math.sin(an)*rr*.7-pp*H*.1;c.fillStyle=(i%3?"rgba(255,244,190,":"rgba(255,170,190,")+(1-pp)+")";c.beginPath();c.arc(sx2,sy2,(2+rh(i+4)*3.5)*u*(1-pp*.5),0,6.2832);c.fill()}
      c.restore()}
    if(f2.g>=1&&!f2.wilt){c.save();c.globalCompositeOperation="screen";for(i=0;i<14;i++){var a=t*.8+i*.9,rr=(120+rh(i)*100)*u;c.fillStyle="rgba(200,240,255,"+(.5+.5*Math.sin(t*3+i))+")";c.beginPath();c.arc(W*.5+Math.cos(a)*rr,H*.5+Math.sin(a*1.3)*rr*.6,3*u,0,6.2832);c.fill()}c.restore()}
  } else if(o.plants){
    var hits=o.hits;if(hits)hits.length=0;
    o.plants.forEach(function(pl){
      var sp=sprite(pl.s,pl.stage,(o.hits||o.hq)?1.3:.6),w=260*pl.k*.7,hh=300*pl.k*.7,sway=reduce?0:Math.sin(t*.9+pl.x*.01)*.025*(pl.s.ok?1:0);
      shadowAt(pl.x,pl.y,w,hh);
      var gs=1,gp=-1;if(o.hits&&NEWID&&pl.s.id===NEWID&&!reduce){gp=NEWAT?(Date.now()-NEWAT)/1800:0;gs=growBack(gp);if(NEWAT&&Date.now()-NEWAT>1900)NEWID=null}
      c.save();c.translate(pl.x,pl.y);c.rotate(sway);c.scale(gs,gs);c.drawImage(sp.d,-130*pl.k*.7,-290*pl.k*.7,w,hh);
      if(dk>.05){if(!sp.n)sp.n=nightOf(sp.d);c.globalAlpha=dk*.9;c.drawImage(sp.n,-130*pl.k*.7,-290*pl.k*.7,w,hh);c.globalAlpha=1}
      c.restore();
      if(gp>=0&&gp<1){c.save();c.globalCompositeOperation="screen";c.strokeStyle="rgba(255,226,140,"+(1-gp)*.9+")";c.lineWidth=4*u+1;c.beginPath();c.ellipse(pl.x,pl.y,(20+gp*90)*u,(6+gp*22)*u,0,0,6.2832);c.stroke();
        for(var q=0;q<12;q++){var qa=q/12*6.2832;c.fillStyle="rgba("+(q%2?"255,244,190":"255,170,190")+","+(1-gp)+")";c.beginPath();c.arc(pl.x+Math.cos(qa)*gp*70*u,pl.y-gp*(50+rh(q)*80)*u,(2+rh(q+3)*2.5)*u,0,6.2832);c.fill()}c.restore()}
      if(hits)hits.push({x:pl.x-w*.32,y:pl.y-hh*.95,w:w*.64,h:hh*.98,s:pl.s,stage:pl.stage,cx:pl.x,cy:pl.y-hh*.95,decor:pl.decor,f:pl.f});
    });
  }
  blades(true);
  cityFx(c,W,H,u,t,dk,CT.id);seasonFx(c,W,H,u,t,dk);
  if(U.butterflies&&dk<.55&&!o.focus&&SEASON!=="winter"){var bc=["#7FDCEB","#F7C873","#B9A1F0"];for(i=0;i<3;i++){var bx3=W*(.2+.3*i+.08*Math.sin(t*.4+i)),by3=H*(.44+.07*Math.sin(t*.7+i*2)+i*.03),fl=reduce?.7:Math.abs(Math.sin(t*9+i));
    c.fillStyle=bc[i];c.beginPath();c.ellipse(bx3-5*u,by3,6*u*fl+1,8*u,-.4,0,6.2832);c.fill();c.beginPath();c.ellipse(bx3+5*u,by3,6*u*fl+1,8*u,.4,0,6.2832);c.fill();c.fillStyle="#1C2B30";c.fillRect(bx3-.8*u,by3-5*u,1.6*u,10*u)}}
  if(day&&dk<.5){for(i=0;i<28;i++){var px=W*((rh(i*4+1)+t*.004*(1+rh(i)))%1),py=H*(.35+rh(i*4+2)*.5)+Math.sin(t*.5+i)*8*u;c.fillStyle="rgba(255,244,210,"+(.25+.35*Math.abs(Math.sin(t*.8+i)))*(1-dk*2)+")";c.beginPath();c.arc(px,py,(1+rh(i*4+3)*1.6)*u,0,6.2832);c.fill()}}
  if(dk>.35){c.save();c.globalCompositeOperation="screen";for(i=0;i<16;i++){var fx2=W*(rh(i*3)*.9+.05+.02*Math.sin(t*.6+i)),fy2=H*(.5+rh(i*3+1)*.42+.02*Math.cos(t*.5+i*2)),al=(.3+.7*Math.abs(Math.sin(t*1.4+i)))*dk;
    var fg=c.createRadialGradient(fx2,fy2,0,fx2,fy2,14*u);fg.addColorStop(0,"rgba(220,255,150,"+al+")");fg.addColorStop(1,"rgba(220,255,150,0)");c.fillStyle=fg;c.fillRect(fx2-16*u,fy2-16*u,32*u,32*u)}c.restore()}
  var vg=c.createRadialGradient(W/2,H*.55,Math.min(W,H)*.32,W/2,H*.55,Math.max(W,H)*.8);vg.addColorStop(0,"rgba(24,14,6,0)");vg.addColorStop(1,"rgba(24,14,6,"+(.3+dk*.22)+")");c.fillStyle=vg;c.fillRect(0,0,W,H);
  c.save();c.globalCompositeOperation="soft-light";var cg=c.createLinearGradient(0,0,0,H);cg.addColorStop(0,"rgba(190,160,140,.08)");cg.addColorStop(1,"rgba(235,215,185,"+.08*(1-dk)+")");c.fillStyle=cg;c.fillRect(0,0,W,H);
  var gp=grainPat(c);if(gp){c.globalAlpha=.16;c.fillStyle=gp;c.fillRect(0,0,W,H)}c.restore();
}

/* ---------- canvases ---------- */
var gC=$("gCanvas"),gx=gC.getContext("2d"),fC=$("fCanvas"),fx=fC.getContext("2d"),HITS=[],view="garden",run=null;
function fit(cv){var r=cv.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2),w=Math.max(200,Math.round(r.width*dpr)),h=Math.max(200,Math.round(r.height*dpr));if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}return [w,h]}
function unl(cid){var n=okCity(cid);return {butterflies:n>=3,lanterns:n>=8,rainbow:n>=40,lm:CITY(cid).lm.map(function(l){return n>=l.n})}}
function previewG(){return run?(run.phase==="break"?1:clamp((Date.now()-run.start)/run.dur,0,1)):1}
function drawAll(ts){
  var t=reduce?0:ts/1000;
  if(view==="garden"){var d=fit(gC);if(NEWID&&!NEWAT){var rr=gC.getBoundingClientRect();if((rr.top<window.innerHeight*.85&&rr.bottom>0)||Date.now()-NEWSET>5000)NEWAT=Date.now()}drawScene(gx,d[0],d[1],{hour:hourNow(D.prefs.sky),t:t,city:curCity(),unl:unl(D.prefs.city),plants:layout(d[0],d[1],D.prefs.city),hits:HITS})}
  else if(view==="focus"){
    var e=fit(fC),cid=run?run.city:D.prefs.city,sub=subjById(run?run.subj:D.prefs.subj),g=run?previewG():1,uf=unl(cid);
    uf.lm=uf.lm.map(function(b,i){return i?b:false});
    drawScene(fx,e[0],e[1],{hour:hourNow(D.prefs.sky),t:t,city:CITY(cid),unl:uf,focus:{sp:run?run.sp:seedSp(),seed:run?run.seed:777,g:g,wilt:false,pop:(bloomAt&&!reduce)?(Date.now()-bloomAt)/1000:null}});
  }
}
var lastSec=-1;
function tick(ts){
  if(run) updateRun();
  drawAll(ts);
  if(!reduce) requestAnimationFrame(tick);
}
if(reduce){setInterval(function(){if(run)updateRun();drawAll(0)},1000)} else requestAnimationFrame(tick);
function redraw(){if(view==="cities")drawThumbs();else if(reduce)drawAll(0)}

/* tooltip on the garden */
var tip=$("tip");
function hitAt(ev){
  var r=gC.getBoundingClientRect(),sx=gC.width/r.width,x=(ev.clientX-r.left)*sx,y=(ev.clientY-r.top)*sx;
  for(var i=HITS.length-1;i>=0;i--){var h=HITS[i];if(x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h)return {h:h,sx:sx,r:r}}
  return null;
}
function showTip(ev){
  var m=hitAt(ev);if(!m){tip.hidden=true;return}
  var s=m.h.s,sub=m.h.decor?null:subjById(s.subj);
  if(m.h.decor){tip.classList.remove("n2");tip.textContent=SPECIES[s.sp].em+" "+SPECIES[s.sp].label+" · native to "+curCity().name+" · click for its story"}
  else{tip.classList.toggle("n2",!!s.note);tip.textContent=SPECIES[s.sp||sub.sp].em+" "+sub.name+" · "+(s.ok?STAGE_NAMES[m.h.stage]+" · "+minsFmt(s.mins):"wilted")+" · "+dateFmt(s.ts);
    if(s.note){var hn2=document.createElement("span");hn2.className="hand";hn2.textContent="“"+(s.note.length>90?s.note.slice(0,88)+"…":s.note)+"”";tip.appendChild(hn2)}}
  tip.style.left=(m.h.cx/m.sx)+"px";tip.style.top=(m.h.cy/m.sx)+"px";tip.hidden=false;
}
gC.addEventListener("pointermove",showTip);
gC.addEventListener("pointerleave",function(){tip.hidden=true});

/* ---------- sound ---------- */
var AC=null,wind=null;
function ctx(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null}}return AC}
function scaleNotes(n){var s=curCity().scale,o=[];for(var i=0;i<n;i++)o.push(s[(i*2)%s.length]+(i*2>=s.length?12:0));return o}
function chime(notes){
  if(!D.prefs.sound)return;var a=ctx();if(!a)return;
  (notes||scaleNotes(4)).forEach(function(n,i){var o=a.createOscillator(),g=a.createGain(),t0=a.currentTime+i*.16;o.type="sine";o.frequency.value=523.25*Math.pow(2,n/12);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.12,t0+.03);g.gain.exponentialRampToValueAtTime(.0001,t0+1.4);o.connect(g);g.connect(a.destination);o.start(t0);o.stop(t0+1.5)});
}
function windOn(){
  if(!D.prefs.sound||wind||(D.prefs.mix&&D.prefs.mix.wind>0))return;var a=ctx();if(!a)return;
  var len=a.sampleRate*2,buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0),last=0;
  for(var i=0;i<len;i++){var w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=last*3.5}
  var src=a.createBufferSource();src.buffer=buf;src.loop=true;var f=a.createBiquadFilter();f.type="lowpass";f.frequency.value=420;var g=a.createGain();g.gain.value=.5;
  var lfo=a.createOscillator(),lg=a.createGain();lfo.frequency.value=.12;lg.gain.value=180;lfo.connect(lg);lg.connect(f.frequency);lfo.start();
  src.connect(f);f.connect(g);g.connect(a.destination);src.start();wind={src:src,lfo:lfo};
}
function windOff(){if(wind){try{wind.src.stop();wind.lfo.stop()}catch(e){}wind=null}}
$("soundBtn").addEventListener("click",function(){
  D.prefs.sound=!D.prefs.sound;save();syncTools();
  if(D.prefs.sound){ctx();if(AC&&AC.state==="suspended")AC.resume();chime(scaleNotes(2));if(run)windOn()} else windOff();
  ambSync();
});

/* ---------- theme ---------- */
function curTheme(){var t=document.documentElement.getAttribute("data-theme");if(t)return t;return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}
function syncTools(){
  $("themeBtn").textContent=curTheme()==="dark"?"Light mode":"Dark mode";
  $("soundBtn").textContent=D.prefs.sound?"Sound on":"Sound off";$("soundBtn").setAttribute("aria-pressed",D.prefs.sound?"true":"false");
}
$("themeBtn").addEventListener("click",function(){document.documentElement.setAttribute("data-theme",curTheme()==="dark"?"light":"dark");syncTools()});

/* ---------- views ---------- */
function setView(v,focusEl){
  view=v;
  ["cities","garden","focus","journal","stats"].forEach(function(s){$(s).hidden=(s!==v)});
  Array.prototype.forEach.call(document.querySelectorAll("nav.tabs button"),function(b){if(b.getAttribute("data-view")===v)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
  window.scrollTo(0,0);
  if(v==="cities")renderCities();if(v==="garden"){if(pendingNew){NEWID=pendingNew;NEWAT=0;NEWSET=Date.now();pendingNew=null}renderGarden()}if(v==="focus")renderFocus();if(v==="stats")renderStats();if(v==="journal")renderJournal();
  applyNotes();pipOnView(v);
  if(focusEl)focusEl.focus({preventScroll:true});
  redraw();
}
Array.prototype.forEach.call(document.querySelectorAll("nav.tabs button"),function(b){b.addEventListener("click",function(){setView(b.getAttribute("data-view"))})});
$("plantBtn").addEventListener("click",function(){setView("focus",$("fh"))});
$("changeCity").addEventListener("click",function(){setView("cities",$("ch"))});

/* ---------- garden panel ---------- */
function renderGarden(){
  var cid=D.prefs.city,C=CITY(cid),ok=okCity(cid),wil=D.sessions.filter(function(s){return s.city===cid&&!s.ok}).length;
  $("gh").textContent=C.name;$("gCoords").textContent=CMETA[cid].c;$("gCountry").textContent=C.flag+" "+C.country;$("cityTag").textContent=C.tag;
  $("demoBanner").hidden=!D.sessions.some(function(s){return s.demo});
  var sm=stageMap(cid),cnt=[0,0,0];Object.keys(sm).forEach(function(k){var st=sm[k];cnt[st<2?0:st<5?1:2]++});
  $("stageCount").textContent=cnt[0]+" seedlings · "+cnt[1]+" growing · "+cnt[2]+" in full bloom";
  $("kpis").innerHTML='<div class="kpi"><b>'+streak()+'</b><span>day streak</span></div><div class="kpi"><b>'+hoursFmt(totalMins())+'</b><span>hours studied</span></div><div class="kpi"><b>'+ok+'</b><span>plants in '+C.name+'</span></div>';
  var skyItems=[["auto","Sky: live"],["day","Day"],["dusk","Dusk"],["night","Night"]];
  $("skySeg").innerHTML=skyItems.map(function(s){return '<input type="radio" name="sky" id="sky-'+s[0]+'" value="'+s[0]+'"'+(D.prefs.sky===s[0]?" checked":"")+'><label for="sky-'+s[0]+'">'+s[1]+'</label>'}).join("");
  renderSeasonSeg();
  $("unlocks").innerHTML=unlockList(cid).map(function(u){var d=Math.min(ok,u.n),done=ok>=u.n;
    return '<li class="unl'+(done?" done":"")+'"><span class="ic" aria-hidden="true">'+u.em+'</span><span><b>'+u.name+'</b> <small>'+(done?"Unlocked":d+" of "+u.n+" plants")+' · '+u.desc+'</small></span><span class="meter" role="img" aria-label="'+d+' of '+u.n+'"><span style="width:'+(d/u.n*100)+'%"></span></span></li>'}).join("");
  var rec=D.sessions.filter(function(s){return s.city===cid}).sort(function(a,b){return b.ts-a.ts}).slice(0,8);
  $("recentList").innerHTML=rec.length?rec.map(function(s){var sub=subjById(s.subj);
    return '<li class="rec"><span class="l"><span aria-hidden="true">'+SPECIES[s.sp||sub.sp].em+'</span><span>'+esc(sub.name)+'</span></span><span>'+(s.ok?'<small>'+minsFmt(s.mins)+' · '+dateFmt(s.ts)+'</small>':'<span class="bad">Wilted</span> <small>'+dateFmt(s.ts)+'</small>')+'</span></li>'}).join(""):'<li class="note">Nothing planted in '+C.name+' yet. Start a pomodoro to plant the first one.</li>';
  gC.setAttribute("aria-label","Your "+C.name+" garden with "+ok+" grown plants"+(wil?" and "+wil+" wilted":"")+". Details are listed under Recent sessions.");
}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
$("skySeg").addEventListener("change",function(e){D.prefs.sky=e.target.value;save();redraw()});
$("clearDemo").addEventListener("click",function(){D.sessions=D.sessions.filter(function(s){return !s.demo});SPR={};save();renderGarden();redraw()});

/* ---------- focus ---------- */
function renderFocus(){
  $("subjSeg").innerHTML=D.subjects.map(function(s){return '<input type="radio" name="subj" id="subj-'+s.id+'" value="'+s.id+'"'+(D.prefs.subj===s.id?" checked":"")+'><label for="subj-'+s.id+'"><span aria-hidden="true">'+SPECIES[s.sp].em+'</span> '+esc(s.name)+'</label>'}).join("");
  $("newSpecies").innerHTML=Object.keys(SPECIES).map(function(k){return '<option value="'+k+'">'+SPECIES[k].em+' '+SPECIES[k].label+'</option>'}).join("");
  $("durSeg").innerHTML=DURS.map(function(d){return '<input type="radio" name="dur" id="dur-'+d.m+'" value="'+d.m+'"'+(pomoPlan()===d?" checked":"")+'><label for="dur-'+d.m+'">'+d.l+'</label>'}).join("");
  $("strict").checked=D.prefs.strict!==false;$("seedSeg").innerHTML=seedList().map(function(k){var S0=SPECIES[k],nat=(NATIVE[D.prefs.city]||[]).indexOf(k)>=0;return '<input type="radio" name="seed" id="seed-'+k+'" value="'+k+'"'+(seedSp()===k?" checked":"")+'><label for="seed-'+k+'"><em aria-hidden="true">'+S0.em+'</em><b>'+S0.label+'</b><small>'+(SEEDNOTE[k]||'')+'</small>'+(nat?'<i class="nat">'+esc(curCity().name)+'</i>':'')+'</label>'}).join("");pomoNoteUpd();var tdk=dayKey(Date.now()),tn=okSes().filter(function(s){return dayKey(s.ts)===tdk}).length;$("todayPomo").textContent="🍅 "+tn+" pomodoro"+(tn===1?"":"s")+" today · "+streak()+" day streak";
  $("focusCity").textContent="studying in "+curCity().name+" (change it in the atlas)";
  if(!run){$("setup").hidden=false;$("running").hidden=true;}
}
$("subjSeg").addEventListener("change",function(e){D.prefs.subj=e.target.value;D.prefs.seed=subjById(e.target.value).sp;var r0=$("seed-"+D.prefs.seed);if(r0)r0.checked=true;save();redraw()});
$("durSeg").addEventListener("change",function(e){D.prefs.dur=parseFloat(e.target.value);$("customMin").value="";save();pomoNoteUpd()});
$("customMin").addEventListener("input",function(){if($("customMin").value){Array.prototype.forEach.call($("durSeg").querySelectorAll("input"),function(i){i.checked=false})}pomoNoteUpd()});
$("strict").addEventListener("change",function(){D.prefs.strict=$("strict").checked;save()});
$("seedSeg").addEventListener("change",function(e){D.prefs.seed=e.target.value;save();redraw()});
$("addSubj").addEventListener("click",function(){
  var n=$("newSubj").value.trim();if(!n){$("setupStatus").textContent="Type a subject name first.";return}
  var id="u"+Date.now();D.subjects.push({id:id,name:n,sp:$("newSpecies").value});D.prefs.subj=id;save();$("newSubj").value="";renderFocus();$("setupStatus").textContent=n+" added.";redraw();
});

function pomoPlan(){
  var custom=parseFloat($("customMin").value),p=null;
  if(custom>0){var m=clamp(custom,1,180);return {m:m,b:Math.max(1,Math.round(m/5)),L:Math.max(3,Math.round(m*.6))}}
  DURS.forEach(function(d){if(d.m===D.prefs.dur)p=d});
  return p||DURS[2];
}
function pomoNoteUpd(){var p=pomoPlan();$("pomoNote").textContent=minsFmt(p.m)+" focus, then a "+minsFmt(p.b)+" break. After four pomodoros you get a "+minsFmt(p.L)+" long break."}
function startRun(){
  var p=pomoPlan(),sub=subjById(D.prefs.subj);
  run={sp:seedSp(),phase:"focus",n:1,done:0,mins:0,unl:[],long:false,start:Date.now(),dur:p.m*60000,focusMs:p.m*60000,shortMs:p.b*60000,longMs:p.L*60000,subj:sub.id,seed:Math.floor(Math.random()*1e6),strict:$("strict").checked,hiddenAt:null,confirm:false,city:D.prefs.city};
  $("setup").hidden=true;$("result").hidden=true;$("running").hidden=false;
  paintPhase();$("runStatus").textContent="Pomodoro 1 of 4 started. "+minsFmt(p.m)+" to go.";
  windOn();saveRun();pipSay("Okay. Deep breath. I will keep watch.",2800);updateRun();
}
function paintPhase(){
  var sub=subjById(run.subj),f=run.phase==="focus";
  $("runSubj").textContent=f?SPECIES[run.sp].em+" "+sub.name+" · Pomodoro "+run.n+" of 4":(run.long?"Long break":"Short break")+" · "+run.done+" pomodoro"+(run.done===1?"":"s")+" done";
  $("tmFill").setAttribute("fill",f?"var(--tomato)":"var(--sage)");$("plate").classList.toggle("brk",!f);
  $("runNote").textContent=f?(run.strict?"Stay on this tab. If you leave for more than 15 seconds, your plant wilts.":"Take your time. Your plant keeps growing."):"Stand up, drink some water, look away from the screen. The next pomodoro starts on its own.";
  $("giveUp").hidden=!f;$("skipBrk").hidden=f;$("endSes").hidden=f;$("giveUp").textContent="Give up";run.confirm=false;
  var filled=f?run.done%4:(run.done%4===0?4:run.done%4),d="";
  for(var i=1;i<=4;i++)d+='<svg viewBox="0 0 24 24" class="'+(f&&i===run.n?"cur":"")+'"><ellipse cx="12" cy="14.5" rx="9" ry="8" fill="'+(i<=filled?"var(--tomato)":"none")+'" stroke="var(--tomato)" stroke-width="2"/><path d="M12 7 L8.5 3.5 L11 5 L12 2 L13 5 L15.5 3.5 Z" fill="var(--sage)"/></svg>';
  $("dots").innerHTML=d;
  pipSleepSync();noteCardSync();
}
var lastLv=-1;
(function(){var s="",i,l="";for(i=0;i<60;i++){var a=i*6*Math.PI/180,r1=i%5?143:137,r2=148;s+='<line x1="'+(160+Math.sin(a)*r1).toFixed(1)+'" y1="'+(160-Math.cos(a)*r1).toFixed(1)+'" x2="'+(160+Math.sin(a)*r2).toFixed(1)+'" y2="'+(160-Math.cos(a)*r2).toFixed(1)+'"'+(i%5?"":' class="maj"')+'/>'}
 $("ticks").innerHTML=s;
 for(i=0;i<12;i++){var b=i*30*Math.PI/180,px=160+Math.sin(b)*122,py=160-Math.cos(b)*122;l+='<g class="lf" id="lf'+i+'" transform="translate('+px.toFixed(1)+' '+py.toFixed(1)+') rotate('+(i*30+(i%2?35:-125))+')"><path d="M0 0 C 8 -7 20 -5 25 0 C 20 6 8 7 0 0Z"/></g>'}
 $("vleaves").innerHTML=l})();
function celebrate(label){
  var b=$("burst"),i,e,sy=["🍅","🌸","🍃","✨"];b.innerHTML="";
  for(i=0;i<22;i++){e=document.createElement("span");var a=i/22*6.283+Math.random()*.4,d=100+Math.random()*100;e.style.setProperty("--dx",Math.round(Math.cos(a)*d)+"px");e.style.setProperty("--dy",Math.round(Math.sin(a)*d)+"px");e.style.setProperty("--r",Math.round(Math.random()*360)+"deg");e.textContent=sy[i%4];b.appendChild(e)}
  var n=$("planted");n.textContent="planted: "+label.toLowerCase()+" ✓";n.classList.remove("show");void n.offsetWidth;n.classList.add("show");
  var p=$("plate");p.classList.remove("pop");void p.offsetWidth;p.classList.add("pop");
}
$("startBtn").addEventListener("click",startRun);
function pad2(n){return n<10?"0"+n:""+n}
function updateRun(){
  if(!run)return;
  var el=Date.now()-run.start,left=Math.max(0,run.dur-el),g=clamp(el/run.dur,0,1),f=run.phase==="focus";
  var s=Math.ceil(left/1000),ck=pad2(Math.floor(s/60))+":"+pad2(s%60);$("clock").textContent=ck;
  $("runPct").textContent=Math.floor(g*100)+(f?"% grown":"% rested");
  var fh=164*g;$("tmFill").setAttribute("y",(206-fh).toFixed(1));$("tmFill").setAttribute("height",fh.toFixed(1));
  $("vine").style.strokeDashoffset=(100*(1-g)).toFixed(2);$("bug").setAttribute("transform","rotate("+(g*360).toFixed(1)+" 160 160)");
  var lv=Math.floor(g*12+1e-6);if(lv!==lastLv){for(var li=0;li<12;li++)$("lf"+li).classList.toggle("on",li<lv);lastLv=lv}
  document.title=ck+" · "+(f?"Focus":"Break")+" · Study Garden";
  if(el>=run.dur){if(f)completeFocus();else nextFocus()}
}
function completeFocus(){
  var cid=run.city,before=okCity(cid),sub=subjById(run.subj);
  var ses={id:"s"+Date.now(),city:cid,subj:run.subj,mins:run.focusMs/60000,ts:Date.now(),ok:true,seed:run.seed,sp:run.sp};
  D.sessions.push(ses);save();run.done++;run.mins+=ses.mins;run.lastId=ses.id;run.noteDone=null;run.draft="";pendingNew=ses.id;bloomAt=Date.now();
  var after=okCity(cid),nu=unlockList(cid).filter(function(u){return before<u.n&&after>=u.n});
  nu.forEach(function(u){run.unl.push(u)});
  run.long=run.done%4===0;run.phase="break";run.start=Date.now();run.dur=run.long?run.longMs:run.shortMs;run.hiddenAt=null;
  chime(scaleNotes(nu.length?5:3));paintPhase();celebrate(SPECIES[run.sp].label);worldDone(nu);
  $("runStatus").textContent="Pomodoro done. "+SPECIES[run.sp].label+" planted in "+CITY(cid).name+". "+(nu.length?"Unlocked "+nu.map(function(u){return u.name}).join(", ")+". ":"")+(run.long?"Four tomatoes: basket full! Long":"Short")+" break, "+minsFmt(run.dur/60000)+".";
  saveRun();updateRun();
}
function nextFocus(){
  autoSaveNote();bloomAt=0;run.phase="focus";run.n=run.done%4+1;run.seed=Math.floor(Math.random()*1e6);run.sp=seedSp();run.start=Date.now();run.dur=run.focusMs;run.long=false;
  chime([0]);paintPhase();$("runStatus").textContent="Pomodoro "+run.n+" of 4 started.";saveRun();updateRun();
}
function endSession(){
  if(!run)return;autoSaveNote();
  var sp=run.sp,cid=run.city,C=CITY(cid),sub=subjById(run.subj),n=run.done,mins=run.mins,nu=run.unl;
  run=null;windOff();clearRun();pipSleepSync();document.title="Study Garden";
  $("running").hidden=true;$("setup").hidden=true;$("result").hidden=false;$("result").className="panel result";
  $("resEm").textContent=SPECIES[sp].em;
  $("resTitle").textContent=n+" pomodoro"+(n===1?"":"s")+" done";
  $("resText").textContent=minsFmt(mins)+" of "+sub.name+". Your "+C.name+" garden now has "+okCity(cid)+" plant"+(okCity(cid)===1?"":"s")+".";
  $("resUnlock").textContent=nu.length?"Unlocked: "+nu.map(function(u){return u.em+" "+u.name}).join(", "):"";
  $("resTitle").focus({preventScroll:true});
}
$("skipBrk").addEventListener("click",function(){if(run&&run.phase==="break")nextFocus()});
$("endSes").addEventListener("click",endSession);
setInterval(function(){if(run)updateRun()},1000);
$("giveUp").addEventListener("click",function(){
  if(!run||run.phase!=="focus")return;
  if(!run.confirm){run.confirm=true;$("giveUp").textContent="Really give up? Your plant will wilt";return}
  finish(false);
});
document.addEventListener("visibilitychange",function(){
  if(!run||!run.strict||run.phase!=="focus")return;
  if(document.hidden){run.hiddenAt=Date.now()}
  else if(run.hiddenAt){var away=Date.now()-run.hiddenAt;run.hiddenAt=null;if(away>15000)finish(false)}
});
function finish(ok){
  if(!run)return;autoSaveNote();
  var prior=run.done||0,cid=run.city,C=CITY(cid),el=Math.min(Date.now()-run.start,run.dur),sub=subjById(run.subj),before=okCity(cid);
  var ses={id:"s"+Date.now(),city:cid,subj:run.subj,mins:ok?run.dur/60000:Math.max(.1,el/60000),ts:Date.now(),ok:ok,seed:run.seed,sp:run.sp};
  D.sessions.push(ses);save();run=null;windOff();clearRun();pipSleepSync();document.title="Study Garden";
  var after=okCity(cid),newU=unlockList(cid).filter(function(u){return before<u.n&&after>=u.n});
  $("running").hidden=true;$("setup").hidden=true;$("result").hidden=false;
  $("result").className="panel result"+(ok?"":" wilt");
  $("resEm").textContent=ok?SPECIES[sub.sp].em:"🥀";
  $("resTitle").textContent=ok?"Your "+SPECIES[sub.sp].label.toLowerCase()+" is planted":"Your plant wilted";
  $("resText").textContent=ok?minsFmt(ses.mins)+" of "+sub.name+" done. Your "+C.name+" garden now has "+after+" plant"+(after===1?"":"s")+".":"It wilted after "+minsFmt(ses.mins)+" of "+sub.name+". It won’t count towards your streak, but the next one will."+(prior?" Your "+prior+" earlier pomodoro"+(prior===1?"":"s")+(prior===1?" still counts.":" still count."):"");
  $("resUnlock").textContent=newU.length?"Unlocked: "+newU.map(function(u){return u.em+" "+u.name}).join(", "):"";
  if(ok)chime(scaleNotes(newU.length?5:3));else pipCheer("wilt");
  $("resTitle").focus({preventScroll:true});
}
$("resGarden").addEventListener("click",function(){setView("garden")});
$("resAgain").addEventListener("click",function(){$("result").hidden=true;$("setup").hidden=false;$("setupStatus").textContent="";});

/* ---------- cities ---------- */
function renderCities(){
  var VAR=["wide","tall","sq","wide","sq","tall","sq","wide"];
  $("cgrid").innerHTML=CITIES.map(function(C,i){
    var M=CMETA[C.id],n=okCity(C.id),lm=unl(C.id).lm.filter(Boolean).length,here=D.prefs.city===C.id,fv=firstVisit(C.id),found=n>0||!!(D.prefs.seen&&D.prefs.seen[C.id]);
    return '<article class="pc v-'+VAR[i]+(here?" here":"")+(found?"":" fog")+(C.id==="dream"?" dream":"")+'">'
     +'<div class="th"><canvas id="th-'+C.id+'" width="480" height="300" aria-hidden="true"></canvas>'
     +(fv?'<div class="stampc" aria-hidden="true"><b>VISITED</b><span>'+dateFmt(fv)+'</span></div>':"")
     +(found?"":'<div class="fogtxt" aria-hidden="true"><b>Unexplored</b><span>open to arrive</span></div>')+'</div>'
     +'<div class="pc-meta"><span>'+M.c+'</span><span>Nº '+pad2(i+1)+'</span></div>'
     +'<h3>'+C.name+' <small aria-hidden="true">'+C.flag+'</small></h3>'
     +'<p class="hello">'+M.hi+'</p>'
     +'<p class="travelnote">'+(found?M.n:"Not on your map yet. Open it to see what is waiting.")+'</p>'
     +(C.id==="dream"?'<label class="sr" for="dreamName">Name your dream destination</label><input class="dreamname" id="dreamName" type="text" maxlength="24" placeholder="name it: Santorini, Bali…" value="'+(D.prefs.dreamName||"").replace(/[<>&"']/g,"")+'">':"")
     +'<p class="pc-stats">'+n+' plant'+(n===1?"":"s")+' · '+lm+'/'+C.lm.length+' landmarks</p>'
     +'<button class="go" type="button" data-city="'+C.id+'">'+(found?(n?"Continue in ":"Start in "):"Discover ")+C.name+' <span aria-hidden="true">→</span></button></article>';
  }).join("");
  drawThumbs();
}
function drawThumbs(){
  CITIES.forEach(function(C){var cv=$("th-"+C.id);if(!cv)return;var g2=cv.getContext("2d");
    drawScene(g2,cv.width,cv.height,{hour:hourNow(D.prefs.sky),t:0,city:C,unl:unl(C.id),plants:layout(cv.width,cv.height,C.id),hits:null});
  });
}
$("cgrid").addEventListener("change",function(e){if(e.target&&e.target.id==="dreamName"){D.prefs.dreamName=e.target.value;applyDream();if(String(D.prefs.dreamName).trim())fl().dream=1;save();checkBadges(false);renderCities();var n=$("dreamName");if(n)n.focus()}});
$("cgrid").addEventListener("click",function(e){
  var b=e.target.closest?e.target.closest("button[data-city]"):null;if(!b)return;
  var cid0=b.getAttribute("data-city");
  if(!okCity(cid0)&&!(D.prefs.seen&&D.prefs.seen[cid0]))showArrival(cid0);else enterCity(cid0);
});

function enterCity(cid){
  var from=D.prefs.city;
  function go(){D.prefs.city=cid;D.prefs.seen=D.prefs.seen||{};D.prefs.seen[cid]=1;save();setView("garden",$("gh"));pipNative(cid)}
  if(from!==cid&&!reduce&&!run)travel(from,cid,go);else go();
}
function showArrival(cid){
  var C=CITY(cid),M=CMETA[cid];
  $("arCity").textContent=C.name;$("arCoords").textContent=M.c;$("arHello").textContent=M.hi;$("arNote").textContent=M.n;$("arFlag").textContent=C.flag;
  $("arBtn").setAttribute("data-city",cid);$("arrive").hidden=false;$("arBtn").focus();
}
$("arBtn").addEventListener("click",function(){var cid=$("arBtn").getAttribute("data-city");$("arrive").hidden=true;enterCity(cid)});
$("arBack").addEventListener("click",function(){$("arrive").hidden=true});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!$("arrive").hidden)$("arrive").hidden=true});

/* ---------- stats ---------- */
function achievements(){
  var ok=okSes(),tot=totalMins();
  var night=ok.some(function(s){var h=new Date(s.ts).getHours();return h>=22||h<4}),early=ok.some(function(s){var h=new Date(s.ts).getHours();return h>=5&&h<9});
  return [
   {em:"🌱",n:"First sprout",d:"Grow your first plant",done:ok.length>=1,p:Math.min(ok.length,1),t:1},
   {em:"🌿",n:"Green thumb",d:"Grow 10 plants",done:ok.length>=10,p:Math.min(ok.length,10),t:10},
   {em:"⏳",n:"Marathon",d:"Finish a 60 minute session",done:ok.some(function(s){return s.mins>=60}),p:ok.some(function(s){return s.mins>=60})?1:0,t:1},
   {em:"🔥",n:"One week streak",d:"Study 7 days in a row",done:streak()>=7,p:Math.min(streak(),7),t:7},
   {em:"🌙",n:"Night owl",d:"Study after 10 pm",done:night,p:night?1:0,t:1},
   {em:"🌅",n:"Early bird",d:"Study before 9 am",done:early,p:early?1:0,t:1},
   {em:"📚",n:"Ten hours",d:"Study 10 hours in total",done:tot>=600,p:Math.min(Math.round(tot/60),10),t:10},
   {em:"🌸",n:"Variety",d:"Grow 4 different plants",done:distinctSp()>=4,p:Math.min(distinctSp(),4),t:4},
   {em:"✈️",n:"Globetrotter",d:"Grow plants in 3 cities",done:citiesVisited()>=3,p:Math.min(citiesVisited(),3),t:3},
   {em:"🛂",n:"Full passport",d:"Visit all "+CITIES.length+" destinations",done:citiesVisited()>=CITIES.length,p:citiesVisited(),t:CITIES.length},
   {em:"🏛️",n:"Landmark hunter",d:"Unlock 5 landmarks",done:landmarksTotal()>=5,p:Math.min(landmarksTotal(),5),t:5}
  ];
}
function citiesVisited(){return CITIES.filter(function(C){return okCity(C.id)>0}).length}
function landmarksTotal(){var n=0;CITIES.forEach(function(C){n+=unl(C.id).lm.filter(Boolean).length});return n}
function renderCityBars(){
  var rows=CITIES.map(function(C){return {C:C,n:okCity(C.id)}}),top=Math.max.apply(null,rows.map(function(r){return r.n}).concat([1]));
  $("cityBars").innerHTML=rows.map(function(r){return '<div class="barrow"><span>'+r.C.flag+' '+r.C.name+'</span><span class="meter" role="img" aria-label="'+r.n+' plants"><span style="width:'+(r.n/top*100)+'%"></span></span><span>'+r.n+(r.n===1?' plant':' plants')+'</span></div>'}).join("");
}
function distinctSp(){var o={};okSes().forEach(function(s){o[subjById(s.subj).sp]=1});return Object.keys(o).length}
function weekData(){
  var out=[],now=new Date();now.setHours(12,0,0,0);
  for(var i=6;i>=0;i--){var d=new Date(now.getTime()-i*864e5),k=dayKey(d.getTime()),m=0;okSes().forEach(function(s){if(dayKey(s.ts)===k)m+=s.mins});out.push({d:d,m:m})}
  return out;
}
function renderStats(){
  var ok=okSes(),tot=totalMins(),wk=weekData(),best=Math.max.apply(null,wk.map(function(x){return x.m}).concat([0])),weekTot=wk.reduce(function(a,x){return a+x.m},0);
  $("kbig").innerHTML=[[streak(),"day streak"],[hoursFmt(tot),"hours studied"],[ok.length,"plants grown"],[Math.round(weekTot),"minutes this week"]].map(function(k){return '<div class="kbig"><b>'+k[0]+'</b><span>'+k[1]+'</span></div>'}).join("");
  var W=480,H=220,pl=34,pb=30,pt=14,bw=(W-pl-10)/7,mx=Math.max(30,Math.ceil(best/30)*30),svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Minutes studied per day over the last 7 days">';
  for(var g=0;g<=3;g++){var y=pt+(H-pt-pb)*(1-g/3);svg+='<line x1="'+pl+'" x2="'+(W-6)+'" y1="'+y+'" y2="'+y+'" stroke="var(--line)" stroke-width="1"/><text x="'+(pl-6)+'" y="'+(y+4)+'" text-anchor="end" font-size="11" fill="var(--muted)">'+Math.round(mx*g/3)+'</text>'}
  wk.forEach(function(x,i){var h=(H-pt-pb)*x.m/mx,bx=pl+i*bw+bw*.18,by=H-pb-h;
    svg+='<rect x="'+bx+'" y="'+by+'" width="'+bw*.64+'" height="'+Math.max(h,x.m>0?3:0)+'" rx="6" fill="var(--sage)"/>';
    if(x.m>0)svg+='<text x="'+(bx+bw*.32)+'" y="'+(by-4)+'" text-anchor="middle" font-size="11" fill="var(--ink)">'+Math.round(x.m)+'</text>';
    svg+='<text x="'+(bx+bw*.32)+'" y="'+(H-10)+'" text-anchor="middle" font-size="11" fill="var(--muted)">'+x.d.toLocaleDateString(undefined,{weekday:"short"})+'</text>'});
  $("weekChart").innerHTML=svg+'</svg>';
  var by={};ok.forEach(function(s){by[s.subj]=(by[s.subj]||0)+s.mins});
  var rows=Object.keys(by).map(function(k){return {s:subjById(k),m:by[k]}}).sort(function(a,b){return b.m-a.m}),top=rows.length?rows[0].m:1;
  $("subjBars").innerHTML=rows.length?rows.map(function(r){return '<div class="barrow"><span>'+SPECIES[r.s.sp].em+' '+esc(r.s.name)+'</span><span class="meter" role="img" aria-label="'+Math.round(r.m)+' minutes"><span style="width:'+(r.m/top*100)+'%"></span></span><span>'+Math.round(r.m)+' min</span></div>'}).join(""):'<p class="note">Grow a plant to see your subjects here.</p>';
  renderCityBars();
  $("achs").innerHTML=achievements().map(function(a){return '<div class="achc'+(a.done?"":" lock")+'"><span class="ic" aria-hidden="true">'+a.em+'</span><span><b>'+a.n+'</b><small>'+a.d+(a.done?" · done":" · "+a.p+" of "+a.t)+'</small></span></div>'}).join("");
  renderAlbum();
}

/* ---------- postcard ---------- */
var lastFocus=null;
function openPostcard(){
  var C=curCity(),W=1080,H=1350,cv=document.createElement("canvas");cv.width=W;cv.height=H;var c=cv.getContext("2d");
  var sceneH=900,sub=document.createElement("canvas");sub.width=W;sub.height=sceneH;var sc=sub.getContext("2d");
  drawScene(sc,W,sceneH,{hour:hourNow(D.prefs.sky==="auto"?"day":D.prefs.sky),t:0,city:C,unl:unl(D.prefs.city),plants:layout(W,sceneH,D.prefs.city),hits:null,hq:true});
  c.fillStyle="#EFE5CF";c.fillRect(0,0,W,H);c.drawImage(sub,0,0);
  c.save();c.translate(W-190,120);c.rotate(.1);c.fillStyle="rgba(248,241,223,.9)";c.fillRect(-110,-80,220,160);c.setLineDash([10,6]);c.strokeStyle="#5C1B2B";c.lineWidth=5;c.strokeRect(-110,-80,220,160);c.setLineDash([]);
  c.textAlign="center";c.font='64px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';c.fillStyle="#1E211B";c.fillText(C.flag,0,-4);c.fillStyle="#5C1B2B";c.font='700 26px "Instrument Sans", system-ui, sans-serif';c.fillText(C.name.toUpperCase(),0,46);c.restore();
  var gr=c.createLinearGradient(0,sceneH-80,0,sceneH+10);gr.addColorStop(0,"rgba(239,229,207,0)");gr.addColorStop(1,"#EFE5CF");c.fillStyle=gr;c.fillRect(0,sceneH-80,W,90);
  var wk=weekData(),mins=wk.reduce(function(a,x){return a+x.m},0),n=0;wk.forEach(function(x){if(x.m>0)n++});
  c.fillStyle="#5C1B2B";c.font='italic 400 88px "Instrument Serif", Georgia, serif';c.textAlign="left";c.fillText("Greetings from "+C.name,70,sceneH+30);
  var stats=[[Math.round(mins)+"","minutes this week"],[streak()+"","day streak"],[okSes().length+"","plants grown"]];
  stats.forEach(function(s,i){var x=70+i*320;c.fillStyle="#1F3D2B";c.font='400 96px "Instrument Serif", Georgia, serif';c.fillText(s[0],x,sceneH+150);c.fillStyle="#5E5A4A";c.font='400 28px "Instrument Sans", system-ui, sans-serif';c.fillText(s[1],x,sceneH+192)});
  c.fillStyle="#1E211B";c.font='700 28px "Instrument Sans", system-ui, sans-serif';c.textAlign="center";c.fillText("Pomodoro Garden",W/2,H-60);
  $("mImg").src=cv.toDataURL("image/png");lastFocus=document.activeElement;$("modal").hidden=false;$("mClose").focus();
}
$("postcardBtn").addEventListener("click",function(){
  if(document.fonts&&document.fonts.load){Promise.all([document.fonts.load('italic 400 88px "Instrument Serif"'),document.fonts.load('400 96px "Instrument Serif"'),document.fonts.load('400 28px "Instrument Sans"'),document.fonts.load('700 28px "Instrument Sans"')]).then(openPostcard,openPostcard)}else openPostcard();
});
function closeModal(){$("modal").hidden=true;if(lastFocus&&lastFocus.focus)lastFocus.focus()}
$("mClose").addEventListener("click",closeModal);
$("modal").addEventListener("click",function(e){if(e.target===$("modal"))closeModal()});
document.addEventListener("keydown",function(e){if($("modal").hidden)return;if(e.key==="Escape")closeModal();else if(e.key==="Tab"){e.preventDefault();$("mClose").focus()}});


/* ====================== the small world ====================== */
var RKEY="studygarden.run";
function fl(){D.flags=D.flags||{};return D.flags}
function sessById(id){for(var i=0;i<D.sessions.length;i++)if(D.sessions[i].id===id)return D.sessions[i];return null}
function foundSecret(id,msg){
  D.found=D.found||{};
  if(!D.found[id]){D.found[id]=Date.now();save();checkBadges(false);if(msg)pipSay(msg,4000)}
}

/* ---------- stamps ---------- */
function realOk(){return D.sessions.filter(function(s){return s.ok&&!s.demo})}
function realStreak(){var days={};realOk().forEach(function(s){days[dayKey(s.ts)]=1});var d=new Date();d.setHours(12,0,0,0);var n=0;if(!days[dayKey(d.getTime())])d=new Date(d.getTime()-864e5);while(days[dayKey(d.getTime())]){n++;d=new Date(d.getTime()-864e5)}return n}
function realMins(){return realOk().reduce(function(a,s){return a+s.mins},0)}
function realSpecies(){var o={};realOk().forEach(function(s){o[s.sp||subjById(s.subj).sp]=1});return Object.keys(o).length}
function realCities(){var o={};realOk().forEach(function(s){o[s.city]=1});return Object.keys(o).length}
function noteCount(){return D.sessions.filter(function(s){return s.note&&String(s.note).trim()}).length}
function foundCount(){return Object.keys(D.found||{}).length}
function hasHour(f){return realOk().some(function(s){return f(new Date(s.ts).getHours())})}
function seasonsDone(){return Object.keys(fl().seasons||{}).length}
var BADGES=[
 {id:"pomo1",em:"🌱",n:"First Sprout",d:"Finish your first pomodoro",t:1,p:function(){return realOk().length}},
 {id:"pomo10",em:"🌿",n:"Green Thumb",d:"Grow 10 plants",t:10,p:function(){return realOk().length}},
 {id:"pomo25",em:"🪴",n:"Windowsill",d:"Grow 25 plants",t:25,p:function(){return realOk().length}},
 {id:"pomo50",em:"🌳",n:"Orchard",d:"Grow 50 plants",t:50,p:function(){return realOk().length}},
 {id:"pomo100",em:"🏡",n:"Head Gardener",d:"Grow 100 plants",t:100,p:function(){return realOk().length}},
 {id:"hrs1",em:"⏱️",n:"First Hour",d:"Study for one hour in total",t:60,p:function(){return Math.round(realMins())}},
 {id:"hrs10",em:"📚",n:"Ten Hours",d:"Study for 10 hours in total",t:600,p:function(){return Math.round(realMins())}},
 {id:"hrs25",em:"🕰️",n:"Long Haul",d:"Study for 25 hours in total",t:1500,p:function(){return Math.round(realMins())}},
 {id:"hrs50",em:"🏔️",n:"Summit",d:"Study for 50 hours in total",t:3000,p:function(){return Math.round(realMins())}},
 {id:"streak3",em:"🔥",n:"Three in a Row",d:"Study 3 days in a row",t:3,p:function(){return realStreak()}},
 {id:"streak7",em:"🗓️",n:"Week of Green",d:"Study 7 days in a row",t:7,p:function(){return realStreak()}},
 {id:"streak14",em:"🌞",n:"Fortnight",d:"Study 14 days in a row",t:14,p:function(){return realStreak()}},
 {id:"marathon",em:"⏳",n:"Marathon",d:"Finish one session of 60+ minutes",t:1,p:function(){return realOk().some(function(s){return s.mins>=60})?1:0}},
 {id:"basket",em:"🍅",n:"Full Basket",d:"Finish four pomodoros in one go",t:1,p:function(){return fl().fourpack?1:0}},
 {id:"night",em:"🌙",n:"Night Owl",d:"Finish a pomodoro after 10 pm",t:1,p:function(){return hasHour(function(h){return h>=22||h<4})?1:0}},
 {id:"early",em:"🌅",n:"Early Bird",d:"Finish a pomodoro before 9 am",t:1,p:function(){return hasHour(function(h){return h>=5&&h<9})?1:0}},
 {id:"bouquet",em:"🌸",n:"Mixed Bouquet",d:"Grow 4 different plants",t:4,p:function(){return realSpecies()}},
 {id:"botanist",em:"💐",n:"Botanist",d:"Grow 8 different plants",t:8,p:function(){return realSpecies()}},
 {id:"city3",em:"✈️",n:"Globetrotter",d:"Grow plants in 3 cities",t:3,p:function(){return realCities()}},
 {id:"city5",em:"🧳",n:"Frequent Flyer",d:"Grow plants in 5 cities",t:5,p:function(){return realCities()}},
 {id:"city8",em:"🛂",n:"Full Passport",d:"Grow plants in every destination",t:CITIES.length,p:function(){return realCities()}},
 {id:"seasons",em:"🍂",n:"Four Seasons",d:"Finish a pomodoro in each of the four seasons",t:4,p:function(){return seasonsDone()}},
 {id:"dear",em:"✍️",n:"Dear Diary",d:"Write your first journal note",t:1,p:function(){return noteCount()}},
 {id:"chron",em:"📖",n:"Chronicler",d:"Write 10 journal notes",t:10,p:function(){return noteCount()}},
 {id:"curious",em:"🔍",n:"Curious One",d:"Find 3 hidden surprises",t:3,p:function(){return foundCount()}},
 {id:"secret",em:"🗝️",n:"Secret Garden",d:"Find 10 hidden surprises",t:10,p:function(){return foundCount()}},
 {id:"dreamer",em:"💫",n:"Dreamer",d:"Name your dream destination",t:1,p:function(){return fl().dream?1:0}},
 {id:"friend",em:"🐞",n:"Friend of Pip",d:"Say hello to Pip 10 times",t:10,p:function(){return fl().pipClicks||0}}
];
var STC=[["#5C1B2B","#F3E5C4"],["#1F3D2B","#EFE6C8"],["#A8401F","#F6E6CA"],["#27506B","#EAE8D2"],["#7A5A12","#F4E8C0"],["#3D6B63","#E9EBD0"]];
function scallop(w,h,r){
  var nx=Math.round(w/(r*2.5)),ny=Math.round(h/(r*2.5)),sx=w/nx,sy=h/ny,d="M0 0",i;
  for(i=0;i<nx;i++){var m=i*sx+sx/2;d+=" L"+(m-r).toFixed(1)+" 0 A"+r+" "+r+" 0 0 0 "+(m+r).toFixed(1)+" 0 L"+((i+1)*sx).toFixed(1)+" 0"}
  for(i=0;i<ny;i++){var n=i*sy+sy/2;d+=" L"+w+" "+(n-r).toFixed(1)+" A"+r+" "+r+" 0 0 0 "+w+" "+(n+r).toFixed(1)+" L"+w+" "+((i+1)*sy).toFixed(1)}
  for(i=nx-1;i>=0;i--){var m2=i*sx+sx/2;d+=" L"+(m2+r).toFixed(1)+" "+h+" A"+r+" "+r+" 0 0 0 "+(m2-r).toFixed(1)+" "+h+" L"+(i*sx).toFixed(1)+" "+h}
  for(i=ny-1;i>=0;i--){var n2=i*sy+sy/2;d+=" L0 "+(n2+r).toFixed(1)+" A"+r+" "+r+" 0 0 0 0 "+(n2-r).toFixed(1)+" L0 "+(i*sy).toFixed(1)}
  return d+"Z"}
var SCAL=scallop(120,150,3.2);
function stampSVG(b,i,ts,prog){
  var c=STC[i%STC.length],lock=!ts,ink=lock?"#8A8268":c[0],s='<svg viewBox="0 0 120 150" aria-hidden="true">',nm=b.n.toUpperCase();
  s+='<path d="'+SCAL+'" fill="'+(lock?"#E4DAC0":c[1])+'" stroke="'+ink+'" stroke-width="1.1"'+(lock?' stroke-dasharray="3 3"':'')+'/>';
  s+='<rect x="9" y="9" width="102" height="132" fill="none" stroke="'+ink+'" stroke-width="1.6"/><rect x="12.5" y="12.5" width="95" height="125" fill="none" stroke="'+ink+'" stroke-width=".5"/>';
  s+='<text x="60" y="25" text-anchor="middle" font-size="6.6" letter-spacing="1.5" style="font-family:var(--mono)" fill="'+ink+'">POMODORO GARDEN</text>';
  s+='<text x="19" y="40" font-size="10" style="font-family:var(--serif)" fill="'+ink+'">Nº'+(i<9?"0":"")+(i+1)+'</text>';
  s+='<circle cx="60" cy="70" r="30" fill="'+(lock?"#D8CEB1":mixHex(c[1],"#FFFFFF",.35))+'" stroke="'+ink+'" stroke-width="1.4"/><circle cx="60" cy="70" r="26.5" fill="none" stroke="'+ink+'" stroke-width=".6" stroke-dasharray="1.5 2.2"/>';
  s+=lock?'<text x="60" y="81" text-anchor="middle" font-size="32" fill="#8A8268" style="font-family:var(--serif)">?</text>':'<text x="60" y="81" text-anchor="middle" font-size="32">'+b.em+'</text>';
  s+='<text x="60" y="114" text-anchor="middle" font-size="'+(nm.length>13?8:9.6)+'" letter-spacing=".5" style="font-family:var(--serif)" fill="'+ink+'">'+esc(nm)+'</text>';
  if(lock){s+='<text x="60" y="130" text-anchor="middle" font-size="6.4" letter-spacing="1.2" style="font-family:var(--mono)" fill="'+ink+'">'+esc(prog)+'</text>'}
  else{var d=new Date(ts),dm=d.toLocaleDateString("en-GB",{day:"2-digit",month:"short"}).toUpperCase();
    s+='<text x="60" y="130" text-anchor="middle" font-size="6.2" letter-spacing="1.4" style="font-family:var(--mono)" fill="'+ink+'">★ ★ ★</text>';
    s+='<g transform="translate(88 103) rotate(-14)" opacity=".8"><circle r="17.5" fill="none" stroke="#5C1B2B" stroke-width="1.5"/><circle r="14" fill="none" stroke="#5C1B2B" stroke-width=".6"/><text y="-4" text-anchor="middle" font-size="5" letter-spacing=".6" fill="#5C1B2B" style="font-family:var(--mono)">STAMPED</text><text y="4.5" text-anchor="middle" font-size="5.8" fill="#5C1B2B" style="font-family:var(--mono)">'+dm+'</text><text y="11" text-anchor="middle" font-size="5" fill="#5C1B2B" style="font-family:var(--mono)">'+d.getFullYear()+'</text></g>';
    s+='<path d="M52 104 q5 -4 10 0 t10 0" stroke="#5C1B2B" fill="none" stroke-width="1" opacity=".5"/><path d="M52 108 q5 -4 10 0 t10 0" stroke="#5C1B2B" fill="none" stroke-width="1" opacity=".5"/>'}
  return s+'</svg>'}
function renderAlbum(){
  D.badges=D.badges||{};var done=0;
  $("album").innerHTML=BADGES.map(function(b,i){var ts=D.badges[b.id],p=Math.min(b.p(),b.t);if(ts)done++;
    return '<button class="stamp'+(ts?"":" lock")+'" type="button" data-note="'+esc(ts?b.d+" · "+dateFmt(ts):"Locked: "+b.d+" ("+p+" of "+b.t+")")+'" aria-label="'+esc(b.n+(ts?", earned":", locked. "+b.d+", "+p+" of "+b.t))+'">'+stampSVG(b,i,ts,p+" / "+b.t)+'</button>'}).join("");
  $("albumNote").textContent=done+" of "+BADGES.length+" stamps collected. Hover or focus a stamp to see how to earn it. Only real sessions count: the example garden doesn't.";
}
var TQ=[],TB=0;
function toast(b,title,sub){TQ.push({b:b,t:title,s:sub});if(!TB)toastNext()}
function toastNext(){
  var q=TQ.shift();if(!q){TB=0;return}TB=1;var el=$("toast");
  $("toastSv").innerHTML=q.b?stampSVG(q.b,BADGES.indexOf(q.b),Date.now(),""):'<span style="font-size:2.4rem;line-height:1">🏅</span>';
  $("toastT").textContent=q.t;$("toastS").textContent=q.s;
  el.classList.remove("on");void el.offsetWidth;el.classList.add("on");
  setTimeout(function(){el.classList.remove("on");setTimeout(toastNext,650)},4300);
}
function checkBadges(quiet){
  D.badges=D.badges||{};var nw=[];
  BADGES.forEach(function(b){if(!D.badges[b.id]&&b.p()>=b.t){D.badges[b.id]=Date.now();nw.push(b)}});
  if(nw.length){save();
    if(!quiet){if(nw.length>2)toast(null,nw.length+" new stamps","Open the album in Stats");else nw.forEach(function(b){toast(b,"New stamp: "+b.n,b.d)});pipCheer("stamp")}
    if(view==="stats")renderAlbum()}
  return nw.length;
}
function nextBadge(){var best=null,bf=-1;BADGES.forEach(function(b){if(!D.badges[b.id]){var f=Math.min(b.p(),b.t)/b.t;if(f>bf){bf=f;best=b}}});return best}

/* ---------- Pip, the companion ---------- */
var pipEl=$("pip"),pipSayEl=$("pipSay"),pipX=24,pipBusy=0,pipT=null,pipSayT=null,pipWalkT=null,pipLast=0,pipPtr=0;
function pipVW(){return Math.max(280,document.documentElement.clientWidth)}
function pipSize(){return pipEl.offsetWidth||54}
function pipPlace(x,dur){
  var mx=pipVW()-pipSize()-8;x=clamp(x,8,mx);
  if(dur>0&&!reduce){pipEl.style.transition="transform "+dur.toFixed(2)+"s linear";pipEl.classList.add("walk");pipEl.style.setProperty("--lean",(x>pipX?7:-7)+"deg");clearTimeout(pipWalkT);pipWalkT=setTimeout(function(){pipEl.classList.remove("walk");pipEl.style.setProperty("--lean","0deg")},dur*1000+80)}
  else pipEl.style.transition="none";
  pipX=x;pipEl.style.transform="translateX("+x+"px)";
}
function pipHop(){pipEl.classList.remove("hop");void pipEl.offsetWidth;pipEl.classList.add("hop");setTimeout(function(){pipEl.classList.remove("hop")},800)}
function pipSay(txt,ms){
  if(D.prefs.pip===false||!txt)return;
  pipSayEl.classList.remove("on");pipSayEl.textContent=txt;
  var w=pipSayEl.offsetWidth,cx=pipX+pipSize()/2,left=clamp(cx-w/2,8,pipVW()-w-8);
  pipSayEl.style.left=left+"px";pipSayEl.style.bottom="calc("+(pipSize()+14)+"px + max(6px, env(safe-area-inset-bottom, 0px)))";
  pipSayEl.style.setProperty("--tx",clamp(cx-left-7,14,Math.max(14,w-30))+"px");
  void pipSayEl.offsetWidth;pipSayEl.classList.add("on");
  pipBusy=1;clearTimeout(pipSayT);pipSayT=setTimeout(function(){pipSayEl.classList.remove("on");pipBusy=0},ms||4300);pipLast=Date.now();
}
var SZTIP={spring:"Spring: everything grows faster when you're not looking.",summer:"Summer light. Study early, water early.",autumn:"Autumn. Leaves fall, notes pile up. Both are good.",winter:"Winter garden: sleepy on top, roots working underneath."};
function pipTip(){
  var v=view,C=curCity(),p=[],hr=new Date().getHours(),sn=curSeason(),nb;
  if(hr>=23||hr<5)p.push("Late one! Finish this pomodoro, then sleep. Plants do.");
  if(v==="cities"){p.push("Where to today? The foggy ones haven't met you yet.","Every city grows different things. Try Kyoto for maples.","The sun and moon in a garden are clickable. Just saying.")}
  else if(v==="garden"){p.push(SZTIP[sn],"Click the plants in the back row. They have stories.","Hover a plant to read its tag. The ones with notes show them.",C.name+" suits you.")}
  else if(v==="focus"){p.push("One thing at a time. I'll keep watch.","Phone face down? Plant grows faster. (Not scientifically.)","Four tomatoes make a basket.")}
  else if(v==="journal"){p.push("Future you will thank past you for these notes.","One honest line is enough.","Foggy days count too.")}
  else{nb=nextBadge();p.push(nb?"Next stamp: "+nb.n+" ("+Math.min(nb.p(),nb.t)+" of "+nb.t+").":"Album complete. I'm so proud.","Stamps are earned, not given. I checked.")}
  var s=realStreak();if(s>=2)p.push(s+" days in a row. I'm keeping count.");
  return p[Math.floor(Math.random()*p.length)];
}
function pipCheer(kind,n){
  var m;
  if(kind==="done"){m=n%4===0?"Four in a row! Full basket. Long break, you earned it.":["Pomodoro done. One more plant!","Another one in the ground.","Nice. The garden noticed.","That's how gardens happen: one block at a time."][(n||1)%4];pipHop()}
  else if(kind==="stamp"){m="A new stamp! Look at you.";pipHop()}
  else if(kind==="wilt"){m="Oh no. It happens. Replant, and we go again."}
  else if(kind==="note"){m=["Written down. Future you says thanks.","Saved. I read it. I liked it.","Noted, literally."][Math.floor(Math.random()*3)]}
  if(m)setTimeout(function(){pipSay(m,4600)},kind==="stamp"?1200:300);
}
function pipSleepSync(){
  var s=!!(run&&run.phase==="focus");pipEl.classList.toggle("sleep",s);
  if(s&&!reduce&&pipX<pipVW()-pipSize()-40)pipPlace(pipVW()-pipSize()-14,Math.abs(pipVW()-pipSize()-14-pipX)/70);
}
function pipOnView(v){
  if(D.prefs.pip===false||(run&&run.phase==="focus"))return;
  setTimeout(function(){if(view===v&&!pipBusy&&Date.now()-pipLast>22000&&Math.random()<.75)pipSay(pipTip(),4600)},1100);
}
function pipNative(cid){
  var nat=NATIVE[cid];if(!nat)return;
  setTimeout(function(){if(view==="garden")pipSay("Try the "+SPECIES[nat[0]].label.toLowerCase()+" here. It's a local.",4600)},1500);
}
function pipLoop(){
  clearTimeout(pipT);
  pipT=setTimeout(function(){
    if(D.prefs.pip!==false&&!document.hidden&&!pipBusy&&!(run&&run.phase==="focus")){
      var r=Math.random();
      if(r<.6&&!reduce){var dest=8+Math.random()*(pipVW()-pipSize()-16),dx=Math.abs(dest-pipX);if(dx>40)pipPlace(dest,dx/42)}
      else if(r<.82&&Date.now()-pipLast>40000)pipSay(pipTip(),5200);
      else if(!reduce)pipHop();
    }
    pipLoop();
  },5500+Math.random()*7000);
}
function pipSyncPref(){
  pipEl.hidden=D.prefs.pip===false;$("pipBtn").setAttribute("aria-pressed",D.prefs.pip===false?"false":"true");$("pipBtn").textContent=D.prefs.pip===false?"Pip off":"Pip on";
  pipEl.setAttribute("data-season",curSeason());if(D.prefs.pip===false){pipSayEl.classList.remove("on");pipBusy=0}
}
function pipInit(){
  pipEl.style.transition="none";pipX=Math.max(8,pipVW()-pipSize()-18);pipEl.style.transform="translateX("+pipX+"px)";
  pipSyncPref();
  pipEl.addEventListener("click",function(){
    if(D.prefs.pip===false)return;var f=fl();f.pipClicks=(f.pipClicks||0)+1;save();pipHop();
    pipSay(f.pipClicks%7===0?"Okay okay, you found the tickle spot. 🐞":pipTip(),4200);checkBadges(false);
  });
  $("pipBtn").addEventListener("click",function(){D.prefs.pip=D.prefs.pip===false;save();pipSyncPref();if(D.prefs.pip!==false)pipSay("Hi again. I missed you.",3000)});
  document.addEventListener("pointermove",function(e){
    if(reduce||D.prefs.pip===false||pipEl.hidden)return;var n=Date.now();if(n-pipPtr<70)return;pipPtr=n;
    var r=pipEl.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height*.3),d=Math.sqrt(dx*dx+dy*dy)||1,k=Math.min(1,d/180)*1.9;
    pipEl.style.setProperty("--lx",(dx/d*k).toFixed(2)+"px");pipEl.style.setProperty("--ly",(dy/d*k*.7).toFixed(2)+"px");
  },{passive:true});
  window.addEventListener("resize",function(){pipPlace(pipX,0)});
  if(!fl().metPip&&fl().welcomed){fl().metPip=1;save();setTimeout(function(){pipSay("Hi! I'm Pip. I live here. Click me if you need a push.",5800)},1800)}
  pipLoop();
}

/* ---------- handwritten hover notes ---------- */
var NOTES=[
 [".brand","Yes, it's a tomato. No, you can't eat it."],
 ["nav.tabs button[data-view=cities]","start here ↓"],["nav.tabs button[data-view=garden]","your plants live here"],["nav.tabs button[data-view=focus]","where the work happens"],["nav.tabs button[data-view=journal]","what you wrote after each one"],["nav.tabs button[data-view=stats]","numbers, plus your stamp album"],
 ["#soundBtn","master switch for chimes and ambience"],["#themeBtn","lamp on, lamp off"],["#mixBtn","rain, birds, wind, a distant city"],["#pipBtn","say goodbye to Pip. They'll understand."],
 ["#kpis .kpi:nth-child(1)","a day counts once you finish a pomodoro"],["#kpis .kpi:nth-child(2)","focus time only. breaks are free"],["#kpis .kpi:nth-child(3)","wilted ones don't count"],
 ["#plantBtn","a seed has been waiting"],["footer .hand","(the tomatoes were real)"],
 [".growkey div:nth-child(1)","day one: barely there"],[".growkey div:nth-child(2)","a good start"],[".growkey div:nth-child(3)","starting to look like something"],[".growkey div:nth-child(4)","buds! be patient"],[".growkey div:nth-child(5)","oh hello"],[".growkey div:nth-child(6)","showing off a little"],[".growkey div:nth-child(7)","all grown up. sniff."],
 [".stampc:not(.off)","stamped by your first plant here"],[".stampc.off","your first plant brings the stamp"],[".pc.fog .th","still in the fog. Open it."],[".pc.dream .hello","dreams count as destinations"]
];
function applyNotes(){NOTES.forEach(function(n){var els=document.querySelectorAll(n[0]);for(var i=0;i<els.length;i++)if(!els[i].hasAttribute("data-note"))els[i].setAttribute("data-note",n[1])})}
var hn=$("hnote"),hnEl=null;
function hnShow(el){hnEl=el;hn.classList.remove("on");hn.textContent=el.getAttribute("data-note");
  var r=el.getBoundingClientRect(),w=hn.offsetWidth,h=hn.offsetHeight,vw=document.documentElement.clientWidth,left=clamp(r.left+r.width/2-w/2,8,vw-w-8),top=r.bottom+10;
  if(top+h>window.innerHeight-8)top=Math.max(8,r.top-h-10);
  hn.style.left=left+"px";hn.style.top=top+"px";hn.classList.add("on")}
function hnHide(){hnEl=null;hn.classList.remove("on")}
document.addEventListener("pointerover",function(e){if(e.pointerType==="touch")return;var el=e.target.closest?e.target.closest("[data-note]"):null;if(el&&el!==hnEl)hnShow(el);else if(!el&&hnEl)hnHide()});
document.addEventListener("focusin",function(e){var el=e.target.closest?e.target.closest("[data-note]"):null;var fv=false;try{fv=e.target.matches(":focus-visible")}catch(x){}if(el&&fv)hnShow(el)});
document.addEventListener("focusout",hnHide);
window.addEventListener("scroll",hnHide,{passive:true});
/* tomato rain */
var brandN=0,brandT=0;
document.querySelector(".brand").addEventListener("click",function(){
  var n=Date.now();if(n-brandT>1800)brandN=0;brandT=n;brandN++;
  if(brandN>=5){brandN=0;tomatoRain();foundSecret("tomato","You found the tomato storm. 🍅")}
});
function tomatoRain(){for(var i=0;i<34;i++){(function(i){setTimeout(function(){var e=document.createElement("span");e.className="rain-t";e.textContent=i%6===0?"🌱":"🍅";e.style.left=(Math.random()*96)+"vw";e.style.setProperty("--r",(Math.random()*500-250)+"deg");e.style.animationDuration=(1.8+Math.random()*1.6)+"s";e.setAttribute("aria-hidden","true");document.body.appendChild(e);setTimeout(function(){e.remove()},3800)},i*70)})(i)}}

/* ---------- garden surprises ---------- */
var gBub=document.createElement("div");gBub.className="gbub";gBub.setAttribute("aria-hidden","true");document.querySelector("#garden .stage").appendChild(gBub);
var gBubT=null;
function gSay(txt,cx,cy,sx){
  var st=gC.parentNode,sw=st.clientWidth,x=cx/sx,y=cy/sx;
  gBub.classList.remove("on");gBub.textContent=txt;gBub.style.left="0px";gBub.style.top="0px";
  var w=gBub.offsetWidth,h=gBub.offsetHeight,left=clamp(x-w/2,6,sw-w-6),top=y-h-14;if(top<6)top=y+20;
  gBub.style.left=left+"px";gBub.style.top=top+"px";void gBub.offsetWidth;gBub.classList.add("on");
  clearTimeout(gBubT);gBubT=setTimeout(function(){gBub.classList.remove("on")},6500);
}
var SUNMSG=["The sun waves back. ☀️","Free vitamin D. You're welcome.","150 million km away and still on your side.","Don't stare. But thanks for looking."],MOONMSG=["The moon has watched every study session ever.","Shh. Plants grow in the dark too.","It's 384,000 km away. Your deadline is closer.","Night shift? Respect."];
function celHit(ev){
  if(!CEL)return null;var r=gC.getBoundingClientRect(),sx=gC.width/r.width,x=(ev.clientX-r.left)*sx,y=(ev.clientY-r.top)*sx;
  return Math.sqrt((x-CEL.x)*(x-CEL.x)+(y-CEL.y)*(y-CEL.y))<CEL.r*1.3?{sx:sx}:null}
function plantClick(m){
  var h=m.h,s=h.s;tip.hidden=true;
  if(h.decor){gSay(h.f,h.cx,h.cy,m.sx);foundSecret(s.id,"Secret found: a plant with a story.");pipLast=Date.now();return}
  var sub=subjById(s.subj),txt;
  if(!s.ok)txt="This one wilted. It happens. It still taught you something.";
  else if(s.note)txt="“"+s.note+"”"+(s.mood!=null&&MOODS[s.mood]?" "+MOODS[s.mood][0]:"");
  else txt=minsFmt(s.mins)+" of "+sub.name+", "+dateFmt(s.ts)+". No note yet. The journal remembers if you add one.";
  gSay(txt,h.cx,h.cy,m.sx);
}
gC.addEventListener("pointerdown",function(ev){
  var m=hitAt(ev);if(m){plantClick(m);return}
  var c=celHit(ev);if(c){var d=CEL.day,l=d?SUNMSG:MOONMSG;gSay(l[Math.floor(Math.random()*l.length)],CEL.x,CEL.y+CEL.r,c.sx);pipHop();foundSecret(d?"sun":"moon",d?"You poked the sun. Bold.":"You greeted the moon.")}
});
gC.addEventListener("pointermove",function(ev){gC.classList.toggle("hot",!!(hitAt(ev)||celHit(ev)))});

/* ---------- note card (after each pomodoro) ---------- */
var MOODS=[["😫","Drained"],["😕","Foggy"],["😐","Okay"],["🙂","Good"],["🤩","Glowing"]];
function moodRadios(name,sel,pre){return MOODS.map(function(m,i){return '<input type="radio" name="'+name+'" id="'+pre+i+'" value="'+i+'"'+(sel===i?" checked":"")+'><label for="'+pre+i+'"><span aria-hidden="true">'+m[0]+'</span><small>'+m[1]+'</small></label>'}).join("")}
function noteCardSync(){
  var show=!!(run&&run.phase==="break"&&run.lastId&&run.noteDone!==run.lastId),nc=$("noteCard");
  if(show&&nc.getAttribute("data-id")!==run.lastId){nc.setAttribute("data-id",run.lastId);$("noteText").value=run.draft||"";$("moods").innerHTML=moodRadios("mood",null,"md");$("noteCount").textContent=""}
  nc.hidden=!show;
}
function saveNote(){
  if(!run||!run.lastId)return;var s=sessById(run.lastId);if(!s)return;
  var t=$("noteText").value.trim(),m=document.querySelector('input[name="mood"]:checked');
  if(!t&&!m){$("runStatus").textContent="Write a line or pick a mood first.";return}
  if(t)s.note=t.slice(0,280);if(m)s.mood=parseInt(m.value,10);
  run.noteDone=run.lastId;run.draft="";save();saveRun();$("noteCard").hidden=true;
  $("runStatus").textContent="Saved to your journal.";pipCheer("note");checkBadges(false);
}
function autoSaveNote(){if(run&&run.lastId&&run.noteDone!==run.lastId&&($("noteText").value.trim()||document.querySelector('input[name="mood"]:checked')))saveNote()}
$("noteSave").addEventListener("click",saveNote);
$("noteSkip").addEventListener("click",function(){if(!run)return;run.noteDone=run.lastId;run.draft="";saveRun();$("noteCard").hidden=true});
$("noteText").addEventListener("input",function(){if(run){run.draft=$("noteText").value;saveRun()}$("noteCount").textContent=$("noteText").value.length+" / 280"});
function worldDone(nu){
  var f=fl();f.seasons=f.seasons||{};f.seasons[curSeason()]=1;if(run.done>=4)f.fourpack=1;save();
  checkBadges(false);pipCheer("done",run.done);
}

/* ---------- journal view ---------- */
var JV={y:0,m:0,day:null,edit:null,more:40};
function dkey(y,m,d){return y+"-"+(m+1)+"-"+d}
function renderJournal(){
  if(!JV.y){var n=new Date();JV.y=n.getFullYear();JV.m=n.getMonth()}
  var first=new Date(JV.y,JV.m,1),days=new Date(JV.y,JV.m+1,0).getDate(),lead=(first.getDay()+6)%7,by={},td=dayKey(Date.now()),h="",i,notes=0;
  D.sessions.forEach(function(s){var k=dayKey(s.ts),b=by[k]=by[k]||{n:0,w:0,notes:0};if(s.ok)b.n++;else b.w++;if(s.note){b.notes++;notes++}});
  $("jMonth").textContent=first.toLocaleDateString(undefined,{month:"long",year:"numeric"});
  ["Mo","Tu","We","Th","Fr","Sa","Su"].forEach(function(x){h+='<div class="dow" aria-hidden="true">'+x+'</div>'});
  for(i=0;i<lead;i++)h+='<div></div>';
  for(i=1;i<=days;i++){var k=dkey(JV.y,JV.m,i),b=by[k],dots="",q;
    if(b)for(q=0;q<Math.min(b.n+b.w,4);q++)dots+="<i></i>";
    var lab=new Date(JV.y,JV.m,i).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"})+(b?", "+b.n+" pomodoro"+(b.n===1?"":"s")+(b.notes?", "+b.notes+" with notes":""):", nothing planted");
    h+='<button type="button" class="cd'+(b?" has":"")+(b&&b.notes?" nt":"")+(k===td?" today":"")+'" data-day="'+k+'" aria-pressed="'+(JV.day===k?"true":"false")+'"'+(b?"":" disabled")+' aria-label="'+esc(lab)+'">'+i+'<span class="dt">'+dots+'</span></button>'}
  $("jCal").innerHTML=h;
  $("jSummary").textContent=D.sessions.length+" sessions logged · "+notes+" with a note"+(JV.day?" · showing one day":"");
  $("jAll").hidden=!JV.day;$("jDaily").textContent=JV.day?"Page for this day":"Today’s page";
  renderEntries(notes);
}
function dayHeading(ts){return new Date(ts).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"})}
function renderEntries(notes){
  var list=D.sessions.slice().sort(function(a,b){return b.ts-a.ts});
  if(JV.day)list=list.filter(function(s){return dayKey(s.ts)===JV.day});
  var total=list.length,shown=JV.day?list:list.slice(0,JV.more),h="",cur="",grp={};
  shown.forEach(function(s){var k=dayKey(s.ts);(grp[k]=grp[k]||{ts:s.ts,m:0,n:0});if(s.ok){grp[k].m+=s.mins;grp[k].n++}});
  if(!total){$("jEntries").innerHTML='<p class="jempty">Nothing here yet. Finish a pomodoro and a note card will appear during the break.</p>';return}
  if(!notes&&!JV.day)h+='<p class="jempty" style="margin-bottom:1.2rem">No notes yet. After each pomodoro you can write a line and pick a mood: they will show up here. You can also add notes to older sessions below.</p>';
  shown.forEach(function(s){
    var k=dayKey(s.ts),sub=subjById(s.subj),C=CITY(s.city),sp=SPECIES[s.sp||sub.sp],tm=new Date(s.ts).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"});
    if(k!==cur){cur=k;h+='<div class="jday"><span>'+dayHeading(s.ts)+'</span><small>'+grp[k].n+' pomodoro'+(grp[k].n===1?"":"s")+' · '+minsFmt(grp[k].m)+'</small></div>'}
    var lat=LATIN[s.sp||sub.sp]||"",fig=D.sessions.length?(D.sessions.slice().sort(function(a,b){return a.ts-b.ts}).findIndex(function(x){return x.id===s.id})+1):0;
    h+='<article class="entry'+(s.ok?"":" wil")+'"><figure class="spec"><canvas width="132" height="156" data-sp="'+(s.sp||sub.sp)+'" data-seed="'+s.seed+'" data-ok="'+(s.ok?1:0)+'" aria-hidden="true"></canvas><figcaption>'+(s.ok?esc(lat):"wilted")+'<span>fig. '+fig+'</span></figcaption></figure><div class="ebody"><header><span>'+tm+'</span><span>'+C.flag+' '+esc(C.name)+'</span><span>'+sp.em+' '+esc(sub.name)+'</span><span>'+(s.ok?minsFmt(s.mins):"wilted")+'</span>'+(s.demo?'<span class="tagx">example</span>':'')+(s.mood!=null&&MOODS[s.mood]?'<span class="e-mood" role="img" aria-label="Felt '+MOODS[s.mood][1].toLowerCase()+'">'+MOODS[s.mood][0]+'</span>':'')+'</header></div>';
    if(JV.edit===s.id){
      h+='<div class="edit"><label class="sr" for="je-text">Your note</label><textarea class="jt" id="je-text" maxlength="280" rows="3" placeholder="What did you study, and how did it feel?">'+esc(s.note||"")+'</textarea><div class="moods" role="radiogroup" aria-label="How did it feel?">'+moodRadios("jmood",s.mood==null?null:s.mood,"jm")+'</div><div class="addrow"><button class="btn sm" type="button" data-save="'+s.id+'">Save</button><button class="btn ghost sm" type="button" data-cancel="1">Cancel</button>'+(s.note?'<button class="lnk" type="button" data-clear="'+s.id+'">Remove note</button>':'')+'</div></div>'}
    else{
      if(s.note)h+='<p class="e-note">'+esc(s.note)+'</p>';
      if(s.ok)h+='<button class="lnk" type="button" data-edit="'+s.id+'">'+(s.note?"Edit note":"Add a note")+'</button>'}
    h+='</article>'});
  if(!JV.day&&total>shown.length)h+='<div class="cta"><button class="btn ghost" id="jMore" type="button">Show older entries ('+(total-shown.length)+' more)</button></div>';
  $("jEntries").innerHTML=h;drawSpecimens();
}
$("jEntries").addEventListener("click",function(e){
  var t=e.target.closest?e.target.closest("button"):null;if(!t)return;
  if(t.id==="jMore"){JV.more+=40;renderEntries(noteCount());return}
  if(t.hasAttribute("data-edit")){JV.edit=t.getAttribute("data-edit");renderEntries(noteCount());var ta=$("je-text");if(ta)ta.focus();return}
  if(t.hasAttribute("data-cancel")){JV.edit=null;renderEntries(noteCount());return}
  if(t.hasAttribute("data-clear")){var s0=sessById(t.getAttribute("data-clear"));if(s0){delete s0.note;delete s0.mood;save()}JV.edit=null;renderJournal();return}
  if(t.hasAttribute("data-save")){
    var s=sessById(t.getAttribute("data-save"));if(!s)return;var txt=$("je-text").value.trim(),m=document.querySelector('input[name="jmood"]:checked');
    if(txt)s.note=txt.slice(0,280);else delete s.note;if(m)s.mood=parseInt(m.value,10);
    JV.edit=null;save();renderJournal();checkBadges(false);if(txt)pipCheer("note");
  }
});
$("jCal").addEventListener("click",function(e){var b=e.target.closest?e.target.closest("button[data-day]"):null;if(!b||b.disabled)return;var k=b.getAttribute("data-day");JV.day=JV.day===k?null:k;JV.edit=null;renderJournal()});
$("jAll").addEventListener("click",function(){JV.day=null;renderJournal()});
function jShift(d){JV.m+=d;if(JV.m<0){JV.m=11;JV.y--}else if(JV.m>11){JV.m=0;JV.y++}renderJournal()}
$("jPrev").addEventListener("click",function(){jShift(-1)});$("jNext").addEventListener("click",function(){jShift(1)});

/* ---------- seasons control ---------- */
function renderSeasonSeg(){
  var items=[["auto","Season: live ("+curSeason()+")"],["spring","🌸 Spring"],["summer","☀️ Summer"],["autumn","🍂 Autumn"],["winter","❄️ Winter"]],cur=D.prefs.season||"auto";
  $("seasonSeg").innerHTML=items.map(function(s){return '<input type="radio" name="season" id="sz-'+s[0]+'" value="'+s[0]+'"'+(cur===s[0]?" checked":"")+'><label for="sz-'+s[0]+'">'+s[1]+'</label>'}).join("");
}
$("seasonSeg").addEventListener("change",function(e){D.prefs.season=e.target.value;save();renderSeasonSeg();pipSyncPref();redraw();pipSay(SZTIP[curSeason()],4200);checkBadges(true)});

/* ---------- ambience mixer ---------- */
var AMB=null,NBUF={},AMBK={rain:1,wind:.9,city:.8,birds:1};
var MIXCH=[["rain","🌧️","Rain"],["birds","🐦","Birds"],["wind","🍃","Wind"],["city","🚋","City"]];
var CMIX={madrid:{city:.3,birds:.35,wind:.1},paris:{city:.3,birds:.25},london:{rain:.55,wind:.2,city:.12},kyoto:{wind:.22,birds:.4},lisbon:{wind:.3,birds:.3,city:.12},newyork:{city:.55},lebanon:{wind:.3,birds:.3},dream:{wind:.25,birds:.15,rain:.15}};
function noiseBuf(a,kind){if(NBUF[kind])return NBUF[kind];var len=a.sampleRate*3,b=a.createBuffer(1,len,a.sampleRate),d=b.getChannelData(0),last=0,i;
  for(i=0;i<len;i++){var w=Math.random()*2-1;if(kind==="white")d[i]=w*.6;else{last=(last+.02*w)/1.02;d[i]=last*3.5}}NBUF[kind]=b;return b}
function loopSrc(a,kind){var s=a.createBufferSource();s.buffer=noiseBuf(a,kind);s.loop=true;s.start();return s}
function flt(a,type,f,q){var x=a.createBiquadFilter();x.type=type;x.frequency.value=f;if(q)x.Q.value=q;return x}
function gn(a,v){var g=a.createGain();g.gain.value=v;return g}
function ambBuild(){
  var a=ctx();if(!a||AMB)return;var M=gn(a,0);M.connect(a.destination);AMB={a:a,m:M,g:{},src:[],timer:null,killT:null};
  var gr=gn(a,0),s1=loopSrc(a,"white"),g1=gn(a,.32),s2=loopSrc(a,"brown"),g2=gn(a,.5);
  AMB.src.push(s1,s2);
  var hp=flt(a,"highpass",1200),lp=flt(a,"lowpass",9000);s1.connect(hp);hp.connect(lp);lp.connect(g1);g1.connect(gr);
  s2.connect(flt(a,"lowpass",700)).connect(g2);g2.connect(gr);gr.connect(M);AMB.g.rain=gr;
  var gw=gn(a,0),s3=loopSrc(a,"brown"),lw=flt(a,"lowpass",420),lfo=a.createOscillator(),lg=gn(a,170);lfo.frequency.value=.13;lfo.connect(lg);lg.connect(lw.frequency);lfo.start();
  s3.connect(lw);lw.connect(gn(a,.8)).connect(gw);gw.connect(M);AMB.g.wind=gw;AMB.src.push(s3);AMB.lfo=[lfo];
  var gc=gn(a,0),s4=loopSrc(a,"brown"),s5=loopSrc(a,"brown"),lc2=flt(a,"lowpass",230),bp=flt(a,"bandpass",760,.7),lfo2=a.createOscillator(),lg2=gn(a,.08),mg=gn(a,.12);lfo2.frequency.value=.21;lfo2.connect(lg2);lg2.connect(mg.gain);lfo2.start();
  s4.connect(lc2);lc2.connect(gn(a,1.1)).connect(gc);s5.connect(bp);bp.connect(mg);mg.connect(gc);gc.connect(M);AMB.g.city=gc;AMB.src.push(s4,s5);AMB.lfo.push(lfo2);
  var gb=gn(a,0);gb.connect(M);AMB.g.birds=gb;
}
function ambApply(){if(!AMB)return;var a=AMB.a,mx=D.prefs.mix,on=D.prefs.sound,t0=a.currentTime;
  AMB.m.gain.setTargetAtTime(on?clamp(mx.master,0,1)*.8:0,t0,.25);
  ["rain","wind","city","birds"].forEach(function(k){AMB.g[k].gain.setTargetAtTime(mx[k]*AMBK[k],t0,.25)})}
function ambAny(){var m=D.prefs.mix;return m.rain>0||m.wind>0||m.city>0||m.birds>0}
function ambKill(){if(!AMB)return;clearTimeout(AMB.timer);AMB.src.forEach(function(s){try{s.stop()}catch(e){}});AMB.lfo.forEach(function(s){try{s.stop()}catch(e){}});try{AMB.m.disconnect()}catch(e){}AMB=null}
function ambSync(){
  if(D.prefs.sound&&ambAny()){var a=ctx();if(!a)return;if(a.state==="suspended")a.resume();ambBuild();ambApply();birdsGo()}
  else if(AMB){ambApply();var A=AMB;clearTimeout(A.killT);A.killT=setTimeout(function(){if(AMB===A&&!(D.prefs.sound&&ambAny()))ambKill()},900)}
  mixNote();
}
function chirps(){
  var a=AMB.a,n=2+Math.floor(Math.random()*4),f0=2300+Math.random()*1800,t0=a.currentTime+.02;
  for(var i=0;i<n;i++){var o=a.createOscillator(),g=a.createGain(),t=t0+i*(.09+Math.random()*.05),f=f0*(1+(Math.random()-.5)*.3);
    o.type="sine";o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*(1.25+Math.random()*.5),t+.07);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.1);o.connect(g);g.connect(AMB.g.birds);o.start(t);o.stop(t+.12)}
}
function birdsGo(){
  if(!AMB||AMB.timer)return;
  (function go(){if(!AMB||!D.prefs.sound||D.prefs.mix.birds<=0){if(AMB)AMB.timer=null;return}chirps();AMB.timer=setTimeout(go,900+Math.random()*3800/(.4+D.prefs.mix.birds))})();
}
function mixNote(){$("mixNote").textContent=D.prefs.sound?(ambAny()?"Playing your mix. Move a slider to change it.":"Sound is on. Raise a slider to hear something."):"Sound is off. Moving a slider turns it on."}
function mixSliders(){MIXCH.forEach(function(c){var v=Math.round(D.prefs.mix[c[0]]*100);$("mx-"+c[0]).value=v;$("mo-"+c[0]).textContent=v});var mv=Math.round(D.prefs.mix.master*100);$("mx-master").value=mv;$("mo-master").textContent=mv}
function mixInit(){
  var m=D.prefs.mix,h=MIXCH.map(function(c){return '<div class="mix-row"><label for="mx-'+c[0]+'">'+c[1]+' '+c[2]+'</label><input type="range" id="mx-'+c[0]+'" min="0" max="100" step="1" value="'+Math.round(m[c[0]]*100)+'"><output id="mo-'+c[0]+'" for="mx-'+c[0]+'">'+Math.round(m[c[0]]*100)+'</output></div>'}).join("");
  h+='<div class="mix-row"><label for="mx-master">Volume</label><input type="range" id="mx-master" min="0" max="100" step="1" value="'+Math.round(m.master*100)+'"><output id="mo-master" for="mx-master">'+Math.round(m.master*100)+'</output></div>';
  $("mixRows").innerHTML=h;
  $("mixer").addEventListener("input",function(e){var id=e.target.id;if(id.indexOf("mx-")!==0)return;var k=id.slice(3),v=e.target.value/100;D.prefs.mix[k]=v;$("mo-"+k).textContent=e.target.value;
    if(!D.prefs.sound&&v>0&&k!=="master"){D.prefs.sound=true;syncTools()}save();ambSync()});
  $("mixCity").addEventListener("click",function(){var p=CMIX[D.prefs.city]||{},sn=curSeason(),mm=D.prefs.mix;
    ["rain","birds","wind","city"].forEach(function(k){var v=p[k]||0;if(sn==="winter"){if(k==="birds")v*=.3;if(k==="wind")v+=.15}if(sn==="spring"&&k==="birds")v+=.2;if(sn==="autumn"&&k==="rain")v+=.18;mm[k]=clamp(v,0,1)});
    if(!D.prefs.sound){D.prefs.sound=true;syncTools()}save();mixSliders();ambSync()});
  $("mixOff").addEventListener("click",function(){var mm=D.prefs.mix;["rain","birds","wind","city"].forEach(function(k){mm[k]=0});save();mixSliders();ambSync()});
  $("mixBtn").addEventListener("click",function(){if($("mixer").hidden)mixOpen();else mixClose()});
  $("mixClose").addEventListener("click",function(){mixClose();$("mixBtn").focus()});
  document.addEventListener("pointerdown",function(e){if(!$("mixer").hidden&&!$("mixer").contains(e.target)&&e.target!==$("mixBtn"))mixClose()});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!$("mixer").hidden){mixClose();$("mixBtn").focus()}});
  window.addEventListener("resize",function(){if(!$("mixer").hidden)mixPos()});
  mixNote();
}
function mixPos(){var mx=$("mixer"),r=$("mixBtn").getBoundingClientRect(),w=mx.offsetWidth,vw=document.documentElement.clientWidth;mx.style.left=clamp(r.right-w+window.pageXOffset,8,Math.max(8,vw-w-8))+"px";mx.style.top=(r.bottom+window.pageYOffset+8)+"px"}
function mixOpen(){$("mixer").hidden=false;$("mixBtn").setAttribute("aria-expanded","true");mixPos();mixNote()}
function mixClose(){$("mixer").hidden=true;$("mixBtn").setAttribute("aria-expanded","false")}
function firstGesture(){
  function go(){document.removeEventListener("pointerdown",go);document.removeEventListener("keydown",go);if(D.prefs.sound){ambSync();if(run)windOn()}}
  document.addEventListener("pointerdown",go);document.addEventListener("keydown",go);
}

/* ---------- keep a running pomodoro across reloads ---------- */
function saveRun(){try{if(run){run.seen=Date.now();localStorage.setItem(RKEY,JSON.stringify(run))}}catch(e){}}
function clearRun(){try{localStorage.removeItem(RKEY)}catch(e){}}
function restoreRun(){
  var raw=null,r;try{raw=localStorage.getItem(RKEY)}catch(e){}
  if(!raw)return false;
  try{r=JSON.parse(raw)}catch(e){clearRun();return false}
  if(!r||!r.phase||!r.dur||!r.start||!r.city||!r.subj){clearRun();return false}
  var seen=r.seen||r.start,away=Date.now()-seen;
  run=r;run.hiddenAt=null;run.confirm=false;
  $("setup").hidden=true;$("result").hidden=true;$("running").hidden=false;
  if(run.phase==="focus"&&run.strict&&away>15000){
    run.start=Date.now()-Math.max(0,seen-r.start);finish(false);
    setTimeout(function(){pipSay("Your plant wilted while you were away. Replant, and we go again.",5200)},900);return true}
  paintPhase();updateRun();
  $("runStatus").textContent="Welcome back. Your timer kept going.";
  setTimeout(function(){pipSay("Welcome back. I kept your seat warm.",4200)},900);
  return true;
}
window.addEventListener("pagehide",saveRun);
setInterval(function(){if(run)saveRun()},2500);


/* ====================== finishing touches ====================== */
var LATIN={rose:"Rosa gallica",fern:"Polypodium vulgare",tulip:"Tulipa gesneriana",sunflower:"Helianthus annuus",lavender:"Lavandula angustifolia",blossom:"Prunus serrulata",tomato:"Solanum lycopersicum",oak:"Quercus robur",pine:"Pinus pinea",daisy:"Bellis perennis",olive:"Olea europaea",pot:"Pelargonium zonale",peony:"Paeonia lactiflora",hydrangea:"Hydrangea macrophylla",maple:"Acer palmatum",bonsai:"Pinus thunbergii",bamboo:"Phyllostachys edulis",bougainvillea:"Bougainvillea glabra",citrus:"Citrus × sinensis",ginkgo:"Ginkgo biloba",cedar:"Cedrus libani",jasmine:"Jasminum officinale",palm:"Phoenix dactylifera",glowflower:"Somnium luminosum"};
var storageOK=true;try{localStorage.setItem("sg.t","1");localStorage.removeItem("sg.t")}catch(e){storageOK=false}
var lastM=null;
function openM(id){lastM=document.activeElement;$(id).hidden=false;var f=$(id).querySelector("button");if(f)f.focus()}
function closeM(id){$(id).hidden=true;if(lastM&&lastM.focus)lastM.focus()}
document.addEventListener("keydown",function(e){
  ["daily","saveinfo"].forEach(function(id){var m=$(id);if(m.hidden)return;
    if(e.key==="Escape")closeM(id);
    else if(e.key==="Tab"){var f=[].slice.call(m.querySelectorAll("button,textarea,input")).filter(function(x){return !x.hidden&&!x.disabled});if(!f.length)return;var i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}});
  if(e.key==="Escape"){if(!$("welcome").hidden)closeWelcome();if(!$("journey").hidden)$("journey").click()}
});
["daily","saveinfo"].forEach(function(id){$(id).addEventListener("click",function(e){if(e.target===$(id))closeM(id)})});

/* ---------- welcome ---------- */
function showWelcome(){lastM=document.activeElement;$("welcome").hidden=false;$("wBegin").focus();$("welcome").scrollTop=0}
function closeWelcome(){
  $("welcome").hidden=true;var f=fl();f.welcomed=1;save();
  if(lastM&&lastM.focus&&lastM!==document.body)lastM.focus();
  if(!f.metPip){f.metPip=1;save();setTimeout(function(){pipSay("Hi! I'm Pip. I live here. Click me if you need a push.",5600)},1200)}
}
$("wBegin").addEventListener("click",closeWelcome);$("wSkip").addEventListener("click",closeWelcome);
$("howBtn").addEventListener("click",showWelcome);

/* ---------- travelling between cities ---------- */
function parseC(c){var m=/([\d.]+)° ([NS]).*?([\d.]+)° ([EW])/.exec(c);return m?{lat:(m[2]==="S"?-1:1)*parseFloat(m[1]),lon:(m[4]==="W"?-1:1)*parseFloat(m[3])}:null}
function kmBetween(a,b){var t=Math.PI/180,dl=(b.lat-a.lat)*t,dn=(b.lon-a.lon)*t,x=Math.pow(Math.sin(dl/2),2)+Math.cos(a.lat*t)*Math.cos(b.lat*t)*Math.pow(Math.sin(dn/2),2);return Math.round(2*6371*Math.asin(Math.sqrt(x)))}
var trav=null;
function travel(from,to,done){
  if(trav){return}
  var A=CITY(from),B=CITY(to),pa=parseC(CMETA[from].c),pb=parseC(CMETA[to].c),d=pa&&pb?kmBetween(pa,pb):0,rtl=!!(pa&&pb&&pb.lon<pa.lon),x1=rtl?340:60,x2=rtl?60:340,y1=140,y2=64,cy=-30;
  $("jyTitle").textContent=A.name+" → "+B.name;$("jySub").textContent=d?("about "+d.toLocaleString()+" km, one stamp pending"):"a short hop";
  $("jyPath").setAttribute("d","M"+x1+" "+y1+" Q200 "+cy+" "+x2+" "+y2);
  $("jyA").setAttribute("cx",x1);$("jyA").setAttribute("cy",y1);$("jyB").setAttribute("cx",x2);$("jyB").setAttribute("cy",y2);
  $("jyTA").setAttribute("x",x1);$("jyTA").setAttribute("y",y1+26);$("jyTA").textContent=A.name;$("jyTB").setAttribute("x",x2);$("jyTB").setAttribute("y",y2+26);$("jyTB").textContent=B.name;
  var el=$("journey"),t0=performance.now(),dur=2300,fin=false;el.hidden=false;
  chime([0,7,12]);
  function end(){if(fin)return;fin=true;trav=null;el.hidden=true;el.onclick=null;done()}
  trav={end:end};el.onclick=end;
  (function step(now){
    if(fin)return;var p=Math.min(1,((now||performance.now())-t0)/dur),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2,a=1-e,
      x=a*a*x1+2*a*e*200+e*e*x2,y=a*a*y1+2*a*e*cy+e*e*y2,dx=2*a*(200-x1)+2*e*(x2-200),dy=2*a*(cy-y1)+2*e*(y2-cy),ang=Math.atan2(dy,dx)*180/Math.PI;
    $("jyPlane").setAttribute("transform","translate("+x.toFixed(1)+" "+(y+8).toFixed(1)+") rotate("+(ang.toFixed(1))+")");
    if(p>=1){setTimeout(end,350)}else requestAnimationFrame(step);
  })();
}

/* ---------- today's page ---------- */
function fmtDur(m){if(m<1)return Math.round(m*60)+" sec";m=Math.round(m);return m<60?m+" min":Math.floor(m/60)+" h "+(m%60?(m%60)+" min":"")}
function showDaily(key){
  key=key||dayKey(Date.now());var isToday=key===dayKey(Date.now());
  var list=D.sessions.filter(function(s){return !s.demo&&dayKey(s.ts)===key}).sort(function(a,b){return a.ts-b.ts}),ok=list.filter(function(s){return s.ok}),wil=list.length-ok.length,mins=ok.reduce(function(a,s){return a+s.mins},0),notes=list.filter(function(s){return s.note});
  var cities={};ok.forEach(function(s){cities[CITY(s.city).name]=1});
  var ts=list.length?list[0].ts:Date.now(),dt=new Date(ts);
  if(!list.length){var p=key.split("-");dt=new Date(+p[0],+p[1]-1,+p[2])}
  $("dKick").textContent=isToday?"End-of-day summary":"Page from the diary";
  $("dTitle").textContent=dt.toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"});
  var h='<div class="dgrid"><div><b>'+ok.length+'</b><span>pomodoros</span><small>'+(wil?wil+" wilted":"none wilted")+'</small></div><div><b>'+ok.length+'</b><span>plants grown</span><small>'+(Object.keys(cities).join(", ")||"nothing planted")+'</small></div><div><b>'+(mins?fmtDur(mins):"0")+'</b><span>time studied</span><small>focus time only</small></div><div><b>'+notes.length+'</b><span>journal entries</span><small>'+(ok.length?(ok.length-notes.length)+" without a note":"")+'</small></div></div>';
  if(ok.length)h+='<div class="dplants" aria-label="Plants grown">'+ok.map(function(s){return SPECIES[s.sp||subjById(s.subj).sp].em}).join("")+'</div>';
  var rem=!ok.length?(isToday?"Nothing planted yet. The soil is ready when you are.":"A quiet day. Gardens rest too."):ok.length>=4?"A full basket. That is a proper day's work.":ok.length>=2?"Steady work. The garden noticed.":"One seed in the ground. That's how it starts.";
  h+='<p class="hand">'+rem+'</p>';
  if(notes.length){h+='<h4>From your journal</h4><ul class="dnotes">'+notes.map(function(s){return '<li><q>'+esc(s.note)+(s.mood!=null&&MOODS[s.mood]?" "+MOODS[s.mood][0]:"")+'</q><small>'+new Date(s.ts).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"})+' · '+esc(subjById(s.subj).name)+' · '+esc(CITY(s.city).name)+'</small></li>'}).join("")+'</ul>'}
  else if(ok.length)h+='<p class="note">No journal notes for this day. You can add them in the journal.</p>';
  $("dBody").innerHTML=h;$("dJournal").setAttribute("data-day",key);openM("daily");
}
$("dClose").addEventListener("click",function(){closeM("daily")});
$("dJournal").addEventListener("click",function(){var k=$("dJournal").getAttribute("data-day");closeM("daily");var p=k.split("-");JV.y=+p[0];JV.m=+p[1]-1;JV.day=null;setView("journal",$("jh"))});
$("jDaily").addEventListener("click",function(){showDaily(JV.day||dayKey(Date.now()))});
$("resDaily").addEventListener("click",function(){showDaily()});

/* ---------- saving: info, backup, restore, reset ---------- */
function backupText(){return JSON.stringify({app:"pomodoro-garden",v:2,saved:new Date().toISOString(),data:D})}
function siRefresh(){var real=D.sessions.filter(function(s){return !s.demo}).length,b=fl().backupAt;
  $("siInfo").textContent=real+" real session"+(real===1?"":"s")+" saved here · "+Math.round(backupText().length/102.4)/10+" KB · "+(b?"last backup copied "+new Date(b).toLocaleDateString(undefined,{day:"numeric",month:"short"}):"no backup copied yet")}
$("saveBtn").addEventListener("click",function(){siRefresh();$("siStatus").textContent="";$("bkText").hidden=true;$("bkReset").textContent="Erase everything";$("bkRestore").textContent="Restore this backup";openM("saveinfo")});
$("siClose").addEventListener("click",function(){closeM("saveinfo")});
$("bkShow").addEventListener("click",function(){var t=$("bkText");t.hidden=!t.hidden;if(!t.hidden){t.value=backupText();t.focus();t.select()}});
$("bkCopy").addEventListener("click",function(){
  var txt=backupText(),done=function(){fl().backupAt=Date.now();save();siRefresh();$("siStatus").textContent="Copied. Paste it into a note or an email to yourself."},
  fb=function(){var t=$("bkText");t.hidden=false;t.value=txt;t.focus();t.select();fl().backupAt=Date.now();save();siRefresh();$("siStatus").textContent="Your browser blocked copying. The text is selected: copy it yourself."};
  try{navigator.clipboard.writeText(txt).then(done,fb)}catch(e){fb()}
});
$("bkRestore").addEventListener("click",function(){
  var raw=$("bkIn").value.trim(),o;if(!raw){$("siStatus").textContent="Paste a backup first.";return}
  try{o=JSON.parse(raw);if(o&&o.data)o=o.data}catch(e){o=null}
  if(!o||!Array.isArray(o.subjects)||!Array.isArray(o.sessions)||!o.prefs){$("siStatus").textContent="That doesn't look like a Pomodoro Garden backup.";return}
  if($("bkRestore").getAttribute("data-c")!=="1"){$("bkRestore").setAttribute("data-c","1");$("bkRestore").textContent="Replace my garden with this backup?";$("siStatus").textContent="This overwrites what is saved now. Press again to confirm.";return}
  try{localStorage.setItem(KEY,JSON.stringify(o));localStorage.removeItem(RKEY)}catch(e){$("siStatus").textContent="Could not save: this browser is blocking storage.";return}
  $("siStatus").textContent="Restored. Reloading…";location.reload();
});
$("bkReset").addEventListener("click",function(){
  if($("bkReset").getAttribute("data-c")!=="1"){$("bkReset").setAttribute("data-c","1");$("bkReset").textContent="Really erase everything?";$("siStatus").textContent="This deletes all sessions, notes and stamps from this browser. Copy a backup first if unsure. Press again to confirm.";return}
  try{localStorage.removeItem(KEY);localStorage.removeItem(RKEY)}catch(e){}
  $("siStatus").textContent="Erased. Reloading…";location.reload();
});
function backupNag(){
  var real=D.sessions.filter(function(s){return !s.demo&&s.ok}).length,f=fl(),now=Date.now();
  if(real<3||D.prefs.pip===false)return;
  if((!f.backupAt||now-f.backupAt>6048e5)&&(!f.nagAt||now-f.nagAt>2592e5)){f.nagAt=now;save();setTimeout(function(){pipSay("You have a lot growing here. Want a backup? Footer, 'How saving works'.",6200)},4000)}
}

/* ---------- plant bloom (focus) + sprout (garden) ---------- */
function growBack(t){if(t<=0)return 0;if(t>=1)return 1;return 1+2.70158*Math.pow(t-1,3)+1.70158*Math.pow(t-1,2)}

/* ---------- diary specimens ---------- */
function drawSpecimens(){
  SEASON=curSeason();setGreen();
  var cs=document.querySelectorAll("#jEntries canvas[data-sp]");
  for(var i=0;i<cs.length;i++){var cv=cs[i],c=cv.getContext("2d"),sp=cv.getAttribute("data-sp");c.clearRect(0,0,cv.width,cv.height);c.save();c.translate(cv.width/2,cv.height-8);
    if(cv.getAttribute("data-ok")==="1"&&DRAW[sp])drawPlant(c,sp,+cv.getAttribute("data-seed"),spCol(sp),1,cv.height*.78);else drawWilted(c,cv.height*.5);c.restore()}
}

/* ---------- start ---------- */
syncTools();setView("cities");applyNotes();pipInit();mixInit();firstGesture();
$("storeWarn").hidden=storageOK;
if(!fl().welcomed&&!realOk().length)showWelcome();else backupNag();
if(restoreRun())setView("focus");
checkBadges(false);
window.addEventListener("resize",redraw);
})();
