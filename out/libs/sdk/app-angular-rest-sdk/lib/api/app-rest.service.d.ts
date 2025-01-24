import {
  HttpClient,
  HttpHeaders,
  HttpResponse,
  HttpEvent,
  HttpParameterCodec,
  HttpContext,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppDataInterface } from '../model/app-data.interface';
import { AppDemoInterface } from '../model/app-demo.interface';
import { RestClientConfiguration } from '../configuration';
import * as i0 from '@angular/core';
export declare class AppRestService {
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
  appControllerDemoCreateOne(
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<AppDemoInterface>;
  appControllerDemoCreateOne(
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpResponse<AppDemoInterface>>;
  appControllerDemoCreateOne(
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpEvent<AppDemoInterface>>;
  /**
   * @param id
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  appControllerDemoDeleteOne(
    id: string,
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<AppDemoInterface>;
  appControllerDemoDeleteOne(
    id: string,
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpResponse<AppDemoInterface>>;
  appControllerDemoDeleteOne(
    id: string,
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpEvent<AppDemoInterface>>;
  /**
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  appControllerDemoFindMany(
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<Array<AppDemoInterface>>;
  appControllerDemoFindMany(
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpResponse<Array<AppDemoInterface>>>;
  appControllerDemoFindMany(
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpEvent<Array<AppDemoInterface>>>;
  /**
   * @param id
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  appControllerDemoFindOne(
    id: string,
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<AppDemoInterface>;
  appControllerDemoFindOne(
    id: string,
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpResponse<AppDemoInterface>>;
  appControllerDemoFindOne(
    id: string,
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpEvent<AppDemoInterface>>;
  /**
   * @param id
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  appControllerDemoUpdateOne(
    id: string,
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<AppDemoInterface>;
  appControllerDemoUpdateOne(
    id: string,
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpResponse<AppDemoInterface>>;
  appControllerDemoUpdateOne(
    id: string,
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpEvent<AppDemoInterface>>;
  /**
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  appControllerGetData(
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<AppDataInterface>;
  appControllerGetData(
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpResponse<AppDataInterface>>;
  appControllerGetData(
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpEvent<AppDataInterface>>;
  static ɵfac: i0.ɵɵFactoryDeclaration<
    AppRestService,
    [null, { optional: true }, { optional: true }]
  >;
  static ɵprov: i0.ɵɵInjectableDeclaration<AppRestService>;
}
