import { getLocaleNumberSymbol } from '@angular/common';
import { Component, ChangeDetectionStrategy, ElementRef, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { ApiService } from '../service/api.service';
import { MenuItem } from '../models/menuItem.model';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';
import { DialogoComponent } from '../dialogo/dialogo.component';

@Component({
  selector: 'app-variable',
  templateUrl: './variable.component.html',
  styleUrls: ['./variable.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariableComponent {

  itemActual: MenuItem = {
    idVariable: 0,
    nombreCorto: "",
    nombreLargo: "...",
    descripcion: "",
    unidad: "",
    fuente: "",
    fecha: "",
    valor: 0
  }

  public chart: Chart | undefined;
  fechaInicial: string = ""; //fecha en la que inicia el grafico
  visibilidadBotonCER: boolean = true;
  pasoDias: string = "4"; //por defecto trae 60 datos en el año
  readonly dialog = inject(MatDialog);
  botonActivo: string | null = null;
  botonCERDesactivado = false;
  //cargaCompleta: boolean = false;


  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) { }

  async ngOnInit(): Promise<void> {
    await this.cargarVariablesSeleccionadas();
    await this.guardarItem();
    await this.llenarData(this.calcularFechas(0, 0, 1));
    await this.cargarVariablesSoportadas();
    await this.visibilidadCER();
    this.cdr.detectChanges(); // forzar la deteccion de cambios

  }

  async cargarVariablesSeleccionadas() {
    const id = localStorage.getItem('idVariableSeleccionada');
    if (id) {
      this.itemActual.idVariable = Number(id);  // Convertir a número
    } else {
      console.log('No se encontró ninguna variable seleccionada.');
    }

    const nom = localStorage.getItem('nombreLargo');
    if (nom) {
      this.itemActual.nombreLargo = nom;

    } else {
      console.log('No se pudo obtener el nombre');
    }

    const fechaAct = localStorage.getItem('fechaAct');
    if (fechaAct) {
      this.itemActual.fecha = fechaAct;
    } else {
      console.log('No se pudo encontrar la fecha')
    }

    const desc = localStorage.getItem('descripcion');
    if (desc) {
      this.itemActual.descripcion = desc;
    } else {
      console.log('No se pudo encontrar la descripcion')
    }

    const valorAct = localStorage.getItem('valorAct');
    if (valorAct) {
      this.itemActual.valor = Number(valorAct);
    } else {
      console.log('No se pudo encontrar el valor')
    }

    const uni = localStorage.getItem('unidad');
    if (uni) {
      this.itemActual.unidad = uni;
    }

    const fechasGuardadas = localStorage.getItem('graficoFechas');
    const valoresGuardados = localStorage.getItem('graficoValores');

    if (fechasGuardadas && valoresGuardados) {
      this.hacerGrafico(JSON.parse(valoresGuardados), JSON.parse(fechasGuardadas));
    }
    this.cdr.detectChanges();
  }

  guardarItem() {
    this.itemActual = this.apiService.itemSeleccionado;

    if (this.itemActual) {
      localStorage.setItem('idVariableSeleccionada', this.itemActual.idVariable.toString());
      localStorage.setItem('nombreLargo', this.itemActual.nombreLargo);
      localStorage.setItem('descripcion', this.itemActual.descripcion);
      localStorage.setItem('valorAct', this.itemActual.valor.toString());
      localStorage.setItem('unidad', this.itemActual.unidad);
    }

  }

  esIdMensual(): boolean { //Si es una variable ajustable por cer
    const mensuales = [27, 29, 104]
    console.log(mensuales.includes(this.itemActual.idVariable));
    return mensuales.includes(this.itemActual.idVariable);
  }

  fechaSeleccionada(event: Event) {
    const button = (event.currentTarget as HTMLElement).closest('button');

    if (!button) {
      console.error('No se encontró el botón');
      return;
    }

    let buttonText = button.innerText.trim(); //texto de los botones

    const fechaActual = new Date()
    fechaActual.setFullYear(fechaActual.getFullYear());
    let fecha = fechaActual.toISOString().split('T')[0];

    let fechaInicio = ""

    switch (buttonText) {
      case "1S":

        fechaInicio = this.calcularFechas(7, 0, 0);
        this.pasoDias = "1"; // trae todos los datos de una semana
        console.log("Seleciono 1S", fechaInicio);       
        break;

      case "1M":
        fechaInicio = this.calcularFechas(0, 1, 0);
        this.pasoDias = "1"; // trae todos los datos de un mes
        console.log("Seleciono 1M");
        break;

      case "3M":
        fechaInicio = this.calcularFechas(0, 3, 0);
        this.pasoDias = "1";
        console.log("Seleciono 3M", fechaInicio);
        break;

      case "6M":
        fechaInicio = this.calcularFechas(0, 6, 0);
        if (this.esIdMensual()) {
          this.pasoDias = "1"
        } else {
          this.pasoDias = "2";
        }

        console.log("Seleciono 6M");
        break;

      case "1A":
        fechaInicio = this.calcularFechas(0, 0, 1);
        if (this.esIdMensual()) {
          this.pasoDias = "1"
        } else {
          this.pasoDias = "4";
        }

        console.log("Seleciono 1A");
        break;

      case "2A":
        fechaInicio = this.calcularFechas(0, 0, 2);
        if (this.esIdMensual()) {
          this.pasoDias = "2"
        } else {
          this.pasoDias = "8";
        }

        console.log("Seleciono 2A");
        break;

      case "5A":
        fechaInicio = this.calcularFechas(0, 0, 5);
        if (this.esIdMensual()) {
          this.pasoDias = "2"
        } else {
          this.pasoDias = "20";
        }

        console.log("Seleciono 5A");
        break;

      case "10A":
        fechaInicio = this.calcularFechas(0, 0, 10);
        if (this.esIdMensual()) {
          this.pasoDias = "5"
        } else {
          this.pasoDias = "40";
        }

        console.log("Seleciono 10A");
        break;

      default:
        console.warn('Botón no reconocido:', buttonText);
        break;
    }
    this.fechaInicial = fechaInicio;
    this.llenarData(fechaInicio);
  }


  setFechaSeleccionada(periodo: string, event: Event): void //se usa desde el html
  {
    this.botonActivo = periodo;
    this.fechaSeleccionada(event);
  }

  limpiarSeleccion(): void //se usa desde el html
  {
    this.botonCERDesactivado = false; // Vuelve a habilitar el botón
    this.botonActivo = null;
    this.itemActual.idVariable = this.apiService.itemSeleccionado.idVariable;
    this.pasoDias = "4";
    this.llenarData(this.calcularFechas(0, 0, 1));
    console.log("Selección limpiada");
  }

  calcularFechas(dia: number, mes: number, anio: number) {
    //si se quiere obtener la fecha actual, los tres parametros van en cero. Sino, se restan los dias/mes/año que queiran
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dia);
    fecha.setMonth(fecha.getMonth() - mes);
    fecha.setFullYear(fecha.getFullYear() - anio);

    return fecha.toISOString().split('T')[0];
  }

  llenarData(fechaInicio: string) {

    var dataGrafico: any = {};
    this.apiService.getDataVariable(this.itemActual.idVariable, "/datosvariable", fechaInicio, this.pasoDias).subscribe(data => {
      dataGrafico = data;

      var valores = [];
      var fechas = [];

      for (const item of dataGrafico) {
        valores.push(item.valor);
        fechas.push(item.fecha);
      }

      const ultimaFecha = fechas[fechas.length - 1];
      localStorage.setItem('fechaAct', ultimaFecha);
      this.hacerGrafico(valores, fechas);
    });
  }


  llenarDataCER(fechaInicial: string) {
    var dataGrafico: any = {};
    this.apiService.getDataVariableCER(this.itemActual.idVariable, "/ajusteCER", fechaInicial, this.pasoDias).subscribe(data => {
      dataGrafico = data;
      var valores = [];
      var fechas = [];

      for (const item of dataGrafico) {
        valores.push(item.valor);
        fechas.push(item.fecha);
      }

      this.hacerGrafico(valores, fechas);
    });
  }

  hacerGrafico(valores: number[], fecha: string[]) {
    // Destruye el gráfico anterior si ya existe
    localStorage.setItem('graficoFechas', JSON.stringify(fecha));
    localStorage.setItem('graficoValores', JSON.stringify(valores));
    
    if (this.chart) {
      this.chart.destroy();
    }

    const data = {
      labels: fecha,
      datasets: [{
        label: '',
        data: valores,
        fill: false,
        borderColor: 'red',
        tension: 0.1
      }]
    };

    // Crear el nuevo gráfico
    this.chart = new Chart("chart", {
      type: "line",
      data,
      options: {
        responsive: true,
        scales: {
          x: {
            grid: {
              display: true, // Habilita las cuadrículas en el eje X
              color: 'rgba(130, 105, 117, 0.18)', // Color de las cuadrículas
              lineWidth: 1 // Grosor de las líneas de las cuadrículas
            },
            border: {
              color: 'gray', // Color de la línea del eje X
              width: 1.5 // Grosor de la línea del eje X
            },
            title: {
              display: true,
              text: "Tiempo"
            }
          },
          y: {
            grid: {
              display: true, // Habilita las cuadrículas en el eje Y
              color: 'rgba(130, 105, 117, 0.18)', // Color de las cuadrículas
              lineWidth: 1 // Grosor de las líneas de las cuadrículas
            },
            border: {
              color: 'gray', // Color de la línea del eje X
              width: 1.5 // Grosor de la línea del eje X
            },
            title: {
              display: true,
              text: this.itemActual.unidad
            }
          }
        },
        layout: {
          padding: 10
        },
        plugins: {
          legend: {
            display: false // Desactiva la leyenda
          }
        }
      }
    });
  }


  public async cargarVariablesSoportadas(): Promise<number[]> {
    let listaVariables: number[] = [];

    await new Promise<void>((resolve) => {
      this.apiService.getVarSoportadas().subscribe(
        (data: string[]) => {
          listaVariables = data.map(item => Number(item));
          resolve();
        }
      );
    });
    return listaVariables;
  }


  async ajusteCER() {
    const btn = document.getElementById("ajuste-cer-btn"); // Referencia al botón
    this.botonCERDesactivado = true; // Deshabilita el botón
    console.log("Ajuste CER ejecutado");

    let variablesSoportadas: number[]
    variablesSoportadas = await this.cargarVariablesSoportadas();
    let id = this.itemActual.idVariable;

    if (variablesSoportadas.includes(id)) {
      this.llenarDataCER(this.fechaInicial);

      // Cambiar el estado visual del botón a presionado
      if (btn) {
        btn.classList.add("presionado");
      }
    } else {
      this.showAlert('La variable no se ajusta por CER');
    }
  }

  // Función para mostrar la alerta
  showAlert(message: string) {
    // Crea el contenedor del alert
    const alertContainer = document.createElement('div');
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '50%';
    alertContainer.style.left = '50%';
    alertContainer.style.transform = 'translate(-50%, -50%)';
    alertContainer.style.backgroundColor = '#333';
    alertContainer.style.color = 'white';
    alertContainer.style.padding = '20px';
    alertContainer.style.borderRadius = '8px';
    alertContainer.style.textAlign = 'center';
    alertContainer.style.zIndex = '9999';  // Para asegurarse que esté por encima de todo

    // Crea el mensaje
    const alertMessage = document.createElement('p');
    alertMessage.textContent = message;
    alertMessage.style.fontSize = '1.2rem';
    alertMessage.style.marginBottom = '20px';

    // Crea el botón de cerrar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Aceptar';
    closeButton.style.padding = '10px 20px';
    closeButton.style.backgroundColor = '#00c896';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';

    // Añadir función para cerrar la alerta
    closeButton.onclick = () => {
      document.body.removeChild(alertContainer);
    };

    // Añadir los elementos al contenedor
    alertContainer.appendChild(alertMessage);
    alertContainer.appendChild(closeButton);

    // Añadir el contenedor al body de la página
    document.body.appendChild(alertContainer);
  }

  openDialog() {
    this.dialog.open(DialogoComponent);
  }

  async visibilidadCER() {
    let variablesSoportadas = await this.cargarVariablesSoportadas();
    const varCER: number[] = [4, 5, 102, 103, 104, 105]
    let id = this.itemActual.idVariable;
    if (variablesSoportadas.includes(id)) {
      this.visibilidadBotonCER = true;
    }
  }

}
