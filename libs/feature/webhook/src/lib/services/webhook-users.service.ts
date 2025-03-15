import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient, WebhookRole } from '@prisma/webhook-client';
import omit from 'lodash/fp/omit';
import { randomUUID } from 'node:crypto';
import { CreateWebhookUserDto } from '../generated/rest/dto/create-webhook-user.dto';
import { WEBHOOK_FEATURE } from '../webhook.constants';

@Injectable()
export class WebhookUsersService {
  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient
  ) {}

  async createUserIfNotExists(user: Omit<CreateWebhookUserDto, 'id'>) {
    const data = {
      externalTenantId: randomUUID(),
      userRole: WebhookRole.User,
      ...omit(
        [
          'id',
          'createdAt',
          'updatedAt',
          'Webhook_Webhook_createdByToWebhookUser',
          'Webhook_Webhook_updatedByToWebhookUser',
        ],
        user
      ),
    } as CreateWebhookUserDto;
    const existsUser = await this.prismaClient.webhookUser.findFirst({
      where: {
        externalTenantId: user.externalTenantId,
        externalUserId: user.externalUserId,
      },
    });
    if (!existsUser) {
      return await this.prismaClient.webhookUser.create({
        data,
      });
    }
    return existsUser;
  }
}
