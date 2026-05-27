const grid = document.querySelector(".grid");
let productoActual = null;
let stockMaximo = 0;
let todosLosProductos = [];

function mostrarToast(mensaje, tipo = 'info') {
    const iconos = {
        error: '<i class="fas fa-times-circle"></i>',
        exito: '<i class="fas fa-check-circle"></i>',
        aviso: '<i class="fas fa-exclamation-triangle"></i>',
        info:  '<i class="fas fa-info-circle"></i>'
    };

    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `<span class="toast-icon">${iconos[tipo] || iconos.info}</span><span>${mensaje}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function cargarProductos() {
    if (!grid) return;
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:60px;">Cargando productos...</p>`;

    fetchSeguro("https://pesca-mcl1.onrender.com/php/producto.php?origen=inicio&t=" + Date.now())
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.error("Error del servidor:", data.error);
                if(grid) grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:60px;"><i class="fas fa-exclamation-triangle"></i> ${data.error}</p>`;
                return;
            }
            if (!Array.isArray(data)) {
                console.error("Respuesta no es array:", data);
                if(grid) grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:60px;"><i class="fas fa-exclamation-triangle"></i> Error en formato de datos</p>`;
                return;
            }
            todosLosProductos = data.map(producto => ({
                ...producto,
                cantidad: parseFloat(producto.cantidad) || 0,
                originalCantidad: parseFloat(producto.cantidad) || 0
            }));
            actualizarStockDesdeCarrito();
            renderProductos(todosLosProductos);
            llenarCategorias(todosLosProductos);
        })
        .catch(err => {
            console.error("Error:", err);
            if(grid) grid.innerHTML = "<p>Error cargando productos</p>";
        });
}

function renderProductos(lista){
    if(!grid) return;
    grid.innerHTML = "";
    
    if (!Array.isArray(lista)) {
        console.error("lista no es un array:", lista);
        return;
    }
    
    if (lista.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:60px;">No se encontraron productos</p>`;
        return;
    }
    
    lista.forEach(producto => {
        const imagenUrl = producto.imagen || 'img/default-producto.svg';
        const card = `
        <div class="card" 
            data-id="${producto.id}"
            data-nombre="${producto.nombre}" 
            data-desc="${producto.descripcion}" 
            data-precio="${producto.precio}"
            data-origen="${producto.origen}"
            data-cantidad="${producto.cantidad}"
            data-pescador="${producto.pescador_responsable}"
            data-fecha="${producto.fecha}"
            data-tipo="${producto.tipo_pesca}"
            data-imagen="${imagenUrl}"
            data-vendedor-telefono="${producto.vendedor_telefono || ''}"
        >
            <div class="image">
                <img src="${imagenUrl}" alt="${producto.nombre}" loading="lazy"
                     onerror="this.src='img/default-producto.svg'; this.onerror=null;">
            </div>
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <div class="price">$${producto.precio} <small>/kg</small></div>
            <div class="stock-info"><i class="fas fa-box"></i> ${parseFloat(producto.cantidad).toFixed(2)} kg</div>
        </div>`;
        grid.insertAdjacentHTML("beforeend", card);
    });
}


function llenarCategorias(productos) {
    if (!Array.isArray(productos)) return;
    
    const categorias = [...new Set(productos.map(p => p.tipo_pesca).filter(c => c))];
    const selectCat = document.getElementById('category-filter');
    if (!selectCat) return;

    while (selectCat.options.length > 1) selectCat.remove(1);

    categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        selectCat.appendChild(option);
    });
}

function actualizarStockDesdeCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (!Array.isArray(todosLosProductos) || !todosLosProductos.length) return;

    const stockRestado = carrito.reduce((memo, item) => {
        memo[item.id] = (memo[item.id] || 0) + item.cantidad;
        return memo;
    }, {});

    todosLosProductos.forEach(producto => {
        if (typeof producto.originalCantidad === 'undefined') {
            producto.originalCantidad = parseFloat(producto.cantidad) || 0;
        }

        producto.cantidad = Math.max(
            producto.originalCantidad - (stockRestado[producto.id] || 0),
            0
        );
    });
}

function filtrarProductos() {
    if (!Array.isArray(todosLosProductos) || !todosLosProductos.length) return;

    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const categoriaSeleccionada = document.getElementById('category-filter')?.value || '';

    let filtrados = [...todosLosProductos];

    if (categoriaSeleccionada) {
        filtrados = filtrados.filter(p => p.tipo_pesca === categoriaSeleccionada);
    }

    if (searchTerm) {
        filtrados = filtrados.filter(p => 
            p.nombre.toLowerCase().includes(searchTerm) ||
            p.descripcion.toLowerCase().includes(searchTerm) ||
            (p.origen && p.origen.toLowerCase().includes(searchTerm))
        );
    }

    renderProductos(filtrados);
}

function initFiltros() {
    document.getElementById('search-input')?.addEventListener('input', filtrarProductos);
    document.getElementById('category-filter')?.addEventListener('change', filtrarProductos);
}

async function agregarAlCarrito() {
    if(!productoActual) return;

    try {
        const res = await fetch('https://pesca-mcl1.onrender.com/php/verificar_sesion.php');
        const sesion = await res.json();
        
        if (!sesion.logueado) {
            mostrarToast("Debes iniciar sesión para agregar productos al carrito", "error");
            setTimeout(() => window.location.href = 'iniciarSesion.html', 1500);
            return;
        } else if (sesion.tipo === 'vendedor') {
            mostrarToast("Solo los clientes pueden agregar productos al carrito", "error");
            return;
        }
    } catch(e) {
        mostrarToast("Debes iniciar sesión para agregar productos al carrito", "error");
        setTimeout(() => window.location.href = 'iniciarSesion.html', 1500);
        return;
    }

    const input = document.getElementById("inputCantidad");
    if(!input){
        mostrarToast("Error interno del sistema", "error");
        return;
    }

    let cantidad = parseFloat(input.value);

    if(isNaN(cantidad) || cantidad <= 0) {
        mostrarToast("Cantidad inválida", "error");
        return;
    }
    if(cantidad < 0.5) {
        mostrarToast("Mínimo 0.5 kg", "aviso");
        return;
    }
    if(cantidad > stockMaximo) {
        mostrarToast("Máximo: " + stockMaximo.toFixed(2) + " kg", "aviso");
        return;
    }

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let existe = carrito.find(item => item.id === productoActual.id);

    if(existe) {
        let nuevaCantidad = existe.cantidad + cantidad;

        if(nuevaCantidad > stockMaximo) {
            mostrarToast("Ya tienes demasiado en carrito", "aviso");
            return;
        }

        existe.cantidad = nuevaCantidad;
        existe.subtotal = nuevaCantidad * productoActual.precio;
    } else {
        carrito.push({
            id: productoActual.id,
            nombre: productoActual.nombre,
            precio: productoActual.precio,
            cantidad: cantidad,
            subtotal: cantidad * productoActual.precio,
            imagen: productoActual.imagen,
            stock: stockMaximo,
            vendedor: productoActual.pescador
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarBadgeCarrito();
    actualizarStockDesdeCarrito();
    filtrarProductos();

    document.getElementById("modal").style.display = "none";
    productoActual = null;
    
    setTimeout(() => {
        mostrarToast("Producto agregado al carrito", "exito");
    }, 100);
}

function iniciarChatVendedor() {
    if(!productoActual || !productoActual.telefono) {
        mostrarToast("El vendedor no tiene teléfono registrado", "aviso");
        return;
    }
    let t = productoActual.telefono.replace(/\D/g, '');
    if(t.startsWith('3')) t = '57' + t;
    window.open(`https://wa.me/${t}`, '_blank');
}

function actualizarBadgeCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let total = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    let badge = document.getElementById('badgeCarrito');
    if(badge) {
        badge.textContent = total.toFixed(1);
        badge.style.display = total > 0 ? 'flex' : 'none';
    }
}

window.agregarAlCarrito = agregarAlCarrito;
window.iniciarChatVendedor = iniciarChatVendedor;

document.addEventListener('DOMContentLoaded', () => {

    initFiltros();
    actualizarBadgeCarrito();

    const modal = document.getElementById("modal");
    const cerrar = document.getElementById("cerrarModal");

    if (!modal) {
        console.error("FALTA #modal en el HTML");
        return;
    }

    document.addEventListener("click", function(e){
        const card = e.target.closest(".card");
        if(!card) return;

        productoActual = {
            id: parseInt(card.dataset.id),
            nombre: card.dataset.nombre,
            precio: parseFloat(card.dataset.precio),
            telefono: card.dataset.vendedorTelefono || '',
            pescador: card.dataset.pescador,
            imagen: card.dataset.imagen,
            stock: parseFloat(card.dataset.cantidad)
        };

        stockMaximo = productoActual.stock;

        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        };

        setText("modalTitulo", card.dataset.nombre);
        setText("modalDescripcion", card.dataset.desc);
        setText("modalPrecio", "$" + card.dataset.precio + " /kg");
        setText("modalOrigen", card.dataset.origen);
        setText("modalCantidad", parseFloat(card.dataset.cantidad).toFixed(2));
        setText("modalPescador", card.dataset.pescador);
        setText("modalFecha", card.dataset.fecha);
        setText("modalTipo", card.dataset.tipo);

        const img = document.getElementById("modalImagen");
        if (img) img.src = card.dataset.imagen;

        const input = document.getElementById("inputCantidad");
        if (input) {
            input.value = "1";
            input.max = stockMaximo;
        }

        const stockInfo = document.getElementById("stockInfo");
        if (stockInfo) stockInfo.textContent = "Stock: " + stockMaximo.toFixed(2) + " kg";

        modal.style.display = "block";
    });

    if(cerrar){
        cerrar.onclick = () => {
            modal.style.display = "none";
            productoActual = null;
        };
    }

    window.onclick = function(e){
        if(e.target == modal){
            modal.style.display = "none";
            productoActual = null;
        }
    };

    cargarProductos();

    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            cargarProductos();
        }
    });

});