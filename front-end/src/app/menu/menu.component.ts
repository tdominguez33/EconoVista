import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../service/api.service';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  data: any = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.llenarData()
  }

  llenarData() {
    this.apiService.getAllVariables().subscribe(data => {
      this.data = data.results;
      console.log(this.data);
    })
  }
}
