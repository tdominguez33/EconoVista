import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../service/api.service';
import { MenuItem } from '../models/menuItem.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  data: any = []

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.llenarData()
  }

  llenarData() {
    this.apiService.getAllVariables().subscribe(data => {
      this.data = data;
      console.log(this.data);
    })
  }

  guardarItem(item: MenuItem) {
    this.apiService.setItemSeleccionado(item);
  }
}
