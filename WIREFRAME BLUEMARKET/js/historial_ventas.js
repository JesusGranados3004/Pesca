document.addEventListener('DOMContentLoaded', () => {

    verificarSesion()
        .then(res => res.json())
        .then(sesion => {

            // SOLO vendedores
            if (!sesion.logueado || sesion.tipo !== 'vendedor') {

                alert("⛔ Acceso solo para vendedores");

                window.location.href = "iniciarSesion.html";

                return;
            }

            cargarHistorial();

        })
        .catch(() => {

            alert("❌ Error verificando sesión");

            window.location.href = "iniciarSesion.html";

        });

});

function cargarHistorial() {

    fetchSeguro('php/historial_ventas.php')

        .then(res => res.json())

        .then(data => {

            renderVentas(data);

        })

        .catch(err => {

            console.error(err);

            alert("Error cargando historial");

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