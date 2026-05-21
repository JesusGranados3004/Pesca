const grid = document.querySelector(".grid");
let productoActual = null;
let stockMaximo = 0;
let todosLosProductos = [];

// === CARGAR PRODUCTOS ===
fetchSeguro("https://pesca-mcl1.onrender.com/conexion.php")
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.error("Error del servidor:", data.error);
            if(grid) grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:60px;">⚠️ ${data.error}</p>`;
            return;
        }
        if (!Array.isArray(data)) {
            console.error("Respuesta no es array:", data);
            if(grid) grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:60px;">⚠️ Error en formato de datos</p>`;
            return;
        }
        todosLosProductos = data;
        renderProductos(data);
        llenarCategorias(data);
    })
    .catch(err => {
        console.error("Error:", err);
        if(grid) grid.innerHTML = "<p>Error cargando productos</p>";
    });

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
            <div class="stock-info">📦 ${parseFloat(producto.cantidad).toFixed(2)} kg</div>
        </div>`;
        grid.insertAdjacentHTML("beforeend", card);
    });
}

// === FILTROS ===
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

// === AGREGAR AL CARRITO ===
async function agregarAlCarrito() {
    if(!productoActual) return;

    try {
        const res = await fetch('php/verificar_sesion.php');
        const sesion = await res.json();
        
        if (!sesion.logueado) {
            alert("🔒 Debes iniciar sesión para agregar productos al carrito");
            window.location.href = 'iniciarSesion.html';
            return;
        }
    } catch(e) {
        alert("🔒 Debes iniciar sesión para agregar productos al carrito");
        window.location.href = 'iniciarSesion.html';
        return;
    }

    const input = document.getElementById("inputCantidad");
    if(!input){
        alert("Error interno");
        return;
    }

    let cantidad = parseFloat(input.value);

    if(isNaN(cantidad) || cantidad <= 0) {
        alert("❌ Cantidad inválida");
        return;
    }
    if(cantidad < 0.5) {
        alert("❌ Mínimo 0.5 kg");
        return;
    }
    if(cantidad > stockMaximo) {
        alert("❌ Máximo: " + stockMaximo.toFixed(2));
        return;
    }

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let existe = carrito.find(item => item.id === productoActual.id);

    if(existe) {
        let nuevaCantidad = existe.cantidad + cantidad;

        if(nuevaCantidad > stockMaximo) {
            alert("❌ Ya tienes demasiado en carrito");
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

    document.getElementById("modal").style.display = "none";
    productoActual = null;
    
    alert("✅ Producto agregado al carrito");
}

// === CHAT ===
function iniciarChatVendedor() {
    if(!productoActual || !productoActual.telefono) {
        alert("Sin teléfono");
        return;
    }
    let t = productoActual.telefono.replace(/\D/g, '');
    if(t.startsWith('3')) t = '57' + t;
    window.open(`https://wa.me/${t}`, '_blank');
}

// === BADGE ===
function actualizarBadgeCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let total = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    let badge = document.getElementById('badgeCarrito');
    if(badge) {
        badge.textContent = total.toFixed(1);
        badge.style.display = total > 0 ? 'flex' : 'none';
    }
}

// === GLOBAL ===
window.agregarAlCarrito = agregarAlCarrito;
window.iniciarChatVendedor = iniciarChatVendedor;

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {

    initFiltros();
    actualizarBadgeCarrito();

    const modal = document.getElementById("modal");
    const cerrar = document.getElementById("cerrarModal");

    if (!modal) {
        console.error("❌ FALTA #modal en el HTML");
        return;
    }

    // abrir modal
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

    // cerrar modal
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

});
