from flask import Blueprint, render_template

nosotros_bp = Blueprint('nosotros', __name__)

@nosotros_bp.route('/nosotros')
def nosotros_page():
    return render_template('nosotros/index.html')