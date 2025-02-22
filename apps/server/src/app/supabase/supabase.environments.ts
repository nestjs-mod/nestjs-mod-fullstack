import {
  ArrayOfStringTransformer,
  BooleanTransformer,
  EnvModel,
  EnvModelProperty,
} from '@nestjs-mod/common';
import { IsNotEmpty } from 'class-validator';

@EnvModel()
export class SupabaseStaticEnvironments {
  @EnvModelProperty({
    description: 'Supabase URL',
  })
  @IsNotEmpty()
  url!: string;

  @EnvModelProperty({
    description: 'Supabase key',
  })
  @IsNotEmpty()
  key!: string;

  @EnvModelProperty({
    description:
      'Allowed identifiers of external applications, if you have logged in previously and do not need to log in again in the authorization service, these identifiers must be private and can be used for testing.',
    transform: new ArrayOfStringTransformer(),
  })
  allowedExternalAppIds?: string[];

  @EnvModelProperty({
    description: 'Use guards.',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useGuards?: boolean;

  @EnvModelProperty({
    description: 'Use filters.',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useFilters?: boolean;
}
