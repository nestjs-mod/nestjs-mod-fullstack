import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
export declare class SupabaseGuard implements CanActivate {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
