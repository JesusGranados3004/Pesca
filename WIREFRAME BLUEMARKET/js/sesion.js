document.addEventListener('DOMContentLoaded', function() {
    fetch('php/verificar_sesion.php')
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
                    <!-- BOTÓN FLOTANTE DEL CARRITO -->
                    <a href="pago.html" id="btnCarrito" style="
                        position: fixed;
                        bottom: 30px;
                        right: 30px;
                        width: 60px;
                        height: 60px;
                        background: #0077b6;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 28px;
                        text-decoration: none;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                        z-index: 1000;
                        transition: transform 0.2s;
                    ">
                        🛒
                        <span id="badgeCarrito" style="
                            position: absolute;
                            top: -5px;
                            right: -5px;
                            background: #e74c3c;
                            color: white;
                            font-size: 12px;
                            font-weight: bold;
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            display: none;
                            align-items: center;
                            justify-content: center;
                        ">0</span>
                    </a>
                `;
            } else {
                menu.innerHTML = `
                    <a href="mis_compras.html">📋 Mis Compras</a>
                    <a href="index.html#productos">🔍 Productos</a>
                    <span style="color: white; padding: 8px 15px;">👤 ${nombre}</span>
                    <a href="#" onclick="cerrarSesion(event)" style="background: rgba(255,255,255,0.2); border-radius: 4px;">🚪 Cerrar Sesión</a>
                    <!-- BOTÓN FLOTANTE DEL CARRITO -->
                    <a href="pago.html" id="btnCarrito" style="
                        position: fixed;
                        bottom: 30px;
                        right: 30px;
                        width: 60px;
                        height: 60px;
                        background: #0077b6;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 28px;
                        text-decoration: none;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                        z-index: 1000;
                        transition: transform 0.2s;
                    ">
                        🛒
                        <span id="badgeCarrito" style="
                            position: absolute;
                            top: -5px;
                            right: -5px;
                            background: #e74c3c;
                            color: white;
                            font-size: 12px;
                            font-weight: bold;
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            display: none;
                            align-items: center;
                            justify-content: center;
                        ">0</span>
                    </a>
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

// === VERIFICAR SESIÓN ===
function mostrarMensajeSesion() {
    let tiempo = 5;

    let mensaje = document.createElement("div");
    mensaje.style.position = "fixed";
    mensaje.style.top = "20px";
    mensaje.style.left = "50%";
    mensaje.style.transform = "translateX(-50%)";
    mensaje.style.background = "#e74c3c";
    mensaje.style.color = "white";
    mensaje.style.padding = "15px 25px";
    mensaje.style.borderRadius = "10px";
    mensaje.style.fontSize = "18px";
    mensaje.style.zIndex = "9999";

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

// === FETCH SEGURO ===
function fetchSeguro(url, opciones = {}) {
    return fetch(url, opciones)
        .then(res => {
            if (res.status === 401) {
                mostrarMensajeSesion();
                // Redirigir inmediatamente para páginas protegidas
                window.location.href = "iniciarSesion.html";
                throw new Error("No autorizado");
            }
            // Devolver respuesta cruda, NO hacer .json()
            return res;
        });
}

// === VERIFICAR SESIÓN DIRECTA ===
function verificarSesion() {
    return fetchSeguro('php/verificar_sesion.php');
}

// === EXPONER GLOBALMENTE ===
window.fetchSeguro = fetchSeguro;
window.verificarSesion = verificarSesion;