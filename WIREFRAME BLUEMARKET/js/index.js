
const grid = document.querySelector(".grid");

fetch("http://localhost/pesca/producto.php")
  .then(res => res.json())
  .then(data => {
      renderProductos(data);
  });


function renderProductos(lista){
    grid.innerHTML = "";

    lista.forEach(producto => {

        const card = `
        <div class="card" 
            data-nombre="${producto.nombre}" 
            data-desc="${producto.descripcion}" 
            data-precio="${producto.precio}"
            data-origen="${producto.origen}"
            data-cantidad="${producto.cantidad}"
            data-pescador="${producto.pescador_responsable}"
            data-fecha="${producto.fecha}"
            data-tipo="${producto.tipo_pesca}"
        >

            <div class="image"></div>

            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <div class="price">$${producto.precio}</div>

        </div>
        `;

        grid.insertAdjacentHTML("beforeend", card);
    });
}

const modal = document.getElementById("modal");
const cerrar = document.getElementById("cerrarModal");

const titulo = document.getElementById("modalTitulo");
const descripcion = document.getElementById("modalDescripcion");
const precio = document.getElementById("modalPrecio");
const origen = document.getElementById("modalOrigen");
const cantidad = document.getElementById("modalCantidad");
const pescador = document.getElementById("modalPescador");
const fecha = document.getElementById("modalFecha");
const tipo = document.getElementById("modalTipo");

document.addEventListener("click", function(e){

    const card = e.target.closest(".card");
    
    document.addEventListener("click", function(e){

    const card = e.target.closest(".card");
    if(!card) return;  

    titulo.innerText = card.dataset.nombre;
    descripcion.innerText = card.dataset.desc;
    precio.innerText = "$" + card.dataset.precio;
    origen.innerText = card.dataset.origen;
    cantidad.innerText = card.dataset.cantidad;
    pescador.innerText = card.dataset.pescador;
    fecha.innerText = card.dataset.fecha;
    tipo.innerText = card.dataset.tipo;

    modal.style.display = "block";
});
    
});

cerrar.onclick = () => modal.style.display = "none";

window.onclick = (e) => {
    if(e.target == modal){
        modal.style.display = "none";
    }
};


