# Archivo utilizado para crear desde cero la base de datos
# CUIDADO: ESTO BORRA TODOS LOS DATOS ANTERIORES

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
        nombreCorto TEXT,
        nombreLargo TEXT,
        descripcion TEXT,
        url TEXT,
        fechaInicio DATE
    )
''')

# Crear la tabla VARIABLES_ECONOMICAS - Contiene los valores diarios de todas las variables obtenidas de la API del BCRA
cursor.execute('''
    CREATE TABLE IF NOT EXISTS VARIABLES_ECONOMICAS (
        id INTEGER,
        fecha DATE,
        valor INTEGER
        )
''')

# Crear la tabla VARIABLES_EXTERNAS - Contiene los valores diarios de todas las variables externas
cursor.execute('''
    CREATE TABLE IF NOT EXISTS VARIABLES_EXTERNAS (
        id INTEGER,
        fecha DATE,
        valor INTEGER
        )
''')

# Limpiar datos existentes de las tablas para evitar duplicados
cursor.execute('DELETE FROM DATA')
cursor.execute('DELETE FROM VARIABLES_ECONOMICAS')
cursor.execute('DELETE FROM VARIABLES_EXTERNAS')

# Guardamos los cambios en la base de datos
conn.commit()

# Abrimos el archivo JSON que contiene las variables del bcra
with open('variablesBCRA.json', encoding='utf-8') as f:
    archivoBCRA = json.load(f)

# Abrimos el archivo JSON que contiene las variables externas
with open('variablesExternas.json', encoding='utf-8') as f:
    archivoExternas = json.load(f)

# Insertar datos en la tabla DATA
archivos = [archivoBCRA, archivoExternas]
guardarVariables(archivos, cursor, conn)

listaVariables = crearListaVariables(cursor)

# Insertamos datos en la tabla VARIABLES_ECONOMICAS
obtenerVariables(listaVariables, cursor, conn)


# Cierra la conexión a la base de datos
conn.close()