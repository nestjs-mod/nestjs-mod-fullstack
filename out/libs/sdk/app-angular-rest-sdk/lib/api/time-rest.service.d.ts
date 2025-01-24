import {
  HttpClient,
  HttpHeaders,
  HttpResponse,
  HttpEvent,
  HttpParameterCodec,
  HttpContext,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { RestClientConfiguration } from '../configuration';
import * as i0 from '@angular/core';
export declare class TimeRestService {
  protected httpClient: HttpClient;
  protected basePath: string;
  defaultHeaders: HttpHeaders;
  configuration: RestClientConfiguration;
  encoder: HttpParameterCodec;
  constructor(
    httpClient: HttpClient,
    basePath: string | string[],
    configuration: RestClientConfiguration
  );
  private addToHttpParams;
  private addToHttpParamsRecursive;
  /**
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  timeControllerTime(
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<object>;
  timeControllerTime(
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpResponse<object>>;
  timeControllerTime(
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpEvent<object>>;
  static ɵfac: i0.ɵɵFactoryDeclaration<
    TimeRestService,
    [null, { optional: true }, { optional: true }]
  >;
  static ɵprov: i0.ɵɵInjectableDeclaration<TimeRestService>;
}
