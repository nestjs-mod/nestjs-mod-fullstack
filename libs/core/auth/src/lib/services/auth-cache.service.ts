import { KeyvService } from '@nestjs-mod/keyv';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { AUTH_FEATURE } from '../auth.constants';
import { AuthStaticEnvironments } from '../auth.environments';
import { AuthUser, PrismaClient } from '../generated/prisma-client';

@Injectable()
export class AuthCacheService {
  private readonly logger = new Logger(AuthCacheService.name);

  constructor(
    @InjectPrismaClient(AUTH_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly keyvService: KeyvService,
    private readonly authStaticEnvironments: AuthStaticEnvironments
  ) {}

  async clearCacheByExternalUserId(externalUserId: string) {
    const authUsers = await this.prismaClient.authUser.findMany({
      where: { externalUserId },
    });
    for (const authUser of authUsers) {
      await this.keyvService.delete(this.getUserCacheKey(authUser));
    }
  }

  async getCachedUserByExternalUserId(externalUserId: string) {
    const cached = await this.keyvService.get<AuthUser>(
      this.getUserCacheKey({
        externalUserId,
      })
    );
    if (cached) {
      return cached as AuthUser;
    }
    const user = await this.prismaClient.authUser.findFirst({
      where: {
        externalUserId,
      },
    });
    if (user) {
      await this.keyvService.set(
        this.getUserCacheKey({ externalUserId }),
        user,
        this.authStaticEnvironments.cacheTTL
      );
      return user;
    }
    return null;
  }

  private getUserCacheKey({
    externalUserId,
  }: {
    externalUserId: string;
  }): string {
    return `authUser.${externalUserId}`;
  }
}
