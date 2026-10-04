# El principito — estructura del proyecto

El juego ya no es un solo archivo enorme. Ahora está dividido así:

```
index.html              <- solo la estructura de la página (pantallas, botones)
css/
  style.css             <- todos los estilos visuales
js/
  data/                 <- ⭐ LO QUE VAS A EDITAR SEGUIDO ⭐
    characters.js        - los personajes/trajes de la tienda
    biomes.js             - los 4 escenarios del cielo (nombres y colores)
    music.js              - música de fondo (opcional)
  core/                  <- piezas de dibujo reutilizables (raro que las toques)
    utils.js              - funciones matemáticas/de color
    draw.js                - "pinceles" de acuarela
  main.js                <- el motor del juego (física, tienda, audio, controles)
assets/
  music/                 <- aquí van tus archivos de música, si agregas alguna
```

La idea: **los archivos dentro de `js/data/` son "contenido"** (números, textos,
colores). Los puedes editar con confianza sin miedo a romper el juego. El resto
(`js/core/` y `js/main.js`) es "motor": rara vez hace falta tocarlo.

Como ahora es un proyecto de varios archivos (no un solo .html), para probarlo
en tu navegador necesitas abrirlo con un mini servidor local en vez de hacer
doble clic al `index.html` (los navegadores bloquean que un archivo cargue
otros archivos JS con `type="module"` si lo abres directo desde el disco).
La forma más simple, si tienes Python instalado:

```
cd principito
python3 -m http.server 8000
```

y luego abres `http://localhost:8000` en el navegador. Si usas VSCode, la
extensión "Live Server" hace lo mismo con un botón.

---

## Cómo agregar un personaje nuevo a la tienda

1. Abre `js/data/characters.js`.
2. Al final del archivo hay un bloque comentado que dice **PLANTILLA**. Cópialo.
3. Pégalo dentro del arreglo `OUT` (agrega una coma `,` antes, después del
   último personaje que ya existe).
4. Cambia `name`, `price`, los colores y la frase (`letter`).
5. Guarda. Listo — el personaje ya aparece en la tienda, con su carta
   ilustrada y todo, sin tocar ningún otro archivo.

El campo `kind` (0, 1, 2 o 3) reutiliza uno de los 4 "moldes" de cuerpo que
ya están dibujados, así que no necesitas dibujar nada a mano. Si algún día
quieres un personaje con una forma totalmente distinta (como el zorro), se
puede, pero requiere escribir una función `draw` propia — mira cómo está
hecho el zorro en ese mismo archivo como ejemplo, o pídeme ayuda para armar
uno nuevo así.

## Cómo modificar un escenario existente

1. Abre `js/data/biomes.js`.
2. Cambia el texto en `n` (el nombre que aparece al pasar de escenario) o los
   colores `top`/`mid`/`bot` (código hex, de arriba a abajo de la pantalla).

Eso es seguro y no rompe nada. Agregar un escenario **totalmente nuevo** (con
dibujos propios de fondo, como nubes o planetas distintos) es más avanzado:
esa parte del dibujo vive en la función `scenery()` dentro de `js/main.js`,
porque ahí es donde el motor sabe "qué dibujar" para cada número de bioma.
Si llegas a ese punto, lo mejor es pedir ayuda puntual para esa función en
vez de improvisar, ya que ahí sí hay más lógica entrelazada.

## Cómo agregar música de fondo

1. Consigue un archivo `.mp3` (con licencia libre o tuyo) para cada escenario
   que quieras musicalizar.
2. Ponlos dentro de `assets/music/`.
3. Abre `js/data/music.js` y descomenta/completa la línea del bioma
   correspondiente (0=desierto, 1=aves, 2=nubes, 3=cosmos) con la ruta del
   archivo.
4. Guarda y recarga. La música cambiará sola al pasar de escenario y
   respetará el botón de sonido (♪) del menú.

Si no configuras nada ahí, el juego sigue funcionando exactamente igual, solo
sin música de fondo (los efectos de sonido de saltos/monedas siguen sonando,
esos ya venían hechos por código, no por archivos).

## Cómo agregar un tipo de plataforma o un power-up nuevo

Estas son piezas del "motor" (afectan la física y el dibujo), así que viven
en `js/main.js`. No es imposible, pero conviene pedir ayuda dirigida para esa
parte en vez de improvisar, porque hay varias funciones que se tienen que
tocar en conjunto (`platSprite`, `land`, `drawPlat`, `genRow`).

## Resumen rápido: ¿dónde toco para...?

| Quiero...                                   | Archivo                     |
|----------------------------------------------|------------------------------|
| Agregar/editar un personaje de la tienda      | `js/data/characters.js`     |
| Cambiar nombre/colores de un escenario        | `js/data/biomes.js`         |
| Agregar música de fondo                       | `js/data/music.js`          |
| Cambiar colores de botones/tarjetas (CSS)     | `css/style.css`              |
| Cambiar textos de pantallas (botones, etc.)   | `index.html`                 |
| Física del salto, velocidad, dificultad       | `js/main.js` (sección CONSTANTES) |
| Todo lo demás del comportamiento del juego    | `js/main.js`                 |
