# Archivo que contiene todas las funciones relacionadas con el manejo de la base de datos

import json
import requests
import datetime
from dateutil.relativedelta import relativedelta

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
def guardarVariables(archivo, cursor, conn):

    # ID's que están en la DB
    cursor.execute("SELECT * FROM DATA")
    idsDB = []
    for fila in cursor.fetchall():
        idsDB.append(fila[0])

    # ID's que están en el archivo
    idsArchivo = []
    for variable in archivo.values():
        idsArchivo.append(int(variable['id']))

    # Marcamos para eliminar los ID's que están en la DB pero no en el JSON
    idsEliminar = [id for id in idsDB if id not in idsArchivo]

    # Insertamos en la tabla los valores del JSON
    for variable in archivo.values():
        id          = variable['id']
        nombreCorto = variable['nombreCorto']
        nombreLargo = variable['nombreLargo']
        descripcion = variable['descripcion']
        fechaInicio = variable['fechaInicio']

        # Inserta los valores del archivo, pero si el id ya existe se reemplazan sus valores por los del JSON
        cursor.execute("""
            INSERT INTO DATA (id, nombreCorto, nombreLargo, descripcion, fechaInicio) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) 
            DO UPDATE SET 
                nombreCorto = excluded.nombreCorto,
                nombreLargo = excluded.nombreLargo,
                descripcion = excluded.descripcion,
                fechaInicio = excluded.fechaInicio
        """, (id, nombreCorto, nombreLargo, descripcion, fechaInicio))

    # Si tenemos ID's para eliminar los borramos
    if idsEliminar:
        for id in idsEliminar:
            cursor.execute("DELETE FROM DATA WHERE id = ?", (id,))
            cursor.execute("DELETE FROM VARIABLES_ECONOMICAS WHERE id = ?", (id,))  # También eliminamos todas las entradas en la otra tabla si existen

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
    try:
        print(f'Solicitando datos para ID {id} desde {fechaInicio} hasta {fechaFinalizacion}', end = '\r')
        respuesta = requests.get(
            f'https://api.bcra.gob.ar/estadisticas/v2.0/datosvariable/{id}/{fechaInicio}/{fechaFinalizacion}',
            verify = False  # Deshabilitar la verificación SSL
        )
        if respuesta.status_code == 200:
            json_data = json.loads(respuesta.text)

            for result in json_data['results']:
                fecha = result['fecha']
                valor = result['valor']
                # Insertar en la base de datos
                cursor.execute("INSERT INTO VARIABLES_ECONOMICAS (id, fecha, valor) VALUES (?, ?, ?)", (id, fecha, valor))
            
            conn.commit()
        else:
            print(f'Error en la solicitud para ID {id} desde {fechaInicio} hasta {fechaFinalizacion}, error: {respuesta.text}')
        return 0
    except Exception as e:
        print(f"Error al solicitar datos: {e}")
        return 1

# Actualiza las variables con hasta un año de atraso, para más tiempo ejecutar obtenerVariables()
def actualizarVariables(listaVariables, cursor, conn):
    # Obtenemos la fecha actual
    fechaHoy = datetime.date.today()

    # Buscamos las variables en la tabla DATA
    for (id, fechaInicio) in listaVariables:
        id_str = str(id)
        
        # Obtenemos la última fecha registrada en la base de datos para esta variable
        cursor.execute("SELECT MAX(fecha) FROM VARIABLES_ECONOMICAS WHERE id = ?", (id,))
        ultimaFecha = cursor.fetchone()[0]
        
        if ultimaFecha:
            # Convertir la última fecha a un objeto datetime
            ultimaFecha = datetime.datetime.strptime(ultimaFecha, '%Y-%m-%d').date()
            
            # Si hoy no es el último dia de datos disponibles intentamos ver si hay datos más nuevos
            if ultimaFecha < fechaHoy:
                solicitarGuardar(id_str, str(ultimaFecha + relativedelta(days=1)), str(fechaHoy), cursor, conn)

        #### REVISAR, CREO QUE PUEDE LLEGAR A FALLAR ####
        else:
            # Si no hay datos para este ID, solicitar todos los datos desde el inicio
            obtenerVariables([(id, fechaInicio)], cursor, conn)

# Obtiene las variables de la lista desde la fecha de inicio que tenga en la base de datos
def obtenerVariables(listaVariables, cursor, conn):
    fechaHoy = datetime.date.today()
    for (id, fecha) in listaVariables:
        id = str(id)
        
        # Convertimos el string de la fecha en un datetime
        fechaInicio = datetime.date(int(fecha[:4]), int(fecha[5:7]), int(fecha[8:10]))
        diferenciaAño = diferenciaAños(fechaInicio, fechaHoy)
        
        # Hacemos una solicitud por año
        for j in range(diferenciaAño + 1):
            inicio = fechaInicio + relativedelta(years=j)
            if j == diferenciaAño:
                final = fechaHoy
            else:
                final = inicio + relativedelta(years=1, days=-1)
            solicitarGuardar(id, inicio.strftime('%Y-%m-%d'), final.strftime('%Y-%m-%d'), cursor, conn)

# Crea el archivo de la base de datos por primera vez
def crearDB(cursor, conn):
    # Crear la tabla DATA - Contiene la información general de cada variable
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS DATA (
            id INTEGER PRIMARY KEY,
            nombreCorto TEXT,
            nombreLargo TEXT,
            descripcion TEXT,
            fechaInicio DATE
        )
    ''')

    # Crear la tabla VARIABLES_ECONOMICAS - Contiene los valores diarios de todas las variables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS VARIABLES_ECONOMICAS (
            id INTEGER,
            fecha DATE,
            valor INTEGER
        )
    ''')

    # Limpiar datos existentes de las tablas para evitar duplicados
    cursor.execute('DELETE FROM DATA')
    cursor.execute('DELETE FROM VARIABLES_ECONOMICAS')

    # Guardamos los cambios en la base de datos
    conn.commit()

    # Abrimos el archivo JSON que contiene las variables a obtener
    with open('variables.json', encoding='utf-8') as f:
        archivo = json.load(f)

    # Insertar datos en la tabla DATA
    guardarVariables(archivo, cursor, conn)

    listaVariables = crearListaVariables(cursor)

    # Insertamos datos en la tabla VARIABLES_ECONOMICAS
    obtenerVariables(listaVariables, cursor, conn)
