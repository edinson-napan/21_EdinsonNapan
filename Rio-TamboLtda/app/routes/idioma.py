from flask import Blueprint, session, redirect, request


idioma_bp = Blueprint("idioma", __name__)


@idioma_bp.route("/cambiar-idioma/<idioma>")
def cambiarIdioma(idioma):

    idiomasPermitidos = ["es", "en"]

    if idioma in idiomasPermitidos:
        session["idioma"] = idioma

    return redirect(request.referrer or "/")