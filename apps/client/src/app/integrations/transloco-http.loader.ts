import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { catchError, forkJoin, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private readonly httpClient: HttpClient) {}

  getTranslation(lang: string) {
    return forkJoin({
      translation: this.httpClient
        .get<Translation>(`./assets/i18n/${lang}.json`)
        .pipe(
          catchError(() => {
            return of({});
          })
        ),
      vendor: this.httpClient.get(`./assets/i18n/${lang}.vendor.json`).pipe(
        catchError(() => {
          return of({});
        })
      ),
    }).pipe(
      map(({ translation, vendor }) => {
        const dictionaries = {
          ...translation,
          ...Object.keys(vendor).reduce(
            (all, key) => ({ ...all, ...vendor[key] }),
            {}
          ),
        };

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
