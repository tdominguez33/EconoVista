import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../service/api.service';
import { MenuItem } from '../models/menuItem.model';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  data: any = [];
  valor: any[] = [];
  fecha: any[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.llenarData()
  }

  llenarData() {
   /*  this.apiService.getAllVariables().subscribe(data => {
      this.data = data;
      console.log(this.data);
    })*/
     this.apiService.getAllVariables().subscribe(data => {
        this.data = data;
        
        // Para cada item en los datos obtenidos, hacer una solicitud adicional para obtener los detalles
        this.data.forEach((item: any, index: number) => {
          this.apiService.getDataVariable(item.idVariable, '/datosvariable','2023-08-05', '1').subscribe(variableData => {
            this.valor[index] = [];
            this.fecha[index] = [];
  
            // Guardar los valores y las fechas en arrays individuales por índice
            for (const variable of variableData) {
              this.valor[index].push(variable.valor);
              this.fecha[index].push(variable.fecha);
            }
  
            // Crear el gráfico para este elemento después de obtener los datos
            this.crearMiniGrafico(index);
          });
        });
      });
  }

  guardarItem(item: any) {
    this.apiService.setItemSeleccionado(item);
  }

  crearMiniGrafico(index: number) {
    const canvasId = `miniChart${index}`;  // ID único para cada gráfico

    const chartData = {
      labels: this.fecha[index],  // Fechas obtenidas
      datasets: [{
        data: this.valor[index],   // Valores obtenidos
        borderColor: 'teal',
        borderWidth: 1,
        fill: false,
        tension: 0.1,
        pointRadius: 0  // Deshabilitar los puntos
      }]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }  // Deshabilitar los tooltips
      },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      
    };

    // Crear el gráfico
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: options
      });
    } else {
      console.error(`Canvas with id ${canvasId} not found!`);
    }
  }
}
