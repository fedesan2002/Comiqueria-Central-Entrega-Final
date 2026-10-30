# Comiquería Central — Entrega final de JavaScript

**Comiquería Central** es un simulador académico de compra de manga y cómics. Permite consultar el catálogo, buscar y filtrar títulos, crear y eliminar productos, gestionar el carrito, calcular descuentos, confirmar una compra simulada y conservar un historial de comprobantes.

## 1. Cómo ejecutar el proyecto

El proyecto es HTML, CSS y JavaScript puro. **Necesita un servidor HTTP local** porque utiliza `fetch("./data/catalogo.json")`. No ejecutar `index.html` directamente con doble clic (`file://`), ya que la lectura del JSON puede ser bloqueada por el navegador.

**Opción A — Visual Studio Code (recomendada):**

1. Descargar el ZIP de GitHub mediante **Code → Download ZIP** o clonar el repositorio.
2. Abrir la **carpeta completa** del proyecto en Visual Studio Code.
3. Instalar la extensión **Live Server**, si no está instalada.
4. Hacer clic derecho en `index.html` y seleccionar **Open with Live Server**.
5. Comprobar que aparezcan las tarjetas del catálogo y sus portadas.

**Opción B — Servidor local con Python:** abrir una terminal en la raíz del proyecto y ejecutar:

```bash
python -m http.server 5500
```

En Windows, si el comando `python` no funciona, usar `py -m http.server 5500`. Abrir **http://localhost:5500/** en el navegador. No es necesario instalar paquetes, crear una cuenta ni compilar código.

## 2. Estructura de archivos

```text
Comiqueria-Central-Entrega-Final/
├── index.html                         # Página principal y única página HTML
├── README.md                          # Instrucciones y documentación general
├── assets/
│   └── portadas/                      # Imágenes locales de manga y cómics
├── css/
│   └── styles.css                    # Estilos del sitio
├── data/
│   └── catalogo.json                 # Datos iniciales (arrays de objetos)
├── js/
│   ├── catalogo.js                   # Modelo de productos, filtros y carga del JSON
│   ├── main.js                       # DOM, carrito, compras y persistencia
│   └── vendor/
│       └── sweetalert2.all.min.js    # Librería externa SweetAlert2
└── docs/
    └── EVIDENCIAS.md                 # Rúbrica, ubicación de código y pruebas
```

La aplicación carga **3 archivos `.js` en total**: 2 propios (`catalogo.js` y `main.js`) y 1 de la biblioteca SweetAlert2. Los enlaces del HTML y la carga del JSON utilizan rutas relativas.

## 3. Flujo completo del simulador

1. **Catálogo:** la aplicación obtiene los productos de `data/catalogo.json` con `fetch` y los representa en la página usando DOM.
2. **Búsqueda y filtros:** se puede buscar por texto y seleccionar la categoría Manga/Cómic.
3. **Carrito:** se agregan títulos, se modifican cantidades, se eliminan artículos o se vacía el carrito. El stock disponible se actualiza.
4. **Cálculo:** se muestran subtotal, descuento y total. Con **2 unidades** corresponde **5 %** de descuento; con **3 o más**, **10 %**.
5. **Confirmación:** SweetAlert2 solicita confirmación o permite cancelar. Al confirmar se genera un comprobante de compra **simulada**.
6. **Historial:** los comprobantes se consultan en **Mis compras** y se conservan tras recargar.
7. **Reinicio:** **Reiniciar simulación** borra el estado guardado de esta aplicación y restaura el catálogo inicial.

Se pueden agregar o eliminar títulos desde la interfaz. La búsqueda opcional de portadas en servicios externos no es necesaria para cargar el catálogo local.

## 4. Herramientas y criterios de JavaScript

| Criterio | Implementación |
| --- | --- |
| DOM y eventos | Renderizado de catálogo, carrito e historial; formularios, botones, buscador y filtro |
| Arrays de objetos en JSON | `data/catalogo.json` contiene los productos y las portadas iniciales; `js/catalogo.js` los lee con `fetch` |
| Funciones de orden superior | `map`, `filter`, `reduce`, `find`, `some` y `forEach` |
| Storage | `localStorage` permite guardar, actualizar, eliminar elementos y reiniciar la simulación |
| Operadores avanzados | Operadores ternarios y OR (`||`), además de destructuring |
| Asincronismo | `fetch`, `async/await`, `try/catch/finally`, errores de carga y botón para reintentar |
| Librería externa | **SweetAlert2** para avisos, eliminación, vaciado, confirmación y resultado de compra (sin `alert`, `prompt` ni `confirm` nativos en el código propio) |
| Lógica de negocio completa | Catálogo → búsqueda/filtro → carrito → cantidades → descuento/total → confirmación → historial |

Los arrays de productos definidos en JavaScript empiezan vacíos y se completan leyendo el JSON. El carrito y el historial se generan mediante la interacción del usuario y se almacenan en su navegador; no son catálogos hardcodeados. Los datos de stock y precios son de ejemplo.

## 5. Evidencias verificables para la corrección

**[Consultar docs/EVIDENCIAS.md](docs/EVIDENCIAS.md)**. Allí se detallan las funciones exactas que satisfacen cada punto de la rúbrica, los pasos para reproducirlos y los resultados esperados.

**Prueba rápida para el evaluador:** iniciar con Live Server → agregar 2 unidades → comprobar 5 % → agregar una tercera → comprobar 10 % → confirmar en SweetAlert2 → consultar **Mis compras** → recargar → verificar persistencia → usar **Reiniciar simulación**.


