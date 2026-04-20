const grid = document.querySelector(".grid");

fetch("http://localhost/WIREFRAME%20BLUEMARKET/php/producto.php")
  .then(res => res.json())
  .then(data => {
      renderProductos(data);
  })
  .catch(err => {
      console.error("Error cargando productos:", err);
      grid.innerHTML = "<p>Error cargando productos</p>";
  });

function renderProductos(lista){
    grid.innerHTML = "";

    lista.forEach(producto => {
        // Usar imagen de BD o la local por defecto
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
                <img src="${imagenUrl}" alt="${producto.nombre}" loading="lazy" onerror="this.src='img/default-producto.svg'; this.onerror=null;">
            </div>

            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <div class="price">$${producto.precio}</div>
        </div>
        `;

        grid.insertAdjacentHTML("beforeend", card);
    });
}

// ... resto del código del modal y chat (igual que antes)
const modal = document.getElementById("modal");
const cerrar = document.getElementById("cerrarModal");
const titulo = document.getElementById("modalTitulo");
const descripcion = document.getElementById("modalDescripcion");
const precio = document.getElementById("modalPrecio");
const origen = document.getElementById("modalOrigen");
const cantidad = document.getElementById("modalCantidad");
const pescador = document.getElementById("modalPescador");
const fecha = document.getElementById("modalFecha");
const tipo = document.getElementById("modalTipo");
const modalImagen = document.getElementById("modalImagen");

let productoActual = null;

document.addEventListener("click", function(e){
    const card = e.target.closest(".card");
    if(!card) return;  

    productoActual = {
        id: card.dataset.id,
        nombre: card.dataset.nombre,
        telefono: card.dataset.vendedorTelefono,
        pescador: card.dataset.pescador
    };

    titulo.innerText = card.dataset.nombre;
    descripcion.innerText = card.dataset.desc;
    precio.innerText = "$" + card.dataset.precio;
    origen.innerText = card.dataset.origen;
    cantidad.innerText = card.dataset.cantidad;
    pescador.innerText = card.dataset.pescador;
    fecha.innerText = card.dataset.fecha;
    tipo.innerText = card.dataset.tipo;

    if(modalImagen) {
        modalImagen.src = card.dataset.imagen;
        modalImagen.alt = card.dataset.nombre;
        modalImagen.onerror = function() {
            this.src = 'img/default-producto.svg';
            this.onerror = null;
        };
    }

    modal.style.display = "block";
});

cerrar.onclick = () => {
    modal.style.display = "none";
    productoActual = null;
};

window.onclick = (e) => {
    if(e.target == modal){
        modal.style.display = "none";
        productoActual = null;
    }
};

function iniciarChatVendedor() {
    if(!productoActual) return;
    
    if(!productoActual.telefono) {
        alert("Este vendedor no tiene número de teléfono registrado.");
        return;
    }
    
    let telefono = productoActual.telefono.replace(/\D/g, '');
    
    if(telefono.startsWith('3') && telefono.length === 10) {
        telefono = '57' + telefono;
    }
    
    const mensaje = `¡Hola! 👋 Ví tu producto *${productoActual.nombre}* en PescaDirecta y estoy interesado. ¿Sigue disponible? 🐟`;
    
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

function agregarAlCarrito() {
    if(!productoActual) return;
    alert(`✅ ${productoActual.nombre} agregado al carrito`);
}

window.iniciarChatVendedor = iniciarChatVendedor;
window.agregarAlCarrito = agregarAlCarrito;