import { AsyncPipe, NgFor, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  LangDefinition,
  TranslocoDirective,
  TranslocoPipe,
  TranslocoService,
} from '@jsverse/transloco';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { TranslocoDatePipe } from '@jsverse/transloco-locale';
import {
  AppRestService,
  AuthRoleInterface,
  TimeRestService,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import {
  AuthActiveLangService,
  AuthService,
  CheckUserRolesPipe,
  TokensService,
  UserPipe,
} from '@nestjs-mod-fullstack/auth-angular';
import {
  BROWSER_TIMEZONE_OFFSET,
  webSocket,
} from '@nestjs-mod-fullstack/common-angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { addHours } from 'date-fns';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { BehaviorSubject, map, merge, mergeMap, switchMap, tap } from 'rxjs';

@UntilDestroy()
@Component({
  imports: [
    NzIconModule,
    RouterModule,
    NzMenuModule,
    NzLayoutModule,
    NzTypographyModule,
    AsyncPipe,
    NgForOf,
    NgFor,
    TranslocoPipe,
    TranslocoDirective,
    TranslocoDatePipe,
    CheckUserRolesPipe,
    UserPipe,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = marker('client');
  serverMessage$ = new BehaviorSubject('');
  serverTime$ = new BehaviorSubject<Date>(new Date());
  lang$ = new BehaviorSubject<string>('');
  availableLangs$ = new BehaviorSubject<LangDefinition[]>([]);
  AuthRoleInterface = AuthRoleInterface;

  constructor(
    private readonly timeRestService: TimeRestService,
    private readonly appRestService: AppRestService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    private readonly authActiveLangService: AuthActiveLangService
  ) {}

  ngOnInit() {
    this.loadAvailableLangs();

    this.subscribeToRefreshActiveLang();
    this.subscribeToLangChanges();

    this.fillServerMessage().pipe(untilDestroyed(this)).subscribe();
    this.fillServerTime().pipe(untilDestroyed(this)).subscribe();
  }

  private subscribeToRefreshActiveLang() {
    this.authService.profile$
      .asObservable()
      .pipe(
        mergeMap((profile) => {
          if (!profile) {
            this.authActiveLangService.clearLocalStorage();
          }
          return this.authActiveLangService.refreshActiveLang();
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  setActiveLang(lang: string) {
    this.authActiveLangService
      .setActiveLang(lang)
      .pipe(untilDestroyed(this))
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

  private loadAvailableLangs() {
    this.availableLangs$.next(
      this.translocoService.getAvailableLangs() as LangDefinition[]
    );
  }

  private subscribeToLangChanges() {
    this.translocoService.langChanges$
      .pipe(
        tap((lang) => this.lang$.next(lang)),
        mergeMap(() => this.fillServerMessage()),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private fillServerTime() {
    return merge(
      this.timeRestService.timeControllerTime(),
      this.tokensService
        .getStream()
        .pipe(
          switchMap((token) =>
            webSocket<string>({
              address:
                this.timeRestService.configuration.basePath +
                (token?.access_token
                  ? `/ws/time?token=${token?.access_token}`
                  : '/ws/time'),
              eventName: 'ChangeTimeStream',
            })
          )
        )
        .pipe(map((result) => result.data))
    ).pipe(
      tap((result) =>
        this.serverTime$.next(
          addHours(new Date(result as string), BROWSER_TIMEZONE_OFFSET)
        )
      )
    );
  }

  private fillServerMessage() {
    return this.appRestService
      .appControllerGetData()
      .pipe(tap((result) => this.serverMessage$.next(result.message)));
  }
}
