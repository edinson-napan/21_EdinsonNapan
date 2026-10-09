// ==========================================
// FUNCIONALIDAD 1: MODO OSCURO / CLARO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // Crear botón
    const botonTema = document.createElement("button");

    botonTema.id = "btn-tema";
    botonTema.innerHTML = "🌙";
    botonTema.title = "Cambiar modo oscuro/claro";


    // ==========================================
    // COLOCAR BOTÓN AL LADO DE LA BANDERA
    // ==========================================

    const espacioTema = document.getElementById("theme-button-slot");

    if (espacioTema) {

        espacioTema.appendChild(botonTema);

    } else {

        // Si no encuentra la bandera
        document.body.appendChild(botonTema);

    }


    // ==========================================
    // RECUPERAR TEMA GUARDADO
    // ==========================================

    const temaGuardado = localStorage.getItem("tema");

    if (temaGuardado === "oscuro") {

        document.body.classList.add("modo-oscuro");

        botonTema.innerHTML = "☀️";
    }


    // ==========================================
    // CAMBIAR TEMA
    // ==========================================

    botonTema.addEventListener("click", () => {

        document.body.classList.toggle("modo-oscuro");

        if (
            document.body.classList.contains("modo-oscuro")
        ) {

            botonTema.innerHTML = "☀️";

            localStorage.setItem(
                "tema",
                "oscuro"
            );

        } else {

            botonTema.innerHTML = "🌙";

            localStorage.setItem(
                "tema",
                "claro"
            );
        }

    });

});