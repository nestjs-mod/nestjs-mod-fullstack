import { AuthToken, Authorizer } from '@authorizerdev/authorizer-js';
import {
  AppApi,
  AuthorizerApi,
  Configuration,
  FilesApi,
  TimeApi,
  WebhookApi,
} from '@nestjs-mod-fullstack/app-rest-sdk';
import axios, { AxiosInstance } from 'axios';
import { get } from 'env-var';
import { Observable, finalize } from 'rxjs';
import {
  GenerateRandomUserResult,
  generateRandomUser,
} from './generate-random-user';
import { getUrls } from './get-urls';

import WebSocket from 'ws';

export class RestClientHelper {
  private authorizerClientID!: string;

  authorizationTokens?: AuthToken;

  private authorizer?: Authorizer;

  private webhookApi?: WebhookApi;
  private appApi?: AppApi;
  private authorizerApi?: AuthorizerApi;
  private filesApi?: FilesApi;
  private timeApi?: TimeApi;

  private webhookApiAxios?: AxiosInstance;
  private appApiAxios?: AxiosInstance;
  private authorizerApiAxios?: AxiosInstance;
  private filesApiAxios?: AxiosInstance;
  private timeApiAxios?: AxiosInstance;

  randomUser?: GenerateRandomUserResult;

  constructor(
    private readonly options?: {
      isAdmin?: boolean;
      serverUrl?: string;
      authorizerURL?: string;
      randomUser?: GenerateRandomUserResult;
    }
  ) {
    this.randomUser = options?.randomUser;
    this.createApiClients();
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
    const wss = new WebSocket(
      this.getServerUrl().replace('/api', '').replace('http', 'ws') + path,
      options
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

  async getAuthorizerClient() {
    if (!this.authorizerClientID && this.authorizerApi) {
      this.authorizerClientID = (
        await this.authorizerApi.authorizerControllerGetAuthorizerClientID()
      ).data.clientID;
      if (!this.options?.isAdmin) {
        this.authorizer = new Authorizer({
          authorizerURL: this.getAuthorizerUrl(),
          clientID: this.authorizerClientID,
          redirectURL: this.getServerUrl(),
        });
      } else {
        this.authorizer = new Authorizer({
          authorizerURL: this.getAuthorizerUrl(),
          clientID: this.authorizerClientID,
          redirectURL: this.getServerUrl(),
          extraHeaders: {
            'x-authorizer-admin-secret': get('SERVER_AUTHORIZER_ADMIN_SECRET')
              .required()
              .asString(),
          },
        });
      }
    }
    return this.authorizer as Authorizer;
  }

  async setRoles(roles: string[]) {
    const _updateUserResult = await (
      await this.getAuthorizerClient()
    ).graphqlQuery({
      query: `mutation {
  _update_user(
    params: { id: "${
      this.authorizationTokens?.user?.id
    }", roles: ${JSON.stringify(roles)} }
  ) {
    id
    roles
  }
}`,
    });
    if (_updateUserResult.errors.length > 0) {
      console.error(_updateUserResult.errors);
      throw new Error(_updateUserResult.errors[0].message);
    }
    await this.login();

    return this;
  }

  async createAndLoginAsUser(
    options?: Pick<GenerateRandomUserResult, 'email' | 'password'>
  ) {
    await this.generateRandomUser(options);
    await this.reg();
    await this.login(options);

    if (this.options?.isAdmin) {
      await this.setRoles(['admin', 'user']);
    }

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
    await (
      await this.getAuthorizerClient()
    ).signup({
      email: this.randomUser.email,
      confirm_password: this.randomUser.password,
      password: this.randomUser.password,
    });
    return this;
  }

  async login(
    options?: Partial<Pick<GenerateRandomUserResult, 'email' | 'password'>>
  ) {
    if (!this.randomUser) {
      this.randomUser = await generateRandomUser();
    }
    const loginOptions = {
      email: options?.email || this.randomUser.email,
      password: options?.password || this.randomUser.password,
    };
    const loginResult = await (
      await this.getAuthorizerClient()
    ).login(loginOptions);

    if (loginResult.errors.length) {
      throw new Error(loginResult.errors[0].message);
    }

    this.authorizationTokens = loginResult.data;

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

    return this;
  }

  async logout() {
    await (
      await this.getAuthorizerClient()
    ).logout(this.getAuthorizationHeaders());
    return this;
  }

  getAuthorizationHeaders() {
    return {
      Authorization: `Bearer ${this.authorizationTokens?.access_token}`,
    };
  }

  private createApiClients() {
    this.authorizerApiAxios = axios.create();
    this.authorizerApi = new AuthorizerApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.webhookApiAxios
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
  }

  private getAuthorizerUrl(): string {
    return this.options?.authorizerURL || getUrls().authorizerUrl;
  }

  private getServerUrl(): string {
    return this.options?.serverUrl || getUrls().serverUrl;
  }
}
