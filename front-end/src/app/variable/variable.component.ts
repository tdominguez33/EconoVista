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
  fechaActual: string = "" //ultima fecha que toma el grafico
  IdActual: number = 0;
  fechaInicial: string = "" //fecha en la que inicia el grafico
  fechaFinal: string = ""

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.fechaInicial = '2020-08-05';
    this.fechaFinal = this.fechaActual;

    this.guardarItem();

    this.llenarData();
    this.hacerGrafico();

  }

  guardarItem() {
    this.itemActual = this.apiService.itemSeleccionado;
    this.IdActual = this.apiService.itemSeleccionado.idVariable;
    this.fechaActual = this.apiService.itemSeleccionado.fecha;
    //console.log("Guardar item, variable", this.apiService.itemSeleccionado);
    // console.log("guardar iten, itemActual", this.itemActual);
    //console.log("guardar item, fechaActual", this.fechaActual);
  }

  fechaSeleccionada(event: Event) {
    var button = event.target as HTMLElement;
    var buttonText = "";
    var aux = ""
    buttonText = button.innerText;

    switch (buttonText) {
      case "1S":
        aux = this.restarDiasHabiles(this.fechaActual, 7);
        console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 1s");
        break;

      case "1M":
        aux = this.restarDiasHabiles(this.fechaActual, 30);
        console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 1m");
        break;

      case "3M":
        aux = this.restarDiasHabiles(this.fechaActual, 90);
        console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 3m");
        break;

      case "6M":
        aux = this.restarDiasHabiles(this.fechaActual, 180);
        console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 6m");
        break;

      case "1A":
        aux = this.restarDiasHabiles(this.fechaActual, 365);
        console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 1a");
        break;

      case "2A":
        aux = this.restarDiasHabiles(this.fechaActual, 730);
        console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 2A");
        break;

      case "5A":
        aux = this.restarDiasHabiles(this.fechaActual, 1825);
        console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 5a");
        break;

      case "10A":
        aux = this.restarDiasHabiles(this.fechaActual, 3650);
        console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 10a");
        break;

    }

    this.llenarData();

  }
    
  llenarData() {
    this.apiService.getDataVariable(this.IdActual, this.fechaInicial, this.fechaActual).subscribe(data => {
      this.data = data;
      console.log("estoy graficando id ", this.IdActual);
      console.log("fechaInial en llenar data", this.fechaInicial);

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

  restarDiasHabiles(fechaStr: string, diasHabiles: number): string {
    // Convertir la cadena a objeto Date
    let fecha = new Date(fechaStr);
    let diasRestantes = diasHabiles;

    while (diasRestantes > 0) {
      // Restar un día a la fecha
      fecha.setDate(fecha.getDate() - 1);

      // Comprobar si el día resultante no es sábado (6) ni domingo (0)
      const diaSemana = fecha.getDay();

      if (diaSemana !== 0 && diaSemana !== 6) {
        diasRestantes--;
      }
    }

    // Convertir la fecha de nuevo a string en formato YYYY-MM-DD
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
    const dia = String(fecha.getDate()).padStart(2, '0');
    console.log(anio, mes, dia)
    return `${anio}-${mes}-${dia}`;
  }
}
