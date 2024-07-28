import pandas as pd

ARCHIVO = 'a3500-cer.csv'   # Archivo donde se van a guardar los datos

# Abrimos los archivos necesarios
cer = pd.read_csv('cer.csv')
a3500 = pd.read_csv('a3500.csv')

# Creamos/Vaciamos el archivo y agregamos los headers
with open(ARCHIVO,'w', encoding="utf-8") as fd:
    fd.write('fecha,valor\n')

# Último valor disponible de CER, se usa para comparar los valores anteriores
cerActual = cer.valor[len(cer) - 1]

# Como no hay la misma cantidad de datos de CER que de A3500 hay que desacoplar la busqueda
# CER tiene su propio índice
indiceBusqueda = 0

for i in range(0, len(a3500)):

    # Buscamos que las fechas coincidan
    while(a3500.fecha[i] != cer.fecha[indiceBusqueda]):
        indiceBusqueda += 1
    
    cerCorriente = cer.valor[indiceBusqueda]                # CER a valores corrientes
    cerAumento = cerActual / cerCorriente                   # Cuanto aumentó el CER hasta hoy
        
    a3500Corriente = a3500.valor[i]                         # A3500 a valores Corrientes
    a3500Constante = round(a3500Corriente * cerAumento, 2)  # A3500 a valores Constantes

    linea = a3500.fecha[i] + ',' + str(a3500Constante) + '\n'

    with open(ARCHIVO,'a', encoding="utf-8") as fd:
        fd.write(linea)

    indiceBusqueda += 1

# Graficar el resultado
import matplotlib.pyplot as plt 
x = []
y = []

a3500Ajuste = pd.read_csv(ARCHIVO)
      
for i in range(0, len(a3500Ajuste)): 
    x.append(a3500Ajuste.fecha[i]) 
    y.append(a3500Ajuste.valor[i]) 
  
plt.bar(x, y, color = 'g', width = 0.72) 
plt.xlabel('Fecha') 
plt.ylabel('Precio') 
plt.title('A3500 Ajustado por CER') 
plt.legend() 
plt.show() 