import { ValidationConfiguration } from './validation.configuration';
import { ValidationEnvironments } from './validation.environments';
export declare const ValidationModule: Record<
  'forFeatureAsync',
  (
    asyncOptions?:
      | import('@nestjs-mod/common').ForFeatureAsyncMethodOptions<
          ValidationConfiguration,
          never,
          never,
          ValidationEnvironments,
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
            ValidationConfiguration,
            never,
            ValidationEnvironments
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
            ValidationConfiguration,
            never,
            ValidationEnvironments
          >
        | undefined
    ) => Promise<import('@nestjs/common').DynamicModule>
  >;
