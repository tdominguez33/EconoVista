import { getLocaleNumberSymbol } from '@angular/common';
import { Component, ChangeDetectionStrategy, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { ApiService } from '../service/api.service';
import { MenuItem } from '../models/menuItem.model';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog,  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent} from '@angular/material/dialog';
import { DialogoComponent } from '../dialogo/dialogo.component';

@Component({
  selector: 'app-variable',
  templateUrl: './variable.component.html',
  styleUrls: ['./variable.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariableComponent {
  public chart: Chart | undefined;
  data: any = {};
  fecha: string[] = [];
  valor: number[] = [];
  itemActual: MenuItem | null = null;
  fechaActual: string = ""; //ultima fecha que toma el grafico
  IdActual: number = 0;
  fechaInicial: string = "2023-08-05"; //fecha en la que inicia el grafico
  url: string = "/datosvariable";
  url1: string = "/ajusteCER";
  public listaVariables: number[] = []
  nombreLargo: string = ""
  fechaHeader: string = ""
  descripcion: string = ""
  valorActual: string = ""
  visibilidadBoton:boolean = false;
  pasoDias: string="12"; //por defecto trae 30 datos en el año
  readonly dialog = inject(MatDialog);
  
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
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
      console.log('Prueba de fecha actual', fechaAct)
    }else{
      console.log('No se pudo encontrar la fecha')
    }

    const desc = localStorage.getItem('descripcion');

    if (desc){
      this.descripcion = desc;
      console.log('Prueba de fecha ', desc)
    }else{
      console.log('No se pudo encontrar la descripcion')
    }

    const valorAct = localStorage.getItem('valorAct');
    if (valorAct){
      this.valorActual = valorAct;
      console.log('Prueba de valor actual ', valorAct)
    }else{
      console.log('No se pudo encontrar el valor')
    }

    this.llenarData();
    //this.hacerGrafico();
    this.guardarItem();
    this.cargarVariablesSoportadas();
    this.visibilidadCER();

  }

  guardarItem() {
    this.itemActual = this.apiService.itemSeleccionado;
    this.IdActual = this.apiService.itemSeleccionado.idVariable;
    localStorage.setItem('idVariableSeleccionada', this.IdActual.toString());  // Guardar en localStorage

    this.nombreLargo = this.apiService.itemSeleccionado.nombreLargo;
    localStorage.setItem('nombreLargo', this.nombreLargo);  // Guardar en localStorage

    this.descripcion = this.apiService.itemSeleccionado.descripcion;
    localStorage.setItem('descripcion', this.descripcion);  // Guardar en localStorage
    
    this.fechaActual = this.apiService.itemSeleccionado.fecha;
    console.log("fecha actual = ", this.fechaActual);

    this.valorActual = this.apiService.itemSeleccionado.valor;
    localStorage.setItem('valorAct', this.valorActual);
    console.log("valor actual = ", this.valorActual);
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
        this.pasoDias = "1" // trae todos los datos de una semana
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 1s");
        break;

      case "1M":
        aux = this.restarDiasHabiles(this.fechaActual, 30);
        //console.log("aux ", aux);
        this.fechaInicial = aux;
        this.pasoDias = "1" // trae todos los datos de un mes
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 1m");
        break;

      case "3M":
        aux = this.restarDiasHabiles(this.fechaActual, 90);
        this.fechaInicial = aux;
        this.pasoDias = "3" //30 datos en tres meses
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 3m");
        break;

      case "6M":
        aux = this.restarDiasHabiles(this.fechaActual, 180);
        //console.log("aux ", aux);
        this.fechaInicial = aux;
        this.pasoDias = "6" //30 datos en sies meses
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 6m");
        break;

      case "1A":
        aux = this.restarDiasHabiles(this.fechaActual, 365);
        //console.log("aux ", aux);
        this.fechaInicial = aux;
        this.pasoDias = "12" 
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 1a");
        break;

      case "2A":
        aux = this.restarDiasHabiles(this.fechaActual, 730);
        //console.log("aux ", aux);
        this.fechaInicial = aux;
        this.pasoDias = "24"
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 2A");
        break;

      case "5A":
        aux = this.restarDiasHabiles(this.fechaActual, 1825);
        //console.log("aux ", aux);
        this.fechaInicial = aux;
        this.pasoDias = "60"
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 5a");
        break;

      case "10A":
        aux = this.restarDiasHabiles(this.fechaActual, 3650);
        //console.log("aux ", aux);
        this.fechaInicial = aux;
        this.pasoDias = "121"
        console.log("fechaInicial", this.fechaInicial)
        console.log("Seleciono 10a");
        break;

    }

    this.llenarData();

  }

  llenarData() {
      this.apiService.getDataVariable(this.IdActual, this.url, this.fechaInicial, this.pasoDias).subscribe(data => {
        this.data = data;
        console.log("fechaInial en llenar data", this.fechaInicial);

        // Vaciar los arrays para evitar duplicaciones si llamas varias veces a llenarData()
        this.valor = [];
        this.fecha = [];

        for (const item of this.data) {
          this.valor.push(item.valor);
          this.fecha.push(item.fecha);
        }

        // Datos llenados
        //console.log("valores", this.valor);
        
        //console.log("fecha", this.fecha);
        const fechas = this.fecha;
        const ultimaFecha = fechas[fechas.length - 1];
        //console.log(ultimaFecha); // Salida: 5
        localStorage.setItem('fechaAct', ultimaFecha);  // Guardar en localStorage
        

        //console.log('id Variable', this.IdActual)

        // Una vez que los datos se han llenado, se crea el gráfico
        this.hacerGrafico();
    });
  }


  llenarDataCER(){
    this.apiService.getDataVariableCER(this.IdActual, this.url1, this.fechaInicial).subscribe(data => {
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
      // console.log("valores", this.valor);
      // console.log("fecha", this.fecha);
      // console.log('id Variable', this.IdActual)

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

        console.log('Lista de variables convertida a números:', this.listaVariables);
      }
    );
  }


  ajusteCER() {
    if (this.listaVariables.includes(this.IdActual)) {
    this.url1 = "/ajusteCER";
    this.llenarDataCER();
    this.hacerGrafico();
  } else{
    alert('La variable no se ajusta por CER' )
  }
}

  openDialog(){
  this.dialog.open(DialogoComponent);
}

  visibilidadCER(){
    const varCER: number[] = [4, 5, 102, 103, 104, 105]
  
    if (this.listaVariables.includes(this.IdActual))  {
      console.log(this.listaVariables)
      console.log("listaVariables")
      this.visibilidadBoton = true;
    }
    console.log("VISIBILIDAD BOTON", this.visibilidadBoton);
  }

}
