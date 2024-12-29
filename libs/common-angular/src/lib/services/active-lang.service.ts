import { Inject, Injectable } from '@angular/core';
import { toCamelCase, TranslocoService } from '@jsverse/transloco';
import {
  LangToLocaleMapping,
  TRANSLOCO_LOCALE_LANG_MAPPING,
  TranslocoLocaleService,
} from '@jsverse/transloco-locale';
import * as dateFnsLocales from 'date-fns/locale';
import * as ngZorroLocales from 'ng-zorro-antd/i18n';
import { NzI18nService } from 'ng-zorro-antd/i18n';

@Injectable({ providedIn: 'root' })
export class ActiveLangService {
  constructor(
    private readonly translocoService: TranslocoService,
    private readonly translocoLocaleService: TranslocoLocaleService,
    private readonly nzI18nService: NzI18nService,
    @Inject(TRANSLOCO_LOCALE_LANG_MAPPING)
    readonly langToLocaleMapping: LangToLocaleMapping
  ) {}

  applyActiveLang(lang: string) {
    const { locale, localeInSnakeCase, localeInCamelCase } =
      this.normalizeLangKey(lang);

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

  normalizeLangKey(lang: string) {
    const locale = this.langToLocaleMapping[lang];
    const localeInCamelCase = toCamelCase(locale);
    const localeInSnakeCase = locale.split('-').join('_');
    return { locale, localeInSnakeCase, localeInCamelCase };
  }
}
