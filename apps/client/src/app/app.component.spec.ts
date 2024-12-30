import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import {
  RestClientApiModule,
  RestClientConfiguration,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { AppComponent } from './app.component';
import { AUTHORIZER_URL } from '@nestjs-mod-fullstack/auth-angular';
import { authorizerURL } from '../environments/environment';
import { provideTransloco } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';

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
        {
          provide: AUTHORIZER_URL,
          useValue: authorizerURL,
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
      ],
    }).compileComponents();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.logo')?.textContent).toContain('client');
  });

  it(`should have as title 'client'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('client');
  });
});
