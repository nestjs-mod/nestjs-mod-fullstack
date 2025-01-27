import { HttpClient, HttpHeaders, HttpResponse, HttpEvent, HttpParameterCodec, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TerminusHealthCheckControllerCheck200ResponseInterface } from '../model/terminus-health-check-controller-check200-response.interface';
import { RestClientConfiguration } from '../configuration';
import * as i0 from "@angular/core";
export declare class TerminusHealthCheckRestService {
    protected httpClient: HttpClient;
    protected basePath: string;
    defaultHeaders: HttpHeaders;
    configuration: RestClientConfiguration;
    encoder: HttpParameterCodec;
    constructor(httpClient: HttpClient, basePath: string | string[], configuration: RestClientConfiguration);
    private addToHttpParams;
    private addToHttpParamsRecursive;
    /**
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    terminusHealthCheckControllerCheck(observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<TerminusHealthCheckControllerCheck200ResponseInterface>;
    terminusHealthCheckControllerCheck(observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<TerminusHealthCheckControllerCheck200ResponseInterface>>;
    terminusHealthCheckControllerCheck(observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<TerminusHealthCheckControllerCheck200ResponseInterface>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TerminusHealthCheckRestService, [null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TerminusHealthCheckRestService>;
}
