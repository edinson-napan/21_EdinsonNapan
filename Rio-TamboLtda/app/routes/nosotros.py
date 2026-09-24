from flask import Blueprint, render_template

nosotros = Blueprint('nosotros', __name__)

@nosotros.route('/nosotros')
def nosotros_page():
    return render_template('nosotros/index.html')