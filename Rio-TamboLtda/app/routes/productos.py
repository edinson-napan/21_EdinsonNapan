from flask import Blueprint, render_template

productos_bp = Blueprint("productos", __name__)


@productos_bp.route("/productos")
def mostrarProductos():
    return render_template("productos/index.html")