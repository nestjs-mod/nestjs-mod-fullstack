import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TranslocoLocaleService } from '@jsverse/transloco-locale';
import {
  AuthErrorEnumInterface,
  AuthErrorInterface,
  AuthRestService,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { catchError, map, of, tap, throwError } from 'rxjs';

const keys = {
  en: 'en-US',
  ru: 'ru-RU',
};

const AUTH_ACTIVE_LANG_LOCAL_STORAGE_KEY = 'activeLang';

@Injectable({ providedIn: 'root' })
export class AuthActiveLangService {
  constructor(
    private readonly authRestService: AuthRestService,
    private readonly translocoService: TranslocoService,
    private readonly translocoLocaleService: TranslocoLocaleService
  ) {}

  getActiveLang() {
    return this.authRestService.authControllerProfile().pipe(
      map((profile) => {
        return profile.lang || this.translocoService.getDefaultLang();
      }),
      catchError((err) => {
        if (
          'error' in err &&
          (err.error as AuthErrorInterface).code === AuthErrorEnumInterface._001
        ) {
          return of(
            localStorage.getItem(AUTH_ACTIVE_LANG_LOCAL_STORAGE_KEY) ||
              this.translocoService.getDefaultLang()
          );
        }
        return throwError(() => err);
      })
    );
  }

  setActiveLang(lang: string) {
    return this.authRestService.authControllerUpdateProfile({ lang }).pipe(
      tap(() => {
        this.translocoService.setActiveLang(lang);
        this.translocoLocaleService.setLocale(keys[lang]);
      }),
      catchError((err) => {
        if (
          'error' in err &&
          (err.error as AuthErrorInterface).code === AuthErrorEnumInterface._001
        ) {
          localStorage.setItem(AUTH_ACTIVE_LANG_LOCAL_STORAGE_KEY, lang);
          this.translocoService.setActiveLang(lang);
          this.translocoLocaleService.setLocale(keys[lang]);
          return of(null);
        }
        return throwError(() => err);
      })
    );
  }
}
