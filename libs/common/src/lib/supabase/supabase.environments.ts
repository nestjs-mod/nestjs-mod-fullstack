import {
  ArrayOfStringTransformer,
  EnvModel,
  EnvModelProperty,
} from '@nestjs-mod/common';
import { IsNotEmpty } from 'class-validator';

@EnvModel()
export class SupabaseEnvironments {
  @EnvModelProperty({
    description: 'Supabase URL',
  })
  @IsNotEmpty()
  supabaseURL!: string;

  @EnvModelProperty({
    description: 'Supabase key',
  })
  @IsNotEmpty()
  supabaseKey!: string;

  @EnvModelProperty({
    description:
      'Allowed identifiers of external applications, if you have logged in previously and do not need to log in again in the authorization service, these identifiers must be private and can be used for testing.',
    transform: new ArrayOfStringTransformer(),
  })
  allowedExternalAppIds?: string[];
}
