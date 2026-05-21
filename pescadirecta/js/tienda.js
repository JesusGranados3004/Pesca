document.addEventListener('DOMContentLoaded', cargarCarrito);

function cargarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contenedor = document.getElementById('carritoItems');
    const resumen = document.getElementById('carritoResumen');
    const vacio = document.getElementById('carritoVacio');

    if (carrito.length === 0) {
        contenedor.innerHTML = '';
        resumen.style.display = 'none';
        vacio.style.display = 'block';
        return;
    }

    vacio.style.display = 'none';
    resumen.style.display = 'block';
    contenedor.innerHTML = '';

    let total = 0;
    let hayErrorStock = false;

    carrito.forEach((item, index) => {
        total += item.subtotal;
        const div = document.createElement('div');
        div.className = 'carrito-item';
        div.innerHTML = `
            <img src="${item.imagen || 'img/default-producto.svg'}" alt="${item.nombre}" onerror="this.src='img/default-producto.svg'">
            <div class="carrito-item-info">
                <h4>${item.nombre}</h4>
                <p>$${item.precio} /kg • ${item.vendedor || 'N/A'}</p>
                <p>Stock: ${parseFloat(item.stock).toFixed(2)} kg</p>
                <div class="alerta-stock" id="alerta-${index}">⚠️ Excede stock disponible</div>
            </div>
            <div class="cantidad-control-carrito">
                <button onclick="modificarCantidad(${index}, -0.5)" ${item.cantidad <= 0.5 ? 'disabled' : ''}>−</button>
                <input type="number" id="qty-${index}" value="${item.cantidad.toFixed(2)}" 
                    min="0.5" max="${item.stock}" step="0.1"
                    style="width:70px;text-align:center;padding:4px;border:1px solid #ddd;border-radius:4px;"
                    onchange="actualizarDesdeInput(${index}, this.value)"
                >
                <button onclick="modificarCantidad(${index}, 0.5)" ${item.cantidad >= item.stock ? 'disabled' : ''}>+</button>
            </div>
            <div class="carrito-precio">$${item.subtotal.toFixed(2)}</div>
            <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">🗑️</button>
        `;
        contenedor.appendChild(div);

        if (item.cantidad > item.stock) {
            document.getElementById(`alerta-${index}`).classList.add('visible');
            hayErrorStock = true;
        }
    });

    // Actualizar resumen de compra (de carrito.html)
    actualizarResumen(total, hayErrorStock);
}

// === FUNCIONES DE RESUMEN (de carrito.html) ===
function actualizarResumen(total, hayErrorStock) {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Calcular subtotal
    let subtotal = 0;
    carrito.forEach(item => {
        subtotal += item.subtotal;
    });
    
    // Envío gratis para pedidos mayores a $50
    const envio = subtotal > 50 ? 0 : 5;
    const envioTexto = envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`;
    const totalFinal = subtotal + envio;
    
    // Actualizar DOM
    const subtotalEl = document.getElementById('subtotalCarrito');
    const envioEl = document.getElementById('envioCarrito');
    const totalEl = document.getElementById('totalCarrito');
    const btnPagar = document.getElementById('btnPagar');
    const mensajeStock = document.getElementById('mensajeStock');
    
    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (envioEl) envioEl.textContent = envioTexto;
    if (totalEl) totalEl.textContent = '$' + totalFinal.toFixed(2);
    if (btnPagar) btnPagar.disabled = hayErrorStock;
    if (mensajeStock) mensajeStock.style.display = hayErrorStock ? 'block' : 'none';
}

function modificarCantidad(index, delta) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const item = carrito[index];
    const nuevaCantidad = parseFloat((item.cantidad + delta).toFixed(2));
    
    if (nuevaCantidad < 0.5) { alert("Mínimo 0.5 kg"); return; }
    if (nuevaCantidad > item.stock) { alert(`Máximo: ${item.stock.toFixed(2)} kg`); return; }

    item.cantidad = nuevaCantidad;
    item.subtotal = nuevaCantidad * item.precio;
    localStorage.setItem('carrito', JSON.stringify(carrito));
    cargarCarrito();
}

function eliminarDelCarrito(index) {
    if (!confirm('¿Eliminar este producto?')) return;
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    cargarCarrito();
}

// === VACIAR CARRITO (de carrito.html) ===
function vaciarCarrito() {
    if (!confirm("¿Estás seguro de vaciar el carrito?")) return;
    localStorage.setItem('carrito', JSON.stringify([]));
    cargarCarrito();
    actualizarBadgeCarrito();
}

function procederPago() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Validaciones previas
    let errores = [];
    carrito.forEach(item => {
        if (item.cantidad > item.stock) {
            errores.push(`${item.nombre}: solicitado ${item.cantidad.toFixed(2)} kg, disponible ${item.stock.toFixed(2)} kg`);
        }
    });
    if (errores.length > 0) {
        alert("❌ Stock insuficiente:\n\n" + errores.join("\n"));
        return;
    }
    if (carrito.length === 0) { 
        alert("Carrito vacío"); 
        return; 
    }

    // Verificar sesión
    fetch('https://pesca-mcl1.onrender.com/php/verificar_sesion.php')
        .then(r => r.json())
        .then(sesion => {
            if (!sesion.logueado) {
                alert("Debes iniciar sesión");
                window.location.href = 'iniciarSesion.html';
                return;
            }
            
            // Calcular total
            let subtotal = carrito.reduce((sum, item) => sum + item.subtotal, 0);
            const envio = subtotal > 50 ? 0 : 5;
            const totalFinal = subtotal + envio;
            
            // Confirmar compra
            if (!confirm(`💳 Total a pagar: $${totalFinal.toFixed(2)}\n(Incluye envío: ${envio === 0 ? 'Gratis' : '$' + envio.toFixed(2)})\n\n¿Confirmar compra?`)) {
                return;
            }
            
            // 🔄 PROCESAR VENTA Y ACTUALIZAR INVENTARIO
            return fetch('https://pesca-mcl1.onrender.com/php/procesar_venta.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: carrito })
            });
        })
        .then(res => res ? res.json() : null)
        .then(data => {
            if (!data) return;
            
            if (data.error) {
                alert("❌ Error: " + data.error);
                return;
            }
            
            if (data.ok) {
                // ✅ Éxito: vaciar carrito y mostrar confirmación
                alert(`✅ ${data.mensaje}\n\nNúmero de orden: #${data.compra_id}\nTotal: $${parseFloat(data.total).toFixed(2)}`);
                localStorage.removeItem('carrito');
                actualizarBadgeCarrito();
                window.location.href = 'index.html';
            }
        })
        .catch(err => {
            console.error(err);
            alert("❌ Error procesando la compra. Intenta de nuevo.");
        });
}

function actualizarDesdeInput(index, nuevoValor) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let item = carrito[index];
    let cantidad = parseFloat(nuevoValor);
    
    if(isNaN(cantidad) || cantidad < 0.5) {
        alert("Mínimo 0.5 kg");
        cargarCarrito();
        return;
    }
    if(cantidad > item.stock) {
        alert("Máximo: " + item.stock.toFixed(2) + " kg");
        cargarCarrito();
        return;
    }
    
    item.cantidad = cantidad;
    item.subtotal = cantidad * item.precio;
    localStorage.setItem('carrito', JSON.stringify(carrito));
    cargarCarrito();
}

// === BADGE CARRITO (compartido) ===
function actualizarBadgeCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let total = 0;
    for(let i = 0; i < carrito.length; i++) {
        total = total + carrito[i].cantidad;
    }
    let badge = document.getElementById('badgeCarrito');
    if(badge) {
        badge.textContent = total.toFixed(1);
        badge.style.display = total > 0 ? 'flex' : 'none';
    }
}

window.modificarCantidad = modificarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.procederPago = procederPago;
window.actualizarDesdeInput = actualizarDesdeInput;
window.vaciarCarrito = vaciarCarrito;
window.actualizarBadgeCarrito = actualizarBadgeCarrito;