from flask import Blueprint, render_template, request

contacto_bp = Blueprint('contacto', __name__)

@contacto_bp.route('/contacto', methods=['GET', 'POST'])
def contacto_page():
    enviado = False
    if request.method == 'POST':
        enviado = True
    return render_template('contacto/index.html', enviado=enviado)