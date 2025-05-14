import sqlite3
from pathlib import Path
import re
import sys
from datetime import datetime

# Generar nombre del archivo de log con formato "aaaa.mm.dd-hora.minuto"
timestamp = datetime.now().strftime("%Y.%m.%d-%H.%M")

# Crear la carpeta 'logs' en la misma ubicación del script actual
script_dir = Path(__file__).parent
log_dir = script_dir / "logs"
log_dir.mkdir(exist_ok=True)

log_file = log_dir / f"{timestamp}.txt"

# Redireccionar stdout a consola y archivo a la vez
class Tee:
    def __init__(self, *outputs):
        self.outputs = outputs

    def write(self, message):
        for output in self.outputs:
            output.write(message)
            output.flush()

    def flush(self):
        for output in self.outputs:
            output.flush()

sys.stdout = Tee(sys.stdout, open(log_file, "w", encoding="utf-8"))

# Ruta al archivo SQLite
ruta_db = Path(__file__).resolve().parents[2] / "back-end" / "variables.db"

# Conectar a la base de datos
conn = sqlite3.connect(ruta_db)
cursor = conn.cursor()

print("\n--- Verificación de base de datos SQLite ---\n")

# 1. Verificar existencia de tablas y que no estén vacías
tablas_requeridas = {"DATA", "VARIABLES_BCRA", "VARIABLES_EXTERNAS"}
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tablas_encontradas = {fila[0] for fila in cursor.fetchall()}

print("Tablas encontradas en la base de datos:")
for tabla in tablas_encontradas:
    print(f" - {tabla}")

faltantes = tablas_requeridas - tablas_encontradas
if faltantes:
    print(f"\nFaltan las siguientes tablas requeridas: {faltantes}")
else:
    print("\nTodas las tablas requeridas están presentes.")

    # Verificar que no estén vacías
    print("\nVerificando que las tablas requeridas no estén vacías:")
    for tabla in tablas_requeridas:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {tabla};")
            count = cursor.fetchone()[0]
            if count > 0:
                print(f" - La tabla '{tabla}' contiene {count} registros.")
            else:
                print(f" - La tabla '{tabla}' está vacía.")
        except Exception as e:
            print(f" - Error al contar registros en '{tabla}': {e}")

# 2. Verificar unicidad en varias columnas de la tabla 'DATA'
columnas_a_verificar = ["id", "nombreCorto", "nombreLargo", "descripcion"]

if "DATA" in tablas_encontradas:
    print("\nVerificando unicidad de columnas en la tabla DATA...")
    for columna in columnas_a_verificar:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM DATA WHERE {columna} IS NOT NULL;")
            total_no_nulos = cursor.fetchone()[0]

            cursor.execute(f"SELECT COUNT(DISTINCT {columna}) FROM DATA WHERE {columna} IS NOT NULL;")
            total_unicos = cursor.fetchone()[0]

            print(f"\nColumna: {columna}")
            print(f" - Valores no nulos: {total_no_nulos}")
            print(f" - Valores distintos: {total_unicos}")

            if total_no_nulos == total_unicos:
                print(f"Todos los valores de '{columna}' son únicos (ignorando nulos).")
            else:
                print(f"Hay duplicados en la columna '{columna}' (ignorando nulos).")

        except Exception as e:
            print(f"Error al verificar columna '{columna}': {e}")

# 3. Verificar no Nulos y valor correcto de fechas
columnas_sin_nulos = ["unidad", "fuente", "fechaInicio"]

if "DATA" in tablas_encontradas:
    print("\nVerificando columnas obligatorias sin valores nulos y formato de fecha...")

    for columna in columnas_sin_nulos:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM DATA WHERE {columna} IS NULL;")
            nulos = cursor.fetchone()[0]

            if nulos > 0:
                print(f"La columna '{columna}' tiene {nulos} valores nulos.")
            else:
                print(f"La columna '{columna}' no tiene valores nulos.")
        except Exception as e:
            print(f"Error al verificar columna '{columna}': {e}")

    # Verificar formato de fecha en 'fechaInicio'
    try:
        cursor.execute("SELECT fechaInicio FROM DATA WHERE fechaInicio IS NOT NULL;")
        fechas = cursor.fetchall()

        patron_fecha = re.compile(r"^\d{4}-\d{2}-\d{2}$")
        incorrectas = [f[0] for f in fechas if not patron_fecha.match(f[0])]

        if incorrectas:
            print(f"\nSe encontraron {len(incorrectas)} valores en 'fechaInicio' con formato incorrecto.")
            print("Ejemplos de valores incorrectos:", incorrectas[:5])
        else:
            print("\nTodos los valores en 'fechaInicio' tienen formato 'aaaa-mm-dd'.")
    except Exception as e:
        print(f"Error al verificar el formato de 'fechaInicio': {e}")

# Verificar validez de URL's
if "DATA" in tablas_encontradas:
    print("\nVerificando columna 'url': permitir NULL o '', validar formato solo si hay valor...")

    try:
        # Seleccionar todos los valores que NO son NULL ni vacíos
        cursor.execute("SELECT url FROM DATA WHERE url IS NOT NULL AND TRIM(url) != '';")
        urls = [fila[0] for fila in cursor.fetchall()]

        # Patrón de URL razonablemente válido
        patron_url = re.compile(r"^(https?|ftp)://[^\s/$.?#].[^\s]*$", re.IGNORECASE)

        urls_invalidas = [u for u in urls if not patron_url.match(u)]

        if urls_invalidas:
            print(f"Se encontraron {len(urls_invalidas)} valores no vacíos con formato de URL inválido.")
            print("Ejemplos de URLs inválidas:", urls_invalidas[:5])
        else:
            print("Todas las URLs no vacías y no nulas son válidas.")

        # Verificamos cuántas son NULL o vacías
        cursor.execute("SELECT COUNT(*) FROM DATA WHERE url IS NULL OR TRIM(url) = '';")
        count_permitidos = cursor.fetchone()[0]
        print(f"Hay {count_permitidos} valores NULL o vacíos, lo cual es permitido.")

    except Exception as e:
        print(f"Error al verificar la columna 'url': {e}")

tablas_a_verificar = ["VARIABLES_BCRA", "VARIABLES_EXTERNAS"]
columnas_requeridas = {"id", "fecha", "valor"}

print("\nVerificando tablas VARIABLES_BCRA y VARIABLES_EXTERNAS...")

for tabla in tablas_a_verificar:
    if tabla in tablas_encontradas:
        print(f"\nVerificando tabla '{tabla}'...")

        try:
            # Verificar que existan las columnas necesarias
            cursor.execute(f"PRAGMA table_info({tabla});")
            columnas_en_tabla = {col[1] for col in cursor.fetchall()}

            faltantes = columnas_requeridas - columnas_en_tabla

            if not faltantes:
                print(f"La tabla '{tabla}' contiene todas las columnas requeridas: {', '.join(columnas_requeridas)}.")
            else:
                print(f"La tabla '{tabla}' NO contiene las columnas: {', '.join(faltantes)}.")

            # Contar cuántas filas hay por cada id único y cruzar con la tabla 'DATA' usando 'nombreCorto'
            print(f"\nConteo de registros por 'id' en la tabla '{tabla}':")
            cursor.execute(f"""
                SELECT v.id, COUNT(*) as cantidad, d.nombreCorto
                FROM {tabla} v
                LEFT JOIN DATA d ON v.id = d.id
                GROUP BY v.id, d.nombreCorto
                ORDER BY v.id ASC;
            """)
            resultados = cursor.fetchall()

            for id_valor, cantidad, nombreCorto in resultados:
                nombreCorto = nombreCorto if nombreCorto else "Sin nombre corto"
                print(f"   ID {id_valor} ({nombreCorto}): {cantidad} registros")

        except Exception as e:
            print(f"Error al procesar la tabla '{tabla}': {e}")
    else:
        print(f"La tabla '{tabla}' no fue encontrada en la base de datos.")



# Cierre
conn.close()
print("\n--- Fin de la verificación ---\n")
