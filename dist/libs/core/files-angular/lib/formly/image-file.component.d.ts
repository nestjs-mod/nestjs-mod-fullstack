import { OnInit } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { BehaviorSubject } from 'rxjs';
import { FilesService } from '../services/files.service';
import * as i0 from "@angular/core";
export declare class ImageFileComponent extends FieldType<FieldTypeConfig> implements OnInit {
    private readonly filesService;
    fileList$: BehaviorSubject<NzUploadFile[]>;
    title$: BehaviorSubject<string>;
    icon$: BehaviorSubject<string>;
    constructor(filesService: FilesService);
    ngOnInit(): void;
    onFileListChange(files: NzUploadFile[]): void;
    beforeUpload: (file: NzUploadFile) => boolean;
    private switchToReloadMode;
    private switchToUploadMode;
    static ɵfac: i0.ɵɵFactoryDeclaration<ImageFileComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ImageFileComponent, "image-file", never, {}, {}, never, never, true, never>;
}
