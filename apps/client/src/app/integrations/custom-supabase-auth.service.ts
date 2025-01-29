import { Inject, Injectable } from '@angular/core';
import { AuthRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import {
  AUTH_CONFIGURATION_TOKEN,
  AuthConfiguration,
  AuthLoginInput,
  AuthService,
  AuthSignupInput,
  AuthUpdateProfileInput,
  AuthUser,
  TokensService,
} from '@nestjs-mod-fullstack/auth-angular';
import {
  mapAuthError,
  mapAuthResponse,
  mapAuthTokenResponsePassword,
  mapUserResponse,
  SupabaseService,
} from '@nestjs-mod-fullstack/common-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { catchError, from, map, mergeMap, of } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class CustomSupabaseAuthService extends AuthService {
  constructor(
    protected readonly supabaseService: SupabaseService,
    protected readonly authRestService: AuthRestService,
    protected override readonly tokensService: TokensService,
    @Inject(AUTH_CONFIGURATION_TOKEN)
    protected override readonly authConfiguration: AuthConfiguration
  ) {
    super(tokensService, authConfiguration);
  }

  override signUp(data: AuthSignupInput) {
    if (!data.email) {
      throw new Error('data.email not set');
    }
    return from(
      this.supabaseService.auth.signUp({
        email: data.email.toLowerCase(),
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })
    ).pipe(
      mapAuthResponse(),
      mergeMap((result) => {
        if (!result.session) {
          throw new Error('result.session not set');
        }
        if (!result.user) {
          throw new Error('result.user not set');
        }
        if (!result.user.email) {
          throw new Error('result.user.email not set');
        }
        const tokens = {
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        };
        const user = {
          email: result.user.email,
          id: result.user.id,
          preferred_username: 'empty',
          roles: ['user'],
          picture: result.user.user_metadata['picture'],
        };
        return this.setProfileAndTokens({
          tokens,
          user,
        }).pipe(
          map((profile) => ({
            tokens,
            profile,
          }))
        );
      })
    );
  }

  fullUpdateProfile(data: AuthUpdateProfileInput) {
    const oldProfile = this.profile$.value;
    return (
      this.authConfiguration?.beforeUpdateProfile
        ? this.authConfiguration.beforeUpdateProfile(data)
        : of(data)
    ).pipe(
      mergeMap((data) =>
        from(
          this.supabaseService.auth.updateUser({
            data: { ...data.app_data, picture: data.picture },
            email: data.email,
            password: data.new_password,
            phone: data.phone_number,
          })
        )
      ),
      mapUserResponse(),
      mergeMap((result) => {
        if (!result.user) {
          throw new Error('result.user not set');
        }
        if (!result.user.email) {
          throw new Error('result.user.email not set');
        }
        return this.setProfile({
          email: result.user.email,
          id: result.user.id,
          preferred_username: 'empty',
          roles: ['user'],
          picture: result.user.user_metadata['picture'],
        });
      }),
      mergeMap((updatedProfile) =>
        this.authConfiguration?.afterUpdateProfile
          ? this.authConfiguration.afterUpdateProfile({
              new: updatedProfile,
              old: oldProfile,
            })
          : of({
              new: updatedProfile,
            })
      )
    );
  }

  override signIn(data: AuthLoginInput) {
    if (!data.email) {
      throw new Error('data.email not set');
    }
    return from(
      this.supabaseService.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
    ).pipe(
      mapAuthTokenResponsePassword(),
      mergeMap((result) => {
        if (!result.session) {
          throw new Error('result.session not set');
        }
        if (!result.user) {
          throw new Error('result.user not set');
        }
        if (!result.user.email) {
          throw new Error('result.user.email not set');
        }
        const tokens = {
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        };
        const user = {
          email: result.user.email,
          email_verified: true,
          id: result.user.id,
          preferred_username: 'empty',
          signup_methods: 'empty',
          created_at: +new Date(result.user.created_at),
          updated_at: result.user.updated_at
            ? +new Date(result.user.updated_at)
            : 0,
          roles: ['user'],
          picture: result.user.user_metadata['picture'],
        };
        return this.setProfileAndTokens({ tokens, user }).pipe(
          map((profile) => ({
            profile,
            tokens,
          }))
        );
      })
    );
  }

  override signOut() {
    return from(this.supabaseService.auth.signOut({ scope: 'local' })).pipe(
      mapAuthError(),
      mergeMap(() => {
        return this.clearProfileAndTokens();
      })
    );
  }

  override refreshToken() {
    const refreshToken = this.tokensService.getRefreshToken();
    if (!refreshToken) {
      return of(this.profile$.value);
    }
    return from(
      this.supabaseService.auth.refreshSession({
        refresh_token: refreshToken,
      })
    ).pipe(
      mapAuthResponse(),
      mergeMap((result) => {
        if (!result.session) {
          throw new Error('result.session not set');
        }
        if (!result.user) {
          throw new Error('result.user not set');
        }
        if (!result.user.email) {
          throw new Error('result.user.email not set');
        }
        return this.setProfileAndTokens({
          tokens: {
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          },
          user: {
            email: result.user.email,
            id: result.user.id,
            preferred_username: 'empty',
            roles: ['user'],
            picture: result.user.user_metadata['picture'],
          },
        });
      }),
      catchError((err) => {
        console.error(err);
        return this.clearProfileAndTokens();
      })
    );
  }

  override setProfile(result: AuthUser | undefined) {
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

  override updateProfile(data: AuthUpdateProfileInput & { timezone: number }) {
    const { timezone, ...profile } = data;
    return this.fullUpdateProfile(profile).pipe(
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
