import {
  ArrayOfStringTransformer,
  BooleanTransformer,
  EnvModel,
  EnvModelProperty,
} from '@nestjs-mod/common';
import { IsNotEmpty } from 'class-validator';

@EnvModel()
export class SsoStaticEnvironments {
  @EnvModelProperty({
    description: 'Sso URL',
  })
  @IsNotEmpty()
  url!: string;

  @EnvModelProperty({
    description: 'Sso admin secret',
  })
  @IsNotEmpty()
  adminSecret!: string;

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
}
