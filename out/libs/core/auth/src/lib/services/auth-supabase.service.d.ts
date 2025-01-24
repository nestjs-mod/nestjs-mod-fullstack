import { SupabaseService } from '@nestjs-mod-fullstack/common';
export declare class AuthSupabaseService {
  private readonly supabaseService;
  private logger;
  constructor(supabaseService: SupabaseService);
  createAdmin(user: {
    username?: string;
    password: string;
    email: string;
  }): Promise<void>;
  verifyUser({
    externalUserId,
    email,
  }: {
    externalUserId: string;
    email: string;
  }): Promise<this>;
  updateUser(
    externalUserId: string,
    params: Partial<Record<string, any>>
  ): Promise<void>;
}
