import { WebhookEvent } from '@nestjs-mod/webhook';
import { AuthProfileDto } from './auth-profile.dto';
import { getText } from 'nestjs-translates';

export enum AuthWebhookEvent {
  'auth.user-create' = 'auth.user-create',
  'auth.user-update' = 'auth.user-update',
  'auth.user-delete' = 'auth.user-delete',
}

export const AUTH_WEBHOOK_EVENTS: WebhookEvent[] = [
  {
    eventName: AuthWebhookEvent['auth.user-create'],
    description: getText('Event that fires after user create'),
    example: {
      externalUserId: '77af2745-d972-4e1f-994a-fae8ad71d7ab',
      lang: 'en',
      timezone: 5,
      userRole: 'User',
    } as AuthProfileDto & {
      externalUserId: string;
    },
  },
  {
    eventName: AuthWebhookEvent['auth.user-update'],
    description: getText('Event that fires after user update'),
    example: {
      externalUserId: '77af2745-d972-4e1f-994a-fae8ad71d7ab',
      lang: 'en',
      timezone: 5,
      userRole: 'User',
    } as AuthProfileDto & {
      externalUserId: string;
    },
  },
  {
    eventName: AuthWebhookEvent['auth.user-delete'],
    description: getText('Event that fires after user delete'),
    example: {
      externalUserId: '77af2745-d972-4e1f-994a-fae8ad71d7ab',
    } as {
      externalUserId: string;
    },
  },
];
