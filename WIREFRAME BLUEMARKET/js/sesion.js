document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión SIN usar caché del navegador
    fetch('php/verificar_sesion.php', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
    })
    .then(r => r.json())
    .then(data => {
        actualizarMenu(data);
    })
    .catch(() => actualizarMenu({logueado: false}));

    function actualizarMenu(sesion) {
        const menu = document.querySelector('.menu');
        if (!menu) return;

        menu.innerHTML = '';

        if (sesion.logueado) {
            const nombre = sesion.nombre || 'Usuario';
            
            if (sesion.tipo === 'vendedor') {
                menu.innerHTML = `
                    <a href="inventario.html">📦 MI INVENTARIO</a>
                    <span style="color: white; padding: 8px 15px;">👤 ${nombre}</span>
                    <a href="#" onclick="cerrarSesion(event)" style="background: rgba(255,255,255,0.2); border-radius: 4px;">🚪 Cerrar Sesión</a>
                `;
            } else {
                menu.innerHTML = `
                    <a href="mis_compras.html">📋 Mis Compras</a>
                    <a href="index.html#productos">🔍 Productos</a>
                    <span style="color: white; padding: 8px 15px;">👤 ${nombre}</span>
                    <a href="#" onclick="cerrarSesion(event)" style="background: rgba(255,255,255,0.2); border-radius: 4px;">🚪 Cerrar Sesión</a>
                `;
                
                const carrito = document.createElement('div');
                carrito.className = 'carrito-flotante';
                carrito.onclick = () => window.location.href = 'pago.html';
                carrito.innerHTML = '🛒 <span class="carrito-badge" id="badgeCarrito">0</span>';
                document.body.appendChild(carrito);
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
    
    fetch('php/logout.php', { cache: 'no-store' })
    .then(() => {
        localStorage.clear();
        // Redirigir con parámetro único para evitar caché
        window.location.href = 'index.html?_=' + new Date().getTime();
    })
    .catch(() => {
        localStorage.clear();
        window.location.href = 'index.html?_=' + new Date().getTime();
    });
}

// === DETECTAR "ATRÁS" DEL NAVEGADOR ===
// Cuando el usuario vuelve con "atrás", verificar sesión de nuevo
window.addEventListener('pageshow', function(event) {
    // event.persisted es true cuando la página viene de caché (botón "atrás")
    if (event.persisted) {
        // Forzar recarga desde el servidor
        window.location.reload();
    }
});

// === FETCH SEGURO ===
function fetchSeguro(url, opciones = {}) {
    // Siempre agregar cache: 'no-store'
    opciones.cache = 'no-store';
    
    return fetch(url, opciones)
        .then(res => {
            if (res.status === 401) {
                mostrarMensajeSesion();
                window.location.href = "iniciarSesion.html";
                throw new Error("No autorizado");
            }
            return res;
        });
}

// === VERIFICAR SESIÓN DIRECTA ===
function verificarSesion() {
    return fetchSeguro('php/verificar_sesion.php');
}

// === MENSAJE DE SESIÓN ===
function mostrarMensajeSesion() {
    let tiempo = 5;
    let mensaje = document.createElement("div");
    mensaje.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#e74c3c;color:white;padding:15px 25px;border-radius:10px;font-size:18px;z-index:9999;";
    document.body.appendChild(mensaje);

    let intervalo = setInterval(() => {
        mensaje.textContent = `🔒 Sesión requerida. Redirigiendo en ${tiempo}...`;
        tiempo--;
        if (tiempo < 0) {
            clearInterval(intervalo);
            window.location.href = "iniciarSesion.html";
        }
    }, 1000);
}

// === EXPONER GLOBALMENTE ===
window.fetchSeguro = fetchSeguro;
window.verificarSesion = verificarSesion;
window.cerrarSesion = cerrarSesion;