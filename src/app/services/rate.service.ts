import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RateService {

  private apiUrl = 'https://v6.exchangerate-api.com/v6/84d0e39da7798e4811d64c22/latest/';

  constructor(private http: HttpClient) { }

  getExchangeRates(code:string | null): Observable<any> {
    return this.http.get<any>(this.apiUrl+code);
  }
}