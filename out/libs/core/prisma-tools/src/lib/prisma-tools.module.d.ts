import { PrismaToolsEnvironments } from './prisma-tools.environments';
export declare const PrismaToolsModule: Record<
  'forFeatureAsync',
  (
    asyncOptions?:
      | import('@nestjs-mod/common').ForFeatureAsyncMethodOptions<
          never,
          never,
          PrismaToolsEnvironments,
          never,
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
            PrismaToolsEnvironments,
            never
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
            PrismaToolsEnvironments,
            never
          >
        | undefined
    ) => Promise<import('@nestjs/common').DynamicModule>
  >;
