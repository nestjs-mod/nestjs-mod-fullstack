export declare const SkipWebhookGuard: import('@nestjs/core').ReflectableDecorator<
  true,
  true
>;
export declare const CheckWebhookRole: import('@nestjs/core').ReflectableDecorator<
  import('@prisma/webhook-client').$Enums.WebhookRole[],
  import('@prisma/webhook-client').$Enums.WebhookRole[]
>;
export declare const CurrentWebhookRequest: (
  ...dataOrPipes: unknown[]
) => ParameterDecorator;
export declare const CurrentWebhookUser: (
  ...dataOrPipes: unknown[]
) => ParameterDecorator;
export declare const CurrentWebhookExternalTenantId: (
  ...dataOrPipes: unknown[]
) => ParameterDecorator;
