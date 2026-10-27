class Producto {
    constructor(
        id,
        nombre,
        precio,
        categoria,
        stock,
        imagen = "",
        editorial = "Catálogo local",
        enlaceEditorial = ""
    ) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.categoria = categoria;
        this.stock = stock;
        this.imagen = imagen;
        this.editorial = editorial;
        this.enlaceEditorial = enlaceEditorial;
    }

    vender(cantidad) {
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return {
                exito: false,
                mensaje: "La cantidad debe ser un número entero mayor a 0."
            };
        }

        if (cantidad > this.stock) {
            return {
                exito: false,
                mensaje: "No hay stock suficiente de " + this.nombre + "."
            };
        }

        this.stock -= cantidad;

        return {
            exito: true,
            mensaje:
                "Se agregaron " + cantidad + " unidad(es) de " +
                this.nombre + " al carrito."
        };
    }

    reponer(cantidad) {
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return {
                exito: false,
                mensaje: "La cantidad a reponer debe ser mayor a 0."
            };
        }

        this.stock += cantidad;

        return {
            exito: true,
            mensaje:
                "Se repusieron " + cantidad + " unidad(es) de " +
                this.nombre + "."
        };
    }
}


const productosIniciales = [];
const portadasReconocidas = [];


function crearProductoDesdeDatos(datosProducto) {
    const {
        id,
        nombre,
        precio,
        categoria,
        stock,
        imagen = "",
        editorial = "Catálogo local",
        enlaceEditorial = ""
    } = datosProducto;

    return new Producto(
        Number(id),
        String(nombre),
        Number(precio),
        String(categoria),
        Number(stock),
        String(imagen),
        String(editorial),
        String(enlaceEditorial)
    );
}


const catalogo = [];


function formatearPrecio(valor) {
    return "$" + valor.toLocaleString("es-AR", { maximumFractionDigits: 2 });
}


function normalizarTexto(texto) {
    return String(texto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("es")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}


function obtenerDatosVisualesPorTitulo(nombre, categoria) {
    const tituloNormalizado = normalizarTexto(nombre);
    const portadaEncontrada = portadasReconocidas.find(function (portada) {
        return portada.categoria === categoria && portada.claves.some(function (clave) {
            return tituloNormalizado.includes(normalizarTexto(clave));
        });
    });

    const {
        imagen = "",
        editorial = "Catálogo local",
        enlaceEditorial = "",
        titulo = ""
    } = portadaEncontrada ?? {};

    return { imagen, editorial, enlaceEditorial, titulo };
}


const cachePortadasAutomaticas = new Map();


function elegirResultadoMasCercano(lista, nombre, obtenerTitulo) {
    const nombreNormalizado = normalizarTexto(nombre);

    return lista.find(function (resultado) {
        const tituloNormalizado = normalizarTexto(obtenerTitulo(resultado));

        if (tituloNormalizado === "") {
            return false;
        }

        return tituloNormalizado === nombreNormalizado ||
            tituloNormalizado.includes(nombreNormalizado) ||
            nombreNormalizado.includes(tituloNormalizado);
    }) ?? lista[0] ?? null;
}


function convertirImagenEnHTTPS(urlImagen) {
    return String(urlImagen ?? "").replace(/^http:/, "https:");
}


async function buscarPortadaEnGoogleBooks(nombre) {
    try {
        const consulta = encodeURIComponent("intitle:" + nombre);
        const respuesta = await solicitarConTiempoLimite(
            "https://www.googleapis.com/books/v1/volumes?q=" + consulta +
            "&maxResults=5&printType=books"
        );

        if (!respuesta.ok) {
            return null;
        }

        const { items = [] } = await respuesta.json();
        const volumen = elegirResultadoMasCercano(
            items,
            nombre,
            function (resultado) {
                return resultado.volumeInfo?.title ?? "";
            }
        );
        const informacion = volumen?.volumeInfo ?? {};
        const imagenes = informacion.imageLinks ?? {};
        const imagen = convertirImagenEnHTTPS(
            imagenes.large ??
            imagenes.medium ??
            imagenes.small ??
            imagenes.thumbnail
        );

        if (imagen === "") {
            return null;
        }

        return {
            imagen,
            editorial: informacion.publisher ?? "Portada automática",
            enlaceEditorial: informacion.infoLink ?? "",
            titulo: informacion.title ?? nombre
        };
    } catch (error) {
        return null;
    }
}


async function buscarPortadaEnOpenLibrary(nombre) {
    try {
        const consulta = encodeURIComponent(nombre);
        const respuesta = await solicitarConTiempoLimite(
            "https://openlibrary.org/search.json?title=" + consulta +
            "&limit=5&fields=title,cover_i,key,publisher"
        );

        if (!respuesta.ok) {
            return null;
        }

        const { docs = [] } = await respuesta.json();
        const libro = elegirResultadoMasCercano(
            docs,
            nombre,
            function (resultado) {
                return resultado.title ?? "";
            }
        );
        const idPortada = libro?.cover_i;

        if (!idPortada) {
            return null;
        }

        return {
            imagen: "https://covers.openlibrary.org/b/id/" + idPortada + "-L.jpg",
            editorial: libro.publisher?.[0] ?? "Portada automática",
            enlaceEditorial: libro.key
                ? "https://openlibrary.org" + libro.key
                : "",
            titulo: libro.title ?? nombre
        };
    } catch (error) {
        return null;
    }
}


async function buscarDatosVisualesPorTitulo(nombre, categoria) {
    const datosLocales = obtenerDatosVisualesPorTitulo(nombre, categoria);

    if (datosLocales.imagen !== "") {
        return datosLocales;
    }

    const tituloNormalizado = normalizarTexto(nombre);

    if (tituloNormalizado.length < 3) {
        return datosLocales;
    }

    const claveCache = categoria + ":" + tituloNormalizado;
    const resultadoGuardado = cachePortadasAutomaticas.get(claveCache);

    if (resultadoGuardado) {
        return resultadoGuardado;
    }

    const busqueda = (async function () {
        const portadaGoogle = await buscarPortadaEnGoogleBooks(nombre);

        if (portadaGoogle !== null) {
            return portadaGoogle;
        }

        return (await buscarPortadaEnOpenLibrary(nombre)) ?? datosLocales;
    })();

    cachePortadasAutomaticas.set(claveCache, busqueda);

    const resultado = await busqueda;
    cachePortadasAutomaticas.set(claveCache, resultado);

    return resultado;
}


function filtrarProductosPorCategoria(categoria, lista = catalogo) {
    return lista.filter(function (producto) {
        return categoria === "Todos" || producto.categoria === categoria;
    });
}


function filtrarProductosPorTexto(texto, lista = catalogo) {
    const busqueda = normalizarTexto(texto);

    if (busqueda === "") {
        return lista;
    }

    return lista.filter(function (producto) {
        return normalizarTexto(producto.nombre).includes(busqueda);
    });
}


function obtenerProductoPorId(idProducto) {
    const productoEncontrado = catalogo.find(function (producto) {
        return producto.id === idProducto;
    });

    return productoEncontrado || null;
}


function obtenerSiguienteId() {
    const ultimoId = catalogo.reduce(function (mayorId, producto) {
        return Math.max(mayorId, producto.id);
    }, 0);

    return ultimoId + 1;
}


function esProductoValido(producto) {
    return producto && Number.isInteger(producto.id) && producto.id > 0 &&
        typeof producto.nombre === "string" && producto.nombre.trim().length > 0 &&
        Number.isInteger(producto.precio) && producto.precio > 0 &&
        ["Manga", "Cómic"].includes(producto.categoria) &&
        Number.isInteger(producto.stock) && producto.stock >= 0 &&
        (producto.imagen === undefined || typeof producto.imagen === "string") &&
        (producto.editorial === undefined || typeof producto.editorial === "string") &&
        (producto.enlaceEditorial === undefined || typeof producto.enlaceEditorial === "string");
}

async function solicitarConTiempoLimite(direccion) {
    const controlador = new AbortController();
    const temporizador = setTimeout(function () { controlador.abort(); }, 5000);
    try {
        return await fetch(direccion, { signal: controlador.signal });
    } finally {
        clearTimeout(temporizador);
    }
}

async function cargarDatosCatalogo() {
    const respuesta = await solicitarConTiempoLimite("./data/catalogo.json");
    if (!respuesta.ok) {
        throw new Error("No se pudo cargar el catálogo: HTTP " + respuesta.status);
    }
    const datos = await respuesta.json();
    const { productosIniciales: productos, portadasReconocidas: portadas } = datos || {};
    if (!Array.isArray(productos) || productos.length === 0 || !productos.every(esProductoValido) ||
        !Array.isArray(portadas) || !portadas.every(function (portada) {
            return portada && Array.isArray(portada.claves) &&
                portada.claves.every(function (clave) { return typeof clave === "string"; }) &&
                typeof portada.imagen === "string" && typeof portada.titulo === "string" &&
                ["Manga", "Cómic"].includes(portada.categoria);
        })) {
        throw new Error("La base JSON no tiene el formato esperado.");
    }
    const ids = new Set(productos.map(function ({ id }) { return id; }));
    if (ids.size !== productos.length) {
        throw new Error("Hay identificadores de producto repetidos.");
    }
    productosIniciales.splice(0, productosIniciales.length, ...productos);
    portadasReconocidas.splice(0, portadasReconocidas.length, ...portadas);
    catalogo.splice(0, catalogo.length, ...productos.map(crearProductoDesdeDatos));
}
