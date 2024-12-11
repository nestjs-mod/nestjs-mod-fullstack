import { CacheManagerService } from '@nestjs-mod/cache-manager';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable } from '@nestjs/common';
import { AuthUser, PrismaClient } from '@prisma/auth-client';
import { AUTH_FEATURE } from '../auth.constants';
import { AuthEnvironments } from '../auth.environments';

@Injectable()
export class AuthCacheService {
  constructor(
    @InjectPrismaClient(AUTH_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly cacheManagerService: CacheManagerService,
    private readonly authEnvironments: AuthEnvironments
  ) {}

  async clearCacheByExternalUserId(externalUserId: string) {
    const authUsers = await this.prismaClient.authUser.findMany({
      where: { externalUserId },
    });
    for (const authUser of authUsers) {
      await this.cacheManagerService.del(this.getUserCacheKey(authUser));
    }
  }

  async getCachedUserByExternalUserId(externalUserId: string) {
    const cached = await this.cacheManagerService.get<AuthUser | null>(
      this.getUserCacheKey({
        externalUserId,
      })
    );
    if (cached) {
      return cached;
    }
    const user = await this.prismaClient.authUser.findFirst({
      where: {
        externalUserId,
      },
    });
    if (user) {
      await this.cacheManagerService.set(
        this.getUserCacheKey({ externalUserId }),
        user,
        this.authEnvironments.cacheTTL
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
