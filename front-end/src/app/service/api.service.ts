import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuItem } from '../models/menuItem.model';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  //private urlApiVar = 'https://api.bcra.gob.ar/estadisticas/v2.0/datosvariable/1/2024-01-01/2024-02-05'
  //private urlApiMenu = 'https://api.bcra.gob.ar/estadisticas/v2.0/principalesvariables'
  private urlApiMenu = 'http://localhost:8010/proxy/principalesvariables'
  //el proxy usa el puerto 8010, la api esta en el puerto 5000
  itemSeleccionado: any;

  constructor(private http: HttpClient) { }

  // public getDataVariable(): Observable<any> {
  //   return this.http.get<any>(this.urlApiVar)
  // }

  public getAllVariables(): Observable<any> {
    return this.http.get<any>(this.urlApiMenu)
  }

  setItemSeleccionado(item: any) {
    this.itemSeleccionado = item;;
  }

  public getDataVariable(id: number): Observable<any> {
    const urlVarId = `http://localhost:8010/proxy/datosvariable/${id}/2020-08-05/2023-09-09`;
    return this.http.get<any>(urlVarId);
  }

}
