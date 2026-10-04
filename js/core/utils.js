// ============================================================
// utils.js — funciones matemáticas y de color de uso general.
// No dependen de ningún otro archivo: son la base de todo lo demás.
// No deberías necesitar tocar este archivo casi nunca.
// ============================================================

export function R(seed){
  let a=seed>>>0;
  return()=>{
    a|=0;a=a+0x6D2B79F5|0;
    let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return((t^t>>>14)>>>0)/4294967296;
  };
}

// rr: generador "aleatorio" reproducible que usan los pinceles de
// acuarela para la textura de los dibujos. setSeed() lo reinicia
// justo antes de dibujar cada sprite, para que ese sprite siempre
// salga con la misma textura.
export let rr = R(1);
export function setSeed(n){ rr = R(n); }

export const rand=(a,b)=>a+Math.random()*(b-a);
export const mod=(a,n)=>((a%n)+n)%n;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const sm=t=>t*t*(3-2*t);

export function toRGB(s){
  if(s[0]==='#'){ s=s.slice(1); return [parseInt(s.slice(0,2),16),parseInt(s.slice(2,4),16),parseInt(s.slice(4,6),16)]; }
  return s.match(/[\d.]+/g).slice(0,3).map(Number);
}
export const rgb=a=>`rgb(${a[0]|0},${a[1]|0},${a[2]|0})`;
export const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
export const shade=(s,amt)=>rgb(toRGB(s).map(v=>clamp(v+amt,0,255)));
export const lighten=(s,t)=>rgb(mix(toRGB(s),[255,249,242],t));
export const mid=(p,q)=>({x:(p.x+q.x)/2,y:(p.y+q.y)/2});
