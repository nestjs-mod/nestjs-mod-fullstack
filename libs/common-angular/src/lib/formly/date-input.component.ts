import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoService } from '@jsverse/transloco';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { map, Observable } from 'rxjs';
import { DATE_INPUT_FORMATS } from '../constants/date-input-formats';
import { ActiveLangService } from '../services/active-lang.service';

@Component({
  selector: 'date-input',
  standalone: true,
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
})
export class DateInputComponent extends FieldType<FieldTypeConfig> {
  format$: Observable<string>;

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly activeLangService: ActiveLangService
  ) {
    super();
    this.format$ = translocoService.langChanges$.pipe(
      map((lang) => {
        const { locale } = this.activeLangService.normalizeLangKey(lang);
        return DATE_INPUT_FORMATS[locale]
          ? DATE_INPUT_FORMATS[locale]
          : 'yyyy-MM-dd HH:mm:ss';
      })
    );
  }
}
