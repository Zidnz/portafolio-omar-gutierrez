# Portafolio de Omar Gutiérrez

Portafolio web de **Omar Gutiérrez Escoto** (Ciudad de México), Data Scientist junior. Reúne cuatro "misiones" (proyectos de datos) con resumen, recorrido paso a paso, pipeline, simuladores interactivos y galería.

**Sitio en vivo:** https://zidnz.github.io/portafolio-omar-gutierrez/

## Características

- Cuatro misiones: detección de fraude, MILPÍN, Observatorio y QChaucoin.
- Simuladores que corren en el navegador (umbral de fraude, parcela de 60 días, mapa de nodos, cadena de bloques y precio).
- Dos estilos a elegir desde el encabezado: **Pastel** (claro, turquesa y rosa) y **Arcade** (oscuro, con motivos de videojuegos, estadística y matemáticas). Ambos con detalles de juego (ventanas, misiones, inventario y cinta animada), ilustraciones vectoriales y tipografía suave.
- Vista **Modelo 3D** en la portada (superficie de una distribución, puntos de datos y un dado), que se puede girar arrastrando. Usa Three.js, que se carga desde cdnjs solo al activarla.
- Inventario de herramientas, con las de mi experiencia real en Veolia marcadas (Tableau, Salesforce CRM, CRM Analytics y Looker Studio).
- Sin paso de compilación: HTML, CSS y JavaScript puros (Three.js solo para la vista 3D).
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
│   └── img/            # Capturas y figuras (.webp)
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
