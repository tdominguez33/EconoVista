# Tener cuidado! El código no hace ningún tipo de chequeo de que la fecha sea válida.
# Si hay suficientes años de distancia el dia podria subir hasta más de 31 sin ningún problema.

import json
import requests
from datetime import datetime

# Solicita los datos desde starting_date hasta finishing_date y lo añade al archivo .cvs
def requestAndWrite(starting_date, finishing_date):
    response = requests.get('https://api.bcra.gob.ar/estadisticas/v2.0/datosvariable/5/' + starting_date + '/' + finishing_date, verify = False)
    json_data = json.loads(response.text)

    for i in range(0, len(json_data['results'])):
        text = json_data['results'][i]['fecha'] + ";" + str(json_data['results'][i]['valor']) + "\n"
        
        with open('document.csv','a', encoding="utf-8") as fd:
            fd.write(text)

# Obtenemos la fecha actual en el formato yyyy-mm-dd
todays_date = datetime.today().strftime('%Y-%m-%d')

# Fecha donde empiezan los datos
first_date = '2002-03-04'
starting_date = '2002-03-04'

# Diferencia de tiempo entre el inicio de la serie y hoy
difference_year = int(todays_date[:4]) - int(starting_date[:4])
difference_month = int(todays_date[5:7]) - int(starting_date[5:7])
difference_day = int(todays_date[8:10]) - int(starting_date[8:10])

# Hacemos una solicitud por año (límite impuesto por la API)
for i in range (0, difference_year):
    year = int(todays_date[:4]) - difference_year + i
    starting_date = str(year) + starting_date[4:8] + str(int(first_date[-2:]) + i)      # Aumentamos los dias para no hacer solicitudes repetidas
    finishing_date = str(year + 1) + starting_date[4:8] + str(int(first_date[-2:]) + i)

    print(starting_date + ' ' + finishing_date)

    # Hacemos la solicitud con los datos calculados
    requestAndWrite(starting_date, finishing_date)

# Cuando terminamos las solicitudes anuales hacemos una para el tiempo restante
finishing_date = finishing_date[:8] + str(int(finishing_date[-2:]) + 1)

requestAndWrite(finishing_date, todays_date)
