import sqlite3
import json
from funcionesDB import guardarVariables, crearListaVariables, obtenerVariables
import datetime
import requests

# Conexión a la base de datos
conn = sqlite3.connect('variables.db')
cursor = conn.cursor()

id = "101"

cursor.execute("SELECT * FROM DATA WHERE ID = " + id)
fila = cursor.fetchone()

url = fila[4]
fechaInicio = fila[5]

fechaFinalizacion = datetime.date.today()

print(url)
print(fechaInicio)
print(fechaFinalizacion)

print(f'Solicitando datos para ID {id} desde {fechaInicio} hasta {fechaFinalizacion}', end = '\r')

try:
    respuesta = requests.get(url, verify = False)

    if respuesta.status_code == 200:
        jsonData = json.loads(respuesta.text)
        
        for result in jsonData:
            fecha = result['fecha']
            valor = str(result['valor'])    # Valor es un número en la API
            # Insertar en la base de datos
            cursor.execute("INSERT INTO VARIABLES_EXTERNAS (id, fecha, valor) VALUES (?, ?, ?)", (id, fecha, valor))
        
        conn.commit()


        
except Exception as e:
    print(f"Error al solicitar datos: {e}")
