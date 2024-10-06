import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WebhookRequest } from './types/webhook-request';
import { WebhookRole } from '@prisma/webhook-client';

export const SkipWebhookGuard = Reflector.createDecorator<true>();
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
