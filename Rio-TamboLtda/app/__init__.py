from flask import Flask
from app.routes.inicio import inicio_bp
from app.routes.contacto import contacto_bp
from app.routes.nosotros import nosotros
from app.routes.productos import productos_bp  
def create_app():
    app = Flask(__name__)

    # Registro de Blueprints
    app.register_blueprint(inicio_bp)
    app.register_blueprint(contacto_bp)
    app.register_blueprint(nosotros)
    app.register_blueprint(productos_bp)  

    return app