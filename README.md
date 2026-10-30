# Comiquería Central — Entrega final de JavaScript

Simulador académico de una tienda de manga y cómics. Permite consultar y filtrar el catálogo, agregar artículos al carrito, modificar cantidades, aplicar descuentos, confirmar compras simuladas y revisar el historial. No solicita registro ni realiza cobros reales.

## Ejecución

**No abrir `index.html` con doble clic (`file://`).** La carga de `data/catalogo.json` se realiza mediante `fetch` y requiere un servidor HTTP.

1. Descargar o clonar el repositorio y abrir su carpeta en Visual Studio Code.
2. Instalar la extensión **Live Server** si no está instalada.
3. Hacer clic derecho sobre `index.html` y elegir **Open with Live Server**.
4. Esperar que se cargue el catálogo y verificar que aparecen los productos.

Alternativamente, ejecutar desde la raíz del repositorio:

```bash
python -m http.server 5500
```

En Windows también puede usarse `py -m http.server 5500`. Abrir http://localhost:5500/. No hacen falta compilación, paquetes ni cuentas.

## Estructura

```text
index.html
README.md
assets/portadas/                 # Imágenes de productos
css/styles.css                 # Hoja de estilos
js/catalogo.js                 # Productos, filtros y carga asíncrona
js/main.js                     # Interfaz, carrito y compras
js/vendor/sweetalert2.all.min.js # Librería externa
data/catalogo.json              # Datos iniciales

docs/VERIFICACION.md            # Registro de pruebas anterior
docs/LICENSE-SweetAlert2.txt    # Licencia de la librería
```

El HTML vincula **tres archivos `.js` en total**: dos de código propio y un archivo de biblioteca externa.

## Funcionalidades y requisitos cubiertos

- **DOM y eventos:** búsqueda instantánea, selección de categoría, altas y bajas de productos, actualización del carrito e historial en pantalla.
- **Datos de origen:** `data/catalogo.json` contiene los objetos de catálogo y portadas; `js/catalogo.js` los carga con `fetch`, `async/await` y validación. Las estructuras de productos de JavaScript se inicializan vacías y se llenan con el JSON o la interacción.
- **Funciones de orden superior:** `map`, `filter`, `reduce`, `find`, `some` y `forEach`.
- **Sintaxis avanzada:** operador ternario, OR (`||`) y destructuring.
- **Persistencia:** `localStorage` conserva catálogo, carrito e historial. Se pueden agregar, modificar, eliminar productos y reiniciar la simulación para borrar el estado guardado.
- **Asincronismo:** `try/catch/finally`, estados de carga, mensajes de error y botón de reintento si falla la petición del JSON.
- **Librería externa:** SweetAlert2 reemplaza los diálogos nativos con avisos y confirmaciones.
- **Compra completa:** catálogo → carrito → cantidades → subtotal y descuento → confirmación → comprobante e historial.

Promoción: **2 unidades, 5 % de descuento; 3 o más, 10 %**. El stock se actualiza durante el uso del carrito. Los precios y stock son simulados. La búsqueda opcional de portadas usa servicios externos que pueden no estar disponibles.

## Verificación para el evaluador

Las comprobaciones técnicas documentadas del proyecto se describen en [docs/VERIFICACION.md](docs/VERIFICACION.md). Para evaluar el proyecto, se recomienda ejecutar la siguiente prueba manual en el navegador.

**Prueba rápida:** ejecutar con Live Server → añadir dos unidades → comprobar 5 % → añadir una tercera → comprobar 10 % → confirmar compra → ver historial → recargar → verificar persistencia → reiniciar simulación.
