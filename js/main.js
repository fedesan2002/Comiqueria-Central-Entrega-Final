const CLAVE_ESTADO = "comiqueriaCentral.entregaFinal.v1";
const historialCompras = [];
let aplicacionLista = false;
let cargaEnCurso = false;
let compraEnCurso = false;
let focoAntesDelCarrito = null;

let carrito = [];
let categoriaSeleccionada = "Todos";
let textoBusqueda = "";

let productosGrid;
let mensajeBusqueda;
let mensajeEstado;
let categoriaFiltro;
let buscarInput;
let buscarBtn;
let formularioProducto;
let mensajeFormulario;
let nombreProducto;
let precioProducto;
let categoriaProducto;
let stockProducto;
let vistaPreviaPortada;
let imagenPortadaDetectada;
let mensajePortada;
let temporizadorPortada;
let solicitudPortadaActual = 0;
let cantidadCarrito;
let carritoContenido;
let totalCarrito;
let carritoPanel;
let carritoOverlay;


const calcularSubtotal = (cantidad, precio) => cantidad * precio;


function calcularDescuento(cantidad, subtotal) {
    const porcentaje = cantidad >= 3 ? 0.10 : cantidad === 2 ? 0.05 : 0;
    return Math.round(subtotal * porcentaje * 100) / 100;
}


function escaparHTML(valor) {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}


function seleccionarElementosDOM() {
    productosGrid = document.getElementById("productosGrid");
    mensajeBusqueda = document.getElementById("mensajeBusqueda");
    mensajeEstado = document.getElementById("mensajeEstado");
    categoriaFiltro = document.getElementById("categoriaFiltro");
    buscarInput = document.getElementById("buscarInput");
    buscarBtn = document.getElementById("buscarBtn");
    formularioProducto = document.querySelector("#formularioProducto");
    mensajeFormulario = document.getElementById("mensajeFormulario");
    nombreProducto = document.getElementById("nombreProducto");
    precioProducto = document.getElementById("precioProducto");
    categoriaProducto = document.getElementById("categoriaProducto");
    stockProducto = document.getElementById("stockProducto");
    vistaPreviaPortada = document.getElementById("vistaPreviaPortada");
    imagenPortadaDetectada = document.getElementById("imagenPortadaDetectada");
    mensajePortada = document.getElementById("mensajePortada");
    cantidadCarrito = document.getElementById("cantidadCarrito");
    carritoContenido = document.getElementById("carritoContenido");
    totalCarrito = document.getElementById("totalCarrito");
    carritoPanel = document.getElementById("carritoPanel");
    carritoOverlay = document.getElementById("carritoOverlay");
}


function guardarEstadoEnStorage() {
    // Un único guardado mantiene sincronizados el stock, el carrito y las compras.
    localStorage.setItem(CLAVE_ESTADO, JSON.stringify(obtenerEstadoActual()));
}


function cargarEstadoDesdeStorage() {
    try {
        const estadoGuardado = localStorage.getItem(CLAVE_ESTADO);
        if (estadoGuardado === null) {
            return false;
        }
        const estado = JSON.parse(estadoGuardado);
        validarEstadoGuardado(estado);
        restaurarEstado(estado);
        return true;
    } catch (error) {
        mostrarMensaje(
            "No pudimos recuperar los datos guardados. Cargamos el catálogo inicial. " +
            "Podés reiniciar la simulación para borrar los datos dañados.",
            "warning"
        );
        return false;
    }
}


// La promoción aparece después de entrar, mientras la interfaz sigue disponible.
function programarAvisoDeDescuento() {
    setTimeout(function () {
        document.getElementById("avisoDescuento").textContent =
            "Comprando 2 unidades tenés un 5 % de descuento; con 3 o más, un 10 %. " +
            "El descuento ya se muestra en el total de tu carrito.";
    }, 3000);
}


function mostrarMensaje(texto, tipo = "ok") {
    mensajeEstado.textContent = texto;
    mensajeEstado.className = "status-message " + tipo;
    const hayDialogo = Swal.isVisible() && !Swal.getPopup().classList.contains("swal2-toast");
    if (hayDialogo) {
        return;
    }
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: tipo === "ok" ? "success" : tipo,
        text: texto,
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true
    });
}


function obtenerProductosVisibles() {
    const productosPorCategoria = filtrarProductosPorCategoria(
        categoriaSeleccionada
    );

    return filtrarProductosPorTexto(textoBusqueda, productosPorCategoria);
}


function renderizarCatalogo(lista = obtenerProductosVisibles()) {
    if (lista.length === 0) {
        productosGrid.innerHTML = `
            <p class="empty-catalog">
                No encontramos títulos con esos filtros.
            </p>
        `;

        return;
    }

    productosGrid.innerHTML = lista.map(function (producto) {
        const sinStock = producto.stock === 0;
        const nombreSeguro = escaparHTML(producto.nombre);
        const categoriaSegura = escaparHTML(producto.categoria);
        const editorial = producto.editorial?.trim() || "Catálogo local";
        const editorialSeguro = escaparHTML(editorial);
        const imagen = obtenerURLSegura(producto.imagen, true);
        const imagenSegura = escaparHTML(imagen);
        const enlaceEditorial = obtenerURLSegura(producto.enlaceEditorial);
        const enlaceEditorialSeguro = escaparHTML(enlaceEditorial);
        const tieneImagen = imagen !== "";
        const contenidoPortada = tieneImagen
            ? `<img
                    src="${imagenSegura}"
                    alt="Portada de ${nombreSeguro}, edición ${editorialSeguro}"
                    loading="lazy"
                    decoding="async"
                >`
            : `<span>${nombreSeguro}</span>`;
        const fichaEditorial = enlaceEditorial
            ? `<a
                    class="editorial-link"
                    href="${enlaceEditorialSeguro}"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Abrir la ficha de ${nombreSeguro} en ${editorialSeguro}"
                >
                    Ver ficha en ${editorialSeguro}
                </a>`
            : "";

        return `
            <article class="product-card" id="producto-${producto.id}">
                <div class="product-cover${tieneImagen ? "" : " cover-fallback"}">
                    ${contenidoPortada}
                </div>

                <div class="product-info">
                    <div class="product-meta">
                        <span class="product-category">${categoriaSegura}</span>
                        <span class="product-editorial">${editorialSeguro}</span>
                    </div>
                    <h3>${nombreSeguro}</h3>
                    <p class="price">${formatearPrecio(producto.precio)}</p>
                    <p class="stock-text">Stock disponible: ${producto.stock}</p>
                    ${fichaEditorial}

                    <div class="product-actions">
                        <button
                            class="add-cart-btn"
                            type="button"
                            data-accion="agregar-carrito"
                            data-id="${producto.id}"
                            ${sinStock ? "disabled" : ""}
                        >
                            ${sinStock ? "Sin stock" : "Agregar al carrito"}
                        </button>

                        <button
                            class="delete-product-btn"
                            type="button"
                            data-accion="eliminar-producto"
                            data-id="${producto.id}"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}


function actualizarResumenCatalogo(lista) {
    const filtrosActivos =
        categoriaSeleccionada !== "Todos" || textoBusqueda !== "";

    if (lista.length === 0) {
        mensajeBusqueda.textContent =
            "No hay títulos que coincidan con la búsqueda.";
        mensajeBusqueda.className = "search-message error";
        return;
    }

    const palabra = lista.length === 1 ? "título" : "títulos";
    const detalleFiltro = filtrosActivos
        ? " que coinciden con los filtros actuales."
        : " disponibles en el catálogo.";

    mensajeBusqueda.textContent =
        "Mostrando " + lista.length + " " + palabra + detalleFiltro;
    mensajeBusqueda.className = "search-message ok";
}


function actualizarVistaCatalogo() {
    const listaVisible = obtenerProductosVisibles();

    renderizarCatalogo(listaVisible);
    actualizarResumenCatalogo(listaVisible);
}


function contarProducto(idProducto) {
    return carrito.filter(function (productoDelCarrito) {
        return productoDelCarrito === idProducto;
    }).length;
}


function obtenerProductosUnicosDelCarrito() {
    return carrito.filter(function (idProducto, indice) {
        return carrito.indexOf(idProducto) === indice;
    });
}


function calcularTotalCarrito() {
    return carrito.reduce(function (total, idProducto) {
        const producto = obtenerProductoPorId(idProducto);

        return producto === null ? total : total + producto.precio;
    }, 0);
}


function renderizarCarrito() {
    const { subtotal, descuento, total } = obtenerResumenCompra();
    cantidadCarrito.textContent = carrito.length;
    document.getElementById("subtotalCarrito").textContent = formatearPrecio(subtotal);
    document.getElementById("descuentoCarrito").textContent = "−" + formatearPrecio(descuento);
    totalCarrito.textContent = formatearPrecio(total);
    document.getElementById("finalizarCompraBtn").disabled = !aplicacionLista || carrito.length === 0;
    document.getElementById("vaciarCarritoBtn").disabled = !aplicacionLista || carrito.length === 0;

    if (carrito.length === 0) {
        carritoContenido.innerHTML = `
            <p class="empty-cart">
                Todavía no agregaste ningún producto.
            </p>
        `;

        return;
    }

    const productosUnicos = obtenerProductosUnicosDelCarrito();

    carritoContenido.innerHTML = productosUnicos.map(function (idProducto) {
        const producto = obtenerProductoPorId(idProducto);

        if (producto === null) {
            return "";
        }

        const cantidad = contarProducto(idProducto);
        const subtotal = calcularSubtotal(cantidad, producto.precio);
        const nombreSeguro = escaparHTML(producto.nombre);

        return `
            <article class="cart-item">
                <div>
                    <h3>${nombreSeguro}</h3>
                    <p class="cart-item-price">
                        ${formatearPrecio(producto.precio)} c/u
                    </p>
                    <p class="cart-item-price">
                        Stock disponible: ${producto.stock}
                    </p>
                </div>

                <strong class="cart-subtotal">
                    ${formatearPrecio(subtotal)}
                </strong>

                <div class="cart-item-controls">
                    <button
                        class="quantity-btn"
                        type="button"
                        data-accion="quitar-unidad"
                        data-id="${producto.id}"
                        aria-label="Quitar una unidad de ${nombreSeguro}"
                    >
                        −
                    </button>

                    <span class="quantity">${cantidad}</span>

                    <button
                        class="quantity-btn"
                        type="button"
                        data-accion="agregar-carrito"
                        data-id="${producto.id}"
                        ${producto.stock === 0 ? "disabled" : ""}
                        aria-label="Agregar una unidad de ${nombreSeguro}"
                    >
                        +
                    </button>

                    <button
                        class="remove-btn"
                        type="button"
                        data-accion="eliminar-carrito"
                        data-id="${producto.id}"
                    >
                        Quitar todo
                    </button>
                </div>
            </article>
        `;
    }).join("");
}


function agregarAlCarrito(idProducto) {
    const producto = obtenerProductoPorId(idProducto);
    if (!producto || producto.stock === 0) {
        mostrarMensaje("No hay stock disponible de ese título.", "warning");
        return;
    }
    if (aplicarCambio(function () {
        producto.vender(1);
        carrito.push(idProducto);
    })) {
        mostrarMensaje(producto.nombre + " se agregó al carrito.");
    }
}


function quitarUnaUnidad(idProducto) {
    const posicion = carrito.indexOf(idProducto);
    if (posicion === -1) {
        return;
    }
    if (aplicarCambio(function () {
        carrito.splice(posicion, 1);
        obtenerProductoPorId(idProducto).reponer(1);
    })) {
        mostrarMensaje("Se quitó una unidad y se devolvió al stock.");
    }
}


function eliminarProductoDelCarrito(idProducto) {
    const cantidadEliminada = contarProducto(idProducto);
    if (cantidadEliminada === 0) {
        return;
    }
    if (aplicarCambio(function () {
        carrito = carrito.filter(function (idGuardado) {
            return idGuardado !== idProducto;
        });
        obtenerProductoPorId(idProducto).reponer(cantidadEliminada);
    })) {
        mostrarMensaje("Se quitó el título del carrito y se devolvió al stock.");
    }
}


async function eliminarProductoDelCatalogo(idProducto) {
    const producto = obtenerProductoPorId(idProducto);
    if (!producto) {
        return;
    }
    const { isConfirmed } = await Swal.fire({
        title: "¿Eliminar este título?",
        text: producto.nombre + " también se quitará del carrito si lo habías agregado.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Eliminar título",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d71920"
    });
    if (!isConfirmed) {
        return;
    }
    if (aplicarCambio(function () {
        carrito = carrito.filter(function (idGuardado) {
            return idGuardado !== idProducto;
        });
        catalogo.splice(catalogo.findIndex(function (titulo) {
            return titulo.id === idProducto;
        }), 1);
    })) {
        mostrarMensaje("Se eliminó " + producto.nombre + " del catálogo.");
    }
}


function devolverProductosAlStock() {
    carrito.forEach(function (idProducto) {
        const producto = obtenerProductoPorId(idProducto);

        if (producto !== null) {
            producto.reponer(1);
        }
    });
}


async function vaciarCarrito() {
    if (carrito.length === 0) {
        return;
    }
    cerrarCarrito();
    const { isConfirmed } = await Swal.fire({
        title: "¿Vaciar el carrito?",
        text: "Los títulos volverán a estar disponibles en el catálogo.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Vaciar carrito",
        cancelButtonText: "Seguir comprando",
        confirmButtonColor: "#d71920"
    });
    if (isConfirmed && aplicarCambio(function () {
        devolverProductosAlStock();
        carrito = [];
    })) {
        mostrarMensaje("El carrito se vació y el stock fue restaurado.");
    }
    abrirCarrito();
}


async function finalizarCompra() {
    if (compraEnCurso || carrito.length === 0) {
        return;
    }
    compraEnCurso = true;
    const { subtotal, descuento, total } = obtenerResumenCompra();
    const detalle = obtenerProductosUnicosDelCarrito().map(function (idProducto) {
        const { nombre, precio } = obtenerProductoPorId(idProducto);
        return { idProducto, nombre, precio, cantidad: contarProducto(idProducto) };
    });
    cerrarCarrito();
    try {
        const { isConfirmed } = await Swal.fire({
            title: "Confirmá tu compra",
            html: crearResumenPedidoHTML(detalle, subtotal, descuento, total) +
                '<p class="simulation-note">Compra de prueba: no se realiza ningún cobro.</p>',
            showCancelButton: true,
            confirmButtonText: "Confirmar compra",
            cancelButtonText: "Volver al carrito",
            confirmButtonColor: "#d71920",
            focusCancel: true
        });
        if (!isConfirmed) {
            abrirCarrito();
            return;
        }
        const pedido = {
            id: "CC-" + Date.now().toString(36).toUpperCase() + "-" +
                Math.random().toString(36).slice(2, 6).toUpperCase(),
            fecha: new Date().toISOString(),
            productos: detalle,
            subtotal,
            descuento,
            total
        };
        const compraGuardada = aplicarCambio(function () {
            historialCompras.unshift(pedido);
            carrito = [];
        });
        if (!compraGuardada) {
            abrirCarrito();
            return;
        }
        await Swal.fire({
            icon: "success",
            title: "¡Compra confirmada!",
            html: '<p>Pedido <strong>' + escaparHTML(pedido.id) + '</strong></p>' +
                '<p class="purchase-confirmed-total">Total: ' + formatearPrecio(total) + '</p>' +
                '<p>Guardamos el comprobante en tu historial de compras.</p>',
            confirmButtonText: "Ver mi compra",
            confirmButtonColor: "#d71920"
        });
        document.getElementById("historial").scrollIntoView({ behavior: "smooth" });
    } finally {
        compraEnCurso = false;
    }
}


function abrirCarrito() {
    if (!aplicacionLista || carritoPanel.classList.contains("open")) {
        return;
    }
    focoAntesDelCarrito = document.activeElement;
    carritoPanel.inert = false;
    carritoPanel.classList.add("open");
    carritoOverlay.classList.add("visible");
    carritoPanel.setAttribute("aria-hidden", "false");
    carritoPanel.setAttribute("aria-modal", "true");
    document.body.classList.add("cart-open");
    document.querySelectorAll("body > header, body > nav, body > main, body > footer").forEach(function (elemento) {
        elemento.inert = true;
    });
    document.getElementById("cerrarCarritoBtn").focus();
}


function cerrarCarrito() {
    if (!carritoPanel.classList.contains("open")) {
        return;
    }
    document.querySelectorAll("body > header, body > nav, body > main, body > footer").forEach(function (elemento) {
        elemento.inert = false;
    });
    const destinoFoco = focoAntesDelCarrito?.isConnected
        ? focoAntesDelCarrito
        : document.getElementById("abrirCarritoBtn");
    destinoFoco.focus();
    carritoPanel.classList.remove("open");
    carritoOverlay.classList.remove("visible");
    carritoPanel.setAttribute("aria-hidden", "true");
    carritoPanel.setAttribute("aria-modal", "false");
    carritoPanel.inert = true;
    document.body.classList.remove("cart-open");
}


function actualizarBusquedaDesdeInput() {
    textoBusqueda = buscarInput.value.trim();
    actualizarVistaCatalogo();
}


function buscarDesdeWeb() {
    actualizarBusquedaDesdeInput();

    if (textoBusqueda === "") {
        mostrarMensaje("Mostrando todo el catálogo.", "ok");
        return;
    }

    const coincidencias = obtenerProductosVisibles().length;

    if (coincidencias === 0) {
        mostrarMensaje(
            "No encontramos títulos para “" + textoBusqueda + "”.",
            "warning"
        );
        return;
    }

    mostrarMensaje(
        "Encontramos " + coincidencias + " resultado(s) para “" +
        textoBusqueda + "”.",
        "ok"
    );
}


function ocultarVistaPreviaPortada() {
    vistaPreviaPortada.hidden = true;
    vistaPreviaPortada.classList.remove("is-searching", "not-found");
    vistaPreviaPortada.setAttribute("aria-busy", "false");
    imagenPortadaDetectada.hidden = false;
    imagenPortadaDetectada.removeAttribute("src");
    imagenPortadaDetectada.alt = "";
    mensajePortada.textContent = "";
}


function mostrarVistaPreviaPortada(datosVisuales, mensaje) {
    const { imagen, titulo } = datosVisuales;

    vistaPreviaPortada.hidden = false;
    vistaPreviaPortada.classList.remove("is-searching", "not-found");
    vistaPreviaPortada.setAttribute("aria-busy", "false");
    imagenPortadaDetectada.hidden = false;
    imagenPortadaDetectada.src = imagen;
    imagenPortadaDetectada.alt = "Portada detectada de " + titulo;
    mensajePortada.textContent = mensaje;
}


function mostrarBusquedaDePortada() {
    vistaPreviaPortada.hidden = false;
    vistaPreviaPortada.classList.add("is-searching");
    vistaPreviaPortada.classList.remove("not-found");
    vistaPreviaPortada.setAttribute("aria-busy", "true");
    imagenPortadaDetectada.hidden = true;
    imagenPortadaDetectada.removeAttribute("src");
    imagenPortadaDetectada.alt = "";
    mensajePortada.textContent = "Buscando una portada para este título...";
}


function mostrarPortadaNoEncontrada() {
    vistaPreviaPortada.hidden = false;
    vistaPreviaPortada.classList.remove("is-searching");
    vistaPreviaPortada.classList.add("not-found");
    vistaPreviaPortada.setAttribute("aria-busy", "false");
    imagenPortadaDetectada.hidden = true;
    imagenPortadaDetectada.removeAttribute("src");
    imagenPortadaDetectada.alt = "";
    mensajePortada.textContent =
        "No encontramos una portada automática. Se agregará como catálogo local.";
}


function actualizarVistaPreviaPortada() {
    clearTimeout(temporizadorPortada);

    const nombre = nombreProducto.value.trim();
    const categoria = categoriaProducto.value;
    const datosLocales = obtenerDatosVisualesPorTitulo(nombre, categoria);
    const numeroSolicitud = ++solicitudPortadaActual;

    if (datosLocales.imagen !== "") {
        mostrarVistaPreviaPortada(
            datosLocales,
            "Portada detectada: " + datosLocales.titulo +
            ". Se agregará automáticamente."
        );
        return;
    }

    if (normalizarTexto(nombre).length < 3) {
        ocultarVistaPreviaPortada();
        return;
    }

    mostrarBusquedaDePortada();

    temporizadorPortada = setTimeout(async function () {
        const datosVisuales = await buscarDatosVisualesPorTitulo(nombre, categoria);

        if (numeroSolicitud !== solicitudPortadaActual) {
            return;
        }

        if (datosVisuales.imagen === "") {
            mostrarPortadaNoEncontrada();
            return;
        }

        mostrarVistaPreviaPortada(
            datosVisuales,
            "Portada encontrada: " + datosVisuales.titulo +
            ". Se agregará automáticamente."
        );
    }, 500);
}


async function agregarProductoDesdeFormulario(evento) {
    evento.preventDefault();
    const botonAgregar = formularioProducto.querySelector('button[type="submit"]');
    if (!aplicacionLista || botonAgregar.disabled) {
        return;
    }
    const nombre = nombreProducto.value.trim();
    const precio = Number(precioProducto.value);
    const categoria = categoriaProducto.value;
    const stock = Number(stockProducto.value);
    if (nombre.length < 2 || nombre.length > 50) {
        mostrarMensajeFormulario("El nombre debe tener entre 2 y 50 caracteres.", "error");
        nombreProducto.focus();
        return;
    }
    if (!Number.isInteger(precio) || precio <= 0 || precio > 100000000) {
        mostrarMensajeFormulario("Ingresá un precio entero entre 1 y 100.000.000.", "error");
        precioProducto.focus();
        return;
    }
    if (stockProducto.value.trim() === "" || !Number.isInteger(stock) || stock < 0 || stock > 10000) {
        mostrarMensajeFormulario("El stock debe ser un entero entre 0 y 10.000.", "error");
        stockProducto.focus();
        return;
    }
    if (!["Manga", "Cómic"].includes(categoria)) {
        mostrarMensajeFormulario("Elegí una categoría válida.", "error");
        return;
    }
    if (catalogo.some(function (producto) {
        return normalizarTexto(producto.nombre) === normalizarTexto(nombre);
    })) {
        mostrarMensajeFormulario("Ya existe un título con ese nombre.", "error");
        nombreProducto.focus();
        return;
    }
    botonAgregar.disabled = true;
    botonAgregar.textContent = "Agregando...";
    formularioProducto.setAttribute("aria-busy", "true");
    mostrarMensajeFormulario("Buscando la portada y guardando el título...", "pending");
    try {
        const { imagen, editorial, enlaceEditorial } = await buscarDatosVisualesPorTitulo(nombre, categoria);
        const nuevoProducto = new Producto(
            obtenerSiguienteId(), nombre, precio, categoria, stock,
            imagen, editorial, enlaceEditorial
        );
        if (!aplicarCambio(function () {
            catalogo.push(nuevoProducto);
        })) {
            mostrarMensajeFormulario("No se pudo guardar. Revisá el almacenamiento del navegador y reintentá.", "error");
            return;
        }
        formularioProducto.reset();
        categoriaSeleccionada = "Todos";
        categoriaFiltro.value = "Todos";
        textoBusqueda = "";
        buscarInput.value = "";
        actualizarVistaPreviaPortada();
        actualizarVistaCatalogo();
        const mensaje = nombre + " se agregó al catálogo correctamente.";
        mostrarMensajeFormulario(mensaje, "ok");
        mostrarMensaje(mensaje);
        nombreProducto.focus();
    } catch (error) {
        mostrarMensajeFormulario("No se pudo agregar el título. Intentá de nuevo.", "error");
        mostrarMensaje("No se pudo agregar el título. Intentá de nuevo.", "error");
    } finally {
        botonAgregar.disabled = false;
        botonAgregar.textContent = "Agregar al catálogo";
        formularioProducto.setAttribute("aria-busy", "false");
    }
}


function mostrarMensajeFormulario(texto, tipo) {
    mensajeFormulario.textContent = texto;
    mensajeFormulario.className = "form-message form-field-wide " + tipo;
}


function manejarAccionesCatalogo(evento) {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton || !productosGrid.contains(boton)) {
        return;
    }

    const idProducto = Number(boton.dataset.id);

    if (boton.dataset.accion === "agregar-carrito") {
        agregarAlCarrito(idProducto);
    }

    if (boton.dataset.accion === "eliminar-producto") {
        eliminarProductoDelCatalogo(idProducto);
    }
}


function manejarAccionesCarrito(evento) {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton || !carritoContenido.contains(boton)) {
        return;
    }

    const idProducto = Number(boton.dataset.id);
    const accion = boton.dataset.accion;

    if (accion === "agregar-carrito") {
        agregarAlCarrito(idProducto);
    }

    if (accion === "quitar-unidad") {
        quitarUnaUnidad(idProducto);
    }

    if (accion === "eliminar-carrito") {
        eliminarProductoDelCarrito(idProducto);
    }
}


function registrarEventos() {
    document.getElementById("reintentarCargaBtn").addEventListener("click", cargarAplicacion);
    document.getElementById("reiniciarDatosBtn").addEventListener("click", reiniciarDatos);
    document.getElementById("historialContenido").addEventListener("click", function (evento) {
        const boton = evento.target.closest("button[data-pedido]");
        if (boton) {
            eliminarCompraDelHistorial(boton.dataset.pedido);
        }
    });
    document.addEventListener("keydown", manejarTecladoCarrito);
    productosGrid.addEventListener("error", function (evento) {
        if (evento.target.tagName === "IMG") {
            const portada = evento.target.closest(".product-cover");
            portada.textContent = evento.target.alt;
            portada.classList.add("cover-fallback");
        }
    }, true);
    buscarBtn.addEventListener("click", buscarDesdeWeb);

    buscarInput.addEventListener("input", actualizarBusquedaDesdeInput);

    buscarInput.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") {
            buscarInput.value = "";
            actualizarBusquedaDesdeInput();
            mostrarMensaje("Se limpió la búsqueda.", "ok");
        }
    });

    categoriaFiltro.addEventListener("change", function () {
        categoriaSeleccionada = categoriaFiltro.value;
        actualizarVistaCatalogo();

        const mensaje = categoriaSeleccionada === "Todos"
            ? "Se muestran todas las categorías."
            : "Filtro aplicado: " + categoriaSeleccionada + ".";

        mostrarMensaje(mensaje, "ok");
    });

    formularioProducto.addEventListener("submit", agregarProductoDesdeFormulario);
    nombreProducto.addEventListener("input", actualizarVistaPreviaPortada);
    categoriaProducto.addEventListener("change", actualizarVistaPreviaPortada);
    productosGrid.addEventListener("click", manejarAccionesCatalogo);
    carritoContenido.addEventListener("click", manejarAccionesCarrito);

    document
        .getElementById("abrirCarritoBtn")
        .addEventListener("click", abrirCarrito);

    document
        .getElementById("navCarritoBtn")
        .addEventListener("click", abrirCarrito);

    document
        .getElementById("cerrarCarritoBtn")
        .addEventListener("click", cerrarCarrito);

    carritoOverlay.addEventListener("click", cerrarCarrito);

    document
        .getElementById("vaciarCarritoBtn")
        .addEventListener("click", vaciarCarrito);

    document
        .getElementById("finalizarCompraBtn")
        .addEventListener("click", finalizarCompra);
}


async function iniciarAplicacion() {
    seleccionarElementosDOM();
    registrarEventos();
    await cargarAplicacion();
    programarAvisoDeDescuento();
}


function obtenerURLSegura(valor, permitirArchivoLocal = false) {
    const texto = String(valor || "").trim();
    if (permitirArchivoLocal && /^assets\/[a-z0-9_./-]+$/i.test(texto) && !texto.includes("..")) {
        return texto;
    }
    try {
        const direccion = new URL(texto);
        return direccion.protocol === "https:" || direccion.protocol === "http:" ? direccion.href : "";
    } catch (error) {
        return "";
    }
}

function obtenerEstadoActual() {
    return { version: 1, catalogo, carrito, historialCompras };
}

function restaurarEstado(estado) {
    catalogo.splice(0, catalogo.length, ...estado.catalogo.map(crearProductoDesdeDatos));
    carrito = [...estado.carrito];
    historialCompras.splice(0, historialCompras.length, ...estado.historialCompras);
}

function validarEstadoGuardado(estado) {
    if (!estado || estado.version !== 1 || !Array.isArray(estado.catalogo) ||
        !estado.catalogo.every(esProductoValido) || !Array.isArray(estado.carrito) ||
        !Array.isArray(estado.historialCompras)) {
        throw new Error("El estado guardado no tiene el formato esperado.");
    }
    const idsCatalogo = new Set(estado.catalogo.map(function (producto) { return producto.id; }));
    if (idsCatalogo.size !== estado.catalogo.length || !estado.carrito.every(function (idProducto) {
        return Number.isInteger(idProducto) && idsCatalogo.has(idProducto);
    })) {
        throw new Error("El carrito o el catálogo contiene datos inválidos.");
    }
    if (!estado.historialCompras.every(function (pedido) {
        if (!pedido || typeof pedido.id !== "string" || !Number.isFinite(Date.parse(pedido.fecha)) ||
            !Array.isArray(pedido.productos) || pedido.productos.length === 0) {
            return false;
        }
        const detalleValido = pedido.productos.every(function (producto) {
            return producto && Number.isInteger(producto.idProducto) &&
                typeof producto.nombre === "string" && producto.nombre.trim().length > 0 &&
                Number.isFinite(producto.precio) && producto.precio > 0 &&
                Number.isInteger(producto.cantidad) && producto.cantidad > 0;
        });
        if (!detalleValido) {
            return false;
        }
        const subtotal = pedido.productos.reduce(function (acumulado, producto) {
            return acumulado + producto.precio * producto.cantidad;
        }, 0);
        const cantidad = pedido.productos.reduce(function (acumulado, producto) {
            return acumulado + producto.cantidad;
        }, 0);
        const descuento = calcularDescuento(cantidad, subtotal);
        return pedido.subtotal === subtotal && pedido.descuento === descuento &&
            pedido.total === Math.round((subtotal - descuento) * 100) / 100;
    })) {
        throw new Error("El historial guardado contiene datos inválidos.");
    }
}

function aplicarCambio(cambiarEstado, borrarDatos = false) {
    if (!aplicacionLista) {
        return false;
    }
    const respaldo = JSON.stringify(obtenerEstadoActual());
    try {
        cambiarEstado();
        if (borrarDatos) {
            localStorage.removeItem(CLAVE_ESTADO);
        } else {
            guardarEstadoEnStorage();
        }
    } catch (error) {
        restaurarEstado(JSON.parse(respaldo));
        mostrarMensaje(
            "No se pudo guardar el cambio. Tus datos anteriores se conservaron. " +
            "Verificá el espacio y los permisos de almacenamiento del navegador.",
            "error"
        );
        actualizarInterfaz();
        return false;
    }
    actualizarInterfaz();
    return true;
}

function actualizarInterfaz() {
    actualizarVistaCatalogo();
    renderizarCarrito();
    renderizarHistorial();
}

function obtenerResumenCompra() {
    const subtotal = calcularTotalCarrito();
    const descuento = calcularDescuento(carrito.length, subtotal);
    return { subtotal, descuento, total: Math.round((subtotal - descuento) * 100) / 100 };
}

function crearResumenPedidoHTML(productos, subtotal, descuento, total) {
    const detalle = productos.map(function ({ nombre, precio, cantidad }) {
        return '<li><span>' + escaparHTML(nombre) + ' × ' + cantidad +
            '</span><strong>' + formatearPrecio(precio * cantidad) + '</strong></li>';
    }).join("");
    return '<ul class="order-products">' + detalle + '</ul>' +
        '<dl class="order-totals"><div><dt>Subtotal</dt><dd>' + formatearPrecio(subtotal) + '</dd></div>' +
        '<div><dt>Descuento</dt><dd>−' + formatearPrecio(descuento) + '</dd></div>' +
        '<div class="order-grand-total"><dt>Total</dt><dd>' + formatearPrecio(total) + '</dd></div></dl>';
}

function renderizarHistorial() {
    const contenido = document.getElementById("historialContenido");
    document.getElementById("cantidadCompras").textContent = historialCompras.length;
    if (historialCompras.length === 0) {
        contenido.innerHTML = '<p class="empty-catalog">Todavía no realizaste compras. ' +
            'Cuando confirmes tu pedido, vas a encontrar el comprobante acá.</p>';
        return;
    }
    contenido.innerHTML = historialCompras.map(function (pedido) {
        const { id, fecha, productos, subtotal, descuento, total } = pedido;
        const fechaFormateada = new Date(fecha).toLocaleString("es-AR", {
            dateStyle: "short", timeStyle: "short"
        });
        return '<article class="order-card"><div class="order-heading"><div><h3>Pedido ' +
            escaparHTML(id) + '</h3><p>' + escaparHTML(fechaFormateada) + '</p></div>' +
            '<span class="order-status">Confirmada</span></div>' +
            crearResumenPedidoHTML(productos, subtotal, descuento, total) +
            '<button type="button" class="btn-secondary" data-pedido="' + escaparHTML(id) +
            '">Eliminar del historial</button></article>';
    }).join("");
}

async function eliminarCompraDelHistorial(idPedido) {
    const { isConfirmed } = await Swal.fire({
        title: "¿Eliminar el comprobante?",
        text: "Se borrará del historial. Esto no cancela la compra ni devuelve stock.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Eliminar comprobante",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d71920"
    });
    if (!isConfirmed) {
        return;
    }
    if (aplicarCambio(function () {
        const posicion = historialCompras.findIndex(function (pedido) { return pedido.id === idPedido; });
        if (posicion !== -1) {
            historialCompras.splice(posicion, 1);
        }
    })) {
        mostrarMensaje("El comprobante se eliminó del historial.");
    }
}

async function reiniciarDatos() {
    if (!aplicacionLista) {
        return;
    }
    const { isConfirmed } = await Swal.fire({
        title: "¿Reiniciar la simulación?",
        text: "Se vaciarán el carrito y el historial, se quitarán los títulos agregados y se restaurará el catálogo inicial.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, borrar mis datos",
        cancelButtonText: "Conservar mis datos",
        confirmButtonColor: "#d71920",
        focusCancel: true
    });
    if (!isConfirmed) {
        return;
    }
    if (aplicarCambio(function () {
        catalogo.splice(0, catalogo.length, ...productosIniciales.map(crearProductoDesdeDatos));
        carrito = [];
        historialCompras.splice(0);
    }, true)) {
        mostrarMensaje("Se borraron los datos de la simulación y se restauró el catálogo inicial.");
    }
}

function cambiarDisponibilidadControles(disponible) {
    document.querySelectorAll(
        "#formularioProducto input, #formularioProducto select, #formularioProducto button, " +
        "#buscarInput, #buscarBtn, #categoriaFiltro, #abrirCarritoBtn, #navCarritoBtn, #reiniciarDatosBtn"
    ).forEach(function (elemento) {
        elemento.disabled = !disponible;
    });
}

async function cargarAplicacion() {
    if (cargaEnCurso) {
        return;
    }
    cargaEnCurso = true;
    aplicacionLista = false;
    cambiarDisponibilidadControles(false);
    productosGrid.setAttribute("aria-busy", "true");
    productosGrid.innerHTML = '<p class="empty-catalog loading-message" role="status">Cargando catálogo...</p>';
    mensajeBusqueda.textContent = "Estamos preparando tus títulos.";
    const botonReintentar = document.getElementById("reintentarCargaBtn");
    botonReintentar.hidden = true;
    try {
        await cargarDatosCatalogo();
        historialCompras.splice(0);
        carrito = [];
        const recuperado = cargarEstadoDesdeStorage();
        aplicacionLista = true;
        actualizarInterfaz();
        if (recuperado) {
            mostrarMensaje("Recuperamos tu catálogo, carrito e historial guardados.");
        }
    } catch (error) {
        productosGrid.innerHTML = '<p class="empty-catalog">No pudimos cargar los productos. ' +
            'Revisá tu conexión y volvé a intentarlo. Si abriste el archivo directamente, usá Live Server.</p>';
        mensajeBusqueda.textContent = "El catálogo no está disponible.";
        mensajeBusqueda.className = "search-message error";
        botonReintentar.hidden = false;
        mostrarMensaje("No se pudo cargar la base de productos. Podés reintentar la carga.", "error");
        renderizarCarrito();
        renderizarHistorial();
    } finally {
        cargaEnCurso = false;
        productosGrid.setAttribute("aria-busy", "false");
        cambiarDisponibilidadControles(aplicacionLista);
    }
}

function manejarTecladoCarrito(evento) {
    if (!carritoPanel.classList.contains("open")) {
        return;
    }
    if (evento.key === "Escape") {
        cerrarCarrito();
        return;
    }
    if (evento.key !== "Tab") {
        return;
    }
    const controles = Array.from(carritoPanel.querySelectorAll("button:not(:disabled), a[href], input:not(:disabled)"));
    const primero = controles[0];
    const ultimo = controles[controles.length - 1];
    if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
    }
}

document.addEventListener("DOMContentLoaded", iniciarAplicacion);
