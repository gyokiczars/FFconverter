import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { RateService } from '../../services/rate.service';
import { CurrencyService } from '../../services/currency.service';
import { Currency } from '../../currency';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-rates-table',
  templateUrl: './rates-table.component.html',
  styleUrl: './rates-table.component.css'
})
export class RatesTableComponent implements OnInit, AfterViewInit {
  
  public currencyList: Currency [] = [];
  public dataSource = new MatTableDataSource<Currency>(this.currencyList)
  public currencyFrom = new FormControl('');
  public currencyListLoaded: Boolean = false;
  public displayedColumns: string[] = ['code', 'name', 'rate'];

  constructor(
    private rateService: RateService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.currencyService.getCurrencyList().subscribe(
      (data: any) => {
        this.ceateCurrencyList(data);
      },
      (error: any) => {
        console.log('error: ' + error);
      }
    );
  }

  ngAfterViewInit() {
    this.currencyFrom.setValue('USD');
    this.getRates();
  }

  ceateCurrencyList(data:any):void {
    for (let key in data) {
      this.currencyList.push({
        code:data[key].code,
        name:data[key].name
      });
    }
  }

  getRates(): void {
    this.currencyListLoaded = false;
    this.rateService.getExchangeRates(this.currencyFrom.value).subscribe(
      (response: any) => {
        console.log(response)
        /* success. */
        const conversion_rates = response['conversion_rates'];
        this.currencyList.forEach((currency:any) => {
          Object.keys(conversion_rates).forEach(conversion => {
            if (conversion == currency['code']) {
              currency['rate'] = conversion_rates[conversion];
            }
          });
        });
        this.currencyListLoaded = true;

      },
      (error: any) => {
        /* failure. */
        console.log('error: ' + error);
      }
    );
  }
}
