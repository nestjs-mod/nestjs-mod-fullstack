import * as i0 from '@angular/core';
import { NgModule, Optional, SkipSelf, InjectionToken, Injectable, Inject } from '@angular/core';
import * as i1 from '@angular/common/http';
import { HttpHeaders, HttpContext, HttpParams } from '@angular/common/http';

class RestClientConfiguration {
    /**
     *  @deprecated Since 5.0. Use credentials instead
     */
    apiKeys;
    username;
    password;
    /**
     *  @deprecated Since 5.0. Use credentials instead
     */
    accessToken;
    basePath;
    withCredentials;
    /**
     * Takes care of encoding query- and form-parameters.
     */
    encoder;
    /**
     * Encoding of various path parameter
     * <a href="https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#style-values">styles</a>.
     * <p>
     * See {@link README.md} for more details
     * </p>
     */
    encodeParam;
    /**
     * The keys are the names in the securitySchemes section of the OpenAPI
     * document. They should map to the value used for authentication
     * minus any standard prefixes such as 'Basic' or 'Bearer'.
     */
    credentials;
    constructor(configurationParameters = {}) {
        this.apiKeys = configurationParameters.apiKeys;
        this.username = configurationParameters.username;
        this.password = configurationParameters.password;
        this.accessToken = configurationParameters.accessToken;
        this.basePath = configurationParameters.basePath;
        this.withCredentials = configurationParameters.withCredentials;
        this.encoder = configurationParameters.encoder;
        if (configurationParameters.encodeParam) {
            this.encodeParam = configurationParameters.encodeParam;
        }
        else {
            this.encodeParam = param => this.defaultEncodeParam(param);
        }
        if (configurationParameters.credentials) {
            this.credentials = configurationParameters.credentials;
        }
        else {
            this.credentials = {};
        }
        // init default bearer credential
        if (!this.credentials['bearer']) {
            this.credentials['bearer'] = () => {
                return typeof this.accessToken === 'function'
                    ? this.accessToken()
                    : this.accessToken;
            };
        }
    }
    /**
     * Select the correct content-type to use for a request.
     * Uses {@link RestClientConfiguration#isJsonMime} to determine the correct content-type.
     * If no content type is found return the first found type if the contentTypes is not empty
     * @param contentTypes - the array of content types that are available for selection
     * @returns the selected content-type or <code>undefined</code> if no selection could be made.
     */
    selectHeaderContentType(contentTypes) {
        if (contentTypes.length === 0) {
            return undefined;
        }
        const type = contentTypes.find((x) => this.isJsonMime(x));
        if (type === undefined) {
            return contentTypes[0];
        }
        return type;
    }
    /**
     * Select the correct accept content-type to use for a request.
     * Uses {@link RestClientConfiguration#isJsonMime} to determine the correct accept content-type.
     * If no content type is found return the first found type if the contentTypes is not empty
     * @param accepts - the array of content types that are available for selection.
     * @returns the selected content-type or <code>undefined</code> if no selection could be made.
     */
    selectHeaderAccept(accepts) {
        if (accepts.length === 0) {
            return undefined;
        }
        const type = accepts.find((x) => this.isJsonMime(x));
        if (type === undefined) {
            return accepts[0];
        }
        return type;
    }
    /**
     * Check if the given MIME is a JSON MIME.
     * JSON MIME examples:
     *   application/json
     *   application/json; charset=UTF8
     *   APPLICATION/JSON
     *   application/vnd.company+json
     * @param mime - MIME (Multipurpose Internet Mail Extensions)
     * @return True if the given MIME is JSON, false otherwise.
     */
    isJsonMime(mime) {
        const jsonMime = new RegExp('^(application\/json|[^;/ \t]+\/[^;/ \t]+[+]json)[ \t]*(;.*)?$', 'i');
        return mime !== null && (jsonMime.test(mime) || mime.toLowerCase() === 'application/json-patch+json');
    }
    lookupCredential(key) {
        const value = this.credentials[key];
        return typeof value === 'function'
            ? value()
            : value;
    }
    defaultEncodeParam(param) {
        // This implementation exists as fallback for missing configuration
        // and for backwards compatibility to older typescript-angular generator versions.
        // It only works for the 'simple' parameter style.
        // Date-handling only works for the 'date-time' format.
        // All other styles and Date-formats are probably handled incorrectly.
        //
        // But: if that's all you need (i.e.: the most common use-case): no need for customization!
        const value = param.dataFormat === 'date-time' && param.value instanceof Date
            ? param.value.toISOString()
            : param.value;
        return encodeURIComponent(String(value));
    }
}

class RestClientApiModule {
    static forRoot(configurationFactory) {
        return {
            ngModule: RestClientApiModule,
            providers: [{ provide: RestClientConfiguration, useFactory: configurationFactory }]
        };
    }
    constructor(parentModule, http) {
        if (parentModule) {
            throw new Error('RestClientApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
                'See also https://github.com/angular/angular/issues/20575');
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: RestClientApiModule, deps: [{ token: RestClientApiModule, optional: true, skipSelf: true }, { token: i1.HttpClient, optional: true }], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.0.5", ngImport: i0, type: RestClientApiModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: RestClientApiModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: RestClientApiModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [],
                    declarations: [],
                    exports: [],
                    providers: []
                }]
        }], ctorParameters: () => [{ type: RestClientApiModule, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: i1.HttpClient, decorators: [{
                    type: Optional
                }] }] });

/**
 * Custom HttpParameterCodec
 * Workaround for https://github.com/angular/angular/issues/18261
 */
class CustomHttpParameterCodec {
    encodeKey(k) {
        return encodeURIComponent(k);
    }
    encodeValue(v) {
        return encodeURIComponent(v);
    }
    decodeKey(k) {
        return decodeURIComponent(k);
    }
    decodeValue(v) {
        return decodeURIComponent(v);
    }
}

const BASE_PATH = new InjectionToken('basePath');
const COLLECTION_FORMATS = {
    'csv': ',',
    'tsv': '   ',
    'ssv': ' ',
    'pipes': '|'
};

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class AppRestService {
    httpClient;
    basePath = 'http://localhost';
    defaultHeaders = new HttpHeaders();
    configuration = new RestClientConfiguration();
    encoder;
    constructor(httpClient, basePath, configuration) {
        this.httpClient = httpClient;
        if (configuration) {
            this.configuration = configuration;
        }
        if (typeof this.configuration.basePath !== 'string') {
            const firstBasePath = Array.isArray(basePath) ? basePath[0] : undefined;
            if (firstBasePath != undefined) {
                basePath = firstBasePath;
            }
            if (typeof basePath !== 'string') {
                basePath = this.basePath;
            }
            this.configuration.basePath = basePath;
        }
        this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();
    }
    // @ts-ignore
    addToHttpParams(httpParams, value, key) {
        if (typeof value === "object" && value instanceof Date === false) {
            httpParams = this.addToHttpParamsRecursive(httpParams, value);
        }
        else {
            httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
        }
        return httpParams;
    }
    addToHttpParamsRecursive(httpParams, value, key) {
        if (value == null) {
            return httpParams;
        }
        if (typeof value === "object") {
            if (Array.isArray(value)) {
                value.forEach(elem => httpParams = this.addToHttpParamsRecursive(httpParams, elem, key));
            }
            else if (value instanceof Date) {
                if (key != null) {
                    httpParams = httpParams.append(key, value.toISOString().substring(0, 10));
                }
                else {
                    throw Error("key may not be null if value is Date");
                }
            }
            else {
                Object.keys(value).forEach(k => httpParams = this.addToHttpParamsRecursive(httpParams, value[k], key != null ? `${key}.${k}` : k));
            }
        }
        else if (key != null) {
            httpParams = httpParams.append(key, value);
        }
        else {
            throw Error("key may not be null if value is not object or array");
        }
        return httpParams;
    }
    appControllerDemoCreateOne(observe = 'body', reportProgress = false, options) {
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/demo`;
        return this.httpClient.request('post', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    appControllerDemoDeleteOne(id, observe = 'body', reportProgress = false, options) {
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling appControllerDemoDeleteOne.');
        }
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/demo/${this.configuration.encodeParam({ name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined })}`;
        return this.httpClient.request('delete', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    appControllerDemoFindMany(observe = 'body', reportProgress = false, options) {
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/demo`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    appControllerDemoFindOne(id, observe = 'body', reportProgress = false, options) {
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling appControllerDemoFindOne.');
        }
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/demo/${this.configuration.encodeParam({ name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined })}`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    appControllerDemoUpdateOne(id, observe = 'body', reportProgress = false, options) {
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling appControllerDemoUpdateOne.');
        }
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/demo/${this.configuration.encodeParam({ name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined })}`;
        return this.httpClient.request('put', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    appControllerGetData(observe = 'body', reportProgress = false, options) {
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/get-data`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AppRestService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: RestClientConfiguration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AppRestService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AppRestService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: RestClientConfiguration, decorators: [{
                    type: Optional
                }] }] });

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class AuthRestService {
    httpClient;
    basePath = 'http://localhost';
    defaultHeaders = new HttpHeaders();
    configuration = new RestClientConfiguration();
    encoder;
    constructor(httpClient, basePath, configuration) {
        this.httpClient = httpClient;
        if (configuration) {
            this.configuration = configuration;
        }
        if (typeof this.configuration.basePath !== 'string') {
            const firstBasePath = Array.isArray(basePath) ? basePath[0] : undefined;
            if (firstBasePath != undefined) {
                basePath = firstBasePath;
            }
            if (typeof basePath !== 'string') {
                basePath = this.basePath;
            }
            this.configuration.basePath = basePath;
        }
        this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();
    }
    // @ts-ignore
    addToHttpParams(httpParams, value, key) {
        if (typeof value === "object" && value instanceof Date === false) {
            httpParams = this.addToHttpParamsRecursive(httpParams, value);
        }
        else {
            httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
        }
        return httpParams;
    }
    addToHttpParamsRecursive(httpParams, value, key) {
        if (value == null) {
            return httpParams;
        }
        if (typeof value === "object") {
            if (Array.isArray(value)) {
                value.forEach(elem => httpParams = this.addToHttpParamsRecursive(httpParams, elem, key));
            }
            else if (value instanceof Date) {
                if (key != null) {
                    httpParams = httpParams.append(key, value.toISOString().substring(0, 10));
                }
                else {
                    throw Error("key may not be null if value is Date");
                }
            }
            else {
                Object.keys(value).forEach(k => httpParams = this.addToHttpParamsRecursive(httpParams, value[k], key != null ? `${key}.${k}` : k));
            }
        }
        else if (key != null) {
            httpParams = httpParams.append(key, value);
        }
        else {
            throw Error("key may not be null if value is not object or array");
        }
        return httpParams;
    }
    authControllerProfile(observe = 'body', reportProgress = false, options) {
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/auth/profile`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    authControllerUpdateProfile(authProfileDtoInterface, observe = 'body', reportProgress = false, options) {
        if (authProfileDtoInterface === null || authProfileDtoInterface === undefined) {
            throw new Error('Required parameter authProfileDtoInterface was null or undefined when calling authControllerUpdateProfile.');
        }
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        // to determine the Content-Type header
        const consumes = [
            'application/json'
        ];
        const httpContentTypeSelected = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/auth/update-profile`;
        return this.httpClient.request('post', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            body: authProfileDtoInterface,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    authUsersControllerDeleteOne(id, observe = 'body', reportProgress = false, options) {
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling authUsersControllerDeleteOne.');
        }
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/auth/users/${this.configuration.encodeParam({ name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined })}`;
        return this.httpClient.request('delete', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    authUsersControllerFindMany(curPage, perPage, searchText, sort, observe = 'body', reportProgress = false, options) {
        let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
        if (curPage !== undefined && curPage !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, curPage, 'curPage');
        }
        if (perPage !== undefined && perPage !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, perPage, 'perPage');
        }
        if (searchText !== undefined && searchText !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, searchText, 'searchText');
        }
        if (sort !== undefined && sort !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, sort, 'sort');
        }
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/auth/users`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            params: localVarQueryParameters,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    authUsersControllerFindOne(id, observe = 'body', reportProgress = false, options) {
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling authUsersControllerFindOne.');
        }
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/auth/users/${this.configuration.encodeParam({ name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined })}`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    authUsersControllerUpdateOne(id, updateAuthUserDtoInterface, observe = 'body', reportProgress = false, options) {
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling authUsersControllerUpdateOne.');
        }
        if (updateAuthUserDtoInterface === null || updateAuthUserDtoInterface === undefined) {
            throw new Error('Required parameter updateAuthUserDtoInterface was null or undefined when calling authUsersControllerUpdateOne.');
        }
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        // to determine the Content-Type header
        const consumes = [
            'application/json'
        ];
        const httpContentTypeSelected = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/auth/users/${this.configuration.encodeParam({ name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined })}`;
        return this.httpClient.request('put', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            body: updateAuthUserDtoInterface,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthRestService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: RestClientConfiguration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthRestService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthRestService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: RestClientConfiguration, decorators: [{
                    type: Optional
                }] }] });

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class FilesRestService {
    httpClient;
    basePath = 'http://localhost';
    defaultHeaders = new HttpHeaders();
    configuration = new RestClientConfiguration();
    encoder;
    constructor(httpClient, basePath, configuration) {
        this.httpClient = httpClient;
        if (configuration) {
            this.configuration = configuration;
        }
        if (typeof this.configuration.basePath !== 'string') {
            const firstBasePath = Array.isArray(basePath) ? basePath[0] : undefined;
            if (firstBasePath != undefined) {
                basePath = firstBasePath;
            }
            if (typeof basePath !== 'string') {
                basePath = this.basePath;
            }
            this.configuration.basePath = basePath;
        }
        this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();
    }
    // @ts-ignore
    addToHttpParams(httpParams, value, key) {
        if (typeof value === "object" && value instanceof Date === false) {
            httpParams = this.addToHttpParamsRecursive(httpParams, value);
        }
        else {
            httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
        }
        return httpParams;
    }
    addToHttpParamsRecursive(httpParams, value, key) {
        if (value == null) {
            return httpParams;
        }
        if (typeof value === "object") {
            if (Array.isArray(value)) {
                value.forEach(elem => httpParams = this.addToHttpParamsRecursive(httpParams, elem, key));
            }
            else if (value instanceof Date) {
                if (key != null) {
                    httpParams = httpParams.append(key, value.toISOString().substring(0, 10));
                }
                else {
                    throw Error("key may not be null if value is Date");
                }
            }
            else {
                Object.keys(value).forEach(k => httpParams = this.addToHttpParamsRecursive(httpParams, value[k], key != null ? `${key}.${k}` : k));
            }
        }
        else if (key != null) {
            httpParams = httpParams.append(key, value);
        }
        else {
            throw Error("key may not be null if value is not object or array");
        }
        return httpParams;
    }
    filesControllerDeleteFile(downloadUrl, observe = 'body', reportProgress = false, options) {
        if (downloadUrl === null || downloadUrl === undefined) {
            throw new Error('Required parameter downloadUrl was null or undefined when calling filesControllerDeleteFile.');
        }
        let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
        if (downloadUrl !== undefined && downloadUrl !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, downloadUrl, 'downloadUrl');
        }
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/files/delete-file`;
        return this.httpClient.request('post', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            params: localVarQueryParameters,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    filesControllerGetPresignedUrl(ext, observe = 'body', reportProgress = false, options) {
        if (ext === null || ext === undefined) {
            throw new Error('Required parameter ext was null or undefined when calling filesControllerGetPresignedUrl.');
        }
        let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
        if (ext !== undefined && ext !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, ext, 'ext');
        }
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/files/get-presigned-url`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            params: localVarQueryParameters,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: FilesRestService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: RestClientConfiguration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: FilesRestService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: FilesRestService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: RestClientConfiguration, decorators: [{
                    type: Optional
                }] }] });

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class TerminusHealthCheckRestService {
    httpClient;
    basePath = 'http://localhost';
    defaultHeaders = new HttpHeaders();
    configuration = new RestClientConfiguration();
    encoder;
    constructor(httpClient, basePath, configuration) {
        this.httpClient = httpClient;
        if (configuration) {
            this.configuration = configuration;
        }
        if (typeof this.configuration.basePath !== 'string') {
            const firstBasePath = Array.isArray(basePath) ? basePath[0] : undefined;
            if (firstBasePath != undefined) {
                basePath = firstBasePath;
            }
            if (typeof basePath !== 'string') {
                basePath = this.basePath;
            }
            this.configuration.basePath = basePath;
        }
        this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();
    }
    // @ts-ignore
    addToHttpParams(httpParams, value, key) {
        if (typeof value === "object" && value instanceof Date === false) {
            httpParams = this.addToHttpParamsRecursive(httpParams, value);
        }
        else {
            httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
        }
        return httpParams;
    }
    addToHttpParamsRecursive(httpParams, value, key) {
        if (value == null) {
            return httpParams;
        }
        if (typeof value === "object") {
            if (Array.isArray(value)) {
                value.forEach(elem => httpParams = this.addToHttpParamsRecursive(httpParams, elem, key));
            }
            else if (value instanceof Date) {
                if (key != null) {
                    httpParams = httpParams.append(key, value.toISOString().substring(0, 10));
                }
                else {
                    throw Error("key may not be null if value is Date");
                }
            }
            else {
                Object.keys(value).forEach(k => httpParams = this.addToHttpParamsRecursive(httpParams, value[k], key != null ? `${key}.${k}` : k));
            }
        }
        else if (key != null) {
            httpParams = httpParams.append(key, value);
        }
        else {
            throw Error("key may not be null if value is not object or array");
        }
        return httpParams;
    }
    terminusHealthCheckControllerCheck(observe = 'body', reportProgress = false, options) {
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/health`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: TerminusHealthCheckRestService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: RestClientConfiguration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: TerminusHealthCheckRestService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: TerminusHealthCheckRestService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: RestClientConfiguration, decorators: [{
                    type: Optional
                }] }] });

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class TimeRestService {
    httpClient;
    basePath = 'http://localhost';
    defaultHeaders = new HttpHeaders();
    configuration = new RestClientConfiguration();
    encoder;
    constructor(httpClient, basePath, configuration) {
        this.httpClient = httpClient;
        if (configuration) {
            this.configuration = configuration;
        }
        if (typeof this.configuration.basePath !== 'string') {
            const firstBasePath = Array.isArray(basePath) ? basePath[0] : undefined;
            if (firstBasePath != undefined) {
                basePath = firstBasePath;
            }
            if (typeof basePath !== 'string') {
                basePath = this.basePath;
            }
            this.configuration.basePath = basePath;
        }
        this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();
    }
    // @ts-ignore
    addToHttpParams(httpParams, value, key) {
        if (typeof value === "object" && value instanceof Date === false) {
            httpParams = this.addToHttpParamsRecursive(httpParams, value);
        }
        else {
            httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
        }
        return httpParams;
    }
    addToHttpParamsRecursive(httpParams, value, key) {
        if (value == null) {
            return httpParams;
        }
        if (typeof value === "object") {
            if (Array.isArray(value)) {
                value.forEach(elem => httpParams = this.addToHttpParamsRecursive(httpParams, elem, key));
            }
            else if (value instanceof Date) {
                if (key != null) {
                    httpParams = httpParams.append(key, value.toISOString().substring(0, 10));
                }
                else {
                    throw Error("key may not be null if value is Date");
                }
            }
            else {
                Object.keys(value).forEach(k => httpParams = this.addToHttpParamsRecursive(httpParams, value[k], key != null ? `${key}.${k}` : k));
            }
        }
        else if (key != null) {
            httpParams = httpParams.append(key, value);
        }
        else {
            throw Error("key may not be null if value is not object or array");
        }
        return httpParams;
    }
    timeControllerTime(observe = 'body', reportProgress = false, options) {
        let localVarHeaders = this.defaultHeaders;
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/time`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: TimeRestService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: RestClientConfiguration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: TimeRestService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: TimeRestService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: RestClientConfiguration, decorators: [{
                    type: Optional
                }] }] });

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class WebhookRestService {
    httpClient;
    basePath = 'http://localhost';
    defaultHeaders = new HttpHeaders();
    configuration = new RestClientConfiguration();
    encoder;
    constructor(httpClient, basePath, configuration) {
        this.httpClient = httpClient;
        if (configuration) {
            this.configuration = configuration;
        }
        if (typeof this.configuration.basePath !== 'string') {
            const firstBasePath = Array.isArray(basePath) ? basePath[0] : undefined;
            if (firstBasePath != undefined) {
                basePath = firstBasePath;
            }
            if (typeof basePath !== 'string') {
                basePath = this.basePath;
            }
            this.configuration.basePath = basePath;
        }
        this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();
    }
    // @ts-ignore
    addToHttpParams(httpParams, value, key) {
        if (typeof value === "object" && value instanceof Date === false) {
            httpParams = this.addToHttpParamsRecursive(httpParams, value);
        }
        else {
            httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
        }
        return httpParams;
    }
    addToHttpParamsRecursive(httpParams, value, key) {
        if (value == null) {
            return httpParams;
        }
        if (typeof value === "object") {
            if (Array.isArray(value)) {
                value.forEach(elem => httpParams = this.addToHttpParamsRecursive(httpParams, elem, key));
            }
            else if (value instanceof Date) {
                if (key != null) {
                    httpParams = httpParams.append(key, value.toISOString().substring(0, 10));
                }
                else {
                    throw Error("key may not be null if value is Date");
                }
            }
            else {
                Object.keys(value).forEach(k => httpParams = this.addToHttpParamsRecursive(httpParams, value[k], key != null ? `${key}.${k}` : k));
            }
        }
        else if (key != null) {
            httpParams = httpParams.append(key, value);
        }
        else {
            throw Error("key may not be null if value is not object or array");
        }
        return httpParams;
    }
    webhookControllerCreateOne(createWebhookDtoInterface, xExternalUserId, xExternalTenantId, observe = 'body', reportProgress = false, options) {
        if (createWebhookDtoInterface === null || createWebhookDtoInterface === undefined) {
            throw new Error('Required parameter createWebhookDtoInterface was null or undefined when calling webhookControllerCreateOne.');
        }
        let localVarHeaders = this.defaultHeaders;
        if (xExternalUserId !== undefined && xExternalUserId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-user-id', String(xExternalUserId));
        }
        if (xExternalTenantId !== undefined && xExternalTenantId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-tenant-id', String(xExternalTenantId));
        }
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        // to determine the Content-Type header
        const consumes = [
            'application/json'
        ];
        const httpContentTypeSelected = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/webhook`;
        return this.httpClient.request('post', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            body: createWebhookDtoInterface,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    webhookControllerDeleteOne(id, xExternalUserId, xExternalTenantId, observe = 'body', reportProgress = false, options) {
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling webhookControllerDeleteOne.');
        }
        let localVarHeaders = this.defaultHeaders;
        if (xExternalUserId !== undefined && xExternalUserId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-user-id', String(xExternalUserId));
        }
        if (xExternalTenantId !== undefined && xExternalTenantId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-tenant-id', String(xExternalTenantId));
        }
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/webhook/${this.configuration.encodeParam({ name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined })}`;
        return this.httpClient.request('delete', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    webhookControllerEvents(xExternalUserId, xExternalTenantId, observe = 'body', reportProgress = false, options) {
        let localVarHeaders = this.defaultHeaders;
        if (xExternalUserId !== undefined && xExternalUserId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-user-id', String(xExternalUserId));
        }
        if (xExternalTenantId !== undefined && xExternalTenantId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-tenant-id', String(xExternalTenantId));
        }
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/webhook/events`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    webhookControllerFindMany(xExternalUserId, xExternalTenantId, curPage, perPage, searchText, sort, observe = 'body', reportProgress = false, options) {
        let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
        if (curPage !== undefined && curPage !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, curPage, 'curPage');
        }
        if (perPage !== undefined && perPage !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, perPage, 'perPage');
        }
        if (searchText !== undefined && searchText !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, searchText, 'searchText');
        }
        if (sort !== undefined && sort !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, sort, 'sort');
        }
        let localVarHeaders = this.defaultHeaders;
        if (xExternalUserId !== undefined && xExternalUserId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-user-id', String(xExternalUserId));
        }
        if (xExternalTenantId !== undefined && xExternalTenantId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-tenant-id', String(xExternalTenantId));
        }
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/webhook`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            params: localVarQueryParameters,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    webhookControllerFindManyLogs(id, xExternalUserId, xExternalTenantId, curPage, perPage, searchText, sort, observe = 'body', reportProgress = false, options) {
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling webhookControllerFindManyLogs.');
        }
        let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
        if (curPage !== undefined && curPage !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, curPage, 'curPage');
        }
        if (perPage !== undefined && perPage !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, perPage, 'perPage');
        }
        if (searchText !== undefined && searchText !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, searchText, 'searchText');
        }
        if (sort !== undefined && sort !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, sort, 'sort');
        }
        let localVarHeaders = this.defaultHeaders;
        if (xExternalUserId !== undefined && xExternalUserId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-user-id', String(xExternalUserId));
        }
        if (xExternalTenantId !== undefined && xExternalTenantId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-tenant-id', String(xExternalTenantId));
        }
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/webhook/${this.configuration.encodeParam({ name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined })}/logs`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            params: localVarQueryParameters,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    webhookControllerFindOne(id, xExternalUserId, xExternalTenantId, observe = 'body', reportProgress = false, options) {
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling webhookControllerFindOne.');
        }
        let localVarHeaders = this.defaultHeaders;
        if (xExternalUserId !== undefined && xExternalUserId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-user-id', String(xExternalUserId));
        }
        if (xExternalTenantId !== undefined && xExternalTenantId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-tenant-id', String(xExternalTenantId));
        }
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/webhook/${this.configuration.encodeParam({ name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined })}`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    webhookControllerProfile(xExternalUserId, xExternalTenantId, observe = 'body', reportProgress = false, options) {
        let localVarHeaders = this.defaultHeaders;
        if (xExternalUserId !== undefined && xExternalUserId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-user-id', String(xExternalUserId));
        }
        if (xExternalTenantId !== undefined && xExternalTenantId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-tenant-id', String(xExternalTenantId));
        }
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/webhook/profile`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    webhookControllerUpdateOne(id, updateWebhookDtoInterface, xExternalUserId, xExternalTenantId, observe = 'body', reportProgress = false, options) {
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling webhookControllerUpdateOne.');
        }
        if (updateWebhookDtoInterface === null || updateWebhookDtoInterface === undefined) {
            throw new Error('Required parameter updateWebhookDtoInterface was null or undefined when calling webhookControllerUpdateOne.');
        }
        let localVarHeaders = this.defaultHeaders;
        if (xExternalUserId !== undefined && xExternalUserId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-user-id', String(xExternalUserId));
        }
        if (xExternalTenantId !== undefined && xExternalTenantId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-tenant-id', String(xExternalTenantId));
        }
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        // to determine the Content-Type header
        const consumes = [
            'application/json'
        ];
        const httpContentTypeSelected = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/webhook/${this.configuration.encodeParam({ name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined })}`;
        return this.httpClient.request('put', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            body: updateWebhookDtoInterface,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    webhookUsersControllerDeleteOne(id, xExternalUserId, xExternalTenantId, observe = 'body', reportProgress = false, options) {
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling webhookUsersControllerDeleteOne.');
        }
        let localVarHeaders = this.defaultHeaders;
        if (xExternalUserId !== undefined && xExternalUserId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-user-id', String(xExternalUserId));
        }
        if (xExternalTenantId !== undefined && xExternalTenantId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-tenant-id', String(xExternalTenantId));
        }
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/webhook/users/${this.configuration.encodeParam({ name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined })}`;
        return this.httpClient.request('delete', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    webhookUsersControllerFindMany(xExternalUserId, xExternalTenantId, curPage, perPage, searchText, sort, observe = 'body', reportProgress = false, options) {
        let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
        if (curPage !== undefined && curPage !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, curPage, 'curPage');
        }
        if (perPage !== undefined && perPage !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, perPage, 'perPage');
        }
        if (searchText !== undefined && searchText !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, searchText, 'searchText');
        }
        if (sort !== undefined && sort !== null) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, sort, 'sort');
        }
        let localVarHeaders = this.defaultHeaders;
        if (xExternalUserId !== undefined && xExternalUserId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-user-id', String(xExternalUserId));
        }
        if (xExternalTenantId !== undefined && xExternalTenantId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-tenant-id', String(xExternalTenantId));
        }
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/webhook/users`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            params: localVarQueryParameters,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    webhookUsersControllerFindOne(id, xExternalUserId, xExternalTenantId, observe = 'body', reportProgress = false, options) {
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling webhookUsersControllerFindOne.');
        }
        let localVarHeaders = this.defaultHeaders;
        if (xExternalUserId !== undefined && xExternalUserId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-user-id', String(xExternalUserId));
        }
        if (xExternalTenantId !== undefined && xExternalTenantId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-tenant-id', String(xExternalTenantId));
        }
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/webhook/users/${this.configuration.encodeParam({ name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined })}`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    webhookUsersControllerUpdateOne(id, updateWebhookUserDtoInterface, xExternalUserId, xExternalTenantId, observe = 'body', reportProgress = false, options) {
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling webhookUsersControllerUpdateOne.');
        }
        if (updateWebhookUserDtoInterface === null || updateWebhookUserDtoInterface === undefined) {
            throw new Error('Required parameter updateWebhookUserDtoInterface was null or undefined when calling webhookUsersControllerUpdateOne.');
        }
        let localVarHeaders = this.defaultHeaders;
        if (xExternalUserId !== undefined && xExternalUserId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-user-id', String(xExternalUserId));
        }
        if (xExternalTenantId !== undefined && xExternalTenantId !== null) {
            localVarHeaders = localVarHeaders.set('x-external-tenant-id', String(xExternalTenantId));
        }
        let localVarHttpHeaderAcceptSelected = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        let localVarHttpContext = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }
        let localVarTransferCache = options && options.transferCache;
        if (localVarTransferCache === undefined) {
            localVarTransferCache = true;
        }
        // to determine the Content-Type header
        const consumes = [
            'application/json'
        ];
        const httpContentTypeSelected = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/api/webhook/users/${this.configuration.encodeParam({ name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined })}`;
        return this.httpClient.request('put', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            body: updateWebhookUserDtoInterface,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookRestService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: RestClientConfiguration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookRestService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookRestService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: RestClientConfiguration, decorators: [{
                    type: Optional
                }] }] });

const APIS = [AppRestService, AuthRestService, FilesRestService, TerminusHealthCheckRestService, TimeRestService, WebhookRestService];

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
const AuthErrorEnumInterface = {
    _000: 'AUTH-000',
    _001: 'AUTH-001',
    _002: 'AUTH-002'
};

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
const AuthRoleInterface = {
    Admin: 'Admin',
    User: 'User'
};

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
const AuthUserScalarFieldEnumInterface = {
    id: 'id',
    externalUserId: 'externalUserId',
    userRole: 'userRole',
    timezone: 'timezone',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    lang: 'lang'
};

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
const FilesErrorEnumInterface = {
    _000: 'FILES-000',
    _001: 'FILES-001'
};

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
const ValidationErrorEnumInterface = {
    VALIDATION_000: 'VALIDATION-000'
};

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
const WebhookErrorEnumInterface = {
    _000: 'WEBHOOK-000',
    _001: 'WEBHOOK-001',
    _002: 'WEBHOOK-002',
    _003: 'WEBHOOK-003',
    _004: 'WEBHOOK-004',
    _005: 'WEBHOOK-005'
};

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
const WebhookLogScalarFieldEnumInterface = {
    id: 'id',
    request: 'request',
    responseStatus: 'responseStatus',
    response: 'response',
    webhookStatus: 'webhookStatus',
    webhookId: 'webhookId',
    externalTenantId: 'externalTenantId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
const WebhookRoleInterface = {
    Admin: 'Admin',
    User: 'User'
};

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
const WebhookScalarFieldEnumInterface = {
    id: 'id',
    eventName: 'eventName',
    endpoint: 'endpoint',
    enabled: 'enabled',
    headers: 'headers',
    requestTimeout: 'requestTimeout',
    externalTenantId: 'externalTenantId',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    workUntilDate: 'workUntilDate'
};

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
const WebhookStatusInterface = {
    Pending: 'Pending',
    Process: 'Process',
    Success: 'Success',
    Error: 'Error',
    Timeout: 'Timeout'
};

/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
const WebhookUserScalarFieldEnumInterface = {
    id: 'id',
    externalTenantId: 'externalTenantId',
    externalUserId: 'externalUserId',
    userRole: 'userRole',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};

/**
 * Generated bundle index. Do not edit.
 */

export { APIS, AppRestService, AuthErrorEnumInterface, AuthRestService, AuthRoleInterface, AuthUserScalarFieldEnumInterface, BASE_PATH, COLLECTION_FORMATS, CustomHttpParameterCodec, FilesErrorEnumInterface, FilesRestService, RestClientApiModule, RestClientConfiguration, TerminusHealthCheckRestService, TimeRestService, ValidationErrorEnumInterface, WebhookErrorEnumInterface, WebhookLogScalarFieldEnumInterface, WebhookRestService, WebhookRoleInterface, WebhookScalarFieldEnumInterface, WebhookStatusInterface, WebhookUserScalarFieldEnumInterface };
//# sourceMappingURL=nestjs-mod-fullstack-app-angular-rest-sdk.mjs.map
