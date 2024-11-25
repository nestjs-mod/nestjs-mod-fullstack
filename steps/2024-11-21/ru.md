## [2024-11-21] Получение серверного времени через WebSockets и отображение его в Angular-приложении

Предыдущая статья: [Кэширование информации в Redis на NestJS](https://habr.com/ru/articles/861064/)

В этом посте я опишу как создать веб-сокетный стрим в бэкенде на `NestJS` и подписаться на него из фронтенд приложения на `Angular`.

### 1. Устанавливаем дополнительные библиотеки

Устанавливаем `NestJS`-модули для работы с `websockets`.

_Команды_

```bash
npm install --save @nestjs/websockets @nestjs/platform-socket.io @nestjs/platform-ws
```

<spoiler title="Вывод консоли">

```bash
$ npm install --save @nestjs/websockets @nestjs/platform-socket.io @nestjs/platform-ws

added 4 packages, removed 2 packages, and audited 2938 packages in 1m

360 packages are looking for funding
  run `npm fund` for details

42 vulnerabilities (21 low, 3 moderate, 18 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
```

</spoiler>

### 2. Создаем контроллер который отдает серверное время

Контроллер имеет метод выдачи текущего времени и веб-сокет который каждую секунду возвращает текущее время бэкенда.

Создаем файл _apps/server/src/app/time.controller.ts_

```typescript
import { Controller, Get } from '@nestjs/common';

import { AllowEmptyUser } from '@nestjs-mod/authorizer';
import { ApiOkResponse } from '@nestjs/swagger';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { interval, map, Observable } from 'rxjs';

export const ChangeTimeStream = 'ChangeTimeStream';

@AllowEmptyUser()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/ws/time',
  transports: ['websocket'],
})
@Controller()
export class TimeController implements OnGatewayConnection {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleConnection(client: any, ...args: any[]) {
    client.headers = args[0].headers;
  }

  @Get('/time')
  @ApiOkResponse({ type: Date })
  time() {
    return new Date();
  }

  @SubscribeMessage(ChangeTimeStream)
  onChangeTimeStream(): Observable<WsResponse<Date>> {
    return interval(1000).pipe(
      map(() => ({
        data: new Date(),
        event: ChangeTimeStream,
      }))
    );
  }
}
```

### 3. Добавляем контроллер в AppModule

Так как контроллер также включает в себя логику гейтвея, то провайдим контроллер в секции `controllers` и `providers`.

Обновляем файл _apps/server/src/app/app.module.ts_

```typescript
import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

import { WebhookModule } from '@nestjs-mod-fullstack/webhook';
import { PrismaModule } from '@nestjs-mod/prisma';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TimeController } from './time.controller';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    WebhookModule.forFeature({
      featureModuleName: 'app',
    }),
    PrismaModule.forFeature({
      contextName: 'app',
      featureModuleName: 'app',
    }),
    ...(process.env.DISABLE_SERVE_STATIC
      ? []
      : [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'client', 'browser'),
          }),
        ]),
  ],
  controllers: [AppController, TimeController],
  providers: [AppService, TimeController],
});
```

### 4. Пересоздаем SDK для фронтенда и тестов

_Команды_

```bash
npm run generate
```

### 5. Добавляем утилиту для удобной работы с веб-сокетам из Angular-приложения

Создаем файл _libs/common-angular/src/lib/utils/web-socket.ts_

```typescript
import { Observable, finalize } from 'rxjs';

export function webSocket<T>({
  address,
  eventName,
  options,
}: {
  address: string;
  eventName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
}) {
  const wss = new WebSocket(address.replace('/api', '').replace('http', 'ws'), options);
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
```

### 6. Добавляем получение и отображение текущего серверного времени в футере страницы

Обновляем файл _apps/client/src/app/app.component.ts_

```typescript
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '@authorizerdev/authorizer-js';
import { AppRestService, TimeRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { AuthService } from '@nestjs-mod-fullstack/auth-angular';
import { webSocket } from '@nestjs-mod-fullstack/common-angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { BehaviorSubject, map, merge, Observable, tap } from 'rxjs';

@UntilDestroy()
@Component({
  standalone: true,
  imports: [RouterModule, NzMenuModule, NzLayoutModule, NzTypographyModule, AsyncPipe],
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'client';
  serverMessage$ = new BehaviorSubject('');
  serverTime$ = new BehaviorSubject('');
  authUser$: Observable<User | undefined>;

  constructor(private readonly timeRestService: TimeRestService, private readonly appRestService: AppRestService, private readonly authService: AuthService, private readonly router: Router) {
    this.authUser$ = this.authService.profile$.asObservable();
  }

  ngOnInit() {
    this.appRestService
      .appControllerGetData()
      .pipe(
        tap((result) => this.serverMessage$.next(result.message)),
        untilDestroyed(this)
      )
      .subscribe();

    merge(
      this.timeRestService.timeControllerTime(),
      webSocket<string>({
        address: this.timeRestService.configuration.basePath + '/ws/time',
        eventName: 'ChangeTimeStream',
      }).pipe(map((result) => result.data))
    )
      .pipe(
        tap((result) => this.serverTime$.next(result as string)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  signOut() {
    this.authService
      .signOut()
      .pipe(
        tap(() => this.router.navigate(['/home'])),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
```

Обновляем файл _apps/client/src/app/app.component.html_

```html
<nz-layout class="layout">
  <nz-header>
    <div class="logo flex items-center justify-center">{{ title }}</div>
    <ul nz-menu nzTheme="dark" nzMode="horizontal">
      <li nz-menu-item routerLink="/home">Home</li>
      <li nz-menu-item routerLink="/demo">Demo</li>
      @if (authUser$|async; as authUser) {
      <li nz-menu-item routerLink="/webhook">Webhook</li>
      <li nz-submenu [nzTitle]="'You are logged in as ' + authUser.email" [style]="{ float: 'right' }">
        <ul>
          <li nz-menu-item routerLink="/profile">Profile</li>
          <li nz-menu-item (click)="signOut()">Sign-out</li>
        </ul>
      </li>
      } @else {
      <li nz-menu-item routerLink="/sign-up" [style]="{ float: 'right' }">Sign-up</li>
      <li nz-menu-item routerLink="/sign-in" [style]="{ float: 'right' }">Sign-in</li>
      }
    </ul>
  </nz-header>
  <nz-content>
    <router-outlet></router-outlet>
  </nz-content>
  <nz-footer class="flex justify-between">
    <div id="serverMessage">{{ serverMessage$ | async }}</div>
    <div id="serverTime">{{ serverTime$ | async }}</div>
  </nz-footer>
</nz-layout>
```

### 7. Создаем E2E-тест для проверки работы логик связанных с временем

Создаем файл _apps/server-e2e/src/server/time.spec.ts_

```typescript
import { RestClientHelper } from '@nestjs-mod-fullstack/testing';
import { isDateString } from 'class-validator';
import { lastValueFrom, take, toArray } from 'rxjs';

describe('Get server time from rest api and ws', () => {
  jest.setTimeout(60000);

  const correctStringDateLength = '2024-11-20T11:58:03.338Z'.length;
  const restClientHelper = new RestClientHelper();
  const timeApi = restClientHelper.getTimeApi();

  it('should return time from rest api', async () => {
    const time = await timeApi.timeControllerTime();

    expect(time.status).toBe(200);
    expect(time.data).toHaveLength(correctStringDateLength);
    expect(isDateString(time.data)).toBeTruthy();
  });

  it('should return time from ws', async () => {
    const last3ChangeTimeEvents = await lastValueFrom(
      restClientHelper
        .webSocket<string>({
          path: '/ws/time',
          eventName: 'ChangeTimeStream',
        })
        .pipe(take(3), toArray())
    );

    expect(last3ChangeTimeEvents).toHaveLength(3);
    expect(last3ChangeTimeEvents[0].data).toHaveLength(correctStringDateLength);
    expect(last3ChangeTimeEvents[1].data).toHaveLength(correctStringDateLength);
    expect(last3ChangeTimeEvents[2].data).toHaveLength(correctStringDateLength);
    expect(isDateString(last3ChangeTimeEvents[0].data)).toBeTruthy();
    expect(isDateString(last3ChangeTimeEvents[1].data)).toBeTruthy();
    expect(isDateString(last3ChangeTimeEvents[2].data)).toBeTruthy();
  });
});
```

### 8. Запускаем инфраструктуру с приложениями в режиме разработки и проверяем работу через E2E-тесты

_Команды_

```bash
npm run pm2-full:dev:start
npm run pm2-full:dev:test:e2e
```

### Заключение

В текущем посте и проекте при отправке времени через веб-сокет не происходит проверки авторизации пользователя и веб-сокетный стрим доступен любым пользователям, в реальном приложении обычно много веб-сокет стримов которые проверяют токен авторизации.

Возможно в следующих постах появится пример с авторизаций, но подготовительный код есть и в текущей версии (ищите: `handleConnection`).

### Планы

В следующем посте я добавлю обработку серверных валидационных ошибок на фронтенде...

### Ссылки

- https://nestjs.com - официальный сайт фреймворка
- https://nestjs-mod.com - официальный сайт дополнительных утилит
- https://fullstack.nestjs-mod.com - сайт из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/82e050c24a0d1a2111f499460896c6d00e0f5af4..a5efa43f571a7b48402275e1ee6a9b1e325d0eb0 - изменения

#angular #websockets #nestjsmod #fullstack
