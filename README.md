# Club de los números

Una guía interactiva para 2.º básico, hecha con HTML, CSS y JavaScript y publicada en GitHub Pages. Abrir `index.html` directamente o ejecutar `node scripts/serve.cjs`.

## Historia y Geografía

La sección `#historia` contiene siete misiones sobre puntos cardinales, continentes y océanos, elementos del paisaje, zonas naturales de Chile, pueblos originarios, comprensión lectora y análisis de imágenes. Incluye explicaciones, brújula, planisferio con botones para explorar, una lectura, una escena visual, cinco preguntas por misión, pistas, audio del navegador, estrellas y un ensayo de 14 preguntas. Los progresos de Historia se guardan por separado de Matemáticas en el navegador.

Para 2.º básico los paisajes se agrupan en norte, centro y sur, siguiendo el [Currículum Nacional](https://www.curriculumnacional.cl/curriculum/1o-6o-basico/historia-geografia-ciencias-sociales/2-basico/hi02-oa-08). Se presentan seis continentes considerando América como uno, y cinco océanos; existen otros modelos y el material del colegio puede variar. Se recomienda estudiar también los materiales de la clase. Los pueblos originarios son comunidades actuales y diversas; referencias: [Museo Chileno de Arte Precolombino](https://museo.precolombino.cl/aprende/pueblos-culturas/pueblos-originarios/) y [Subdirección Nacional de Pueblos Originarios](https://www.pueblosoriginarios.gob.cl/lenguas-indigenas-en-chile).

El planisferio usa geometrías simplificadas de [Natural Earth](https://www.naturalearthdata.com/), de dominio público. Es un mapa esquemático sin fronteras.

## Matemáticas

Las doce misiones cubren el temario de números, operaciones, secuencias, gráficos, problemas, medición, geometría y pesos chilenos. La sección `#control-restas` practica sustracciones sin canje hasta 999, con 15 preguntas progresivas, guía interactiva por columnas y un ensayo de diez preguntas. Como máximo una resta de cada ronda tiene resultado cero.

Los datos quedan en `localStorage` del navegador y no se envían a un servidor. Borrarlos elimina el progreso. La voz utiliza Web Speech API y depende de las voces disponibles en el dispositivo. Las fuentes de Google requieren conexión; existen fuentes alternativas locales.

## Comprobaciones

Ejecutar `node tests/check.cjs`, `node tests/control.cjs` y `node tests/historia.cjs`. No hay dependencias ni paso de compilación. Para GitHub Pages, publicar la rama `main` desde `/ (root)`.
