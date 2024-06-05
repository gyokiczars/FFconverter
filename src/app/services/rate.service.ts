import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RateService {

  private apiUrl = 'https://v6.exchangerate-api.com/v6/afd7c1b1430266f1b7c5232d/latest/';

  constructor(private http: HttpClient) { }

  getExchangeRates(code:string | null): Observable<any> {
    return this.http.get<any>(this.apiUrl+code);
  }
}