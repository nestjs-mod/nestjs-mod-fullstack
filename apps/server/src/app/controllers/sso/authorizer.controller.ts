import { Controller, Get } from '@nestjs/common';

import { AllowEmptyAuthUser, AuthError } from '@nestjs-mod-fullstack/auth';
import { ApiExtraModels, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { AllowEmptySsoUser } from '../../sso/sso.decorators';

export class AuthorizerClientID {
  @ApiProperty({ type: String })
  clientID!: string;
}

@AllowEmptySsoUser()
@AllowEmptyAuthUser()
@ApiExtraModels(AuthError)
@Controller()
export class AuthorizerController {
  @Get('/sso/client-id')
  @ApiOkResponse({ type: AuthorizerClientID })
  getSsoClientID() {
    return { clientID: '' };
  }
}
