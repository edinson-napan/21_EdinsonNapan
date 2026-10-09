import json
import logging
import os
import re
from decimal import Decimal, InvalidOperation

import mysql.connector
from flask import Blueprint, redirect, render_template, request, url_for

contacto_bp = Blueprint("contacto", __name__)
logger = logging.getLogger(__name__)

TIPOS_NEGOCIO = {
    "distribuidor", "cafeteria", "tostador", "comercializador",
    "industria", "exportador", "otro",
}
PRODUCTOS_VALIDOS = {
    "cafe_verde", "cafe_pergamino", "cafe_tostado", "cafe_molido", "otros",
}
FRECUENCIAS_VALIDAS = {"unica", "semanal", "mensual", "trimestral", "campana"}
UNIDADES_VALIDAS = {"kg", "toneladas", "sacos"}
ENTREGAS_VALIDAS = {"recojo", "entrega_nacional", "consulta_exportacion"}
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
TELEFONO_RE = re.compile(r"^[+()\d .-]{7,25}$")


def _limpiar(valor, maximo=None):
    valor = (valor or "").strip()
    return valor[:maximo] if maximo else valor


def _form_data():
    return {
        "empresa": _limpiar(request.form.get("empresa"), 150),
        "contacto_nombre": _limpiar(request.form.get("contacto_nombre"), 120),
        "contacto_cargo": _limpiar(request.form.get("contacto_cargo"), 100),
        "correo": _limpiar(request.form.get("correo"), 254).lower(),
        "telefono": _limpiar(request.form.get("telefono"), 25),
        "ruc": _limpiar(request.form.get("ruc"), 30),
        "tipo_negocio": _limpiar(request.form.get("tipo_negocio"), 50),
        "pais": _limpiar(request.form.get("pais"), 100),
        "departamento": _limpiar(request.form.get("departamento"), 100),
        "provincia": _limpiar(request.form.get("provincia"), 100),
        "distrito": _limpiar(request.form.get("distrito"), 100),
        "productos": [p for p in request.form.getlist("productos") if p in PRODUCTOS_VALIDOS],
        "volumen": _limpiar(request.form.get("volumen"), 30),
        "unidad_volumen": _limpiar(request.form.get("unidad_volumen"), 20),
        "frecuencia_compra": _limpiar(request.form.get("frecuencia_compra"), 30),
        "modalidad_entrega": _limpiar(request.form.get("modalidad_entrega"), 40),
        "detalle_solicitud": _limpiar(request.form.get("detalle_solicitud"), 2000),
        "acepto_privacidad": request.form.get("acepto_privacidad") == "on",
        "acepto_novedades": request.form.get("acepto_novedades") == "on",
    }


def _validar(datos):
    errores = {}
    requeridos = {
        "empresa": "Indica la razón social o nombre de tu empresa.",
        "contacto_nombre": "Indica el nombre de la persona de contacto.",
        "contacto_cargo": "Indica el cargo de la persona de contacto.",
        "correo": "Indica un correo electrónico.",
        "telefono": "Indica un teléfono de contacto.",
        "tipo_negocio": "Selecciona el tipo de negocio.",
        "pais": "Indica el país.",
        "volumen": "Indica el volumen aproximado de compra.",
        "unidad_volumen": "Selecciona la unidad de volumen.",
        "frecuencia_compra": "Selecciona la frecuencia de compra.",
        "modalidad_entrega": "Selecciona la modalidad de entrega.",
        "detalle_solicitud": "Describe brevemente tu solicitud.",
    }
    for campo, mensaje in requeridos.items():
        if not datos[campo]:
            errores[campo] = mensaje

    if datos["correo"] and (len(datos["correo"]) > 254 or not EMAIL_RE.fullmatch(datos["correo"])):
        errores["correo"] = "Escribe un correo electrónico válido."
    if datos["telefono"] and not TELEFONO_RE.fullmatch(datos["telefono"]):
        errores["telefono"] = "Escribe un teléfono válido (puede incluir +, espacios o guiones)."
    if datos["ruc"] and (len(datos["ruc"]) != 11 or not datos["ruc"].isdigit()):
        errores["ruc"] = "El RUC debe contener exactamente 11 dígitos. Déjalo vacío si no corresponde."
    if datos["tipo_negocio"] and datos["tipo_negocio"] not in TIPOS_NEGOCIO:
        errores["tipo_negocio"] = "Selecciona un tipo de negocio válido."
    if not datos["productos"]:
        errores["productos"] = "Selecciona al menos un producto de interés."
    if datos["unidad_volumen"] and datos["unidad_volumen"] not in UNIDADES_VALIDAS:
        errores["unidad_volumen"] = "Selecciona una unidad de volumen válida."
    if datos["frecuencia_compra"] and datos["frecuencia_compra"] not in FRECUENCIAS_VALIDAS:
        errores["frecuencia_compra"] = "Selecciona una frecuencia de compra válida."
    if datos["modalidad_entrega"] and datos["modalidad_entrega"] not in ENTREGAS_VALIDAS:
        errores["modalidad_entrega"] = "Selecciona una modalidad de entrega válida."
    if datos["detalle_solicitud"] and len(datos["detalle_solicitud"]) < 20:
        errores["detalle_solicitud"] = "Añade un poco más de detalle (mínimo 20 caracteres)."
    if not datos["acepto_privacidad"]:
        errores["acepto_privacidad"] = "Debes aceptar la política de privacidad para enviar la solicitud."
    if request.form.get("website", "").strip():
        errores["spam"] = "No se pudo procesar la solicitud."

    try:
        volumen = Decimal(datos["volumen"]) if datos["volumen"] else None
        if volumen is not None and (not volumen.is_finite() or volumen <= 0 or volumen > Decimal("999999999")):
            raise InvalidOperation
    except (InvalidOperation, ValueError):
        errores["volumen"] = "El volumen debe ser un número mayor que cero."
        volumen = None
    return errores, volumen


def _conectar_mysql():
    """Conecta a MySQL; Aiven debe usar el certificado CA configurado en MYSQL_SSL_CA."""
    requeridas = ("MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE")
    faltantes = [nombre for nombre in requeridas if not os.getenv(nombre)]
    if faltantes:
        raise RuntimeError("Falta configuración de base de datos: " + ", ".join(faltantes))

    opciones = {
        "host": os.environ["MYSQL_HOST"],
        "port": int(os.getenv("MYSQL_PORT", "3306")),
        "user": os.environ["MYSQL_USER"],
        "password": os.environ["MYSQL_PASSWORD"],
        "database": os.environ["MYSQL_DATABASE"],
        "connection_timeout": 10,
        "autocommit": False,
    }
    certificado = os.getenv("MYSQL_SSL_CA")
    if not certificado:
        raise RuntimeError("Configura MYSQL_SSL_CA con la ruta al certificado CA de Aiven")
    opciones.update(ssl_ca=certificado, ssl_verify_cert=True, ssl_verify_identity=True)
    return mysql.connector.connect(**opciones)


def _guardar_solicitud(datos, volumen):
    conexion = _conectar_mysql()
    try:
        cursor = conexion.cursor()
        sql = """
            INSERT INTO solicitudes_mayoristas (
                empresa, contacto_nombre, contacto_cargo, correo, telefono, ruc,
                tipo_negocio, pais, departamento, provincia, distrito, productos,
                volumen, unidad_volumen, frecuencia_compra, modalidad_entrega,
                detalle_solicitud, acepto_privacidad, acepto_novedades
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s
            )
        """
        valores = (
            datos["empresa"], datos["contacto_nombre"], datos["contacto_cargo"],
            datos["correo"], datos["telefono"], datos["ruc"] or None,
            datos["tipo_negocio"], datos["pais"], datos["departamento"] or None,
            datos["provincia"] or None, datos["distrito"] or None,
            json.dumps(datos["productos"], ensure_ascii=False), volumen,
            datos["unidad_volumen"], datos["frecuencia_compra"],
            datos["modalidad_entrega"], datos["detalle_solicitud"],
            datos["acepto_privacidad"], datos["acepto_novedades"],
        )
        cursor.execute(sql, valores)
        conexion.commit()
        return cursor.lastrowid
    except Exception:
        conexion.rollback()
        raise
    finally:
        try:
            cursor.close()
        except (UnboundLocalError, AttributeError):
            pass
        conexion.close()


@contacto_bp.route("/contacto", methods=["GET", "POST"])
def contacto_page():
    enviado = request.args.get("enviado") == "1"
    errores = {}
    datos = {}

    if request.method == "POST":
        datos = _form_data()
        errores, volumen = _validar(datos)
        if not errores:
            try:
                _guardar_solicitud(datos, volumen)
            except Exception:
                # El detalle técnico queda en los logs del servidor; no se expone al visitante.
                logger.exception("No se pudo guardar una solicitud mayorista")
                errores["general"] = (
                    "No pudimos registrar tu solicitud en este momento. "
                    "Inténtalo nuevamente más tarde."
                )
            else:
                return redirect(url_for("contacto.contacto_page", enviado=1))

    return render_template(
        "contacto/index.html", enviado=enviado, errores=errores, datos=datos,
    )