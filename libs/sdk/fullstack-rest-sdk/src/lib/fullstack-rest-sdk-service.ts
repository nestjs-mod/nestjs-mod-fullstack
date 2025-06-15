import axios, { AxiosInstance } from 'axios';
import { Observable, finalize } from 'rxjs';

import WebSocket from 'ws';
import { AppApi, AuthApi, Configuration, TimeApi } from './generated';

export class FullstackRestSdkService {
  private timeApi?: TimeApi;
  private appApi?: AppApi;
  private authApi?: AuthApi;

  private timeApiAxios?: AxiosInstance;
  private appApiAxios?: AxiosInstance;
  private authApiAxios?: AxiosInstance;

  private wsHeaders: Record<string, string> = {};

  constructor(
    private options?: {
      serverUrl?: string;
      headers?: Record<string, string>;
    },
  ) {
    this.createApiClients();
    this.updateHeaders(options?.headers || {});
  }

  getTimeApi() {
    if (!this.timeApi) {
      throw new Error('timeApi not set');
    }
    return this.timeApi;
  }

  getAppApi() {
    if (!this.appApi) {
      throw new Error('appApi not set');
    }
    return this.appApi;
  }

  getAuthApi() {
    if (!this.authApi) {
      throw new Error('authApi not set');
    }
    return this.authApi;
  }

  updateHeaders(headers: Record<string, string>) {
    Object.assign(this.wsHeaders, headers);

    if (this.appApiAxios) {
      Object.assign(this.appApiAxios.defaults.headers.common, headers);
    }
    if (this.timeApiAxios) {
      Object.assign(this.timeApiAxios.defaults.headers.common, headers);
    }
    if (this.authApiAxios) {
      Object.assign(this.authApiAxios.defaults.headers.common, headers);
    }
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
      this.options?.serverUrl?.replace('/api', '').replace('http', 'ws') + path,
      {
        ...(options || {}),
        headers: this.wsHeaders || {},
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

  private createApiClients() {
    this.timeApiAxios = axios.create();
    this.timeApi = new TimeApi(
      new Configuration({
        basePath: this.options?.serverUrl,
      }),
      undefined,
      this.timeApiAxios,
    );
    //

    this.appApiAxios = axios.create();
    this.appApi = new AppApi(
      new Configuration({
        basePath: this.options?.serverUrl,
      }),
      undefined,
      this.appApiAxios,
    );
    //

    this.authApiAxios = axios.create();
    this.authApi = new AuthApi(
      new Configuration({
        basePath: this.options?.serverUrl,
      }),
      undefined,
      this.authApiAxios,
    );
  }
}
