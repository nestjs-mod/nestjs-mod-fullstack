import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';
import { searchIn } from '@nestjs-mod/misc';
import { SsoUserDto } from '@nestjs-mod/sso-rest-sdk';
import { ExecutionContext } from '@nestjs/common';
import { CheckAccessOptions } from './sso.types';

export const defaultSsoCheckAccessValidator = async (
  ssoUser?: SsoUserDto,
  options?: CheckAccessOptions
) => {
  return Boolean(ssoUser?.roles && searchIn(ssoUser?.roles, options?.roles));
};

@ConfigModel()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class SsoConfiguration {
  @ConfigModelProperty({
    description: 'External function for validate permissions',
    default: defaultSsoCheckAccessValidator,
  })
  checkAccessValidator?: (
    ssoUser?: SsoUserDto,
    options?: CheckAccessOptions,
    ctx?: ExecutionContext
  ) => Promise<boolean>;
}
