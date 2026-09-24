from flask import Flask, url_for
from werkzeug.routing import BuildError
from app.routes.contacto import contacto_bp

# 1. PRIMERO creas la app (esto soluciona el NameError)
app = Flask(
    __name__,
    template_folder="app/templates",
    static_folder="app/static",
    static_url_path="/static"
)

# 2. DESPUÉS registras el blueprint en 'app'
app.register_blueprint(contacto_bp)


@app.context_processor
def inject_safe_url_for():
    def safe_url_for(endpoint, **values):
        try:
            return url_for(endpoint, **values)
        except BuildError:
            return "#"

    return dict(safe_url_for=safe_url_for)


if __name__ == "__main__":
    app.run(debug=True)