# EconoVista

## Materia: Ingenieria de Sotware

## Integrantes
- Carneiro Emiliano
- Dominguez Tomás
- Pastor Hanna
- Zaracho Julieta


# Endpoints API:
La API intenta ser una recreación lo más precisa de la API del BCRA original, eliminando las restricciones arbitrarias de períodos máximos para la solicitud de datos a la vez que se agregan funciones extras.

### /principalesvariables:

- /principalesvariables => Devuelve el último dato de la base de datos para todas las variables disponibles.

### /datosvariable:

- /datosvariable/**[idVariable]** => Devuelve todos los datos disponibles en la base de datos para una variable.
- /datosvariable/**[idVariable]**/**[fechaDesde]** => Devuelve todos los datos disponibles en la base de datos para una variable a partir de una determinada fecha.
- /datosvariable/**[idVariable]**/**[fechaDesde]**/**[fechaHasta]** => Devuelve todos los datos disponibles entre dos fechas en la base de datos para una variable.

### /ajusteCER:

- /ajusteCER/variablessoportadas => Devuelve los id's de las variables soportadas por el ajuste CER.
- /ajusteCER/**[idVariable]** => Devuelve todos los valores para una determinada variable ajustada por CER (Inflación), no todas las variables soportan esta función, referirse a /variablessoportadas.
- ajusteCER/**[idVariable]**/**[fechaDesde]** => Devuelve todos los valores para una determinada variable ajustada por inflación a partir de una determinada fecha.
- ajusteCER/**[idVariable]**/**[fechaDesde]**/**[fechaHasta]** => Devuelve todos los valores para una determinada variable ajustada por inflación entre dos fechas.

## UTN - FRD 2024