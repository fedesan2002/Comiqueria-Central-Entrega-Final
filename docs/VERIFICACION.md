# Verificación de la entrega final

Comprobaciones realizadas el 27/10/2026 en Chromium, mediante un servidor HTTP local y con la aplicación publicada dentro de una subcarpeta.

## Resultados

- JSON, tres scripts y todas las portadas cargan desde una ruta con subcarpeta.
- Búsqueda, categoría y estado sin resultados.
- Descuentos del 5 % y 10 %, cantidades y stock reservado.
- Carrito, total y stock persisten al recargar.
- Cancelar la confirmación conserva la compra.
- Compra confirmada, comprobante y persistencia sin descontar stock dos veces.
- Alta sin recarga, portada local, agotamiento, resta y eliminación del carrito.
- Eliminar producto y comprobante sin reponer una compra confirmada.
- Vaciar carrito devuelve el stock.
- Reinicio borra storage y restaura el catálogo inicial.
- Error HTTP del JSON, controles bloqueados, finally y reintento.
- JSON mal formado se informa y permite reintentar.
- Storage dañado y rollback al fallar un guardado.
- Celular sin desborde horizontal y carrito con Tab/Escape.
- Sin excepciones JavaScript ni diálogos nativos.
- Las APIs opcionales de portadas pueden fallar y el alta se completa con una portada alternativa.
- Si falla el guardado de la compra, se conserva el carrito y no se genera otro comprobante.
- La compra se puede reintentar después de recuperar el almacenamiento.

Además, se comprobaron la sintaxis de ambos scripts propios, las rutas del HTML y del JSON, los identificadores únicos del DOM, la existencia de las portadas y la estructura solicitada (un solo archivo en la raíz y tres archivos JavaScript en total).

La revisión incluyó una pantalla de 1440 × 1000 y un ancho de celular de 390 px. No se detectaron excepciones JavaScript ni diálogos nativos. Los errores HTTP y de almacenamiento de la lista se provocaron de forma intencional para verificar su recuperación.

Los scripts usados para estas pruebas no se incluyen en la aplicación entregada, para respetar el máximo de tres archivos JavaScript. Para volver a comprobar el proyecto, seguir la guía manual de [README.md](README.md).
