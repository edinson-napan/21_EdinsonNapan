import os

from flask import Flask, session
from flask_babel import Babel, get_locale

from app.routes.inicio import inicio_bp
from app.routes.contacto import contacto_bp
from app.routes.nosotros import nosotros
from app.routes.productos import productos_bp
from app.routes.carrito import carrito_bp
from app.routes.idioma import idioma_bp


def seleccionarIdioma():
    return session.get("idioma", "es")


def create_app():
    app = Flask(__name__)

    app.secret_key = "rio-tambo-clave-secreta"

    app.config["BABEL_DEFAULT_LOCALE"] = "es"
    app.config["BABEL_SUPPORTED_LOCALES"] = ["es", "en"]
    app.config["BABEL_TRANSLATION_DIRECTORIES"] = os.path.abspath(
        os.path.join(app.root_path, "..", "translations")
    )

    babel = Babel(
        app,
        locale_selector=seleccionarIdioma
    )

    @app.context_processor
    def insertarIdioma():
        return {
            "idiomaActual": str(get_locale())
        }

    app.register_blueprint(inicio_bp)
    app.register_blueprint(contacto_bp)
    app.register_blueprint(nosotros)
    app.register_blueprint(productos_bp)
    app.register_blueprint(idioma_bp)
    app.register_blueprint(carrito_bp)

    return app