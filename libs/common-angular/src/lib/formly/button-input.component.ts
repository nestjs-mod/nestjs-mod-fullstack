import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

import { NzButtonModule } from 'ng-zorro-antd/button';
@Component({
  selector: 'button-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormlyModule,
    NzDatePickerModule,
    NzButtonModule,
  ],
  template: `
    <button
      nz-button
      [type]="props['type']"
      [nzType]="props['btnType']"
      (click)="onClick($event)"
    >
      {{ props['text'] }}
    </button>
  `,
})
export class ButtonInputComponent extends FieldType<FieldTypeConfig> {
  onClick($event: Event) {
    if (this.props['onClick']) {
      this.props['onClick']($event);
    }
  }
}
