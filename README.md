# Portafolio de Omar Gutiérrez

Portafolio web de **Omar Gutiérrez Escoto** (Ciudad de México), Data Scientist junior. Reúne cuatro "misiones" (proyectos de datos) con resumen, recorrido paso a paso, pipeline, simuladores interactivos y galería.

**Sitio en vivo:** https://zidnz.github.io/portafolio-omar-gutierrez/

## Características

- Cuatro misiones: detección de fraude, MILPÍN, Observatorio y QChaucoin.
- Simuladores que corren en el navegador (umbral de fraude, parcela de 60 días, mapa de nodos, cadena de bloques y precio).
- Estilo **Arcade** (videojuegos, estadística y matemáticas) en modo **claro u oscuro**, con un botón en el encabezado. El modo se guarda en el navegador (oscuro por defecto).
- Títulos con degradado de color y fondo con rejilla de gráfica en ambos modos.
- Se adapta a celulares y a pantallas grandes (a partir de 1400 px el contenido se amplía para no dejar márgenes vacíos).
- Detalles de juego (ventanas, misiones, inventario y cinta animada), ilustraciones vectoriales y tipografía suave.
- Descarga del CV en español (`CV_Omar_Gutierrez_Escoto.pdf`) y en inglés (`Resume_Omar_Gutierrez_Escoto.pdf`) desde la portada, la tarjeta de contacto y el pie de página.
- Inventario de herramientas, con las de mi experiencia real en Veolia marcadas (Tableau, Salesforce CRM, CRM Analytics y Looker Studio).
- Sin dependencias ni paso de compilación: HTML, CSS y JavaScript puros.
- Respeta `prefers-reduced-motion` y es responsive.

## Estructura

```
.
├── index.html          # Estructura de la página
├── css/
│   └── styles.css      # Estilos y tokens de color
├── js/
│   └── main.js         # Contenido, simuladores e interacción
├── assets/
│   ├── img/            # Capturas y figuras (.webp)
│   └── cv/             # CV en PDF (español e inglés)
├── .nojekyll           # Evita el procesamiento de Jekyll en GitHub Pages
└── README.md
```

## Ejecutar en local

No requiere instalación. Para evitar restricciones del navegador con `file://`, sirve la carpeta con cualquier servidor estático, por ejemplo:

```bash
npx serve .
```

y abre la dirección que indique.

## Despliegue

Se publica con GitHub Pages desde la rama `main`, carpeta raíz.

## Contacto

- GitHub: [github.com/Zidnz](https://github.com/Zidnz)
- LinkedIn: [Omar Gutiérrez](https://www.linkedin.com/in/omar-guti%C3%A9rrez-88507527a/)
