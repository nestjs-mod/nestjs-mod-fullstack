import { InjectionToken } from '@angular/core';
import { FilesRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { PresignedUrls } from '@nestjs-mod-fullstack/app-rest-sdk';
import { Observable } from 'rxjs';
import * as i0 from '@angular/core';
export declare const MINIO_URL: InjectionToken<string>;
export declare class FilesService {
  private readonly minioURL;
  private readonly filesRestService;
  constructor(minioURL: string, filesRestService: FilesRestService);
  getPresignedUrlAndUploadFile(
    file: null | undefined | string | File
  ): Observable<string>;
  getPresignedUrl(
    file: File
  ): Observable<
    import('@nestjs-mod-fullstack/app-angular-rest-sdk').PresignedUrlsInterface
  >;
  uploadFile({
    file,
    presignedUrls,
  }: {
    file: File;
    presignedUrls: PresignedUrls;
  }): Observable<PresignedUrls>;
  deleteFile(
    downloadUrl: string
  ): Observable<
    import('@nestjs-mod-fullstack/app-angular-rest-sdk').StatusResponseInterface
  >;
  openTargetURI(uri: string): void;
  private getFileExt;
  private isIOS;
  static ɵfac: i0.ɵɵFactoryDeclaration<FilesService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<FilesService>;
}
