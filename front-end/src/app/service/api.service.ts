import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private urlApi = 'https://api.bcra.gob.ar/estadisticas/v2.0/datosvariable/1/2024-02-01/2024-02-05'
  private urlApiMenu = 'https://api.bcra.gob.ar/estadisticas/v2.0/principalesvariables'
  constructor(private http: HttpClient) { }

  public getData(): Observable<any> {
    return this.http.get<any>(this.urlApi)
  }

  public getAllVariables(): Observable<any> {
    return this.http.get<any>(this.urlApiMenu)
  }
}
