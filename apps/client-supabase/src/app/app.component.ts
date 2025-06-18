import { AsyncPipe, NgFor, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LangDefinition, TranslocoDirective, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { TranslocoDatePipe } from '@jsverse/transloco-locale';
import {
  AuthActiveLangService,
  AuthService,
  CheckUserRolesPipe,
  TokensService,
  UserPipe,
} from '@nestjs-mod-fullstack/auth-afat';
import { AuthRoleInterface, FullstackRestSdkAngularService } from '@nestjs-mod-fullstack/fullstack-rest-sdk-angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { addHours } from 'date-fns';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

import { Title } from '@angular/platform-browser';
import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { BehaviorSubject, map, merge, mergeMap, switchMap, tap } from 'rxjs';
import { APP_TITLE } from './app.constants';

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
  standalone: true,
})
export class AppComponent implements OnInit {
  title!: string;
  serverMessage$ = new BehaviorSubject('');
  serverTime$ = new BehaviorSubject<Date>(new Date());
  lang$ = new BehaviorSubject<string>('');
  availableLangs$ = new BehaviorSubject<LangDefinition[]>([]);
  AuthRoleInterface = AuthRoleInterface;

  constructor(
    private readonly fullstackRestSdkAngularService: FullstackRestSdkAngularService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    private readonly authActiveLangService: AuthActiveLangService,
    private readonly titleService: Title,
  ) {
    this.title = this.translocoService.translate(APP_TITLE);
    this.titleService.setTitle(this.title);
  }

  ngOnInit() {
    this.loadAvailableLangs();
    this.subscribeToChangeProfile();
    this.subscribeToLangChanges();

    this.fillServerMessage().pipe(untilDestroyed(this)).subscribe();
    this.fillServerTime().pipe(untilDestroyed(this)).subscribe();
  }

  private subscribeToChangeProfile() {
    this.authService.profile$
      .asObservable()
      .pipe(
        mergeMap((profile) => {
          if (!profile) {
            this.authActiveLangService.clearLocalStorage();
          }
          return this.authActiveLangService.refreshActiveLang();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  setActiveLang(lang: string) {
    this.authActiveLangService.setActiveLang(lang).pipe(untilDestroyed(this)).subscribe();
  }

  signOut() {
    this.authService
      .signOut()
      .pipe(
        tap(() => this.router.navigate(['/home'])),
        untilDestroyed(this),
      )
      .subscribe();
  }

  private loadAvailableLangs() {
    this.availableLangs$.next(this.translocoService.getAvailableLangs() as LangDefinition[]);
  }

  private subscribeToLangChanges() {
    this.translocoService.langChanges$
      .pipe(
        tap((lang) => {
          this.lang$.next(lang);
        }),
        mergeMap(() => this.fillServerMessage()),
        untilDestroyed(this),
      )
      .subscribe();
  }

  private fillServerTime() {
    return merge(
      this.fullstackRestSdkAngularService.getTimeApi().timeControllerTime(),
      this.tokensService
        .getStream()
        .pipe(
          switchMap((token) =>
            this.fullstackRestSdkAngularService.webSocket<string>({
              path: token?.access_token ? `/ws/time?token=${token?.access_token}` : '/ws/time',
              eventName: 'ChangeTimeStream',
            }),
          ),
        )
        .pipe(map((result) => result.data)),
    ).pipe(tap((result) => this.serverTime$.next(addHours(new Date(result as string), TIMEZONE_OFFSET))));
  }

  private fillServerMessage() {
    return this.fullstackRestSdkAngularService
      .getAppApi()
      .appControllerGetData()
      .pipe(tap((result) => this.serverMessage$.next(result.message)));
  }
}
