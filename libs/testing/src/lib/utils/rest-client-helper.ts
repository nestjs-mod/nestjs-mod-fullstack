import { AuthToken, Authorizer } from '@authorizerdev/authorizer-js';
import {
  AppApi,
  AuthApi,
  AuthProfileDto,
  AuthRole,
  AuthorizerApi,
  Configuration,
  FakeEndpointApi,
  FilesApi,
  TimeApi,
  WebhookApi,
  WebhookUser,
} from '@nestjs-mod-fullstack/app-rest-sdk';
import axios, { AxiosInstance } from 'axios';
import { Observable, finalize } from 'rxjs';
import {
  GenerateRandomUserResult,
  generateRandomUser,
} from './generate-random-user';
import { getUrls } from './get-urls';

import { AuthResponse } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { TestingSupabaseService } from './supabase.service';

export class RestClientHelper<T extends 'strict' | 'no_strict' = 'strict'> {
  private authorizerClientID!: string;

  authorizationTokens?: AuthToken;
  authData?: AuthResponse['data'];

  private webhookProfile?: WebhookUser;
  private authProfile?: AuthProfileDto;

  private authorizer?: Authorizer;

  private testingSupabaseService?: TestingSupabaseService;

  private webhookApi?: WebhookApi;
  private appApi?: AppApi;
  private authorizerApi?: AuthorizerApi;
  private filesApi?: FilesApi;
  private timeApi?: TimeApi;
  private authApi?: AuthApi;
  private fakeEndpointApi?: FakeEndpointApi;

  private webhookApiAxios?: AxiosInstance;
  private appApiAxios?: AxiosInstance;
  private authorizerApiAxios?: AxiosInstance;
  private filesApiAxios?: AxiosInstance;
  private timeApiAxios?: AxiosInstance;
  private authApiAxios?: AxiosInstance;
  private fakeEndpointApiAxios?: AxiosInstance;

  randomUser: T extends 'strict'
    ? GenerateRandomUserResult
    : GenerateRandomUserResult | undefined;

  constructor(
    private readonly options?: {
      serverUrl?: string;
      authorizerURL?: string;
      supabaseUrl?: string;
      supabaseKey?: string;
      randomUser?: GenerateRandomUserResult;
      activeLang?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      headers?: any;
    }
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
      }
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
          })
        );
      });
    }).pipe(
      finalize(() => {
        if (wss?.readyState == WebSocket.OPEN) {
          wss.close();
        }
      })
    );
  }

  getAuthorizerApi() {
    if (!this.authorizerApi) {
      throw new Error('authorizerApi not set');
    }
    return this.authorizerApi;
  }

  getWebhookApi() {
    if (!this.webhookApi) {
      throw new Error('webhookApi not set');
    }
    return this.webhookApi;
  }

  getAppApi() {
    if (!this.appApi) {
      throw new Error('appApi not set');
    }
    return this.appApi;
  }

  getFilesApi() {
    if (!this.filesApi) {
      throw new Error('filesApi not set');
    }
    return this.filesApi;
  }

  getTimeApi() {
    if (!this.timeApi) {
      throw new Error('timeApi not set');
    }
    return this.timeApi;
  }

  getAuthApi() {
    if (!this.authApi) {
      throw new Error('authApi not set');
    }
    return this.authApi;
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
        supabaseKey
      );
    }
    return this.testingSupabaseService;
  }

  async createAndLoginAsUser(
    options?: Pick<GenerateRandomUserResult, 'email' | 'password'>
  ) {
    await this.generateRandomUser(options);
    await this.reg();
    await this.login(options);

    return this;
  }

  async generateRandomUser(
    options?: Pick<GenerateRandomUserResult, 'email' | 'password'> | undefined
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

    this.setAuthorizationHeadersFromAuthorizationTokens();

    await this.loadProfile();

    return this;
  }

  async login(
    options?: Partial<
      Pick<GenerateRandomUserResult, 'id' | 'email' | 'password'>
    >
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

    throw new Error('Fatal');
  }

  private async loadProfile() {
    if (this.webhookApi) {
      this.webhookProfile = (
        await this.getWebhookApi().webhookControllerProfile()
      ).data;
    }

    if (this.authApi) {
      this.authProfile = (await this.getAuthApi().authControllerProfile()).data;
    }
  }

  private setAuthorizationHeadersFromAuthorizationTokens() {
    if (this.webhookApiAxios) {
      Object.assign(
        this.webhookApiAxios.defaults.headers.common,
        this.getAuthorizationHeaders()
      );
    }
    if (this.appApiAxios) {
      Object.assign(
        this.appApiAxios.defaults.headers.common,
        this.getAuthorizationHeaders()
      );
    }
    if (this.authorizerApiAxios) {
      Object.assign(
        this.authorizerApiAxios.defaults.headers.common,
        this.getAuthorizationHeaders()
      );
    }
    if (this.filesApiAxios) {
      Object.assign(
        this.filesApiAxios.defaults.headers.common,
        this.getAuthorizationHeaders()
      );
    }
    if (this.authApiAxios) {
      Object.assign(
        this.authApiAxios.defaults.headers.common,
        this.getAuthorizationHeaders()
      );
    }
    if (this.timeApiAxios) {
      Object.assign(
        this.timeApiAxios.defaults.headers.common,
        this.getAuthorizationHeaders()
      );
    }
    if (this.fakeEndpointApiAxios) {
      Object.assign(
        this.fakeEndpointApiAxios.defaults.headers.common,
        this.getAuthorizationHeaders()
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
          : {}
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
      this.authorizationTokens?.access_token
    );
  }

  private createApiClients() {
    this.authorizerApiAxios = axios.create();
    this.authorizerApi = new AuthorizerApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.authorizerApiAxios
    );
    //

    this.webhookApiAxios = axios.create();
    this.webhookApi = new WebhookApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.webhookApiAxios
    );
    //

    this.appApiAxios = axios.create();
    this.appApi = new AppApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.appApiAxios
    );
    //

    this.filesApiAxios = axios.create();
    this.filesApi = new FilesApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.filesApiAxios
    );
    //

    this.timeApiAxios = axios.create();
    this.timeApi = new TimeApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.timeApiAxios
    );
    //

    this.authApiAxios = axios.create();
    this.authApi = new AuthApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.authApiAxios
    );
    //

    this.fakeEndpointApiAxios = axios.create();
    this.fakeEndpointApi = new FakeEndpointApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.fakeEndpointApiAxios
    );
  }

  private getServerUrl(): string {
    return this.options?.serverUrl || getUrls().serverUrl;
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
