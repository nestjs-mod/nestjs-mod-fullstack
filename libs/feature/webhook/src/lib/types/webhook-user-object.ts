import { FindManyResponseMeta } from '@nestjs-mod-fullstack/common';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { WebhookUser } from '../generated/rest/dto/webhook_user';

export class WebhookUserObject extends OmitType(WebhookUser, [
  'Webhook_Webhook_createdByToWebhookUser',
  'Webhook_Webhook_updatedByToWebhookUser',
]) {}

export class CreateWebhookUserArgs extends OmitType(WebhookUser, [
  'id',
  'createdAt',
  'updatedAt',
  'Webhook_Webhook_createdByToWebhookUser',
  'Webhook_Webhook_updatedByToWebhookUser',
]) {}

export class UpdateWebhookUserArgs extends PartialType(
  OmitType(WebhookUser, [
    'id',
    'externalUserId',
    'externalTenantId',
    'createdAt',
    'updatedAt',
    'Webhook_Webhook_createdByToWebhookUser',
    'Webhook_Webhook_updatedByToWebhookUser',
  ])
) {}

export class FindManyWebhookUserResponse {
  @ApiProperty({ type: () => [WebhookUserObject] })
  webhookUsers!: WebhookUserObject[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
