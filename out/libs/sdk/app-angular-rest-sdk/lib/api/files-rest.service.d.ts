import {
  HttpClient,
  HttpHeaders,
  HttpResponse,
  HttpEvent,
  HttpParameterCodec,
  HttpContext,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { PresignedUrlsInterface } from '../model/presigned-urls.interface';
import { StatusResponseInterface } from '../model/status-response.interface';
import { RestClientConfiguration } from '../configuration';
import * as i0 from '@angular/core';
export declare class FilesRestService {
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
   * @param downloadUrl
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  filesControllerDeleteFile(
    downloadUrl: string,
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<StatusResponseInterface>;
  filesControllerDeleteFile(
    downloadUrl: string,
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpResponse<StatusResponseInterface>>;
  filesControllerDeleteFile(
    downloadUrl: string,
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpEvent<StatusResponseInterface>>;
  /**
   * @param ext
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  filesControllerGetPresignedUrl(
    ext: string,
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<PresignedUrlsInterface>;
  filesControllerGetPresignedUrl(
    ext: string,
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpResponse<PresignedUrlsInterface>>;
  filesControllerGetPresignedUrl(
    ext: string,
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpEvent<PresignedUrlsInterface>>;
  static ɵfac: i0.ɵɵFactoryDeclaration<
    FilesRestService,
    [null, { optional: true }, { optional: true }]
  >;
  static ɵprov: i0.ɵɵInjectableDeclaration<FilesRestService>;
}
