## [2024-10-25] Creating a user interface for the Webhook module using Angular

In this article, I will describe the creation of a table displaying data and a form for filling it out, the interfaces are based on components from https://ng.ant.design, forms are created and managed using https://formly.dev, for styles used https://tailwindcss.com, there is no state machine.

### 1. Creating an empty Angular library

This library contains components for displaying and working with the data of the `Webhook` entity.

_Commands_

```bash
# Create Angular library
./node_modules/.bin/nx g @nx/angular:library webhook-angular --buildable --publishable --directory=libs/core/webhook-angular --simpleName=true --projectNameAndRootFormat=as-provided --strict=true --prefix= --standalone=true --selector= --changeDetection=OnPush --importPath=@nestjs-mod-fullstack/webhook-angular

# Change file with test options
rm -rf libs/core/webhook-angular/src/test-setup.ts
cp apps/client/src/test-setup.ts libs/core/webhook-angular/src/test-setup.ts
```

{% spoiler Console output %}

```bash
$ ./node_modules/.bin/nx g @nx/angular:library webhook-angular --buildable --publishable --directory=libs/core/webhook-angular --simpleName=true --projectNameAndRootFormat=as-provided --strict=true --prefix= --standalone=true --selector= --changeDetection=OnPush --importPath=@nestjs-mod-fullstack/webhook-angular

 NX  Generating @nx/angular:library

CREATE libs/core/webhook-angular/project.json
CREATE libs/core/webhook-angular/README.md
CREATE libs/core/webhook-angular/ng-package.json
CREATE libs/core/webhook-angular/package.json
CREATE libs/core/webhook-angular/tsconfig.json
CREATE libs/core/webhook-angular/tsconfig.lib.json
CREATE libs/core/webhook-angular/tsconfig.lib.prod.json
CREATE libs/core/webhook-angular/src/index.ts
CREATE libs/core/webhook-angular/jest.config.ts
CREATE libs/core/webhook-angular/src/test-setup.ts
CREATE libs/core/webhook-angular/tsconfig.spec.json
CREATE libs/core/webhook-angular/src/lib/webhook-angular/webhook-angular.component.css
CREATE libs/core/webhook-angular/src/lib/webhook-angular/webhook-angular.component.html
CREATE libs/core/webhook-angular/src/lib/webhook-angular/webhook-angular.component.spec.ts
CREATE libs/core/webhook-angular/src/lib/webhook-angular/webhook-angular.component.ts
CREATE libs/core/webhook-angular/.eslintrc.json
UPDATE package.json
UPDATE tsconfig.base.json

> @nestjs-mod-fullstack/source@0.0.9 prepare
> npx -y husky install

install command is DEPRECATED

removed 2 packages, changed 5 packages, and audited 2726 packages in 13s

332 packages are looking for funding
  run `npm fund` for details

33 vulnerabilities (4 low, 12 moderate, 17 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.

 NX   👀 View Details of webhook-angular

Run "nx show project webhook-angular" to view details about this project.
```

{% endspoiler %}

### 2. Creating a common Angular library

The common library contains functions and classes that are used by other `Angular` libraries.

_Commands_

```bash
# Create Angular library
./node_modules/.bin/nx g @nx/angular:library common-angular --buildable --publishable --directory=libs/common-angular --simpleName=true --projectNameAndRootFormat=as-provided --strict=true --prefix= --standalone=true --selector= --changeDetection=OnPush --importPath=@nestjs-mod-fullstack/common-angular

# Change file with test options
rm -rf libs/common-angular/src/test-setup.ts
cp apps/client/src/test-setup.ts libs/common-angular/src/test-setup.ts
```

{% spoiler Console output %}

```bash
$ ./node_modules/.bin/nx g @nx/angular:library common-angular --buildable --publishable --directory=libs/common-angular --simpleName=true --projectNameAndRootFormat=as-provided --strict=true --prefix= --standalone=true --selector= --changeDetection=OnPush --importPath=@nestjs-mod-fullstack/common-angular

 NX  Generating @nx/angular:library

CREATE libs/common-angular/project.json
CREATE libs/common-angular/README.md
CREATE libs/common-angular/ng-package.json
CREATE libs/common-angular/package.json
CREATE libs/common-angular/tsconfig.json
CREATE libs/common-angular/tsconfig.lib.json
CREATE libs/common-angular/tsconfig.lib.prod.json
CREATE libs/common-angular/src/index.ts
CREATE libs/common-angular/jest.config.ts
CREATE libs/common-angular/src/test-setup.ts
CREATE libs/common-angular/tsconfig.spec.json
CREATE libs/common-angular/src/lib/common-angular/common-angular.component.css
CREATE libs/common-angular/src/lib/common-angular/common-angular.component.html
CREATE libs/common-angular/src/lib/common-angular/common-angular.component.spec.ts
CREATE libs/common-angular/src/lib/common-angular/common-angular.component.ts
CREATE libs/common-angular/.eslintrc.json
UPDATE tsconfig.base.json

 NX   👀 View Details of common-angular

Run "nx show project common-angular" to view details about this project.
```

{% endspoiler %}

### 3. Installing additional libraries

We install the library of visual components `ng-zorro-antd`, the library for working with forms `@ngx-formly/core` and `@ngx-formly/ng-zorro-antd`, the utility for auto-unsubscribing `@ngneat/until-destroy` and the collection of utilities `Lodash`.

_Commands_

```bash
npm install --save ng-zorro-antd @ngx-formly/core @ngx-formly/ng-zorro-antd @ngneat/until-destroy lodash
```

{% spoiler Console output %}

```bash
$ npm install --save ng-zorro-antd @ngx-formly/core @ngx-formly/ng-zorro-antd @ngneat/until-destroy

added 8 packages, removed 2 packages, and audited 2794 packages in 25s

343 packages are looking for funding
  run `npm fund` for details

38 vulnerabilities (8 low, 12 moderate, 18 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

{% endspoiler %}

### 4. Since the user and company IDs are needed for the module to work, you need to create interfaces for transmitting this data

Creating an authorization form and service in the `Webhook` module.

The service has methods for obtaining a user profile based on the passed `xExternalUserId` and `xExternalTenantId`, as well as storing their values and user profile data.

The administrator ID is passed from the environment variables `CI/CD`.

To protect the pages, we will create a special `Guard`.

Creating a service _libs/core/webhook-angular/src/lib/services/webhook-auth.service.ts_

```typescript
import { Injectable } from '@angular/core';
import { WebhookErrorInterface, WebhookRestService, WebhookUserObjectInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, catchError, of, tap, throwError } from 'rxjs';

export type WebhookAuthCredentials = {
  xExternalUserId?: string;
  xExternalTenantId?: string;
};

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class WebhookAuthService {
  private webhookAuthCredentials$ = new BehaviorSubject<WebhookAuthCredentials>({});
  private webhookUser$ = new BehaviorSubject<WebhookUserObjectInterface | null>(null);

  constructor(private readonly webhookRestService: WebhookRestService) {}

  getWebhookAuthCredentials() {
    return this.webhookAuthCredentials$.value;
  }

  getWebhookUser() {
    return this.webhookUser$.value;
  }

  setWebhookAuthCredentials(webhookAuthCredentials: WebhookAuthCredentials) {
    this.webhookAuthCredentials$.next(webhookAuthCredentials);
    this.loadWebhookUser().pipe(untilDestroyed(this)).subscribe();
  }

  loadWebhookUser() {
    return this.webhookRestService.webhookControllerProfile(this.getWebhookAuthCredentials().xExternalUserId, this.getWebhookAuthCredentials().xExternalTenantId).pipe(
      tap((profile) => this.webhookUser$.next(profile)),
      catchError((err: { error?: WebhookErrorInterface }) => {
        if (err.error?.code === 'WEBHOOK-002') {
          return of(null);
        }
        return throwError(() => err);
      })
    );
  }

  webhookAuthCredentialsUpdates() {
    return this.webhookAuthCredentials$.asObservable();
  }

  webhookUserUpdates() {
    return this.webhookUser$.asObservable();
  }
}
```

The pseudo authorization form has two fields `xExternalUserId` and `xExternalTenantId`, the form is built and validated through the library https://formly.dev.

In addition to the login button, there are also two more buttons on the form:

1. Fill in the user data - substitutes the `xExternalUserId` and `xExternalTenantId` with the hidden random `uuid` identifiers;
2. Fill in the administrator data - inserts the user ID with the role `Admin` into the `xExternalUserId`, the backend creates this user at startup, and the ID is inserted into the frontend when it is assembled into `CI\CD`.

Creating a file _libs/core/webhook-angular/src/lib/forms/webhook-auth-form/webhook-auth-form.component.ts_

```typescript
import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject } from 'rxjs';
import { WebhookAuthCredentials, WebhookAuthService } from '../../services/webhook-auth.service';
import { WEBHOOK_CONFIGURATION_TOKEN, WebhookConfiguration } from '../../services/webhook.configuration';

@Component({
  standalone: true,
  imports: [FormlyModule, NzFormModule, NzInputModule, NzButtonModule, FormsModule, ReactiveFormsModule, AsyncPipe, NgIf],
  selector: 'webhook-auth-form',
  templateUrl: './webhook-auth-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhookAuthFormComponent implements OnInit {
  @Input()
  hideButtons?: boolean;

  @Output()
  afterSignIn = new EventEmitter<WebhookAuthCredentials>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: WebhookAuthFormComponent,
    @Inject(WEBHOOK_CONFIGURATION_TOKEN)
    private readonly webhookConfiguration: WebhookConfiguration,
    private readonly webhookAuthService: WebhookAuthService,
    private readonly nzMessageService: NzMessageService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);
    this.setFieldsAndModel(this.webhookAuthService.getWebhookAuthCredentials());
  }

  setFieldsAndModel(
    data: Partial<WebhookAuthCredentials> = {},
    options: { xExternalTenantIdIsRequired: boolean } = {
      xExternalTenantIdIsRequired: true,
    }
  ) {
    this.formlyFields$.next([
      {
        key: 'xExternalUserId',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: `webhook.form.xExternalUserId`,
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
          label: `webhook.form.xExternalTenantId`,
          placeholder: 'xExternalTenantId',
          required: options.xExternalTenantIdIsRequired,
        },
      },
    ]);
    this.formlyModel$.next(this.toModel(data));
  }

  submitForm(): void {
    if (this.form.valid) {
      const value = this.toJson(this.form.value);
      this.afterSignIn.next(value);
      this.webhookAuthService.setWebhookAuthCredentials(value);
      this.nzMessageService.success('Success');
    } else {
      console.log(this.form.controls);
      this.nzMessageService.warning('Validation errors');
    }
  }

  fillUserCredentials() {
    this.setFieldsAndModel({
      xExternalTenantId: '2079150a-f133-405c-9e77-64d3ab8aff77',
      xExternalUserId: '3072607c-8c59-4fc4-9a37-916825bc0f99',
    });
  }

  fillAdminCredentials() {
    this.setFieldsAndModel(
      {
        xExternalTenantId: '',
        xExternalUserId: this.webhookConfiguration.webhookSuperAdminExternalUserId,
      },
      { xExternalTenantIdIsRequired: false }
    );
  }

  private toModel(data: Partial<WebhookAuthCredentials>): object | null {
    return {
      xExternalUserId: data['xExternalUserId'],
      xExternalTenantId: data['xExternalTenantId'],
    };
  }

  private toJson(data: Partial<WebhookAuthCredentials>) {
    return {
      xExternalUserId: data['xExternalUserId'],
      xExternalTenantId: data['xExternalTenantId'],
    };
  }
}
```

Creating a file _libs/core/webhook-angular/src/lib/forms/webhook-auth-form/webhook-auth-form.component.html_

```html
@if (formlyFields$ | async; as formlyFields) {
<form nz-form [formGroup]="form" (ngSubmit)="submitForm()">
  <formly-form [model]="formlyModel$ | async" [fields]="formlyFields" [form]="form"> </formly-form>
  @if (!hideButtons) {
  <nz-form-control>
    <div class="flex justify-between">
      <div>
        <button nz-button type="button" (click)="fillUserCredentials()">Fill user credentials</button>
        <button nz-button type="button" (click)="fillAdminCredentials()">Fill admin credentials</button>
      </div>
      <button nz-button nzType="primary" type="submit" [disabled]="!form.valid">Sign-in</button>
    </div>
  </nz-form-control>
  }
</form>
}
```

The administrator ID is passed through the configuration and environment variables.

Updating the file _apps/client/src/environments/environment.prod.ts_

```typescript
export const serverUrl = '';
export const webhookSuperAdminExternalUserId = '___CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID___';
```

Updating the file _apps/client/src/app/app.config.ts_

```typescript
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, ErrorHandler, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { RestClientApiModule, RestClientConfiguration } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { WEBHOOK_CONFIGURATION_TOKEN, WebhookConfiguration } from '@nestjs-mod-fullstack/webhook-angular';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { serverUrl, webhookSuperAdminExternalUserId } from '../environments/environment';
import { AppErrorHandler } from './app.error-handler';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    provideNzI18n(en_US),
    {
      provide: WEBHOOK_CONFIGURATION_TOKEN,
      useValue: new WebhookConfiguration({ webhookSuperAdminExternalUserId }), // <-- update
    },
    importProvidersFrom(
      BrowserAnimationsModule,
      RestClientApiModule.forRoot(
        () =>
          new RestClientConfiguration({
            basePath: serverUrl,
          })
      ),
      FormlyModule.forRoot(),
      FormlyNgZorroAntdModule
    ),
    { provide: ErrorHandler, useClass: AppErrorHandler },
  ],
};
```

We create a page with the login form at the application level, since we do not need to reuse it.

Creating a file _apps/client/src/app/pages/sign-in/sign-in.component.ts_

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { WebhookAuthFormComponent } from '@nestjs-mod-fullstack/webhook-angular';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  standalone: true,
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  imports: [NzBreadCrumbModule, WebhookAuthFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  constructor(private readonly router: Router) {}
  onAfterSignIn() {
    this.router.navigate(['/webhook']);
  }
}
```

Creating a file _apps/client/src/app/pages/sign-in/sign-in.component.html_

```html
<nz-breadcrumb>
  <nz-breadcrumb-item>Sign-in</nz-breadcrumb-item>
</nz-breadcrumb>
<div class="inner-content">
  <webhook-auth-form (afterSignIn)="onAfterSignIn()"></webhook-auth-form>
</div>
```

The authorization page should be available only when the user has not entered the authorization data, for this we will write `Guard` and close our pages with it.

Creating a file _libs/core/webhook-angular/src/lib/services/webhook-guard.service.ts_

```typescript
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { WebhookRoleInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { map, of } from 'rxjs';
import { WebhookAuthService } from './webhook-auth.service';

export const WEBHOOK_GUARD_DATA_ROUTE_KEY = 'webhookGuardData';

export class WebhookGuardData {
  roles?: WebhookRoleInterface[];

  constructor(options?: WebhookGuardData) {
    Object.assign(this, options);
  }
}

@Injectable({ providedIn: 'root' })
export class WebhookGuardService implements CanActivate {
  constructor(private readonly webhookAuthService: WebhookAuthService) {}
  canActivate(route: ActivatedRouteSnapshot) {
    if (route.data[WEBHOOK_GUARD_DATA_ROUTE_KEY] instanceof WebhookGuardData) {
      const webhookGuardData = route.data[WEBHOOK_GUARD_DATA_ROUTE_KEY];
      return this.webhookAuthService.loadWebhookUser().pipe(
        map((webhookUser) => {
          return Boolean((webhookGuardData.roles && webhookUser && webhookGuardData.roles.length > 0 && webhookGuardData.roles.includes(webhookUser.userRole)) || ((webhookGuardData.roles || []).length === 0 && !webhookUser?.userRole));
        })
      );
    }
    return of(true);
  }
}
```

Updating the file _apps/client/src/app/app.routes.ts_

```typescript
import { Route } from '@angular/router';
import { WEBHOOK_GUARD_DATA_ROUTE_KEY, WebhookGuardData, WebhookGuardService } from '@nestjs-mod-fullstack/webhook-angular';
import { HomeComponent } from './pages/home/home.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { WebhookComponent } from './pages/webhook/webhook.component';
import { DemoComponent } from './pages/demo/demo.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'demo', component: DemoComponent },
  {
    path: 'webhook',
    component: WebhookComponent,
    canActivate: [WebhookGuardService],
    data: {
      [WEBHOOK_GUARD_DATA_ROUTE_KEY]: new WebhookGuardData({
        roles: ['Admin', 'User'],
      }),
    },
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [WebhookGuardService],
    data: {
      [WEBHOOK_GUARD_DATA_ROUTE_KEY]: new WebhookGuardData({ roles: [] }),
    },
  },
];
```

### 5. We describe a component with a form and a service for creating and editing a Webhook entity

Since the method for working with the `Webhook` entity requires authorization data, we connect the `WebhookAuthService` to the service for working with the backend of the `Webhook` entity.

Creating a service _libs/core/webhook-angular/src/lib/services/webhook.service.ts_

```typescript
import { Injectable } from '@angular/core';
import { CreateWebhookArgsInterface, UpdateWebhookArgsInterface, WebhookRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { RequestMeta } from '@nestjs-mod-fullstack/common-angular';
import { WebhookAuthService } from './webhook-auth.service';

@Injectable({ providedIn: 'root' })
export class WebhookService {
  constructor(private readonly webhookAuthService: WebhookAuthService, private readonly webhookRestService: WebhookRestService) {}

  findOne(id: string) {
    return this.webhookRestService.webhookControllerFindOne(id, this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId, this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId);
  }

  findMany({ filters, meta }: { filters: Record<string, string>; meta?: RequestMeta }) {
    return this.webhookRestService.webhookControllerFindMany(
      this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId,
      this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId,
      meta?.curPage,
      meta?.perPage,
      filters['search'],
      meta?.sort
        ? Object.entries(meta?.sort)
            .map(([key, value]) => `${key}:${value}`)
            .join(',')
        : undefined
    );
  }

  updateOne(id: string, data: UpdateWebhookArgsInterface) {
    return this.webhookRestService.webhookControllerUpdateOne(id, data, this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId, this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId);
  }

  deleteOne(id: string) {
    return this.webhookRestService.webhookControllerDeleteOne(id, this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId, this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId);
  }

  createOne(data: CreateWebhookArgsInterface) {
    return this.webhookRestService.webhookControllerCreateOne(data, this.webhookAuthService.getWebhookAuthCredentials().xExternalUserId, this.webhookAuthService.getWebhookAuthCredentials().xExternalTenantId);
  }
}
```

The purpose of this post is to create a simple example of `CRUD` on `Angular`, the form consists of standard types of controls `(checkbox, input, select, textarea)`, and the logic for transforming data into `formly` and back lies in the same component.

In future articles, additional custom control types will be created for `formly` with their own transformation logics.

Creating a form class _libs/core/webhook-angular/src/lib/forms/webhook-form/webhook-form.component.ts_

```typescript
import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { WebhookEventInterface, WebhookObjectInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { safeParseJson } from '@nestjs-mod-fullstack/common-angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { BehaviorSubject, tap } from 'rxjs';
import { WebhookEventsService } from '../../services/webhook-events.service';
import { WebhookService } from '../../services/webhook.service';

@UntilDestroy()
@Component({
  standalone: true,
  imports: [FormlyModule, NzFormModule, NzInputModule, NzButtonModule, FormsModule, ReactiveFormsModule, AsyncPipe, NgIf],
  selector: 'webhook-form',
  templateUrl: './webhook-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhookFormComponent implements OnInit {
  @Input()
  id?: string;

  @Input()
  hideButtons?: boolean;

  @Output()
  afterFind = new EventEmitter<WebhookObjectInterface>();

  @Output()
  afterCreate = new EventEmitter<WebhookObjectInterface>();

  @Output()
  afterUpdate = new EventEmitter<WebhookObjectInterface>();

  form = new UntypedFormGroup({});
  formlyModel$ = new BehaviorSubject<object | null>(null);
  formlyFields$ = new BehaviorSubject<FormlyFieldConfig[] | null>(null);

  events: WebhookEventInterface[] = [];

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: WebhookFormComponent,
    private readonly webhookService: WebhookService,
    private readonly webhookEventsService: WebhookEventsService,
    private readonly nzMessageService: NzMessageService
  ) {}

  ngOnInit(): void {
    Object.assign(this, this.nzModalData);
    this.webhookEventsService
      .findMany()
      .pipe(
        tap((events) => {
          this.events = events;

          if (this.id) {
            this.findOne()
              .pipe(
                tap((result) => this.afterFind.next(result)),
                untilDestroyed(this)
              )
              .subscribe();
          } else {
            this.setFieldsAndModel();
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  setFieldsAndModel(data: Partial<WebhookObjectInterface> = {}) {
    this.formlyFields$.next([
      {
        key: 'enabled',
        type: 'checkbox',
        validation: {
          show: true,
        },
        props: {
          label: `webhook.form.enabled`,
          placeholder: 'enabled',
          required: true,
        },
      },
      {
        key: 'endpoint',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: `webhook.form.endpoint`,
          placeholder: 'endpoint',
          required: true,
        },
      },
      {
        key: 'eventName',
        type: 'select',
        validation: {
          show: true,
        },
        props: {
          label: `webhook.form.eventName`,
          placeholder: 'eventName',
          required: true,
          options: this.events.map((e) => ({
            value: e.eventName,
            label: e.description,
          })),
        },
      },
      {
        key: 'headers',
        type: 'textarea',
        validation: {
          show: true,
        },
        props: {
          label: `webhook.form.headers`,
          placeholder: 'headers',
          required: true,
        },
      },
      {
        key: 'requestTimeout',
        type: 'input',
        validation: {
          show: true,
        },
        props: {
          label: `webhook.form.requestTimeout`,
          placeholder: 'requestTimeout',
          required: false,
        },
      },
    ]);
    this.formlyModel$.next(this.toModel(data));
  }

  submitForm(): void {
    if (this.form.valid) {
      if (this.id) {
        this.updateOne()
          .pipe(
            tap((result) => {
              this.nzMessageService.success('Success');
              this.afterUpdate.next(result);
            }),
            untilDestroyed(this)
          )
          .subscribe();
      } else {
        this.createOne()
          .pipe(
            tap((result) => {
              this.nzMessageService.success('Success');
              this.afterCreate.next(result);
            }),

            untilDestroyed(this)
          )
          .subscribe();
      }
    } else {
      console.log(this.form.controls);
      this.nzMessageService.warning('Validation errors');
    }
  }

  createOne() {
    return this.webhookService.createOne(this.toJson(this.form.value));
  }

  updateOne() {
    if (!this.id) {
      throw new Error('id not set');
    }
    return this.webhookService.updateOne(this.id, this.toJson(this.form.value));
  }

  findOne() {
    if (!this.id) {
      throw new Error('id not set');
    }
    return this.webhookService.findOne(this.id).pipe(
      tap((result) => {
        this.setFieldsAndModel(result);
      })
    );
  }

  private toModel(data: Partial<WebhookObjectInterface>): object | null {
    return {
      enabled: (data['enabled'] as unknown as string) === 'true' || data['enabled'] === true,
      endpoint: data['endpoint'],
      eventName: data['eventName'],
      headers: data['headers'] ? JSON.stringify(data['headers']) : '',
      requestTimeout: data['requestTimeout'] && !isNaN(+data['requestTimeout']) ? data['requestTimeout'] : '',
    };
  }

  private toJson(data: Partial<WebhookObjectInterface>) {
    return {
      enabled: data['enabled'] === true,
      endpoint: data['endpoint'] || '',
      eventName: data['eventName'] || '',
      headers: data['headers'] ? safeParseJson(data['headers']) : null,
      requestTimeout: data['requestTimeout'] && !isNaN(+data['requestTimeout']) ? +data['requestTimeout'] : undefined,
    };
  }
}
```

The form markup has the ability to display it as an `inline` on a page with embedded buttons, and it can also be displayed in a modal window that has its own markup for buttons.

Creating the layout of the form _libs/core/webhook-angular/src/lib/forms/webhook-form/webhook-form.component.html_

```html
@if (formlyFields$ | async; as formlyFields) {
<form nz-form [formGroup]="form" (ngSubmit)="submitForm()">
  <formly-form [model]="formlyModel$ | async" [fields]="formlyFields" [form]="form"> </formly-form>
  @if (!hideButtons) {
  <nz-form-control>
    <button nzBlock nz-button nzType="primary" type="submit" [disabled]="!form.valid">{{ id ? 'Save' : 'Create' }}</button>
  </nz-form-control>
  }
</form>
}
```

### 5. We describe a component with a table for viewing, creating and editing Webhook entities

The table supports server-side pagination, sorting and searching in text fields.

After creating/editing/deleting, the current page of the table is loaded.

The creation and editing of records takes place in a modal window with a form.

When deleting an entry, a modal window is displayed confirming the action.

Creating a table class _libs/core/webhook-angular/src/lib/grids/webhook-grid/webhook-grid.component.ts_

```typescript
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WebhookObjectInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import isEqual from 'lodash/fp/isEqual';
import omit from 'lodash/fp/omit';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { BehaviorSubject, debounceTime, distinctUntilChanged, tap } from 'rxjs';

import { WebhookScalarFieldEnumInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { getQueryMeta, getQueryMetaByParams, NzTableSortOrderDetectorPipe, RequestMeta } from '@nestjs-mod-fullstack/common-angular';
import { WebhookFormComponent } from '../../forms/webhook-form/webhook-form.component';
import { WebhookService } from '../../services/webhook.service';

@UntilDestroy()
@Component({
  standalone: true,
  imports: [NzGridModule, NzMenuModule, NzLayoutModule, NzTableModule, NzDividerModule, CommonModule, RouterModule, NzModalModule, NzButtonModule, NzInputModule, NzIconModule, FormsModule, ReactiveFormsModule, NzTableSortOrderDetectorPipe],
  selector: 'webhook-grid',
  templateUrl: './webhook-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhookGridComponent implements OnInit {
  items$ = new BehaviorSubject<WebhookObjectInterface[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);
  columns = ['id', 'enabled', 'endpoint', 'eventName', 'headers', 'requestTimeout'];

  private filters?: Record<string, string>;

  constructor(private readonly webhookService: WebhookService, private readonly nzModalService: NzModalService, private readonly viewContainerRef: ViewContainerRef) {
    this.searchField.valueChanges
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        tap(() => this.loadMany({ force: true })),
        untilDestroyed(this)
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.loadMany();
  }

  loadMany(args?: { filters?: Record<string, string>; meta?: RequestMeta; queryParams?: NzTableQueryParams; force?: boolean }) {
    let meta = { meta: {}, ...(args || {}) }.meta as RequestMeta;
    const { queryParams, filters } = { filters: {}, ...(args || {}) };

    if (!args?.force && queryParams) {
      meta = getQueryMetaByParams(queryParams);
    }

    meta = getQueryMeta(meta, this.meta$.value);

    if (!filters['search'] && this.searchField.value) {
      filters['search'] = this.searchField.value;
    }

    if (
      !args?.force &&
      isEqual(
        omit(['totalResults'], { ...meta, ...filters }),
        omit(['totalResults'], {
          ...this.meta$.value,
          ...this.filters,
        })
      )
    ) {
      return;
    }

    this.webhookService
      .findMany({ filters, meta })
      .pipe(
        tap((result) => {
          this.items$.next(
            result.webhooks.map((item) => ({
              ...item,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              headers: JSON.stringify(item.headers) as any,
            }))
          );
          this.meta$.next({ ...result.meta, ...meta });
          this.filters = filters;
          this.selectedIds$.next([]);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  showCreateOrUpdateModal(id?: string): void {
    const modal = this.nzModalService.create<WebhookFormComponent, WebhookFormComponent>({
      nzTitle: id ? 'Update webhook' : 'Create webhook',
      nzContent: WebhookFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
      } as WebhookFormComponent,
      nzFooter: [
        {
          label: 'Cancel',
          onClick: () => {
            modal.close();
          },
        },
        {
          label: id ? 'Save' : 'Create',
          onClick: () => {
            modal.componentInstance?.afterUpdate
              .pipe(
                tap(() => {
                  modal.close();
                  this.loadMany({ force: true });
                }),
                untilDestroyed(modal.componentInstance)
              )
              .subscribe();

            modal.componentInstance?.afterCreate
              .pipe(
                tap(() => {
                  modal.close();
                  this.loadMany({ force: true });
                }),
                untilDestroyed(modal.componentInstance)
              )
              .subscribe();

            modal.componentInstance?.submitForm();
          },
          type: 'primary',
        },
      ],
    });
  }

  showDeleteModal(id: string) {
    this.nzModalService.confirm({
      nzTitle: `Delete webhook #${id}`,
      nzOkText: 'Yes',
      nzCancelText: 'No',
      nzOnOk: () => {
        this.webhookService
          .deleteOne(id)
          .pipe(
            tap(() => {
              this.loadMany({ force: true });
            }),
            untilDestroyed(this)
          )
          .subscribe();
      },
    });
  }
}
```

Creating a table layout _libs/core/webhook-angular/src/lib/grids/webhook-grid/webhook-grid.component.html_

```html
<div class="table-operations" nz-row nzJustify="space-between">
  <div nz-col nzSpan="4">
    <button nz-button nzType="primary" (click)="showCreateOrUpdateModal()">Create new</button>
  </div>
  <div nz-col nzSpan="4">
    <nz-input-group nzSearch [nzAddOnAfter]="suffixIconButton">
      <input type="text" [formControl]="searchField" nz-input placeholder="input search text" />
    </nz-input-group>
    <ng-template #suffixIconButton>
      <button (click)="loadMany({ force: true })" nz-button nzType="primary" nzSearch>
        <span nz-icon nzType="search"></span>
      </button>
    </ng-template>
  </div>
</div>
@if ((meta$ | async); as meta){
<nz-table
  #basicTable
  [nzBordered]="true"
  [nzOuterBordered]="true"
  nzShowPagination
  nzShowSizeChanger
  [nzFrontPagination]="false"
  [nzPageSizeOptions]="[1, 5, 10, 20, 30, 40]"
  [nzPageIndex]="meta.curPage"
  [nzPageSize]="meta.perPage"
  [nzTotal]="meta.totalResults || 0"
  (nzQueryParams)="
    loadMany({
      queryParams: $event
    })
  "
  [nzData]="(items$ | async) || []"
>
  <thead>
    <tr>
      @for (key of columns; track $index) {
      <th [nzColumnKey]="key" [nzSortFn]="true" [nzSortOrder]="meta.sort[key] | nzTableSortOrderDetector">webhook.grid.{{ key }}</th>
      }
      <th>Action</th>
    </tr>
  </thead>
  @if (selectedIds$ | async; as selectedIds) {
  <tbody>
    @for (data of basicTable.data; track $index) {
    <tr (click)="selectedIds$.next(selectedIds[0] === data.id ? [] : [data.id])" [class.selected]="selectedIds[0] === data.id">
      @for (key of columns; track $index) {
      <td>{{ data[key] }}</td>
      }
      <td>
        <a (click)="showCreateOrUpdateModal(data.id)">Edit</a>
        <nz-divider nzType="vertical"></nz-divider>
        <a (click)="showDeleteModal(data.id)">Delete</a>
      </td>
    </tr>
    }
  </tbody>
  }
</nz-table>
}
```

### 6. Creating an E2E test to check the operation of the form and table

In the current test, we are adding additional options to record what is happening on video, videos help to quickly understand the errors that occur.

Creating a file _apps/client-e2e/src/webhook-crud-as-user.spec.ts_

```typescript
import { getRandomExternalHeaders } from '@nestjs-mod-fullstack/testing';
import { expect, Page, test } from '@playwright/test';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('CRUD operations with Webhook as "User" role', () => {
  const user1Headers = getRandomExternalHeaders();

  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let webhookId: string | null;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: join(__dirname, 'video'),
        size: { width: 1920, height: 1080 },
      },
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('sign in as user', async () => {
    await page.goto('/sign-in', {
      timeout: 5000,
    });

    await page.locator('webhook-auth-form').locator('[placeholder=xExternalUserId]').click();
    await page.keyboard.type(user1Headers['x-external-user-id'], {
      delay: 50,
    });
    await expect(page.locator('webhook-auth-form').locator('[placeholder=xExternalUserId]')).toHaveValue(user1Headers['x-external-user-id']);

    await page.locator('webhook-auth-form').locator('[placeholder=xExternalTenantId]').click();
    await page.keyboard.type(user1Headers['x-external-tenant-id'], {
      delay: 50,
    });
    await expect(page.locator('webhook-auth-form').locator('[placeholder=xExternalTenantId]')).toHaveValue(user1Headers['x-external-tenant-id']);

    await expect(page.locator('webhook-auth-form').locator('button[type=submit]')).toHaveText('Sign-in');

    await page.locator('webhook-auth-form').locator('button[type=submit]').click();
  });

  test('should create new webhook', async () => {
    await page.locator('webhook-grid').locator('button').first().click();

    await setTimeout(5000);

    await page.locator('webhook-form').locator('[placeholder=eventName]').click();
    await page.keyboard.press('Enter', { delay: 100 });
    await expect(page.locator('webhook-form').locator('[placeholder=eventName]')).toContainText('create');

    await page.locator('webhook-form').locator('[placeholder=endpoint]').click();
    await page.keyboard.type('http://example.com', { delay: 50 });
    await expect(page.locator('webhook-form').locator('[placeholder=endpoint]').first()).toHaveValue('http://example.com');

    await page.locator('webhook-form').locator('[placeholder=headers]').click();
    await page.keyboard.type(JSON.stringify(user1Headers), { delay: 50 });
    await expect(page.locator('webhook-form').locator('[placeholder=headers]')).toHaveValue(JSON.stringify(user1Headers));

    await page.locator('[nz-modal-footer]').locator('button').last().click();

    await setTimeout(3000);

    webhookId = await page.locator('webhook-grid').locator('td').nth(0).textContent();
    await expect(page.locator('webhook-grid').locator('td').nth(1)).toContainText('false');
    await expect(page.locator('webhook-grid').locator('td').nth(2)).toContainText('http://example.com');
    await expect(page.locator('webhook-grid').locator('td').nth(3)).toContainText('app-demo.create');
    await expect(page.locator('webhook-grid').locator('td').nth(4)).toContainText(JSON.stringify(user1Headers));
    await expect(page.locator('webhook-grid').locator('td').nth(5)).toContainText('');
  });

  test('should update webhook endpoint', async () => {
    await page.locator('webhook-grid').locator('td').last().locator('a').first().click();

    await setTimeout(5000);

    await expect(page.locator('webhook-form').locator('[placeholder=eventName]')).toContainText('create');

    await expect(page.locator('webhook-form').locator('[placeholder=endpoint]').first()).toHaveValue('http://example.com');

    await expect(page.locator('webhook-form').locator('[placeholder=headers]')).toHaveValue(JSON.stringify(user1Headers));

    await page.locator('webhook-form').locator('[placeholder=endpoint]').click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type('http://example.com/new', { delay: 100 });
    await expect(page.locator('webhook-form').locator('[placeholder=endpoint]').first()).toHaveValue('http://example.com/new');

    await page.locator('[nz-modal-footer]').locator('button').last().click();

    await setTimeout(3000);

    await expect(page.locator('webhook-grid').locator('td').nth(0)).toContainText(webhookId || 'empty');
    await expect(page.locator('webhook-grid').locator('td').nth(1)).toContainText('false');
    await expect(page.locator('webhook-grid').locator('td').nth(2)).toContainText('http://example.com/new');
    await expect(page.locator('webhook-grid').locator('td').nth(3)).toContainText('app-demo.create');
    await expect(page.locator('webhook-grid').locator('td').nth(4)).toContainText(JSON.stringify(user1Headers));
    await expect(page.locator('webhook-grid').locator('td').nth(5)).toContainText('');
  });

  test('should delete updated webhook', async () => {
    await page.locator('webhook-grid').locator('td').last().locator('a').last().click();

    await setTimeout(5000);

    await expect(page.locator('nz-modal-confirm-container').locator('.ant-modal-confirm-title')).toContainText(`Delete webhook #${webhookId}`);

    await page.locator('nz-modal-confirm-container').locator('.ant-modal-body').locator('button').last().click();

    await setTimeout(3000);

    await expect(page.locator('webhook-grid').locator('nz-embed-empty')).toContainText(`No Data`);
  });

  test('sign out', async () => {
    await expect(page.locator('nz-header').locator('[nz-submenu]')).toContainText(`You are logged in as User`);
    await page.locator('nz-header').locator('[nz-submenu]').first().click();

    await expect(page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]')).toContainText(`Sign-out`);

    await page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').first().click();

    await setTimeout(3000);

    await expect(page.locator('nz-header').locator('[nz-menu-item]').last()).toContainText(`Sign-in`);
  });
});
```

### Conclusion

In the process of writing the code for this article, we also created: a table for displaying demo data and a form for creating demo data, as well as various utilities and helpers.

The typical development of the project includes a lot of `boilerplate` code, solving problems with the `boilerplate` code is not described in current articles, now various integrations are described, both external and internal.

### Plans

In the next post, I will connect an external authorization server https://authorizer.dev to the project...

### Links

- https://nestjs.com - the official website of the framework
- https://nestjs-mod.com - the official website of additional utilities
- https://fullstack.nestjs-mod.com - website from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/ec8de9d574a6dbcef3c3339e876ce156a3974aae..414980df21e585cb798e1ff756300c4547e68a42 - current changes
- https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/11523894922/artifacts/2105784301 - video of the tests

#angular #webhook #nestjsmod #fullstack
