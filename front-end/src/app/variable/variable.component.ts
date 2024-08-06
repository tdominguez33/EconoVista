import { getLocaleNumberSymbol } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
    selector: 'app-variable',
    templateUrl: './variable.component.html',
    styleUrls: ['./variable.component.css']
})
export class VariableComponent {
    public chart: Chart | undefined;

    ngOnInit(): void {

        const data = {
            labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            datasets: [{
                label: "prueba",
                data: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
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


}
