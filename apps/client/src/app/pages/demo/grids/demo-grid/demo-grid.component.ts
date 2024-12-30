import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { BehaviorSubject, tap } from 'rxjs';

import {
  TranslocoDirective,
  TranslocoPipe,
  TranslocoService,
} from '@jsverse/transloco';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { TranslocoDatePipe } from '@jsverse/transloco-locale';
import { DemoFormComponent } from '../../forms/demo-form/demo-form.component';
import { AppDemoModel } from '../../services/demo-mapper.service';
import { DemoService } from '../../services/demo.service';

@UntilDestroy()
@Component({
  imports: [
    NzGridModule,
    NzMenuModule,
    NzLayoutModule,
    NzTableModule,
    NzDividerModule,
    CommonModule,
    RouterModule,
    NzModalModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    FormsModule,
    ReactiveFormsModule,
    TranslocoDirective,
    TranslocoPipe,
    TranslocoDatePipe,
  ],
  selector: 'app-demo-grid',
  templateUrl: './demo-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoGridComponent implements OnInit {
  items$ = new BehaviorSubject<AppDemoModel[]>([]);
  selectedIds$ = new BehaviorSubject<string[]>([]);
  keys = ['id', 'name', 'createdAt', 'updatedAt'];
  columns = {
    id: marker('app-demo.grid.columns.id'),
    name: marker('app-demo.grid.columns.name'),
    createdAt: marker('app-demo.grid.columns.created-at'),
    updatedAt: marker('app-demo.grid.columns.updated-at'),
  };

  constructor(
    private readonly demoService: DemoService,
    private readonly nzModalService: NzModalService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.loadMany();
  }

  loadMany() {
    this.demoService
      .findMany()
      .pipe(
        tap((result) => {
          this.items$.next(result);
          this.selectedIds$.next([]);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  showCreateOrUpdateModal(id?: string): void {
    const modal = this.nzModalService.create<
      DemoFormComponent,
      DemoFormComponent
    >({
      nzTitle: id
        ? this.translocoService.translate('Update demo', { id })
        : this.translocoService.translate('Create demo'),
      nzContent: DemoFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
      } as DemoFormComponent,
      nzFooter: [
        {
          label: this.translocoService.translate('Cancel'),
          onClick: () => {
            modal.close();
          },
        },
        {
          label: id
            ? this.translocoService.translate('Save')
            : this.translocoService.translate('Create'),
          onClick: () => {
            modal.componentInstance?.afterUpdate
              .pipe(
                tap(() => {
                  modal.close();
                  this.loadMany();
                }),
                untilDestroyed(modal.componentInstance)
              )
              .subscribe();

            modal.componentInstance?.afterCreate
              .pipe(
                tap(() => {
                  modal.close();
                  this.loadMany();
                }),
                untilDestroyed(modal.componentInstance)
              )
              .subscribe();

            modal.componentInstance?.submitForm();
          },
          type: 'primary',
        },
      ],
    });
  }

  showDeleteModal(id: string) {
    this.nzModalService.confirm({
      nzTitle: this.translocoService.translate(`Delete demo #{{id}}`, { id }),
      nzOkText: this.translocoService.translate('Yes'),
      nzCancelText: this.translocoService.translate('No'),
      nzOnOk: () => {
        this.demoService
          .deleteOne(id)
          .pipe(
            tap(() => {
              this.loadMany();
            }),
            untilDestroyed(this)
          )
          .subscribe();
      },
    });
  }
}
