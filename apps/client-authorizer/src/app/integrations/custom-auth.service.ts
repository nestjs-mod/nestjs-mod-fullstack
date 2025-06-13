import { Inject, Injectable } from '@angular/core';
import {
  AUTH_CONFIGURATION_TOKEN,
  AuthConfiguration,
  AuthService,
  AuthUpdateProfileInput,
  AuthUser,
  TokensService,
} from '@nestjs-mod-fullstack/auth-afat';
import { FullstackRestSdkAngularService } from '@nestjs-mod-fullstack/fullstack-rest-sdk-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import omit from 'lodash/fp/omit';
import { catchError, map, mergeMap, of } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class CustomAuthService extends AuthService {
  constructor(
    protected readonly fullstackRestSdkAngularService: FullstackRestSdkAngularService,
    protected override readonly tokensService: TokensService,
    @Inject(AUTH_CONFIGURATION_TOKEN)
    protected override readonly authConfiguration: AuthConfiguration
  ) {
    super(tokensService, authConfiguration);
  }

  override setProfile(result: AuthUser | undefined) {
    return this.fullstackRestSdkAngularService
      .getAuthApi()
      .authControllerProfile()
      .pipe(
        catchError(() => of(null)),
        mergeMap((profile) => {
          if (result && profile) {
            result = { ...result, ...profile };
          }
          return super.setProfile(result);
        })
      );
  }

  override updateProfile(
    data: AuthUpdateProfileInput & { timezone: number; lang: string }
  ) {
    const { timezone, lang } = { ...data };
    const profile = omit(['timezone', 'lang'], { ...data });
    return super.updateProfile(profile).pipe(
      mergeMap((result) =>
        this.fullstackRestSdkAngularService
          .getAuthApi()
          .authControllerUpdateProfile({ timezone })
          .pipe(
            map(() => {
              const profile = result ? { ...result, timezone, lang } : result;

              return super.setProfile(profile) as unknown as AuthUser;
            })
          )
      )
    );
  }
}
