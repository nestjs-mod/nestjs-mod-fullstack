import { FindManyResponseMeta } from '@nestjs-mod-fullstack/common';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Webhook } from '../generated/rest/dto/webhook';

export class WebhookObject extends OmitType(Webhook, [
  'externalTenantId',
  'WebhookLog',
  'WebhookUser_Webhook_createdByToWebhookUser',
  'WebhookUser_Webhook_updatedByToWebhookUser',
  'createdAt',
  'createdBy',
  'updatedAt',
  'updatedBy',
]) {}

export class CreateWebhookArgs extends OmitType(Webhook, [
  'id',
  'externalTenantId',
  'WebhookLog',
  'WebhookUser_Webhook_createdByToWebhookUser',
  'WebhookUser_Webhook_updatedByToWebhookUser',
  'createdAt',
  'createdBy',
  'updatedAt',
  'updatedBy',
]) {}

export class UpdateWebhookArgs extends PartialType(
  OmitType(Webhook, [
    'id',
    'externalTenantId',
    'WebhookLog',
    'WebhookUser_Webhook_createdByToWebhookUser',
    'WebhookUser_Webhook_updatedByToWebhookUser',
    'createdAt',
    'createdBy',
    'updatedAt',
    'updatedBy',
  ])
) {}

export class FindManyWebhookResponse {
  @ApiProperty({ type: () => [WebhookObject] })
  webhooks!: WebhookObject[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
