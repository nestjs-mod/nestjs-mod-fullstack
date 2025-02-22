import {
  BooleanTransformer,
  EnvModel,
  EnvModelProperty,
} from '@nestjs-mod/common';
import { IsNotEmpty } from 'class-validator';

@EnvModel()
export class AuthStaticEnvironments {
  @EnvModelProperty({
    description: 'Global admin username',
    default: 'admin@example.com',
  })
  adminEmail?: string;

  @EnvModelProperty({
    description: 'Global admin username',
    default: 'admin',
  })
  @IsNotEmpty()
  adminUsername?: string;

  @EnvModelProperty({
    description: 'Global admin password',
  })
  adminPassword?: string;

  @EnvModelProperty({
    description: 'TTL for cached data',
    default: 15_000,
    hidden: true,
  })
  cacheTTL?: number;

  @EnvModelProperty({
    description: 'Use guards',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useGuards?: boolean;

  @EnvModelProperty({
    description: 'Use filters',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useFilters?: boolean;

  @EnvModelProperty({
    description: 'Use interceptors',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useInterceptors?: boolean;

  @EnvModelProperty({
    description: 'Use pipes',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  usePipes?: boolean;
}
