
(() => {
    const cartCount = document.getElementById("cart-count");
    const cartLink = cartCount?.closest("a");

    const movimientoReducido = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    // ==========================================
    // CONTADOR DEL CARRITO
    // ==========================================

    function actualizarContador(cantidad) {
        if (!cartCount) return;

        const total = Math.max(0, Number(cantidad) || 0);

        cartCount.textContent = total;

        if (total > 0) {
            cartCount.classList.remove("hidden");
            cartCount.classList.add("flex");
        } else {
            cartCount.classList.add("hidden");
            cartCount.classList.remove("flex");
        }
    }

    // ==========================================
    // PETICIONES AL SERVIDOR
    // ==========================================

    async function postJSON(url, data = {}) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
            throw new Error(
                result.mensaje || "No se pudo actualizar el carrito."
            );
        }

        return result;
    }

    async function cargarCantidad() {
        try {
            const response = await fetch("/carrito/cantidad");
            const result = await response.json();

            if (!response.ok) {
                throw new Error("No se pudo consultar el carrito.");
            }

            actualizarContador(result.cantidad);
        } catch (error) {
            console.error(
                "No se pudo cargar la cantidad del carrito:",
                error
            );
        }
    }

    // ==========================================
    // ANIMACIÓN: BOLITA QUE VUELA AL CARRITO
    // ==========================================

    function animarBolita(origen) {
        return new Promise((resolve) => {
            if (
                movimientoReducido.matches ||
                typeof Element.prototype.animate !== "function" ||
                !origen ||
                !cartLink
            ) {
                resolve();
                return;
            }

            const inicio = origen.getBoundingClientRect();
            const destino = cartLink.getBoundingClientRect();

            const inicioX = inicio.left + inicio.width / 2;
            const inicioY = inicio.top + inicio.height / 2;

            const destinoX = destino.left + destino.width / 2;
            const destinoY = destino.top + destino.height / 2;

            const bolita = document.createElement("span");

            bolita.className = "cart-flying-dot";
            bolita.setAttribute("aria-hidden", "true");

            bolita.style.left = `${inicioX - 10}px`;
            bolita.style.top = `${inicioY - 10}px`;

            document.body.appendChild(bolita);

            const animacion = bolita.animate(
                [
                    {
                        left: `${inicioX - 10}px`,
                        top: `${inicioY - 10}px`,
                        transform: "scale(1)",
                        opacity: 1
                    },
                    {
                        left: `${inicioX + (destinoX - inicioX) * 0.45 - 10}px`,
                        top: `${inicioY + (destinoY - inicioY) * 0.35 - 10}px`,
                        transform: "scale(0.85)",
                        opacity: 1,
                        offset: 0.45
                    },
                    {
                        left: `${destinoX - 4}px`,
                        top: `${destinoY - 4}px`,
                        transform: "scale(0.15)",
                        opacity: 0.2
                    }
                ],
                {
                    duration: 680,
                    easing: "cubic-bezier(0.45, 0, 0.2, 1)",
                    fill: "forwards"
                }
            );

            animacion.onfinish = () => {
                bolita.remove();

                // Pequeño rebote del contador al recibir la bolita.
                if (cartCount && !cartCount.classList.contains("hidden")) {
                    cartCount.classList.remove("cart-count-pop");

                    // Reinicia la animación sin modificar el contador.
                    void cartCount.offsetWidth;

                    cartCount.classList.add("cart-count-pop");
                }

                resolve();
            };

            animacion.oncancel = () => {
                bolita.remove();
                resolve();
            };
        });
    }

    // ==========================================
    // MENSAJE DE CONFIRMACIÓN
    // ==========================================

    function mostrarMensaje(mensaje) {
        const anterior = document.getElementById("cart-toast");

        if (anterior) {
            anterior.remove();
        }

        const toast = document.createElement("div");

        toast.id = "cart-toast";
        toast.className =
            "fixed bottom-6 right-6 z-[100] " +
            "bg-[#2f1f12] text-white px-5 py-3 " +
            "rounded-xl shadow-lg text-sm font-bold " +
            "cart-toast-enter";

        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.textContent = mensaje;

        document.body.appendChild(toast);

        const tiempoVisible = 2400;

        setTimeout(() => {
            if (!toast.isConnected) return;

            toast.classList.remove("cart-toast-enter");
            toast.classList.add("cart-toast-exit");

            setTimeout(() => {
                toast.remove();
            }, 300);
        }, tiempoVisible);
    }

    // ==========================================
    // EVENTOS DEL CARRITO
    // ==========================================

    document.addEventListener("click", async (event) => {
        const agregar = event.target.closest(".js-agregar-carrito");

        if (agregar) {
            // Evita peticiones duplicadas mientras se procesa el clic.
            if (agregar.disabled) return;

            agregar.disabled = true;

            // La bolita empieza a moverse inmediatamente.
            const vuelo = animarBolita(agregar);

            try {
                const result = await postJSON("/carrito/agregar", {
                    producto_id: agregar.dataset.productoId
                });

                // Esperamos a que la bolita llegue al navbar.
                await vuelo;

                // El servidor determina la cantidad real.
                actualizarContador(result.cantidad_total);

                // Conservamos el mensaje de confirmación existente.
                mostrarMensaje(result.mensaje);
            } catch (error) {
                await vuelo;
                mostrarMensaje(error.message);
            } finally {
                agregar.disabled = false;
            }

            return;
        }

        // Aumentar o reducir la cantidad de un producto.
        const cantidad = event.target.closest(".js-cantidad");

        if (cantidad) {
            const productoId = cantidad.dataset.productoId;
            const cambio = Number(cantidad.dataset.cambio);

            const actual = Number(
                cantidad.parentElement.querySelector("span").textContent
            );

            try {
                const result = await postJSON("/carrito/actualizar", {
                    producto_id: productoId,
                    cantidad: actual + cambio
                });

                actualizarContador(result.cantidad_total);
                window.location.reload();
            } catch (error) {
                mostrarMensaje(error.message);
            }

            return;
        }

        // Eliminar un producto.
        const eliminar = event.target.closest(".js-eliminar");

        if (eliminar) {
            try {
                const result = await postJSON("/carrito/eliminar", {
                    producto_id: eliminar.dataset.productoId
                });

                actualizarContador(result.cantidad_total);
                window.location.reload();
            } catch (error) {
                mostrarMensaje(error.message);
            }

            return;
        }

        // Vaciar el carrito.
        const vaciar = event.target.closest(".js-vaciar");

        if (vaciar) {
            try {
                const result = await postJSON("/carrito/vaciar");

                actualizarContador(result.cantidad_total);
                window.location.reload();
            } catch (error) {
                mostrarMensaje(error.message);
            }
        }
    });

    // Cargar el contador inicial al abrir la página.
    cargarCantidad();
})();
