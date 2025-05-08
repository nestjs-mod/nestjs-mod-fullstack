import { SsoUserDto } from '@nestjs-mod/sso-rest-sdk';

export type CheckAccessOptions = {
  roles?: string[];
  permissions: string[];
  types?: string[];
};

export type SsoRequest = {
  ssoUser?: SsoUserDto;
  externalUserId?: string;
  externalAppId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers?: any;
  skippedBySso?: boolean;
  skipEmptySsoUser?: boolean;
};
