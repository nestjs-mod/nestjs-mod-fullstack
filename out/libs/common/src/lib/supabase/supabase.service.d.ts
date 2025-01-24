import { ExecutionContext, OnModuleInit } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfiguration } from './supabase.configuration';
import { SupabaseEnvironments } from './supabase.environments';
import { SupabaseUser } from './supabase.types';
export declare class SupabaseService implements OnModuleInit {
  private readonly reflector;
  private readonly supabaseConfiguration;
  private readonly supabaseEnvironments;
  private logger;
  private supabaseClient;
  constructor(
    reflector: Reflector,
    supabaseConfiguration: SupabaseConfiguration,
    supabaseEnvironments: SupabaseEnvironments
  );
  onModuleInit(): void;
  getSupabaseClient(): SupabaseClient<any, 'public', any>;
  getUserFromRequest(
    ctx: ExecutionContext,
    checkAccess?: boolean
  ): Promise<SupabaseUser | undefined>;
}
