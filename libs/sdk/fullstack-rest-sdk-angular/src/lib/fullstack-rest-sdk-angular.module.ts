import { HttpHeaders } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import {
  AppRestService,
  AuthRestService,
  FullstackRestClientApiModule,
  FullstackRestClientConfiguration,
  TimeRestService,
} from './generated';

@Injectable({ providedIn: 'root' })
export class FullstackRestSdkAngularService {
  constructor(
    private readonly fullstackRestClientConfiguration: FullstackRestClientConfiguration,
    private readonly appRestService: AppRestService,
    private readonly authRestService: AuthRestService,
    private readonly timeRestService: TimeRestService,
  ) {
    appRestService.configuration.withCredentials = true;
    authRestService.configuration.withCredentials = true;
    timeRestService.configuration.withCredentials = true;
  }

  getAppApi() {
    if (!this.appRestService) {
      throw new Error('appRestService not set');
    }
    return this.appRestService;
  }

  getAuthApi() {
    if (!this.authRestService) {
      throw new Error('authRestService not set');
    }
    return this.authRestService;
  }

  getTimeApi() {
    if (!this.timeRestService) {
      throw new Error('timeRestService not set');
    }
    return this.timeRestService;
  }

  updateHeaders(headers: Record<string, string>) {
    this.appRestService.defaultHeaders = new HttpHeaders(headers);
    this.authRestService.defaultHeaders = new HttpHeaders(headers);
    this.timeRestService.defaultHeaders = new HttpHeaders(headers);
  }

  webSocket<T>({
    path,
    eventName,
    options,
  }: {
    path: string;
    eventName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: any;
  }) {
    const wss = new WebSocket(
      (this.fullstackRestClientConfiguration.basePath || '')
        .replace('/api', '')
        .replace('http', 'ws') + path,
      options,
    );
    return new Observable<{ data: T; event: string }>((observer) => {
      wss.addEventListener('open', () => {
        wss.addEventListener('message', ({ data }) => {
          observer.next(JSON.parse(data.toString()));
        });
        wss.addEventListener('error', (err) => {
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
}

@NgModule({})
export class FullstackRestSdkAngularModule {
  public static forRoot(
    configuration: Partial<FullstackRestClientConfiguration>,
  ) {
    const fullstackRestClientConfiguration =
      new FullstackRestClientConfiguration(configuration);
    const fullstackRestClientApiModule = FullstackRestClientApiModule.forRoot(
      () => fullstackRestClientConfiguration,
    );
    return {
      ngModule: FullstackRestSdkAngularModule,
      providers: [
        {
          provide: FullstackRestClientConfiguration,
          useValue: fullstackRestClientConfiguration,
        },
      ],
      imports: [fullstackRestClientApiModule],
      exports: [fullstackRestClientApiModule, FullstackRestClientConfiguration],
    };
  }
}
