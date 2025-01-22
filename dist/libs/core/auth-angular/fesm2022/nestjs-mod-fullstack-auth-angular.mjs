import { __decorate, __metadata } from 'tslib';
import { AsyncPipe } from '@angular/common';
import * as i0 from '@angular/core';
import { Injectable, InjectionToken, Inject, Optional, Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import * as i13 from '@angular/forms';
import { UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as i14 from '@angular/router';
import { RouterModule } from '@angular/router';
import * as i1 from '@jsverse/transloco';
import { TranslocoService, TranslocoDirective } from '@jsverse/transloco';
import * as i2 from '@nestjs-mod-fullstack/common-angular';
import { ValidationService, mapGraphqlErrors } from '@nestjs-mod-fullstack/common-angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import * as i7 from '@ngx-formly/core';
import { FormlyModule } from '@ngx-formly/core';
import * as i10 from 'ng-zorro-antd/button';
import { NzButtonModule } from 'ng-zorro-antd/button';
import * as i9 from 'ng-zorro-antd/form';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import * as i2$1 from 'ng-zorro-antd/message';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { of, BehaviorSubject, merge, throwError, from, mergeMap, map, catchError, tap } from 'rxjs';
import { Authorizer } from '@authorizerdev/authorizer-js';
import * as i8 from 'ng-zorro-antd/grid';
import * as i11 from 'ng-zorro-antd/core/transition-patch';
import * as i12 from 'ng-zorro-antd/core/wave';
import { TRANSLOCO_LOCALE_LANG_MAPPING } from '@jsverse/transloco-locale';
import * as i1$1 from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { AuthErrorEnumInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';

let AuthProfileFormService = class AuthProfileFormService {
    translocoService;
    validationService;
    constructor(translocoService, validationService) {
        this.translocoService = translocoService;
        this.validationService = validationService;
    }
    init() {
        return of(true);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getFormlyFields(options) {
        return this.validationService.appendServerErrorsAsValidatorsToFields([
            {
                key: 'picture',
                type: 'image-file',
                validation: {
                    show: true,
                },
                props: {
                    label: this.translocoService.translate(`auth.profile-form.fields.picture`),
                    placeholder: 'picture',
                },
            },
            {
                key: 'old_password',
                type: 'input',
                validation: {
                    show: true,
                },
                props: {
                    label: this.translocoService.translate(`auth.profile-form.fields.old-password`),
                    placeholder: 'old_password',
                    type: 'password',
                },
            },
            {
                key: 'new_password',
                type: 'input',
                validation: {
                    show: true,
                },
                props: {
                    label: this.translocoService.translate(`auth.profile-form.fields.new-password`),
                    placeholder: 'new_password',
                    type: 'password',
                },
            },
            {
                key: 'confirm_new_password',
                type: 'input',
                validation: {
                    show: true,
                },
                props: {
                    label: this.translocoService.translate(`auth.profile-form.fields.confirm-new-password`),
                    placeholder: 'confirm_new_password',
                    type: 'password',
                },
            },
        ], options?.errors || []);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthProfileFormService, deps: [{ token: i1.TranslocoService }, { token: i2.ValidationService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthProfileFormService, providedIn: 'root' });
};
AuthProfileFormService = __decorate([
    UntilDestroy(),
    __metadata("design:paramtypes", [TranslocoService,
        ValidationService])
], AuthProfileFormService);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthProfileFormService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.TranslocoService }, { type: i2.ValidationService }] });

class AuthProfileMapperService {
    toModel(data) {
        return {
            old_password: data['old_password'],
            new_password: data['new_password'],
            confirm_new_password: data['confirm_new_password'],
            picture: data['picture'],
        };
    }
    toJson(data) {
        return {
            old_password: data['old_password'],
            new_password: data['new_password'],
            confirm_new_password: data['confirm_new_password'],
            picture: data['picture'],
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthProfileMapperService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthProfileMapperService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthProfileMapperService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class AuthConfiguration {
    constructor(options) {
        Object.assign(this, options);
    }
}
const AUTH_CONFIGURATION_TOKEN = new InjectionToken('AUTH_CONFIGURATION_TOKEN');

const AUTHORIZER_URL = new InjectionToken('AuthorizerURL');
class AuthorizerService extends Authorizer {
    authorizerURL;
    constructor(authorizerURL) {
        super({
            authorizerURL: 
            // need for override from e2e-tests
            localStorage.getItem('authorizerURL') ||
                // use from environments
                authorizerURL,
            clientID: '',
            redirectURL: window.location.origin,
        });
        this.authorizerURL = authorizerURL;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthorizerService, deps: [{ token: AUTHORIZER_URL }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthorizerService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthorizerService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [AUTHORIZER_URL]
                }] }] });

class TokensService {
    tokens$ = new BehaviorSubject(undefined);
    getRefreshToken() {
        return (this.tokens$.value?.refresh_token || localStorage.getItem('refreshToken'));
    }
    getAccessToken() {
        return (this.tokens$.value?.access_token || localStorage.getItem('accessToken'));
    }
    setTokens(tokens) {
        this.tokens$.next(tokens);
        if (tokens.refresh_token) {
            localStorage.setItem('refreshToken', tokens.refresh_token);
        }
    }
    getStream() {
        return merge(of(this.tokens$.value), this.tokens$.asObservable());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: TokensService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: TokensService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: TokensService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class AuthService {
    tokensService;
    authConfiguration;
    authorizerService;
    profile$ = new BehaviorSubject(undefined);
    constructor(tokensService, authConfiguration, authorizerService) {
        this.tokensService = tokensService;
        this.authConfiguration = authConfiguration;
        this.authorizerService = authorizerService;
    }
    getAuthorizerClientID() {
        if (!this.authorizerService) {
            throw new Error('this.authorizerService not set');
        }
        return this.authorizerService.config.clientID;
    }
    setAuthorizerClientID(clientID) {
        if (!this.authorizerService) {
            throw new Error('this.authorizerService not set');
        }
        this.authorizerService.config.clientID = clientID;
    }
    signUp(data) {
        if (!this.authorizerService) {
            return throwError(() => new Error('this.authorizerService not set'));
        }
        return from(this.authorizerService.signup({
            ...data,
            email: data.email?.toLowerCase(),
        })).pipe(mapGraphqlErrors(), mergeMap((result) => {
            return this.setProfileAndTokens(result).pipe(map((profile) => ({
                profile,
                tokens: result,
            })));
        }));
    }
    updateProfile(data) {
        if (!this.authorizerService) {
            return throwError(() => new Error('this.authorizerService not set'));
        }
        const oldProfile = this.profile$.value;
        return (this.authConfiguration?.beforeUpdateProfile
            ? this.authConfiguration.beforeUpdateProfile(data)
            : of(data)).pipe(mergeMap((data) => !this.authorizerService
            ? throwError(() => new Error('this.authorizerService not set'))
            : from(this.authorizerService.updateProfile({
                ...data,
            }, this.getAuthorizationHeaders()))), mapGraphqlErrors(), mergeMap(() => !this.authorizerService
            ? throwError(() => new Error('this.authorizerService not set'))
            : this.authorizerService.getProfile(this.getAuthorizationHeaders())), mapGraphqlErrors(), mergeMap((result) => this.setProfile(result)), mergeMap((updatedProfile) => this.authConfiguration?.afterUpdateProfile
            ? this.authConfiguration.afterUpdateProfile({
                new: updatedProfile,
                old: oldProfile,
            })
            : of({
                new: updatedProfile,
            })));
    }
    signIn(data) {
        if (!this.authorizerService) {
            return throwError(() => new Error('this.authorizerService not set'));
        }
        return from(this.authorizerService.login({
            ...data,
            email: data.email?.toLowerCase(),
        })).pipe(mapGraphqlErrors(), mergeMap((result) => {
            return this.setProfileAndTokens(result).pipe(map((profile) => ({
                profile,
                tokens: result,
            })));
        }));
    }
    signOut() {
        if (!this.authorizerService) {
            return throwError(() => new Error('this.authorizerService not set'));
        }
        return from(this.authorizerService.logout(this.getAuthorizationHeaders())).pipe(mapGraphqlErrors(), mergeMap(() => {
            return this.clearProfileAndTokens();
        }));
    }
    refreshToken() {
        if (!this.authorizerService) {
            return throwError(() => new Error('this.authorizerService not set'));
        }
        return from(this.authorizerService.browserLogin()).pipe(mapGraphqlErrors(), mergeMap((result) => {
            return this.setProfileAndTokens(result);
        }), catchError((err) => {
            console.error(err);
            return this.clearProfileAndTokens();
        }));
    }
    clearProfileAndTokens() {
        return this.setProfileAndTokens({});
    }
    setProfileAndTokens(result) {
        this.tokensService.setTokens(result);
        return this.setProfile(result?.user);
    }
    getAuthorizationHeaders() {
        if (this.authConfiguration?.getAuthorizationHeaders) {
            return this.authConfiguration.getAuthorizationHeaders();
        }
        if (!this.tokensService.getAccessToken()) {
            return {};
        }
        return {
            Authorization: `Bearer ${this.tokensService.getAccessToken()}`,
        };
    }
    setProfile(result) {
        this.profile$.next(result);
        return of(result);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthService, deps: [{ token: TokensService }, { token: AUTH_CONFIGURATION_TOKEN, optional: true }, { token: AuthorizerService, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: TokensService }, { type: AuthConfiguration, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [AUTH_CONFIGURATION_TOKEN]
                }] }, { type: AuthorizerService, decorators: [{
                    type: Optional
                }] }] });

let AuthProfileFormComponent = class AuthProfileFormComponent {
    nzModalData;
    authService;
    nzMessageService;
    translocoService;
    authProfileFormService;
    authProfileMapperService;
    validationService;
    hideButtons;
    form = new UntypedFormGroup({});
    formlyModel$ = new BehaviorSubject(null);
    formlyFields$ = new BehaviorSubject(null);
    constructor(nzModalData, authService, nzMessageService, translocoService, authProfileFormService, authProfileMapperService, validationService) {
        this.nzModalData = nzModalData;
        this.authService = authService;
        this.nzMessageService = nzMessageService;
        this.translocoService = translocoService;
        this.authProfileFormService = authProfileFormService;
        this.authProfileMapperService = authProfileMapperService;
        this.validationService = validationService;
    }
    ngOnInit() {
        Object.assign(this, this.nzModalData);
        merge(this.authProfileFormService.init(), this.translocoService.langChanges$)
            .pipe(mergeMap(() => {
            this.fillFromProfile();
            return of(true);
        }), untilDestroyed(this))
            .subscribe();
    }
    setFieldsAndModel(data = {}) {
        const model = this.authProfileMapperService.toModel(data);
        this.setFormlyFields({ data: model });
        this.formlyModel$.next(model);
    }
    setFormlyFields(options) {
        this.formlyFields$.next(this.authProfileFormService.getFormlyFields(options));
    }
    submitForm() {
        if (this.form.valid) {
            const value = this.authProfileMapperService.toJson(this.form.value);
            this.authService
                .updateProfile(value)
                .pipe(tap(() => {
                this.fillFromProfile();
                this.nzMessageService.success(this.translocoService.translate('Updated'));
            }), catchError((err) => this.validationService.catchAndProcessServerError(err, (options) => this.setFormlyFields(options))), 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            catchError((err) => {
                console.error(err);
                this.nzMessageService.error(err.message);
                return of(null);
            }), untilDestroyed(this))
                .subscribe();
        }
        else {
            console.log(this.form.controls);
            this.nzMessageService.warning(this.translocoService.translate('Validation errors'));
        }
    }
    fillFromProfile() {
        this.setFieldsAndModel(this.authService.profile$.value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthProfileFormComponent, deps: [{ token: NZ_MODAL_DATA, optional: true }, { token: AuthService }, { token: i2$1.NzMessageService }, { token: i1.TranslocoService }, { token: AuthProfileFormService }, { token: AuthProfileMapperService }, { token: i2.ValidationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.0.5", type: AuthProfileFormComponent, isStandalone: true, selector: "auth-profile-form", inputs: { hideButtons: "hideButtons" }, ngImport: i0, template: `@if (formlyFields$ | async; as formlyFields) {
    <form nz-form [formGroup]="form" (ngSubmit)="submitForm()">
      <formly-form
        [model]="formlyModel$ | async"
        [fields]="formlyFields"
        [form]="form"
      >
      </formly-form>
      @if (!hideButtons) {
      <nz-form-control>
        <div class="flex justify-between">
          <div></div>
          <button
            nz-button
            nzType="primary"
            type="submit"
            [disabled]="!form.valid"
            transloco="Update"
          ></button>
        </div>
      </nz-form-control>
      }
    </form>
    } `, isInline: true, dependencies: [{ kind: "ngmodule", type: FormlyModule }, { kind: "component", type: i7.FormlyForm, selector: "formly-form", inputs: ["form", "model", "fields", "options"], outputs: ["modelChange"] }, { kind: "ngmodule", type: NzFormModule }, { kind: "directive", type: i8.NzColDirective, selector: "[nz-col],nz-col,nz-form-control,nz-form-label", inputs: ["nzFlex", "nzSpan", "nzOrder", "nzOffset", "nzPush", "nzPull", "nzXs", "nzSm", "nzMd", "nzLg", "nzXl", "nzXXl"], exportAs: ["nzCol"] }, { kind: "directive", type: i9.NzFormDirective, selector: "[nz-form]", inputs: ["nzLayout", "nzNoColon", "nzAutoTips", "nzDisableAutoTips", "nzTooltipIcon", "nzLabelAlign", "nzLabelWrap"], exportAs: ["nzForm"] }, { kind: "component", type: i9.NzFormControlComponent, selector: "nz-form-control", inputs: ["nzSuccessTip", "nzWarningTip", "nzErrorTip", "nzValidatingTip", "nzExtra", "nzAutoTips", "nzDisableAutoTips", "nzHasFeedback", "nzValidateStatus"], exportAs: ["nzFormControl"] }, { kind: "ngmodule", type: NzInputModule }, { kind: "ngmodule", type: NzButtonModule }, { kind: "component", type: i10.NzButtonComponent, selector: "button[nz-button], a[nz-button]", inputs: ["nzBlock", "nzGhost", "nzSearch", "nzLoading", "nzDanger", "disabled", "tabIndex", "nzType", "nzShape", "nzSize"], exportAs: ["nzButton"] }, { kind: "directive", type: i11.ɵNzTransitionPatchDirective, selector: "[nz-button], nz-button-group, [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group", inputs: ["hidden"] }, { kind: "directive", type: i12.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i13.ɵNgNoValidate, selector: "form:not([ngNoForm]):not([ngNativeValidate])" }, { kind: "directive", type: i13.NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]" }, { kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i13.FormGroupDirective, selector: "[formGroup]", inputs: ["formGroup"], outputs: ["ngSubmit"], exportAs: ["ngForm"] }, { kind: "pipe", type: AsyncPipe, name: "async" }, { kind: "ngmodule", type: RouterModule }, { kind: "directive", type: TranslocoDirective, selector: "[transloco]", inputs: ["transloco", "translocoParams", "translocoScope", "translocoRead", "translocoPrefix", "translocoLang", "translocoLoadingTpl"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
};
AuthProfileFormComponent = __decorate([
    UntilDestroy(),
    __metadata("design:paramtypes", [AuthProfileFormComponent,
        AuthService,
        NzMessageService,
        TranslocoService,
        AuthProfileFormService,
        AuthProfileMapperService,
        ValidationService])
], AuthProfileFormComponent);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthProfileFormComponent, decorators: [{
            type: Component,
            args: [{
                    imports: [
                        FormlyModule,
                        NzFormModule,
                        NzInputModule,
                        NzButtonModule,
                        FormsModule,
                        ReactiveFormsModule,
                        AsyncPipe,
                        RouterModule,
                        TranslocoDirective,
                    ],
                    selector: 'auth-profile-form',
                    template: `@if (formlyFields$ | async; as formlyFields) {
    <form nz-form [formGroup]="form" (ngSubmit)="submitForm()">
      <formly-form
        [model]="formlyModel$ | async"
        [fields]="formlyFields"
        [form]="form"
      >
      </formly-form>
      @if (!hideButtons) {
      <nz-form-control>
        <div class="flex justify-between">
          <div></div>
          <button
            nz-button
            nzType="primary"
            type="submit"
            [disabled]="!form.valid"
            transloco="Update"
          ></button>
        </div>
      </nz-form-control>
      }
    </form>
    } `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                }]
        }], ctorParameters: () => [{ type: AuthProfileFormComponent, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NZ_MODAL_DATA]
                }] }, { type: AuthService }, { type: i2$1.NzMessageService }, { type: i1.TranslocoService }, { type: AuthProfileFormService }, { type: AuthProfileMapperService }, { type: i2.ValidationService }], propDecorators: { hideButtons: [{
                type: Input
            }] } });

let AuthSignInFormService = class AuthSignInFormService {
    translocoService;
    validationService;
    constructor(translocoService, validationService) {
        this.translocoService = translocoService;
        this.validationService = validationService;
    }
    init() {
        return of(true);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getFormlyFields(options) {
        return this.validationService.appendServerErrorsAsValidatorsToFields([
            {
                key: 'email',
                type: 'input',
                validation: {
                    show: true,
                },
                props: {
                    label: this.translocoService.translate(`auth.sign-in-form.fields.email`),
                    placeholder: 'email',
                    required: true,
                },
            },
            {
                key: 'password',
                type: 'input',
                validation: {
                    show: true,
                },
                props: {
                    label: this.translocoService.translate(`auth.sign-in-form.fields.password`),
                    placeholder: 'password',
                    required: true,
                    type: 'password',
                },
            },
        ], options?.errors || []);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignInFormService, deps: [{ token: i1.TranslocoService }, { token: i2.ValidationService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignInFormService, providedIn: 'root' });
};
AuthSignInFormService = __decorate([
    UntilDestroy(),
    __metadata("design:paramtypes", [TranslocoService,
        ValidationService])
], AuthSignInFormService);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignInFormService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.TranslocoService }, { type: i2.ValidationService }] });

class AuthSignInMapperService {
    toModel(data) {
        return {
            email: data['email'],
            password: data['password'],
        };
    }
    toJson(data) {
        return {
            email: data['email'],
            password: data['password'],
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignInMapperService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignInMapperService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignInMapperService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

let AuthSignInFormComponent = class AuthSignInFormComponent {
    nzModalData;
    authService;
    nzMessageService;
    translocoService;
    authSignInFormService;
    authSignInMapperService;
    validationService;
    hideButtons;
    afterSignIn = new EventEmitter();
    form = new UntypedFormGroup({});
    formlyModel$ = new BehaviorSubject(null);
    formlyFields$ = new BehaviorSubject(null);
    constructor(nzModalData, authService, nzMessageService, translocoService, authSignInFormService, authSignInMapperService, validationService) {
        this.nzModalData = nzModalData;
        this.authService = authService;
        this.nzMessageService = nzMessageService;
        this.translocoService = translocoService;
        this.authSignInFormService = authSignInFormService;
        this.authSignInMapperService = authSignInMapperService;
        this.validationService = validationService;
    }
    ngOnInit() {
        Object.assign(this, this.nzModalData);
        this.setFieldsAndModel({ password: '' });
    }
    setFieldsAndModel(data = { password: '' }) {
        const model = this.authSignInMapperService.toModel(data);
        this.setFormlyFields({ data: model });
        this.formlyModel$.next(model);
    }
    submitForm() {
        if (this.form.valid) {
            const value = this.authSignInMapperService.toJson(this.form.value);
            this.authService
                .signIn(value)
                .pipe(tap((result) => {
                if (result.tokens) {
                    this.afterSignIn.next(result.tokens);
                    this.nzMessageService.success(this.translocoService.translate('Success'));
                }
            }), catchError((err) => this.validationService.catchAndProcessServerError(err, (options) => this.setFormlyFields(options))), 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            catchError((err) => {
                console.error(err);
                this.nzMessageService.error(err.message);
                return of(null);
            }), untilDestroyed(this))
                .subscribe();
        }
        else {
            console.log(this.form.controls);
            this.nzMessageService.warning(this.translocoService.translate('Validation errors'));
        }
    }
    setFormlyFields(options) {
        this.formlyFields$.next(this.authSignInFormService.getFormlyFields(options));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignInFormComponent, deps: [{ token: NZ_MODAL_DATA, optional: true }, { token: AuthService }, { token: i2$1.NzMessageService }, { token: i1.TranslocoService }, { token: AuthSignInFormService }, { token: AuthSignInMapperService }, { token: i2.ValidationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.0.5", type: AuthSignInFormComponent, isStandalone: true, selector: "auth-sign-in-form", inputs: { hideButtons: "hideButtons" }, outputs: { afterSignIn: "afterSignIn" }, ngImport: i0, template: "@if (formlyFields$ | async; as formlyFields) {\n<form nz-form [formGroup]=\"form\" (ngSubmit)=\"submitForm()\">\n  <formly-form\n    [model]=\"formlyModel$ | async\"\n    [fields]=\"formlyFields\"\n    [form]=\"form\"\n  >\n  </formly-form>\n  @if (!hideButtons) {\n  <nz-form-control>\n    <div class=\"flex justify-between\">\n      <div>\n        <button\n          nz-button\n          nzType=\"default\"\n          type=\"button\"\n          [routerLink]=\"'/sign-up'\"\n          transloco=\"Sign-up\"\n        ></button>\n      </div>\n      <button\n        nz-button\n        nzType=\"primary\"\n        type=\"submit\"\n        [disabled]=\"!form.valid\"\n        transloco=\"Sign-in\"\n      ></button>\n    </div>\n  </nz-form-control>\n  }\n</form>\n}\n", dependencies: [{ kind: "ngmodule", type: FormlyModule }, { kind: "component", type: i7.FormlyForm, selector: "formly-form", inputs: ["form", "model", "fields", "options"], outputs: ["modelChange"] }, { kind: "ngmodule", type: NzFormModule }, { kind: "directive", type: i8.NzColDirective, selector: "[nz-col],nz-col,nz-form-control,nz-form-label", inputs: ["nzFlex", "nzSpan", "nzOrder", "nzOffset", "nzPush", "nzPull", "nzXs", "nzSm", "nzMd", "nzLg", "nzXl", "nzXXl"], exportAs: ["nzCol"] }, { kind: "directive", type: i9.NzFormDirective, selector: "[nz-form]", inputs: ["nzLayout", "nzNoColon", "nzAutoTips", "nzDisableAutoTips", "nzTooltipIcon", "nzLabelAlign", "nzLabelWrap"], exportAs: ["nzForm"] }, { kind: "component", type: i9.NzFormControlComponent, selector: "nz-form-control", inputs: ["nzSuccessTip", "nzWarningTip", "nzErrorTip", "nzValidatingTip", "nzExtra", "nzAutoTips", "nzDisableAutoTips", "nzHasFeedback", "nzValidateStatus"], exportAs: ["nzFormControl"] }, { kind: "ngmodule", type: NzInputModule }, { kind: "ngmodule", type: NzButtonModule }, { kind: "component", type: i10.NzButtonComponent, selector: "button[nz-button], a[nz-button]", inputs: ["nzBlock", "nzGhost", "nzSearch", "nzLoading", "nzDanger", "disabled", "tabIndex", "nzType", "nzShape", "nzSize"], exportAs: ["nzButton"] }, { kind: "directive", type: i11.ɵNzTransitionPatchDirective, selector: "[nz-button], nz-button-group, [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group", inputs: ["hidden"] }, { kind: "directive", type: i12.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i13.ɵNgNoValidate, selector: "form:not([ngNoForm]):not([ngNativeValidate])" }, { kind: "directive", type: i13.NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]" }, { kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i13.FormGroupDirective, selector: "[formGroup]", inputs: ["formGroup"], outputs: ["ngSubmit"], exportAs: ["ngForm"] }, { kind: "pipe", type: AsyncPipe, name: "async" }, { kind: "ngmodule", type: RouterModule }, { kind: "directive", type: i14.RouterLink, selector: "[routerLink]", inputs: ["target", "queryParams", "fragment", "queryParamsHandling", "state", "info", "relativeTo", "preserveFragment", "skipLocationChange", "replaceUrl", "routerLink"] }, { kind: "directive", type: TranslocoDirective, selector: "[transloco]", inputs: ["transloco", "translocoParams", "translocoScope", "translocoRead", "translocoPrefix", "translocoLang", "translocoLoadingTpl"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
};
AuthSignInFormComponent = __decorate([
    UntilDestroy(),
    __metadata("design:paramtypes", [AuthSignInFormComponent,
        AuthService,
        NzMessageService,
        TranslocoService,
        AuthSignInFormService,
        AuthSignInMapperService,
        ValidationService])
], AuthSignInFormComponent);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignInFormComponent, decorators: [{
            type: Component,
            args: [{ imports: [
                        FormlyModule,
                        NzFormModule,
                        NzInputModule,
                        NzButtonModule,
                        FormsModule,
                        ReactiveFormsModule,
                        AsyncPipe,
                        RouterModule,
                        TranslocoDirective,
                    ], selector: 'auth-sign-in-form', changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (formlyFields$ | async; as formlyFields) {\n<form nz-form [formGroup]=\"form\" (ngSubmit)=\"submitForm()\">\n  <formly-form\n    [model]=\"formlyModel$ | async\"\n    [fields]=\"formlyFields\"\n    [form]=\"form\"\n  >\n  </formly-form>\n  @if (!hideButtons) {\n  <nz-form-control>\n    <div class=\"flex justify-between\">\n      <div>\n        <button\n          nz-button\n          nzType=\"default\"\n          type=\"button\"\n          [routerLink]=\"'/sign-up'\"\n          transloco=\"Sign-up\"\n        ></button>\n      </div>\n      <button\n        nz-button\n        nzType=\"primary\"\n        type=\"submit\"\n        [disabled]=\"!form.valid\"\n        transloco=\"Sign-in\"\n      ></button>\n    </div>\n  </nz-form-control>\n  }\n</form>\n}\n" }]
        }], ctorParameters: () => [{ type: AuthSignInFormComponent, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NZ_MODAL_DATA]
                }] }, { type: AuthService }, { type: i2$1.NzMessageService }, { type: i1.TranslocoService }, { type: AuthSignInFormService }, { type: AuthSignInMapperService }, { type: i2.ValidationService }], propDecorators: { hideButtons: [{
                type: Input
            }], afterSignIn: [{
                type: Output
            }] } });

let AuthSignUpFormService = class AuthSignUpFormService {
    translocoService;
    validationService;
    constructor(translocoService, validationService) {
        this.translocoService = translocoService;
        this.validationService = validationService;
    }
    init() {
        return of(true);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getFormlyFields(options) {
        return this.validationService.appendServerErrorsAsValidatorsToFields([
            {
                key: 'email',
                type: 'input',
                validation: {
                    show: true,
                },
                props: {
                    label: this.translocoService.translate(`auth.sign-up-form.fields.email`),
                    placeholder: 'email',
                    required: true,
                },
            },
            {
                key: 'password',
                type: 'input',
                validation: {
                    show: true,
                },
                props: {
                    label: this.translocoService.translate(`auth.sign-up-form.fields.password`),
                    placeholder: 'password',
                    required: true,
                    type: 'password',
                },
            },
            {
                key: 'confirm_password',
                type: 'input',
                validation: {
                    show: true,
                },
                props: {
                    label: this.translocoService.translate(`auth.sign-up-form.fields.confirm-password`),
                    placeholder: 'confirm_password',
                    required: true,
                    type: 'password',
                },
            },
        ], options?.errors || []);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignUpFormService, deps: [{ token: i1.TranslocoService }, { token: i2.ValidationService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignUpFormService, providedIn: 'root' });
};
AuthSignUpFormService = __decorate([
    UntilDestroy(),
    __metadata("design:paramtypes", [TranslocoService,
        ValidationService])
], AuthSignUpFormService);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignUpFormService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.TranslocoService }, { type: i2.ValidationService }] });

class AuthSignUpMapperService {
    toModel(data) {
        return {
            email: data['email'],
            password: data['password'],
            confirm_password: data['confirm_password'],
        };
    }
    toJson(data) {
        return {
            email: data['email'],
            password: data['password'],
            confirm_password: data['confirm_password'],
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignUpMapperService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignUpMapperService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignUpMapperService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

let AuthSignUpFormComponent = class AuthSignUpFormComponent {
    nzModalData;
    authService;
    nzMessageService;
    translocoService;
    authSignUpFormService;
    authSignUpMapperService;
    validationService;
    hideButtons;
    afterSignUp = new EventEmitter();
    form = new UntypedFormGroup({});
    formlyModel$ = new BehaviorSubject(null);
    formlyFields$ = new BehaviorSubject(null);
    constructor(nzModalData, authService, nzMessageService, translocoService, authSignUpFormService, authSignUpMapperService, validationService) {
        this.nzModalData = nzModalData;
        this.authService = authService;
        this.nzMessageService = nzMessageService;
        this.translocoService = translocoService;
        this.authSignUpFormService = authSignUpFormService;
        this.authSignUpMapperService = authSignUpMapperService;
        this.validationService = validationService;
    }
    ngOnInit() {
        Object.assign(this, this.nzModalData);
        this.setFieldsAndModel({ password: '', confirm_password: '' });
    }
    setFieldsAndModel(data = { password: '', confirm_password: '' }) {
        const model = this.authSignUpMapperService.toModel(data);
        this.setFormlyFields({ data: model });
        this.formlyModel$.next(model);
    }
    submitForm() {
        if (this.form.valid) {
            const value = this.authSignUpMapperService.toJson(this.form.value);
            this.authService
                .signUp({ ...value })
                .pipe(tap((result) => {
                if (result.tokens) {
                    this.afterSignUp.next(result.tokens);
                    this.nzMessageService.success(this.translocoService.translate('Success'));
                }
            }), catchError((err) => this.validationService.catchAndProcessServerError(err, (options) => this.setFormlyFields(options))), 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            catchError((err) => {
                console.error(err);
                this.nzMessageService.error(err.message);
                return of(null);
            }), untilDestroyed(this))
                .subscribe();
        }
        else {
            console.log(this.form.controls);
            this.nzMessageService.warning(this.translocoService.translate('Validation errors'));
        }
    }
    setFormlyFields(options) {
        this.formlyFields$.next(this.authSignUpFormService.getFormlyFields(options));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignUpFormComponent, deps: [{ token: NZ_MODAL_DATA, optional: true }, { token: AuthService }, { token: i2$1.NzMessageService }, { token: i1.TranslocoService }, { token: AuthSignUpFormService }, { token: AuthSignUpMapperService }, { token: i2.ValidationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.0.5", type: AuthSignUpFormComponent, isStandalone: true, selector: "auth-sign-up-form", inputs: { hideButtons: "hideButtons" }, outputs: { afterSignUp: "afterSignUp" }, ngImport: i0, template: "@if (formlyFields$ | async; as formlyFields) {\n<form nz-form [formGroup]=\"form\" (ngSubmit)=\"submitForm()\">\n  <formly-form\n    [model]=\"formlyModel$ | async\"\n    [fields]=\"formlyFields\"\n    [form]=\"form\"\n  >\n  </formly-form>\n  @if (!hideButtons) {\n  <nz-form-control>\n    <div class=\"flex justify-between\">\n      <div>\n        <button\n          nz-button\n          nzType=\"default\"\n          type=\"button\"\n          [routerLink]=\"'/sign-in'\"\n          transloco=\"Sign-in\"\n        ></button>\n      </div>\n      <button\n        nz-button\n        nzType=\"primary\"\n        type=\"submit\"\n        [disabled]=\"!form.valid\"\n        transloco=\"Sign-up\"\n      ></button>\n    </div>\n  </nz-form-control>\n  }\n</form>\n}\n", dependencies: [{ kind: "ngmodule", type: FormlyModule }, { kind: "component", type: i7.FormlyForm, selector: "formly-form", inputs: ["form", "model", "fields", "options"], outputs: ["modelChange"] }, { kind: "ngmodule", type: NzFormModule }, { kind: "directive", type: i8.NzColDirective, selector: "[nz-col],nz-col,nz-form-control,nz-form-label", inputs: ["nzFlex", "nzSpan", "nzOrder", "nzOffset", "nzPush", "nzPull", "nzXs", "nzSm", "nzMd", "nzLg", "nzXl", "nzXXl"], exportAs: ["nzCol"] }, { kind: "directive", type: i9.NzFormDirective, selector: "[nz-form]", inputs: ["nzLayout", "nzNoColon", "nzAutoTips", "nzDisableAutoTips", "nzTooltipIcon", "nzLabelAlign", "nzLabelWrap"], exportAs: ["nzForm"] }, { kind: "component", type: i9.NzFormControlComponent, selector: "nz-form-control", inputs: ["nzSuccessTip", "nzWarningTip", "nzErrorTip", "nzValidatingTip", "nzExtra", "nzAutoTips", "nzDisableAutoTips", "nzHasFeedback", "nzValidateStatus"], exportAs: ["nzFormControl"] }, { kind: "ngmodule", type: NzInputModule }, { kind: "ngmodule", type: NzButtonModule }, { kind: "component", type: i10.NzButtonComponent, selector: "button[nz-button], a[nz-button]", inputs: ["nzBlock", "nzGhost", "nzSearch", "nzLoading", "nzDanger", "disabled", "tabIndex", "nzType", "nzShape", "nzSize"], exportAs: ["nzButton"] }, { kind: "directive", type: i11.ɵNzTransitionPatchDirective, selector: "[nz-button], nz-button-group, [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group", inputs: ["hidden"] }, { kind: "directive", type: i12.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i13.ɵNgNoValidate, selector: "form:not([ngNoForm]):not([ngNativeValidate])" }, { kind: "directive", type: i13.NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]" }, { kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i13.FormGroupDirective, selector: "[formGroup]", inputs: ["formGroup"], outputs: ["ngSubmit"], exportAs: ["ngForm"] }, { kind: "pipe", type: AsyncPipe, name: "async" }, { kind: "ngmodule", type: RouterModule }, { kind: "directive", type: i14.RouterLink, selector: "[routerLink]", inputs: ["target", "queryParams", "fragment", "queryParamsHandling", "state", "info", "relativeTo", "preserveFragment", "skipLocationChange", "replaceUrl", "routerLink"] }, { kind: "directive", type: TranslocoDirective, selector: "[transloco]", inputs: ["transloco", "translocoParams", "translocoScope", "translocoRead", "translocoPrefix", "translocoLang", "translocoLoadingTpl"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
};
AuthSignUpFormComponent = __decorate([
    UntilDestroy(),
    __metadata("design:paramtypes", [AuthSignUpFormComponent,
        AuthService,
        NzMessageService,
        TranslocoService,
        AuthSignUpFormService,
        AuthSignUpMapperService,
        ValidationService])
], AuthSignUpFormComponent);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthSignUpFormComponent, decorators: [{
            type: Component,
            args: [{ imports: [
                        FormlyModule,
                        NzFormModule,
                        NzInputModule,
                        NzButtonModule,
                        FormsModule,
                        ReactiveFormsModule,
                        AsyncPipe,
                        RouterModule,
                        TranslocoDirective,
                    ], selector: 'auth-sign-up-form', changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (formlyFields$ | async; as formlyFields) {\n<form nz-form [formGroup]=\"form\" (ngSubmit)=\"submitForm()\">\n  <formly-form\n    [model]=\"formlyModel$ | async\"\n    [fields]=\"formlyFields\"\n    [form]=\"form\"\n  >\n  </formly-form>\n  @if (!hideButtons) {\n  <nz-form-control>\n    <div class=\"flex justify-between\">\n      <div>\n        <button\n          nz-button\n          nzType=\"default\"\n          type=\"button\"\n          [routerLink]=\"'/sign-in'\"\n          transloco=\"Sign-in\"\n        ></button>\n      </div>\n      <button\n        nz-button\n        nzType=\"primary\"\n        type=\"submit\"\n        [disabled]=\"!form.valid\"\n        transloco=\"Sign-up\"\n      ></button>\n    </div>\n  </nz-form-control>\n  }\n</form>\n}\n" }]
        }], ctorParameters: () => [{ type: AuthSignUpFormComponent, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NZ_MODAL_DATA]
                }] }, { type: AuthService }, { type: i2$1.NzMessageService }, { type: i1.TranslocoService }, { type: AuthSignUpFormService }, { type: AuthSignUpMapperService }, { type: i2.ValidationService }], propDecorators: { hideButtons: [{
                type: Input
            }], afterSignUp: [{
                type: Output
            }] } });

const AUTH_ACTIVE_LANG_LOCAL_STORAGE_KEY = 'activeLang';
class AuthActiveLangService {
    authRestService;
    translocoService;
    langToLocaleMapping;
    activeLangService;
    constructor(authRestService, translocoService, langToLocaleMapping, activeLangService) {
        this.authRestService = authRestService;
        this.translocoService = translocoService;
        this.langToLocaleMapping = langToLocaleMapping;
        this.activeLangService = activeLangService;
    }
    getActiveLang() {
        return this.authRestService.authControllerProfile().pipe(map((profile) => {
            return profile.lang || this.translocoService.getDefaultLang();
        }), catchError((err) => {
            if ('error' in err &&
                err.error.code === AuthErrorEnumInterface._001) {
                return of(localStorage.getItem(AUTH_ACTIVE_LANG_LOCAL_STORAGE_KEY) ||
                    this.translocoService.getDefaultLang());
            }
            return throwError(() => err);
        }));
    }
    setActiveLang(lang) {
        return this.authRestService.authControllerUpdateProfile({ lang }).pipe(tap(() => {
            this.activeLangService.applyActiveLang(lang);
        }), catchError((err) => {
            if ('error' in err &&
                err.error.code === AuthErrorEnumInterface._001) {
                localStorage.setItem(AUTH_ACTIVE_LANG_LOCAL_STORAGE_KEY, lang);
                this.activeLangService.applyActiveLang(lang);
                return of(null);
            }
            return throwError(() => err);
        }));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthActiveLangService, deps: [{ token: i1$1.AuthRestService }, { token: i1.TranslocoService }, { token: TRANSLOCO_LOCALE_LANG_MAPPING }, { token: i2.ActiveLangService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthActiveLangService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthActiveLangService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1$1.AuthRestService }, { type: i1.TranslocoService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [TRANSLOCO_LOCALE_LANG_MAPPING]
                }] }, { type: i2.ActiveLangService }] });

const AUTH_GUARD_DATA_ROUTE_KEY = 'authGuardData';
class AuthGuardData {
    roles;
    constructor(options) {
        Object.assign(this, options);
    }
}
class AuthGuardService {
    authAuthService;
    constructor(authAuthService) {
        this.authAuthService = authAuthService;
    }
    canActivate(route) {
        if (route.data[AUTH_GUARD_DATA_ROUTE_KEY] instanceof AuthGuardData) {
            const authGuardData = route.data[AUTH_GUARD_DATA_ROUTE_KEY];
            const authUser = this.authAuthService.profile$.value;
            const authGuardDataRoles = (authGuardData.roles || []).map((role) => role.toLowerCase());
            return of(Boolean((authUser &&
                authGuardDataRoles.length > 0 &&
                authGuardDataRoles.some((r) => authUser.roles?.includes(r))) ||
                (authGuardDataRoles.length === 0 && !authUser?.roles)));
        }
        return of(true);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthGuardService, deps: [{ token: AuthService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthGuardService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: AuthGuardService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: AuthService }] });

/**
 * Generated bundle index. Do not edit.
 */

export { AUTHORIZER_URL, AUTH_CONFIGURATION_TOKEN, AUTH_GUARD_DATA_ROUTE_KEY, AuthActiveLangService, AuthConfiguration, AuthGuardData, AuthGuardService, AuthProfileFormComponent, AuthProfileFormService, AuthProfileMapperService, AuthService, AuthSignInFormComponent, AuthSignInFormService, AuthSignInMapperService, AuthSignUpFormComponent, AuthSignUpFormService, AuthSignUpMapperService, AuthorizerService, TokensService };
//# sourceMappingURL=nestjs-mod-fullstack-auth-angular.mjs.map
