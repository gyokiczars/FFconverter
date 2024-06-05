import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CurrencyService } from './currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CurrencyService]
    });
    service = TestBed.inject(CurrencyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch currency list', () => {
    const mockResponse = [
      { currency: 'USD', rate: 1.0 },
      { currency: 'EUR', rate: 0.9 }
    ];

    service.getCurrencyList().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('assets/currency.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle http error', () => {
    const errorMessage = 'Failed to load currency list';

    service.getCurrencyList().subscribe(
      () => fail('expected an error, not currency list'),
      (error) => expect(error).toBeTruthy()
    );

    const req = httpMock.expectOne('assets/currency.json');
    expect(req.request.method).toBe('GET');
    req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
  });
});