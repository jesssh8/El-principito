// ============================================================
// main.js — EL MOTOR DEL JUEGO.
// ============================================================
// Aquí vive la física, el dibujo en pantalla, la tienda, el audio
// y los controles. Es el archivo "de ingeniería": normalmente NO
// hace falta tocarlo para agregar un personaje o cambiar un texto
// (eso se edita en js/data/). Solo entra aquí si quieres cambiar
// CÓMO se comporta o se ve el juego (velocidad de salto, dibujo de
// un bioma nuevo, una plataforma nueva, etc.). Ver README.md.
// ============================================================
import { rand, mod, clamp, sm, toRGB, rgb, mix, shade, lighten, mid, rr, setSeed, R } from './core/utils.js';
import { INK, smooth, ellP, rectP, starP, heartP, shape, hl, curve } from './core/draw.js';
import { OUT } from './data/characters.js';
import { BIOMES_DEF } from './data/biomes.js';
import { MUSIC_TRACKS } from './data/music.js';

/* ================= CONSTANTES ================= */
const W=360,H=640;
const REVIVE_COST=110;
const BL=14000;                 // altura (px) de cada bioma: se tarda bastante en cada uno
const G=0.42,JUMP=12.6,SPRING=19.5,MAXVX=4.6,HW=14,PS=0.8;
const PLANE=SPRING*Math.sqrt(6.5),PLANE_G=G*.82;
const KEY='principito_publico_v1';
const $=id=>document.getElementById(id);

/* ================= GUARDADO ================= */
const save={coins:0,best:0,unlocked:[true],equipped:0,sound:true};
let dirty=false;
function load(){
  try{
    const s=JSON.parse(localStorage.getItem(KEY)||'null');
    if(s){
      save.coins=s.coins|0; save.best=s.best|0;
      const unlocked=Array.isArray(s.unlocked)?s.unlocked:[];
      save.unlocked=Array.from({length:OUT.length},(_,i)=>i===0||!!unlocked[i]);
      save.equipped=(s.equipped|0); if(!save.unlocked[save.equipped]) save.equipped=0;
      save.sound=s.sound!==false;
    }
  }catch(e){}
}
function persist(){ try{localStorage.setItem(KEY,JSON.stringify(save));}catch(e){} dirty=false; }
setInterval(()=>{ if(dirty) persist(); },1000);
addEventListener('pagehide',persist);
document.addEventListener('visibilitychange',()=>{ if(document.hidden){ persist(); if(state==='play') pauseGame(); } });

/* ================= SPRITES ================= */
let S=1; const SP={};
function mk(w,h,fn){const cv=document.createElement('canvas');cv.width=Math.ceil(w*S);cv.height=Math.ceil(h*S);
  const c=cv.getContext('2d');c.scale(S,S);cv.lw=w;cv.lh=h;fn(c,w,h);return cv;}
function spr(c,cv,x,y,s){s=s||1;c.drawImage(cv,x,y,cv.lw*s,cv.lh*s);}

function drawChar(c,o,seed){
  setSeed(seed);
  const cx=32,fy=76,skin='#FDE4D0';
  if(o.draw){ o.draw(c,o,cx,fy); return; }
  if(o.cape){
    shape(c,[{x:cx-13,y:fy-42},{x:cx+13,y:fy-42},{x:cx+22,y:fy-10},{x:cx+4,y:fy-2},{x:cx-6,y:fy-4},{x:cx-22,y:fy-10}],o.cape,{a:.92});
    [[-12,-22],[10,-16],[-4,-10],[14,-28]].forEach(p=>hl(c,cx+p[0],fy+p[1],1.7,1.7,'#FFE9A6',.95));
  }
  shape(c,ellP(cx-8,fy-3.5,6.5,4.2,rr,8),o.shoe);
  shape(c,ellP(cx+8,fy-3.5,6.5,4.2,rr,8),o.shoe);
  shape(c,ellP(cx,fy-21,13.5,18,rr,12,.04),o.tunic);
  hl(c,cx+4,fy-13,8,9,o.tunic2,.5);
  if(o.kind===1){ curve(c,[{x:cx-8,y:fy-24},{x:cx,y:fy-20},{x:cx+8,y:fy-24}],shade(o.tunic,-40),1.1,.6); }
  if(o.kind===3){ hl(c,cx,fy-22,3,3,'#F5D57A',.9); curve(c,[{x:cx,y:fy-36},{x:cx,y:fy-8}],shade(o.tunic,-40),1,.55); }
  shape(c,ellP(cx-15,fy-22,4.6,7.4,rr,8),o.tunic);
  shape(c,ellP(cx+15,fy-22,4.6,7.4,rr,8),o.tunic);
  hl(c,cx-15.5,fy-15.5,3,3,skin,.95); hl(c,cx+15.5,fy-15.5,3,3,skin,.95);
  shape(c,ellP(cx,fy-36,12.5,4.8,rr,10),o.scarf);
  if(o.kind!==3){
    shape(c,ellP(cx-13,fy-50,5,7,rr,8),o.hair,{pen:false});
    shape(c,ellP(cx+13,fy-50,5,7,rr,8),o.hair,{pen:false});
  }
  shape(c,ellP(cx,fy-49,15.5,15,rr,14,.03),skin);
  if(o.kind!==3){
    shape(c,ellP(cx-10,fy-60,6.5,5.5,rr,9),o.hair);
    shape(c,ellP(cx-3,fy-63,6.5,6,rr,9),o.hair);
    shape(c,ellP(cx+5,fy-63,6.5,6,rr,9),o.hair);
    shape(c,ellP(cx+11,fy-59,6,5.5,rr,9),o.hair);
    shape(c,ellP(cx+3,fy-69,3,5,rr,7),o.hair);
  } else {
    shape(c,ellP(cx-8,fy-56,4,3.5,rr,7),o.hair,{pen:false});
    shape(c,ellP(cx+8,fy-56,4,3.5,rr,7),o.hair,{pen:false});
    shape(c,ellP(cx,fy-58,16.5,10.5,rr,12,.03),o.cap);
    shape(c,ellP(cx-16,fy-50,4.2,8,rr,8),o.cap);
    shape(c,ellP(cx+16,fy-50,4.2,8,rr,8),o.cap);
    curve(c,[{x:cx-15,y:fy-56},{x:cx,y:fy-53},{x:cx+15,y:fy-56}],'#7B5A40',2.2,.7);
    [-6.5,6.5].forEach(dx=>{ shape(c,ellP(cx+dx,fy-60,5,5,rr,9),'#D9EEF6',{a:.95}); hl(c,cx+dx-1.4,fy-61.5,1.4,1.4,'#fff',.9); });
  }
  if(o.kind===2){
    shape(c,[{x:cx-8,y:fy-68},{x:cx-9,y:fy-77},{x:cx-4,y:fy-72},{x:cx,y:fy-79},{x:cx+4,y:fy-72},{x:cx+9,y:fy-77},{x:cx+8,y:fy-68}],'#F7D774',{a:.95});
    hl(c,cx,fy-72.5,1.3,1.3,'#F19AB0',.95);
  }
  const ey=fy-48;
  shape(c,ellP(cx-5.8,ey,2.2,3,rr,7,.02),'#4A3A3A',{pen:false,edge:false,a:1});
  shape(c,ellP(cx+5.8,ey,2.2,3,rr,7,.02),'#4A3A3A',{pen:false,edge:false,a:1});
  hl(c,cx-5.2,ey-1.1,.9,.9,'#fff',1); hl(c,cx+6.4,ey-1.1,.9,.9,'#fff',1);
  hl(c,cx-10,fy-42,3.6,2.4,'#F49AAA',.6); hl(c,cx+10,fy-42,3.6,2.4,'#F49AAA',.6);
  curve(c,[{x:cx-2.5,y:fy-42},{x:cx,y:fy-40.2},{x:cx+2.5,y:fy-42}],'#8A4E48',1.1,.85);
}

const PAL=[{t:'#F8DDBE',b:'#DE9772'},{t:'#DCEBD2',b:'#9CBF9F'},{t:'#FFFAF6',b:'#F6D0D7'},{t:'#E3DBF6',b:'#AB9EDA'}];
function platBody(c,bi,x,y,w,h,col){
  if(bi===0) shape(c,rectP(x,y,w,h,6,rr,1.2),col);
  else if(bi===1) shape(c,ellP(x+w/2,y+h/2,w/2,h/2+1,rr,14,.05),col);
  else if(bi===2){
    shape(c,rectP(x+3,y+5,w-6,h-4,7,rr,1),col,{pen:false});
    shape(c,ellP(x+w*.27,y+5,w*.2,7,rr,10),col);
    shape(c,ellP(x+w*.55,y+3,w*.25,8.5,rr,10),col);
    shape(c,ellP(x+w*.82,y+6,w*.15,6,rr,10),col);
  } else shape(c,ellP(x+w/2,y+h/2,w/2,h/2+1,rr,11,.09),col);
}
function platSprite(bi,type){
  return mk(82,32,c=>{
    setSeed(bi*31+type*7+3);
    let pal=type===1?{t:'#FCEBAE',b:'#F0C765'}:PAL[bi];
    if(type===2) pal={t:lighten(pal.t,.3),b:lighten(pal.b,.32)};
    const x=5,y=8,w=72,h=15;
    platBody(c,bi,x,y,w,h,pal.b);
    hl(c,x+w/2,y+h*.32,w*.36,h*.2,pal.t,.75);
    if(bi===0&&type!==2){ curve(c,[{x:x+12,y:y+11},{x:x+20,y:y+10}],INK,1,.45); curve(c,[{x:x+50,y:y+11},{x:x+60,y:y+10}],INK,1,.45); }
    if(bi===1) curve(c,[{x:x+8,y:y+h/2},{x:x+w/2,y:y+h/2+1},{x:x+w-8,y:y+h/2-1}],'#6E8F73',1.1,.7);
    if(bi===3){ hl(c,x+18,y+9,3,2,shade(pal.b,-30),.7); hl(c,x+50,y+10,2.4,1.6,shade(pal.b,-30),.7); }
    if(type===1){
      curve(c,[{x:x+11,y:y+4},{x:x+6,y:y+8},{x:x+11,y:y+12}],INK,1.5,.8);
      curve(c,[{x:x+w-11,y:y+4},{x:x+w-6,y:y+8},{x:x+w-11,y:y+12}],INK,1.5,.8);
    }
    if(type===2){
      curve(c,[{x:x+30,y:y+1},{x:x+35,y:y+6},{x:x+29,y:y+10},{x:x+36,y:y+15}],INK,1.1,.8);
      curve(c,[{x:x+52,y:y+2},{x:x+48,y:y+8},{x:x+53,y:y+13}],INK,1,.7);
    }
  });
}
function buildSprites(){
  SP.plat=[];for(let b=0;b<4;b++)SP.plat.push([0,1,2].map(t=>platSprite(b,t)));
  SP.star=mk(32,34,c=>{setSeed(7);
    const g=c.createRadialGradient(16,17,2,16,17,16);g.addColorStop(0,'rgba(255,236,150,.6)');g.addColorStop(1,'rgba(255,236,150,0)');
    c.fillStyle=g;c.fillRect(0,0,32,34);
    shape(c,starP(16,18,12.5,rr),'#F8DA7A');hl(c,14,15,2.6,1.6,'#FFF6CF',.9);});
  SP.heart=mk(32,34,c=>{setSeed(8);
    const g=c.createRadialGradient(16,17,2,16,17,16);g.addColorStop(0,'rgba(255,170,190,.55)');g.addColorStop(1,'rgba(255,170,190,0)');
    c.fillStyle=g;c.fillRect(0,0,32,34);
    shape(c,heartP(16,14,.85),'#F29BB1');hl(c,11,10,3,1.8,'#FFE3EA',.9);});
  SP.spring=mk(26,28,c=>{setSeed(9);
    curve(c,[{x:13,y:27},{x:5,y:23},{x:21,y:19},{x:5,y:15},{x:21,y:11},{x:13,y:9}],'#8FB39A',3,.95);
    curve(c,[{x:13,y:27},{x:5,y:23},{x:21,y:19},{x:5,y:15},{x:21,y:11},{x:13,y:9}],INK,.9,.55);
    for(let k=0;k<5;k++){const t=k/5*6.283;shape(c,ellP(13+Math.cos(t)*4.6,6+Math.sin(t)*4.6,3.2,3.2,rr,7),'#F5A4B8');}
    shape(c,ellP(13,6,2.6,2.6,rr,7),'#F8DA7A');});
  SP.chars=OUT.map((o,i)=>mk(64,80,c=>drawChar(c,o,100+i)));
  SP.spark=['#FFF3C4','#FFE08A','#FFFFFF'].map((col,i)=>mk(18,18,c=>{setSeed(30+i);
    const p=[];for(let k=0;k<8;k++){const r=k%2?1.8:8;const t=k*Math.PI/4;p.push({x:9+Math.cos(t)*r,y:9+Math.sin(t)*r});}
    shape(c,p,col,{pen:false,edge:false,a:1});}));
  SP.sun=mk(240,240,c=>{setSeed(3);
    const g=c.createRadialGradient(120,120,20,120,120,120);g.addColorStop(0,'rgba(255,238,180,.85)');g.addColorStop(.5,'rgba(255,214,170,.35)');g.addColorStop(1,'rgba(255,214,170,0)');
    c.fillStyle=g;c.fillRect(0,0,240,240);
    shape(c,ellP(120,120,52,52,rr,14,.02),'#FFD98F',{pen:false,a:.95});
    shape(c,ellP(120,120,40,40,rr,12,.03),'#FFEBB8',{pen:false,edge:false,a:.9});});
  const dcol=[['#F7D2BA','#F0BE9F'],['#EFB899','#E6A483'],['#E4A585','#D48F6E']];
  SP.dune=dcol.map((d,i)=>mk(W+40,200,(c,w,h)=>{
    const ph=DPH[i];
    const gr=c.createLinearGradient(0,10,0,120);gr.addColorStop(0,d[0]);gr.addColorStop(1,d[1]);
    c.fillStyle=gr;c.beginPath();c.moveTo(0,h);for(let x=0;x<=w;x+=6)c.lineTo(x,crestAt(x,ph));c.lineTo(w,h);c.closePath();c.fill();
    setSeed(60+i);
    for(let k=0;k<5;k++){const x0=rr()*(w-80),y0=crestAt(x0,ph)+18+rr()*40;
      curve(c,[{x:x0,y:y0},{x:x0+22,y:y0-3},{x:x0+46,y:y0}],'rgba(150,100,80,1)',1,.28);}
    c.save();c.strokeStyle='rgba(122,95,82,.5)';c.lineWidth=1.1;c.beginPath();
    for(let x=0;x<=w;x+=6){const y=crestAt(x,ph)+(rr()-.5)*.5;x?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();c.restore();
  }));
  SP.fox=mk(64,46,c=>{setSeed(11);const or='#E9A67A',cr='#FFF1DE';
    shape(c,ellP(12,28,13,8,rr,10),or);shape(c,ellP(5,30,5,4,rr,8),cr);
    shape(c,ellP(34,32,19,10,rr,11),or);hl(c,36,36,10,4,cr,.85);
    shape(c,[{x:20,y:39},{x:24,y:39},{x:24,y:45},{x:20,y:45}],'#B8785C');shape(c,[{x:42,y:39},{x:46,y:39},{x:46,y:45},{x:42,y:45}],'#B8785C');
    shape(c,ellP(51,21,10,9,rr,10),or);
    shape(c,[{x:44,y:16},{x:46,y:4},{x:52,y:14}],or);shape(c,[{x:52,y:13},{x:58,y:5},{x:59,y:17}],or);
    hl(c,58,25,4,3,cr,.9);hl(c,62,24.5,1.5,1.3,'#4A3A3A',1);hl(c,53,19,1.3,1.6,'#4A3A3A',1);});
  SP.planeUp=mk(84,46,c=>{setSeed(21);
    shape(c,[{x:5,y:6},{x:16,y:8},{x:22,y:21},{x:9,y:23}],'#F4A9BB');
    shape(c,ellP(15,27.5,9,2.8,rr,8),'#A9C9A0');
    shape(c,[{x:68,y:17},{x:56,y:14.5},{x:40,y:15},{x:24,y:18},{x:10,y:22.5},{x:9,y:26.5},{x:24,y:31},{x:40,y:34.5},{x:56,y:34.5},{x:68,y:32.5},{x:72,y:25}],'#FFE6A8');
    hl(c,44,19,18,2.6,'#FFF7DA',.85);hl(c,44,30.5,24,2.4,'#F4A9BB',.8);
    shape(c,ellP(70,25,6.5,8.5,rr,10),'#E4A585');hl(c,69,22,2.6,3.2,'#F6CDB4',.85);
    shape(c,ellP(44,29,19,4,rr,10),'#A9C9A0');
    shape(c,ellP(54,21.5,6,4.6,rr,9),'#D9EEF6',{a:.95});hl(c,52.5,20,1.8,1.3,'#FFFFFF',.95);
    curve(c,[{x:52,y:32},{x:55,y:38}],INK,1.4,.75);curve(c,[{x:14,y:28},{x:15,y:33}],INK,1.1,.65);
    shape(c,ellP(55,40,4.4,4.4,rr,9),'#8A6E5D');hl(c,55,40,1.5,1.5,'#E9D9C6',.9);
    shape(c,ellP(15,35,2.6,2.6,rr,8),'#8A6E5D');hl(c,78,25,2,2,'#6E574B',.9);
  });
  SP.plane=mk(90,46,c=>{setSeed(12);
    shape(c,[{x:4,y:14},{x:16,y:22},{x:14,y:30},{x:2,y:24}],'#F4A9BB');
    shape(c,ellP(46,28,32,9,rr,12,.03),'#FFF3E4');hl(c,46,29,26,3,'#F4A9BB',.6);
    shape(c,rectP(26,8,34,6,3,rr,.6),'#A9C9A0');shape(c,rectP(24,34,38,5,2.5,rr,.6),'#A9D3E6');
    curve(c,[{x:38,y:14},{x:38,y:34}],INK,1,.6);curve(c,[{x:52,y:14},{x:52,y:34}],INK,1,.6);
    curve(c,[{x:80,y:19},{x:84,y:37}],INK,1.6,.7);hl(c,76,28,3,3,'#D9EEF6',.9);});
  SP.cloud=[['#FFFFFF','#FFF4F6'],['#F9D5DD','#FCE6EA'],['#D9CCF0','#EDE6FA']].map((t,ti)=>[0,1].map(v=>mk(130,64,c=>{
    setSeed(70+ti*5+v);const bumps=v?[[30,42,24,16],[58,32,30,22],[88,40,26,17],[110,46,18,12],[64,48,52,13]]:[[26,44,22,14],[50,34,26,20],[80,30,28,22],[106,42,22,15],[66,48,56,13]];
    bumps.forEach(b=>shape(c,ellP(b[0],b[1],b[2],b[3],rr,10,.05),t[0],{a:.9,pen:false,edge:false}));
    bumps.forEach((b,i)=>{if(i<4)hl(c,b[0]-3,b[1]-b[3]*.35,b[2]*.6,b[3]*.4,t[1],.9);});
    curve(c,[{x:16,y:54},{x:40,y:58},{x:80,y:58},{x:112,y:53}],INK,1,.22);})));
  SP.moon=mk(64,64,c=>{setSeed(13);
    shape(c,ellP(32,32,24,24,rr,14,.02),'#FFF1C9',{pen:false,edge:false,a:.95});
    c.save();c.globalCompositeOperation='destination-out';c.beginPath();c.arc(42,26,21,0,6.283);c.fill();c.restore();});
  SP.planetA=mk(100,70,c=>{setSeed(14);
    shape(c,ellP(50,35,26,26,rr,12,.03),'#F8C9A8');hl(c,42,28,10,8,'#FFE5CF',.6);hl(c,58,44,12,7,'#E9A88A',.55);
    c.save();c.translate(50,35);c.rotate(-.35);c.strokeStyle='#C6B8E8';c.lineWidth=4;c.globalAlpha=.85;c.beginPath();c.ellipse(0,0,44,10,0,0,6.283);c.stroke();
    c.strokeStyle=INK;c.lineWidth=.8;c.globalAlpha=.45;c.beginPath();c.ellipse(0,0,46,12,0,0,6.283);c.stroke();c.restore();});
  SP.planetB=mk(56,56,c=>{setSeed(15);
    shape(c,ellP(28,28,20,20,rr,12,.03),'#B8DBEC');
    curve(c,[{x:12,y:22},{x:28,y:18},{x:44,y:23}],'#8FBFD8',3,.8);curve(c,[{x:10,y:34},{x:28,y:38},{x:46,y:33}],'#F4B8C4',3,.8);
    hl(c,21,20,5,3.5,'#F2FAFD',.7);});
  SP.ast=mk(250,262,c=>{setSeed(612);
    const cx=125,cy=178,r=82;
    shape(c,ellP(cx,cy,r,r,rr,16,.02),'#EBB294');
    c.save();c.beginPath();c.arc(cx,cy,r-1,0,6.283);c.clip();
    shape(c,ellP(cx,cy-r-8,r*1.05,40,rr,14,.05),'#B7D2AB',{pen:false});
    hl(c,cx-30,cy+22,16,8,'#D98F6F',.5);hl(c,cx+34,cy+40,12,6,'#D98F6F',.5);hl(c,cx-8,cy+56,9,5,'#D98F6F',.45);
    hl(c,cx-40,cy-20,14,26,'#FFE1C9',.28);
    c.restore();
    shape(c,[{x:68,y:110},{x:80,y:88},{x:96,y:88},{x:108,y:108}],'#C9775B');
    hl(c,88,88,8,2.6,'#8E4A3A',.75);hl(c,90,70,7,5,'#F6C9D3',.85);hl(c,97,60,5,4,'#F9DDE3',.8);
    shape(c,[{x:150,y:110},{x:160,y:95},{x:172,y:95},{x:182,y:108}],'#C9775B');
    hl(c,166,95,6,2,'#8E4A3A',.75);hl(c,168,84,5,4,'#F6C9D3',.85);
    c.save();c.globalAlpha=.32;c.fillStyle='#CFEAF6';c.beginPath();c.ellipse(125,72,19,24,0,0,6.283);c.fill();
    c.globalAlpha=.8;c.strokeStyle=INK;c.lineWidth=1;c.stroke();c.restore();
    curve(c,[{x:119,y:56},{x:114,y:64}],'#FFFFFF',2,.75);
    curve(c,[{x:125,y:94},{x:124,y:80},{x:125,y:70}],'#7FA383',2,.95);
    shape(c,ellP(119,84,5,2.6,rr,7),'#A9C9A0');
    shape(c,ellP(125,64,7,7,rr,9),'#F29BB1');curve(c,[{x:122,y:63},{x:126,y:61},{x:128,y:65}],'#B85670',1,.8);
    [[30,30],[210,50],[220,150],[22,140],[200,15]].forEach((p,i)=>c.drawImage(SP.spark[i%3],p[0],p[1],18,18));
  });
}
const DPH=[0,140,300];
const crestAt=(x,ph)=>26+9*Math.sin((x+ph)*.021)+6*Math.sin((x+ph)*.055+1);

/* ================= PAPEL DE ACUARELA ================= */
function buildPaper(){
  const cv=document.createElement('canvas');cv.width=cv.height=220;const c=cv.getContext('2d');
  const r=R(99);
  for(let i=0;i<1500;i++){const x=r()*220,y=r()*220,s=.3+r()*1.1;
    c.fillStyle=r()<.55?`rgba(150,105,75,${.03+r()*.06})`:`rgba(255,255,255,${.1+r()*.16})`;
    c.beginPath();c.arc(x,y,s,0,6.283);c.fill();}
  c.lineCap='round';
  for(let i=0;i<70;i++){const x=r()*220,y=r()*220,l=6+r()*14,a=r()*6.283;
    c.strokeStyle=`rgba(150,110,80,${.03+r()*.05})`;c.lineWidth=.6;c.beginPath();c.moveTo(x,y);
    c.quadraticCurveTo(x+Math.cos(a)*l*.5+2,y+Math.sin(a)*l*.5-2,x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke();}
  $('paper').style.setProperty('--paper',`url(${cv.toDataURL('image/png')})`);
}

/* ================= BIOMAS ================= */
const BIO=BIOMES_DEF.map(b=>({...b,r:[b.top,b.mid,b.bot].map(toRGB)}));
function biomeState(h){
  const f=h/BL,i=Math.floor(f);
  if(i>=3) return {i:3,n:3,s:0};
  const t=f-i;
  return {i,n:i+1,s:t>.78?sm((t-.78)/.22):0};
}
const biomeAt=h=>{const s=biomeState(h);return s.s>.5?s.n:s.i;};

const rn=R(2024);
function mkItems(n,ymax,extra){const a=[];for(let i=0;i<n;i++)a.push({x:rn()*W,y:(i+rn()*.8)/n*ymax,v:Math.floor(rn()*2),t:Math.floor(rn()*3),s:.7+rn()*.6,ph:rn()*6.283,sp:5+rn()*9,...(extra?extra(i):{})});return a;}
const ST0=mkItems(14,230),CL1=mkItems(6,700),FL1=[{x:60,y:120,n:7,d:1,sp:22},{x:260,y:430,n:5,d:-1,sp:16},{x:150,y:640,n:6,d:1,sp:26}],
  CL2a=mkItems(9,640),CL2b=mkItems(7,640),CL2c=mkItems(5,640),
  ST3a=mkItems(26,640),ST3b=mkItems(16,640),PL3=[{x:40,y:200,k:0},{x:250,y:720,k:1},{x:170,y:1120,k:2}],AST=[{x:20,y:900}];
let ctx,time=0;
function tile(items,tileH,par,h,fn){
  const off=mod(h*par,tileH);
  for(const it of items)for(let k=-1;k<=0;k++){const y=it.y+off+k*tileH;if(y>H+90||y<-140)continue;fn(it,y);}
}
function cloudAt(it,y,tint,sc,speed){
  const x=mod(it.x+time*it.sp*speed,W+260)-130;
  spr(ctx,SP.cloud[tint][it.v],x,y,sc*it.s);
}
function bird(bx,by,f,col){
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle=col;ctx.globalAlpha=ctx.globalAlpha*.9;
  for(let pass=0;pass<2;pass++){
    ctx.lineWidth=pass?1.1:2.6;ctx.strokeStyle=pass?INK:col;
    ctx.beginPath();ctx.moveTo(bx-9,by+f*5-2);ctx.quadraticCurveTo(bx-4,by-4-f*2,bx,by);ctx.quadraticCurveTo(bx+4,by-4-f*2,bx+9,by+f*5-2);ctx.stroke();
  }
  ctx.restore();
}
function scenery(bi,a,h){
  if(a<=.01)return;
  ctx.save();ctx.globalAlpha=a;
  if(bi===0){
    for(const it of ST0){const y=it.y*.9+h*.03;if(y>200)continue;ctx.globalAlpha=a*(1-y/200)*.6*(.6+.4*Math.sin(time*2+it.ph));spr(ctx,SP.spark[it.t],it.x,y,it.s*.6);}
    ctx.globalAlpha=a;
    spr(ctx,SP.sun,W*.6-120,300+h*.12-120,1);
    tile(CL1.slice(0,4),700,.16,h,(it,y)=>{ctx.globalAlpha=a*.55;cloudAt(it,y*.75,1,.9,.6);});
    ctx.globalAlpha=a;
    const yy=[445+h*.3,505+h*.55,560+h],fill=['#F0BE9F','#E6A483','#D48F6E'];
    for(let i=0;i<3;i++){const y=yy[i];if(y>H)continue;spr(ctx,SP.dune[i],-20,y);
      const yb=y+199;if(yb<H){ctx.fillStyle=fill[i];ctx.fillRect(0,yb,W,H-yb);}
      if(i===1&&y<H+40){ctx.save();ctx.translate(250,y+crestAt(270,DPH[1])-22);ctx.rotate(-.2);spr(ctx,SP.plane,-45,-23);ctx.restore();}
      if(i===2&&y<H+40){spr(ctx,SP.fox,30,y+crestAt(50,DPH[2])-40);}
    }
  } else if(bi===1){
    ctx.globalAlpha=a*.55;spr(ctx,SP.sun,W*.8-84,110+h*.04-84,.7);ctx.globalAlpha=a;
    tile(CL1,700,.22,h,(it,y)=>{ctx.globalAlpha=a*.92;cloudAt(it,y,0,1,.5);});
    ctx.globalAlpha=a;
    for(const f of FL1){
      const off=mod(h*.34,900);
      for(let k=-1;k<=0;k++){
        const fy=f.y+off+k*900;if(fy>H+60||fy<-80)continue;
        const fx=mod(f.x+f.d*time*f.sp,W+300)-150;
        for(let b=0;b<f.n;b++){const row=Math.ceil(b/2),side=b%2?1:-1;
          bird(fx-f.d*row*14,fy+(b?side*row*8:0),Math.sin(time*7+b*.7),b%3?'#B79FD6':'#E5A48A');}
      }
    }
  } else if(bi===2){
    ctx.globalAlpha=a*.7;spr(ctx,SP.sun,W*.28-110,250+h*.06-110,.9);ctx.globalAlpha=a;
    tile(CL2a,640,.12,h,(it,y)=>{ctx.globalAlpha=a*.6;cloudAt(it,y,2,.8,.3);});
    tile(CL2b,640,.3,h,(it,y)=>{ctx.globalAlpha=a*.85;cloudAt(it,y,1,1.15,.5);});
    tile(CL2c,640,.6,h,(it,y)=>{ctx.globalAlpha=a*.95;cloudAt(it,y,0,1.7,.7);});
  } else {
    tile(ST3a,640,.06,h,(it,y)=>{ctx.globalAlpha=a*(.55+.45*Math.sin(time*2+it.ph));spr(ctx,SP.spark[it.t],it.x,y,it.s*.75);});
    tile(ST3b,640,.16,h,(it,y)=>{ctx.globalAlpha=a*(.6+.4*Math.sin(time*2.6+it.ph));spr(ctx,SP.spark[it.t],it.x,y,it.s*1.1);});
    ctx.globalAlpha=a;
    tile(PL3,1400,.18,h,(it,y)=>{
      if(it.k===0)spr(ctx,SP.planetA,it.x,y,1);else if(it.k===1)spr(ctx,SP.planetB,it.x,y,1);else spr(ctx,SP.moon,it.x,y,1.2);
    });
    tile(AST,2300,.22,h,(it,y)=>{ctx.globalAlpha=a;spr(ctx,SP.ast,it.x+Math.sin(time*.4)*3,y,1.05);});
    const t=mod(time,7);
    if(t<.9){const u=t/.9,x=W*(.95-u*.75),y=50+u*170;
      const g=ctx.createLinearGradient(x,y,x+60,y-30);g.addColorStop(0,'rgba(255,240,190,.95)');g.addColorStop(1,'rgba(255,240,190,0)');
      ctx.globalAlpha=a*(1-u*.6);ctx.strokeStyle=g;ctx.lineWidth=2.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+60,y-30);ctx.stroke();}
  }
  ctx.restore();
}
function drawBG(h){
  const st=biomeState(h),A=BIO[st.i].r,B=BIO[st.n].r,s=st.s;
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,rgb(mix(A[0],B[0],s)));g.addColorStop(.55,rgb(mix(A[1],B[1],s)));g.addColorStop(1,rgb(mix(A[2],B[2],s)));
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  scenery(st.i,1-s,h);
  if(s>0)scenery(st.n,s,h);
}

/* ================= JUEGO ================= */
let state='menu',camY=0,maxH=0,topY=0,plats=[],items=[],parts=[],runStars=0,curB=-1,frameN=0,input=0;
const P={x:W/2,y:580,vx:0,vy:0,face:1,sq:0,fly:0};
const MENU_Y=430;
let nextPlaneStart=300,nextPlaneStep=500;
const mkPlat=(x,y,w,type)=>({x,y,w,type,dir:Math.random()<.5?-1:1,sp:.8,broken:false,bt:0,fy:0,spring:false,pop:0});

function genRow(){
  const h=580-topY,d=Math.min(1,h/(BL*3));
  const gap=rand(62+d*28,108+d*57);
  topY-=gap;
  const altitude=580-topY;
  const previousMeters=h/20,currentMeters=altitude/20;
  const planeDue=previousMeters<nextPlaneStart+50&&currentMeters>=nextPlaneStart;
  const w=Math.round(74-d*18),x=rand(8,W-w-8);
  let type=0;
  if(h>2200&&Math.random()<.12+d*.18)type=1;
  const p=mkPlat(x,topY,w,type);p.sp=.7+d*1.5+Math.random()*.4;
  if(type===0&&h>800&&Math.random()<.07)p.spring=true;
  if(planeDue){
    p.type=0;p.spring=false;p.plane=true;
    nextPlaneStart+=Math.min(nextPlaneStep,1000);
    nextPlaneStep=Math.min(nextPlaneStep+200,1000);
  }
  plats.push(p);
  if(h>3500&&Math.random()<.2+d*.2)plats.push(mkPlat(rand(8,W-w-8),topY+gap*rand(.35,.65),w,2));
  const r=Math.random();
  const hasStar=r<.5,hasHeart=Math.random()<.055,side=Math.random()<.5?-1:1;
  const pairGap=rand(32,42);
  const starX=x+w/2+(hasStar&&hasHeart?side*pairGap/2:rand(-w*.3,w*.3));
  const heartX=x+w/2-(hasStar&&hasHeart?side*pairGap/2:0);
  if(hasStar)items.push({k:0,x:starX,y:topY-44,ph:r<.05?Math.random()*6:0});
  if(hasHeart)items.push({k:1,x:heartX,y:topY-44,ph:0});
}
function reset(){
  camY=0;maxH=0;plats=[];items=[];parts=[];runStars=0;curB=-1;
  nextPlaneStart=300;nextPlaneStep=500;
  plats.push(mkPlat(W/2-45,580,90,0));topY=580;
  while(topY>camY-300)genRow();
  Object.assign(P,{x:W/2,y:580,vx:0,vy:-JUMP,face:1,sq:0,fly:0});
}
function burst(x,y,cols,n,sp,up){
  for(let i=0;i<n&&parts.length<120;i++)parts.push({x,y,vx:(Math.random()-.5)*sp,vy:-Math.random()*sp*(up||.8),life:0,max:28+Math.random()*22,c:cols[i%cols.length],s:1.8+Math.random()*2.6});
}
function updateParts(){
  for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.life++;}
  parts=parts.filter(p=>p.life<p.max);
}
function land(p){
  P.y=p.y;let v=JUMP;
  if(p.plane){v=PLANE;p.plane=false;P.fly=1;sfx('spring');burst(P.x,P.y,['#FFF3E4','#F4B8C4','#F8DA7A','#FFFFFF'],22,7,1.4);}
  else if(p.spring&&Math.abs(P.x-(p.x+p.w/2))<20){v=SPRING;p.pop=1;sfx('spring');burst(P.x,P.y,['#F5A4B8','#F8DA7A','#FFFFFF'],14,5,1.2);}
  else sfx('jump');
  if(p.type===2){p.broken=true;p.bt=0;v*=.85;sfx('crumble');burst(p.x+p.w/2,p.y,['#F0D8C0','#E2B99B'],10,3,.6);}
  P.vy=-v;P.sq=1;
  burst(P.x,P.y,['#F8DDBE','#F4B8C4'],4,2.2,.5);
}
function bump(el){el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');}
function collect(it){
  it.gone=true;
  const v=it.k?5:1;save.coins+=v;runStars+=v;dirty=true;
  $('hStars').textContent=runStars;bump($('chipS'));
  sfx(it.k?'heart':'star');
  burst(it.x,it.y,it.k?['#F29BB1','#FFD6E0','#FFFFFF']:['#F8DA7A','#FFF3C4','#FFFFFF'],it.k?14:8,4.5,1);
}
function step(){
  time+=1/60;
  P.sq*=.84;
  if(state==='menu'){
    P.vy+=G;P.y+=P.vy;
    if(P.y>=MENU_Y&&P.vy>0){P.y=MENU_Y;P.vy=-JUMP;P.sq=1;}
    const nx=W/2+Math.sin(time*1.1)*36;P.vx=(nx-P.x);P.x=nx;if(Math.abs(P.vx)>.05)P.face=P.vx>0?1:-1;
    updateParts();return;
  }
  if(state!=='play'){updateParts();return;}
  if(input!==0){P.vx+=(input*MAXVX-P.vx)*.2;P.face=input;}else P.vx*=.9;
  P.x+=P.vx;
  if(P.x<-12)P.x=W+12;else if(P.x>W+12)P.x=-12;
  const prev=P.y;P.vy=Math.min(P.vy+(P.fly?PLANE_G:G),16);P.y+=P.vy;
  if(P.fly&&P.vy>0)P.fly=0;
  for(const p of plats){
    if(p.type===1&&!p.broken){p.x+=p.dir*p.sp;if(p.x<4){p.x=4;p.dir=1;}else if(p.x>W-p.w-4){p.x=W-p.w-4;p.dir=-1;}}
    if(p.broken){p.bt++;p.fy=p.bt*p.bt*.12;}
    if(p.pop>0)p.pop=Math.max(0,p.pop-.06);
  }
  if(P.vy>0){
    for(const p of plats){
      if(p.broken)continue;
      if(P.x+HW>p.x&&P.x-HW<p.x+p.w&&prev<=p.y+1&&P.y>=p.y){land(p);break;}
    }
  }
  const cyp=P.y-22;
  for(const it of items){
    if(it.gone)continue;
    const dx=it.x-P.x,dy=it.y-cyp;
    if(dx*dx+dy*dy<27*27)collect(it);
    else if(Math.abs(dx)>W-30&&Math.abs(dx)<W+20&&dy*dy<700)collect(it);
  }
  const tgt=P.y-H*.42;if(tgt<camY)camY=tgt;
  maxH=Math.max(maxH,580-P.y);
  while(topY>camY-260)genRow();
  if((frameN++%20)===0){
    plats=plats.filter(p=>p.y-camY<H+80&&p.bt<60);
    items=items.filter(i=>!i.gone&&i.y-camY<H+80);
  }
  updateParts();
  const m=Math.floor(maxH/20);
  if(m!==+$('hAlt').textContent)$('hAlt').textContent=m;
  const b=biomeAt(-camY);
  if(b!==curB){curB=b;toast(BIO[b].n);playMusic(b);}
  if(P.y-camY>H+60)gameOver();
}

/* ================= DIBUJO ================= */
function drawPlat(p,bi){
  const y=p.y-camY;if(y>H+40||y<-50)return;
  const k=p.w/72,sp=SP.plat[bi][p.type];
  if(p.broken){
    ctx.save();ctx.globalAlpha=Math.max(0,1-p.bt/45);ctx.translate(p.x+p.w/2,y+p.fy);ctx.rotate(p.bt*.018*(p.dir));
    ctx.drawImage(sp,-p.w/2-5*k,-7,sp.lw*k,sp.lh);ctx.restore();return;
  }
  if(p.spring){const s=1+.45*p.pop;spr_(SP.spring,p.x+p.w/2-13,y-27*s+2,1,s);}
  if(p.plane)drawPlaneAt(p.x+p.w/2-36,y-36,.85);
  ctx.drawImage(sp,p.x-5*k,y-7,sp.lw*k,sp.lh);
}
function drawPlaneAt(x,y,s){
  ctx.drawImage(SP.planeUp,x,y,SP.planeUp.lw*s,SP.planeUp.lh*s);
  const px=x+78*s,py=y+25*s,ry=(4+7*Math.abs(Math.cos(time*38)))*s;
  ctx.save();ctx.globalAlpha=.4;ctx.fillStyle='#8A6E5D';ctx.beginPath();ctx.ellipse(px,py,2*s,ry,0,0,6.283);ctx.fill();ctx.restore();
}
function spr_(cv,x,y,sx,sy){ctx.drawImage(cv,x,y,cv.lw*sx,cv.lh*sy);}
function drawPlayerAt(x,y){
  const o=OUT[save.equipped],sp=SP.chars[save.equipped];
  ctx.save();ctx.translate(x,y-camY);ctx.rotate(clamp(P.vx*.035,-.25,.25));
  const stretch=P.fly?clamp(-P.vy*.002,0,.025):clamp(-P.vy*.008,0,.1);
  const squash=P.fly?.04:.18;
  ctx.scale(P.face*(1+squash*P.sq-stretch),1-squash*P.sq+stretch);
  if(P.fly)drawPlaneAt(-36,-15,.85);
  const ty=-29*PS/.8,len=16+Math.abs(P.vx)*3,fl=clamp(P.vy*1.3,-10,10)+Math.sin(time*12)*2;
  ctx.fillStyle=o.tail;ctx.globalAlpha=.95;ctx.beginPath();ctx.moveTo(-7,ty);
  ctx.quadraticCurveTo(-7-len*.6,ty+fl*.3-4,-7-len,ty+fl);ctx.quadraticCurveTo(-7-len*.5,ty+fl*.3+4,-3,ty+6);ctx.closePath();ctx.fill();
  ctx.globalAlpha=.5;ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.stroke();ctx.globalAlpha=1;
  ctx.drawImage(sp,-32*PS,-76*PS,64*PS,80*PS);
  ctx.restore();
}
function drawPlayer(){
  for(const dx of [0,-W,W]){const x=P.x+dx;if(x<-40||x>W+40)continue;drawPlayerAt(x,P.y);}
}
function drawItems(){
  for(const it of items){
    if(it.gone)continue;const y=it.y-camY;if(y<-30||y>H+30)continue;
    const yy=y+Math.sin(time*3+it.ph)*3,s=1+.07*Math.sin(time*5+it.ph),sp=it.k?SP.heart:SP.star;
    ctx.drawImage(sp,it.x-16*s,yy-17*s,32*s,34*s);
  }
}
function drawParts(){
  for(const p of parts){
    const a=1-p.life/p.max;ctx.globalAlpha=a*.85;ctx.fillStyle=p.c;
    ctx.beginPath();ctx.arc(p.x,p.y-camY,p.s*(.6+a*.5),0,6.283);ctx.fill();
  }
  ctx.globalAlpha=1;
}
function render(){
  ctx.setTransform(S,0,0,S,0,0);ctx.globalAlpha=1;
  const h=Math.max(0,-camY);
  drawBG(h);
  if(state==='menu'){
    const my=MENU_Y;ctx.drawImage(SP.plat[0][0],W/2-45-5*1.25,my-7,72*1.25+10*1.25,32);
    drawParts();drawPlayer();return;
  }
  for(const p of plats)drawPlat(p,biomeAt(580-p.y));
  drawItems();drawParts();
  if(state==='play'||state==='pause')drawPlayer();
}

/* ================= AUDIO (efectos) ================= */
let AC=null;
function audio(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();}
function tone(f,d,type,v,f2){
  if(!save.sound||!AC)return;
  const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(v||.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02);
}
function sfx(k){
  switch(k){
    case'jump':tone(420,.14,'sine',.04,690);break;
    case'spring':tone(300,.3,'triangle',.06,900);break;
    case'star':tone(880,.1,'sine',.04,1320);break;
    case'heart':tone(660,.12,'sine',.05);setTimeout(()=>tone(990,.2,'sine',.05),90);break;
    case'crumble':tone(170,.2,'sawtooth',.02,80);break;
    case'over':tone(330,.6,'triangle',.05,170);break;
    case'buy':tone(523,.15,'sine',.05);setTimeout(()=>tone(659,.15,'sine',.05),120);setTimeout(()=>tone(784,.3,'sine',.05),240);break;
    case'no':tone(200,.15,'square',.02,150);break;
  }
}

/* ================= MÚSICA DE FONDO (opcional) ================= */
// Ver js/data/music.js para agregar pistas. Si no hay ninguna
// configurada, estas funciones no hacen nada y el juego funciona igual.
let musicEl=null,musicBi=-1;
function playMusic(bi){
  const src=MUSIC_TRACKS[bi];
  if(!src){ stopMusic(); musicBi=bi; return; }
  if(bi===musicBi) return;
  musicBi=bi;
  if(musicEl) musicEl.pause();
  musicEl=new Audio(src);
  musicEl.loop=true;
  musicEl.volume=save.sound?.35:0;
  musicEl.play().catch(()=>{}); // si el navegador bloquea el autoplay, no pasa nada
}
function stopMusic(){ if(musicEl){musicEl.pause();musicEl=null;} musicBi=-1; }
function setMusicVolume(){ if(musicEl) musicEl.volume=save.sound?.35:0; }

/* ================= INTERFAZ ================= */
function toast(t){const e=$('toast');e.textContent=t;e.classList.remove('show');void e.offsetWidth;e.classList.add('show');}
function show(id){document.querySelectorAll('.screen:not(.top)').forEach(s=>s.classList.toggle('on',s.id===id));$('hud').classList.toggle('on',id==='');}
function updateMenu(){$('mBest').textContent=save.best;$('mCoins').textContent=save.coins;$('bSnd').style.opacity=save.sound?1:.5;$('bSnd').textContent=save.sound?'♪':'♪̸';}
function toMenu(){
  state='menu';camY=0;plats=[];items=[];parts=[];P.x=W/2;P.y=MENU_Y;P.vy=-JUMP;P.vx=0;P.sq=0;
  stopMusic();
  show('sMenu');updateMenu();
}
function play(){
  audio();reset();state='play';show('');
  $('hAlt').textContent=0;$('hStars').textContent=0;
}
function pauseGame(){if(state!=='play')return;state='pause';show('sPause');$('hud').classList.add('on');}
function resumeGame(){if(state!=='pause')return;state='play';show('');}
function gameOver(){
  state='over';sfx('over');stopMusic();
  const m=Math.floor(maxH/20),rec=m>save.best;
  if(rec)save.best=m;persist();
  $('oAlt').textContent=m;$('oBest').textContent=save.best;$('oStars').textContent=runStars;
  $('oNew').classList.toggle('on',rec);
  const revive=$('bRevive');
  revive.style.display='inline-flex';
  revive.classList.toggle('dim',save.coins<REVIVE_COST);
  setTimeout(()=>{if(state==='over')show('sOver');},350);
}
function revive(){
  if(state!=='over')return;
  if(save.coins<REVIVE_COST){toast('Te faltan '+(REVIVE_COST-save.coins)+' estrellas');sfx('no');return;}
  $('reviveCost').textContent = REVIVE_COST;
  const candidates=plats.filter(p=>!p.broken&&p.y>camY+H*.35&&p.y<camY+H+80);
  const p=candidates.sort((a,b)=>a.y-b.y)[0]||plats.filter(x=>!x.broken).sort((a,b)=>a.y-b.y)[0];
  if(!p){toast('No se pudo encontrar una plataforma');return;}
  save.coins-=REVIVE_COST;persist();
  P.x=clamp(p.x+p.w/2,HW,W-HW);P.y=p.y-32;P.vx=0;P.vy=-JUMP;P.face=1;P.sq=1;
  $('hStars').textContent=runStars;$('bRevive').style.display='none';
  state='play';show('');sfx('buy');playMusic(biomeAt(-camY));
}

/* --- tienda --- */
const starSVG='<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17.4 6.1 20.7l1.3-6.6L2.5 9.5l6.6-.8z" fill="#F7D774" stroke="#B8785C" stroke-width="1.5" stroke-linejoin="round"/></svg>';
function openShop(){renderShop();show('sShop');}
function renderShop(){
  $('shCoins').textContent=save.coins;
  const L=$('shopList');L.innerHTML='';
  for(let i=1;i<OUT.length;i++){
    const o=OUT[i],un=save.unlocked[i];
    const row=document.createElement('div');row.className='card shopRow'+(save.equipped===i?' eq':'');
    row.innerHTML=`<canvas width="128" height="160"></canvas><div class="info"><div class="nm">${o.name}</div><div class="ds">${un?'Carta desbloqueada':'Desbloquea una carta ilustrada'}</div></div><div class="acts"></div>`;
    const cvp=row.querySelector('canvas');cvp.getContext('2d').drawImage(SP.chars[i],0,0,128,160);
    const acts=row.querySelector('.acts');
    const add=(txt,cls,fn)=>{const b=document.createElement('button');b.className='btn '+cls;b.innerHTML=txt;b.addEventListener('click',fn);acts.appendChild(b);};
    if(un){
      add('Ver carta','b-rose',()=>openLetter(i));
      add(save.equipped===i?'Puesto':'Usar','b-sage'+(save.equipped===i?' dim':''),()=>{save.equipped=i;persist();renderShop();});
    } else add('Comprar '+starSVG+o.price,save.coins>=o.price?'b-yel':'b-yel dim',()=>buy(i));
    L.appendChild(row);
  }
}
function buy(i){
  const o=OUT[i];
  if(save.coins<o.price){toast('Te faltan '+(o.price-save.coins)+' estrellas');sfx('no');return;}
  save.coins-=o.price;save.unlocked[i]=true;save.equipped=i;persist();sfx('buy');
  renderShop();openLetter(i);
}
function illus(i,cv){
  const c=cv.getContext('2d');c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,280,150);setSeed(50+i);
  const o=OUT[i],bg=o.bg||[null,['#FBD9C8','#F6B9C8'],['#5B549A','#8A80C4'],['#BFE0EE','#F6D5DD'],['#FFE6BE','#F8C9A6']][i];
  const ground=o.ground||( [null,'#A9C9A0','#7C74B8','#A9C9A0','#EBD08C'][i] );
  shape(c,rectP(4,4,272,142,26,rr,3),bg[0],{a:.92,pen:false});
  shape(c,ellP(200,60,92,62,rr,10,.12),bg[1],{a:.7,pen:false,edge:false});
  shape(c,ellP(80,142,70,9,rr,10,.1),ground,{a:.8,pen:false,edge:false});
  c.drawImage(SP.chars[i],38,26,90,112.5);
  if(o.scene) o.scene(c,SP); else if(i===1){
    for(let k=0;k<14;k++){const a=k/14*6.283;c.save();c.translate(205+Math.cos(a)*40,66+Math.sin(a)*40);c.rotate(a);
      shape(c,ellP(0,0,12,5.5,rr,8),'#F8D66E');c.restore();}
    shape(c,ellP(205,66,31,31,rr,14,.02),'#FADF8A');
    curve(c,[{x:193,y:60},{x:197,y:56},{x:201,y:60}],'#7A4F45',1.8,.9);
    curve(c,[{x:210,y:60},{x:214,y:56},{x:218,y:60}],'#7A4F45',1.8,.9);
    curve(c,[{x:190,y:71},{x:205,y:86},{x:220,y:71}],'#7A4F45',2,.9);
    hl(c,187,72,6,4,'#F49AAA',.6);hl(c,223,72,6,4,'#F49AAA',.6);
    [[150,22],[250,20],[254,118],[144,110]].forEach((p,k)=>c.drawImage(SP.star,p[0],p[1],22,23));
  } else if(i===2){
    shape(c,ellP(205,54,32,32,rr,14,.02),'#FFF1C9',{a:.95});
    curve(c,[{x:192,y:46},{x:198,y:44},{x:203,y:48}],'#5B4338',2,.9);
    curve(c,[{x:208,y:48},{x:213,y:44},{x:219,y:46}],'#5B4338',2,.9);
    hl(c,197,52,3,2,'#5B4338',.85);hl(c,214,52,3,2,'#5B4338',.85);
    curve(c,[{x:190,y:62},{x:205,y:76},{x:222,y:60}],'#5B4338',2,.9);
    curve(c,[{x:200,y:67},{x:200,y:71}],'#FFFFFF',2.4,.95);curve(c,[{x:210,y:69},{x:210,y:72}],'#FFFFFF',2.4,.95);
    for(const [x,y,r] of [[150,86,-.5],[178,110,.5]]){c.save();c.translate(x,y);c.rotate(r);shape(c,ellP(0,0,13,7.5,rr,12,.03),'#E7889A');hl(c,-3,-2,4,2,'#FFD4DC',.8);c.restore();}
    c.drawImage(SP.heart,150,30,26,28);c.drawImage(SP.heart,236,100,22,24);
    [[140,16],[250,20],[120,60]].forEach((p,k)=>c.drawImage(SP.spark[k%3],p[0],p[1],14,14));
  } else if(i===3){
    spr(c,SP.cloud[0][1],140,16,1.15);
    curve(c,[{x:172,y:56},{x:184,y:62}],'#5B4338',2.2,.9);curve(c,[{x:220,y:62},{x:232,y:56}],'#5B4338',2.2,.9);
    hl(c,184,68,3,3.4,'#5B4338',.9);hl(c,220,68,3,3.4,'#5B4338',.9);
    hl(c,172,78,7,4,'#F49AAA',.6);hl(c,232,78,7,4,'#F49AAA',.6);
    curve(c,[{x:192,y:86},{x:202,y:80},{x:212,y:86}],'#5B4338',2,.9);
    c.drawImage(SP.heart,236,20,20,22);c.drawImage(SP.heart,146,104,18,20);c.drawImage(SP.heart,250,96,16,18);
  }
}
function openLetter(i){
  illus(i,$('lCv'));
  const txt=OUT[i].letter;
  const idx=txt.lastIndexOf(' — ');
  const base = idx >= 0 ? txt.slice(0, idx) : txt;
  const author = idx >= 0 ? txt.slice(idx + 3) : '';
  $('lTxt').innerHTML = base + (author ? '<span class="quoteMark"> — </span><span class="quoteAuthor">' + author + '</span>' : '');
  const s=$('sLetter');s.classList.remove('on');void s.offsetWidth;s.classList.add('on');sfx('buy');
}

/* ================= ENTRADA ================= */
const keys={l:false,r:false},ptr=new Map();
function setInput(){let l=keys.l,r=keys.r;for(const s of ptr.values()){if(s<0)l=true;else r=true;}input=(r?1:0)-(l?1:0);}
function bindInput(){
  const cv=$('c');
  const side=e=>{const r=cv.getBoundingClientRect();return(e.clientX-r.left)<r.width/2?-1:1;};
  cv.addEventListener('pointerdown',e=>{audio();if(state!=='play')return;ptr.set(e.pointerId,side(e));try{cv.setPointerCapture(e.pointerId);}catch(_){}setInput();e.preventDefault();});
  cv.addEventListener('pointermove',e=>{if(ptr.has(e.pointerId)){ptr.set(e.pointerId,side(e));setInput();}});
  const up=e=>{ptr.delete(e.pointerId);setInput();};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('lostpointercapture',up);
  addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keys.l=true;
    else if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keys.r=true;
    else if((e.key==='Escape'||e.key==='p')&&state==='play')pauseGame();
    else if((e.key==='Escape'||e.key==='p')&&state==='pause')resumeGame();
    setInput();
  });
  addEventListener('keyup',e=>{
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')keys.l=false;
    else if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')keys.r=false;
    setInput();
  });
  addEventListener('blur',()=>{ptr.clear();keys.l=keys.r=false;setInput();});
  document.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('gesturestart',e=>e.preventDefault());
  document.addEventListener('pointerdown',audio,{once:false});
}
function bindUI(){
  $('bPlay').onclick=play;
  $('bShop').onclick=openShop;
  $('bSnd').onclick=()=>{save.sound=!save.sound;persist();updateMenu();audio();sfx('star');setMusicVolume();};
  $('bShopBack').onclick=()=>{toMenu();};
  $('bSimple').onclick=()=>{save.equipped=0;persist();renderShop();};
  $('bLetterClose').onclick=()=>{$('sLetter').classList.remove('on');renderShop();};
  $('bRevive').onclick=revive;
  $('bAgain').onclick=play;
  $('bOverShop').onclick=openShop;
  $('bOverMenu').onclick=toMenu;
  $('btnPause').onclick=pauseGame;
  $('bResume').onclick=resumeGame;
  $('bQuit').onclick=()=>{ptr.clear();setInput();toMenu();};
}

/* ================= TAMAÑO Y BUCLE ================= */
let rsT=0;
function resize(){
  const vw=innerWidth,vh=innerHeight,w=Math.min(vw,vh*9/16),h=w*16/9,g=$('game');
  g.style.width=w+'px';g.style.height=h+'px';g.style.setProperty('--u',(w/360)+'px');
  const dpr=Math.min(window.devicePixelRatio||1,2.5);
  S=Math.max(1,Math.min(3,w*dpr/W));
  const cv=$('c');cv.width=Math.round(W*S);cv.height=Math.round(H*S);
  buildSprites();
}
addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(()=>{resize();if($('sShop').classList.contains('on'))renderShop();},150);});

let last=0,acc=0;
function frame(t){
  requestAnimationFrame(frame);
  if(!last)last=t;
  const d=Math.min(50,t-last);last=t;acc+=d;
  while(acc>=16.667){step();acc-=16.667;}
  render();
}

/* ================= INICIO ================= */
load();
ctx=$('c').getContext('2d');
buildPaper();
resize();
bindInput();
bindUI();
toMenu();
requestAnimationFrame(frame);
