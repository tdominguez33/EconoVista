import sqlite3
from flask import *
from waitress import serve
import datetime
import re

idsPermitidosAjusteCER = ["4", "5", "102", "103", "104", "105"]

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

        # Verificamos el valor de ID y elegimos en que tabla lo buscamos
        if int(idVariable) < 100:
            tabla = "VARIABLES_BCRA"
        else:
            tabla = "VARIABLES_EXTERNAS"
        
        # Obtenemos las filas que tienen el id ingresado y están entre las fechas ingresadas
        c.execute("SELECT * FROM " + tabla + " WHERE id = " + idVariable + " AND fecha BETWEEN '" + desde + "' AND '" + hasta + "';")
        rows = c.fetchall()
        for row in rows:
            datos.append({"fecha": row[1], "valor": row[2]})
        
        conn.close()
        return datos
    else:
        return jsonify(status = 400, error = "Formato de fechas incorrecto")

# Ajusta una variable por CER (Ajuste por Inflación)
def ajusteCER(idVariable, desde, hasta):
    datos = []

    if idVariable in idsPermitidosAjusteCER:
        conn = sqlite3.connect('variables.db')
        c = conn.cursor()

        # Obtenemos los valores del ID ingresado
        if int(idVariable) < 100:
            c.execute("SELECT * FROM VARIABLES_BCRA WHERE id = " + idVariable + " AND fecha BETWEEN '" + desde + "' AND '" + hasta + "'")
        else:
            c.execute("SELECT * FROM VARIABLES_EXTERNAS WHERE id = " + idVariable)
        valoresID = c.fetchall()

        # Obtenemos los valores del CER
        c.execute("SELECT * FROM VARIABLES_BCRA WHERE id = 30")
        valoresCER = c.fetchall()

        cerActual = valoresCER[len(valoresCER) - 1][2]  # Último valor disponible para el CER

        # Como puede no haber la misma cantidad de datos de ambas variables hay que desacoplar la busqueda
        indiceBusqueda = 0

        for i in range (0, len(valoresID)):

            # Buscamos que las fechas coincidan
            while(valoresID[i][1] != valoresCER[indiceBusqueda][1]):
                indiceBusqueda += 1

            cerCorriente = valoresCER[indiceBusqueda][2]        # CER a valores corrientes
            cerAumento = cerActual / cerCorriente               # Cuanto aumentó el CER hasta hoy
                
            id1Corriente = valoresID[i][2]                      # Variable a valores corrientes
            id1Constante = round(id1Corriente * cerAumento, 2)  # Variable a valores constantes

            datos.append({"fecha": valoresID[i][1], "valor": id1Constante})

            indiceBusqueda += 1
         
        return datos
    else:
        return jsonify(status = 400, error="Variable no soportada para ajuste CER")

# Obtener el último valor disponible de todas las variables de la base de datos
@api.route('/principalesvariables', methods=['GET'])
def principalesVariables():
    variables = []
    conn = sqlite3.connect('variables.db')
    c = conn.cursor()

    # Obtenemos la fila con la última fecha para cada id
    # Buscamos tanto en la tabla de VARIABLES_BCRA como en la de VARIABLES_EXTERNAS
    c.execute("WITH MaxFechasEconomicas AS (SELECT id, MAX(fecha) AS max_fecha FROM VARIABLES_BCRA GROUP BY id), MaxFechasExternas AS (SELECT id, MAX(fecha) AS max_fecha FROM VARIABLES_EXTERNAS GROUP BY id) SELECT ve.id, ve.fecha, ve.valor FROM VARIABLES_BCRA ve JOIN MaxFechasEconomicas mfe ON ve.id = mfe.id AND ve.fecha = mfe.max_fecha UNION ALL SELECT vex.id, vex.fecha, vex.valor FROM VARIABLES_EXTERNAS vex JOIN MaxFechasExternas mfx ON vex.id = mfx.id AND vex.fecha = mfx.max_fecha;")

    row = c.fetchall()

    for variable in row:
        c.execute("SELECT * FROM DATA WHERE id = " + str(variable[0]))
        metadata = c.fetchone()
        variables.append({"idVariable": variable[0], "nombreCorto": metadata[1], "nombreLargo": metadata[2], "descripcion": metadata[3], "fecha": variable[1], "valor": variable[2]})
    
    conn.close()
    return variables

# Obtener todos los valores de un determinado ID
@api.route('/datosvariable/<idVariable>', methods=['GET'])
def datosVariableTodo(idVariable):
    conn = sqlite3.connect('variables.db')
    c = conn.cursor()

    c.execute("SELECT fechaInicio FROM 'DATA' WHERE id = " + idVariable)
    fechaInicio = c.fetchone()[0]

    datos = datosVariable(idVariable, fechaInicio, str(datetime.date.today()))
    return datos

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

# Devuelve las variables soportados por el ajuste CER
@api.route('/ajusteCER/variablesSoportadas', methods=['GET'])
def variablesAjusteCER():
    return idsPermitidosAjusteCER

# Ajustar una de las variables soportadas por CER - Todos los datos disponibles
@api.route('/ajusteCER/<idVariable>', methods=['GET'])
def ajusteCERTodo(idVariable):
    conn = sqlite3.connect('variables.db')
    c = conn.cursor()

    c.execute("SELECT fechaInicio FROM 'DATA' WHERE id = " + idVariable)
    fechaInicio = c.fetchone()[0]

    datos = ajusteCER(idVariable, fechaInicio, str(datetime.date.today()))
    return datos

# Ajustar una de las variables soportadas por CER a partir de una fecha específicada
@api.route('/ajusteCER/<idVariable>/<desde>', methods=['GET'])
def ajusteCERDesde(idVariable, desde):
    datos = ajusteCER(idVariable, desde, str(datetime.date.today()))
    return datos

# Ajustar una de las variables soportadas por CER entre dos fechas específicas
@api.route('/ajusteCER/<idVariable>/<desde>/<hasta>', methods=['GET'])
def ajusteCERDesdeHasta(idVariable, desde, hasta):
    datos = ajusteCER(idVariable, desde, hasta)
    return datos


if __name__ == '__main__':
    serve(api, host="0.0.0.0", port=5000)

