import { Provider } from '@angular/core';
import { UpdateProfileInput } from '@authorizerdev/authorizer-js';
import { TranslocoService } from '@jsverse/transloco';
import {
  AfterUpdateProfileEvent,
  AUTH_CONFIGURATION_TOKEN,
  AuthConfiguration,
  TokensService,
} from '@nestjs-mod-fullstack/auth-angular';
import { FilesService } from '@nestjs-mod-fullstack/files-angular';
import { map, Observable, of } from 'rxjs';

export class AppAuthConfiguration implements AuthConfiguration {
  constructor(
    private readonly filesService: FilesService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService
  ) {}

  getAuthorizationHeaders(): Record<string, string> {
    const lang = this.translocoService.getActiveLang();

    if (!this.tokensService.getAccessToken()) {
      return {
        'Accept-language': lang,
      };
    }
    return {
      Authorization: `Bearer ${this.tokensService.getAccessToken()}`,
      'Accept-language': lang,
    };
  }

  beforeUpdateProfile(
    data: UpdateProfileInput
  ): Observable<UpdateProfileInput> {
    if (data.picture) {
      return this.filesService.getPresignedUrlAndUploadFile(data.picture).pipe(
        map((picture) => {
          return {
            ...data,
            picture,
          };
        })
      );
    }
    return of({ ...data, picture: '' });
  }

  afterUpdateProfile(event: AfterUpdateProfileEvent) {
    if (event.old?.picture && event.new?.picture !== event.old.picture) {
      return this.filesService
        .deleteFile(event.old.picture)
        .pipe(map(() => event.new));
    }
    return of(event.new);
  }
}

export function provideAppAuthConfiguration(): Provider {
  return {
    provide: AUTH_CONFIGURATION_TOKEN,
    useClass: AppAuthConfiguration,
    deps: [FilesService, TranslocoService, TokensService],
  };
}
