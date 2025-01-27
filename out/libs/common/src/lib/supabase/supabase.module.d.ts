import { SupabaseEnvironments } from './supabase.environments';
import { SupabaseConfiguration } from './supabase.configuration';
export declare const SupabaseModule: Record<"forFeatureAsync", (asyncOptions?: import("@nestjs-mod/common").ForFeatureAsyncMethodOptions<SupabaseConfiguration, never, SupabaseEnvironments, never, never, never> | undefined) => Promise<import("@nestjs/common").DynamicModule>> & Record<"forFeature", (options?: {
    featureModuleName: string;
    contextName?: string;
} | undefined) => Promise<import("@nestjs/common").DynamicModule>> & Record<"forRoot", (options?: import("@nestjs-mod/common").ForRootMethodOptions<never, SupabaseConfiguration, SupabaseEnvironments, never> | undefined) => Promise<import("@nestjs/common").DynamicModule>> & Record<"forRootAsync", (asyncOptions?: import("@nestjs-mod/common").ForRootAsyncMethodOptions<never, SupabaseConfiguration, SupabaseEnvironments, never> | undefined) => Promise<import("@nestjs/common").DynamicModule>>;
