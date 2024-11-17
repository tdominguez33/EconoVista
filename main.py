import os
import subprocess
from time import sleep
import schedule

# Actualizamos la base de datos y esperamos a que se actualice la DB
os.system("python DB_actualizar.py")

# Ejecutamos los comandos como subprocesos
subprocess.Popen(["python","api.py"])
subprocess.Popen(["lcp", "--proxyUrl", "http://127.0.0.1:5000"], shell=True)

# Finalmente abrimos el front
os.chdir("front-end")
os.system("ng serve")

def actualizarDB():
    os.system("python DB_actualizar.py")

schedule.every().day.at("18:30", "America/Buenos_Aires").do(actualizarDB)

while True:
    sleep(7200)
    schedule.run_pending()
    