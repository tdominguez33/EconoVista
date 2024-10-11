# Archivo utilizado para actualizar la base de datos con los datos de como máximo UN AÑO atrás

import sqlite3
from funcionesDB import actualizarDB

# Conexión a la base de datos
conn = sqlite3.connect('variables.db')
cursor = conn.cursor()

actualizarDB(cursor, conn)

# Cierra la conexión a la base de datos
conn.close()
