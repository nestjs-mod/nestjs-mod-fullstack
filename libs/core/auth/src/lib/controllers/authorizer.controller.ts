import { Controller, Get } from '@nestjs/common';

import { AllowEmptyUser } from '@nestjs-mod/authorizer';
import { ApiExtraModels, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { AuthError } from '../auth.errors';
import { AuthAuthorizerService } from '../services/auth-authorizer.service';

export class AuthorizerClientID {
  @ApiProperty({ type: String })
  clientID!: string;
}

@ApiExtraModels(AuthError)
@Controller()
export class AuthorizerController {
  constructor(private readonly authorizerService: AuthAuthorizerService) {}

  @Get('/authorizer/client-id')
  @AllowEmptyUser()
  @ApiOkResponse({ type: AuthorizerClientID })
  getAuthorizerClientID() {
    return { clientID: this.authorizerService.authorizerClientID() };
  }
}
