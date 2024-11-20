import { Injectable } from '@angular/core';
import { TimeRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { webSocket } from '@nestjs-mod-fullstack/common-angular';
import { BehaviorSubject, map, merge, Subscription, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimeService {
  private timeStreamSubscription?: Subscription;
  private time$ = new BehaviorSubject('');

  constructor(private readonly timeRestService: TimeRestService) {}

  getTimeStream() {
    this.subscribeToTimeUpdates();
    return this.time$.asObservable();
  }

  private subscribeToTimeUpdates() {
    if (this.timeStreamSubscription) {
      this.timeStreamSubscription.unsubscribe();
      this.timeStreamSubscription = undefined;
    }
    this.timeStreamSubscription = merge(
      this.timeRestService.timeControllerTime(),
      webSocket<string>({
        address: this.timeRestService.configuration.basePath + '/ws/time',
        eventName: 'ChangeTimeStream',
      }).pipe(map((result) => result.data))
    )
      .pipe(
        map((result) => result),
        tap((time) => this.time$.next(time as unknown as string))
      )
      .subscribe();
  }
}
