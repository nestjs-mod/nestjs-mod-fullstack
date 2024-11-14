import { Inject, Provider } from '@angular/core';
import { UpdateProfileInput } from '@authorizerdev/authorizer-js';
import { FilesRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import {
  AUTH_CONFIGURATION_TOKEN,
  AuthConfiguration,
} from '@nestjs-mod-fullstack/auth-angular';
import { FilesService, MINIO_URL } from '@nestjs-mod-fullstack/files-angular';
import { map, mergeMap, Observable, of } from 'rxjs';

export class AppAuthConfiguration implements AuthConfiguration {
  constructor(
    @Inject(MINIO_URL)
    private readonly minioURL: string,
    private readonly filesRestService: FilesRestService,
    private readonly filesService: FilesService
  ) {}

  beforeUpdateProfile(
    data: UpdateProfileInput
  ): Observable<UpdateProfileInput> {
    if (data.picture) {
      return this.uploadFile(data.picture).pipe(
        map((picture) => {
          return {
            ...data,
            picture,
          };
        })
      );
    }
    return of(data);
  }

  private uploadFile(file: null | undefined | string | File) {
    if (!file) {
      return of('');
    }
    if (typeof file !== 'string') {
      return this.filesRestService
        .filesControllerGetPresignedUrl(this.filesService.getFileExt(file))
        .pipe(
          mergeMap((presignedUrls) =>
            this.filesService.uploadFile({
              file,
              presignedUrls,
            })
          ),
          map((presignedUrls) =>
            presignedUrls.downloadUrl.replace(this.minioURL, '')
          )
        );
    }
    return of(file.replace(this.minioURL, ''));
  }
}

export function provideAppAuthConfiguration(): Provider {
  return {
    provide: AUTH_CONFIGURATION_TOKEN,
    useClass: AppAuthConfiguration,
    deps: [MINIO_URL, FilesRestService, FilesService],
  };
}
