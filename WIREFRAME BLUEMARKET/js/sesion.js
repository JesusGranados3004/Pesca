console.log("✅ sesion.js cargado");

document.addEventListener('DOMContentLoaded', function() {
    
    fetch('php/verificar_sesion.php')
    .then(r => r.json())
    .then(data => {
        console.log("Estado sesión:", data);
        actualizarMenu(data);
        
        // Si es vendedor en index.html, mostrar botón de panel
        // if (data.logueado && data.tipo === 'vendedor') {
        //     mostrarBotonVendedor(data.nombre);
        // }
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
                // Menú para vendedores
                menu.innerHTML = `
                    <a href="inventario.html">📦 MI INVENTARIO</a>
                    <a href="pago.html">🛒 TIENDA</a>
                    <span style="color: white; padding: 8px 15px;">👤 ${nombre}</span>
                    <a href="#" onclick="cerrarSesion(event)" style="background: rgba(255,255,255,0.2); border-radius: 4px;">🚪 Cerrar Sesión</a>
                `;
            } else {
                // Menú para consumidores
                menu.innerHTML = `
                    <a href="pago.html">🛒 TIENDA</a>
                    <a href="index.html#productos">🔍 Productos</a>
                    <span style="color: white; padding: 8px 15px;">👤 ${nombre}</span>
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

// function mostrarBotonVendedor(nombre) {
//     Si estamos en index.html, mostrar banner de vendedor
//     const hero = document.querySelector('.hero-text');
//     if (hero && !document.getElementById('bannerVendedor')) {
//         const banner = document.createElement('div');
//         banner.id = 'bannerVendedor';
//         banner.innerHTML = `
//             <div style="background: #e8f5e9; border-left: 4px solid #27ae60; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
//                 <p style="margin: 0; color: #2e7d32; font-weight: 600;">
//                     👋 ¡Hola ${nombre}! Bienvenido a tu panel de vendedor
//                 </p>
//                 <div style="margin-top: 10px;">
//                     <a href="inventario_vendedor.html" style="background: #27ae60; color: white; padding: 8px 20px; border-radius: 6px; text-decoration: none; display: inline-block; margin-right: 10px;">
//                         📦 Ir a Mi Inventario
//                     </a>
//                     <a href="inventario.html" style="background: #0077b6; color: white; padding: 8px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">
//                         ➕ Agregar Producto
//                     </a>
//                 </div>
//             </div>
//         `;
//         hero.insertBefore(banner, hero.firstChild);
//     }
// }

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