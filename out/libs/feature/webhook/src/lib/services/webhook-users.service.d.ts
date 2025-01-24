import { PrismaClient } from '@prisma/webhook-client';
import { CreateWebhookUserDto } from '../generated/rest/dto/create-webhook-user.dto';
export declare class WebhookUsersService {
  private readonly prismaClient;
  constructor(prismaClient: PrismaClient);
  createUserIfNotExists(user: Omit<CreateWebhookUserDto, 'id'>): Promise<{
    id: string;
    externalTenantId: string;
    createdAt: Date;
    updatedAt: Date;
    externalUserId: string;
    userRole: import('@prisma/webhook-client').$Enums.WebhookRole;
  }>;
}
