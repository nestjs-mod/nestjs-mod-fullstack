import { OnInit, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WebhookScalarFieldEnumInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { BehaviorSubject } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { RequestMeta } from '@nestjs-mod-fullstack/common-angular';
import { WebhookModel } from '../../services/webhook-mapper.service';
import { WebhookService } from '../../services/webhook.service';
import * as i0 from "@angular/core";
export declare class WebhookGridComponent implements OnInit {
    private readonly webhookService;
    private readonly nzModalService;
    private readonly viewContainerRef;
    private readonly translocoService;
    items$: BehaviorSubject<WebhookModel[]>;
    meta$: BehaviorSubject<RequestMeta | undefined>;
    searchField: FormControl<string | null>;
    selectedIds$: BehaviorSubject<string[]>;
    keys: WebhookScalarFieldEnumInterface[];
    columns: {
        [x: string]: "webhook.grid.columns.id" | "webhook.grid.columns.enabled" | "webhook.grid.columns.endpoint" | "webhook.grid.columns.event-name" | "webhook.grid.columns.headers" | "webhook.grid.columns.request-timeout" | "webhook.grid.columns.work-until-date";
    };
    WebhookScalarFieldEnumInterface: {
        id: WebhookScalarFieldEnumInterface;
        eventName: WebhookScalarFieldEnumInterface;
        endpoint: WebhookScalarFieldEnumInterface;
        enabled: WebhookScalarFieldEnumInterface;
        headers: WebhookScalarFieldEnumInterface;
        requestTimeout: WebhookScalarFieldEnumInterface;
        externalTenantId: WebhookScalarFieldEnumInterface;
        createdBy: WebhookScalarFieldEnumInterface;
        updatedBy: WebhookScalarFieldEnumInterface;
        createdAt: WebhookScalarFieldEnumInterface;
        updatedAt: WebhookScalarFieldEnumInterface;
        workUntilDate: WebhookScalarFieldEnumInterface;
    };
    private filters?;
    constructor(webhookService: WebhookService, nzModalService: NzModalService, viewContainerRef: ViewContainerRef, translocoService: TranslocoService);
    ngOnInit(): void;
    loadMany(args?: {
        filters?: Record<string, string>;
        meta?: RequestMeta;
        queryParams?: NzTableQueryParams;
        force?: boolean;
    }): void;
    showCreateOrUpdateModal(id?: string): void;
    showDeleteModal(id?: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<WebhookGridComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WebhookGridComponent, "webhook-grid", never, {}, {}, never, never, true, never>;
}
