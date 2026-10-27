# Comiquería Central

Proyecto final de JavaScript. Una tienda de manga y cómics donde podés explorar el catálogo, armar un carrito y confirmar una compra simulada, sin registro ni pagos reales.

## Funcionalidades

- Buscar títulos y filtrar por categoría.
- Agregar y eliminar productos del catálogo.
- Modificar cantidades, quitar productos o vaciar el carrito.
- Aplicar descuentos: 5 % por dos unidades y 10 % por tres o más.
- Confirmar una compra y consultar su comprobante en el historial.

El catálogo, el carrito y las compras se guardan en `localStorage`. El botón **Reiniciar simulación** borra esos datos y restaura el catálogo original.

## Cómo ejecutarlo

Abrí la carpeta en VS Code, hacé clic derecho sobre `index.html` y elegí **Open with Live Server**.

También podés iniciar un servidor con Python:

```bash
python -m http.server 5500
```

Después, entrá a [http://localhost:5500](http://localhost:5500).

El servidor permite cargar el archivo JSON mediante Fetch. No hace falta instalar paquetes ni compilar.

## Estructura

```text
index.html
assets/portadas/
css/styles.css
js/catalogo.js
js/main.js
js/vendor/sweetalert2.all.min.js
data/catalogo.json
docs/
```

## Desarrollo

El proyecto utiliza DOM y eventos, funciones de orden superior, operadores avanzados y `localStorage`. Los datos iniciales se cargan desde JSON con Fetch y `async/await`, con manejo de errores y opción de reintento.

Los avisos y las confirmaciones usan **SweetAlert2**, incluida en el proyecto bajo licencia MIT.

Los resultados de las pruebas están en [VERIFICACION.md](VERIFICACION.md).

Las portadas se utilizan con fines académicos. Los precios y el stock son datos de ejemplo.
