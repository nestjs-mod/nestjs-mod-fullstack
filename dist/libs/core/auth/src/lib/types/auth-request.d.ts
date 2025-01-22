import { SupabaseRequest } from '@nestjs-mod-fullstack/common';
import { AuthUser } from '../generated/rest/dto/auth-user.entity';
export type AuthRequest = {
    authUser?: AuthUser | null;
    headers: Record<string, string>;
} & SupabaseRequest;
