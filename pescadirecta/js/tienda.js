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
                <div class="alerta-stock" id="alerta-${index}"><i class="fas fa-exclamation-triangle"></i> Excede stock disponible</div>
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
            <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})"><i class="fas fa-trash-alt"></i></button>
        `;
        contenedor.appendChild(div);

        if (item.cantidad > item.stock) {
            document.getElementById(`alerta-${index}`).classList.add('visible');
            hayErrorStock = true;
        }
    });

    actualizarResumen(total, hayErrorStock);
}

function actualizarResumen(total, hayErrorStock) {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    

    let subtotal = 0;
    carrito.forEach(item => {
        subtotal += item.subtotal;
    });
    
    const envio = subtotal > 50 ? 0 : 5;
    const envioTexto = envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`;
    const totalFinal = subtotal + envio;
    
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

    const nuevaCantidad = parseFloat(
        (item.cantidad + delta).toFixed(2)
    );

    if (nuevaCantidad < 0.5) {

        mostrarToast(
            "<i class=\"fas fa-exclamation-triangle\"></i> La cantidad mínima es 0.5 kg",
            "aviso"
        );

        return;
    }

    if (nuevaCantidad > item.stock) {

        mostrarToast(
            `<i class="fas fa-exclamation-triangle"></i> Máximo disponible: ${item.stock.toFixed(2)} kg`,
            "aviso"
        );

        return;
    }

    item.cantidad = nuevaCantidad;

    item.subtotal = nuevaCantidad * item.precio;

    localStorage.setItem(
        'carrito',
        JSON.stringify(carrito)
    );

    mostrarToast(
        "<i class=\"fas fa-check-circle\"></i> Cantidad actualizada",
        "exito",
        1200
    );

    cargarCarrito();
}

function eliminarDelCarrito(index) {

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const producto = carrito[index];

    carrito.splice(index, 1);

    localStorage.setItem(
        'carrito',
        JSON.stringify(carrito)
    );

    mostrarToast(
        `<i class="fas fa-trash-alt"></i> ${producto.nombre} eliminado del carrito`,
        "info"
    );

    cargarCarrito();

    actualizarBadgeCarrito();
}

function vaciarCarrito() {

    localStorage.setItem(
        'carrito',
        JSON.stringify([])
    );

    mostrarToast(
        "<i class=\"fas fa-shopping-cart\"></i> Carrito vaciado correctamente",
        "info"
    );

    cargarCarrito();

    actualizarBadgeCarrito();
}

function procederPago() {

    const carrito = JSON.parse(
        localStorage.getItem('carrito')
    ) || [];

    let errores = [];

    carrito.forEach(item => {

        if (item.cantidad > item.stock) {

            errores.push(
                `${item.nombre}: disponible ${item.stock.toFixed(2)} kg`
            );

        }

    });

    if (errores.length > 0) {

        mostrarToast(
            "<i class=\"fas fa-times-circle\"></i> Algunos productos superan el stock",
            "error",
            3500
        );

        return;
    }

    if (carrito.length === 0) {

        mostrarToast(
            "<i class=\"fas fa-shopping-cart\"></i> Tu carrito está vacío",
            "aviso"
        );

        return;
    }

    fetch('https://pesca-mcl1.onrender.com/php/verificar_sesion.php')

        .then(r => r.json())

        .then(sesion => {

            if (!sesion.logueado) {

                window.location.href = "index.html?_=" + Date.now();

                return;
            }

            let subtotal = carrito.reduce(
                (sum, item) => sum + item.subtotal,
                0
            );

            const envio = subtotal > 50 ? 0 : 5;

            const totalFinal = subtotal + envio;

            abrirModalPago(totalFinal);

        })

        .catch(err => {

            console.error(err);

            mostrarToast(
                "<i class=\"fas fa-times-circle\"></i> Error verificando sesión",
                "error"
            );

        });
}

let totalPagoFinal = 0;

function abrirModalPago(totalFinal) {
    totalPagoFinal = totalFinal;
    const modal = document.getElementById('modalPago');
    const modalTotal = document.getElementById('modalTotalPago');
    const status = document.getElementById('pagoStatus');
    const form = document.getElementById('formPago');
    const btn = document.getElementById('btnConfirmarPago');

    if (!modal || !modalTotal || !status || !form || !btn) {
        console.warn('Modal de pago no encontrado.');
        return;
    }

    modalTotal.textContent = `$${totalPagoFinal.toFixed(2)}`;
    status.textContent = `Total a pagar: $${totalPagoFinal.toFixed(2)}`;
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Pagar ahora';
    form.reset();
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function cerrarModalPago() {
    const modal = document.getElementById('modalPago');
    const form = document.getElementById('formPago');
    if (!modal) return;
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (form) form.reset();
}

function validarTarjeta(numero, expiracion, cvv) {
    const sanitized = numero.replace(/\s+/g, '');
    const regexNumero = /^\d{16}$/;
    const regexExp = /^(0[1-9]|1[0-2])\/(\d{2})$/;
    const regexCvv = /^\d{3,4}$/;
    return regexNumero.test(sanitized) && regexExp.test(expiracion) && regexCvv.test(cvv);
}

function enviarPago(event) {
    event.preventDefault();

    const nombre = document.getElementById('tarjetaNombre').value.trim();
    const numero = document.getElementById('tarjetaNumero').value.trim();
    const expiracion = document.getElementById('tarjetaExpiracion').value.trim();
    const cvv = document.getElementById('tarjetaCvv').value.trim();
    const btn = document.getElementById('btnConfirmarPago');
    const status = document.getElementById('pagoStatus');

    if (!nombre || !numero || !expiracion || !cvv) {
        mostrarToast(
            'Por favor completa todos los campos de pago.',
            'aviso'
        );
        return;
    }

    if (!validarTarjeta(numero, expiracion, cvv)) {
        mostrarToast(
            'Datos de tarjeta inválidos. Revisa el número, expiración y CVV.',
            'aviso'
        );
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando al banco...';
    status.textContent = 'Simulando petición al banco...';

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length === 0) {
        mostrarToast('El carrito está vacío.', 'aviso');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Pagar ahora';
        status.textContent = `Total a pagar: $${totalPagoFinal.toFixed(2)}`;
        return;
    }

    setTimeout(() => {
        status.textContent = 'Procesando la compra en el servidor...';

        fetch('https://pesca-mcl1.onrender.com/php/procesar_venta.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items: carrito })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }

            cerrarModalPago();
            mostrarToast(
                `<i class="fas fa-check-circle"></i> Pago exitoso de $${totalPagoFinal.toFixed(2)}`,
                'exito',
                3500,
                () => {
                    localStorage.removeItem('carrito');
                    actualizarBadgeCarrito();
                    cargarCarrito();
                }
            );
        })
        .catch(err => {
            console.error(err);
            status.textContent = 'Error en el pago. Intenta nuevamente.';
            mostrarToast(
                '<i class="fas fa-times-circle"></i> No se pudo procesar la compra: ' + err.message,
                'error',
                4000
            );
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Pagar ahora';
        });
    }, 5000);
}

function actualizarDesdeInput(index, nuevoValor) {

    let carrito = JSON.parse(
        localStorage.getItem('carrito')
    ) || [];

    let item = carrito[index];

    let cantidad = parseFloat(nuevoValor);

    if (isNaN(cantidad) || cantidad < 0.5) {

        mostrarToast(
            "<i class=\"fas fa-exclamation-triangle\"></i> Mínimo permitido: 0.5 kg",
            "aviso"
        );

        cargarCarrito();

        return;
    }

    if (cantidad > item.stock) {

        mostrarToast(
            `<i class="fas fa-exclamation-triangle"></i> Máximo disponible: ${item.stock.toFixed(2)} kg`,
            "aviso"
        );

        cargarCarrito();

        return;
    }

    item.cantidad = cantidad;

    item.subtotal = cantidad * item.precio;

    localStorage.setItem(
        'carrito',
        JSON.stringify(carrito)
    );

    mostrarToast(
        "<i class=\"fas fa-check-circle\"></i> Cantidad actualizada",
        "exito",
        1200
    );

    cargarCarrito();
}

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

function mostrarToast(
    mensaje,
    tipo = 'info',
    duracion = 3000,
    onComplete = null
) {

    const iconos = {
        error: '<i class="fas fa-times-circle"></i>',
        exito: '<i class="fas fa-check-circle"></i>',
        aviso: '<i class="fas fa-exclamation-triangle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    };

    let container =
        document.getElementById('toast-container');

    if (!container) {

        container = document.createElement('div');

        container.id = 'toast-container';

        document.body.appendChild(container);
    }

    const toast = document.createElement('div');

    toast.className = `toast ${tipo}`;

    toast.innerHTML = `
        <span class="toast-icon">
            ${iconos[tipo] || iconos.info}
        </span>

        <span>${mensaje}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('mostrar');
    });

    setTimeout(() => {

        toast.classList.remove('mostrar');

        toast.classList.add('ocultar');

        setTimeout(() => {

            toast.remove();

            if (typeof onComplete === 'function') {
                onComplete();
            }

        }, 400);

    }, duracion);
}

window.modificarCantidad = modificarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.procederPago = procederPago;
window.actualizarDesdeInput = actualizarDesdeInput;
window.vaciarCarrito = vaciarCarrito;
window.actualizarBadgeCarrito = actualizarBadgeCarrito;