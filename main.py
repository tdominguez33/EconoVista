import os
from time import sleep
from threading import Thread
import schedule
from pathlib import Path

ruta_front_end  = Path(__file__).resolve().parents[0] / "front-end"
ruta_back_end   = Path(__file__).resolve().parents[0] / "back-end"
ruta_db_test    = Path(__file__).resolve().parents[0] / "tests" / "database"


def api():
    os.chdir(ruta_back_end)
    os.system("python api.py")

def proxy():
    os.system("lcp --proxyUrl http://127.0.0.1:5000")

def frontEnd():
    os.chdir(ruta_front_end)
    os.system("ng serve")

# Función que corre diariamente
def actualizarDB():
    os.chdir(ruta_back_end)
    os.system("db_actualizar.py")
    os.chdir(ruta_db_test)
    os.system("db_test.py")


def programarActualizacion():
    schedule.every().day.at("18:30", "America/Buenos_Aires").do(actualizarDB)

    while True:
        sleep(7200)
        schedule.run_pending()


# Actualizamos la base de datos y esperamos a que se actualice la DB
actualizarDB()

hiloApi = Thread(target=api)
hiloProxy = Thread(target=proxy)
hiloFront = Thread(target=frontEnd)
hiloProgramarActualizacion = Thread(target=programarActualizacion)

hiloApi.start()
hiloProxy.start()
hiloFront.start()
hiloProgramarActualizacion.start()

hiloApi.join()
hiloProxy.join()
hiloFront.join()
hiloProgramarActualizacion.join()
