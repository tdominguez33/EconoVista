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
  fechaActual: string = ""; //ultima fecha que toma el grafico
  IdActual: number = 0;
  fechaInicial: string = ""; //fecha en la que inicia el grafico
  fechaFinal: string = "";
  url: string = "/datosvariable";
  url1: string = "/ajusteCER";
  public listaVariables: number[] = []
  nombreLargo: string = ""
  fechaHeader: string = ""


  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.fechaInicial = '2020-08-05';
    this.fechaFinal = this.fechaActual;
    const id = localStorage.getItem('idVariableSeleccionada');
    if (id) {
      this.IdActual = +id;  // Convertir a número
      console.log('la variable seleccionada es ', this.IdActual)
    } else {
      console.log('No se encontró ninguna variable seleccionada.');
    }

    const nom = localStorage.getItem('nombreLargo');
    
    if (nom) {
      this.nombreLargo = nom;
      console.log('Prueba de nombre  ', nom)
    } else {
      console.log('No se pudo obtener el nombre');
    }

    const fechaAct = localStorage.getItem('fechaAct');

    if (fechaAct){
      this.fechaHeader = fechaAct;
      console.log('Prueba de fecha ', fechaAct)
    }else{
      console.log('No se pudo encontrar la fecha')
    }




    this.llenarData();
    this.hacerGrafico();
    //this.fechaInicial = '2020-08-05';
    //this.fechaFinal = this.fechaActual;

    this.guardarItem();

    this.llenarData();
    this.cargarVariablesSoportadas();
    //this.hacerGrafico();


    

  }

  guardarItem() {
    this.itemActual = this.apiService.itemSeleccionado;
    this.IdActual = this.apiService.itemSeleccionado.idVariable;
    localStorage.setItem('idVariableSeleccionada', this.IdActual.toString());  // Guardar en localStorage

    this.nombreLargo = this.apiService.itemSeleccionado.nombreLargo;
    localStorage.setItem('nombreLargo', this.nombreLargo);  // Guardar en localStorage

    this.fechaActual = this.apiService.itemSeleccionado.fecha;
    /*localStorage.setItem('fecha', this.fechaActual);  // Guardar en localStorage*/


    
    

   /* if (this.itemActual){
    this.prueba = this.itemActual.fecha
    localStorage.setItem('algo', this.prueba);  // Guardar en localStorage
    console.log('fecha verga ', this.prueba)
    }*/

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
        //console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 1s");
        break;

      case "1M":
        aux = this.restarDiasHabiles(this.fechaActual, 30);
        //console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 1m");
        break;

      case "3M":
        aux = this.restarDiasHabiles(this.fechaActual, 90);
        //console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 3m");
        break;

      case "6M":
        aux = this.restarDiasHabiles(this.fechaActual, 180);
        //console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 6m");
        break;

      case "1A":
        aux = this.restarDiasHabiles(this.fechaActual, 365);
        //console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 1a");
        break;

      case "2A":
        aux = this.restarDiasHabiles(this.fechaActual, 730);
        //console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 2A");
        break;

      case "5A":
        aux = this.restarDiasHabiles(this.fechaActual, 1825);
        //console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 5a");
        break;

      case "10A":
        aux = this.restarDiasHabiles(this.fechaActual, 3650);
        //console.log("aux ", aux);
        this.fechaInicial = aux;
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 10a");
        break;

    }

    this.llenarData();

  }

  llenarData() {
      //this.apiService.getDataVariable(this.IdActual, this.url, this.fechaInicial, this.fechaActual).subscribe(data => {
      this.apiService.getDataVariable(this.IdActual, this.url, this.fechaInicial, '2024-10-24'/*this.fechaActual*/).subscribe(data => {
      this.data = data;
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
      const fechas = this.fecha;
      const ultimaFecha = fechas[fechas.length - 1];
      console.log(ultimaFecha); // Salida: 5
      localStorage.setItem('fechaAct', ultimaFecha);  // Guardar en localStorage
      

      console.log('id Variable', this.IdActual)

      // Una vez que los datos se han llenado, se crea el gráfico
      this.hacerGrafico();
    });
  }


  llenarDataCER(){
    this.apiService.getDataVariableCER(this.IdActual, this.url1).subscribe(data => {
      this.data = data;
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
      console.log('id Variable', this.IdActual)

      // Una vez que los datos se han llenado, se crea el gráfico
      this.hacerGrafico();
    });
  }

  hacerGrafico() {
    const data = {
      labels: this.fecha,
      datasets: [{
        label: "",
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
        }, 
        layout:{
          padding: 10
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
    return `${anio}-${mes}-${dia}`;
  }


  public cargarVariablesSoportadas(): void {
    this.apiService.getVarSoportadas().subscribe(
      (data: string[]) => {
        // Convertir las cadenas a números
        this.listaVariables = data.map(item => Number(item));

        // Imprimir para verificar
        console.log('Lista de variables convertida a números:', this.listaVariables);
      }
    );
  }


  ajusteCER() {
    //const varCER: number[] = [4, 5, 102, 103, 104, 105]
    
    if (this.listaVariables.includes(this.IdActual)) {
    this.url1 = "/ajusteCER";
    this.llenarDataCER();
    this.hacerGrafico();
  } else{
    alert('La variable no se ajusta por CER', )
  }
}
}
