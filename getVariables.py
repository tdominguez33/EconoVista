import json
import requests
import datetime
from dateutil.relativedelta import relativedelta
import pandas as pd

# 5     -> A3500
# 30    -> CER
VARIABLES_ID = [5, 30]
VARIABLES_INICIO = ['2002-03-04', '2002-03-04']

# Calcula la diferencia en años entre dos fechas
def diferenciaAños(fecha1, fecha2):
    # Verificamos cual es más antigua
    if fecha1 > fecha2:
        fecha1, fecha2 = fecha2, fecha1

    # Calculamos la diferencia en años
    diferencia = fecha2.year - fecha1.year

    # Verificamos si la fecha2 es antes del aniversario de fecha1 en el año actual
    if (fecha2.month, fecha2.day) < (fecha1.month, fecha1.day):
        diferencia -= 1

    return diferencia


# Solicita los datos de la variable con un id desde fechaInicio hasta fechaFinalizacion y lo añade al archivo
def solicitarGuardar(id, fechaInicio, fechaFinalizacion, archivo):
    try:
        respuesta = requests.get('https://api.bcra.gob.ar/estadisticas/v2.0/datosvariable/' + id + '/' + fechaInicio + '/' + fechaFinalizacion, verify = False)
        json_data = json.loads(respuesta.text)

        for i in range(0, len(json_data['results'])):
            text = json_data['results'][i]['fecha'] + "," + str(json_data['results'][i]['valor']) + "\n"
            
            with open(archivo,'a', encoding="utf-8") as fd:
                fd.write(text)
        
        return 0
    
    except:
        return 1


# Solicita todas las variables al BCRA (desde cero, se borra cualquier dato anterior)
def obtenerVariables():

    # Obtenemos la fecha actual
    fechaHoy = datetime.date.today()

    # Vamos a buscar las variables en la lista VARIABLES_ID
    for i in range(0, len(VARIABLES_ID)):
        id = str(VARIABLES_ID[i])
        nombreArchivo = id + '.csv'

        # Creamos/Vaciamos el archivo y agregamos los headers
        with open(nombreArchivo,'w', encoding="utf-8") as fd:
            fd.write('fecha,valor\n')

        # Extraemos los valores de las fechas y los convertimos a una fecha para calcular cosas
        fechaInicio = datetime.date(int(VARIABLES_INICIO[0][:4]), int(VARIABLES_INICIO[0][5:7]), int(VARIABLES_INICIO[0][8:10]))

        diferenciaAño = diferenciaAños(fechaInicio, fechaHoy)
        
        # Hacemos una solicitud por cada año (límite impuesto por la API) y una solicitud para completar hasta la fecha actual
        for i in range (0, diferenciaAño + 1):
            if(i != diferenciaAño):
                inicio = fechaInicio + relativedelta(years = i, days = i)               # Aumentamos la fecha para no hacer solicitudes repetidas
                finalizacion = fechaInicio + relativedelta(years = i + 1, days = i)     # Aumentamos la fecha para no hacer solicitudes repetidas

                # Hacemos la solicitud con las fechas en formato yyyy-mm-dd
                solicitarGuardar(id, inicio.strftime('%Y-%m-%d'), finalizacion.strftime('%Y-%m-%d'), nombreArchivo)
            else:
                # Solicitamos los datos hasta el dia de hoy
                finalizacion = fechaInicio + relativedelta(years = i, days = i)
                solicitarGuardar(id, finalizacion.strftime('%Y-%m-%d'), fechaHoy.strftime('%Y-%m-%d'), nombreArchivo)


# Actualiza las variables con hasta un año de atraso, para más tiempo ejecutar obtenerVariables()
def actualizarVariables():
     # Obtenemos la fecha actual
    fechaHoy = datetime.date.today()

    # Vamos a actualiar las variables en la lista VARIABLES_ID
    for i in range(0, len(VARIABLES_ID)):
        id = str(VARIABLES_ID[i])
        nombreArchivo = id + '.csv'

        csv = pd.read_csv(nombreArchivo)
        ultimaFecha = csv.fecha[len(csv.fecha) - 1]     # Ultima fecha para la que se tiene el dato

        # Convertimos el texto en una fecha utilizable
        ultimaFecha = datetime.date(int(ultimaFecha[:4]), int(ultimaFecha[5:7]), int(ultimaFecha[8:10]))
        
        # Si hoy no es el último dia de datos disponibles intentamos ver si hay datos más nuevos
        if(ultimaFecha < fechaHoy):
            solicitarGuardar(id, str(ultimaFecha + relativedelta(days = 1)), str(fechaHoy), nombreArchivo)
