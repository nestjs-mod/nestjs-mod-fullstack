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

export interface WebhookLogObjectInterface {
  request: object;
  responseStatus: string;
  response?: object;
  webhookStatus: WebhookStatusInterface;
}
export namespace WebhookLogObjectInterface {}