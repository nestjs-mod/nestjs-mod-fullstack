import { Inject, Injectable, InjectionToken } from '@angular/core';
import { FilesRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { PresignedUrls } from '@nestjs-mod-fullstack/app-rest-sdk';
import { Observable, from, map, mergeMap } from 'rxjs';

export const bucketTypes = {
  sounds: {
    ext: ['mp3'],
  },
  video: {
    ext: ['mp4'],
  },
  documents: {
    ext: ['doc', 'docx', 'xls', 'md', 'odt', 'txt', 'xml', 'rtf', 'csv'],
  },
  images: {
    ext: ['jpg', 'jpeg', 'png', 'gif'],
  },
};

export type BucketType = keyof typeof bucketTypes;

export const MINIO_URL = new InjectionToken<string>('MinioURL');

@Injectable({ providedIn: 'root' })
export class FilesService {
  constructor(
    @Inject(MINIO_URL)
    private readonly minioURL: string,
    private readonly filesRestService: FilesRestService
  ) {}

  getBucketType(fileOrDownloadUrl: File | string): BucketType {
    const ext =
      typeof fileOrDownloadUrl === 'string'
        ? this.getFileExtByLink(fileOrDownloadUrl)
        : this.getFileExt(fileOrDownloadUrl);
    const bucketType = Object.entries(bucketTypes)
      .filter(([, options]) => options.ext.includes(ext))
      .map(([name]) => name)[0];
    if (!bucketType) {
      throw new Error(`Uploading files with extension ${ext} is not supported`);
    }
    return bucketType as BucketType;
  }

  getFileExtByLink(fileOrDownloadUrl: string) {
    return fileOrDownloadUrl
      .split('/')
      .slice(-1)[0]
      .split('.')
      .slice(1)
      .join('.')
      .toLowerCase();
  }

  getPresignedUrl(file: File) {
    return from(
      this.filesRestService.filesControllerGetPresignedUrl(
        this.getFileExt(file)
      )
    );
  }

  getFileExt(file: File) {
    return file?.type?.split('/')?.[1].toLowerCase();
  }

  isIOS() {
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

  deleteFile(downloadUrl: string) {
    return from(this.filesRestService.filesControllerDeleteFile(downloadUrl));
  }

  uploadFile({
    file,
    presignedUrls,
  }: {
    file: File;
    presignedUrls: PresignedUrls;
  }) {
    return new Observable<PresignedUrls>((observer) => {
      const outPresignedUrls: PresignedUrls = {
        downloadUrl: this.minioURL + presignedUrls.downloadUrl,
        uploadUrl: this.minioURL + presignedUrls.uploadUrl,
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

  getPresignedUrlAndUploadFile(file: File) {
    return this.getPresignedUrl(file).pipe(
      mergeMap((presignedUrls) => {
        return this.uploadFile({
          file,
          presignedUrls,
        }).pipe(
          map((uploadFileResult) => {
            return {
              file,
              presignedUrls,
              uploadFileResult,
            };
          })
        );
      })
    );
  }
}
