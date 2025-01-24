import { CheckAccessOptions } from './supabase.types';
export declare const InjectSupabaseService: (
  service: any,
  contextName?: any
) => any;
export declare const getSupabaseServiceToken: (
    targetName: any,
    contextName?: string
  ) => string,
  getSupabaseEnvironmentsLoaderToken: (
    contextName?: string
  ) => import('@nestjs/common').InjectionToken;
export declare const AllowEmptyUser: import('@nestjs/core').ReflectableDecorator<
  unknown,
  unknown
>;
export declare const CheckAccess: import('@nestjs/core').ReflectableDecorator<
  CheckAccessOptions,
  CheckAccessOptions
>;
export declare const CurrentSupabaseUser: (
  ...dataOrPipes: unknown[]
) => ParameterDecorator;
export declare const CurrentSupabaseUserToken: (
  ...dataOrPipes: unknown[]
) => ParameterDecorator;
