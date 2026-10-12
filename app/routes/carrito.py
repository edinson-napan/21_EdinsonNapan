
from flask import Blueprint, jsonify, render_template, request, session
from flask_babel import gettext as _

carrito_bp = Blueprint("carrito", __name__)

# Catálogo de productos disponibles en el carrito.
# Los nombres se traducen mediante Flask-Babel.
PRODUCTOS = {
    "cafe-verde": {
        "nombre": "Café Verde",
        "imagen": "img/cafe-verde.jpg",
    },
    "cafe-pergamino": {
        "nombre": "Café Pergamino",
        "imagen": "img/cafe-pergamino.jpg",
    },
    "cafe-oro-mcm": {
        "nombre": "Café oro MCM",
        "imagen": "img/cafe-origen.jpg",
    },
    "cafe-tostado": {
        "nombre": "Café tostado",
        "imagen": "img/cafe-origen.jpg",
    },
}


def _obtener_carrito():
    return session.get("carrito", {})


def _cantidad_total(carrito):
    return sum(item["cantidad"] for item in carrito.values())


@carrito_bp.get("/carrito")
def ver_carrito():
    carrito = _obtener_carrito()

    # Traducir los nombres al idioma activo,
    # incluso si el usuario cambió de idioma después.
    carrito_vista = {}

    for producto_id, item in carrito.items():
        producto_vista = item.copy()

        if producto_id in PRODUCTOS:
            producto_vista["nombre"] = _(
                PRODUCTOS[producto_id]["nombre"]
            )

        carrito_vista[producto_id] = producto_vista

    return render_template(
        "carrito/index.html",
        carrito=carrito_vista,
        cantidad_total=_cantidad_total(carrito),
    )


@carrito_bp.get("/carrito/cantidad")
def cantidad_carrito():
    return jsonify({
        "cantidad": _cantidad_total(_obtener_carrito())
    })


@carrito_bp.post("/carrito/agregar")
def agregar_al_carrito():
    data = request.get_json(silent=True) or {}
    producto_id = str(data.get("producto_id", "")).strip()

    if producto_id not in PRODUCTOS:
        return jsonify({
            "ok": False,
            "mensaje": _("Producto no encontrado."),
        }), 404

    carrito = _obtener_carrito()
    producto = PRODUCTOS[producto_id]

    if producto_id in carrito:
        carrito[producto_id]["cantidad"] = min(
            carrito[producto_id]["cantidad"] + 1,
            99,
        )
    else:
        
        carrito[producto_id] = {
            "nombre": producto["nombre"],
            "imagen": producto["imagen"],
            "cantidad": 1,
        }

    session["carrito"] = carrito
    session.modified = True

    nombre_traducido = _(producto["nombre"])
    mensaje = _("%(producto)s agregado al carrito.") % {
        "producto": nombre_traducido
    }

    return jsonify({
        "ok": True,
        "mensaje": mensaje,
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
        return jsonify({
            "ok": False,
            "mensaje": _("El producto no está en el carrito."),
        }), 404

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
    

    return jsonify({
        "ok": True,
        "cantidad_total": 0,
    })