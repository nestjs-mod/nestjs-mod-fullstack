import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { catchError, forkJoin, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private readonly httpClient: HttpClient) {}

  getTranslation(lang: string) {
    lang = lang.split('-')[0];
    return forkJoin({
      translation: this.httpClient
        .get<Translation>(`./assets/i18n/${lang}.json`)
        .pipe(
          catchError(() => {
            return of({});
          })
        ),
      vendors: this.httpClient
        .get<Record<string, Translation>>(`./assets/i18n/${lang}.vendor.json`)
        .pipe(
          catchError(() => {
            return of({});
          })
        ),
      nestjsModAfat: this.httpClient
        .get<Record<string, Translation>>(
          `./assets/i18n/nestjs-mod-afat/${lang}.json`
        )
        .pipe(
          catchError(() => {
            return of({});
          })
        ),
    }).pipe(
      map(({ translation, vendors, nestjsModAfat }) => {
        const dictionaries: Record<string, string> = {
          ...translation,
          ...nestjsModAfat,
        };
        for (const [, vendorValue] of Object.entries(vendors)) {
          for (const [key, value] of Object.entries(vendorValue)) {
            dictionaries[key] = dictionaries[key] || value;
          }
        }

        for (const key in dictionaries) {
          if (Object.prototype.hasOwnProperty.call(dictionaries, key)) {
            const value = dictionaries[key];
            if (!value && value !== 'empty') {
              delete dictionaries[key];
            }
          }
        }
        return dictionaries;
      })
    );
  }
}
