import { AsyncPipe } from '@angular/common';
import * as i0 from '@angular/core';
import { Injectable, Inject, Component, ChangeDetectionStrategy, Pipe, InjectionToken } from '@angular/core';
import * as i3 from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import * as i1 from '@jsverse/transloco';
import { toCamelCase, TranslocoService } from '@jsverse/transloco';
import * as i4 from '@ngx-formly/core';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import * as i5 from 'ng-zorro-antd/date-picker';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { map, of, throwError, Observable, finalize } from 'rxjs';
import * as i2 from '@jsverse/transloco-locale';
import { TRANSLOCO_LOCALE_LANG_MAPPING } from '@jsverse/transloco-locale';
import * as dateFnsLocales from 'date-fns/locale';
import * as ngZorroLocales from 'ng-zorro-antd/i18n';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { SupabaseClient } from '@supabase/supabase-js';
import { __decorate, __metadata } from 'tslib';
import { ValidationErrorEnumInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { UntilDestroy } from '@ngneat/until-destroy';

const BROWSER_TIMEZONE_OFFSET = new Date().getTimezoneOffset() / 60;

const DATE_INPUT_FORMATS = {
    'en-US': 'MM/dd/yyyy HH:mm:ss',
    'en-GB': 'dd/MM/yyyy HH:mm:ss',
    'ar-SA': 'dd/MM/yyyy هه:sس',
    'bg-BG': 'd.M.yyyy H:m:s ч.',
    'ca-ES': 'dd/MM/yyyy H:mm:ss',
    'cs-CZ': 'd.M.yyyy H:mm:ss',
    'da-DK': 'dd-MM-yyyy HH:mm:ss',
    'de-DE': 'dd.MM.yyyy HH:mm:ss',
    'el-GR': 'd/M/yyyy h:mm:ss πμ|μμ',
    'es-MX': 'dd/MM/yyyy H:mm:ss',
    'fi-FI': 'd.M.yyyy klo H.mm.ss',
    'fr-FR': 'dd/MM/yyyy HH:mm:ss',
    'he-IL': 'dd/MM/yyyy HH:mm:ss',
    'hi-IN': 'dd-MM-yyyy hh:mm:ss बजे',
    'hr-HR': 'd.M.yyyy. H:mm:ss',
    'hu-HU': 'yyyy.MM.dd. H:mm:ss',
    'id-ID': 'dd/MM/yyyy HH:mm:ss',
    'is-IS': 'd.M.yyyy kl. HH:mm:ss',
    'it-IT': 'dd/MM/yyyy HH:mm:ss',
    'ja-JP': 'yyyy/MM/dd HH:mm:ss',
    'ko-KR': 'yyyy년 MM월 dd일 HH시 mm분 ss초',
    'lt-LT': 'yyyy.MM.dd. HH:mm:ss',
    'lv-LV': 'yyyy.gada MM.mēnesis dd.diena HH:mm:ss',
    'ms-MY': 'dd/MM/yyyy HH:mm:ss',
    'nl-NL': 'dd-MM-yyyy HH:mm:ss',
    'no-NO': 'dd.MM.yyyy HH:mm:ss',
    'pl-PL': 'dd.MM.yyyy HH:mm:ss',
    'pt-BR': 'dd/MM/yyyy HH:mm:ss',
    'ro-RO': 'dd.MM.yyyy HH:mm:ss',
    'ru-RU': 'dd.MM.yyyy HH:mm:ss',
    'sk-SK': 'd. M. yyyy H:mm:ss',
    'sl-SI': 'd.M.yyyy H:mm:ss',
    'sr-RS': 'dd.MM.yyyy. HH:mm:ss',
    'sv-SE': 'yyyy-MM-dd HH:mm:ss',
    'th-TH': 'วันที่ d เดือน M ปี yyyy เวลา H:mm:ss',
    'tr-TR': 'dd.MM.yyyy HH:mm:ss',
    'uk-UA': 'dd.MM.yyyy HH:mm:ss',
    'vi-VN': 'dd/MM/yyyy HH:mm:ss',
    'zh-CN': 'yyyy年MM月dd日 HH时mm分ss秒',
    'zh-TW': 'yyyy年MM月dd日 HH時mm分ss秒',
};

class ActiveLangService {
    translocoService;
    translocoLocaleService;
    nzI18nService;
    langToLocaleMapping;
    constructor(translocoService, translocoLocaleService, nzI18nService, langToLocaleMapping) {
        this.translocoService = translocoService;
        this.translocoLocaleService = translocoLocaleService;
        this.nzI18nService = nzI18nService;
        this.langToLocaleMapping = langToLocaleMapping;
    }
    applyActiveLang(lang) {
        const { locale, localeInSnakeCase, localeInCamelCase } = this.normalizeLangKey(lang);
        this.translocoService.setActiveLang(lang);
        this.translocoLocaleService.setLocale(locale);
        if (ngZorroLocales[localeInSnakeCase]) {
            this.nzI18nService.setLocale(ngZorroLocales[localeInSnakeCase]);
        }
        if (dateFnsLocales[lang]) {
            this.nzI18nService.setDateLocale(dateFnsLocales[lang]);
        }
        if (dateFnsLocales[localeInCamelCase]) {
            this.nzI18nService.setDateLocale(dateFnsLocales[localeInCamelCase]);
        }
    }
    normalizeLangKey(lang) {
        const locale = this.langToLocaleMapping[lang];
        const localeInCamelCase = toCamelCase(locale);
        const localeInSnakeCase = locale.split('-').join('_');
        return { locale, localeInSnakeCase, localeInCamelCase };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: ActiveLangService, deps: [{ token: i1.TranslocoService }, { token: i2.TranslocoLocaleService }, { token: ngZorroLocales.NzI18nService }, { token: TRANSLOCO_LOCALE_LANG_MAPPING }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: ActiveLangService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: ActiveLangService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.TranslocoService }, { type: i2.TranslocoLocaleService }, { type: ngZorroLocales.NzI18nService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [TRANSLOCO_LOCALE_LANG_MAPPING]
                }] }] });

class DateInputComponent extends FieldType {
    translocoService;
    activeLangService;
    format$;
    constructor(translocoService, activeLangService) {
        super();
        this.translocoService = translocoService;
        this.activeLangService = activeLangService;
        this.format$ = translocoService.langChanges$.pipe(map((lang) => {
            const { locale } = this.activeLangService.normalizeLangKey(lang);
            return DATE_INPUT_FORMATS[locale]
                ? DATE_INPUT_FORMATS[locale]
                : DATE_INPUT_FORMATS['en-US'];
        }));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: DateInputComponent, deps: [{ token: i1.TranslocoService }, { token: ActiveLangService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.5", type: DateInputComponent, isStandalone: true, selector: "date-input", usesInheritance: true, ngImport: i0, template: `
    <nz-date-picker
      [formControl]="formControl"
      [formlyAttributes]="field"
      [nzShowTime]="true"
      [nzFormat]="(format$ | async)!"
    ></nz-date-picker>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i3.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i3.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "ngmodule", type: FormlyModule }, { kind: "directive", type: i4.ɵFormlyAttributes, selector: "[formlyAttributes]", inputs: ["formlyAttributes", "id"] }, { kind: "ngmodule", type: NzDatePickerModule }, { kind: "component", type: i5.NzDatePickerComponent, selector: "nz-date-picker,nz-week-picker,nz-month-picker,nz-quarter-picker,nz-year-picker,nz-range-picker", inputs: ["nzAllowClear", "nzAutoFocus", "nzDisabled", "nzBorderless", "nzInputReadOnly", "nzInline", "nzOpen", "nzDisabledDate", "nzLocale", "nzPlaceHolder", "nzPopupStyle", "nzDropdownClassName", "nzSize", "nzStatus", "nzFormat", "nzDateRender", "nzDisabledTime", "nzRenderExtraFooter", "nzShowToday", "nzMode", "nzShowNow", "nzRanges", "nzDefaultPickerValue", "nzSeparator", "nzSuffixIcon", "nzBackdrop", "nzId", "nzPlacement", "nzShowWeekNumber", "nzShowTime"], outputs: ["nzOnPanelChange", "nzOnCalendarChange", "nzOnOk", "nzOnOpenChange"], exportAs: ["nzDatePicker"] }, { kind: "pipe", type: AsyncPipe, name: "async" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: DateInputComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'date-input',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    imports: [ReactiveFormsModule, FormlyModule, NzDatePickerModule, AsyncPipe],
                    template: `
    <nz-date-picker
      [formControl]="formControl"
      [formlyAttributes]="field"
      [nzShowTime]="true"
      [nzFormat]="(format$ | async)!"
    ></nz-date-picker>
  `,
                }]
        }], ctorParameters: () => [{ type: i1.TranslocoService }, { type: ActiveLangService }] });

const COMMON_FORMLY_FIELDS = [
    {
        name: 'date-input',
        component: DateInputComponent,
        extends: 'input',
    },
];

function getQueryMetaByParams(params) {
    return {
        curPage: params.pageIndex,
        perPage: params.pageSize,
        sort: params.sort
            .filter((s) => s.value)
            .reduce((all, cur) => {
            if (cur.value === 'ascend') {
                return { ...all, [cur.key]: 'asc' };
            }
            if (cur.value === 'descend') {
                return { ...all, [cur.key]: 'desc' };
            }
            return all;
        }, {}),
    };
}

class NzTableSortOrderDetectorPipe {
    transform(value) {
        if (value === 'asc') {
            return 'ascend';
        }
        if (value === 'desc') {
            return 'descend';
        }
        return null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: NzTableSortOrderDetectorPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "19.0.5", ngImport: i0, type: NzTableSortOrderDetectorPipe, isStandalone: true, name: "nzTableSortOrderDetector" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: NzTableSortOrderDetectorPipe, decorators: [{
            type: Pipe,
            args: [{
                    standalone: true,
                    name: 'nzTableSortOrderDetector',
                }]
        }] });

const DEFAULT_QUERY_META = {
    curPage: 1,
    perPage: 5,
    sort: { createdAt: 'desc' },
};
function getQueryMeta(meta, defaultQueryMeta) {
    return {
        sort: Object.keys(meta.sort || {}).length === 0
            ? defaultQueryMeta?.sort || { createdAt: 'desc' }
            : meta.sort || {},
        curPage: !meta.curPage
            ? defaultQueryMeta?.curPage || DEFAULT_QUERY_META.curPage
            : meta.curPage,
        perPage: !meta.perPage
            ? defaultQueryMeta?.perPage || DEFAULT_QUERY_META.perPage
            : meta.perPage,
    };
}

const SUPABASE_URL = new InjectionToken('SupabaseUrl');
const SUPABASE_KEY = new InjectionToken('SupabaseKey');
function mapAuthResponse() {
    return map((result) => {
        const message = result.error?.message;
        if (message) {
            if (message === 'unauthorized') {
                throw new Error(marker('Unauthorized'));
            }
            else {
                throw new Error(message);
            }
        }
        return result.data;
    });
}
function mapAuthError() {
    return map((result) => {
        if (!result.error) {
            return result.error;
        }
        const message = result.error.message;
        throw new Error(message);
    });
}
function mapUserResponse() {
    return map((result) => {
        const message = result.error?.message;
        if (message) {
            if (message === 'unauthorized') {
                throw new Error(marker('Unauthorized'));
            }
            else {
                throw new Error(message);
            }
        }
        return result.data;
    });
}
function mapAuthTokenResponsePassword() {
    return map((result) => {
        const message = result.error?.message;
        if (message) {
            if (message === 'unauthorized') {
                throw new Error(marker('Unauthorized'));
            }
            else {
                throw new Error(message);
            }
        }
        return result.data;
    });
}
class SupabaseService extends SupabaseClient {
    _supabaseUrl;
    _supabaseKey;
    constructor(_supabaseUrl, _supabaseKey) {
        super(_supabaseUrl, _supabaseKey);
        this._supabaseUrl = _supabaseUrl;
        this._supabaseKey = _supabaseKey;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: SupabaseService, deps: [{ token: SUPABASE_URL }, { token: SUPABASE_KEY }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: SupabaseService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: SupabaseService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [SUPABASE_URL]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [SUPABASE_KEY]
                }] }] });

let ValidationService = class ValidationService {
    translocoService;
    constructor(translocoService) {
        this.translocoService = translocoService;
    }
    catchAndProcessServerError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err, setFormlyFields) {
        const error = err.error;
        if (error?.code?.includes(ValidationErrorEnumInterface.VALIDATION_000)) {
            setFormlyFields({ errors: error.metadata });
            return of(null);
        }
        return throwError(() => err);
    }
    appendServerErrorsAsValidatorsToFields(fields, errors) {
        return (fields || []).map((f) => {
            const error = errors?.find((e) => e.property === f.key);
            if (error) {
                f.validators = Object.fromEntries(error.constraints.map((c) => {
                    if (typeof f.key === 'string') {
                        c.description = c.description.replace(f.key, this.translocoService.translate('field "{{label}}"', {
                            label: f.props?.label?.toLowerCase(),
                        }));
                    }
                    return [
                        c.name === 'isNotEmpty' ? 'required' : c.name,
                        {
                            expression: () => false,
                            message: () => c.description,
                        },
                    ];
                }));
            }
            return f;
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: ValidationService, deps: [{ token: i1.TranslocoService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: ValidationService, providedIn: 'root' });
};
ValidationService = __decorate([
    UntilDestroy(),
    __metadata("design:paramtypes", [TranslocoService])
], ValidationService);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: ValidationService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.TranslocoService }] });

function mapGraphqlErrors() {
    return map((result) => {
        const message = result.errors?.[0]?.message;
        if (message) {
            if (message === 'unauthorized') {
                throw new Error(marker('Unauthorized'));
            }
            else {
                throw new Error(message);
            }
        }
        return result.data;
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeParseJson(data) {
    try {
        return JSON.parse(data);
    }
    catch (err) {
        return data;
    }
}

function webSocket({ address, eventName, options, }) {
    const wss = new WebSocket(address.replace('/api', '').replace('http', 'ws'), options);
    return new Observable((observer) => {
        wss.addEventListener('open', () => {
            wss.addEventListener('message', ({ data }) => {
                observer.next(JSON.parse(data.toString()));
            });
            wss.addEventListener('error', (err) => {
                observer.error(err);
                if (wss?.readyState == WebSocket.OPEN) {
                    wss.close();
                }
            });
            wss.send(JSON.stringify({
                event: eventName,
                data: true,
            }));
        });
    }).pipe(finalize(() => {
        if (wss?.readyState == WebSocket.OPEN) {
            wss.close();
        }
    }));
}

/**
 * Generated bundle index. Do not edit.
 */

export { ActiveLangService, BROWSER_TIMEZONE_OFFSET, COMMON_FORMLY_FIELDS, DATE_INPUT_FORMATS, DEFAULT_QUERY_META, DateInputComponent, NzTableSortOrderDetectorPipe, SUPABASE_KEY, SUPABASE_URL, SupabaseService, ValidationService, getQueryMeta, getQueryMetaByParams, mapAuthError, mapAuthResponse, mapAuthTokenResponsePassword, mapGraphqlErrors, mapUserResponse, safeParseJson, webSocket };
//# sourceMappingURL=nestjs-mod-fullstack-common-angular.mjs.map
