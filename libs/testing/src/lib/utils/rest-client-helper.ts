import { AuthToken, Authorizer } from '@authorizerdev/authorizer-js';
import {
  Configuration,
  DefaultApi,
  WebhookApi,
} from '@nestjs-mod-fullstack/app-rest-sdk';
import axios, { AxiosInstance } from 'axios';
import { get } from 'env-var';
import {
  GenerateRandomUserResult,
  generateRandomUser,
} from './generate-random-user';
import { getUrls } from './get-urls';

export class RestClientHelper {
  private authorizerClientID?: string;

  authorizationTokens?: AuthToken;

  private webhookApi?: WebhookApi;
  private defaultApi?: DefaultApi;
  private authorizer?: Authorizer;

  private defaultApiAxios?: AxiosInstance;
  private webhookApiAxios?: AxiosInstance;

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

  getWebhookApi() {
    if (!this.webhookApi) {
      throw new Error('webhookApi not set');
    }
    return this.webhookApi;
  }

  getDefaultApi() {
    if (!this.defaultApi) {
      throw new Error('defaultApi not set');
    }
    return this.defaultApi;
  }

  async getAuthorizerClient() {
    if (!this.authorizerClientID && this.defaultApi) {
      this.authorizerClientID = (
        await this.defaultApi.authorizerControllerGetAuthorizerClientID()
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
    if (this.defaultApiAxios) {
      Object.assign(
        this.defaultApiAxios.defaults.headers.common,
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
    this.webhookApiAxios = axios.create();
    this.defaultApiAxios = axios.create();

    this.webhookApi = new WebhookApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.webhookApiAxios
    );
    this.defaultApi = new DefaultApi(
      new Configuration({
        basePath: this.getServerUrl(),
      }),
      undefined,
      this.defaultApiAxios
    );
  }

  private getAuthorizerUrl(): string {
    return this.options?.authorizerURL || getUrls().authorizerUrl;
  }

  private getServerUrl(): string {
    return this.options?.serverUrl || getUrls().serverUrl;
  }
}
