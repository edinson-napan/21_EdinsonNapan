from flask import Flask

def create_app():
    app = Flask(__name__)
    
    from .routes.nosotros import nosotros
    
    app.register_blueprint(nosotros)
    
    return app