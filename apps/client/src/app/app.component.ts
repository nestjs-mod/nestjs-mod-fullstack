import { AsyncPipe, NgFor, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '@authorizerdev/authorizer-js';
import {
  LangDefinition,
  TranslocoDirective,
  TranslocoPipe,
  TranslocoService,
} from '@jsverse/transloco';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import {
  AppRestService,
  TimeRestService,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { AuthService } from '@nestjs-mod-fullstack/auth-angular';
import { webSocket } from '@nestjs-mod-fullstack/common-angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { BehaviorSubject, map, merge, mergeMap, Observable, tap } from 'rxjs';

@UntilDestroy()
@Component({
  standalone: true,
  imports: [
    RouterModule,
    NzMenuModule,
    NzLayoutModule,
    NzTypographyModule,
    AsyncPipe,
    NgForOf,
    NgFor,
    TranslocoPipe,
    TranslocoDirective,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = marker('client');
  serverMessage$ = new BehaviorSubject('');
  serverTime$ = new BehaviorSubject('');
  authUser$: Observable<User | undefined>;
  lang$ = new BehaviorSubject<string>('');
  availableLangs$ = new BehaviorSubject<LangDefinition[]>([]);

  constructor(
    private readonly timeRestService: TimeRestService,
    private readonly appRestService: AppRestService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly translocoService: TranslocoService
  ) {
    this.authUser$ = this.authService.profile$.asObservable();
    this.availableLangs$.next(
      this.translocoService.getAvailableLangs() as LangDefinition[]
    );
    this.translocoService.langChanges$
      .pipe(
        tap((lang) => {
          this.lang$.next(lang);
          this.availableLangs$.next(
            this.translocoService.getAvailableLangs() as LangDefinition[]
          );
        }),
        mergeMap(() => this.fillServerMessage()),
        untilDestroyed(this)
      )
      .subscribe();
  }

  ngOnInit() {
    this.fillServerMessage().pipe(untilDestroyed(this)).subscribe();
    this.fillServerTime().pipe(untilDestroyed(this)).subscribe();
  }

  private fillServerTime() {
    return merge(
      this.timeRestService.timeControllerTime(),
      webSocket<string>({
        address: this.timeRestService.configuration.basePath + '/ws/time',
        eventName: 'ChangeTimeStream',
      }).pipe(map((result) => result.data))
    ).pipe(tap((result) => this.serverTime$.next(result as string)));
  }

  private fillServerMessage() {
    return this.appRestService
      .appControllerGetData()
      .pipe(tap((result) => this.serverMessage$.next(result.message)));
  }

  setActiveLang(lang: string) {
    this.translocoService.setActiveLang(lang);
    localStorage.setItem('activeLang', lang);
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
