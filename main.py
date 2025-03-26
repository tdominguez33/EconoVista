import os
from time import sleep
from threading import Thread
import schedule

def api():
    os.system("python api.py")

def proxy():
    os.system("lcp --proxyUrl http://127.0.0.1:5000")

def frontEnd():
    os.chdir("..")
    os.chdir("front-end")
    os.system("ng serve")

def actualizarDB():
    schedule.every().day.at("18:30", "America/Buenos_Aires").do(actualizarDB)

    while True:
        sleep(7200)
        schedule.run_pending()


# Actualizamos la base de datos y esperamos a que se actualice la DB
os.chdir("back-end")
os.system("python db_actualizar.py")

hiloApi = Thread(target=api)
hiloProxy = Thread(target=proxy)
hiloFront = Thread(target=frontEnd)
hiloActualizarDB = Thread(target=actualizarDB)

hiloApi.start()
hiloProxy.start()
hiloFront.start()
hiloActualizarDB.start()

hiloApi.join()
hiloProxy.join()
hiloFront.join()
hiloActualizarDB.join()
