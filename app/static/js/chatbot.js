

document.addEventListener("DOMContentLoaded", () => {
    const idioma = (document.documentElement.lang || "es")
        .toLowerCase()
        .startsWith("en") ? "en" : "es";

    const textos = {
        es: {
            abrir: "Abrir asistente",
            titulo: "Asistente Río Tambo",
            estado: "En línea",
            saludo: "¡Hola! 👋 Soy el asistente de Río Tambo. ¿En qué puedo ayudarte?",
            productos: "☕ Productos",
            nosotros: "🌿 Nosotros",
            contacto: "📞 Contacto",
            ubicacion: "📍 Ubicación",
            placeholder: "Escribe tu pregunta...",
            saludoRespuesta: "¡Hola! 👋 ¿En qué puedo ayudarte?",
            productosRespuesta: "☕ Contamos con diferentes productos de café. Puedes revisar nuestra sección de productos para conocerlos.",
            nosotrosRespuesta: "🌿 Río Tambo Ltda. es una cooperativa dedicada a la producción y comercialización de café y al desarrollo de sus comunidades.",
            contactoRespuesta: "📞 Puedes comunicarte con nosotros desde la sección de contacto de nuestra página.",
            ubicacionRespuesta: "📍 Puedes encontrar nuestra ubicación en la sección de contacto.",
            graciasRespuesta: "¡De nada! 😊 Estoy aquí para ayudarte.",
            desconocido: "🤔 No entendí muy bien tu pregunta. Puedes preguntarme sobre productos, contacto, ubicación o sobre nosotros."
        },
        en: {
            abrir: "Open assistant",
            titulo: "Río Tambo Assistant",
            estado: "Online",
            saludo: "Hello! 👋 I'm the Río Tambo assistant. How can I help you?",
            productos: "☕ Products",
            nosotros: "🌿 About us",
            contacto: "📞 Contact",
            ubicacion: "📍 Location",
            placeholder: "Type your question...",
            saludoRespuesta: "Hello! 👋 How can I help you?",
            productosRespuesta: "☕ We offer a variety of coffee products. Visit our Products section to learn more.",
            nosotrosRespuesta: "🌿 Río Tambo Ltda. is a cooperative dedicated to coffee production and marketing and to the development of its communities.",
            contactoRespuesta: "📞 You can contact us through the Contact section of our website.",
            ubicacionRespuesta: "📍 You can find our location in the Contact section.",
            graciasRespuesta: "You're welcome! 😊 I'm here to help.",
            desconocido: "🤔 I'm not sure I understood. You can ask me about our products, contact details, location, or the cooperative."
        }
    }[idioma];

    const botonChat = document.createElement("button");
    botonChat.id = "btn-chatbot";
    botonChat.type = "button";
    botonChat.textContent = "💬";
    botonChat.title = textos.abrir;
    botonChat.setAttribute("aria-label", textos.abrir);

    document.body.appendChild(botonChat);



    const chatbot = document.createElement("div");

    chatbot.id = "chatbot";
    chatbot.classList.add("chatbot-oculto");

    chatbot.innerHTML = `
        <div class="chatbot-header">
            <div>
                <strong></strong>
                <p></p>
            </div>
            <button id="cerrar-chat" type="button" aria-label="${idioma === "en" ? "Close assistant" : "Cerrar asistente"}">✕</button>
        </div>

        <div class="chatbot-mensajes" id="chatbot-mensajes"></div>

        <div class="chatbot-opciones">
            <button type="button" data-pregunta="productos"></button>
            <button type="button" data-pregunta="nosotros"></button>
            <button type="button" data-pregunta="contacto"></button>
            <button type="button" data-pregunta="ubicacion"></button>
        </div>

        <div class="chatbot-input">
            <input type="text" id="mensaje-chat"
                   autocomplete="off">
            <button id="enviar-chat" type="button"
                    aria-label="${idioma === "en" ? "Send message" : "Enviar mensaje"}">➤</button>
        </div>
    `;

    document.body.appendChild(chatbot);

    const cerrarChat = chatbot.querySelector("#cerrar-chat");
    const enviarChat = chatbot.querySelector("#enviar-chat");
    const inputChat = chatbot.querySelector("#mensaje-chat");
    const mensajes = chatbot.querySelector("#chatbot-mensajes");
    const encabezado = chatbot.querySelector(".chatbot-header strong");
    const estado = chatbot.querySelector(".chatbot-header p");

    encabezado.textContent = textos.titulo;
    estado.textContent = textos.estado;
    inputChat.placeholder = textos.placeholder;

    const opcionesTexto = {
        productos: textos.productos,
        nosotros: textos.nosotros,
        contacto: textos.contacto,
        ubicacion: textos.ubicacion
    };

    chatbot.querySelectorAll(".chatbot-opciones button").forEach((boton) => {
        boton.textContent = opcionesTexto[boton.dataset.pregunta];
    });

    function agregarMensaje(texto, tipo) {

        const mensaje = document.createElement("div");

        mensaje.classList.add("mensaje", tipo);
        mensaje.textContent = texto;

        mensajes.appendChild(mensaje);


        mensajes.scrollTop = mensajes.scrollHeight;
    }

    agregarMensaje(textos.saludo, "bot");

    function obtenerRespuesta(texto) {
        const mensaje = texto
            .toLocaleLowerCase(idioma === "en" ? "en" : "es")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const contiene = (...palabras) =>
            palabras.some((palabra) => mensaje.includes(palabra));

        if (contiene("hola", "hello", "hi", "buenos dias", "buenas tardes", "good morning", "good afternoon")) {
            return textos.saludoRespuesta;
        }

        if (contiene("producto", "productos", "product", "products", "cafe", "coffee")) {
            return textos.productosRespuesta;
        }

        if (contiene("nosotros", "empresa", "cooperativa", "about us", "about the company", "who are you", "who we are")) {
            return textos.nosotrosRespuesta;
        }

        if (contiene("contacto", "contact", "telefono", "phone", "email", "correo", "number")) {
            return textos.contactoRespuesta;
        }

        if (contiene("ubicacion", "donde", "direccion", "location", "where", "address", "find you")) {
            return textos.ubicacionRespuesta;
        }

        if (contiene("gracias", "thank you", "thanks", "thank")) {
            return textos.graciasRespuesta;
        }

        return textos.desconocido;
    }

    function enviarMensaje() {

        const texto = inputChat.value.trim();

        if (!texto) {
            return;
        }


        agregarMensaje(texto, "usuario");


        inputChat.value = "";


        const respuesta = obtenerRespuesta(texto);

        window.setTimeout(() => {
            agregarMensaje(respuesta, "bot");
        }, 300);
    }

    botonChat.addEventListener("click", () => {
        chatbot.classList.remove("chatbot-oculto");
        botonChat.style.display = "none";
        inputChat.focus();
    });

    cerrarChat.addEventListener("click", () => {
        chatbot.classList.add("chatbot-oculto");
        botonChat.style.display = "block";
        botonChat.focus();
    });

    enviarChat.addEventListener("click", enviarMensaje);



    inputChat.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {
            enviarMensaje();
        }

    });

    chatbot.querySelectorAll(".chatbot-opciones button").forEach((boton) => {
        boton.addEventListener("click", () => {

            const pregunta = boton.dataset.pregunta;

            agregarMensaje(boton.textContent, "usuario");

            window.setTimeout(() => {
                agregarMensaje(obtenerRespuesta(pregunta), "bot");
            }, 300);
        });

    });

});