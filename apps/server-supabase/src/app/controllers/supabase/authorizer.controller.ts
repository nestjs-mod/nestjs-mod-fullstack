import { Controller, Get } from '@nestjs/common';

import { AllowEmptyAuthUser, AuthError } from '@nestjs-mod-fullstack/auth';
import { ApiExtraModels, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { AllowEmptySupabaseUser } from '../../supabase/supabase.decorators';

export class AuthorizerClientID {
  @ApiProperty({ type: String })
  clientID!: string;
}

@AllowEmptySupabaseUser()
@AllowEmptyAuthUser()
@ApiExtraModels(AuthError)
@Controller()
export class AuthorizerController {
  @Get('/authorizer/client-id')
  @ApiOkResponse({ type: AuthorizerClientID })
  getAuthorizerClientID() {
    return { clientID: '' };
  }
}
