import { InjectionToken } from '@angular/core';
import { Authorizer } from '@authorizerdev/authorizer-js';
import * as i0 from "@angular/core";
export declare const AUTHORIZER_URL: InjectionToken<string>;
export declare class AuthorizerService extends Authorizer {
    private readonly authorizerURL;
    constructor(authorizerURL: string);
    static ɵfac: i0.ɵɵFactoryDeclaration<AuthorizerService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AuthorizerService>;
}
