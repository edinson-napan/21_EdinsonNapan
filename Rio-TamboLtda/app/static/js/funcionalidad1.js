// ==========================================
// FUNCIONALIDAD 1: MODO OSCURO / CLARO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // Crear botón
    const botonTema = document.createElement("button");

    botonTema.id = "btn-tema";
    botonTema.innerHTML = "🌙";
    botonTema.title = "Cambiar modo oscuro/claro";

    // Agregar botón a la página
    document.body.appendChild(botonTema);

    // Recuperar el tema guardado
    const temaGuardado = localStorage.getItem("tema");

    if (temaGuardado === "oscuro") {
        document.body.classList.add("modo-oscuro");
        botonTema.innerHTML = "☀️";
    }

    // Cambiar tema al hacer clic
    botonTema.addEventListener("click", () => {

        document.body.classList.toggle("modo-oscuro");

        if (document.body.classList.contains("modo-oscuro")) {

            botonTema.innerHTML = "☀️";
            localStorage.setItem("tema", "oscuro");

        } else {

            botonTema.innerHTML = "🌙";
            localStorage.setItem("tema", "claro");

        }

    });

});