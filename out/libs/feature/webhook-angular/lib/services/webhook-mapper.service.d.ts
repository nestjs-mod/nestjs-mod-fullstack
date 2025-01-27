import { WebhookInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import * as i0 from "@angular/core";
export interface WebhookModel extends Partial<Omit<WebhookInterface, 'workUntilDate' | 'createdAt' | 'updatedAt' | 'headers'>> {
    headers?: string | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    workUntilDate?: Date | null;
}
export declare class WebhookMapperService {
    toModel(item?: WebhookInterface): WebhookModel;
    toForm(model: WebhookModel): {
        requestTimeout: string | number;
        workUntilDate: string | null;
        headers?: string | null;
        createdAt?: Date | null;
        updatedAt?: Date | null;
        id?: string | undefined;
        eventName?: string | undefined;
        endpoint?: string | undefined;
        enabled?: boolean | undefined;
        externalTenantId?: string | undefined;
        createdBy?: string | undefined;
        updatedBy?: string | undefined;
        WebhookUser_Webhook_createdByToWebhookUser?: import("@nestjs-mod-fullstack/app-angular-rest-sdk").WebhookUserInterface | undefined;
        WebhookUser_Webhook_updatedByToWebhookUser?: import("@nestjs-mod-fullstack/app-angular-rest-sdk").WebhookUserInterface | undefined;
        WebhookLog?: Array<import("@nestjs-mod-fullstack/app-angular-rest-sdk").WebhookLogInterface> | undefined;
    };
    toJson(data: WebhookModel): {
        enabled: boolean;
        endpoint: string;
        eventName: string;
        headers: any;
        requestTimeout: number | null;
        workUntilDate: string | undefined;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<WebhookMapperService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<WebhookMapperService>;
}
