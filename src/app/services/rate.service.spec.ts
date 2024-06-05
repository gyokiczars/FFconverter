import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RateService } from './rate.service';

describe('RateService', () => {
  let service: RateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RateService]
    });
    service = TestBed.inject(RateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch exchange rates', () => {
    const mockResponse = {
      base_code: 'USD',
      rates: {
        EUR: 0.9,
        GBP: 0.8
      }
    };
    const code = 'USD';

    service.getExchangeRates(code).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`https://v6.exchangerate-api.com/v6/afd7c1b1430266f1b7c5232d/latest/${code}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle http error', () => {
    const errorMessage = 'Failed to load exchange rates';
    const code = 'USD';

    service.getExchangeRates(code).subscribe(
      () => fail('expected an error, not exchange rates'),
      (error) => expect(error).toBeTruthy()
    );

    const req = httpMock.expectOne(`https://v6.exchangerate-api.com/v6/afd7c1b1430266f1b7c5232d/latest/${code}`);
    expect(req.request.method).toBe('GET');
    req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
  });
});