/**
 *
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { WebhookErrorEnumInterface } from './webhook-error-enum.interface';

export interface WebhookErrorInterface {
  /**
   * Webhook error (WEBHOOK-000), Tenant ID not set (WEBHOOK-003), User ID not set (WEBHOOK-002), Forbidden (WEBHOOK-001), User not found (WEBHOOK-004), Event not found (WEBHOOK-005)
   */
  message: string;
  code: WebhookErrorEnumInterface;
  metadata?: object;
}
export namespace WebhookErrorInterface {}