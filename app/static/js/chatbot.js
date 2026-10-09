// ==========================================
// FUNCIONALIDAD 3: CHATBOT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // Crear botón flotante del chatbot
    const botonChat = document.createElement("button");
    botonChat.id = "btn-chatbot";
    botonChat.innerHTML = "💬";
    botonChat.title = "Abrir asistente";

    document.body.appendChild(botonChat);


    // Crear ventana del chatbot
    const chatbot = document.createElement("div");

    chatbot.id = "chatbot";
    chatbot.classList.add("chatbot-oculto");

    chatbot.innerHTML = `
        <div class="chatbot-header">
            <div>
                <strong>Asistente Río Tambo</strong>
                <p>En línea</p>
            </div>

            <button id="cerrar-chat">✕</button>
        </div>

        <div class="chatbot-mensajes" id="chatbot-mensajes">

            <div class="mensaje bot">
                ¡Hola! 👋 Soy el asistente de Río Tambo.
                ¿En qué puedo ayudarte?
            </div>

        </div>

        <div class="chatbot-opciones">
            <button data-pregunta="productos">☕ Productos</button>
            <button data-pregunta="nosotros">🌿 Nosotros</button>
            <button data-pregunta="contacto">📞 Contacto</button>
            <button data-pregunta="ubicacion">📍 Ubicación</button>
        </div>

        <div class="chatbot-input">
            <input
                type="text"
                id="mensaje-chat"
                placeholder="Escribe tu pregunta..."
                autocomplete="off"
            >

            <button id="enviar-chat">➤</button>
        </div>
    `;

    document.body.appendChild(chatbot);


    // Elementos que vamos a utilizar
    const cerrarChat = document.getElementById("cerrar-chat");
    const enviarChat = document.getElementById("enviar-chat");
    const inputChat = document.getElementById("mensaje-chat");
    const mensajes = document.getElementById("chatbot-mensajes");


    // Abrir chatbot
    botonChat.addEventListener("click", () => {
        chatbot.classList.remove("chatbot-oculto");
        botonChat.style.display = "none";
    });


    // Cerrar chatbot
    cerrarChat.addEventListener("click", () => {
        chatbot.classList.add("chatbot-oculto");
        botonChat.style.display = "block";
    });


    // Respuestas del chatbot
    function obtenerRespuesta(texto) {

        const mensaje = texto.toLowerCase();

        if (
            mensaje.includes("hola") ||
            mensaje.includes("buenos días") ||
            mensaje.includes("buenas tardes")
        ) {
            return "¡Hola! 👋 ¿En qué puedo ayudarte?";
        }

        if (
            mensaje.includes("producto") ||
            mensaje.includes("café") ||
            mensaje.includes("cafe")
        ) {
            return "☕ Contamos con diferentes productos de café. Puedes revisar nuestra sección de productos para conocerlos.";
        }

        if (
            mensaje.includes("nosotros") ||
            mensaje.includes("empresa") ||
            mensaje.includes("quienes")
        ) {
            return "🌿 Río Tambo Ltda es una empresa dedicada a ofrecer productos relacionados con el café.";
        }

        if (
            mensaje.includes("contacto") ||
            mensaje.includes("teléfono") ||
            mensaje.includes("telefono")
        ) {
            return "📞 Puedes comunicarte con nosotros desde la sección de contacto de nuestra página.";
        }

        if (
            mensaje.includes("ubicación") ||
            mensaje.includes("ubicacion") ||
            mensaje.includes("donde")
        ) {
            return "📍 Puedes encontrar nuestra ubicación en la sección de contacto.";
        }

        if (
            mensaje.includes("gracias") ||
            mensaje.includes("muchas gracias")
        ) {
            return "¡De nada! 😊 Estoy aquí para ayudarte.";
        }

        return "🤔 No entendí muy bien tu pregunta. Puedes preguntarme sobre productos, contacto, ubicación o sobre nosotros.";
    }


    // Mostrar mensaje
    function agregarMensaje(texto, tipo) {

        const mensaje = document.createElement("div");

        mensaje.classList.add("mensaje", tipo);
        mensaje.textContent = texto;

        mensajes.appendChild(mensaje);

        // Bajar automáticamente al último mensaje
        mensajes.scrollTop = mensajes.scrollHeight;
    }


    // Enviar mensaje
    function enviarMensaje() {

        const texto = inputChat.value.trim();

        // Evitar mensajes vacíos
        if (texto === "") {
            return;
        }

        // Mostrar mensaje del usuario
        agregarMensaje(texto, "usuario");

        // Limpiar input
        inputChat.value = "";

        // Obtener respuesta
        const respuesta = obtenerRespuesta(texto);

        // Pequeña espera para que parezca conversación
        setTimeout(() => {
            agregarMensaje(respuesta, "bot");
        }, 500);
    }


    // Botón enviar
    enviarChat.addEventListener("click", enviarMensaje);


    // Enviar utilizando Enter
    inputChat.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {
            enviarMensaje();
        }

    });


    // Botones de preguntas rápidas
    const opciones = document.querySelectorAll(
        ".chatbot-opciones button"
    );

    opciones.forEach((boton) => {

        boton.addEventListener("click", () => {

            const pregunta = boton.dataset.pregunta;

            agregarMensaje(boton.textContent, "usuario");

            const respuesta = obtenerRespuesta(pregunta);

            setTimeout(() => {
                agregarMensaje(respuesta, "bot");
            }, 500);

        });

    });

});