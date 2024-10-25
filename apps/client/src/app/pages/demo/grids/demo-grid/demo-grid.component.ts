import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppDemoInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
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

import { DemoFormComponent } from '../../forms/demo-form/demo-form.component';
import { DemoService } from '../../services/demo.service';

@UntilDestroy()
@Component({
  standalone: true,
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
  ],
  selector: 'app-demo-grid',
  templateUrl: './demo-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoGridComponent implements OnInit {
  items$ = new BehaviorSubject<AppDemoInterface[]>([]);
  selectedIds$ = new BehaviorSubject<string[]>([]);
  columns = ['id', 'name'];

  constructor(
    private readonly demoService: DemoService,
    private readonly nzModalService: NzModalService,
    private readonly viewContainerRef: ViewContainerRef
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
      nzTitle: id ? 'Update demo' : 'Create demo',
      nzContent: DemoFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
      } as DemoFormComponent,
      nzFooter: [
        {
          label: 'Cancel',
          onClick: () => {
            modal.close();
          },
        },
        {
          label: id ? 'Save' : 'Create',
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
      nzTitle: `Delete demo #${id}`,
      nzOkText: 'Yes',
      nzCancelText: 'No',
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
