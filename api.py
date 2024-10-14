import sqlite3
from flask import *
from waitress import serve
import datetime
import re
    
api = Flask(__name__)
api.json.sort_keys = False  # Evita que Flask ordene las claves en orden alfabetico

# Verifica que una fecha tenga el formato yyyy-mm-dd
def verificarFecha(fecha):
    # Describimos la expresión con una expresión regular
    regEx = re.compile(r"\d{4}-\d{2}-\d{2}", re.IGNORECASE)
    return bool(regEx.match(fecha))


# Obtiene los valores de una variable determinada en un rango de fechas específicado
def datosVariable(idVariable, desde, hasta):
    datos = []

    # Verificamos que los formatos de las fecha sean los indicados
    if verificarFecha(desde) and verificarFecha(hasta):
        conn = sqlite3.connect('variables.db')
        c = conn.cursor()

        # Obtenemos las filas que tienen el id ingresado y están entre las fechas ingresadas
        c.execute("SELECT * FROM VARIABLES_ECONOMICAS WHERE id = " + idVariable + " AND fecha BETWEEN '" + desde + "' AND '" + hasta + "';")
        rows = c.fetchall()
        for row in rows:
            datos.append({"id": row[0], "fecha": row[1], "valor": row[2]})
        
        conn.close()
        return datos
    else:
        return jsonify(status = 400, error="Formato de fechas incorrecto")

# Obtener el último valor disponible de todas las variables de la base de datos
# Se usa en varios endpoints
@api.route('/principalesvariables', methods=['GET'])
def principalesVariables():
    variables = []
    conn = sqlite3.connect('variables.db')
    c = conn.cursor()

    # Obtenemos la fila con la última fecha para cada id
    c.execute("SELECT t1.id, t1.fecha, t1.valor FROM VARIABLES_ECONOMICAS AS t1 JOIN (SELECT id, MAX(fecha) AS max_fecha FROM VARIABLES_ECONOMICAS GROUP BY id) AS t2 ON t1.id = t2.id AND t1.fecha = t2.max_fecha;")

    row = c.fetchall()

    for variable in row:
        c.execute("SELECT * FROM DATA WHERE id = " + str(variable[0]))
        metadata = c.fetchone()
        variables.append({"idVariable": variable[0], "nombre": metadata[1], "descripcion": metadata[2], "fecha": variable[1], "valor": variable[2]})
    
    conn.close()
    return variables

# Obtener los valores de un determinado ID desde una fecha específica hasta la fecha
@api.route('/datosvariable/<idVariable>/<desde>', methods=['GET'])
def datosVariableDesde(idVariable, desde):
    datos = datosVariable(idVariable, desde, str(datetime.date.today()))
    return datos

# Obtener los valores de un determinado ID entre dos fechas específicadas
@api.route('/datosvariable/<idVariable>/<desde>/<hasta>', methods=['GET'])
def datosVariableDesdeHasta(idVariable, desde, hasta):
    datos = datosVariable(idVariable, desde, hasta)
    return datos


# Ajustar una de las variables soportadas por CER
@api.route('/ajusteCER/<idVariable>', methods=['GET'])
def ajusteCER(idVariable):
    idsPermitidos = ["4", "5"]
    datos = []

    if idVariable in idsPermitidos:
        conn = sqlite3.connect('variables.db')
        c = conn.cursor()

        # Obtenemos los valores del ID ingresado
        c.execute("SELECT * FROM VARIABLES_ECONOMICAS WHERE id = " + idVariable)
        valoresID = c.fetchall()

        # Obtenemos los valores del CER
        c.execute("SELECT * FROM VARIABLES_ECONOMICAS WHERE id = 30")
        valoresCER = c.fetchall()

        cerActual = valoresCER[len(valoresCER) - 1][2]  # Último valor disponible para el CER


        # Como puede no haber la misma cantidad de datos de ambas variables hay que desacoplar la busqueda
        indiceBusqueda = 0

        for i in range (0, len(valoresID)):

            # Buscamos que las fechas coincidan
            while(valoresID[i][1] != valoresCER[indiceBusqueda][1]):
                indiceBusqueda += 1

            cerCorriente = valoresCER[indiceBusqueda][2]                # CER a valores corrientes
            cerAumento = cerActual / cerCorriente                       # Cuanto aumentó el CER hasta hoy
                
            id1Corriente = valoresID[i][2]                             # Variable a valores corrientes
            id1Constante = round(id1Corriente * cerAumento, 2)          # Variable a valores constantes

            datos.append({"fecha": valoresID[i][1], "valor": id1Constante})

            indiceBusqueda += 1
            
            return datos
    else:
        return jsonify(status = 400, error="Variable no soportada para ajuste CER")


if __name__ == '__main__':
    serve(api, host="0.0.0.0", port=5000)

