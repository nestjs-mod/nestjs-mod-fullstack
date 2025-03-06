import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { BehaviorSubject } from 'rxjs';
import { FilesService } from '../services/files.service';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'image-file',
  imports: [
    ReactiveFormsModule,
    FormlyModule,
    NzInputModule,
    NzButtonModule,
    NzUploadModule,
    NzModalModule,
    NzIconModule,
    AsyncPipe,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-upload
      [nzAccept]="'image/png, image/jpeg'"
      [nzListType]="'picture'"
      [nzFileList]="(fileList$ | async)!"
      (nzFileListChange)="onFileListChange($event)"
      [nzLimit]="1"
      [nzBeforeUpload]="beforeUpload"
    >
      <button nz-button type="button">
        <span nz-icon [nzType]="(icon$ | async)!"></span>
        {{ title$ | async | transloco }}
      </button>
    </nz-upload>
  `,
})
export class ImageFileComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  fileList$ = new BehaviorSubject<NzUploadFile[]>([]);
  title$ = new BehaviorSubject<string>('');
  icon$ = new BehaviorSubject<string>('');

  constructor(private readonly filesService: FilesService) {
    super();
  }

  ngOnInit(): void {
    if (this.formControl.value) {
      this.switchToReloadMode();
      if (!this.formControl.value.split) {
        throw new Error('File not uploaded!');
      }
      this.fileList$.next([
        {
          uid: this.formControl.value,
          name: this.formControl.value.split('/').at(-1),
          status: 'done',
          url:
            (!this.formControl.value.toLowerCase().startsWith('http')
              ? this.filesService.getMinioURL()
              : '') + this.formControl.value,
        },
      ]);
    } else {
      this.switchToUploadMode();
    }
  }

  onFileListChange(files: NzUploadFile[]) {
    if (files.length === 0) {
      this.formControl.setValue(null);
      this.fileList$.next([]);
      this.switchToUploadMode();
    }
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.formControl.setValue(file);
    this.switchToReloadMode();
    this.fileList$.next([file]);
    return false;
  };

  private switchToReloadMode() {
    this.icon$.next('reload');
    this.title$.next(marker('files.image-file.change-file'));
  }

  private switchToUploadMode() {
    this.icon$.next('upload');
    this.title$.next(marker('files.image-file.select-file'));
  }
}
