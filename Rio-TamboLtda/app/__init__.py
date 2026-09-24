from flask import Flask

def create_app():
    app = Flask(__name__)
    
    # Importar y registrar tus rutas / blueprints
    from app.routes.inicio import inicio_bp
    app.register_blueprint(inicio_bp)
    
    return app