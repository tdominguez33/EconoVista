import { getLocaleNumberSymbol } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { ApiService } from '../service/api.service';

@Component({
    selector: 'app-variable',
    templateUrl: './variable.component.html',
    styleUrls: ['./variable.component.css']
})
export class VariableComponent {
    public chart: Chart | undefined;
    data: any = [];
    fecha: string[] = [];
    valor: number[] = [];
    itemActual: {} = {};

    constructor(private apiService: ApiService) { }

    ngOnInit(): void {
        this.llenarData();
        this.hacerGrafico();
        this.guardarItem();
    }

    llenarData() {
        this.apiService.getDataVariable().subscribe(data => {
            this.data = data.results;
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
        console.log("variable", this.apiService.itemSeleccionado);
        console.log("itemActual", this.itemActual)
    }


}
