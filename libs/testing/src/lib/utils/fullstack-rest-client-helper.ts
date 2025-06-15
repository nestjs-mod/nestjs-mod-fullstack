import { AuthToken, Authorizer } from '@authorizerdev/authorizer-js';
import {
  AuthProfileDto,
  AuthRole,
  AuthorizerApi,
  Configuration,
  FakeEndpointApi,
  FullstackRestSdkService,
  WebhookUser,
} from '@nestjs-mod-fullstack/fullstack-rest-sdk';
import axios, { AxiosInstance } from 'axios';
import { Observable, finalize } from 'rxjs';
import {
  GenerateRandomUserResult,
  generateRandomUser,
} from './generate-random-user';
import { getUrls } from './get-urls';

import { SsoRestSdkService, TokensResponse } from '@nestjs-mod/sso-rest-sdk';
import { AuthResponse } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { TestingSupabaseService } from './supabase.service';
import { WebhookRestSdkService } from '@nestjs-mod/webhook';
import { FilesRestSdkService } from '@nestjs-mod/files';

export class FullstackRestClientHelper<
  T extends 'strict' | 'no_strict' = 'strict',
> {
  private authorizerClientID!: string;

  ssoTokens?: TokensResponse;
  authorizationTokens?: AuthToken;
  authData?: AuthResponse['data'];

  private webhookProfile?: WebhookUser;
  private authProfile?: AuthProfileDto;

  private authorizer?: Authorizer;

  private testingSupabaseService?: TestingSupabaseService;

  private ssoApi?: SsoRestSdkService;
  private authorizerApi?: AuthorizerApi;
  private fakeEndpointApi?: FakeEndpointApi;

  private authorizerApiAxios?: AxiosInstance;
  private fakeEndpointApiAxios?: AxiosInstance;

  private fullstackRestSdkService!: FullstackRestSdkService;
  private webhookRestSdkService!: WebhookRestSdkService;
  private filesRestSdkService!: FilesRestSdkService;

  randomUser: T extends 'strict'
    ? GenerateRandomUserResult
    : GenerateRandomUserResult | undefined;

  constructor(
    private readonly options?: {
      serverUrl?: string;
      ssoUrl?: string;
      authorizerURL?: string;
      supabaseUrl?: string;
      supabaseKey?: string;
      randomUser?: GenerateRandomUserResult;
      activeLang?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      headers?: any;
    },
  ) {
    this.randomUser = options?.randomUser as GenerateRandomUserResult;
    this.createApiClients();
    this.setAuthorizationHeadersFromAuthorizationTokens();
  }

  getWebhookProfile() {
    return this.webhookProfile;
  }

  getAuthProfile() {
    return this.authProfile;
  }

  getGeneratedRandomUser(): Required<GenerateRandomUserResult> {
    if (!this.randomUser) {
      throw new Error('this.randomUser not set');
    }
    return this.randomUser as Required<GenerateRandomUserResult>;
  }

  webSocket<T>({
    path,
    eventName,
    options,
  }: {
    path: string;
    eventName: string;
    options?: WebSocket.ClientOptions;
  }) {
    const headers = {
      ...(options?.headers || {}),
      ...this.getAuthorizationHeaders(),
    };
    const wss = new WebSocket(
      this.getServerUrl().replace('/api', '').replace('http', 'ws') + path,
      {
        ...(options || {}),
        headers,
      },
    );
    return new Observable<{ data: T; event: string }>((observer) => {
      wss.on('open', () => {
        wss.on('message', (data) => {
          observer.next(JSON.parse(data.toString()));
        });
        wss.on('error', (err) => {
          observer.error(err);
          if (wss?.readyState == WebSocket.OPEN) {
            wss.close();
          }
        });
        wss.send(
          JSON.stringify({
            event: eventName,
            data: true,
          }),
        );
      });
    }).pipe(
      finalize(() => {
        if (wss?.readyState == WebSocket.OPEN) {
          wss.close();
        }
      }),
    );
  }

  getAuthorizerApi() {
    if (!this.authorizerApi) {
      throw new Error('authorizerApi not set');
    }
    return this.authorizerApi;
  }

  getAppApi() {
    return this.fullstackRestSdkService.getAppApi();
  }

  getTimeApi() {
    return this.fullstackRestSdkService.getTimeApi();
  }

  getAuthApi() {
    return this.fullstackRestSdkService.getAuthApi();
  }

  getWebhookApi() {
    return this.webhookRestSdkService.getWebhookApi();
  }

  getFilesApi() {
    return this.filesRestSdkService.getFilesApi();
  }

  async getSsoClient() {
    const ssoUrl = this.getSsoUrl();
    if (!this.ssoApi && ssoUrl) {
      this.ssoApi = new SsoRestSdkService({
        serverUrl: ssoUrl,
        headers: {
          'x-skip-throttle': process.env['SERVER_SSO_ADMIN_SECRET'] || '',
        },
      });
    }
    return this.ssoApi;
  }

  async getAuthorizerClient() {
    const authorizerURL = this.getAuthorizerUrl();
    if (!this.authorizerClientID && this.authorizerApi && authorizerURL) {
      this.authorizerClientID = (
        await this.authorizerApi.authorizerControllerGetAuthorizerClientID()
      ).data.clientID;

      this.authorizer = new Authorizer({
        authorizerURL,
        clientID: this.authorizerClientID,
        redirectURL: this.getServerUrl(),
      });
    }
    return this.authorizer;
  }

  async setRoles(userId: string, role: AuthRole) {
    await this.getAuthApi().authUsersControllerUpdateOne(userId, {
      userRole: role,
    });

    return this;
  }

  getFakeEndpointApi() {
    if (!this.fakeEndpointApi) {
      throw new Error('fakeEndpointApi not set');
    }
    return this.fakeEndpointApi;
  }

  async getSupabaseClient() {
    const supabaseUrl = this.getSupabaseUrl();
    const supabaseKey = this.getSupabaseKey();
    if (!supabaseUrl || !supabaseKey) {
      return null;
    }
    if (!this.testingSupabaseService) {
      this.testingSupabaseService = new TestingSupabaseService(
        supabaseUrl,
        supabaseKey,
      );
    }
    return this.testingSupabaseService;
  }

  async createAndLoginAsUser(
    options?: Pick<GenerateRandomUserResult, 'email' | 'password'>,
  ) {
    await this.generateRandomUser(options);
    await this.reg();
    await this.login(options);

    return this;
  }

  async generateRandomUser(
    options?: Pick<GenerateRandomUserResult, 'email' | 'password'> | undefined,
  ) {
    if (!this.randomUser || options) {
      this.randomUser = await generateRandomUser(undefined, options);
    }

    return this;
  }

  async reg() {
    if (!this.randomUser) {
      this.randomUser = await generateRandomUser();
    }
    const supabaseClient = await this.getSupabaseClient();
    const authorizerClient = await this.getAuthorizerClient();
    const ssoClient = await this.getSsoClient();

    if (supabaseClient) {
      const signUpResult = await supabaseClient.auth.signUp({
        email: this.randomUser.email,
        password: this.randomUser.password,
      });

      if (signUpResult.error) {
        throw new Error(signUpResult.error.message);
      }

      this.authData = signUpResult.data;
    }

    if (authorizerClient) {
      this.authorizationTokens = (
        await authorizerClient.signup({
          email: this.randomUser.email,
          confirm_password: this.randomUser.password,
          password: this.randomUser.password,
        })
      ).data;
    }

    if (ssoClient) {
      this.ssoTokens = (
        await ssoClient.getSsoApi().ssoControllerSignUp({
          email: this.randomUser.email,
          confirmPassword: this.randomUser.password,
          password: this.randomUser.password,
          fingerprint: 'fingerprint',
        })
      ).data;
    }

    this.setAuthorizationHeadersFromAuthorizationTokens();

    await this.loadProfile();

    return this;
  }

  async login(
    options?: Partial<
      Pick<GenerateRandomUserResult, 'id' | 'email' | 'password'>
    >,
  ) {
    if (!this.randomUser) {
      this.randomUser = await generateRandomUser();
    }
    const loginOptions = {
      email: options?.email || this.randomUser.email,
      password: options?.password || this.randomUser.password,
      id: options?.id || this.randomUser.id,
    };

    const supabaseClient = await this.getSupabaseClient();
    const authorizerClient = await this.getAuthorizerClient();
    const ssoClient = await this.getSsoClient();

    if (supabaseClient) {
      const loginResult = await supabaseClient.auth.signInWithPassword({
        email: loginOptions.email,
        password: loginOptions.password,
      });

      if (loginResult.error) {
        throw new Error(loginResult.error.message);
      }

      this.authData = loginResult.data;

      this.setAuthorizationHeadersFromAuthorizationTokens();

      await this.loadProfile();

      return this;
    }

    if (authorizerClient) {
      const loginResult = await authorizerClient.login({
        email: loginOptions.email,
        password: loginOptions.password,
      });

      if (loginResult.errors.length) {
        throw new Error(loginResult.errors[0].message);
      }

      this.authorizationTokens = loginResult.data;

      this.setAuthorizationHeadersFromAuthorizationTokens();

      await this.loadProfile();

      return this;
    }

    if (ssoClient) {
      const loginResult = await ssoClient.getSsoApi().ssoControllerSignIn({
        email: loginOptions.email,
        password: loginOptions.password,
        fingerprint: 'fingerprint',
      });

      this.ssoTokens = loginResult.data;

      this.setAuthorizationHeadersFromAuthorizationTokens();

      // await this.loadProfile();

      return this;
    }

    throw new Error('Fatal');
  }

  private async loadProfile() {
    this.webhookProfile = (
      await this.webhookRestSdkService
        .getWebhookApi()
        .webhookControllerProfile()
    ).data;

    this.authProfile = (await this.getAuthApi().authControllerProfile()).data;
  }

  private setAuthorizationHeadersFromAuthorizationTokens() {
    this.fullstackRestSdkService.updateHeaders(this.getAuthorizationHeaders());
    this.webhookRestSdkService.updateHeaders(this.getAuthorizationHeaders());
    this.filesRestSdkService.updateHeaders(this.getAuthorizationHeaders());

    if (this.authorizerApiAxios) {
      Object.assign(
        this.authorizerApiAxios.defaults.headers.common,
        this.getAuthorizationHeaders(),
      );
    }
    if (this.fakeEndpointApiAxios) {
      Object.assign(
        this.fakeEndpointApiAxios.defaults.headers.common,
        this.getAuthorizationHeaders(),
      );
    }
  }

  async logout() {
    const supabaseClient = await this.getSupabaseClient();
    const authorizerClient = await this.getAuthorizerClient();

    if (supabaseClient) {
      await supabaseClient.auth.signOut({ scope: 'local' });
    }

    if (authorizerClient) {
      await authorizerClient.logout(
        this.getAuthorizationHeaders().Authorization
          ? {
              Authorization: this.getAuthorizationHeaders().Authorization,
            }
          : {},
      );
    }

    return this;
  }

  getAuthorizationHeaders() {
    const accessToken = this.getAccessToken();
    return {
      ...this.options?.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(this.options?.activeLang
        ? { ['Accept-Language']: this.options?.activeLang }
        : {}),
    };
  }

  getAccessToken() {
    return (
      this.authData?.session?.access_token ||
      this.authorizationTokens?.access_token ||
      this.ssoTokens?.accessToken
    );
  }

  private createApiClients() {
    this.fullstackRestSdkService = new FullstackRestSdkService({
      ...this.options,
      serverUrl: this.getServerUrl(),
    });
    this.webhookRestSdkService = new WebhookRestSdkService({
      ...this.options,
      serverUrl: this.getServerUrl(),
    });
    this.filesRestSdkService = new FilesRestSdkService({
      ...this.options,
      serverUrl: this.getServerUrl(),
    });

    //

    this.authorizerApiAxios = axios.create();
    this.authorizerApi = new AuthorizerApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.authorizerApiAxios,
    );

    //

    this.fakeEndpointApiAxios = axios.create();
    this.fakeEndpointApi = new FakeEndpointApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.fakeEndpointApiAxios,
    );
  }

  private getServerUrl(): string {
    return this.options?.serverUrl || getUrls().serverUrl;
  }

  private getSsoUrl() {
    return this.options?.ssoUrl || getUrls().ssoUrl;
  }

  private getAuthorizerUrl() {
    return this.options?.authorizerURL || getUrls().authorizerUrl;
  }

  private getSupabaseUrl() {
    return this.options?.supabaseUrl || getUrls().supabaseUrl;
  }

  private getSupabaseKey() {
    return this.options?.supabaseKey || getUrls().supabaseKey;
  }
}
