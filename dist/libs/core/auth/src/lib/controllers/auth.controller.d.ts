import { PrismaClient } from '@prisma/auth-client';
import { TranslateFunction, TranslatesStorage } from 'nestjs-translates';
import { AuthUser } from '../generated/rest/dto/auth-user.entity';
import { AuthCacheService } from '../services/auth-cache.service';
import { AuthProfileDto } from '../types/auth-profile.dto';
export declare class AuthController {
    private readonly prismaClient;
    private readonly authCacheService;
    private readonly translatesStorage;
    constructor(prismaClient: PrismaClient, authCacheService: AuthCacheService, translatesStorage: TranslatesStorage);
    profile(authUser: AuthUser): Promise<AuthProfileDto>;
    updateProfile(authUser: AuthUser, args: AuthProfileDto, getText: TranslateFunction): Promise<{
        message: string;
    }>;
}
