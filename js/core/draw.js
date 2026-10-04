// ============================================================
// draw.js — "pinceles" de acuarela: funciones que dibujan formas
// con el estilo irregular, pintado a mano, del juego.
// Personajes, plataformas, nubes, etc. usan estas funciones como
// base. Normalmente no necesitas tocar este archivo: se usa
// desde data/characters.js y desde main.js.
// ============================================================
import { rr, mid, shade } from './utils.js';

export const INK = '#6E574B';

export function smooth(c,pts){
  const n=pts.length; c.beginPath();
  const m=mid(pts[n-1],pts[0]); c.moveTo(m.x,m.y);
  for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n],mm=mid(p,q);c.quadraticCurveTo(p.x,p.y,mm.x,mm.y);}
  c.closePath();
}
export function ellP(cx,cy,rx,ry,r,n,j){
  n=n||12;j=j==null?.06:j;const a=[],o=r()*6.283;
  for(let i=0;i<n;i++){const t=o+i/n*6.283,k=1+(r()-.5)*2*j;a.push({x:cx+Math.cos(t)*rx*k,y:cy+Math.sin(t)*ry*k});}
  return a;
}
export function rectP(x,y,w,h,rad,r,j){
  const J=()=>(r()-.5)*2*(j||0);
  return[{x:x+rad+J(),y:y+J()},{x:x+w-rad+J(),y:y+J()},{x:x+w+J(),y:y+rad+J()},{x:x+w+J(),y:y+h-rad+J()},
         {x:x+w-rad+J(),y:y+h+J()},{x:x+rad+J(),y:y+h+J()},{x:x+J(),y:y+h-rad+J()},{x:x+J(),y:y+rad+J()}];
}
export function starP(cx,cy,R0,r){
  const a=[];for(let i=0;i<10;i++){const rad=i%2?R0*.5:R0,t=-Math.PI/2+i*Math.PI/5;
  a.push({x:cx+Math.cos(t)*rad*(1+(r()-.5)*.06),y:cy+Math.sin(t)*rad*(1+(r()-.5)*.06)});}return a;
}
export function heartP(cx,cy,sc){
  const a=[];for(let i=0;i<20;i++){const t=i/20*6.283;
  a.push({x:cx+sc*16*Math.pow(Math.sin(t),3),y:cy-sc*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))});}return a;
}
export function shape(c,pts,color,o){
  o=o||{}; const a=o.a==null?.9:o.a;
  c.save(); c.fillStyle=color;
  c.globalAlpha=a*.62; smooth(c,pts); c.fill();
  const p2=pts.map(p=>({x:p.x+(rr()-.5)*1.7,y:p.y+(rr()-.5)*1.7}));
  c.globalAlpha=a*.55; smooth(c,p2); c.fill();
  if(o.edge!==false){c.globalAlpha=a*.55;c.lineWidth=1.4;c.strokeStyle=shade(color,-24);smooth(c,pts);c.stroke();}
  if(o.pen!==false){const p3=pts.map(p=>({x:p.x+(rr()-.5)*1.3,y:p.y+(rr()-.5)*1.3}));
    c.globalAlpha=.5;c.lineWidth=.9;c.lineCap='round';c.strokeStyle=INK;smooth(c,p3);c.stroke();}
  c.restore();
}
export function hl(c,cx,cy,rx,ry,col,a){c.save();c.globalAlpha=a;c.fillStyle=col;c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,6.2832);c.fill();c.restore();}
export function curve(c,pts,col,lw,a){
  c.save();c.globalAlpha=a==null?.8:a;c.strokeStyle=col;c.lineWidth=lw;c.lineCap='round';c.lineJoin='round';
  c.beginPath();c.moveTo(pts[0].x,pts[0].y);
  for(let i=1;i<pts.length-1;i++){const m=mid(pts[i],pts[i+1]);c.quadraticCurveTo(pts[i].x,pts[i].y,m.x,m.y);}
  const l=pts[pts.length-1];c.lineTo(l.x,l.y);c.stroke();c.restore();
}
