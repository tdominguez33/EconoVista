import { getLocaleNumberSymbol } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { ApiService } from '../service/api.service';
import { MenuItem } from '../models/menuItem.model';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-variable',
  templateUrl: './variable.component.html',
  styleUrls: ['./variable.component.css']
})
export class VariableComponent {
  public chart: Chart | undefined;
  data: any = {};
  fecha: string[] = [];
  valor: number[] = [];
  itemActual: MenuItem | null = null;
  IdActual: number = 0;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.guardarItem();
    this.llenarData();
    this.hacerGrafico();

  }

  llenarData() {
    this.apiService.getDataVariable(this.IdActual).subscribe(data => {
      this.data = data;
      console.log("estoy graficando id ", this.IdActual);

      // Vaciar los arrays para evitar duplicaciones si llamas varias veces a llenarData()
      this.valor = [];
      this.fecha = [];

      for (const item of this.data) {
        this.valor.push(item.valor);
        this.fecha.push(item.fecha);
      }

      // Ahora tienes los datos llenados
      console.log("valores", this.valor);
      console.log("fecha", this.fecha);

      // Una vez que los datos se han llenado, se crea el gráfico
      this.hacerGrafico();
    });
  }

  hacerGrafico() {
    const data = {
      labels: this.fecha,
      datasets: [{
        label: "prueba",
        data: this.valor,
        fill: false,
        borderColor: 'red',
        tension: 0.1
      }]
    };

    // Destruye el gráfico anterior si ya existe
    if (this.chart) {
      this.chart.destroy();
    }

    // Crear el nuevo gráfico
    this.chart = new Chart("chart", {
      type: "line",
      data,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true // Asegúrate de que el eje Y comienza en cero
          }
        }
      }
    });
  }


  guardarItem() {
    this.itemActual = this.apiService.itemSeleccionado;
    this.IdActual = this.apiService.itemSeleccionado.idVariable;
    // console.log("Guardar item, variable", this.apiService.itemSeleccionado);
    // console.log("guardar iten, itemActual", this.itemActual);
    // console.log("guardar item, idActual", this.IdActual);
  }

  fechaSeleccionada(event: Event) {
    var button = event.target as HTMLElement;
    var buttonText = "";

    buttonText = button.innerText;

    console.log("buttonText", buttonText, button);
    switch (buttonText) {
      case "1S":
        console.log("Seleciono 1s");
        break;

      case "1M":
        console.log("Seleciono 1m");
        break;

      case "3M":
        console.log("Seleciono 3m");
        break;

      case "6M":
        console.log("Seleciono 6m");
        break;

      case "1A":
        console.log("Seleciono 1a");
        break;

      case "2A":
        console.log("Seleciono 2A");
        break;

      case "5A":
        console.log("Seleciono 5a");
        break;

      case "10A":
        console.log("Seleciono 10a");
        break;

    }

  }


}
