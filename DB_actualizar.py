# Archivo utilizado para crear de cero / actualizar los datos de la base de datos
from funcionesDB import *
import sqlite3
import json

# Conexión a la base de datos
conn = sqlite3.connect('variables.db')
cursor = conn.cursor()

# Crear la tabla DATA - Contiene la información general de cada variable
cursor.execute('''
    CREATE TABLE IF NOT EXISTS DATA (
        id INTEGER PRIMARY KEY,
        nombrecorto TEXT,
        nombreLargo TEXT,
        descripcion TEXT,
        url TEXT,
        fechaInicio DATE
    )
''')

# Crear la tabla VARIABLES_BCRA - Contiene los valores diarios de todas las variables del BCRA
cursor.execute('''
    CREATE TABLE IF NOT EXISTS VARIABLES_BCRA (
        id INTEGER,
        fecha DATE,
        valor INTEGER
    )
''')

# Crear la tabla VARIABLES_EXTERNAS - Contiene los valores diarios de las variables obtenidas con una API distinta a la del BCRA
cursor.execute('''
    CREATE TABLE IF NOT EXISTS VARIABLES_EXTERNAS (
        id INTEGER,
        fecha DATE,
        valor INTEGER
    )
''')

# Guardamos los cambios en la base de datos
conn.commit()

# Abrimos los archivos JSON que contienen las variables a obtener
with open('variablesBCRA.json', encoding='utf-8') as f:
    archivoBCRA = json.load(f)

with open('variablesExternas.json', encoding='utf-8') as f:
    archivoExternas = json.load(f)

archivos = [archivoBCRA, archivoExternas]

# Insertar datos en la tabla DATA
guardarVariables(archivos, cursor, conn)

# Busca en la DB los ID's de las variables que tenemos
listaVariables = crearListaVariables(cursor)

actualizarVariables(listaVariables, cursor, conn)

print("\nBase de Datos Actualizada!")

# Cierra la conexión a la base de datos
conn.close()
