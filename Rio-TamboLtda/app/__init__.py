from flask import Flask

def create_app():
    app = Flask(__name__)
    
<<<<<<< HEAD
    from .routes.nosotros import nosotros
    
    app.register_blueprint(nosotros)
=======
    # Importar y registrar tus rutas / blueprints
    from app.routes.inicio import inicio_bp
    app.register_blueprint(inicio_bp)
>>>>>>> origin/feature/vista-inicio
    
    return app