import { Component, OnInit } from '@angular/core';
import { RateService } from '../../services/rate.service';
import { CurrencyService } from '../../services/currency.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TieredFee } from '../../tieredFee';
import { forkJoin } from 'rxjs';
import { Currency } from '../../currency';

@Component({
  selector: 'app-exchange-form',
  templateUrl: './exchange-form.component.html',
  styleUrl: './exchange-form.component.css',
})
export class ExchangeFormComponent implements OnInit {

  /* a list of 'getExchangeates' requests. */
  public rateRequestList: any[] = [];

  /* exchange form. */
  public exchangeForm = new FormGroup({

    /* exchange input form control. */
    exchangeInput: new FormControl('', [
      Validators.required,
      Validators.pattern("^[0-9]*$")
    ]),

    /* currency from form control. */
    currencyFrom: new FormControl('', [
      Validators.required
    ]),

    /* currency to form control. */
    currencyTo: new FormControl('', [
      Validators.required
    ])
  });

  /* total exchange value. */
  public exchangeTotal: number = 0;

  /* base fee for each transaction. */
  public baseFee: number = 0.02;

  /* a list representing USD amounts and their respective multipliers. the higher the tier, the lower the fee. */
  public tieredFeeList:TieredFee [] = [
    { amount: 500, multiplier: 0.005 },
    { amount: 1000, multiplier: 0.00375 },
    { amount: 2500, multiplier: 0.0025 },
    { amount: 5000, multiplier: 0.00125 },
  ];

  /* total hidden fee value. */
  public hiddenFeeTotal: number = 0;

  /* total exchange amount + total hidden fee. */
  public amountTotal: number = 0;

  /* a list of available currencies. */
  public currencyList: Currency [] = [];

  /* a list of conversion rates. */
  public conversionRateList: any [] = [];

  constructor(
    private rateService: RateService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.createRateRequestList();
    
    this.currencyService.getCurrencyList().subscribe(
      (data: any) => {
        this.ceateCurrencyList(data);
      },
      (error: any) => {
        console.log('error: ' + error);
      }
    );

    //this.exchangeInput.setValue('1');
    this.exchangeForm.controls.currencyFrom.setValue('USD');

  }

  /* create a list of available currencies. */
  ceateCurrencyList(data: any): void {
    for (let key in data) {
      this.currencyList.push({
        code:data[key].code,
        name:data[key].name
      });
    }
  }

  /* put USD rate request in queue. */
  createRateRequestList(): void {
    this.rateRequestList.push(this.rateService.getExchangeRates('USD'));
  }

  getRates(): void {
    /* send request for usd and selected currency rates at the same time. */
    forkJoin(this.rateRequestList).subscribe(
      (rateList: any) => {

        /* reset conversion rate list. */
        this.conversionRateList = [];

        for (let rate of rateList) {
          this.conversionRateList.push({
            code: rate.base_code,
            multiplier_list: rate.conversion_rates,
          });
        }

        this.exchange();

        /* reset rate request list. */
        this.rateRequestList.splice(1, 1);

      },
      (error: any) => {
        console.log('error: ' + error);
      }
    );
  }

  /* start exchange process, check form group for errors, add request to list if needed, send request(s). */
  initExchange(): void {
    if (this.exchangeForm.invalid) {
      this.exchangeForm.markAllAsTouched();
      return;
    }

    if (
      this.exchangeForm.controls.currencyFrom.value != 'USD'
    )
      this.rateRequestList.push(
        this.rateService.getExchangeRates(this.exchangeForm.controls.currencyFrom.value)
      );

    this.getRates();
  }

  exchange(): void {
    const multiplier_list =
      this.conversionRateList[this.conversionRateList.length - 1]
        .multiplier_list;

    const amountInUsd =
      this.conversionRateList.length > 0
      ? Number(this.exchangeForm.controls.exchangeInput.value) * multiplier_list['USD']
      : Number(this.exchangeForm.controls.exchangeInput.value);
    
    this.calculateHiddenFee(Number(this.exchangeForm.controls.exchangeInput.value), amountInUsd);
    const code: any = this.exchangeForm.controls.currencyTo.value;
    const rate = multiplier_list[code];
    this.exchangeTotal = Number(this.exchangeForm.controls.exchangeInput.value) * rate;

    this.amountTotal = this.calculateTotalAmount();
  }

  calculateHiddenFee(exchangeInput: number, amountInUsd?: number): void {
    const amountToCheck = amountInUsd ? amountInUsd : exchangeInput;

    if (amountToCheck) {
      /* handle input below smallest tier. */
      if (amountToCheck <= this.tieredFeeList[0].amount) {
        this.hiddenFeeTotal = exchangeInput * this.baseFee;
      }

      /* handle input above highest tier. */
      if (
        amountToCheck > this.tieredFeeList[this.tieredFeeList.length - 1].amount
      ) {
        this.hiddenFeeTotal =
          exchangeInput * this.baseFee +
          exchangeInput * this.tieredFeeList[3].multiplier;
      }
    
      /* find correct tier range. */
      const tier = this.tieredFeeList.find(
        (tier, index) =>
          amountToCheck > tier.amount &&
          amountToCheck <= this.tieredFeeList[index + 1]?.amount
      );

      /* calculate hidden fee as per tier, if found. */
      if (tier) {
        this.hiddenFeeTotal =
          amountToCheck * this.baseFee + amountToCheck * tier.multiplier;
      }

    }

  }

  /* calculate final total (input and hidden fees). */
  calculateTotalAmount(): number {
      return Number(this.exchangeForm.controls.exchangeInput.value) + this.hiddenFeeTotal;
  }

  /* function to swap the selected currency values between to and from currency controls. doing so will initiate another exchange. */
  swapCurrency(event: MouseEvent): void {
    event.preventDefault();
    let currencyFromCurrent: string | null;
    let currencyToCurrent: string | null;

    currencyFromCurrent = this.exchangeForm.controls.currencyFrom.value;
    currencyToCurrent = this.exchangeForm.controls.currencyTo.value;

    this.exchangeForm.controls.currencyFrom.setValue(currencyToCurrent);
    this.exchangeForm.controls.currencyTo.setValue(currencyFromCurrent);

    if (this.exchangeTotal)
      this.initExchange();
  }
}
