import { Inject, Injectable, Optional } from '@angular/core';
import { UpdateProfileInput, User } from '@authorizerdev/authorizer-js';
import { AuthRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import {
  AUTH_CONFIGURATION_TOKEN,
  AuthConfiguration,
  AuthorizerService,
  AuthService,
  TokensService,
} from '@nestjs-mod-fullstack/auth-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { catchError, map, mergeMap, of } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class CustomAuthService extends AuthService {
  constructor(
    protected readonly authRestService: AuthRestService,
    protected override readonly tokensService: TokensService,
    @Optional()
    @Inject(AUTH_CONFIGURATION_TOKEN)
    protected override readonly authConfiguration?: AuthConfiguration,
    @Optional()
    protected override readonly authorizerService?: AuthorizerService
  ) {
    super(tokensService, authConfiguration, authorizerService);
  }

  override setProfile(result: User | undefined) {
    return this.authRestService.authControllerProfile().pipe(
      catchError(() => of(null)),
      mergeMap((profile) => {
        if (result && profile) {
          Object.assign(result, profile);
        }
        return super.setProfile(result);
      })
    );
  }

  override updateProfile(data: UpdateProfileInput & { timezone: number }) {
    const { timezone, ...profile } = data;
    return super.updateProfile(profile).pipe(
      mergeMap((result) =>
        this.authRestService.authControllerUpdateProfile({ timezone }).pipe(
          map(() => {
            if (result) {
              Object.assign(result, { timezone });
            }
            return result;
          })
        )
      )
    );
  }
}
