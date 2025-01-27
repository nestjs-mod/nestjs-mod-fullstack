import { HttpClient, HttpHeaders, HttpResponse, HttpEvent, HttpParameterCodec, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthProfileDtoInterface } from '../model/auth-profile-dto.interface';
import { AuthUserInterface } from '../model/auth-user.interface';
import { FindManyAuthUserResponseInterface } from '../model/find-many-auth-user-response.interface';
import { StatusResponseInterface } from '../model/status-response.interface';
import { UpdateAuthUserDtoInterface } from '../model/update-auth-user-dto.interface';
import { RestClientConfiguration } from '../configuration';
import * as i0 from "@angular/core";
export declare class AuthRestService {
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
    authControllerProfile(observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<AuthProfileDtoInterface>;
    authControllerProfile(observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<AuthProfileDtoInterface>>;
    authControllerProfile(observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<AuthProfileDtoInterface>>;
    /**
     * @param authProfileDtoInterface
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    authControllerUpdateProfile(authProfileDtoInterface: AuthProfileDtoInterface, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<StatusResponseInterface>;
    authControllerUpdateProfile(authProfileDtoInterface: AuthProfileDtoInterface, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<StatusResponseInterface>>;
    authControllerUpdateProfile(authProfileDtoInterface: AuthProfileDtoInterface, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<StatusResponseInterface>>;
    /**
     * @param id
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    authUsersControllerDeleteOne(id: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<StatusResponseInterface>;
    authUsersControllerDeleteOne(id: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<StatusResponseInterface>>;
    authUsersControllerDeleteOne(id: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<StatusResponseInterface>>;
    /**
     * @param curPage
     * @param perPage
     * @param searchText
     * @param sort
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    authUsersControllerFindMany(curPage?: number, perPage?: number, searchText?: string, sort?: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<FindManyAuthUserResponseInterface>;
    authUsersControllerFindMany(curPage?: number, perPage?: number, searchText?: string, sort?: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<FindManyAuthUserResponseInterface>>;
    authUsersControllerFindMany(curPage?: number, perPage?: number, searchText?: string, sort?: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<FindManyAuthUserResponseInterface>>;
    /**
     * @param id
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    authUsersControllerFindOne(id: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<AuthUserInterface>;
    authUsersControllerFindOne(id: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<AuthUserInterface>>;
    authUsersControllerFindOne(id: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<AuthUserInterface>>;
    /**
     * @param id
     * @param updateAuthUserDtoInterface
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    authUsersControllerUpdateOne(id: string, updateAuthUserDtoInterface: UpdateAuthUserDtoInterface, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<AuthUserInterface>;
    authUsersControllerUpdateOne(id: string, updateAuthUserDtoInterface: UpdateAuthUserDtoInterface, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<AuthUserInterface>>;
    authUsersControllerUpdateOne(id: string, updateAuthUserDtoInterface: UpdateAuthUserDtoInterface, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<AuthUserInterface>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<AuthRestService, [null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AuthRestService>;
}
