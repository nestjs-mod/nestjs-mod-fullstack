import { Injectable } from '@nestjs/common';
import { WebhookUser } from '../generated/rest/dto/webhook_user';

@Injectable()
export class WebhookToolsService {
  externalTenantIdQuery(
    webhookUser: Pick<WebhookUser, 'userRole' | 'externalTenantId'> | null,
    externalTenantId?: string
  ): {
    externalTenantId: string;
  } {
    const q =
      webhookUser?.userRole === 'User'
        ? {
            externalTenantId: webhookUser.externalTenantId,
          }
        : { externalTenantId };
    if (!q.externalTenantId) {
      return {} as {
        externalTenantId: string;
      };
    }
    return q as {
      externalTenantId: string;
    };
  }
}
