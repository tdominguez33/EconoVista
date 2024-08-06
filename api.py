import sqlite3
from flask import Flask
from waitress import serve
    
api = Flask(__name__)
api.json.sort_keys = False  # Evita que Flask ordene las claves en orden alfabetico

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

@api.route('/datosvariable/<idVariable>/<desde>/<hasta>', methods=['GET'])
def datosVariable(idVariable, desde, hasta):
    datos = []
    conn = sqlite3.connect('variables.db')
    c = conn.cursor()

    # Obtenemos las filas que tienen el id ingresado y están entre las fechas ingresadas
    c.execute("SELECT * FROM VARIABLES_ECONOMICAS WHERE id = " + idVariable + " AND fecha BETWEEN '" + desde + "' AND '" + hasta + "';")
    rows = c.fetchall()
    for row in rows:
        datos.append({"id": row[0], "fecha": row[1], "valor": row[2]})
    
    conn.close()
    return datos

@api.route('/ajusteCER/<idVariable1>', methods=['GET'])
def ajusteCER(idVariable1):
    datos = []
    conn = sqlite3.connect('variables.db')
    c = conn.cursor()

    c.execute("SELECT * FROM VARIABLES_ECONOMICAS WHERE id = " + idVariable1)
    valoresID1 = c.fetchall()

    c.execute("SELECT * FROM VARIABLES_ECONOMICAS WHERE id = 30")
    valoresCER = c.fetchall()

    cerActual = valoresCER[len(valoresCER) - 1][2]  # Último valor disponible para el CER


    # Como puede no haber la misma cantidad de datos de ambas variables hay que desacoplar la busqueda
    indiceBusqueda = 0

    for i in range (0, len(valoresID1)):

        # Buscamos que las fechas coincidan
        while(valoresID1[i][1] != valoresCER[indiceBusqueda][1]):
            indiceBusqueda += 1

        cerCorriente = valoresCER[indiceBusqueda][2]                # CER a valores corrientes
        cerAumento = cerActual / cerCorriente                       # Cuanto aumentó el CER hasta hoy
            
        id1Corriente = valoresID1[i][2]                             # Variable a valores corrientes
        id1Constante = round(id1Corriente * cerAumento, 2)          # Variable a valores constantes

        datos.append({"fecha": valoresID1[i][1], "valor": id1Constante})

        indiceBusqueda += 1
    
    return datos


if __name__ == '__main__':
    serve(api, host="0.0.0.0", port=5000)

