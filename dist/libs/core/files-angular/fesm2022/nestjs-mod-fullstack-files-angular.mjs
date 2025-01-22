import { AsyncPipe } from '@angular/common';
import * as i0 from '@angular/core';
import { InjectionToken, Injectable, Inject, Component, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import * as i2 from 'ng-zorro-antd/button';
import { NzButtonModule } from 'ng-zorro-antd/button';
import * as i6 from 'ng-zorro-antd/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import * as i5 from 'ng-zorro-antd/upload';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { of, mergeMap, map, from, Observable, BehaviorSubject } from 'rxjs';
import * as i1 from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { TranslocoPipe } from '@jsverse/transloco';
import * as i3 from 'ng-zorro-antd/core/transition-patch';
import * as i4 from 'ng-zorro-antd/core/wave';

const MINIO_URL = new InjectionToken('MinioURL');
class FilesService {
    minioURL;
    filesRestService;
    constructor(minioURL, filesRestService) {
        this.minioURL = minioURL;
        this.filesRestService = filesRestService;
    }
    getPresignedUrlAndUploadFile(file) {
        if (!file) {
            return of('');
        }
        if (typeof file !== 'string') {
            return this.getPresignedUrl(file).pipe(mergeMap((presignedUrls) => this.uploadFile({
                file,
                presignedUrls,
            })), map((presignedUrls) => presignedUrls.downloadUrl));
        }
        return of(file);
    }
    getPresignedUrl(file) {
        return from(this.filesRestService.filesControllerGetPresignedUrl(this.getFileExt(file)));
    }
    uploadFile({ file, presignedUrls, }) {
        return new Observable((observer) => {
            const outPresignedUrls = {
                downloadUrl: presignedUrls.downloadUrl,
                uploadUrl: presignedUrls.uploadUrl,
            };
            if (presignedUrls.uploadUrl) {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', outPresignedUrls.uploadUrl);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            observer.next(outPresignedUrls);
                            observer.complete();
                        }
                        else {
                            observer.error(new Error('Error in upload file'));
                        }
                    }
                };
                xhr.send(file);
            }
            else {
                observer.next(outPresignedUrls);
                observer.complete();
            }
        });
    }
    deleteFile(downloadUrl) {
        return from(this.filesRestService.filesControllerDeleteFile(downloadUrl));
    }
    openTargetURI(uri) {
        if (this.isIOS()) {
            document.location.href = uri;
        }
        else {
            const link = document.createElement('a');
            link.target = '_blank';
            link.href = uri;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
    getFileExt(file) {
        return file?.type?.split('/')?.[1].toLowerCase();
    }
    isIOS() {
        return ([
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod',
        ].includes(navigator.platform) ||
            // iPad on iOS 13 detection
            (navigator.userAgent.includes('Mac') && 'ontouchend' in document));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: FilesService, deps: [{ token: MINIO_URL }, { token: i1.FilesRestService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: FilesService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: FilesService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MINIO_URL]
                }] }, { type: i1.FilesRestService }] });

class ImageFileComponent extends FieldType {
    filesService;
    fileList$ = new BehaviorSubject([]);
    title$ = new BehaviorSubject('');
    icon$ = new BehaviorSubject('');
    constructor(filesService) {
        super();
        this.filesService = filesService;
    }
    ngOnInit() {
        if (this.formControl.value) {
            this.switchToReloadMode();
            this.fileList$.next([
                {
                    uid: this.formControl.value,
                    name: this.formControl.value.split('/').at(-1),
                    status: 'done',
                    url: this.formControl.value,
                },
            ]);
        }
        else {
            this.switchToUploadMode();
        }
    }
    onFileListChange(files) {
        if (files.length === 0) {
            this.formControl.setValue(null);
            this.fileList$.next([]);
            this.switchToUploadMode();
        }
    }
    beforeUpload = (file) => {
        this.formControl.setValue(file);
        this.switchToReloadMode();
        this.fileList$.next([file]);
        return false;
    };
    switchToReloadMode() {
        this.icon$.next('reload');
        this.title$.next(marker('files.image-file.change-file'));
    }
    switchToUploadMode() {
        this.icon$.next('upload');
        this.title$.next(marker('files.image-file.select-file'));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: ImageFileComponent, deps: [{ token: FilesService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.0.5", type: ImageFileComponent, isStandalone: true, selector: "image-file", usesInheritance: true, ngImport: i0, template: `
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
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: ReactiveFormsModule }, { kind: "ngmodule", type: FormlyModule }, { kind: "ngmodule", type: NzInputModule }, { kind: "ngmodule", type: NzButtonModule }, { kind: "component", type: i2.NzButtonComponent, selector: "button[nz-button], a[nz-button]", inputs: ["nzBlock", "nzGhost", "nzSearch", "nzLoading", "nzDanger", "disabled", "tabIndex", "nzType", "nzShape", "nzSize"], exportAs: ["nzButton"] }, { kind: "directive", type: i3.ɵNzTransitionPatchDirective, selector: "[nz-button], nz-button-group, [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group", inputs: ["hidden"] }, { kind: "directive", type: i4.NzWaveDirective, selector: "[nz-wave],button[nz-button]:not([nzType=\"link\"]):not([nzType=\"text\"])", inputs: ["nzWaveExtraNode"], exportAs: ["nzWave"] }, { kind: "ngmodule", type: NzUploadModule }, { kind: "component", type: i5.NzUploadComponent, selector: "nz-upload", inputs: ["nzType", "nzLimit", "nzSize", "nzFileType", "nzAccept", "nzAction", "nzDirectory", "nzOpenFileDialogOnClick", "nzBeforeUpload", "nzCustomRequest", "nzData", "nzFilter", "nzFileList", "nzDisabled", "nzHeaders", "nzListType", "nzMultiple", "nzName", "nzShowUploadList", "nzShowButton", "nzWithCredentials", "nzRemove", "nzPreview", "nzPreviewFile", "nzPreviewIsImage", "nzTransformFile", "nzDownload", "nzIconRender", "nzFileListRender"], outputs: ["nzChange", "nzFileListChange"], exportAs: ["nzUpload"] }, { kind: "ngmodule", type: NzModalModule }, { kind: "ngmodule", type: NzIconModule }, { kind: "directive", type: i6.NzIconDirective, selector: "nz-icon,[nz-icon]", inputs: ["nzSpin", "nzRotate", "nzType", "nzTheme", "nzTwotoneColor", "nzIconfont"], exportAs: ["nzIcon"] }, { kind: "pipe", type: AsyncPipe, name: "async" }, { kind: "pipe", type: TranslocoPipe, name: "transloco" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.0.5", ngImport: i0, type: ImageFileComponent, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], ctorParameters: () => [{ type: FilesService }] });

const FILES_FORMLY_FIELDS = [
    {
        name: 'image-file',
        component: ImageFileComponent,
        extends: 'input',
    },
];

/**
 * Generated bundle index. Do not edit.
 */

export { FILES_FORMLY_FIELDS, FilesService, ImageFileComponent, MINIO_URL };
//# sourceMappingURL=nestjs-mod-fullstack-files-angular.mjs.map
