// ============================================================
// characters.js — LA TIENDA DE PERSONAJES ("outfits")
// ============================================================
// Cada objeto dentro de OUT es un personaje/traje comprable.
// Para AGREGAR UN PERSONAJE NUEVO: copia la PLANTILLA de más abajo,
// pégala como un elemento más del arreglo OUT, y cambia los valores.
// No necesitas tocar ningún otro archivo del juego.
//
// Campos:
//   name    -> nombre que se ve en la tienda
//   price   -> precio en estrellas (el primer traje, el gratis, no lleva price)
//   tunic, tunic2, scarf, tail, hair, shoe -> colores (código hex)
//   cap, cape -> opcionales, solo si quieres gorro o capa
//   kind    -> 0, 1, 2 o 3: reutiliza uno de los 4 "moldes" de cuerpo
//              genérico ya dibujados (0=normal, 1=con bufanda distinta,
//              2=con capa y estrella en la cabeza, 3=con gorro de aviador)
//   letter  -> frase de "El Principito" que aparece en la carta al comprarlo
//   bg      -> [colorFondo1, colorFondo2] de la carta ilustrada
//   ground  -> color del "piso" de la carta ilustrada
//   draw    -> OPCIONAL. Si quieres un dibujo 100% a medida en vez de
//              reusar un molde, escribe tu propia función. Recibe
//              (c, o, cx, fy): c=contexto de canvas, o=este mismo objeto,
//              cx=centro horizontal (32), fy=línea de los pies (76).
//   scene   -> OPCIONAL. Dibujo extra que aparece en la carta ilustrada.
//              Recibe (c, SP): SP son los sprites ya generados
//              (SP.heart, SP.star, SP.spark[0..2], etc.) que puedes
//              pegar con c.drawImage(SP.heart, x, y, ancho, alto).
// ============================================================
import { shape, ellP, hl, curve } from '../core/draw.js';
import { rr } from '../core/utils.js';

export const OUT = [
  {name:'Pequeño viajero',tunic:'#F1DEC4',tunic2:'#DDBF98',scarf:'#F6B7A2',tail:'#F6B7A2',hair:'#C79C6E',shoe:'#C98A66',kind:0,letter:'',bg:['#FBD9C8','#F6B9C8'],ground:'#A9C9A0'},
  {name:'El Principito',price:220,tunic:'#A9C9A0',tunic2:'#86AB8B',scarf:'#F8DA7E',tail:'#F8DA7E',hair:'#F7D56C',shoe:'#C98A66',kind:1,letter:'El tiempo que perdiste por tu rosa hace que tu rosa sea tan importante. — El principito',bg:['#FBD9C8','#F6B9C8'],ground:'#A9C9A0'},
  {name:'Príncipe de las estrellas',price:420,tunic:'#B8D3EE',tunic2:'#93B6DA',scarf:'#FFF6EA',tail:'#8B82C6',cape:'#8B82C6',hair:'#F7D56C',shoe:'#8B82C6',kind:2,letter:'Es mucho más difícil juzgarse a sí mismo que juzgar a los demás. Si logras juzgarte bien a ti mismo eres un verdadero sabio. — El principito',bg:['#5B549A','#8A80C4'],ground:'#7C74B8'},
  {name:'El aviador soñador',price:620,tunic:'#D9926F',tunic2:'#BC7350',scarf:'#FFF6EA',tail:'#FFF6EA',cap:'#A9764F',hair:'#F7D56C',shoe:'#8A5B3F',kind:3,letter:'Si vienes, por ejemplo, a las cuatro de la tarde, comenzaré a ser feliz desde las tres. Cuanto más avance la hora, más feliz me sentiré. A las cuatro me sentiré agitado e inquieto; ¡descubriré el precio de la felicidad! Pero si vienes a cualquier hora, nunca sabré a qué hora preparar mi corazón... — El principito',bg:['#BFE0EE','#F6D5DD'],ground:'#A9C9A0'},
  {name:'El zorro',price:820,tunic:'#E9A67A',tunic2:'#FFF1DE',scarf:'#D98E6B',tail:'#D98E6B',hair:'#E9A67A',shoe:'#B8785C',kind:4,letter:'Para mí no eres todavía más que un muchachito semejante a cien mil muchachitos. Y no te necesito. Y tú tampoco me necesitas. No soy para ti más que un zorro semejante a cien mil zorros. Pero, si me domesticas, tendremos necesidad el uno del otro. Serás para mí único en el mundo. Seré para ti único en el mundo. — El principito',bg:['#FFE6BE','#F8C9A6'],ground:'#EBD08C',draw:(c,o,cx,fy)=>{
      const fur=o.tunic,cream=o.tunic2,dark=o.shoe,ear='#F6C4B0';
      shape(c,[{x:cx-9,y:fy-14},{x:cx-18,y:fy-26},{x:cx-27,y:fy-23},{x:cx-30,y:fy-12},{x:cx-24,y:fy-4},{x:cx-13,y:fy-5}],fur);shape(c,ellP(cx-25.5,fy-10,4.6,6.2,rr,8),cream,{pen:false});curve(c,[{x:cx-23,y:fy-19},{x:cx-18,y:fy-13},{x:cx-21,y:fy-7}],'#6E574B',.9,.35);
      shape(c,ellP(cx-8,fy-3.5,6.5,4.2,rr,8),dark);shape(c,ellP(cx+8,fy-3.5,6.5,4.2,rr,8),dark);shape(c,ellP(cx,fy-21,13,17.5,rr,12,.04),fur);shape(c,ellP(cx,fy-19,7.5,12,rr,10,.04),cream,{pen:false,a:.95});
      shape(c,ellP(cx-14.5,fy-22,4.4,7.2,rr,8),fur);shape(c,ellP(cx+14.5,fy-22,4.4,7.2,rr,8),fur);hl(c,cx-15,fy-16,3,2.6,dark,.85);hl(c,cx+15,fy-16,3,2.6,dark,.85);shape(c,ellP(cx,fy-36,12.5,4.8,rr,10),o.scarf);
      shape(c,[{x:cx-15,y:fy-56},{x:cx-17,y:fy-66},{x:cx-12,y:fy-75},{x:cx-6,y:fy-66},{x:cx-5,y:fy-57}],fur);shape(c,[{x:cx+15,y:fy-56},{x:cx+17,y:fy-66},{x:cx+12,y:fy-75},{x:cx+6,y:fy-66},{x:cx+5,y:fy-57}],fur);
      shape(c,[{x:cx-13,y:fy-58},{x:cx-14,y:fy-65},{x:cx-11.5,y:fy-70},{x:cx-8,y:fy-65},{x:cx-8,y:fy-59}],ear,{pen:false,edge:false,a:.9});shape(c,[{x:cx+13,y:fy-58},{x:cx+14,y:fy-65},{x:cx+11.5,y:fy-70},{x:cx+8,y:fy-65},{x:cx+8,y:fy-59}],ear,{pen:false,edge:false,a:.9});hl(c,cx-12,fy-71,2,2.6,dark,.5);hl(c,cx+12,fy-71,2,2.6,dark,.5);
      shape(c,ellP(cx,fy-49,16,15,rr,14,.03),fur);hl(c,cx,fy-58,3.2,4.5,cream,.7);shape(c,ellP(cx-8,fy-42,8,5.5,rr,9),cream,{pen:false,edge:false,a:.95});shape(c,ellP(cx+8,fy-42,8,5.5,rr,9),cream,{pen:false,edge:false,a:.95});shape(c,ellP(cx,fy-40.5,6.5,5,rr,9),cream,{pen:false,edge:false,a:.95});
      const ey=fy-50;shape(c,ellP(cx-6,ey,2.2,3,rr,7,.02),'#4A3A3A',{pen:false,edge:false,a:1});shape(c,ellP(cx+6,ey,2.2,3,rr,7,.02),'#4A3A3A',{pen:false,edge:false,a:1});hl(c,cx-5.4,ey-1.1,.9,.9,'#fff',1);hl(c,cx+6.6,ey-1.1,.9,.9,'#fff',1);shape(c,ellP(cx,fy-44.5,2.3,1.7,rr,7,.02),'#4A3A3A',{pen:false,edge:false,a:1});curve(c,[{x:cx,y:fy-43},{x:cx,y:fy-41.6}],'#8A4E48',1,.85);curve(c,[{x:cx-3.2,y:fy-41.3},{x:cx,y:fy-39.6},{x:cx+3.2,y:fy-41.3}],'#8A4E48',1.1,.85);hl(c,cx-11.5,fy-45,3.2,2.2,'#F49AAA',.6);hl(c,cx+11.5,fy-45,3.2,2.2,'#F49AAA',.6);curve(c,[{x:cx-13,y:fy-42.5},{x:cx-19,y:fy-43.5}],'#6E574B',.7,.4);curve(c,[{x:cx+13,y:fy-42.5},{x:cx+19,y:fy-43.5}],'#6E574B',.7,.4);
    },scene:(c,SP)=>{const wheat=(x,base,top,lean)=>{curve(c,[{x:x,y:base},{x:x+lean*.4,y:(base+top)/2},{x:x+lean,y:top}],'#C9A65A',1.4,.9);hl(c,x+lean,top-3,2.6,5,'#F2CF70',.95);hl(c,x+lean-2.4,top+1,2.2,4,'#EBC45E',.9);hl(c,x+lean+2.4,top+1,2.2,4,'#EBC45E',.9);curve(c,[{x:x+lean,y:top-8},{x:x+lean,y:top-11}],'#C9A65A',.9,.8);};for(let k=0;k<20;k++){const x=142+k*6.4+rr()*3,top=88+rr()*24;wheat(x,148,top,(rr()-.5)*8);}for(let k=0;k<6;k++){const x=22+k*7+rr()*3,top=122+rr()*8;wheat(x,148,top,(rr()-.5)*6);}c.drawImage(SP.heart,146,26,24,26);c.drawImage(SP.heart,244,22,18,20);[[130,12],[196,20],[258,64]].forEach((p,k)=>c.drawImage(SP.spark[k%3],p[0],p[1],15,15));c.drawImage(SP.star,120,54,20,21);}}
];

/* ================================================================
   PLANTILLA — copia este bloque, pégalo dentro del arreglo OUT (con
   una coma antes), y cambia los valores. Usa "kind" para reusar un
   cuerpo genérico (más fácil) y no pongas "draw" ni "scene".
   ================================================================
{
  name:'Nombre del personaje',
  price:700,
  tunic:'#F1DEC4', tunic2:'#DDBF98', scarf:'#F6B7A2', tail:'#F6B7A2',
  hair:'#C79C6E', shoe:'#C98A66',
  kind:1,
  letter:'Una frase de El Principito para la carta que se ve al comprarlo.',
  bg:['#FBD9C8','#F6B9C8'], ground:'#A9C9A0'
}
================================================================ */
