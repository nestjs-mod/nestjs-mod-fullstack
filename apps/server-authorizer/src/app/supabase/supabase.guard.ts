import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseStaticEnvironments } from './supabase.environments';

@Injectable()
export class SupabaseGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly supabaseStaticEnvironments: SupabaseStaticEnvironments
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.supabaseStaticEnvironments.useGuards) {
      return true;
    }
    await this.supabaseService.getUserFromRequest(context);
    return true;
  }
}
