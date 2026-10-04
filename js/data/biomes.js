// ============================================================
// biomes.js — LOS ESCENARIOS ("biomas") que el jugador atraviesa
// según la altura, en este mismo orden: 0, 1, 2, 3.
// ============================================================
// Aquí puedes cambiar fácilmente:
//   n   -> el nombre que aparece como aviso ("Aves que cruzan el cielo")
//   top, mid, bot -> los 3 colores del degradado de fondo (arriba,
//                    medio y abajo de la pantalla), en hex.
//
// NOTA: agregar un escenario totalmente nuevo con dibujos propios
// (nubes distintas, nuevos animales, etc.) requiere además tocar la
// función scenery() en js/main.js, porque ahí está el dibujo de cada
// bioma. Ver el README del proyecto para instrucciones.
// ============================================================
export const BIOMES_DEF = [
  {n:'El desierto al atardecer',top:'#C9B7E6',mid:'#F6BDC8',bot:'#FFD8A2'},
  {n:'Aves que cruzan el cielo',top:'#A6D3EA',mid:'#CDE8F1',bot:'#FFF0DA'},
  {n:'El mar de nubes',top:'#D6BCEA',mid:'#F7C5D5',bot:'#FFE1C6'},
  {n:'Cosmos y el asteroide B612',top:'#25224E',mid:'#3D3977',bot:'#6C60A8'}
];
