import { Controller, Get, Optional } from '@nestjs/common';

import { AllowEmptyAuthUser, AuthError } from '@nestjs-mod-fullstack/auth';
import { AllowEmptyUser, AuthorizerService } from '@nestjs-mod/authorizer';
import { ApiExtraModels, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { AllowEmptySupabaseUser } from '../supabase/supabase.decorators';

export class AuthorizerClientID {
  @ApiProperty({ type: String })
  clientID!: string;
}

@AllowEmptyUser()
@AllowEmptyAuthUser()
@AllowEmptySupabaseUser()
@ApiExtraModels(AuthError)
@Controller()
export class AuthorizerController {
  constructor(
    @Optional()
    private readonly authorizerService?: AuthorizerService
  ) {}

  @Get('/authorizer/client-id')
  @ApiOkResponse({ type: AuthorizerClientID })
  getAuthorizerClientID() {
    return { clientID: this.authorizerService?.config.clientID };
  }
}
