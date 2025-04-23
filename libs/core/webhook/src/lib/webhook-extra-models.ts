import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/webhook-client';

import { WebhookError } from './webhook.errors';

export const WebhookEntities = class {};

Object.keys(Prisma)
  .filter(
    (key) => key.endsWith('ScalarFieldEnum') && !key.startsWith('Migrations')
  )
  .map((enumName: string) => {
    const keyOfEntity = enumName.split('ScalarFieldEnum')[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (WebhookEntities as any)['prototype'][keyOfEntity] = '';
    ApiProperty({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      enum: (Prisma as any)[enumName],
      enumName: enumName,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })((WebhookEntities as any)['prototype'], keyOfEntity);
  });

export const WEBHOOK_EXTRA_MODELS = [WebhookError, WebhookEntities];
