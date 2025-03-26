# Funciones personalizadas para cada tipo de variable que utiliza una API externa

import datetime

# Toma una respuesta json ya tratada con json.loads(respuesta.text)
def riesgoPais(respuesta, id, fechaInicio, fechaFinalizacion, cursor, conn):

    fechaInicioDatetime         = datetime.date(int(fechaInicio[:4]), int(fechaInicio[5:7]), int(fechaInicio[8:10]))
    fechaFinalizacionDatetime   = datetime.date(int(fechaFinalizacion[:4]), int(fechaFinalizacion[5:7]), int(fechaFinalizacion[8:10]))

    for result in respuesta:
        fecha = result['fecha']
        valor = str(result['valor'])    # Valor es un número en la API
                    
        # Convertimos la fecha que estamos observando a datetime para comparala
        fechaDatetime = datetime.date(int(fecha[:4]), int(fecha[5:7]), int(fecha[8:10]))

        # Si la fecha obtenida está en el rango deseado la agregamos a la DB
        if fechaInicioDatetime < fechaDatetime < fechaFinalizacionDatetime:
            # Insertar en la base de datos
            cursor.execute("INSERT INTO VARIABLES_EXTERNAS (id, fecha, valor) VALUES (?, ?, ?)", (id, fecha, valor))
                
    conn.commit()

def dolares(respuesta, id, fechaInicio, fechaFinalizacion, cursor, conn):
    
    fechaInicioDatetime         = datetime.date(int(fechaInicio[:4]), int(fechaInicio[5:7]), int(fechaInicio[8:10]))
    fechaFinalizacionDatetime   = datetime.date(int(fechaFinalizacion[:4]), int(fechaFinalizacion[5:7]), int(fechaFinalizacion[8:10]))

    for result in respuesta:
        fecha = result['fecha']
        valor = str(result['venta'])    # Precio de Venta señalado por la API

        # Convertimos la fecha que estamos observando a datetime para comparala
        fechaDatetime = datetime.date(int(fecha[:4]), int(fecha[5:7]), int(fecha[8:10]))

        # Si la fecha obtenida está en el rango deseado la agregamos a la DB
        if fechaInicioDatetime < fechaDatetime < fechaFinalizacionDatetime:
            # Insertar en la base de datos
            cursor.execute("INSERT INTO VARIABLES_EXTERNAS (id, fecha, valor) VALUES (?, ?, ?)", (id, fecha, valor))
                
    conn.commit()
