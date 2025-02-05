import { getLocaleNumberSymbol } from '@angular/common';
import { Component, ChangeDetectionStrategy, ElementRef, inject, OnInit, ViewChild, ChangeDetectorRef  } from '@angular/core';
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
  fechaInicial: string = ""; //fecha en la que inicia el grafico
  url: string = "/datosvariable";
  url1: string = "/ajusteCER";
  public listaVariables: number[] = []
  nombreLargo: string = ""
  fechaHeader: string = ""
  descripcion: string = ""
  valorActual: string = ""
  visibilidadBoton:boolean = true;
  pasoDias: string="4"; //por defecto trae 60 datos en el año
  readonly dialog = inject(MatDialog);
  botonActivo: string | null = null;
  unidad: string = ""
  botonDesactivado = false; // Nueva variable
  cargaCompleta: boolean = false;
  
  
  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) { }

  // ngOnInit(): void {
    
  //   this.prueba();
  //   if (this.chart) {
  //     this.chart.destroy();
  //   }
  //   this.prueba();
  // }

  // prueba(){
  //   this.cargarVariablesSeleccionadas();
  //   this.llenarData();
  //   this.guardarItem();
  //   this.cargarVariablesSoportadas();
  //   this.visibilidadCER();
  // }

  // Con esto se arregla el problema de tener que usar la funcion prueba()
  async ngOnInit(): Promise<void> {
    await this.cargarVariablesSeleccionadas();
    await this.llenarData();
    await this.guardarItem(); // Asegúrate de que esto se ejecute correctamente
    console.log('Item actual:', this.itemActual); // Verifica si itemActual tiene datos
    await this.cargarVariablesSoportadas();
    await this.visibilidadCER();
  
    if (this.chart) {
      this.chart.destroy();
    }
  
    // Forzar la detección de cambios
    this.cdr.detectChanges();
  }
  
  
  cargarVariablesSeleccionadas(){
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

    const uni = localStorage.getItem('unidad');
    if (uni){
      this.unidad = uni;
      console.log('Prueba unidad, ', uni)
    }else{
      console.log('No se pudo encontrar la unidad')
    }
  }

  guardarItem() {
    this.itemActual = this.apiService.itemSeleccionado;
    console.log("item actual", this.itemActual)

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

    this.unidad = this.apiService.itemSeleccionado.unidad;
    localStorage.setItem('unidad', this.unidad);
    console.log("valor unidad = ", this.unidad);
  }

   fechaSeleccionada(event: Event) {
      // Asegúrate de obtener siempre el botón, incluso si se hace clic en un elemento hijo
      const button = (event.currentTarget as HTMLElement).closest('button');
      const mensuales = [27, 29, 104]
      
      if (!button) {
        console.error('No se encontró el botón');
        return;
      }
      
      let buttonText = button.innerText.trim(); // Asegúrate de eliminar espacios en blanco
      let aux = "";
    
      switch (buttonText) {
        case "1S":
          aux = this.restarDiasHabiles(this.fechaActual, 7);
          this.fechaInicial = aux;
          this.pasoDias = "1"; // trae todos los datos de una semana
          console.log("fechaInicial", this.fechaInicial);
          console.log("Seleciono 1S");
          break;
    
        case "1M":
          aux = this.restarDiasHabiles(this.fechaActual, 30);
          this.fechaInicial = aux;
          this.pasoDias = "1"; // trae todos los datos de un mes
          console.log("fechaInicial", this.fechaInicial);
          console.log("Seleciono 1M");
          break;
    
        case "3M":
          aux = this.restarDiasHabiles(this.fechaActual, 90);
          this.fechaInicial = aux;
          this.pasoDias = "1"; 
          console.log("fechaInicial", this.fechaInicial);
          console.log("Seleciono 3M");
          break;
    
        case "6M":
          aux = this.restarDiasHabiles(this.fechaActual, 180);
          this.fechaInicial = aux;
          if (mensuales.includes(this.IdActual)){
            this.pasoDias = "1"
          } else {
            this.pasoDias = "2"; 
          }
          console.log("fechaInicial", this.fechaInicial);
          console.log("Seleciono 6M");
          break;
    
        case "1A":
          aux = this.restarDiasHabiles(this.fechaActual, 365);
          this.fechaInicial = aux;
          if (mensuales.includes(this.IdActual)){
            this.pasoDias = "1"
          } else {
            this.pasoDias = "4"; 
          }
          console.log("fechaInicial", this.fechaInicial);
          console.log("Seleciono 1A");
          break;
    
        case "2A":
          aux = this.restarDiasHabiles(this.fechaActual, 730);
          this.fechaInicial = aux;
          if (mensuales.includes(this.IdActual)){
            this.pasoDias = "2"
          } else {
            this.pasoDias = "8"; 
          }
          console.log("fechaInicial", this.fechaInicial);
          console.log("Seleciono 2A");
          break;
    
        case "5A":
          aux = this.restarDiasHabiles(this.fechaActual, 1825);
          this.fechaInicial = aux;
          if (mensuales.includes(this.IdActual)){
            this.pasoDias = "2"
          } else {
            this.pasoDias = "20"; 
          }
          console.log("fechaInicial", this.fechaInicial);
          console.log("Seleciono 5A");
          break;
    
        case "10A":
          aux = this.restarDiasHabiles(this.fechaActual, 3650);
          this.fechaInicial = aux;
          if (mensuales.includes(this.IdActual)){
            this.pasoDias = "5"
          } else {
            this.pasoDias = "40"; 
          }
          console.log("fechaInicial", this.fechaInicial);
          console.log("Seleciono 10A");
          break;
    
        default:
          console.warn('Botón no reconocido:', buttonText);
          break;
      }
    
      this.llenarData();
    }
    

    setFechaSeleccionada(periodo: string, event: Event): void {
      this.botonActivo = periodo;
      this.fechaSeleccionada(event); // Llamamos a la función existente
    }

    limpiarSeleccion(): void {

      this.botonDesactivado = false; // Vuelve a habilitar el botón
      console.log("Selección limpiada");
      this.botonActivo = null;
      console.log("Selección limpiada");
      this.IdActual = this.apiService.itemSeleccionado.idVariable;
      this.fechaInicial = "2023-08-05";
      this.pasoDias ="4";
      this.llenarData();
    }


  llenarData() {
    const mensuales = [27, 29, 104]
    if (mensuales.includes(this.IdActual)){
      this.pasoDias = "1"
    } else {
      this.pasoDias = this.pasoDias; 
    }

    const fechaActual = new Date(); // Obtiene la fecha actual
    const fechaInicio = new Date(fechaActual);
    fechaInicio.setFullYear(fechaInicio.getFullYear() - 2); // Resta 2 años
  
    // Convierte la fecha a formato YYYY-MM-DD
    this.fechaInicial = fechaInicio.toISOString().split('T')[0];

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
    this.apiService.getDataVariableCER(this.IdActual, this.url1, this.fechaInicial, this.pasoDias).subscribe(data => {
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
        label: '',
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
              title:{
                display: true,
                text: "Tiempo"
              }
          },
          y: {
            beginAtZero: true, // Asegúrate de que el eje Y comienza en cero
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
                text: this.unidad
              }
          }
        }, 
        layout:{
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
    const btn = document.getElementById("ajuste-cer-btn"); // Referencia al botón
    this.botonDesactivado = true; // Deshabilita el botón
    console.log("Ajuste CER ejecutado");
  
    if (this.listaVariables.includes(this.IdActual)) {
      this.url1 = "/ajusteCER";
      this.llenarDataCER();
      this.hacerGrafico();
  
      // Cambiar el estado visual del botón a presionado
      if (btn) {
        // Si el botón no tiene la clase 'presionado', la agregamos
        btn.classList.add("presionado");
      }
    } else {
      // Mostrar la alerta personalizada si no se ajusta por CER
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
