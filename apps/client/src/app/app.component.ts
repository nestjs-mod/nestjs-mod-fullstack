import { AsyncPipe, NgFor, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '@authorizerdev/authorizer-js';
import {
  LangDefinition,
  TranslocoPipe,
  TranslocoService,
} from '@jsverse/transloco';
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
import { BehaviorSubject, map, merge, Observable, tap } from 'rxjs';

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
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'client';
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
          console.log(
            this.translocoService.getAvailableLangs() as LangDefinition[]
          );
          console.log(this.translocoService.getTranslation());
        }),
        untilDestroyed(this)
      )
      .subscribe();
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

  setActiveLang(lang: string) {
    this.translocoService.setActiveLang(lang);
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
