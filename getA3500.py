# Tener cuidado! El código no hace ningún tipo de chequeo de que la fecha sea válida.
# Si hay suficientes años de distancia el dia podria subir hasta más de 31 sin ningún problema.

import json
import requests
from datetime import datetime

ARCHIVO = 'a3500.csv'   # Archivo donde se van a guardar los datos
ID_VARIABLE = '5'       # Nro de ID que asigna la API del BCRA

# Solicita los datos desde fechaInicio hasta fechaFinalizacion y lo añade al archivo .csv
def solicitarGuardar(fechaInicio, fechaFinalizacion):
    respuesta = requests.get('https://api.bcra.gob.ar/estadisticas/v2.0/datosvariable/' + ID_VARIABLE + '/' + fechaInicio + '/' + fechaFinalizacion, verify = False)
    json_data = json.loads(respuesta.text)

    for i in range(0, len(json_data['results'])):
        text = json_data['results'][i]['fecha'] + "," + str(json_data['results'][i]['valor']) + "\n"
        
        with open(ARCHIVO,'a', encoding="utf-8") as fd:
            fd.write(text)

# Obtenemos la fecha actual en el formato yyyy-mm-dd
fechaHoy = datetime.today().strftime('%Y-%m-%d')

# Fecha donde empiezan los datos
fechaInicio = '2002-03-04'
primeraFecha = fechaInicio

# Diferencia de tiempo entre el inicio de la serie y hoy
diferenciaAño = int(fechaHoy[:4]) - int(fechaInicio[:4])
diferenciaMes = int(fechaHoy[5:7]) - int(fechaInicio[5:7])
diferenciaDia = int(fechaHoy[8:10]) - int(fechaInicio[8:10])

# Creamos/Vaciamos el archivo y agregamos los headers
with open(ARCHIVO,'w', encoding="utf-8") as fd:
    fd.write('fecha,valor\n')

# Hacemos una solicitud por año (límite impuesto por la API)
for i in range (0, diferenciaAño):
    year = int(fechaHoy[:4]) - diferenciaAño + i
    fechaInicio = str(year) + fechaInicio[4:8] + str(int(primeraFecha[-2:]) + i)      # Aumentamos los dias para no hacer solicitudes repetidas
    fechaFinalizacion = str(year + 1) + fechaInicio[4:8] + str(int(primeraFecha[-2:]) + i)

    print(fechaInicio + ' ' + fechaFinalizacion)

    # Hacemos la solicitud con los datos calculados
    solicitarGuardar(fechaInicio, fechaFinalizacion)

# Cuando terminamos las solicitudes anuales hacemos una para el tiempo restante
fechaFinalizacion = fechaFinalizacion[:8] + str(int(fechaFinalizacion[-2:]) + 1)

solicitarGuardar(fechaFinalizacion, fechaHoy)
