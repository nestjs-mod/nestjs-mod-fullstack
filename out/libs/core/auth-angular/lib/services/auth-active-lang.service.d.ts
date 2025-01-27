import { TranslocoService } from '@jsverse/transloco';
import { LangToLocaleMapping } from '@jsverse/transloco-locale';
import { AuthRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { ActiveLangService } from '@nestjs-mod-fullstack/common-angular';
import * as i0 from "@angular/core";
export declare class AuthActiveLangService {
    private readonly authRestService;
    private readonly translocoService;
    readonly langToLocaleMapping: LangToLocaleMapping;
    private readonly activeLangService;
    constructor(authRestService: AuthRestService, translocoService: TranslocoService, langToLocaleMapping: LangToLocaleMapping, activeLangService: ActiveLangService);
    getActiveLang(): import("rxjs").Observable<string>;
    setActiveLang(lang: string): import("rxjs").Observable<import("@nestjs-mod-fullstack/app-angular-rest-sdk").StatusResponseInterface | null>;
    static ɵfac: i0.ɵɵFactoryDeclaration<AuthActiveLangService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AuthActiveLangService>;
}
