/**
 *
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

export interface WebhookObjectInterface {
  id: string;
  eventName: string;
  endpoint: string;
  enabled: boolean;
  headers?: object;
  requestTimeout?: number;
  externalTenantId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}