import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { BehaviorSubject } from 'rxjs';
import { MINIO_URL } from '../services/files.service';

@Component({
  selector: 'file-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      type="hidden"
      [formControl]="formControl"
      [formlyAttributes]="field"
    />
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
        {{ title$ | async }}
      </button>
    </nz-upload>
  `,
})
export class FileSelectComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  fileList$ = new BehaviorSubject<NzUploadFile[]>([]);
  title$ = new BehaviorSubject<string>('');
  icon$ = new BehaviorSubject<string>('');

  constructor(
    @Inject(MINIO_URL)
    private readonly minioURL: string
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.formControl.value) {
      this.switchToReloadMode();
      this.fileList$.next([
        {
          uid: this.formControl.value,
          name: this.formControl.value.split('/').at(-1),
          status: 'done',
          url: this.minioURL + this.formControl.value,
        },
      ]);
    } else {
      this.switchToUploadMode();
    }
  }

  onFileListChange(files: NzUploadFile[]) {
    if (files.length === 0) {
      this.fileList$.next([]);
      this.switchToUploadMode();
    }
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    // console.log(file);
    this.formControl.setValue(file);
    this.switchToReloadMode();
    this.fileList$.next([file]);
    return false;
  };

  private switchToReloadMode() {
    this.icon$.next('reload');
    this.title$.next('Change file');
  }

  private switchToUploadMode() {
    this.icon$.next('upload');
    this.title$.next('Select file...');
  }
}
