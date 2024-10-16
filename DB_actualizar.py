# Archivo utilizado para actualizar la base de datos con los datos de como máximo UN AÑO atrás
from funcionesDB import *
import sqlite3
import json

# Conexión a la base de datos
conn = sqlite3.connect('variables.db')
cursor = conn.cursor()

# Abrimos el archivo JSON que contiene las variables del bcra
with open('variablesBCRA.json', encoding='utf-8') as f:
    archivoBCRA = json.load(f)

# Abrimos el archivo JSON que contiene las variables externas
with open('variablesExternas.json', encoding='utf-8') as f:
    archivoExternas = json.load(f)

archivos = [archivoBCRA, archivoExternas]

# Insertar datos en la tabla DATA
guardarVariables(archivos, cursor, conn)

# Busca en la DB los ID's de las variables que tenemos
listaVariables = crearListaVariables(cursor)

actualizarVariables(listaVariables, cursor, conn)

# Cierra la conexión a la base de datos
conn.close()
