import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/api.service';
import { Chart } from 'chart.js';
import { MenuItem } from '../models/menuItem.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  data: any[] = []; // Almacena las variables obtenidas
  valor: any[][] = []; // Valores organizados por índice
  fecha: any[][] = []; // Fechas organizadas por índice
  

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.llenarData();
  }

  llenarData(): void {
    // Obtener todas las variables
    const listaVar = [1,4,5,6,15,29,30,31];
this.apiService.getAllVariables().subscribe((data: MenuItem[]) => {
  this.data = data.filter(variable => listaVar.includes(variable.idVariable));


      // Para cada variable obtenida, hacer una solicitud adicional para sus detalles
      this.data.forEach((item: any, index: number) => {
        //por defecto, se traen los datos del ultimo año de cada variable
        this.apiService.getDataVariable(item.idVariable, '/datosvariable', '2024-02-05', '1').subscribe(variableData => {
          this.valor[index] = [];
          this.fecha[index] = [];

          // Guardar los valores y fechas en arrays separados
          for (const variable of variableData) {
            this.valor[index].push(variable.valor);
            this.fecha[index].push(variable.fecha);
          }

          // Crear el gráfico para esta variable una vez que los datos estén disponibles
          this.crearMiniGrafico(index);
        });
      });
    });
  }

  guardarItem(item: any): void {
    // Guardar la variable seleccionada a través del servicio
    this.apiService.setItemSeleccionado(item);
  }


  formatValor(item: any): string {
    const unidadesAdelante = ['$', '€']; // Agrega más unidades si es necesario
    return unidadesAdelante.includes(item.unidad) 
      ? `${item.unidad} ${item.valor}`  // Espacio después de la unidad
      : `${item.valor} ${item.unidad}`; // Espacio antes de la unidad
  }
  
  

  crearMiniGrafico(index: number): void {
    const canvasId = `menuChart${index}`; // ID único para cada gráfico
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;

    if (ctx) {
      // Datos y configuración del gráfico
      const chartData = {
        labels: this.fecha[index], // Fechas como etiquetas del eje X
        datasets: [{
          data: this.valor[index], // Valores en el eje Y
          borderColor: 'teal', // Color de la línea
          borderWidth: 1,
          fill: false, // No llenar debajo de la línea
          tension: 0.1, // Suavizado de la curva
          pointRadius: 0 // No mostrar puntos
        }]
      };

      const options = {
        responsive: true,
        plugins: {
          legend: { display: false }, // Ocultar la leyenda
          tooltip: { enabled: false } // Deshabilitar los tooltips
        },
        scales: {
          x: { display: false }, // Ocultar el eje X
          y: { display: false } // Ocultar el eje Y
        }
      };

      // Crear el gráfico con Chart.js
      new Chart(ctx, {
        type: 'line', // Tipo de gráfico
        data: chartData,
        options: options
      });
    } else {
      //console.error(`Canvas con ID ${canvasId} no encontrado!`);
    }
  }
}
