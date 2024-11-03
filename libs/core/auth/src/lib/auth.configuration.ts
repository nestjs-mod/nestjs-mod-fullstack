import { AuthorizerRequest } from '@nestjs-mod/authorizer';
import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';

@ConfigModel()
export class AuthConfiguration {
  @ConfigModelProperty({
    description: 'External additional request check.',
  })
  additionalRequestValidation?: (
    authorizerRequest: AuthorizerRequest
  ) => Promise<boolean>;
}
