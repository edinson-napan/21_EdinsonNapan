from flask import Blueprint, render_template, request

contacto_bp = Blueprint("contacto", __name__)

@contacto_bp.route("/contacto", methods=["GET", "POST"])
def contacto():
    enviado = False
    
    if request.method == "POST":
        # Aquí en el futuro conectarás la base de datos o envío de correos
        # nombre = request.form.get("nombre")
        # correo = request.form.get("correo")
        
        # Simulamos el envío exitoso
        enviado = True

    return render_template("contacto/index.html", enviado=enviado)