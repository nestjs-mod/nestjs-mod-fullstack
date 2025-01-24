import { KeyvService } from '@nestjs-mod/keyv';
import { PrismaClient } from '@prisma/auth-client';
import { AuthEnvironments } from '../auth.environments';
export declare class AuthCacheService {
  private readonly prismaClient;
  private readonly keyvService;
  private readonly authEnvironments;
  constructor(
    prismaClient: PrismaClient,
    keyvService: KeyvService,
    authEnvironments: AuthEnvironments
  );
  clearCacheByExternalUserId(externalUserId: string): Promise<void>;
  getCachedUserByExternalUserId(externalUserId: string): Promise<{
    id: string;
    externalUserId: string;
    userRole: import('@prisma/auth-client').$Enums.AuthRole;
    timezone: number | null;
    createdAt: Date;
    updatedAt: Date;
    lang: string | null;
  } | null>;
  private getUserCacheKey;
}
