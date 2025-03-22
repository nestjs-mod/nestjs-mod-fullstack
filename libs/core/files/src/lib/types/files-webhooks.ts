import { WebhookEvent } from '@nestjs-mod-fullstack/webhook';
import { getText } from 'nestjs-translates';

export enum FilesWebhookEvent {
  'files.delete' = 'files.delete',
}

export const FILES_WEBHOOK_EVENTS: WebhookEvent[] = [
  {
    eventName: FilesWebhookEvent['files.delete'],
    description: getText('Event that fires after a file is deleted'),
    example: {
      bucketName: 'images',
      downloadUrl: '/files/images-file-id.jpg',
      objectName: 'images-file-id',
      externalUserId: '77af2745-d972-4e1f-994a-fae8ad71d7ab',
    } as {
      bucketName: string;
      objectName: string;
      downloadUrl: string;
      externalUserId: string;
    },
  },
];
