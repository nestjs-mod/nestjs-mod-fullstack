import { TypeOption } from '@ngx-formly/core/lib/models';
import { DateInputComponent } from './date-input.component';

export const COMMON_FORMLY_FIELDS: TypeOption[] = [
  {
    name: 'date-input',
    component: DateInputComponent,
    extends: 'input',
  },
];
