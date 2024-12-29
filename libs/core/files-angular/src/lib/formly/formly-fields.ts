import { TypeOption } from '@ngx-formly/core/lib/models';
import { ImageFileComponent } from './image-file.component';

export const FILES_FORMLY_FIELDS: TypeOption[] = [
  {
    name: 'image-file',
    component: ImageFileComponent,
    extends: 'input',
  },
];
