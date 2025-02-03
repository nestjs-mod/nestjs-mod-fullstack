import { Inject, Injectable, InjectionToken } from '@angular/core';
import {
  FilesPresignedUrlsInterface,
  FilesRestService,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { Observable, from, map, mergeMap, of } from 'rxjs';

export const MINIO_URL = new InjectionToken<string>('MinioURL');

@Injectable({ providedIn: 'root' })
export class FilesService {
  constructor(
    @Inject(MINIO_URL)
    private readonly minioURL: string,
    private readonly filesRestService: FilesRestService
  ) {}

  getPresignedUrlAndUploadFile(file: null | undefined | string | File) {
    if (!file) {
      return of('');
    }
    if (typeof file !== 'string') {
      return this.getPresignedUrl(file).pipe(
        mergeMap((presignedUrls) =>
          this.uploadFile({
            file,
            presignedUrls,
          })
        ),
        map((presignedUrls) => presignedUrls.downloadUrl)
      );
    }
    return of(file);
  }

  getPresignedUrl(file: File) {
    return from(
      this.filesRestService.filesControllerGetPresignedUrl(
        this.getFileExt(file)
      )
    );
  }

  uploadFile({
    file,
    presignedUrls,
  }: {
    file: File;
    presignedUrls: FilesPresignedUrlsInterface;
  }) {
    return new Observable<FilesPresignedUrlsInterface>((observer) => {
      const outPresignedUrls: FilesPresignedUrlsInterface = {
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
            } else {
              observer.error(new Error('Error in upload file'));
            }
          }
        };
        xhr.send(file);
      } else {
        observer.next(outPresignedUrls);
        observer.complete();
      }
    });
  }

  deleteFile(downloadUrl: string) {
    return from(this.filesRestService.filesControllerDeleteFile(downloadUrl));
  }

  openTargetURI(uri: string) {
    if (this.isIOS()) {
      document.location.href = uri;
    } else {
      const link = document.createElement('a');
      link.target = '_blank';
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  private getFileExt(file: File) {
    return file?.type?.split('/')?.[1].toLowerCase();
  }

  private isIOS() {
    return (
      [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod',
      ].includes(navigator.platform) ||
      // iPad on iOS 13 detection
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
    );
  }
}
