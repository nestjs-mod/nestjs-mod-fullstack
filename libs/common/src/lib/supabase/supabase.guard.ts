import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class SupabaseGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.supabaseService.getUserFromRequest(context);
    return true;
  }
}
