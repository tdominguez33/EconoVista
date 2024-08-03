import sqlite3

# Conexión a la base de datos
conn = sqlite3.connect('variables.db')
c = conn.cursor()

# Consulta para obtener todos los datos de la tabla VARIABLE
c.execute("SELECT * FROM VARIABLES_ECONOMICAS")

# Obtener todos los registros
rows = c.fetchall()

# Mostrar los registros
for row in rows:
    print(row)

# Cierra la conexión a la base de datos
conn.close()
