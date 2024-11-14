import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { FileSelectComponent } from './file-select.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule,
    NzInputModule,
    NzButtonModule,
    NzUploadModule,
    NzModalModule,
    NzIconModule,
  ],
  declarations: [FileSelectComponent],
  exports: [FileSelectComponent],
})
export class FilesFormlyModule {}
