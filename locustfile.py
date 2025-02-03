# Condiciones de Prueba:
#   Max usuarios = 10.000
#   Incremento = 10/segundo
#   Host = http://localhost:5000

from locust import HttpUser, task

class Usuario(HttpUser):
    @task
    def test(self):
        self.client.get("/ajusteCER/4/2015-01-01/2023-01-01")