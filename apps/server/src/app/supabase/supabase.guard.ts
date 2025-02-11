import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseEnvironments } from './supabase.environments';

@Injectable()
export class SupabaseGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly supabaseEnvironments: SupabaseEnvironments
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.supabaseEnvironments.useGuards) {
      return true;
    }
    await this.supabaseService.getUserFromRequest(context);
    return true;
  }
}
