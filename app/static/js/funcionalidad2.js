// ==========================================
// FUNCIONALIDAD 2: LOADER ANIMADO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // Crear loader
    const loader = document.createElement("div");

    loader.id = "page-loader";

    loader.innerHTML = `
        <div class="loader-contenido">

            <div class="loader-cafe">
                <span></span>
                <span></span>
                <span></span>
            </div>

            <p>Cargando...</p>

        </div>
    `;

    // Agregarlo a la página
    document.body.appendChild(loader);

});


// Ocultar cuando la página terminó de cargar
window.addEventListener("load", () => {

    const loader = document.getElementById("page-loader");

    if (loader) {

        setTimeout(() => {

            loader.classList.add("loader-oculto");

            setTimeout(() => {
                loader.remove();
            }, 500);

        }, 700);

    }

});