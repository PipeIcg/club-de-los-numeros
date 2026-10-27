# Club de los números

Guía interactiva de Matemática para 2.º básico, en español de Chile. Proyecto independiente en HTML, CSS y JavaScript, sin framework ni dependencias de instalación.

## Abrir

Abre `index.html` directamente en un navegador moderno. También puedes usar Live Server en VS Code o ejecutar `node scripts/serve.cjs` y abrir `http://127.0.0.1:4173`. La tipografía de Google Fonts necesita conexión; si no está disponible, se usan fuentes del dispositivo. Los ejercicios y gráficos no dependen de servicios externos.

## Publicar en GitHub Pages

1. Sube los archivos de este directorio a un repositorio de GitHub.
2. En el repositorio, ve a **Settings → Pages**.
3. Selecciona **Deploy from a branch**, tu rama y la carpeta **/ (root)**.
4. Guarda y abre la dirección que te entregue GitHub Pages.

No hay paso de compilación. Todas las rutas de archivos son relativas, compatibles con repositorios publicados en un subdirectorio.

## Contenido

- Valor posicional: centenas, decenas y unidades.
- Lectura y escritura de números de 0 a 999.
- Orden y comparación de números.
- Conteo y representación con bloques base diez.
- Adición y sustracción sin reserva.
- Secuencias ascendentes y descendentes.
- Composición y descomposición aditiva.
- Pictogramas y gráficos de barras.
- Problemas matemáticos contextualizados.
- Medición en centímetros, capacidad en litros y horas en punto.
- Figuras planas y cuerpos geométricos.
- Sistema monetario chileno y vuelto sencillo.

Cada misión tiene una explicación, ejemplos visuales y cinco preguntas de alternativa generadas al jugar. Las misiones sorpresa combinan cinco temas. Las respuestas incorrectas permiten volver a intentar; hay pistas y lectura en voz alta cuando el dispositivo lo permite.

## Progreso y estrellas

Se guarda la mejor puntuación de cada tema en `localStorage` del navegador. Tres estrellas requieren 4–5 respuestas al primer intento; dos, 2–3; una, 0–1. Las pistas no restan estrellas. Las misiones sorpresa desbloquean una insignia; no suman estrellas a los temas. No hay registro, servidor, analítica ni envío de datos personales. Borrar los datos del sitio elimina el progreso. Otro dispositivo o navegador tendrá su propio avance.

Si el almacenamiento está bloqueado, se puede jugar durante la sesión, pero el progreso no persistirá. La lectura usa las voces del navegador y puede requerir conexión según el sistema. El botón de sonidos controla los efectos de las respuestas; la voz se activa con «Escuchar».

## Estructura

- `index.html`: estructura y diálogo para acompañantes.
- `styles.css`: diseño adaptable y accesibilidad visual.
- `app.js`: lecciones, generación de ejercicios, navegación, sonidos y progreso.
- `favicon.svg`: icono del sitio.
- `tests/check.cjs`: comprobaciones de los generadores con Node.js, sin instalar paquetes.

Para verificar la lógica: `node tests/check.cjs`.

La ilustración y los recursos geométricos son SVG propios. La guía se basa en el temario de referencia; está pensada para complementar el aprendizaje con acompañamiento adulto.
