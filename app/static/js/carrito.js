(() => {
    const cartCount = document.getElementById("cart-count");

    function actualizarContador(cantidad) {
        if (!cartCount) return;

        cartCount.textContent = cantidad;

        if (cantidad > 0) {
            cartCount.classList.remove("hidden");
            cartCount.classList.add("flex");
        } else {
            cartCount.classList.add("hidden");
            cartCount.classList.remove("flex");
        }
    }

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
            throw new Error(result.mensaje || "No se pudo actualizar el carrito.");
        }

        return result;
    }

    async function cargarCantidad() {
        try {
            const response = await fetch("/carrito/cantidad");
            const result = await response.json();
            actualizarContador(result.cantidad);
        } catch (error) {
            console.error("No se pudo cargar la cantidad del carrito:", error);
        }
    }

    function mostrarMensaje(mensaje) {
        const existente = document.getElementById("cart-toast");
        if (existente) existente.remove();

        const toast = document.createElement("div");
        toast.id = "cart-toast";
        toast.className =
            "fixed bottom-6 right-6 z-[100] bg-[#2f1f12] text-white " +
            "px-5 py-3 rounded-xl shadow-lg text-sm font-bold transition-opacity";

        toast.textContent = mensaje;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("opacity-0");
            setTimeout(() => toast.remove(), 250);
        }, 2200);
    }

    document.addEventListener("click", async (event) => {
        const agregar = event.target.closest(".js-agregar-carrito");

        if (agregar) {
            agregar.disabled = true;

            try {
                const result = await postJSON("/carrito/agregar", {
                    producto_id: agregar.dataset.productoId
                });

                actualizarContador(result.cantidad_total);
                mostrarMensaje(result.mensaje);
            } catch (error) {
                mostrarMensaje(error.message);
            } finally {
                agregar.disabled = false;
            }

            return;
        }

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

    cargarCantidad();
})();
