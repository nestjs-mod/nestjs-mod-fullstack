import * as i7 from '@angular/common';
import { AsyncPipe, CommonModule } from '@angular/common';
import * as i0 from '@angular/core';
import { Injectable, InjectionToken, EventEmitter, Component, ChangeDetectionStrategy, Optional, Inject, Input, Output, ViewContainerRef } from '@angular/core';
import * as i13 from '@angular/forms';
import { UntypedFormGroup, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import * as i3 from '@jsverse/transloco';
import { TranslocoService, TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import * as i6 from '@ngx-formly/core';
import { FormlyModule } from '@ngx-formly/core';
import * as i9 from 'ng-zorro-antd/button';
import { NzButtonModule } from 'ng-zorro-antd/button';
import * as i8 from 'ng-zorro-antd/form';
import { NzFormModule } from 'ng-zorro-antd/form';
import * as i11$1 from 'ng-zorro-antd/input';
import { NzInputModule } from 'ng-zorro-antd/input';
import * as i2$1 from 'ng-zorro-antd/message';
import { NzMessageService } from 'ng-zorro-antd/message';
import * as i2$2 from 'ng-zorro-antd/modal';
import { NZ_MODAL_DATA, NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, tap, catchError, of, throwError, map, mergeMap, debounceTime, distinctUntilChanged } from 'rxjs';
import { __decorate, __metadata } from 'tslib';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import * as i2 from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { WebhookRestService, WebhookScalarFieldEnumInterface, WebhookLogScalarFieldEnumInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import * as i3$1 from '@nestjs-mod-fullstack/common-angular';
import { ValidationService, BROWSER_TIMEZONE_OFFSET, safeParseJson, getQueryMetaByParams, getQueryMeta, NzTableSortOrderDetectorPipe } from '@nestjs-mod-fullstack/common-angular';
import * as i4 from 'ng-zorro-antd/grid';
import { NzGridModule } from 'ng-zorro-antd/grid';
import * as i10 from 'ng-zorro-antd/core/transition-patch';
import * as i11 from 'ng-zorro-antd/core/wave';
import { addHours, format } from 'date-fns';
import { RouterModule } from '@angular/router';
import isEqual from 'lodash/fp/isEqual';
import omit from 'lodash/fp/omit';
import * as i6$1 from 'ng-zorro-antd/divider';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import * as i12 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import * as i5 from 'ng-zorro-antd/table';
import { NzTableModule } from 'ng-zorro-antd/table';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { TranslocoDatePipe } from '@jsverse/transloco-locale';

let WebhookAuthService = class WebhookAuthService {
    webhookRestService;
    webhookAuthCredentials$ = new BehaviorSubject({});
    webhookUser$ = new BehaviorSubject(null);
    constructor(webhookRestService) {
        this.webhookRestService = webhookRestService;
    }
    getWebhookAuthCredentials() {
        return this.webhookAuthCredentials$.value;
    }
    getWebhookUser() {
        return this.webhookUser$.value;
    }
    setWebhookAuthCredentials(webhookAuthCredentials) {
        this.webhookAuthCredentials$.next(webhookAuthCredentials);
        this.loadWebhookUser().pipe(untilDestroyed(this)).subscribe();
    }
    loadWebhookUser() {
        return this.webhookRestService
            .webhookControllerProfile(this.getWebhookAuthCredentials().xExternalUserId, this.getWebhookAuthCredentials().xExternalTenantId)
            .pipe(tap((profile) => this.webhookUser$.next(profile)), catchError((err) => {
            if (err.error?.code === 'WEBHOOK-002') {
                return of(null);
            }
            return throwError(() => err);
        }));
    }
    webhookAuthCredentialsUpdates() {
        return this.webhookAuthCredentials$.asObservable();
    }
    webhookUserUpdates() {
        return this.webhookUser$.asObservable();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookAuthService, deps: [{ token: i2.WebhookRestService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookAuthService, providedIn: 'root' });
};
WebhookAuthService = __decorate([
    UntilDestroy(),
    __metadata("design:paramtypes", [WebhookRestService])
], WebhookAuthService);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookAuthService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i2.WebhookRestService }] });

class WebhookEventsService {
    webhookAuthService;
    webhookRestService;
    constructor(webhookAuthService, webhookRestService) {
        this.webhookAuthService = webhookAuthService;
        this.webhookRestService = webhookRestService;
    }
    findMany() {
        return this.webhookRestService.webhookControllerEvents(this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId, this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookEventsService, deps: [{ token: WebhookAuthService }, { token: i2.WebhookRestService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookEventsService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookEventsService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: WebhookAuthService }, { type: i2.WebhookRestService }] });

let WebhookAuthFormService = class WebhookAuthFormService {
    webhookEventsService;
    translocoService;
    validationService;
    events = [];
    constructor(webhookEventsService, translocoService, validationService) {
        this.webhookEventsService = webhookEventsService;
        this.translocoService = translocoService;
        this.validationService = validationService;
    }
    init() {
        return this.webhookEventsService.findMany().pipe(tap((events) => {
            this.events = events;
        }));
    }
    getFormlyFields(options) {
        return this.validationService.appendServerErrorsAsValidatorsToFields([
            {
                key: 'xExternalUserId',
                type: 'input',
                validation: {
                    show: true,
                },
                props: {
                    label: this.translocoService.translate(`webhook.form.fields.x-external-userId`),
                    placeholder: 'xExternalUserId',
                    required: true,
                },
            },
            {
                key: 'xExternalTenantId',
                type: 'input',
                validation: {
                    show: true,
                },
                props: {
                    label: this.translocoService.translate(`webhook.form.fields.x-external-tenantId`),
                    placeholder: 'xExternalTenantId',
                    required: options?.settings?.xExternalTenantIdIsRequired,
                },
            },
        ], options?.errors || []);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookAuthFormService, deps: [{ token: WebhookEventsService }, { token: i3.TranslocoService }, { token: i3$1.ValidationService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookAuthFormService, providedIn: 'root' });
};
WebhookAuthFormService = __decorate([
    UntilDestroy(),
    __metadata("design:paramtypes", [WebhookEventsService,
        TranslocoService,
        ValidationService])
], WebhookAuthFormService);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookAuthFormService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: WebhookEventsService }, { type: i3.TranslocoService }, { type: i3$1.ValidationService }] });

class WebhookAuthMapperService {
    toModel(data) {
        return {
            xExternalUserId: data['xExternalUserId'],
            xExternalTenantId: data['xExternalTenantId'],
        };
    }
    toJson(data) {
        return {
            xExternalUserId: data['xExternalUserId'],
            xExternalTenantId: data['xExternalTenantId'],
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookAuthMapperService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookAuthMapperService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookAuthMapperService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class WebhookConfiguration {
    webhookSuperAdminExternalUserId;
    constructor(options) {
        Object.assign(this, options);
    }
}
const WEBHOOK_CONFIGURATION_TOKEN = new InjectionToken('WEBHOOK_CONFIGURATION_TOKEN');

class WebhookAuthFormComponent {
    nzModalData;
    webhookConfiguration;
    webhookAuthService;
    nzMessageService;
    translocoService;
    webhookAuthFormService;
    webhookAuthMapperService;
    hideButtons;
    afterSignIn = new EventEmitter();
    form = new UntypedFormGroup({});
    formlyModel$ = new BehaviorSubject(null);
    formlyFields$ = new BehaviorSubject(null);
    constructor(nzModalData, webhookConfiguration, webhookAuthService, nzMessageService, translocoService, webhookAuthFormService, webhookAuthMapperService) {
        this.nzModalData = nzModalData;
        this.webhookConfiguration = webhookConfiguration;
        this.webhookAuthService = webhookAuthService;
        this.nzMessageService = nzMessageService;
        this.translocoService = translocoService;
        this.webhookAuthFormService = webhookAuthFormService;
        this.webhookAuthMapperService = webhookAuthMapperService;
    }
    ngOnInit() {
        Object.assign(this, this.nzModalData);
        this.setFieldsAndModel(this.webhookAuthService.getWebhookAuthCredentials());
    }
    setFieldsAndModel(data = {}, settings = {
        xExternalTenantIdIsRequired: true,
    }) {
        const model = this.webhookAuthMapperService.toModel(data);
        this.setFormlyFields({ data: model, settings });
        this.formlyModel$.next(model);
    }
    submitForm() {
        if (this.form.valid) {
            const value = this.webhookAuthMapperService.toJson(this.form.value);
            this.afterSignIn.next(value);
            this.webhookAuthService.setWebhookAuthCredentials(value);
            this.nzMessageService.success(this.translocoService.translate('Success'));
        }
        else {
            console.log(this.form.controls);
            this.nzMessageService.warning(this.translocoService.translate('Validation errors'));
        }
    }
    fillUserCredentials() {
        this.setFieldsAndModel({
            xExternalTenantId: '2079150a-f133-405c-9e77-64d3ab8aff77',
            xExternalUserId: '3072607c-8c59-4fc4-9a37-916825bc0f99',
        });
    }
    fillAdminCredentials() {
        this.setFieldsAndModel({
            xExternalTenantId: '',
            xExternalUserId: this.webhookConfiguration.webhookSuperAdminExternalUserId,
        }, { xExternalTenantIdIsRequired: false });
    }
    setFormlyFields(options) {
        this.formlyFields$.next(this.webhookAuthFormService.getFormlyFields(options));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookAuthFormComponent, deps: [{ token: NZ_MODAL_DATA, optional: true }, { token: WEBHOOK_CONFIGURATION_TOKEN }, { token: WebhookAuthService }, { token: i2$1.NzMessageService }, { token: i3.TranslocoService }, { token: WebhookAuthFormService }, { token: WebhookAuthMapperService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.0.5", type: WebhookAuthFormComponent, isStandalone: true, selector: "webhook-auth-form", inputs: { hideButtons: "hideButtons" }, outputs: { afterSignIn: "afterSignIn" }, ngImport: i0, template: "@if (formlyFields$ | async; as formlyFields) {\n<form nz-form [formGroup]=\"form\" (ngSubmit)=\"submitForm()\">\n  <formly-form\n    [model]=\"formlyModel$ | async\"\n    [fields]=\"formlyFields\"\n    [form]=\"form\"\n  >\n  </formly-form>\n  @if (!hideButtons) {\n  <nz-form-control>\n    <div class=\"flex justify-between\">\n      <div>\n        <button\n          nz-button\n          type=\"button\"\n          (click)=\"fillUserCredentials()\"\n          transloco=\"Fill user credentials\"\n        ></button>\n        <button\n          nz-button\n          type=\"button\"\n          (click)=\"fillAdminCredentials()\"\n          transloco=\"Fill admin credentials\"\n        ></button>\n      </div>\n      <button\n        nz-button\n        nzType=\"primary\"\n        type=\"submit\"\n        [disabled]=\"!form.valid\"\n        transloco=\"Sign-in\"\n      ></button>\n    </div>\n  </nz-form-control>\n  }\n</form>\n}\n", dependencies: [{ kind: "ngmodule", type: FormlyModule }, { kind: "component", type: i6.FormlyForm, selector: "formly-form", inputs: ["form", "model", "fields", "options"], outputs: ["modelChange"] }, { kind: "ngmodule", type: NzFormModule }, { kind: "directive", type: i4.NzColDirective, selector: "[nz-col],nz-col,nz-form-control,nz-form-label", inputs: ["nzFlex", "nzSpan", "nzOrder", "nzOffset", "nzPush", "nzPull", "nzXs", "nzSm", "nzMd", "nzLg", "nzXl", "nzXXl"], exportAs: ["nzCol"] }, { kind: "directive", type: i8.NzFormDirective, selector: "[nz-form]", inputs: ["nzLayout", "nzNoColon", "nzAutoTips", "nzDisableAutoTips", "nzTooltipIcon", "nzLabelAlign", "nzLabelWrap"], exportAs: ["nzForm"] }, { kind: "component", type: i8.NzFormControlComponent, selector: "nz-form-control", inputs: ["nzSuccessTip", "nzWarningTip", "nzErrorTip", "nzValidatingTip", "nzExtra", "nzAutoTips", "nzDisableAutoTips", "nzHasFeedback", "nzValidateStatus"], exportAs: ["nzFormControl"] }, { kind: "ngmodule", type: NzInputModule }, { kind: "ngmodule", type: NzButtonModule }, { kind: "component", type: i9.NzButtonComponent, selector: "button[nz-button], a[nz-button]", inputs: ["nzBlock", "nzGhost", "nzSearch", "nzLoading", "nzDanger", "disabled", "tabIndex", "nzType", "nzShape", "nzSize"], exportAs: ["nzButton"] }, { kind: "directive", type: i10.ɵNzTransitionPatchDirective, selector: "[nz-button], nz-button-group, [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group", inputs: ["hidden"] }, { kind: "directive", type: i11.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i13.ɵNgNoValidate, selector: "form:not([ngNoForm]):not([ngNativeValidate])" }, { kind: "directive", type: i13.NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]" }, { kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i13.FormGroupDirective, selector: "[formGroup]", inputs: ["formGroup"], outputs: ["ngSubmit"], exportAs: ["ngForm"] }, { kind: "pipe", type: AsyncPipe, name: "async" }, { kind: "directive", type: TranslocoDirective, selector: "[transloco]", inputs: ["transloco", "translocoParams", "translocoScope", "translocoRead", "translocoPrefix", "translocoLang", "translocoLoadingTpl"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookAuthFormComponent, decorators: [{
            type: Component,
            args: [{ imports: [
                        FormlyModule,
                        NzFormModule,
                        NzInputModule,
                        NzButtonModule,
                        FormsModule,
                        ReactiveFormsModule,
                        AsyncPipe,
                        TranslocoDirective,
                    ], selector: 'webhook-auth-form', changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (formlyFields$ | async; as formlyFields) {\n<form nz-form [formGroup]=\"form\" (ngSubmit)=\"submitForm()\">\n  <formly-form\n    [model]=\"formlyModel$ | async\"\n    [fields]=\"formlyFields\"\n    [form]=\"form\"\n  >\n  </formly-form>\n  @if (!hideButtons) {\n  <nz-form-control>\n    <div class=\"flex justify-between\">\n      <div>\n        <button\n          nz-button\n          type=\"button\"\n          (click)=\"fillUserCredentials()\"\n          transloco=\"Fill user credentials\"\n        ></button>\n        <button\n          nz-button\n          type=\"button\"\n          (click)=\"fillAdminCredentials()\"\n          transloco=\"Fill admin credentials\"\n        ></button>\n      </div>\n      <button\n        nz-button\n        nzType=\"primary\"\n        type=\"submit\"\n        [disabled]=\"!form.valid\"\n        transloco=\"Sign-in\"\n      ></button>\n    </div>\n  </nz-form-control>\n  }\n</form>\n}\n" }]
        }], ctorParameters: () => [{ type: WebhookAuthFormComponent, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NZ_MODAL_DATA]
                }] }, { type: WebhookConfiguration, decorators: [{
                    type: Inject,
                    args: [WEBHOOK_CONFIGURATION_TOKEN]
                }] }, { type: WebhookAuthService }, { type: i2$1.NzMessageService }, { type: i3.TranslocoService }, { type: WebhookAuthFormService }, { type: WebhookAuthMapperService }], propDecorators: { hideButtons: [{
                type: Input
            }], afterSignIn: [{
                type: Output
            }] } });

let WebhookFormService = class WebhookFormService {
    webhookEventsService;
    translocoService;
    validationService;
    events = [];
    constructor(webhookEventsService, translocoService, validationService) {
        this.webhookEventsService = webhookEventsService;
        this.translocoService = translocoService;
        this.validationService = validationService;
    }
    init() {
        return this.webhookEventsService.findMany().pipe(tap((events) => {
            this.events = events;
        }));
    }
    getFormlyFields(options) {
        return this.validationService.appendServerErrorsAsValidatorsToFields([
            {
                key: WebhookScalarFieldEnumInterface.enabled,
                type: 'checkbox',
                validation: {
                    show: true,
                },
                props: {
                    label: this.translocoService.translate(`webhook.form.fields.enabled`),
                    placeholder: 'enabled',
                    required: true,
                },
            },
            {
                key: WebhookScalarFieldEnumInterface.endpoint,
                type: 'input',
                validation: {
                    show: true,
                },
                props: {
                    label: this.translocoService.translate(`webhook.form.fields.endpoint`),
                    placeholder: 'endpoint',
                    required: true,
                },
            },
            {
                key: WebhookScalarFieldEnumInterface.eventName,
                type: 'select',
                validation: {
                    show: true,
                },
                props: {
                    label: this.translocoService.translate(`webhook.form.fields.event-name`),
                    placeholder: 'eventName',
                    required: true,
                    options: (this.events || []).map((e) => ({
                        value: e.eventName,
                        label: `${e.eventName} - ${e.description}`,
                    })),
                },
            },
            {
                key: WebhookScalarFieldEnumInterface.headers,
                type: 'textarea',
                validation: {
                    show: true,
                },
                props: {
                    label: this.translocoService.translate(`webhook.form.fields.headers`),
                    placeholder: 'headers',
                },
            },
            {
                key: WebhookScalarFieldEnumInterface.requestTimeout,
                type: 'input',
                validation: {
                    show: true,
                },
                props: {
                    type: 'number',
                    label: this.translocoService.translate(`webhook.form.fields.request-timeout`),
                    placeholder: 'requestTimeout',
                    required: false,
                },
            },
            {
                key: WebhookScalarFieldEnumInterface.workUntilDate,
                type: 'date-input',
                validation: {
                    show: true,
                },
                props: {
                    type: 'datetime-local',
                    label: this.translocoService.translate(`webhook.form.fields.work-until-date`),
                    placeholder: 'workUntilDate',
                    required: false,
                },
            },
        ], options?.errors || []);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookFormService, deps: [{ token: WebhookEventsService }, { token: i3.TranslocoService }, { token: i3$1.ValidationService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookFormService, providedIn: 'root' });
};
WebhookFormService = __decorate([
    UntilDestroy(),
    __metadata("design:paramtypes", [WebhookEventsService,
        TranslocoService,
        ValidationService])
], WebhookFormService);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookFormService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: WebhookEventsService }, { type: i3.TranslocoService }, { type: i3$1.ValidationService }] });

class WebhookMapperService {
    toModel(item) {
        return {
            ...item,
            headers: item?.headers ? JSON.stringify(item.headers) : '',
            requestTimeout: item?.requestTimeout ? +item.requestTimeout : null,
            workUntilDate: item?.workUntilDate
                ? addHours(new Date(item.workUntilDate), BROWSER_TIMEZONE_OFFSET)
                : null,
            createdAt: item?.createdAt
                ? addHours(new Date(item.createdAt), BROWSER_TIMEZONE_OFFSET)
                : null,
            updatedAt: item?.updatedAt
                ? addHours(new Date(item.updatedAt), BROWSER_TIMEZONE_OFFSET)
                : null,
        };
    }
    toForm(model) {
        return {
            ...model,
            requestTimeout: model.requestTimeout ? model.requestTimeout : '',
            workUntilDate: model.workUntilDate
                ? format(model.workUntilDate, 'yyyy-MM-dd HH:mm:ss')
                : null,
        };
    }
    toJson(data) {
        return {
            enabled: data.enabled === true,
            endpoint: data.endpoint || '',
            eventName: data.eventName || '',
            headers: data.headers ? safeParseJson(data.headers) : null,
            requestTimeout: data.requestTimeout ? +data.requestTimeout : null,
            workUntilDate: data.workUntilDate
                ? format(new Date(data.workUntilDate), 'yyyy-MM-dd HH:mm:ss')
                : undefined,
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookMapperService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookMapperService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookMapperService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class WebhookService {
    webhookAuthService;
    webhookRestService;
    webhookMapperService;
    constructor(webhookAuthService, webhookRestService, webhookMapperService) {
        this.webhookAuthService = webhookAuthService;
        this.webhookRestService = webhookRestService;
        this.webhookMapperService = webhookMapperService;
    }
    findOne(id) {
        return this.webhookRestService
            .webhookControllerFindOne(id, this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId, this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId)
            .pipe(map(this.webhookMapperService.toModel));
    }
    findMany({ filters, meta, }) {
        console.log('11', this.webhookRestService.defaultHeaders);
        return this.webhookRestService
            .webhookControllerFindMany(this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId, this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId, meta?.curPage, meta?.perPage, filters['search'], meta?.sort
            ? Object.entries(meta?.sort)
                .map(([key, value]) => `${key}:${value}`)
                .join(',')
            : undefined)
            .pipe(map(({ meta, webhooks }) => ({
            meta,
            webhooks: webhooks.map(this.webhookMapperService.toModel),
        })));
    }
    updateOne(id, data) {
        return this.webhookRestService
            .webhookControllerUpdateOne(id, data, this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId, this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId)
            .pipe(map(this.webhookMapperService.toModel));
    }
    deleteOne(id) {
        return this.webhookRestService.webhookControllerDeleteOne(id, this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId, this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId);
    }
    createOne(data) {
        return this.webhookRestService
            .webhookControllerCreateOne(data, this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId, this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId)
            .pipe(map(this.webhookMapperService.toModel));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookService, deps: [{ token: WebhookAuthService }, { token: i2.WebhookRestService }, { token: WebhookMapperService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: WebhookAuthService }, { type: i2.WebhookRestService }, { type: WebhookMapperService }] });

let WebhookFormComponent = class WebhookFormComponent {
    nzModalData;
    webhookService;
    nzMessageService;
    translocoService;
    webhookFormService;
    webhookMapperService;
    validationService;
    id;
    hideButtons;
    afterFind = new EventEmitter();
    afterCreate = new EventEmitter();
    afterUpdate = new EventEmitter();
    form = new UntypedFormGroup({});
    formlyModel$ = new BehaviorSubject(null);
    formlyFields$ = new BehaviorSubject(null);
    constructor(nzModalData, webhookService, nzMessageService, translocoService, webhookFormService, webhookMapperService, validationService) {
        this.nzModalData = nzModalData;
        this.webhookService = webhookService;
        this.nzMessageService = nzMessageService;
        this.translocoService = translocoService;
        this.webhookFormService = webhookFormService;
        this.webhookMapperService = webhookMapperService;
        this.validationService = validationService;
    }
    ngOnInit() {
        Object.assign(this, this.nzModalData);
        this.webhookFormService
            .init()
            .pipe(mergeMap(() => {
            if (this.id) {
                return this.findOne().pipe(tap((result) => this.afterFind.next({
                    ...result,
                })));
            }
            else {
                this.setFieldsAndModel();
            }
            return of(true);
        }), untilDestroyed(this))
            .subscribe();
    }
    setFieldsAndModel(model) {
        this.setFormlyFields();
        this.formlyModel$.next(model || null);
    }
    submitForm() {
        if (this.id) {
            this.updateOne()
                .pipe(tap((result) => {
                if (result) {
                    this.nzMessageService.success(this.translocoService.translate('Success'));
                    this.afterUpdate.next({
                        ...result,
                    });
                }
            }), untilDestroyed(this))
                .subscribe();
        }
        else {
            this.createOne()
                .pipe(tap((result) => {
                if (result) {
                    this.nzMessageService.success(this.translocoService.translate('Success'));
                    this.afterCreate.next({
                        ...result,
                        workUntilDate: result.workUntilDate
                            ? addHours(new Date(result.workUntilDate), BROWSER_TIMEZONE_OFFSET)
                            : null,
                    });
                }
            }), untilDestroyed(this))
                .subscribe();
        }
    }
    createOne() {
        return this.webhookService
            .createOne(this.webhookMapperService.toJson(this.form.value))
            .pipe(catchError((err) => this.validationService.catchAndProcessServerError(err, (options) => this.setFormlyFields(options))));
    }
    updateOne() {
        if (!this.id) {
            throw new Error(this.translocoService.translate('id not set'));
        }
        return this.webhookService
            .updateOne(this.id, this.webhookMapperService.toJson(this.form.value))
            .pipe(catchError((err) => this.validationService.catchAndProcessServerError(err, (options) => this.setFormlyFields(options))));
    }
    findOne() {
        if (!this.id) {
            throw new Error(this.translocoService.translate('id not set'));
        }
        return this.webhookService.findOne(this.id).pipe(tap((result) => {
            this.setFieldsAndModel(this.webhookMapperService.toForm(result));
        }));
    }
    setFormlyFields(options) {
        this.formlyFields$.next(this.webhookFormService.getFormlyFields(options));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookFormComponent, deps: [{ token: NZ_MODAL_DATA, optional: true }, { token: WebhookService }, { token: i2$1.NzMessageService }, { token: i3.TranslocoService }, { token: WebhookFormService }, { token: WebhookMapperService }, { token: i3$1.ValidationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.0.5", type: WebhookFormComponent, isStandalone: true, selector: "webhook-form", inputs: { id: "id", hideButtons: "hideButtons" }, outputs: { afterFind: "afterFind", afterCreate: "afterCreate", afterUpdate: "afterUpdate" }, ngImport: i0, template: "@if (formlyFields$ | async; as formlyFields) {\n<form nz-form [formGroup]=\"form\" (ngSubmit)=\"submitForm()\">\n  <formly-form\n    [model]=\"formlyModel$ | async\"\n    [fields]=\"formlyFields\"\n    [form]=\"form\"\n  >\n  </formly-form>\n  @if (!hideButtons) {\n  <nz-form-control>\n    <button\n      nzBlock\n      nz-button\n      nzType=\"primary\"\n      type=\"submit\"\n      [disabled]=\"!form.valid\"\n    >\n      {{ id ? ('Save' | transloco) : ('Create' | transloco) }}\n    </button>\n  </nz-form-control>\n  }\n</form>\n}\n", dependencies: [{ kind: "ngmodule", type: FormlyModule }, { kind: "component", type: i6.FormlyForm, selector: "formly-form", inputs: ["form", "model", "fields", "options"], outputs: ["modelChange"] }, { kind: "ngmodule", type: NzFormModule }, { kind: "directive", type: i4.NzColDirective, selector: "[nz-col],nz-col,nz-form-control,nz-form-label", inputs: ["nzFlex", "nzSpan", "nzOrder", "nzOffset", "nzPush", "nzPull", "nzXs", "nzSm", "nzMd", "nzLg", "nzXl", "nzXXl"], exportAs: ["nzCol"] }, { kind: "directive", type: i8.NzFormDirective, selector: "[nz-form]", inputs: ["nzLayout", "nzNoColon", "nzAutoTips", "nzDisableAutoTips", "nzTooltipIcon", "nzLabelAlign", "nzLabelWrap"], exportAs: ["nzForm"] }, { kind: "component", type: i8.NzFormControlComponent, selector: "nz-form-control", inputs: ["nzSuccessTip", "nzWarningTip", "nzErrorTip", "nzValidatingTip", "nzExtra", "nzAutoTips", "nzDisableAutoTips", "nzHasFeedback", "nzValidateStatus"], exportAs: ["nzFormControl"] }, { kind: "ngmodule", type: NzInputModule }, { kind: "ngmodule", type: NzButtonModule }, { kind: "component", type: i9.NzButtonComponent, selector: "button[nz-button], a[nz-button]", inputs: ["nzBlock", "nzGhost", "nzSearch", "nzLoading", "nzDanger", "disabled", "tabIndex", "nzType", "nzShape", "nzSize"], exportAs: ["nzButton"] }, { kind: "directive", type: i10.ɵNzTransitionPatchDirective, selector: "[nz-button], nz-button-group, [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group", inputs: ["hidden"] }, { kind: "directive", type: i11.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i13.ɵNgNoValidate, selector: "form:not([ngNoForm]):not([ngNativeValidate])" }, { kind: "directive", type: i13.NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]" }, { kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i13.FormGroupDirective, selector: "[formGroup]", inputs: ["formGroup"], outputs: ["ngSubmit"], exportAs: ["ngForm"] }, { kind: "pipe", type: AsyncPipe, name: "async" }, { kind: "pipe", type: TranslocoPipe, name: "transloco" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
};
WebhookFormComponent = __decorate([
    UntilDestroy(),
    __metadata("design:paramtypes", [WebhookFormComponent,
        WebhookService,
        NzMessageService,
        TranslocoService,
        WebhookFormService,
        WebhookMapperService,
        ValidationService])
], WebhookFormComponent);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookFormComponent, decorators: [{
            type: Component,
            args: [{ imports: [
                        FormlyModule,
                        NzFormModule,
                        NzInputModule,
                        NzButtonModule,
                        FormsModule,
                        ReactiveFormsModule,
                        AsyncPipe,
                        TranslocoPipe,
                    ], selector: 'webhook-form', changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (formlyFields$ | async; as formlyFields) {\n<form nz-form [formGroup]=\"form\" (ngSubmit)=\"submitForm()\">\n  <formly-form\n    [model]=\"formlyModel$ | async\"\n    [fields]=\"formlyFields\"\n    [form]=\"form\"\n  >\n  </formly-form>\n  @if (!hideButtons) {\n  <nz-form-control>\n    <button\n      nzBlock\n      nz-button\n      nzType=\"primary\"\n      type=\"submit\"\n      [disabled]=\"!form.valid\"\n    >\n      {{ id ? ('Save' | transloco) : ('Create' | transloco) }}\n    </button>\n  </nz-form-control>\n  }\n</form>\n}\n" }]
        }], ctorParameters: () => [{ type: WebhookFormComponent, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NZ_MODAL_DATA]
                }] }, { type: WebhookService }, { type: i2$1.NzMessageService }, { type: i3.TranslocoService }, { type: WebhookFormService }, { type: WebhookMapperService }, { type: i3$1.ValidationService }], propDecorators: { id: [{
                type: Input
            }], hideButtons: [{
                type: Input
            }], afterFind: [{
                type: Output
            }], afterCreate: [{
                type: Output
            }], afterUpdate: [{
                type: Output
            }] } });

let WebhookGridComponent = class WebhookGridComponent {
    webhookService;
    nzModalService;
    viewContainerRef;
    translocoService;
    items$ = new BehaviorSubject([]);
    meta$ = new BehaviorSubject(undefined);
    searchField = new FormControl('');
    selectedIds$ = new BehaviorSubject([]);
    keys = [
        WebhookScalarFieldEnumInterface.id,
        WebhookScalarFieldEnumInterface.enabled,
        WebhookScalarFieldEnumInterface.endpoint,
        WebhookScalarFieldEnumInterface.eventName,
        WebhookScalarFieldEnumInterface.headers,
        WebhookScalarFieldEnumInterface.requestTimeout,
        WebhookScalarFieldEnumInterface.workUntilDate,
    ];
    columns = {
        [WebhookScalarFieldEnumInterface.id]: marker('webhook.grid.columns.id'),
        [WebhookScalarFieldEnumInterface.enabled]: marker('webhook.grid.columns.enabled'),
        [WebhookScalarFieldEnumInterface.endpoint]: marker('webhook.grid.columns.endpoint'),
        [WebhookScalarFieldEnumInterface.eventName]: marker('webhook.grid.columns.event-name'),
        [WebhookScalarFieldEnumInterface.headers]: marker('webhook.grid.columns.headers'),
        [WebhookScalarFieldEnumInterface.requestTimeout]: marker('webhook.grid.columns.request-timeout'),
        [WebhookScalarFieldEnumInterface.workUntilDate]: marker('webhook.grid.columns.work-until-date'),
    };
    WebhookScalarFieldEnumInterface = WebhookScalarFieldEnumInterface;
    filters;
    constructor(webhookService, nzModalService, viewContainerRef, translocoService) {
        this.webhookService = webhookService;
        this.nzModalService = nzModalService;
        this.viewContainerRef = viewContainerRef;
        this.translocoService = translocoService;
        this.searchField.valueChanges
            .pipe(debounceTime(700), distinctUntilChanged(), tap(() => this.loadMany({ force: true })), untilDestroyed(this))
            .subscribe();
    }
    ngOnInit() {
        this.loadMany();
    }
    loadMany(args) {
        let meta = { meta: {}, ...(args || {}) }.meta;
        const { queryParams, filters } = { filters: {}, ...(args || {}) };
        if (!args?.force && queryParams) {
            meta = getQueryMetaByParams(queryParams);
        }
        meta = getQueryMeta(meta, this.meta$.value);
        if (!filters['search'] && this.searchField.value) {
            filters['search'] = this.searchField.value;
        }
        if (!args?.force &&
            isEqual(omit(['totalResults'], { ...meta, ...filters }), omit(['totalResults'], {
                ...this.meta$.value,
                ...this.filters,
            }))) {
            return;
        }
        this.webhookService
            .findMany({ filters, meta })
            .pipe(tap((result) => {
            this.items$.next(result.webhooks);
            this.meta$.next({ ...result.meta, ...meta });
            this.filters = filters;
            this.selectedIds$.next([]);
        }), untilDestroyed(this))
            .subscribe();
    }
    showCreateOrUpdateModal(id) {
        const modal = this.nzModalService.create({
            nzTitle: id
                ? this.translocoService.translate('webhook.update-modal.title', { id })
                : this.translocoService.translate('webhook.create-modal.title'),
            nzContent: WebhookFormComponent,
            nzViewContainerRef: this.viewContainerRef,
            nzData: {
                hideButtons: true,
                id,
            },
            nzFooter: [
                {
                    label: this.translocoService.translate('Cancel'),
                    onClick: () => {
                        modal.close();
                    },
                },
                {
                    label: id
                        ? this.translocoService.translate('Save')
                        : this.translocoService.translate('Create'),
                    onClick: () => {
                        modal.componentInstance?.afterUpdate
                            .pipe(tap(() => {
                            modal.close();
                            this.loadMany({ force: true });
                        }), untilDestroyed(modal.componentInstance))
                            .subscribe();
                        modal.componentInstance?.afterCreate
                            .pipe(tap(() => {
                            modal.close();
                            this.loadMany({ force: true });
                        }), untilDestroyed(modal.componentInstance))
                            .subscribe();
                        modal.componentInstance?.submitForm();
                    },
                    type: 'primary',
                },
            ],
        });
    }
    showDeleteModal(id) {
        if (!id) {
            return;
        }
        this.nzModalService.confirm({
            nzTitle: this.translocoService.translate(`webhook.delete-modal.title`, {
                id,
            }),
            nzOkText: this.translocoService.translate('Yes'),
            nzCancelText: this.translocoService.translate('No'),
            nzOnOk: () => {
                this.webhookService
                    .deleteOne(id)
                    .pipe(tap(() => {
                    this.loadMany({ force: true });
                }), untilDestroyed(this))
                    .subscribe();
            },
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookGridComponent, deps: [{ token: WebhookService }, { token: i2$2.NzModalService }, { token: i0.ViewContainerRef }, { token: i3.TranslocoService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.0.5", type: WebhookGridComponent, isStandalone: true, selector: "webhook-grid", ngImport: i0, template: "<div class=\"table-operations\" nz-row nzJustify=\"space-between\">\n  <div nz-col nzSpan=\"4\">\n    <button\n      nz-button\n      nzType=\"primary\"\n      (click)=\"showCreateOrUpdateModal()\"\n      transloco=\"Create new\"\n    ></button>\n  </div>\n  <div nz-col nzSpan=\"4\">\n    <nz-input-group nzSearch [nzAddOnAfter]=\"suffixIconButton\">\n      <input\n        type=\"text\"\n        [formControl]=\"searchField\"\n        nz-input\n        [placeholder]=\"'input search text' | transloco\"\n      />\n    </nz-input-group>\n    <ng-template #suffixIconButton>\n      <button\n        (click)=\"loadMany({ force: true })\"\n        nz-button\n        nzType=\"primary\"\n        nzSearch\n      >\n        <span nz-icon nzType=\"search\"></span>\n      </button>\n    </ng-template>\n  </div>\n</div>\n@if ((meta$ | async); as meta){\n<nz-table\n  #basicTable\n  [nzBordered]=\"true\"\n  [nzOuterBordered]=\"true\"\n  nzShowPagination\n  nzShowSizeChanger\n  [nzFrontPagination]=\"false\"\n  [nzPageSizeOptions]=\"[1, 5, 10, 20, 30, 40]\"\n  [nzPageIndex]=\"meta.curPage\"\n  [nzPageSize]=\"meta.perPage\"\n  [nzTotal]=\"meta.totalResults || 0\"\n  (nzQueryParams)=\"\n    loadMany({\n      queryParams: $event\n    })\n  \"\n  [nzData]=\"(items$ | async) || []\"\n>\n  <thead>\n    <tr>\n      @for (key of keys; track $index) {\n      <th\n        [nzColumnKey]=\"key\"\n        [nzSortFn]=\"true\"\n        [nzSortOrder]=\"meta.sort[key] | nzTableSortOrderDetector\"\n        [transloco]=\"columns[key]\"\n      ></th>\n      }\n      <th transloco=\"Action\"></th>\n    </tr>\n  </thead>\n  @if (selectedIds$ | async; as selectedIds) {\n  <tbody>\n    @for (data of basicTable.data; track $index) {\n    <tr\n      (click)=\"\n        selectedIds$.next(\n          !data.id || selectedIds[0] === data.id ? [] : [data.id]\n        )\n      \"\n      [class.selected]=\"selectedIds[0] === data.id\"\n    >\n      @for (key of keys; track $index) { @if (data[key] &&\n      [WebhookScalarFieldEnumInterface.createdAt,WebhookScalarFieldEnumInterface.updatedAt,WebhookScalarFieldEnumInterface.workUntilDate\n      ].includes(key)) {\n      <td>\n        {{\n          +data[key]\n            | translocoDate : { dateStyle: 'medium', timeStyle: 'medium' }\n        }}\n      </td>\n      } @else{\n      <td>\n        {{ data[key] }}\n      </td>\n      } }\n      <td>\n        <a (click)=\"showCreateOrUpdateModal(data.id)\" transloco=\"Edit\"></a>\n        <nz-divider nzType=\"vertical\"></nz-divider>\n        <a (click)=\"showDeleteModal(data.id)\" transloco=\"Delete\"></a>\n      </td>\n    </tr>\n    }\n  </tbody>\n  }\n</nz-table>\n}\n", dependencies: [{ kind: "ngmodule", type: NzGridModule }, { kind: "directive", type: i4.NzColDirective, selector: "[nz-col],nz-col,nz-form-control,nz-form-label", inputs: ["nzFlex", "nzSpan", "nzOrder", "nzOffset", "nzPush", "nzPull", "nzXs", "nzSm", "nzMd", "nzLg", "nzXl", "nzXXl"], exportAs: ["nzCol"] }, { kind: "directive", type: i4.NzRowDirective, selector: "[nz-row],nz-row,nz-form-item", inputs: ["nzAlign", "nzJustify", "nzGutter"], exportAs: ["nzRow"] }, { kind: "ngmodule", type: NzMenuModule }, { kind: "ngmodule", type: NzLayoutModule }, { kind: "ngmodule", type: NzTableModule }, { kind: "component", type: i5.NzTableComponent, selector: "nz-table", inputs: ["nzTableLayout", "nzShowTotal", "nzItemRender", "nzTitle", "nzFooter", "nzNoResult", "nzPageSizeOptions", "nzVirtualItemSize", "nzVirtualMaxBufferPx", "nzVirtualMinBufferPx", "nzVirtualForTrackBy", "nzLoadingDelay", "nzPageIndex", "nzPageSize", "nzTotal", "nzWidthConfig", "nzData", "nzCustomColumn", "nzPaginationPosition", "nzScroll", "noDataVirtualHeight", "nzPaginationType", "nzFrontPagination", "nzTemplateMode", "nzShowPagination", "nzLoading", "nzOuterBordered", "nzLoadingIndicator", "nzBordered", "nzSize", "nzShowSizeChanger", "nzHideOnSinglePage", "nzShowQuickJumper", "nzSimple"], outputs: ["nzPageSizeChange", "nzPageIndexChange", "nzQueryParams", "nzCurrentPageDataChange", "nzCustomColumnChange"], exportAs: ["nzTable"] }, { kind: "component", type: i5.NzThAddOnComponent, selector: "th[nzColumnKey], th[nzSortFn], th[nzSortOrder], th[nzFilters], th[nzShowSort], th[nzShowFilter], th[nzCustomFilter]", inputs: ["nzColumnKey", "nzFilterMultiple", "nzSortOrder", "nzSortPriority", "nzSortDirections", "nzFilters", "nzSortFn", "nzFilterFn", "nzShowSort", "nzShowFilter", "nzCustomFilter"], outputs: ["nzCheckedChange", "nzSortOrderChange", "nzFilterChange"] }, { kind: "directive", type: i5.NzTableCellDirective, selector: "th:not(.nz-disable-th):not([mat-cell]), td:not(.nz-disable-td):not([mat-cell])" }, { kind: "directive", type: i5.NzThMeasureDirective, selector: "th", inputs: ["nzWidth", "colspan", "colSpan", "rowspan", "rowSpan"] }, { kind: "component", type: i5.NzTheadComponent, selector: "thead:not(.ant-table-thead)", outputs: ["nzSortOrderChange"] }, { kind: "component", type: i5.NzTbodyComponent, selector: "tbody" }, { kind: "directive", type: i5.NzTrDirective, selector: "tr:not([mat-row]):not([mat-header-row]):not([nz-table-measure-row]):not([nzExpand]):not([nz-table-fixed-row])" }, { kind: "ngmodule", type: NzDividerModule }, { kind: "component", type: i6$1.NzDividerComponent, selector: "nz-divider", inputs: ["nzText", "nzType", "nzOrientation", "nzVariant", "nzDashed", "nzPlain"], exportAs: ["nzDivider"] }, { kind: "ngmodule", type: CommonModule }, { kind: "pipe", type: i7.AsyncPipe, name: "async" }, { kind: "ngmodule", type: RouterModule }, { kind: "ngmodule", type: NzModalModule }, { kind: "ngmodule", type: NzButtonModule }, { kind: "component", type: i9.NzButtonComponent, selector: "button[nz-button], a[nz-button]", inputs: ["nzBlock", "nzGhost", "nzSearch", "nzLoading", "nzDanger", "disabled", "tabIndex", "nzType", "nzShape", "nzSize"], exportAs: ["nzButton"] }, { kind: "directive", type: i10.ɵNzTransitionPatchDirective, selector: "[nz-button], nz-button-group, [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group", inputs: ["hidden"] }, { kind: "directive", type: i11.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }, { kind: "ngmodule", type: NzInputModule }, { kind: "directive", type: i11$1.NzInputDirective, selector: "input[nz-input],textarea[nz-input]", inputs: ["nzBorderless", "nzSize", "nzStepperless", "nzStatus", "disabled"], exportAs: ["nzInput"] }, { kind: "component", type: i11$1.NzInputGroupComponent, selector: "nz-input-group", inputs: ["nzAddOnBeforeIcon", "nzAddOnAfterIcon", "nzPrefixIcon", "nzSuffixIcon", "nzAddOnBefore", "nzAddOnAfter", "nzPrefix", "nzStatus", "nzSuffix", "nzSize", "nzSearch", "nzCompact"], exportAs: ["nzInputGroup"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i12.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i13.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i13.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i13.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "pipe", type: NzTableSortOrderDetectorPipe, name: "nzTableSortOrderDetector" }, { kind: "directive", type: TranslocoDirective, selector: "[transloco]", inputs: ["transloco", "translocoParams", "translocoScope", "translocoRead", "translocoPrefix", "translocoLang", "translocoLoadingTpl"] }, { kind: "pipe", type: TranslocoPipe, name: "transloco" }, { kind: "pipe", type: TranslocoDatePipe, name: "translocoDate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
};
WebhookGridComponent = __decorate([
    UntilDestroy(),
    __metadata("design:paramtypes", [WebhookService,
        NzModalService,
        ViewContainerRef,
        TranslocoService])
], WebhookGridComponent);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookGridComponent, decorators: [{
            type: Component,
            args: [{ imports: [
                        NzGridModule,
                        NzMenuModule,
                        NzLayoutModule,
                        NzTableModule,
                        NzDividerModule,
                        CommonModule,
                        RouterModule,
                        NzModalModule,
                        NzButtonModule,
                        NzInputModule,
                        NzIconModule,
                        FormsModule,
                        ReactiveFormsModule,
                        NzTableSortOrderDetectorPipe,
                        TranslocoDirective,
                        TranslocoPipe,
                        TranslocoDatePipe,
                    ], selector: 'webhook-grid', changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"table-operations\" nz-row nzJustify=\"space-between\">\n  <div nz-col nzSpan=\"4\">\n    <button\n      nz-button\n      nzType=\"primary\"\n      (click)=\"showCreateOrUpdateModal()\"\n      transloco=\"Create new\"\n    ></button>\n  </div>\n  <div nz-col nzSpan=\"4\">\n    <nz-input-group nzSearch [nzAddOnAfter]=\"suffixIconButton\">\n      <input\n        type=\"text\"\n        [formControl]=\"searchField\"\n        nz-input\n        [placeholder]=\"'input search text' | transloco\"\n      />\n    </nz-input-group>\n    <ng-template #suffixIconButton>\n      <button\n        (click)=\"loadMany({ force: true })\"\n        nz-button\n        nzType=\"primary\"\n        nzSearch\n      >\n        <span nz-icon nzType=\"search\"></span>\n      </button>\n    </ng-template>\n  </div>\n</div>\n@if ((meta$ | async); as meta){\n<nz-table\n  #basicTable\n  [nzBordered]=\"true\"\n  [nzOuterBordered]=\"true\"\n  nzShowPagination\n  nzShowSizeChanger\n  [nzFrontPagination]=\"false\"\n  [nzPageSizeOptions]=\"[1, 5, 10, 20, 30, 40]\"\n  [nzPageIndex]=\"meta.curPage\"\n  [nzPageSize]=\"meta.perPage\"\n  [nzTotal]=\"meta.totalResults || 0\"\n  (nzQueryParams)=\"\n    loadMany({\n      queryParams: $event\n    })\n  \"\n  [nzData]=\"(items$ | async) || []\"\n>\n  <thead>\n    <tr>\n      @for (key of keys; track $index) {\n      <th\n        [nzColumnKey]=\"key\"\n        [nzSortFn]=\"true\"\n        [nzSortOrder]=\"meta.sort[key] | nzTableSortOrderDetector\"\n        [transloco]=\"columns[key]\"\n      ></th>\n      }\n      <th transloco=\"Action\"></th>\n    </tr>\n  </thead>\n  @if (selectedIds$ | async; as selectedIds) {\n  <tbody>\n    @for (data of basicTable.data; track $index) {\n    <tr\n      (click)=\"\n        selectedIds$.next(\n          !data.id || selectedIds[0] === data.id ? [] : [data.id]\n        )\n      \"\n      [class.selected]=\"selectedIds[0] === data.id\"\n    >\n      @for (key of keys; track $index) { @if (data[key] &&\n      [WebhookScalarFieldEnumInterface.createdAt,WebhookScalarFieldEnumInterface.updatedAt,WebhookScalarFieldEnumInterface.workUntilDate\n      ].includes(key)) {\n      <td>\n        {{\n          +data[key]\n            | translocoDate : { dateStyle: 'medium', timeStyle: 'medium' }\n        }}\n      </td>\n      } @else{\n      <td>\n        {{ data[key] }}\n      </td>\n      } }\n      <td>\n        <a (click)=\"showCreateOrUpdateModal(data.id)\" transloco=\"Edit\"></a>\n        <nz-divider nzType=\"vertical\"></nz-divider>\n        <a (click)=\"showDeleteModal(data.id)\" transloco=\"Delete\"></a>\n      </td>\n    </tr>\n    }\n  </tbody>\n  }\n</nz-table>\n}\n" }]
        }], ctorParameters: () => [{ type: WebhookService }, { type: i2$2.NzModalService }, { type: i0.ViewContainerRef }, { type: i3.TranslocoService }] });

class WebhookLogService {
    webhookAuthService;
    webhookRestService;
    constructor(webhookAuthService, webhookRestService) {
        this.webhookAuthService = webhookAuthService;
        this.webhookRestService = webhookRestService;
    }
    findMany({ filters, meta, }) {
        return this.webhookRestService.webhookControllerFindManyLogs(filters['webhookId'], this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId, this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId, meta?.curPage, meta?.perPage, filters['search'], meta?.sort
            ? Object.entries(meta?.sort)
                .map(([key, value]) => `${key}:${value}`)
                .join(',')
            : undefined);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookLogService, deps: [{ token: WebhookAuthService }, { token: i2.WebhookRestService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookLogService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookLogService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: WebhookAuthService }, { type: i2.WebhookRestService }] });

let WebhookLogGridComponent = class WebhookLogGridComponent {
    webhookLogService;
    webhookId;
    items$ = new BehaviorSubject([]);
    meta$ = new BehaviorSubject(undefined);
    searchField = new FormControl('');
    selectedIds$ = new BehaviorSubject([]);
    keys = [
        WebhookLogScalarFieldEnumInterface.id,
        WebhookLogScalarFieldEnumInterface.request,
        WebhookLogScalarFieldEnumInterface.response,
        WebhookLogScalarFieldEnumInterface.responseStatus,
        WebhookLogScalarFieldEnumInterface.webhookStatus,
    ];
    columns = {
        [WebhookLogScalarFieldEnumInterface.id]: marker('webhook-log.grid.columns.id'),
        [WebhookLogScalarFieldEnumInterface.request]: marker('webhook-log.grid.columns.request'),
        [WebhookLogScalarFieldEnumInterface.response]: marker('webhook-log.grid.columns.response'),
        [WebhookLogScalarFieldEnumInterface.responseStatus]: marker('webhook-log.grid.columns.response-status'),
        [WebhookLogScalarFieldEnumInterface.webhookStatus]: marker('webhook-log.grid.columns.webhook-status'),
    };
    WebhookLogScalarFieldEnumInterface = WebhookLogScalarFieldEnumInterface;
    filters;
    constructor(webhookLogService) {
        this.webhookLogService = webhookLogService;
        this.searchField.valueChanges
            .pipe(debounceTime(700), distinctUntilChanged(), tap(() => this.loadMany({ force: true })), untilDestroyed(this))
            .subscribe();
    }
    ngOnChanges(changes) {
        // need for ignore dbl load
        if (!changes.webhookId.firstChange) {
            this.loadMany({ force: true });
        }
        else {
            this.loadMany();
        }
    }
    ngOnInit() {
        this.loadMany();
    }
    loadMany(args) {
        let meta = { meta: {}, ...(args || {}) }.meta;
        const { queryParams, filters } = { filters: {}, ...(args || {}) };
        if (!args?.force && queryParams) {
            meta = getQueryMetaByParams(queryParams);
        }
        meta = getQueryMeta(meta, this.meta$.value);
        if (!filters['search'] && this.searchField.value) {
            filters['search'] = this.searchField.value;
        }
        if (!filters['webhookId'] && this.webhookId) {
            filters['webhookId'] = this.webhookId;
        }
        if (!args?.force &&
            isEqual(omit(['totalResults'], { ...meta, ...filters }), omit(['totalResults'], {
                ...this.meta$.value,
                ...this.filters,
            }))) {
            return;
        }
        if (!filters['webhookId']) {
            this.items$.next([]);
            this.selectedIds$.next([]);
        }
        else {
            this.webhookLogService
                .findMany({ filters, meta })
                .pipe(tap((result) => {
                this.items$.next(result.webhookLogs.map((item) => ({
                    ...item,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    request: JSON.stringify(item.request),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    response: JSON.stringify(item.response),
                })));
                this.meta$.next({ ...result.meta, ...meta });
                this.filters = filters;
                this.selectedIds$.next([]);
            }), untilDestroyed(this))
                .subscribe();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookLogGridComponent, deps: [{ token: WebhookLogService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.0.5", type: WebhookLogGridComponent, isStandalone: true, selector: "webhook-log-grid", inputs: { webhookId: "webhookId" }, usesOnChanges: true, ngImport: i0, template: "<div class=\"table-operations\" nz-row nzJustify=\"space-between\">\n  <div nz-col nzSpan=\"6\">\n    {{ 'Logs for webhook #{{webhookId}}' | transloco:{webhookId} }}\n  </div>\n  <div nz-col nzSpan=\"4\">\n    <nz-input-group nzSearch [nzAddOnAfter]=\"suffixIconButton\">\n      <input\n        type=\"text\"\n        [formControl]=\"searchField\"\n        nz-input\n        [placeholder]=\"'input search text' | transloco\"\n      />\n    </nz-input-group>\n    <ng-template #suffixIconButton>\n      <button\n        (click)=\"loadMany({ force: true })\"\n        nz-button\n        nzType=\"primary\"\n        nzSearch\n      >\n        <span nz-icon nzType=\"search\"></span>\n      </button>\n    </ng-template>\n  </div>\n</div>\n@if ((meta$ | async); as meta){\n<nz-table\n  #basicTable\n  [nzBordered]=\"true\"\n  [nzOuterBordered]=\"true\"\n  nzShowPagination\n  nzShowSizeChanger\n  [nzFrontPagination]=\"false\"\n  [nzPageSizeOptions]=\"[1, 5, 10, 20, 30, 40]\"\n  [nzPageIndex]=\"meta.curPage\"\n  [nzPageSize]=\"meta.perPage\"\n  [nzTotal]=\"meta.totalResults || 0\"\n  (nzQueryParams)=\"\n    loadMany({\n      queryParams: $event\n    })\n  \"\n  [nzData]=\"(items$ | async) || []\"\n>\n  <thead>\n    <tr>\n      @for (key of keys; track $index) {\n      <th\n        [nzColumnKey]=\"key\"\n        [nzSortFn]=\"true\"\n        [nzSortOrder]=\"meta.sort[key] | nzTableSortOrderDetector\"\n        [transloco]=\"columns[key]\"\n      ></th>\n      }\n    </tr>\n  </thead>\n  @if (selectedIds$ | async; as selectedIds) {\n  <tbody>\n    @for (data of basicTable.data; track $index) {\n    <tr\n      (click)=\"selectedIds$.next(selectedIds[0] === data.id ? [] : [data.id])\"\n      [class.selected]=\"selectedIds[0] === data.id\"\n    >\n      @for (key of keys; track $index) { @for (key of keys; track $index) { @if\n      (data[key] &&\n      [WebhookLogScalarFieldEnumInterface.createdAt,WebhookLogScalarFieldEnumInterface.updatedAt\n      ].includes(key)) {\n      <td>\n        {{\n          +data[key]\n            | translocoDate : { dateStyle: 'medium', timeStyle: 'medium' }\n        }}\n      </td>\n      } @else{\n      <td>\n        {{ data[key] }}\n      </td>\n      } } }\n    </tr>\n    }\n  </tbody>\n  }\n</nz-table>\n}\n", dependencies: [{ kind: "ngmodule", type: NzGridModule }, { kind: "directive", type: i4.NzColDirective, selector: "[nz-col],nz-col,nz-form-control,nz-form-label", inputs: ["nzFlex", "nzSpan", "nzOrder", "nzOffset", "nzPush", "nzPull", "nzXs", "nzSm", "nzMd", "nzLg", "nzXl", "nzXXl"], exportAs: ["nzCol"] }, { kind: "directive", type: i4.NzRowDirective, selector: "[nz-row],nz-row,nz-form-item", inputs: ["nzAlign", "nzJustify", "nzGutter"], exportAs: ["nzRow"] }, { kind: "ngmodule", type: NzMenuModule }, { kind: "ngmodule", type: NzLayoutModule }, { kind: "ngmodule", type: NzTableModule }, { kind: "component", type: i5.NzTableComponent, selector: "nz-table", inputs: ["nzTableLayout", "nzShowTotal", "nzItemRender", "nzTitle", "nzFooter", "nzNoResult", "nzPageSizeOptions", "nzVirtualItemSize", "nzVirtualMaxBufferPx", "nzVirtualMinBufferPx", "nzVirtualForTrackBy", "nzLoadingDelay", "nzPageIndex", "nzPageSize", "nzTotal", "nzWidthConfig", "nzData", "nzCustomColumn", "nzPaginationPosition", "nzScroll", "noDataVirtualHeight", "nzPaginationType", "nzFrontPagination", "nzTemplateMode", "nzShowPagination", "nzLoading", "nzOuterBordered", "nzLoadingIndicator", "nzBordered", "nzSize", "nzShowSizeChanger", "nzHideOnSinglePage", "nzShowQuickJumper", "nzSimple"], outputs: ["nzPageSizeChange", "nzPageIndexChange", "nzQueryParams", "nzCurrentPageDataChange", "nzCustomColumnChange"], exportAs: ["nzTable"] }, { kind: "component", type: i5.NzThAddOnComponent, selector: "th[nzColumnKey], th[nzSortFn], th[nzSortOrder], th[nzFilters], th[nzShowSort], th[nzShowFilter], th[nzCustomFilter]", inputs: ["nzColumnKey", "nzFilterMultiple", "nzSortOrder", "nzSortPriority", "nzSortDirections", "nzFilters", "nzSortFn", "nzFilterFn", "nzShowSort", "nzShowFilter", "nzCustomFilter"], outputs: ["nzCheckedChange", "nzSortOrderChange", "nzFilterChange"] }, { kind: "directive", type: i5.NzTableCellDirective, selector: "th:not(.nz-disable-th):not([mat-cell]), td:not(.nz-disable-td):not([mat-cell])" }, { kind: "directive", type: i5.NzThMeasureDirective, selector: "th", inputs: ["nzWidth", "colspan", "colSpan", "rowspan", "rowSpan"] }, { kind: "component", type: i5.NzTheadComponent, selector: "thead:not(.ant-table-thead)", outputs: ["nzSortOrderChange"] }, { kind: "component", type: i5.NzTbodyComponent, selector: "tbody" }, { kind: "directive", type: i5.NzTrDirective, selector: "tr:not([mat-row]):not([mat-header-row]):not([nz-table-measure-row]):not([nzExpand]):not([nz-table-fixed-row])" }, { kind: "ngmodule", type: NzDividerModule }, { kind: "ngmodule", type: CommonModule }, { kind: "pipe", type: i7.AsyncPipe, name: "async" }, { kind: "ngmodule", type: RouterModule }, { kind: "ngmodule", type: NzModalModule }, { kind: "ngmodule", type: NzButtonModule }, { kind: "component", type: i9.NzButtonComponent, selector: "button[nz-button], a[nz-button]", inputs: ["nzBlock", "nzGhost", "nzSearch", "nzLoading", "nzDanger", "disabled", "tabIndex", "nzType", "nzShape", "nzSize"], exportAs: ["nzButton"] }, { kind: "directive", type: i10.ɵNzTransitionPatchDirective, selector: "[nz-button], nz-button-group, [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group", inputs: ["hidden"] }, { kind: "directive", type: i11.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }, { kind: "ngmodule", type: NzInputModule }, { kind: "directive", type: i11$1.NzInputDirective, selector: "input[nz-input],textarea[nz-input]", inputs: ["nzBorderless", "nzSize", "nzStepperless", "nzStatus", "disabled"], exportAs: ["nzInput"] }, { kind: "component", type: i11$1.NzInputGroupComponent, selector: "nz-input-group", inputs: ["nzAddOnBeforeIcon", "nzAddOnAfterIcon", "nzPrefixIcon", "nzSuffixIcon", "nzAddOnBefore", "nzAddOnAfter", "nzPrefix", "nzStatus", "nzSuffix", "nzSize", "nzSearch", "nzCompact"], exportAs: ["nzInputGroup"] }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i12.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i13.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i13.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i13.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "pipe", type: NzTableSortOrderDetectorPipe, name: "nzTableSortOrderDetector" }, { kind: "directive", type: TranslocoDirective, selector: "[transloco]", inputs: ["transloco", "translocoParams", "translocoScope", "translocoRead", "translocoPrefix", "translocoLang", "translocoLoadingTpl"] }, { kind: "pipe", type: TranslocoPipe, name: "transloco" }, { kind: "pipe", type: TranslocoDatePipe, name: "translocoDate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
};
WebhookLogGridComponent = __decorate([
    UntilDestroy(),
    __metadata("design:paramtypes", [WebhookLogService])
], WebhookLogGridComponent);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookLogGridComponent, decorators: [{
            type: Component,
            args: [{ imports: [
                        NzGridModule,
                        NzMenuModule,
                        NzLayoutModule,
                        NzTableModule,
                        NzDividerModule,
                        CommonModule,
                        RouterModule,
                        NzModalModule,
                        NzButtonModule,
                        NzInputModule,
                        NzIconModule,
                        FormsModule,
                        ReactiveFormsModule,
                        NzTableSortOrderDetectorPipe,
                        TranslocoDirective,
                        TranslocoPipe,
                        TranslocoDatePipe,
                    ], selector: 'webhook-log-grid', changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"table-operations\" nz-row nzJustify=\"space-between\">\n  <div nz-col nzSpan=\"6\">\n    {{ 'Logs for webhook #{{webhookId}}' | transloco:{webhookId} }}\n  </div>\n  <div nz-col nzSpan=\"4\">\n    <nz-input-group nzSearch [nzAddOnAfter]=\"suffixIconButton\">\n      <input\n        type=\"text\"\n        [formControl]=\"searchField\"\n        nz-input\n        [placeholder]=\"'input search text' | transloco\"\n      />\n    </nz-input-group>\n    <ng-template #suffixIconButton>\n      <button\n        (click)=\"loadMany({ force: true })\"\n        nz-button\n        nzType=\"primary\"\n        nzSearch\n      >\n        <span nz-icon nzType=\"search\"></span>\n      </button>\n    </ng-template>\n  </div>\n</div>\n@if ((meta$ | async); as meta){\n<nz-table\n  #basicTable\n  [nzBordered]=\"true\"\n  [nzOuterBordered]=\"true\"\n  nzShowPagination\n  nzShowSizeChanger\n  [nzFrontPagination]=\"false\"\n  [nzPageSizeOptions]=\"[1, 5, 10, 20, 30, 40]\"\n  [nzPageIndex]=\"meta.curPage\"\n  [nzPageSize]=\"meta.perPage\"\n  [nzTotal]=\"meta.totalResults || 0\"\n  (nzQueryParams)=\"\n    loadMany({\n      queryParams: $event\n    })\n  \"\n  [nzData]=\"(items$ | async) || []\"\n>\n  <thead>\n    <tr>\n      @for (key of keys; track $index) {\n      <th\n        [nzColumnKey]=\"key\"\n        [nzSortFn]=\"true\"\n        [nzSortOrder]=\"meta.sort[key] | nzTableSortOrderDetector\"\n        [transloco]=\"columns[key]\"\n      ></th>\n      }\n    </tr>\n  </thead>\n  @if (selectedIds$ | async; as selectedIds) {\n  <tbody>\n    @for (data of basicTable.data; track $index) {\n    <tr\n      (click)=\"selectedIds$.next(selectedIds[0] === data.id ? [] : [data.id])\"\n      [class.selected]=\"selectedIds[0] === data.id\"\n    >\n      @for (key of keys; track $index) { @for (key of keys; track $index) { @if\n      (data[key] &&\n      [WebhookLogScalarFieldEnumInterface.createdAt,WebhookLogScalarFieldEnumInterface.updatedAt\n      ].includes(key)) {\n      <td>\n        {{\n          +data[key]\n            | translocoDate : { dateStyle: 'medium', timeStyle: 'medium' }\n        }}\n      </td>\n      } @else{\n      <td>\n        {{ data[key] }}\n      </td>\n      } } }\n    </tr>\n    }\n  </tbody>\n  }\n</nz-table>\n}\n" }]
        }], ctorParameters: () => [{ type: WebhookLogService }], propDecorators: { webhookId: [{
                type: Input,
                args: [{ required: true }]
            }] } });

const WEBHOOK_GUARD_DATA_ROUTE_KEY = 'webhookGuardData';
class WebhookGuardData {
    roles;
    constructor(options) {
        Object.assign(this, options);
    }
}
class WebhookGuardService {
    webhookAuthService;
    constructor(webhookAuthService) {
        this.webhookAuthService = webhookAuthService;
    }
    canActivate(route) {
        if (route.data[WEBHOOK_GUARD_DATA_ROUTE_KEY] instanceof WebhookGuardData) {
            const webhookGuardData = route.data[WEBHOOK_GUARD_DATA_ROUTE_KEY];
            const webhookGuardDataRoles = webhookGuardData.roles || [];
            return this.webhookAuthService.loadWebhookUser().pipe(map((webhookUser) => {
                return Boolean((webhookUser &&
                    webhookGuardDataRoles.length > 0 &&
                    webhookGuardDataRoles.includes(webhookUser.userRole)) ||
                    (webhookGuardDataRoles.length === 0 && !webhookUser?.userRole));
            }));
        }
        return of(true);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookGuardService, deps: [{ token: WebhookAuthService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookGuardService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: WebhookGuardService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: WebhookAuthService }] });

/**
 * Generated bundle index. Do not edit.
 */

export { WEBHOOK_CONFIGURATION_TOKEN, WEBHOOK_GUARD_DATA_ROUTE_KEY, WebhookAuthFormComponent, WebhookAuthFormService, WebhookAuthMapperService, WebhookAuthService, WebhookConfiguration, WebhookEventsService, WebhookFormComponent, WebhookFormService, WebhookGridComponent, WebhookGuardData, WebhookGuardService, WebhookLogGridComponent, WebhookLogService, WebhookMapperService, WebhookService };
//# sourceMappingURL=nestjs-mod-fullstack-webhook-angular.mjs.map
