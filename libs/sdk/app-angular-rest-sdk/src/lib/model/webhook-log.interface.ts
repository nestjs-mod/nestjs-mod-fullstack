/**
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { WebhookStatusInterface } from './webhook-status.interface';
import { WebhookInterface } from './webhook.interface';

export interface WebhookLogInterface {
  id: string;
  request: object;
  responseStatus: string;
  response: object | null;
  webhookStatus: WebhookStatusInterface;
  webhookId: string;
  externalTenantId: string;
  createdAt: string;
  updatedAt: string;
  Webhook?: WebhookInterface;
}
export namespace WebhookLogInterface {}