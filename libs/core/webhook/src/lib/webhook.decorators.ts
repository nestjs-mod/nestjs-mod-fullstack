import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WebhookRole } from '@prisma/webhook-client';
import { WebhookRequest } from './types/webhook-request';
import { WebhookError, WebhookErrorEnum } from './webhook.errors';

export const CheckWebhookRole = Reflector.createDecorator<WebhookRole[]>();

export const CurrentWebhookRequest = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = getRequestFromExecutionContext(ctx) as WebhookRequest;
    return req;
  }
);

export const CurrentWebhookUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = getRequestFromExecutionContext(ctx) as WebhookRequest;
    return req.webhookUser;
  }
);

export const CurrentWebhookExternalTenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = getRequestFromExecutionContext(ctx) as WebhookRequest;
    if (
      !req.externalTenantId &&
      req.webhookUser?.userRole !== WebhookRole.Admin
    ) {
      throw new WebhookError(WebhookErrorEnum.EXTERNAL_TENANT_ID_NOT_SET);
    }
    return req.externalTenantId;
  }
);
