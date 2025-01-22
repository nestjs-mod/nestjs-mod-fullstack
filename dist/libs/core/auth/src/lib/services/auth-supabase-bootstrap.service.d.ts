import { OnModuleInit } from '@nestjs/common';
import { AuthEnvironments } from '../auth.environments';
import { AuthSupabaseService } from './auth-supabase.service';
export declare class AuthSupabaseBootstrapService implements OnModuleInit {
    private readonly authSupabaseService;
    private readonly authEnvironments;
    private logger;
    constructor(authSupabaseService: AuthSupabaseService, authEnvironments: AuthEnvironments);
    onModuleInit(): Promise<void>;
    private createAdmin;
}
