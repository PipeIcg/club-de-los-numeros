# Club de los números

Una guía interactiva para 2.º básico, hecha con HTML, CSS y JavaScript y publicada en GitHub Pages. Abrir `index.html` directamente o ejecutar `node scripts/serve.cjs`.

## Historia y Geografía

La sección `#historia` contiene siete misiones sobre puntos cardinales, continentes y océanos, elementos del paisaje, zonas naturales de Chile, pueblos originarios, comprensión lectora y análisis de imágenes. Incluye explicaciones, brújula, planisferio con botones para explorar, una lectura, una escena visual, cinco preguntas por misión, pistas, audio del navegador, estrellas y un ensayo de 14 preguntas. Los progresos de Historia se guardan por separado de Matemáticas en el navegador.

La guía sigue los materiales de clase proporcionados: cuatro zonas (norte, central, sur y austral), seis continentes, mapas, y modos de vida históricos de pueblos originarios. Una ronda de práctica selecciona cinco preguntas de cada banco; el ensayo toma dos de cada tema. Las comunidades originarias son actuales y diversas. El mapa es una representación simplificada.

El planisferio usa geometrías simplificadas de [Natural Earth](https://www.naturalearthdata.com/), de dominio público. Es un mapa esquemático sin fronteras.

## Matemáticas

Las doce misiones cubren el temario de números, operaciones, secuencias, gráficos, problemas, medición, geometría y pesos chilenos. La sección `#control-restas` practica sustracciones sin canje hasta 999, con 15 preguntas progresivas, guía interactiva por columnas y un ensayo de diez preguntas. Como máximo una resta de cada ronda tiene resultado cero.

Los datos quedan en `localStorage` del navegador y no se envían a un servidor. Borrarlos elimina el progreso. La voz utiliza Web Speech API y depende de las voces disponibles en el dispositivo. Las fuentes de Google requieren conexión; existen fuentes alternativas locales.

## Comprobaciones

Ejecutar `node tests/check.cjs`, `node tests/control.cjs` y `node tests/historia.cjs`. No hay dependencias ni paso de compilación. Para GitHub Pages, publicar la rama `main` desde `/ (root)`.
