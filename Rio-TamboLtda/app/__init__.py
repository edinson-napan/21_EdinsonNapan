from flask import Flask, url_for
from werkzeug.routing import BuildError

def create_app():
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static",
        static_url_path="/static"
    )

    # Importar Blueprints
    from app.routes.inicio import inicio_bp
    from app.routes.productos import productos_bp
    from app.routes.nosotros import nosotros_bp
    from app.routes.contacto import contacto_bp

    # Registrar Blueprints
    app.register_blueprint(inicio_bp)
    app.register_blueprint(productos_bp)
    app.register_blueprint(nosotros_bp)
    app.register_blueprint(contacto_bp)

    # Procesador de contexto para resolver rutas de forma segura
    @app.context_processor
    def inject_safe_url_for():
        def safe_url_for(endpoint, **values):
            try:
                return url_for(endpoint, **values)
            except BuildError:
                return "#"
        return dict(safe_url_for=safe_url_for)

    return app