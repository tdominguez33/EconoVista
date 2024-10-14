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
            console.log("estoy graficando id ", this.IdActual)
            // this.fecha = data.results.fecha;
            // this.valor = data.results.valor;
            // console.log("data", this.data);
            // console.log("fecha", this.fecha);
            // console.log("valor", this.valor);

            for (const item of this.data) {
                this.valor.push(item.valor);
                this.fecha.push(item.fecha);
            }

            // Ahora tienes un array 'valores' que contiene solo los valores
            console.log("valores", this.valor);
            console.log("fecha", this.fecha);
        })
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

        this.chart = new Chart("chart", {
            type: "line",
            data
        })
    }

    guardarItem() {
        this.itemActual = this.apiService.itemSeleccionado;
        this.IdActual = this.apiService.itemSeleccionado.idVariable;
        console.log("Guardar item, variable", this.apiService.itemSeleccionado);
        console.log("guardar iten, itemActual", this.itemActual);
        console.log("guardar item, idActual", this.IdActual);
    }

    fechaSeleccionada(event: Event) {
        const button = event.target as HTMLElement;
        const buttonText = button.innerText;
        console.log(buttonText)
    }


}
