# Archivo utilizado para crear desde cero la base de datos
# CUIDADO: ESTO BORRA TODOS LOS DATOS ANTERIORES

import sqlite3
from funcionesDB import crearDB

# Conexión a la base de datos
conn = sqlite3.connect('variables.db')
cursor = conn.cursor()

crearDB(cursor, conn)

# Cierra la conexión a la base de datos
conn.close()