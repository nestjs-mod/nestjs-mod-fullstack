import { TranslocoService } from '@jsverse/transloco';
import { LangToLocaleMapping, TranslocoLocaleService } from '@jsverse/transloco-locale';
import { NzI18nService } from 'ng-zorro-antd/i18n';
import * as i0 from "@angular/core";
export declare class ActiveLangService {
    private readonly translocoService;
    private readonly translocoLocaleService;
    private readonly nzI18nService;
    readonly langToLocaleMapping: LangToLocaleMapping;
    constructor(translocoService: TranslocoService, translocoLocaleService: TranslocoLocaleService, nzI18nService: NzI18nService, langToLocaleMapping: LangToLocaleMapping);
    applyActiveLang(lang: string): void;
    normalizeLangKey(lang: string): {
        locale: string;
        localeInSnakeCase: string;
        localeInCamelCase: string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<ActiveLangService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ActiveLangService>;
}
