import { EnvModel, EnvModelProperty } from '@nestjs-mod/common';
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
}
