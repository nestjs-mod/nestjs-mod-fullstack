import { WebhookUser } from '../generated/rest/dto/webhook-user.entity';
export declare class WebhookToolsService {
  externalTenantIdQuery(
    webhookUser: Pick<WebhookUser, 'userRole' | 'externalTenantId'> | null,
    externalTenantId?: string
  ): {
    externalTenantId: string;
  };
}
