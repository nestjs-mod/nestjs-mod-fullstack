import { FindManyArgs } from '@nestjs-mod-fullstack/common';
import { PrismaClient } from '@prisma/auth-client';
import { PrismaToolsService } from '@nestjs-mod-fullstack/prisma-tools';
import { TranslateFunction } from 'nestjs-translates';
import { AuthUser } from '../generated/rest/dto/auth-user.entity';
import { UpdateAuthUserDto } from '../generated/rest/dto/update-auth-user.dto';
import { AuthCacheService } from '../services/auth-cache.service';
export declare class AuthUsersController {
    private readonly prismaClient;
    private readonly prismaToolsService;
    private readonly authCacheService;
    constructor(prismaClient: PrismaClient, prismaToolsService: PrismaToolsService, authCacheService: AuthCacheService);
    findMany(authUser: AuthUser, args: FindManyArgs): Promise<{
        authUsers: {
            id: string;
            externalUserId: string;
            userRole: import("@prisma/auth-client").$Enums.AuthRole;
            timezone: number | null;
            createdAt: Date;
            updatedAt: Date;
            lang: string | null;
        }[];
        meta: {
            totalResults: number;
            curPage: number;
            perPage: number;
        };
    }>;
    updateOne(authUser: AuthUser, id: string, args: UpdateAuthUserDto): Promise<{
        id: string;
        externalUserId: string;
        userRole: import("@prisma/auth-client").$Enums.AuthRole;
        timezone: number | null;
        createdAt: Date;
        updatedAt: Date;
        lang: string | null;
    }>;
    deleteOne(authUser: AuthUser, id: string, getText: TranslateFunction): Promise<{
        message: string;
    }>;
    findOne(authUser: AuthUser, id: string): Promise<{
        id: string;
        externalUserId: string;
        userRole: import("@prisma/auth-client").$Enums.AuthRole;
        timezone: number | null;
        createdAt: Date;
        updatedAt: Date;
        lang: string | null;
    }>;
}
