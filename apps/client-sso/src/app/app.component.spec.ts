import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';
import {
  RestClientApiModule,
  RestClientConfiguration,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { MINIO_URL } from '@nestjs-mod-fullstack/files-angular';
import {
  RestClientApiModule as SsoRestClientApiModule,
  RestClientConfiguration as SsoRestClientConfiguration,
} from '@nestjs-mod/sso-rest-sdk-angular';
import {
  SSO_URL,
  provideAuthIntegrationConfiguration,
} from '../app/integrations/auth-integration.configuration';
import { ssoURL, minioURL } from '../environments/environment';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        // Transloco Config
        provideTransloco({
          config: {
            availableLangs: [
              {
                id: 'en',
                label: 'app.locale.name.english',
              },
              {
                id: 'ru',
                label: 'app.locale.name.russian',
              },
            ],
            defaultLang: 'en',
            fallbackLang: 'en',
            reRenderOnLangChange: true,
            prodMode: true,
            missingHandler: {
              logMissingKey: true,
              useFallbackTranslation: true,
              allowEmpty: true,
            },
          },
        }),
        provideTranslocoLocale({
          defaultLocale: 'en-US',
          langToLocaleMapping: {
            en: 'en-US',
            ru: 'ru-RU',
          },
        }),
        provideTranslocoMessageformat({
          locales: ['en-US', 'ru-RU'],
        }),
        provideAuthIntegrationConfiguration(),
        {
          provide: MINIO_URL,
          useValue: minioURL,
        },
        {
          provide: SSO_URL,
          useValue: ssoURL,
        },
      ],
      imports: [
        AppComponent,
        RouterModule.forRoot([]),
        HttpClientModule,
        RestClientApiModule.forRoot(
          () =>
            new RestClientConfiguration({
              basePath: 'http://localhost:3000',
            })
        ),
        SsoRestClientApiModule.forRoot(
          () =>
            new SsoRestClientConfiguration({
              basePath:
                localStorage.getItem('ssoURL') ||
                // use from environments
                ssoURL ||
                '',
            })
        ),
      ],
    }).compileComponents();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.logo')?.textContent).toContain('Fullstack');
  });

  it(`should have as title 'client'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Fullstack');
  });
});
