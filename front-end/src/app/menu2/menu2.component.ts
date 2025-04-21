import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/api.service';
import { Chart } from 'chart.js';
import { MenuItem } from '../models/menuItem.model';

@Component({
  selector: 'app-menu2',
  templateUrl: './menu2.component.html',
  styleUrls: ['./menu2.component.css']
})
export class Menu2Component {
  data: any[] = [];  
  valor: any[][] = []; // Valores organizados por índice
  fecha: any[][] = []; // Fechas organizadas por índice


  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.llenarData();
  }

  llenarData(): void {
    this.apiService.getAllVariables().subscribe((data: MenuItem[]) => {
      this.data = data.filter(variable => variable.idVariable > 100 || variable.idVariable === 27);

      this.data.forEach((item: any, index: number) => {
        this.apiService.getDataVariable(item.idVariable, '/datosvariable', '2024-02-05', '1').subscribe(variableData => {
          this.valor[index] = [];
          this.fecha[index] = [];

          for (const variable of variableData) {
            this.valor[index].push(variable.valor);
            this.fecha[index].push(variable.fecha);
          }

          this.crearMiniGrafico(index);
        });
      });
    });
  }

  guardarItem(item: any): void {
    this.apiService.setItemSeleccionado(item);
  }

  
  formatValor(item: any): string {
    const unidadesAdelante = ['$', '€'];
    return unidadesAdelante.includes(item.unidad) 
      ? `${item.unidad} ${item.valor}`  
      : `${item.valor} ${item.unidad}`; 
  }

  crearMiniGrafico(index: number): void {
    const canvasId = `menu2Chart${index}`; 
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;

    if (ctx) {
      
      const chartData = {
        labels: this.fecha[index],
        datasets: [{
          data: this.valor[index], 
          borderColor: 'teal', 
          borderWidth: 1,
          fill: false, 
          tension: 0.1,
          pointRadius: 0 
        }]
      };

      const options = {
        responsive: true,
        plugins: {
          legend: { display: false }, 
          tooltip: { enabled: false } 
        },
        scales: {
          x: { display: false },
          y: { display: false } 
        }
      };

      new Chart(ctx, {
        type: 'line', 
        data: chartData,
        options: options
      });
    } else {
      console.error(`Canvas con ID ${canvasId} no encontrado!`);
    }
  }
}
