import { ModuleWithProviders } from '@angular/core';
import { RestClientConfiguration } from './configuration';
import { HttpClient } from '@angular/common/http';
import * as i0 from "@angular/core";
export declare class RestClientApiModule {
    static forRoot(configurationFactory: () => RestClientConfiguration): ModuleWithProviders<RestClientApiModule>;
    constructor(parentModule: RestClientApiModule, http: HttpClient);
    static ɵfac: i0.ɵɵFactoryDeclaration<RestClientApiModule, [{ optional: true; skipSelf: true; }, { optional: true; }]>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<RestClientApiModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<RestClientApiModule>;
}
