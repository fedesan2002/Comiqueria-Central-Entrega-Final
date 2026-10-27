# Comiquería Central — Entrega final de JavaScript

Simulador de compra de manga y cómics. Permite explorar el catálogo, buscar y filtrar títulos, administrar cantidades, revisar descuentos y confirmar una compra simulada con comprobante e historial. No requiere registro, cuentas ni pagos reales.

## Cómo ejecutarlo

La aplicación necesita un servidor HTTP para cargar el JSON con Fetch. No abrir `index.html` con doble clic (`file://`).

- **VS Code:** abrir la carpeta del proyecto y usar **Open with Live Server** sobre `index.html`.
- **Python 3:** desde la carpeta del proyecto ejecutar `python -m http.server 5500` y abrir `http://localhost:5500`.
- **GitHub Pages:** usar esta carpeta como raíz de publicación. Las rutas son relativas y admiten que la aplicación esté publicada dentro de `/nombre-del-repositorio/`.

No requiere instalar paquetes ni compilar. SweetAlert2 está incluido en el proyecto.

## Estructura

```text
index.html
assets/
  portadas/                       Portadas locales de manga y cómics
css/
  styles.css                     Estilos propios y diseño adaptable
js/
  catalogo.js                    Modelo Producto, peticiones y búsquedas
  main.js                        DOM, eventos, carrito, storage e historial
  vendor/
    sweetalert2.all.min.js         Librería externa SweetAlert2
data/
  catalogo.json                  Productos iniciales y portadas reconocidas
docs/
  README.md                      Este documento
  LICENSE-SweetAlert2.txt         Licencia MIT de la librería
  VERIFICACION.md                Resultados de las pruebas realizadas
```

`index.html` es el único archivo suelto en la raíz. Hay **3 archivos JavaScript en total**: 2 propios y 1 librería externa. Los tres están referenciados al final del HTML. La documentación se organiza en `docs/` para respetar la estructura solicitada.

## Circuito de compra

1. El catálogo se solicita a `data/catalogo.json` con `fetch` y `async/await`.
2. Se renderizan las tarjetas y se habilitan los controles al finalizar la carga.
3. Al agregar un producto se reserva una unidad de stock en el carrito.
4. El carrito permite sumar, restar, quitar un título o vaciarlo. Al quitar unidades se devuelve su stock.
5. El resumen muestra subtotal, descuento y total. Dos unidades tienen un 5 % de descuento; tres o más, un 10 %.
6. **Revisar y confirmar** abre un resumen con SweetAlert2. Cancelar conserva el carrito.
7. **Confirmar compra** guarda un comprobante, vacía el carrito y mantiene descontado el stock vendido.
8. El historial permite consultar y eliminar comprobantes. Eliminar un comprobante no cancela una compra ni repone unidades.

El formulario permite agregar títulos propios y eliminar productos del catálogo. Las portadas conocidas se obtienen de la misma base JSON; para otros títulos se intenta una búsqueda en Google Books y Open Library. Si estos servicios fallan o no responden en el tiempo previsto, el producto se puede guardar sin portada. El circuito de compra funciona con los recursos locales y no depende de esos servicios.

## Relación con la consigna

| Requisito | Implementación |
| --- | --- |
| DOM y eventos | Tarjetas, búsqueda, filtros, formularios, carrito e historial en `main.js`. |
| Arrays de objetos en JSON | Las colecciones de datos iniciales son `productosIniciales` y `portadasReconocidas`, en `data/catalogo.json`. Se leen con Fetch. No hay colecciones de objetos precargadas en los scripts propios. |
| Funciones de orden superior | `map` transforma datos y genera vistas; `filter` busca y elimina; `find` localiza productos; `some` detecta duplicados; `reduce` suma importes; `forEach` devuelve stock y actualiza controles. |
| Storage | `localStorage` guarda catálogo, carrito e historial en una sola clave. Permite agregar, modificar, eliminar y vaciar los datos de la simulación. |
| Operadores avanzados | Ternarios en los botones y resúmenes; OR en búsquedas y valores por defecto; destructuring en productos, peticiones y comprobantes. |
| Asincronismo | Carga inicial con `async/await`, validación de `respuesta.ok`, `try/catch/finally`, límite de espera y botón de reintento. |
| Librería externa | SweetAlert2 para notificaciones, confirmación de compra, eliminación y reinicio. No se utilizan diálogos nativos. |
| Proceso completo | Catálogo → selección → cantidades → total con descuento → revisión → confirmación → comprobante. |
| Código y estructura | Nombres semánticos, 2 scripts propios, CSS y recursos en carpetas, sin código descartado ni trazas de depuración. |

Los arrays de carrito y comprobantes se generan a partir de las acciones de la persona y se guardan en storage; no son datos iniciales hardcodeados. Esos cambios no escriben el archivo JSON, ya que se trata de una aplicación de frontend sin servidor de datos.

## Persistencia y manejo de errores

- La clave propia es `comiqueriaCentral.entregaFinal.v1`.
- El estado se serializa con `JSON.stringify` y se recupera con `JSON.parse`.
- Un solo guardado mantiene sincronizados catálogo, stock, carrito e historial.
- Si falla un guardado, se revierte la operación y se muestra un mensaje.
- Los datos almacenados se validan antes de utilizarlos. Si están dañados, se informa y se ofrece el catálogo inicial.
- **Reiniciar simulación** borra la clave mediante `localStorage.removeItem`, vacía carrito e historial y restaura productos y stock originales. No borra datos de otros proyectos del mismo dominio.
- Si falla la base JSON se muestra un error, se bloquean las acciones que requieren productos y se ofrece **Reintentar carga**. `finally` restablece el estado de carga.

## Prueba manual antes de entregar

Los resultados de las pruebas realizadas están en [VERIFICACION.md](VERIFICACION.md).

1. Abrir mediante Live Server y comprobar que aparezcan las 9 tarjetas y sus portadas.
2. Buscar `Kagurabachi`, filtrar por `Cómic` y probar una búsqueda sin resultados.
3. Agregar dos unidades y comprobar el 5 %; agregar una tercera y comprobar el 10 %.
4. Sumar hasta agotar un producto, restar una unidad y comprobar la disponibilidad.
5. Recargar con productos en el carrito: deben recuperarse carrito, importes y stock.
6. Revisar la compra y cancelarla: los productos deben permanecer en el carrito.
7. Confirmarla: debe aparecer un comprobante en **Mis compras** y el carrito debe quedar vacío. Recargar y verificar su persistencia.
8. Agregar un título por formulario, comprobar su aparición inmediata y luego eliminarlo.
9. Eliminar un comprobante y verificar que no se reponga stock.
10. Reiniciar la simulación y recargar: deben volver los 9 productos originales sin carrito ni historial.
11. Bloquear temporalmente `data/catalogo.json` en las herramientas del navegador, recargar y verificar el mensaje de error. Desbloquear y usar **Reintentar carga**.
12. Verificar en un ancho de celular y recorrer el carrito con Tab y Escape.

## Dependencias y créditos

- **SweetAlert2 11.14.5**, licencia MIT. Copia local de `sweetalert2.all.min.js` distribuida por el paquete oficial: https://cdn.jsdelivr.net/npm/sweetalert2@11.14.5/dist/sweetalert2.all.min.js. Proyecto: https://github.com/sweetalert2/sweetalert2. Licencia en `docs/LICENSE-SweetAlert2.txt`.
- Las portadas conservan los enlaces de referencia a Ivrea, OVNI Press, VIZ Media y Open Library. Se utilizan como recursos visuales en este proyecto académico.
- Los precios y el stock son datos de ejemplo para la simulación, no cotizaciones actuales.
