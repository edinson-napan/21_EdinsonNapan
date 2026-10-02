import os

from flask import Flask

from app.routes.inicio import inicio_bp
from app.routes.contacto import contacto_bp
from app.routes.nosotros import nosotros
from app.routes.productos import productos_bp
from app.routes.carrito import carrito_bp


def create_app():
    app = Flask(__name__)

    # Para desarrollo. En producción debe configurarse SECRET_KEY mediante entorno.
    app.config["SECRET_KEY"] = os.getenv(
        "SECRET_KEY",
        "rio-tambo-dev-key-change-me",
    )

    # Registro de Blueprints
    app.register_blueprint(inicio_bp)
    app.register_blueprint(contacto_bp)
    app.register_blueprint(nosotros)
    app.register_blueprint(productos_bp)
    app.register_blueprint(carrito_bp)

    return app