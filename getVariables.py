import json
import requests
import datetime
from dateutil.relativedelta import relativedelta
import sqlite3
import certifi
import pandas as pd

# 5 -> A3500
# 30 -> CER
VARIABLES_ID = [5, 30]
VARIABLES_INICIO = ['2002-03-04', '2002-03-04']

# Ruta del archivo de certificados certifi (opcional, en caso de necesitarlo)
CERT_PATH = certifi.where()

# Conexión a la base de datos
conn = sqlite3.connect('variables.db')
c = conn.cursor()

# Crear la tabla si no existe
c.execute('''
    CREATE TABLE IF NOT EXISTS VARIABLES_ECONOMICAS (
        id INTEGER,
        fecha DATE,
        valor INTEGER
    )
''')
conn.commit()

# Calcula la diferencia en años entre dos fechas
def diferenciaAños(fecha1, fecha2):
    if fecha1 > fecha2:
        fecha1, fecha2 = fecha2, fecha1
    diferencia = fecha2.year - fecha1.year
    if (fecha2.month, fecha2.day) < (fecha1.month, fecha1.day):
        diferencia -= 1
    return diferencia

# Solicita los datos de la variable con un id desde fechaInicio hasta fechaFinalizacion y los añade a la base de datos
def solicitarGuardar(id, fechaInicio, fechaFinalizacion):
    try:
        print(f'Solicitando datos para ID {id} desde {fechaInicio} hasta {fechaFinalizacion}')
        respuesta = requests.get(
            f'https://api.bcra.gob.ar/estadisticas/v2.0/datosvariable/{id}/{fechaInicio}/{fechaFinalizacion}',
            verify=False  # Deshabilitar la verificación SSL
        )
        if respuesta.status_code == 200:
            json_data = json.loads(respuesta.text)
            print(f'Datos recibidos para ID {id}: {json_data}')

            for result in json_data['results']:
                fecha = result['fecha']
                valor = result['valor']
                # Insertar en la base de datos
                c.execute("INSERT INTO VARIABLES_ECONOMICAS (id, fecha, valor) VALUES (?, ?, ?)", (id, fecha, valor))
            
            conn.commit()
        else:
            print(f'Error en la solicitud: {respuesta.status_code} {respuesta.text}')
        return 0
    except Exception as e:
        print(f"Error al solicitar datos: {e}")
        return 1

# Actualiza las variables con hasta un año de atraso, para más tiempo ejecutar obtenerVariables()
def actualizarVariables():
    # Obtenemos la fecha actual
    fechaHoy = datetime.date.today()

    # Vamos a buscar las variables en la lista VARIABLES_ID
    for id in VARIABLES_ID:
        id_str = str(id)
        # Obtener la última fecha registrada en la base de datos para esta variable
        c.execute("SELECT MAX(fecha) FROM VARIABLES_ECONOMICAS WHERE id = ?", (id,))
        ultimaFecha = c.fetchone()[0]
        
        if ultimaFecha:
            # Convertir la última fecha a un objeto datetime
            ultimaFecha = datetime.datetime.strptime(ultimaFecha, '%Y-%m-%d').date()
            
            # Si hoy no es el último dia de datos disponibles intentamos ver si hay datos más nuevos
            if ultimaFecha < fechaHoy:
                solicitarGuardar(id_str, str(ultimaFecha + relativedelta(days=1)), str(fechaHoy))
        else:
            # Si no hay datos para este ID, solicitar todos los datos desde el inicio
            fechaInicio = VARIABLES_INICIO[VARIABLES_ID.index(id)]
            solicitarGuardar(id_str, fechaInicio, str(fechaHoy))

# Solicita todas las variables al BCRA (desde cero, se borra cualquier dato anterior)
def obtenerVariables():
    fechaHoy = datetime.date.today()
    for i, id in enumerate(VARIABLES_ID):
        id = str(id)
        fechaInicio = datetime.date(int(VARIABLES_INICIO[i][:4]), int(VARIABLES_INICIO[i][5:7]), int(VARIABLES_INICIO[i][8:10]))
        diferenciaAño = diferenciaAños(fechaInicio, fechaHoy)
        for j in range(diferenciaAño + 1):
            inicio = fechaInicio + relativedelta(years=j)
            if j == diferenciaAño:
                final = fechaHoy
            else:
                final = inicio + relativedelta(years=1, days=-1)
            solicitarGuardar(id, inicio.strftime('%Y-%m-%d'), final.strftime('%Y-%m-%d'))

# Ejecuta la función para obtener variables
obtenerVariables()

# Actualiza las variables con hasta un año de atraso
actualizarVariables()

# Cierra la conexión a la base de datos
conn.close()
