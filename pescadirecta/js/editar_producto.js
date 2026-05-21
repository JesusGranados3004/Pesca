const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
    alert("Producto no válido");
    window.location.href = "inventario.html";
}

// =========================
// GUARDAR DATOS ORIGINALES
// =========================
let datosOriginales = {};

// =========================
// CARGAR DATOS PRODUCTO
// =========================
fetchSeguro("https://pesca-mcl1.onrender.com/php/producto.php?origen=obtener_producto&id=" + id)
.then(res => res.json())
.then(data => {

    if (data.error) {
        alert(data.error);
        window.location.href = "inventario.html";
        return;
    }

    // Guardar datos originales para comparar después
    datosOriginales = {
        nombre: data.nombre || "",
        descripcion: data.descripcion || "",
        precio: data.precio || "",
        origen: data.origen || "",
        pescador_responsable: data.pescador_responsable || "",
        cantidad: data.cantidad || "",
        fecha: data.fecha || "",
        tipo_pesca: data.tipo_pesca || "",
        disponibilidad: data.disponibilidad || "1"
    };

    // Llenar formulario
    document.getElementById("producto_id").value = data.id;
    document.getElementById("nombre").value = datosOriginales.nombre;
    document.getElementById("descripcion").value = datosOriginales.descripcion;
    document.getElementById("precio").value = datosOriginales.precio;
    document.getElementById("origen").value = datosOriginales.origen;
    document.getElementById("pescador_responsable").value = datosOriginales.pescador_responsable;
    document.getElementById("cantidad").value = datosOriginales.cantidad;
    document.getElementById("fecha").value = datosOriginales.fecha;
    document.getElementById("tipo_pesca").value = datosOriginales.tipo_pesca;
    document.getElementById("disponibilidad").value = datosOriginales.disponibilidad;

    // Mostrar imagen actual
    const imgActual = document.getElementById("imagenActual");
    if (imgActual && data.imagen) {
        imgActual.src = data.imagen;
        imgActual.style.display = "block";
        imgActual.onerror = function() {
            this.src = "img/default-producto.svg";
        };
    }

})
.catch(err => {
    console.error(err);
    alert("Error cargando producto");
});

// =========================
// GUARDAR CAMBIOS
// =========================
document.getElementById("formEditarProducto")
.addEventListener("submit", function(e){

    e.preventDefault();

    // Obtener valores actuales del formulario
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

    // Verificar si hay cambios
    let hayCambios = false;

    for (let campo in datosOriginales) {
        // Convertir a string para comparar
        const original = String(datosOriginales[campo]).trim();
        const actual = String(datosActuales[campo]).trim();
        
        if (original !== actual) {
            hayCambios = true;
            break;
        }
    }

    // Verificar si subió nueva imagen
    const inputImagen = document.querySelector("input[type='file']");
    if (inputImagen && inputImagen.files.length > 0) {
        hayCambios = true;
    }

    // Si no hay cambios, mostrar mensaje y no enviar
    if (!hayCambios) {
        alert("ℹ️ No se realizó ningún cambio");
        window.location.href = "inventario.html";
        return;
    }

    // Si hay cambios, enviar al servidor
    let formData = new FormData(this);

    fetchSeguro("https://pesca-mcl1.onrender.com/php/producto.php?origen=editar_producto", {
        method: "POST",
        body: formData
    })
    .then(res => res.text())
    .then(respuesta => {

        if (respuesta.trim() === "ok") {
            alert("✅ Producto actualizado");
            window.location.href = "inventario.html";
        } else {
            alert("❌ " + respuesta);
        }

    })
    .catch(err => {
        console.error(err);
        alert("Error actualizando");
    });

});