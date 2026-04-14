console.log("✅ sesion.js cargado");

document.addEventListener('DOMContentLoaded', function() {
    
    fetch('php/verificar_sesion.php')
    .then(r => r.json())
    .then(data => {
        console.log("Estado sesión:", data);
        actualizarMenu(data);
    })
    .catch(err => {
        console.log("Error verificando sesión:", err);
        actualizarMenu({logueado: false});
    });

    function actualizarMenu(sesion) {
        const menu = document.querySelector('.menu');
        if (!menu) return;

        menu.innerHTML = '';

        if (sesion.logueado) {
            
            const nombre = sesion.nombre || 'Usuario';
            
            if (sesion.tipo === 'vendedor') {
                menu.innerHTML = `
                    <a href="inventario.html">📦 MI INVENTARIO</a>
                    <a href="pago.html"> TIENDA</a>
                    <span style="color: white; padding: 8px 15px;"> ${nombre}</span>
                    <a href="#" onclick="cerrarSesion(event)" style="background: rgba(255,255,255,0.2); border-radius: 4px;">🚪 Cerrar Sesión</a>
                `;
            } else {
                menu.innerHTML = `
                    <a href="pago.html"> TIENDA</a>
                    <a href="index.html#productos"> Productos</a>
                    <span style="color: white; padding: 8px 15px;"> ${nombre}</span>
                    <a href="#" onclick="cerrarSesion(event)" style="background: rgba(255,255,255,0.2); border-radius: 4px;">🚪 Cerrar Sesión</a>
                `;
            }

        } else {
            menu.innerHTML = `
                <a href="iniciarSesion.html">INICIAR SESIÓN</a>
                <a href="registro.html" class="btn-primario" style="padding: 8px 20px;">REGISTRARSE</a>
            `;
        }
    }
});

function cerrarSesion(e) {
    e.preventDefault();
    
    if (!confirm('¿Cerrar sesión?')) return;
    
    fetch('php/logout.php')
    .then(() => {
        localStorage.clear();
        location.href = 'index.html';
    })
    .catch(() => {
        localStorage.clear();
        location.href = 'index.html';
    });
}