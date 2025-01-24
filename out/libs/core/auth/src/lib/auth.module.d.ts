import { AuthEnvironments } from './auth.environments';
export declare const AuthModule: Record<
  'forFeatureAsync',
  (
    asyncOptions?:
      | import('@nestjs-mod/common').ForFeatureAsyncMethodOptions<
          never,
          never,
          never,
          AuthEnvironments,
          never,
          never
        >
      | undefined
  ) => Promise<import('@nestjs/common').DynamicModule>
> &
  Record<
    'forFeature',
    (
      options?:
        | {
            featureModuleName: string;
            contextName?: string;
          }
        | undefined
    ) => Promise<import('@nestjs/common').DynamicModule>
  > &
  Record<
    'forRoot',
    (
      options?:
        | import('@nestjs-mod/common').ForRootMethodOptions<
            never,
            never,
            never,
            AuthEnvironments
          >
        | undefined
    ) => Promise<import('@nestjs/common').DynamicModule>
  > &
  Record<
    'forRootAsync',
    (
      asyncOptions?:
        | import('@nestjs-mod/common').ForRootAsyncMethodOptions<
            never,
            never,
            never,
            AuthEnvironments
          >
        | undefined
    ) => Promise<import('@nestjs/common').DynamicModule>
  >;
