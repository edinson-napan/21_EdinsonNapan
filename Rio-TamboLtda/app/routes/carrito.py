from flask import Blueprint, jsonify, render_template, request, session

carrito_bp = Blueprint("carrito", __name__)

# Catálogo mínimo del carrito.
PRODUCTOS = {
    "cafe-verde": {
        "nombre": "Café Verde",
        "imagen": "img/cafe-verde.jpg",
    },
    "cafe-pergamino": {
        "nombre": "Café Pergamino",
        "imagen": "img/cafe-pergamino.jpg",
    },
}


def _obtener_carrito():
    return session.get("carrito", {})


def _cantidad_total(carrito):
    return sum(item["cantidad"] for item in carrito.values())


@carrito_bp.get("/carrito")
def ver_carrito():
    carrito = _obtener_carrito()
    return render_template(
        "carrito/index.html",
        carrito=carrito,
        cantidad_total=_cantidad_total(carrito),
    )


@carrito_bp.get("/carrito/cantidad")
def cantidad_carrito():
    return jsonify({"cantidad": _cantidad_total(_obtener_carrito())})


@carrito_bp.post("/carrito/agregar")
def agregar_al_carrito():
    data = request.get_json(silent=True) or {}
    producto_id = str(data.get("producto_id", "")).strip()

    if producto_id not in PRODUCTOS:
        return jsonify({"ok": False, "mensaje": "Producto no encontrado."}), 404

    carrito = _obtener_carrito()

    if producto_id in carrito:
        carrito[producto_id]["cantidad"] = min(
            carrito[producto_id]["cantidad"] + 1, 99
        )
    else:
        producto = PRODUCTOS[producto_id]
        carrito[producto_id] = {
            "nombre": producto["nombre"],
            "imagen": producto["imagen"],
            "cantidad": 1,
        }

    session["carrito"] = carrito
    session.modified = True

    return jsonify({
        "ok": True,
        "mensaje": f'{PRODUCTOS[producto_id]["nombre"]} agregado al carrito.',
        "cantidad_total": _cantidad_total(carrito),
    })


@carrito_bp.post("/carrito/actualizar")
def actualizar_carrito():
    data = request.get_json(silent=True) or {}
    producto_id = str(data.get("producto_id", "")).strip()

    try:
        cantidad = int(data.get("cantidad", 1))
    except (TypeError, ValueError):
        cantidad = 1

    carrito = _obtener_carrito()

    if producto_id not in carrito:
        return jsonify({"ok": False, "mensaje": "El producto no está en el carrito."}), 404

    if cantidad <= 0:
        carrito.pop(producto_id)
    else:
        carrito[producto_id]["cantidad"] = min(cantidad, 99)

    session["carrito"] = carrito
    session.modified = True

    return jsonify({
        "ok": True,
        "cantidad_total": _cantidad_total(carrito),
    })


@carrito_bp.post("/carrito/eliminar")
def eliminar_del_carrito():
    data = request.get_json(silent=True) or {}
    producto_id = str(data.get("producto_id", "")).strip()

    carrito = _obtener_carrito()
    carrito.pop(producto_id, None)

    session["carrito"] = carrito
    session.modified = True

    return jsonify({
        "ok": True,
        "cantidad_total": _cantidad_total(carrito),
    })


@carrito_bp.post("/carrito/vaciar")
def vaciar_carrito():
    session["carrito"] = {}
    session.modified = True
    return jsonify({"ok": True, "cantidad_total": 0})
