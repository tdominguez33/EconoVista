# Archivo utilizado para crear desde cero la base de datos
# CUIDADO: ESTO BORRA TODOS LOS DATOS ANTERIORES, es recomendable siempre usar DB_actualizar borrando el archivo a mano

import sqlite3
import json
from funcionesDB import guardarVariables, crearListaVariables, obtenerVariables

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

# Limpiar datos existentes de las tablas para evitar duplicados
cursor.execute('DELETE FROM DATA')
cursor.execute('DELETE FROM VARIABLES_BCRA')
cursor.execute('DELETE FROM VARIABLES_EXTERNAS')

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

listaVariables = crearListaVariables(cursor)

# Insertamos datos en la tabla VARIABLES_BCRA
obtenerVariables(listaVariables, cursor, conn)

print("Base de Datos Creada!")


# Cierra la conexión a la base de datos
conn.close()