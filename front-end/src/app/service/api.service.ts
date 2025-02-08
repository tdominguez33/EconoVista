import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuItem } from '../models/menuItem.model';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  private urlApiMenu = 'http://localhost:8010/proxy'
  //el proxy usa el puerto 8010, la api esta en el puerto 5000
  itemSeleccionado: any;
  constructor(private http: HttpClient) { }

  public getAllVariables(): Observable<any> {
    return this.http.get<any>(this.urlApiMenu + '/principalesvariables')
  }

  setItemSeleccionado(item: any) {
    this.itemSeleccionado = item;;
  }

  public getDataVariable(id: number, url: string, fechaInicio: string, pasoDias:string): Observable<any> {
    const urlVarId = this.urlApiMenu + `${url}/muestra/${id}/${fechaInicio}/${pasoDias}`;
    return this.http.get<any>(urlVarId);
  }

  public getDataVariableCER(id: number, url: string, fecha:string, pasoDias:string): Observable<any> {
    const urlVarId = this.urlApiMenu + `${url}/muestra/${id}/${fecha}/${pasoDias}`;
    return this.http.get<any>(urlVarId);
  }

  public getVarSoportadas(): Observable<string[]>{
    return this.http.get<string[]>(this.urlApiMenu + '/ajusteCER/variablessoportadas')
  }
}
