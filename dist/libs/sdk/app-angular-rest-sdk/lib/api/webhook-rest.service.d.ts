import { HttpClient, HttpHeaders, HttpResponse, HttpEvent, HttpParameterCodec, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateWebhookDtoInterface } from '../model/create-webhook-dto.interface';
import { FindManyWebhookLogResponseInterface } from '../model/find-many-webhook-log-response.interface';
import { FindManyWebhookResponseInterface } from '../model/find-many-webhook-response.interface';
import { FindManyWebhookUserResponseInterface } from '../model/find-many-webhook-user-response.interface';
import { StatusResponseInterface } from '../model/status-response.interface';
import { UpdateWebhookDtoInterface } from '../model/update-webhook-dto.interface';
import { UpdateWebhookUserDtoInterface } from '../model/update-webhook-user-dto.interface';
import { WebhookEventInterface } from '../model/webhook-event.interface';
import { WebhookInterface } from '../model/webhook.interface';
import { WebhookUserInterface } from '../model/webhook-user.interface';
import { RestClientConfiguration } from '../configuration';
import * as i0 from "@angular/core";
export declare class WebhookRestService {
    protected httpClient: HttpClient;
    protected basePath: string;
    defaultHeaders: HttpHeaders;
    configuration: RestClientConfiguration;
    encoder: HttpParameterCodec;
    constructor(httpClient: HttpClient, basePath: string | string[], configuration: RestClientConfiguration);
    private addToHttpParams;
    private addToHttpParamsRecursive;
    /**
     * @param createWebhookDtoInterface
     * @param xExternalUserId
     * @param xExternalTenantId
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    webhookControllerCreateOne(createWebhookDtoInterface: CreateWebhookDtoInterface, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<WebhookInterface>;
    webhookControllerCreateOne(createWebhookDtoInterface: CreateWebhookDtoInterface, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<WebhookInterface>>;
    webhookControllerCreateOne(createWebhookDtoInterface: CreateWebhookDtoInterface, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<WebhookInterface>>;
    /**
     * @param id
     * @param xExternalUserId
     * @param xExternalTenantId
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    webhookControllerDeleteOne(id: string, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<StatusResponseInterface>;
    webhookControllerDeleteOne(id: string, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<StatusResponseInterface>>;
    webhookControllerDeleteOne(id: string, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<StatusResponseInterface>>;
    /**
     * @param xExternalUserId
     * @param xExternalTenantId
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    webhookControllerEvents(xExternalUserId?: string, xExternalTenantId?: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<Array<WebhookEventInterface>>;
    webhookControllerEvents(xExternalUserId?: string, xExternalTenantId?: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<Array<WebhookEventInterface>>>;
    webhookControllerEvents(xExternalUserId?: string, xExternalTenantId?: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<Array<WebhookEventInterface>>>;
    /**
     * @param xExternalUserId
     * @param xExternalTenantId
     * @param curPage
     * @param perPage
     * @param searchText
     * @param sort
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    webhookControllerFindMany(xExternalUserId?: string, xExternalTenantId?: string, curPage?: number, perPage?: number, searchText?: string, sort?: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<FindManyWebhookResponseInterface>;
    webhookControllerFindMany(xExternalUserId?: string, xExternalTenantId?: string, curPage?: number, perPage?: number, searchText?: string, sort?: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<FindManyWebhookResponseInterface>>;
    webhookControllerFindMany(xExternalUserId?: string, xExternalTenantId?: string, curPage?: number, perPage?: number, searchText?: string, sort?: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<FindManyWebhookResponseInterface>>;
    /**
     * @param id
     * @param xExternalUserId
     * @param xExternalTenantId
     * @param curPage
     * @param perPage
     * @param searchText
     * @param sort
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    webhookControllerFindManyLogs(id: string, xExternalUserId?: string, xExternalTenantId?: string, curPage?: number, perPage?: number, searchText?: string, sort?: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<FindManyWebhookLogResponseInterface>;
    webhookControllerFindManyLogs(id: string, xExternalUserId?: string, xExternalTenantId?: string, curPage?: number, perPage?: number, searchText?: string, sort?: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<FindManyWebhookLogResponseInterface>>;
    webhookControllerFindManyLogs(id: string, xExternalUserId?: string, xExternalTenantId?: string, curPage?: number, perPage?: number, searchText?: string, sort?: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<FindManyWebhookLogResponseInterface>>;
    /**
     * @param id
     * @param xExternalUserId
     * @param xExternalTenantId
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    webhookControllerFindOne(id: string, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<WebhookInterface>;
    webhookControllerFindOne(id: string, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<WebhookInterface>>;
    webhookControllerFindOne(id: string, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<WebhookInterface>>;
    /**
     * @param xExternalUserId
     * @param xExternalTenantId
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    webhookControllerProfile(xExternalUserId?: string, xExternalTenantId?: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<WebhookUserInterface>;
    webhookControllerProfile(xExternalUserId?: string, xExternalTenantId?: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<WebhookUserInterface>>;
    webhookControllerProfile(xExternalUserId?: string, xExternalTenantId?: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<WebhookUserInterface>>;
    /**
     * @param id
     * @param updateWebhookDtoInterface
     * @param xExternalUserId
     * @param xExternalTenantId
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    webhookControllerUpdateOne(id: string, updateWebhookDtoInterface: UpdateWebhookDtoInterface, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<WebhookInterface>;
    webhookControllerUpdateOne(id: string, updateWebhookDtoInterface: UpdateWebhookDtoInterface, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<WebhookInterface>>;
    webhookControllerUpdateOne(id: string, updateWebhookDtoInterface: UpdateWebhookDtoInterface, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<WebhookInterface>>;
    /**
     * @param id
     * @param xExternalUserId
     * @param xExternalTenantId
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    webhookUsersControllerDeleteOne(id: string, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<StatusResponseInterface>;
    webhookUsersControllerDeleteOne(id: string, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<StatusResponseInterface>>;
    webhookUsersControllerDeleteOne(id: string, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<StatusResponseInterface>>;
    /**
     * @param xExternalUserId
     * @param xExternalTenantId
     * @param curPage
     * @param perPage
     * @param searchText
     * @param sort
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    webhookUsersControllerFindMany(xExternalUserId?: string, xExternalTenantId?: string, curPage?: number, perPage?: number, searchText?: string, sort?: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<FindManyWebhookUserResponseInterface>;
    webhookUsersControllerFindMany(xExternalUserId?: string, xExternalTenantId?: string, curPage?: number, perPage?: number, searchText?: string, sort?: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<FindManyWebhookUserResponseInterface>>;
    webhookUsersControllerFindMany(xExternalUserId?: string, xExternalTenantId?: string, curPage?: number, perPage?: number, searchText?: string, sort?: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<FindManyWebhookUserResponseInterface>>;
    /**
     * @param id
     * @param xExternalUserId
     * @param xExternalTenantId
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    webhookUsersControllerFindOne(id: string, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<WebhookUserInterface>;
    webhookUsersControllerFindOne(id: string, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<WebhookUserInterface>>;
    webhookUsersControllerFindOne(id: string, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<WebhookUserInterface>>;
    /**
     * @param id
     * @param updateWebhookUserDtoInterface
     * @param xExternalUserId
     * @param xExternalTenantId
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    webhookUsersControllerUpdateOne(id: string, updateWebhookUserDtoInterface: UpdateWebhookUserDtoInterface, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<WebhookUserInterface>;
    webhookUsersControllerUpdateOne(id: string, updateWebhookUserDtoInterface: UpdateWebhookUserDtoInterface, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<WebhookUserInterface>>;
    webhookUsersControllerUpdateOne(id: string, updateWebhookUserDtoInterface: UpdateWebhookUserDtoInterface, xExternalUserId?: string, xExternalTenantId?: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<WebhookUserInterface>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<WebhookRestService, [null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<WebhookRestService>;
}
