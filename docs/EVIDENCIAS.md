# Evidencias de la Entrega Final — Comiquería Central

**Repositorio:** https://github.com/fedesan2002/Comiqueria-Central-Entrega-Final

Esta guía permite al docente verificar cada requisito y repetir el flujo de la aplicación. **Los resultados siguientes son resultados esperados según el código; no son capturas ni una certificación de ejecución en navegador.** Para la entrega final, realizar las pruebas manuales y, si se necesita prueba visual, guardar capturas reales.

## 1. Matriz de rúbrica y ubicación del código

| Requisito oficial | Evidencia técnica | Prueba reproducible |
| --- | --- | --- |
| HTML raíz, scripts y estilos enlazados | [`index.html`](../index.html) (scripts al final y CSS en `<head>`) | Abrir HTML; confirmar los archivos en DevTools → Network |
| Dos a tres `.js` en total | [`index.html`, líneas 319–321](../index.html#L319-L321): `js/catalogo.js`, `js/main.js`, `js/vendor/sweetalert2.all.min.js` | Contar tres referencias de scripts; solo dos son propios |
| Carpeta de imágenes | [`assets/portadas/`](../assets/portadas/) y rutas incluidas en [`data/catalogo.json`](../data/catalogo.json) | Comprobar las portadas al abrir la página |
| JSON local y arrays de datos por Fetch | [`data/catalogo.json`](../data/catalogo.json) y [`cargarDatosCatalogo`, líneas 341–364](../js/catalogo.js#L341-L364) | DevTools → Network: observar petición `catalogo.json` con estado 200 |
| DOM e interacción sin diálogos nativos | [`renderizarCatalogo`](../js/main.js#L144-L226), [`registrarEventos`](../js/main.js#L825-L892) | Buscar, filtrar, sumar o quitar del carrito y confirmar |
| Funciones de orden superior | [`main.js`](../js/main.js): `map` (155), `filter` (260), `reduce` (274), `forEach` (445); [`catalogo.js`](../js/catalogo.js) contiene `find` | Buscar un título, filtrar y calcular total |
| Storage: guardar/modificar/borrar/vaciar | [`guardarEstadoEnStorage`](../js/main.js#L79-L82), [`aplicarCambio`](../js/main.js#L966-L990), [`reiniciarDatos`](../js/main.js#L1060-L1084) | Agregar un producto, recargar, quitarlo y usar «Reiniciar simulación» |
| Ternario, OR, destructuring | [`main.js`](../js/main.js) líneas 38–41, 155–160 y 282–283; [`catalogo.js`](../js/catalogo.js) línea 347 | Revisar usos de `? :`, `||` y `const { ... }` |
| `fetch`, `async/await` y errores | [`solicitarConTiempoLimite` y `cargarDatosCatalogo`](../js/catalogo.js#L331-L364), [`cargarAplicacion`](../js/main.js#L1095-L1131) | Bloquear JSON para forzar un error; observar mensaje, reintento y recuperación |
| Librería externa | [`js/vendor/sweetalert2.all.min.js`](../js/vendor/sweetalert2.all.min.js), [`finalizarCompra`](../js/main.js#L479-L535) | Comprobar que aparece SweetAlert2 al confirmar una compra |
| Circuito de compra completo | [`agregarAlCarrito`](../js/main.js#L369-L381), [`renderizarCarrito`](../js/main.js#L282-L366), [`finalizarCompra`](../js/main.js#L479-L535), [`renderizarHistorial`](../js/main.js#L1015-L1035) | Catálogo → sumar → modificar → subtotal/total → confirmar → historial |
| Código legible y estructura | [`js/catalogo.js`](../js/catalogo.js), [`js/main.js`](../js/main.js) | Revisar funciones de nombres semánticos; comprobar ausencia de `console.log` innecesarios en código propio |
| Repositorio público | [Página principal del proyecto](https://github.com/fedesan2002/Comiqueria-Central-Entrega-Final) | Abrir el repositorio desde una ventana privada sin autenticación |

## 2. Pasos de prueba en navegador

**Preparación:** ejecutar mediante Live Server en VS Code o `python -m http.server 5500` desde la raíz; abrir `http://localhost:5500/`. Si hay datos anteriores de pruebas, usar primero **Reiniciar simulación**.

| N.º | Acción | Resultado esperado | ¿Verificado manualmente? |
| --- | --- | --- | --- |
| 1 | Abrir la página con el servidor local | Se muestran productos y portadas cargados del JSON | ☐ |
| 2 | Buscar «Kagurabachi» y filtrar por Manga | Se muestran únicamente productos coincidentes | ☐ |
| 3 | Agregar 2 unidades al carrito | Subtotal visible y descuento del **5 %** | ☐ |
| 4 | Sumar una tercera unidad | Descuento pasa al **10 %** | ☐ |
| 5 | Quitar una unidad y actualizar la página | Cantidad y total persisten mediante `localStorage` | ☐ |
| 6 | Vaciar carrito y confirmar SweetAlert2 | Carrito vacío y stock restituido | ☐ |
| 7 | Agregar un producto y pulsar «Revisar y confirmar»; cancelar | El pedido aún no se confirma, se conserva el carrito | ☐ |
| 8 | Repetir y confirmar la compra | Se genera comprobante y el carrito queda vacío | ☐ |
| 9 | Abrir «Mis compras» y recargar | El historial conserva el comprobante | ☐ |
| 10 | Usar «Agregá un nuevo título» | Producto aparece en el catálogo sin recarga | ☐ |
| 11 | Usar «Reiniciar simulación» y confirmar | Se borra estado local y vuelve el catálogo original | ☐ |
| 12 | Bloquear `*catalogo.json*` en DevTools → Network request blocking y recargar | Aparece mensaje de error y botón «Reintentar carga» | ☐ |
| 13 | Desbloquear la petición y pulsar «Reintentar carga» | Se recupera el catálogo | ☐ |

La búsqueda opcional de portadas nuevas puede consultar servicios externos (Google Books/Open Library). Si esos servicios fallan, la lógica contempla alternativas, pero conviene probarla en el entorno de evaluación.

## 3. Capturas reales recomendadas

Si el corrector solicita evidencias visuales, tomar capturas después de verificar: **catálogo y solicitud `catalogo.json` (HTTP 200); carrito con 2 unidades (5 %); carrito con 3 unidades (10 %); diálogo de confirmación; comprobante en historial después de recargar; panel de `localStorage`; error del JSON y reintento.** Se pueden guardar como PNG en `docs/capturas/` y enlazar en esta sección. No adjuntar capturas inventadas ni marcar pruebas como realizadas sin ejecutarlas.

## 4. Observaciones para el evaluador

- Los arrays de objetos **iniciales** viven en `data/catalogo.json`; el código JavaScript declara contenedores vacíos, y los llena con datos cargados por Fetch.
- El carrito y el historial se generan por eventos de usuario y se conservan en `localStorage`; no son catálogos de objetos escritos de forma fija en los scripts.
- La aplicación **no tiene login, backend ni pagos reales** porque la consigna solicita un simulador.
- SweetAlert2 está incluida como archivo de librería vendorizada para no depender de un CDN externo; se cuenta como el **tercer archivo JS**.
- La guía de pruebas permite verificar la implementación; no reemplaza la ejecución del proyecto.
