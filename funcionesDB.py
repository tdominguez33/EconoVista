# Archivo que contiene todas las funciones relacionadas con el manejo de la base de datos

import json
import requests
import datetime
from dateutil.relativedelta import relativedelta
from funcionesRespuestasAPI import *

# Eliminamos los warnings de conexión insegura en los request
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Calcula la diferencia en años entre dos fechas
def diferenciaAños(fecha1, fecha2):
    if fecha1 > fecha2:
        fecha1, fecha2 = fecha2, fecha1
    diferencia = fecha2.year - fecha1.year
    if (fecha2.month, fecha2.day) < (fecha1.month, fecha1.day):
        diferencia -= 1
    return diferencia

# Guarda en la tabla DATA la información de las variables en el archivo JSON
# Tiene la capacidad de actualizar los valores que se van agregando
def guardarVariables(archivos, cursor, conn):

    # ID's que están en la DB
    cursor.execute("SELECT * FROM DATA")
    idsDB = []
    for fila in cursor.fetchall():
        idsDB.append(fila[0])

    # ID's que están en los archivos
    idsArchivo = []
    
    # Agregamos los ID's de todos los archivos a la lista
    for archivo in archivos:
        for variable in archivo.values():
            idsArchivo.append(int(variable['id']))

    # Marcamos para eliminar los ID's que están en la DB pero no en el JSON
    idsEliminar = [id for id in idsDB if id not in idsArchivo]

    # Insertamos en la tabla los valores del JSON
    for archivo in archivos:
        for variable in archivo.values():
            id          = variable['id']
            nombreCorto = variable['nombreCorto']
            nombreLargo = variable['nombreLargo']
            descripcion = variable['descripcion']
            fechaInicio = variable['fechaInicio']

            # Variables externas - las variables con un ID mayor a 100 no son del BCRA
            if int(variable['id']) > 100:
                url = variable['url']
            else:
                url = ""
            
            # Inserta los valores del archivo, pero si el id ya existe se reemplazan sus valores por los del JSON
            cursor.execute("""
                INSERT INTO DATA (id, nombreCorto, nombreLargo, descripcion, url, fechaInicio) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) 
                DO UPDATE SET 
                    nombreCorto = excluded.nombreCorto,
                    nombreLargo = excluded.nombreLargo,
                    descripcion = excluded.descripcion,
                    url         = excluded.url,
                    fechaInicio = excluded.fechaInicio
            """, (id, nombreCorto, nombreLargo, descripcion, url, fechaInicio))

    # Si tenemos ID's para eliminar los borramos
    if idsEliminar:
        for id in idsEliminar:
            cursor.execute("DELETE FROM DATA WHERE id = ?", (id,))
            cursor.execute("DELETE FROM VARIABLES_BCRA WHERE id = ?", (id,))  # También eliminamos todas las entradas en la otra tabla si existen
            cursor.execute("DELETE FROM VARIABLES_EXTERNAS WHERE id = ?", (id,))

    conn.commit()

# Creamos una lista de tuplas donde cada tupla tiene el id y la fecha de inicio de una variable
# Los datos se obtienen directamente desde la base de datos
def crearListaVariables(cursor):
    cursor.execute("SELECT id FROM DATA")
    ids = cursor.fetchall()

    cursor.execute("SELECT fechaInicio FROM DATA")
    fechas = cursor.fetchall()

    variables = []
    if len(ids) == len(fechas):
        for i in range(len(ids)):
            tupla = (ids[0 + i][0], fechas[0 + i][0])
            variables.append(tupla)

    return variables

# Solicita los datos de la variable con un id desde fechaInicio hasta fechaFinalizacion y los añade a la base de datos
def solicitarGuardar(id, fechaInicio, fechaFinalizacion, cursor, conn):

    # Variables del BCRA
    if int(id) < 100:
        try:
            print(f'Solicitando datos para ID {id} desde {fechaInicio} hasta {fechaFinalizacion}', end = '\r')
            respuesta = requests.get(
                f'https://api.bcra.gob.ar/estadisticas/v2.0/datosvariable/{id}/{fechaInicio}/{fechaFinalizacion}',
                verify = False  # Deshabilitar la verificación SSL
            )
            if respuesta.status_code == 200:
                jsonData = json.loads(respuesta.text)

                for result in jsonData['results']:
                    fecha = result['fecha']
                    valor = result['valor']
                    # Insertar en la base de datos
                    cursor.execute("INSERT INTO VARIABLES_BCRA (id, fecha, valor) VALUES (?, ?, ?)", (id, fecha, valor))
                
                conn.commit()
            else:
                print(f'Error en la solicitud para ID {id} desde {fechaInicio} hasta {fechaFinalizacion}, error: {respuesta.text}')
            return 0
        except Exception as e:
            print(f"Error al solicitar datos: {e}")
            return 1
    
    # Variables que usan otra API
    else:
        cursor.execute("SELECT * FROM DATA WHERE ID = " + id)
        fila = cursor.fetchone()
        
        url = fila[4]

        print(f'Solicitando datos para ID {id} desde {fechaInicio} hasta {fechaFinalizacion}', end = '\r')

        try:
            respuesta = requests.get(url, verify = False)

            if respuesta.status_code == 200:
                dataJSON = json.loads(respuesta.text)

                # Tratamiento para cada una de las variables con respuestas diferentes
                if(id == "101"):
                    riesgoPais(dataJSON, id, fechaInicio, fechaFinalizacion, cursor, conn)
                else:
                    dolares(dataJSON, id, fechaInicio, fechaFinalizacion, cursor, conn)
            
            else:
                print(f'Error en la solicitud para ID {id} desde {fechaInicio} hasta {fechaFinalizacion}, error: {respuesta.text}')
            return 0
                
        except Exception as e:
            print(f"\nError al solicitar datos: {e}")

# Busca la última fecha disponible de las variables en la lista y busca los últimos valores
def actualizarVariables(listaVariables, cursor, conn):
    # Obtenemos la fecha actual
    fechaHoy = datetime.date.today()

    # Buscamos las variables en la tabla DATA
    for (id, fechaInicio) in listaVariables:
        
        # Obtenemos la última fecha registrada en la base de datos para esta variable
        cursor.execute("SELECT id, valor, fecha FROM (SELECT id, valor, fecha FROM VARIABLES_BCRA WHERE id = " + str(id) +  " UNION SELECT id, valor, fecha FROM VARIABLES_EXTERNAS WHERE id =" + str(id) + ") AS combined ORDER BY fecha DESC LIMIT 1;")
        fila = cursor.fetchone()

        # Hay alguna entrada en la db para esta variable
        if fila != None:
            ultimaFecha = fila[2]
            # Convertir la última fecha a un objeto datetime
            ultimaFecha = datetime.datetime.strptime(ultimaFecha, '%Y-%m-%d').date()
            
            # Si hoy no es el último dia de datos disponibles intentamos ver si hay datos más nuevos
            if ultimaFecha < fechaHoy:
                # Hacemos la solicitud para el dia siguiente al cual tenemos el último dato
                ultimaFecha += relativedelta(days = 1)
                obtenerVariables([(id, ultimaFecha.strftime('%Y-%m-%d'))], cursor, conn)

        else:
            # Si no hay datos para este ID, solicitar todos los datos desde el inicio
            obtenerVariables([(id, fechaInicio)], cursor, conn)

# Obtiene las variables de la lista desde la fecha de inicio que tenga en la base de datos
# Hace solicitudes ajustandose al requisito de la API de que el período no sea mayor a un año
def obtenerVariables(listaVariables, cursor, conn):
    fechaHoy = datetime.date.today()
    for (id, fecha) in listaVariables:
        id = str(id)
        
        # Si la variable se obtiene de la API del BCRA Hacemos una solicitud por año
        if (int(id) < 100):

            # Convertimos el string de la fecha en un datetime
            fechaInicio = datetime.date(int(fecha[:4]), int(fecha[5:7]), int(fecha[8:10]))
            diferenciaAño = diferenciaAños(fechaInicio, fechaHoy)
        
            for j in range(diferenciaAño + 1):

                # Sumamos una cierta cantidad de años a la fecha inicial
                inicio = fechaInicio + relativedelta(years=j)

                if j == diferenciaAño:
                    final = fechaHoy
                else:
                    final = inicio + relativedelta(years=1, days=-1)
                
                solicitarGuardar(id, inicio.strftime('%Y-%m-%d'), final.strftime('%Y-%m-%d'), cursor, conn)

        # Caso contrario con una sola solicitud es suficiente
        else:
            solicitarGuardar(id, fecha, fechaHoy.strftime('%Y-%m-%d'), cursor, conn)

