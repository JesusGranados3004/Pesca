const params = new URLSearchParams(window.location.search);
const id = params.get("id");

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

    // FORZAR RENDER
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

        }, 300);

    }, 2500);
}

if (!id) {
    mostrarToast("Producto no válido", "error", () => {
        window.location.href = "inventario.html?t=" + Date.now();
    });
}

let datosOriginales = {};
let modoActual = 'correccion';

function cambiarModo(modo) {
    modoActual = modo;
    document.getElementById('modo').value = modo;
    
    const camposCorreccion = document.getElementById('camposCorreccion');
    const labelCantidad = document.getElementById('labelCantidad');
    const hintCantidad = document.getElementById('hintCantidad');
    const requeridoImagen = document.getElementById('requeridoImagen');
    const hintImagen = document.getElementById('hintImagen');
    const inputImagen = document.getElementById('inputImagen');
    const btnGuardar = document.getElementById('btnGuardar');
    const requeridoFecha = document.getElementById('requeridoFecha');
    const fechaInput = document.getElementById('fecha');
    
    if (modo === 'correccion') {
        camposCorreccion.style.display = 'block';
        document.getElementById('nombre').required = true;
        document.getElementById('precio').required = true;
        
        labelCantidad.textContent = 'Cantidad (kg)';
        hintCantidad.textContent = 'Edita la cantidad total disponible';
        
        requeridoImagen.classList.remove('visible');
        inputImagen.required = false;
        hintImagen.textContent = 'Deja vacío para mantener la imagen actual';
        
        btnGuardar.textContent = '💾 Guardar Corrección';
        requeridoFecha.style.display = 'none';
        fechaInput.required = false;

    } else {
        camposCorreccion.style.display = 'none';
        document.getElementById('nombre').required = false;
        document.getElementById('precio').required = false;
        
        labelCantidad.textContent = 'Kilos a agregar';
        hintCantidad.textContent = 'Suma esta cantidad al stock actual. Ej: si tienes 5kg y agregas 3kg, pon 3';
        
        requeridoImagen.classList.add('visible');
        inputImagen.required = true;
        hintImagen.textContent = 'Sube una foto del nuevo producto (obligatorio)';
        
        btnGuardar.textContent = '📦 Agregar Stock';

        requeridoFecha.style.display = 'inline';
        fechaInput.required = true;
    }
}

fetchSeguro("php/producto.php?origen=obtener_producto&id=" + id)
.then(res => res.json())
.then(data => {

    if (data.error) {
        mostrarToast(data.error, "error", () => {
            window.location.href = "inventario.html?t=" + Date.now();
        });
        return;
    }

    datosOriginales = {
        nombre: data.nombre || "",
        descripcion: data.descripcion || "",
        precio: data.precio || "",
        origen: data.origen || "",
        pescador_responsable: data.pescador_responsable || "",
        cantidad: data.cantidad || "",
        fecha: data.fecha || "",
        tipo_pesca: data.tipo_pesca || "",
        disponibilidad: String(data.disponibilidad ?? "1"),
        imagen: data.imagen || ""
    };

    document.getElementById("producto_id").value = data.id;
    document.getElementById("nombre").value = datosOriginales.nombre;
    document.getElementById("descripcion").value = datosOriginales.descripcion;
    document.getElementById("precio").value = datosOriginales.precio;
    document.getElementById("origen").value = datosOriginales.origen;
    document.getElementById("pescador_responsable").value = datosOriginales.pescador_responsable;
    document.getElementById("cantidad").value = datosOriginales.cantidad;
    document.getElementById("fecha").value = datosOriginales.fecha;
    document.getElementById("tipo_pesca").value = datosOriginales.tipo_pesca;
    document.getElementById("disponibilidad").value = String(datosOriginales.disponibilidad);

    const imgActual = document.getElementById("imagenActual");
    if (imgActual && data.imagen) {
        imgActual.src = data.imagen;
        imgActual.onerror = function() {
            this.src = "img/default-producto.svg";
        };
    }

    // ========== VALIDACIÓN: ¿Está agotado? ==========
    const cantidadActual = parseFloat(datosOriginales.cantidad) || 0;
    const disponibleActual = parseInt(datosOriginales.disponibilidad) || 0;
    const estaAgotado = cantidadActual <= 0 || disponibleActual === 0;

    if (!estaAgotado) {
        const radioStock = document.querySelector('input[value="stock"]');
        const labelStock = radioStock.closest('.opcion-modo');
        
        radioStock.disabled = true;
        labelStock.style.opacity = '0.5';
        labelStock.style.cursor = 'not-allowed';
        labelStock.title = 'El producto aún tiene stock. Usa "Corrección" para editar.';
        
        const mensaje = document.createElement('div');
        mensaje.className = 'mensaje-info';
        mensaje.innerHTML = 'ℹ️ Este producto aún tiene stock. Para agregar más kilos, usa el modo <strong>Corrección</strong> y cambia la cantidad.';
        document.querySelector('.selector-modo').appendChild(mensaje);
    }

})
.catch(err => {
    console.error(err);
    mostrarToast("Error cargando producto", "error");
});

document.getElementById("formEditarProducto")
.addEventListener("submit", function(e){

    e.preventDefault();
    

    const modo = document.getElementById('modo').value;
    let formData = new FormData(this);

    if (modo === 'stock') {
        const kilosAgregar = parseFloat(document.getElementById('cantidad').value) || 0;
        const cantidadActual = parseFloat(datosOriginales.cantidad) || 0;
        const nuevaCantidad = cantidadActual + kilosAgregar;
        
        formData.set('cantidad', nuevaCantidad);
        formData.set('nombre', datosOriginales.nombre);
        formData.set('descripcion', datosOriginales.descripcion);
        formData.set('precio', datosOriginales.precio);
        formData.set('origen', datosOriginales.origen);
        formData.set('pescador_responsable', datosOriginales.pescador_responsable);
        formData.set('fecha', document.getElementById('fecha').value);
        formData.set('tipo_pesca', datosOriginales.tipo_pesca);
        formData.set('disponibilidad', '1');
    }

    if (modo === 'correccion') {
        const datosActuales = {
            nombre: document.getElementById("nombre").value.trim(),
            descripcion: document.getElementById("descripcion").value.trim(),
            precio: document.getElementById("precio").value,
            origen: document.getElementById("origen").value.trim(),
            pescador_responsable: document.getElementById("pescador_responsable").value.trim(),
            cantidad: document.getElementById("cantidad").value,
            fecha: document.getElementById("fecha").value,
            tipo_pesca: document.getElementById("tipo_pesca").value.trim(),
            disponibilidad: document.getElementById("disponibilidad").value
        };

        let hayCambios = false;
        for (let campo in datosOriginales) {
            if (campo === 'imagen') continue;
            const original = String(datosOriginales[campo]).trim();
            const actual = String(datosActuales[campo]).trim();
            if (original !== actual) {
                hayCambios = true;
                break;
            }
        }

        const inputImagen = document.getElementById("inputImagen");
        if (inputImagen && inputImagen.files.length > 0) {
            hayCambios = true;
        }

        if (!hayCambios) {
            mostrarToast("No se realizó ningún cambio", "aviso") ;
            return;
        }
    }

    fetchSeguro("php/producto.php?origen=editar_producto", {
        method: "POST",
        body: formData
    })
    .then(res => res.text())
    .then(respuesta => {
        if (respuesta.trim() === "ok") {
            mostrarToast(
                modo === 'stock' ? "Stock agregado correctamente" : "Producto actualizado",
                "exito",
                () => {
                    window.location.href = "inventario.html?t=" + Date.now();
                }
            );
        } else {
            mostrarToast(respuesta, "error");
        }
    })
    .catch(err => {
        console.error(err);
        mostrarToast("Error actualizando", "error");
    });
});