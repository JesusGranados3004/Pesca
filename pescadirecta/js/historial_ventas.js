document.addEventListener('DOMContentLoaded', () => {

    verificarSesion()
        .then(res => res.json())
        .then(sesion => {

            // SOLO vendedores
            if (!sesion.logueado || sesion.tipo !== 'vendedor') {

                mostrarToast(
                    "⛔ Acceso solo para vendedores",
                    "error",
                    () => {
                        window.location.href = "index.html";
                    }
                );

                return;
            }

            cargarHistorial();

        })
        .catch(() => {

            mostrarToast(
                "❌ Error verificando sesión",
                "error",
                () => {
                    window.location.href = "iniciarSesion.html";
                }
            );

        });

});

function mostrarToast(mensaje, tipo = 'info', onComplete = null) {

    const iconos = {
        error: '❌',
        exito: '✅',
        aviso: '⚠️',
        info: 'ℹ️'
    };

    let container = document.getElementById('toast-container');

    if (!container) {

        container = document.createElement('div');
        container.id = 'toast-container';

        document.body.appendChild(container);
    }

    const toast = document.createElement('div');

    toast.className = `toast ${tipo}`;

    toast.innerHTML = `
        <span class="toast-icon">${iconos[tipo] || iconos.info}</span>
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

    }, 3000);
}

function cargarHistorial() {

    fetchSeguro('php/historial_ventas.php')

        .then(res => res.json())

        .then(data => {

            renderVentas(data);

        })

        .catch(err => {

            console.error(err);

            mostrarToast(
                "Error cargando historial",
                "error"
            );

        });

}

function renderVentas(ventas) {

    const tbody = document.querySelector('#tablaVentas tbody');

    tbody.innerHTML = '';

    if (ventas.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No tienes ventas todavía
                </td>
            </tr>
        `;

        mostrarToast(
            "Todavía no tienes ventas registradas",
            "aviso"
        );

        return;
    }

    ventas.forEach(v => {

        const fila = `
            <tr>
                <td>${v.producto}</td>
                <td>${v.cliente}</td>
                <td>${parseFloat(v.cantidad).toFixed(2)} kg</td>
                <td>$${parseFloat(v.total).toFixed(2)}</td>
                <td>${v.fecha}</td>
            </tr>
        `;

        tbody.insertAdjacentHTML('beforeend', fila);

    });

}