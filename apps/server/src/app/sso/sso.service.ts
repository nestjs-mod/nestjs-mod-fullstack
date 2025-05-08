import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { SsoRestSdkService, SsoUserDto } from '@nestjs-mod/sso-rest-sdk';
import {
  ExecutionContext,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SsoConfiguration } from './sso.configuration';
import { AllowEmptySsoUser, CheckSsoAccess } from './sso.decorators';
import { SsoStaticEnvironments } from './sso.environments';
import { SsoError, SsoErrorEnum } from './sso.errors';
import { SsoRequest } from './sso.types';

@Injectable()
export class SsoService implements OnModuleInit {
  private logger = new Logger(SsoService.name);
  private ssoRestSdkService!: SsoRestSdkService;
  private adminSsoRestSdkService!: SsoRestSdkService;

  constructor(
    private readonly reflector: Reflector,
    private readonly ssoConfiguration: SsoConfiguration,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments
  ) {}

  onModuleInit() {
    this.ssoRestSdkService = new SsoRestSdkService({
      serverUrl: this.ssoStaticEnvironments.url,
    });
    this.adminSsoRestSdkService = new SsoRestSdkService({
      serverUrl: this.ssoStaticEnvironments.url,
      headers: {
        ['x-admin-secret']: this.ssoStaticEnvironments.adminSecret,
      },
    });
  }

  getSsoClient(isAdmin?: boolean) {
    if (isAdmin) {
      return this.adminSsoRestSdkService;
    }
    return this.ssoRestSdkService;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getUserFromRequest(
    ctx: ExecutionContext,
    checkAccess = true
  ): Promise<SsoUserDto | undefined> {
    await this.tryGetOrCreateCurrentUserWithExternalUserId(ctx);

    await this.checkAccessValidator(checkAccess, ctx);

    const req = this.getRequestFromExecutionContext(ctx);

    this.setInfoOfExternalUserIdToRequest(req);

    this.setSkippedBySsoIfUserIsEmpty(req);

    return req.ssoUser;
  }

  private setSkippedBySsoIfUserIsEmpty(req: SsoRequest) {
    req.skippedBySso =
      req.ssoUser === undefined || req.ssoUser?.id === undefined;
  }

  private setInfoOfExternalUserIdToRequest(req: SsoRequest) {
    if (req.ssoUser?.id) {
      req.externalUserId = req.ssoUser?.id;
    }
  }

  private async checkAccessValidator(
    checkAccess: boolean,
    ctx: ExecutionContext
  ) {
    const { checkAccessMetadata, allowEmptyUserMetadata } =
      this.getHandlersReflectMetadata(ctx);

    const req = this.getRequestFromExecutionContext(ctx);

    if (allowEmptyUserMetadata) {
      req.skipEmptySsoUser = true;
    }

    if (checkAccess) {
      // check access by custom logic
      const checkAccessValidatorResult = this.ssoConfiguration
        .checkAccessValidator
        ? await this.ssoConfiguration.checkAccessValidator(
            req.ssoUser,
            checkAccessMetadata,
            ctx
          )
        : false;

      // check access by roles
      if (
        !req.skipEmptySsoUser &&
        !checkAccessValidatorResult &&
        !req.ssoUser?.id
      ) {
        throw new SsoError(SsoErrorEnum.UNAUTHORIZED);
      }
    }
  }

  private async tryGetOrCreateCurrentUserWithExternalUserId(
    ctx: ExecutionContext
  ) {
    const req = this.getRequestFromExecutionContext(ctx);
    if (!req.ssoUser?.id) {
      const token = req.headers?.authorization?.split(' ')[1];

      if (token && token !== 'undefined') {
        // check user in sso
        try {
          const getProfileResult = await this.ssoRestSdkService
            .getSsoApi()
            .ssoControllerProfile({
              headers: { authorization: req.headers['authorization'] },
            });
          req.ssoUser = getProfileResult.data;
        } catch (err) {
          this.logger.error(err, err.stack);
          req.ssoUser = { id: undefined } as unknown as SsoUserDto;
        }
      }
    }

    req.ssoUser = (req.ssoUser || { id: undefined }) as unknown as SsoUserDto;
  }

  private getRequestFromExecutionContext(ctx: ExecutionContext) {
    const req = getRequestFromExecutionContext(ctx) as SsoRequest;
    req.headers = req.headers || {};
    return req;
  }

  private getHandlersReflectMetadata(ctx: ExecutionContext) {
    const allowEmptyUserMetadata = Boolean(
      (typeof ctx.getHandler === 'function' &&
        this.reflector.get(AllowEmptySsoUser, ctx.getHandler())) ||
        (typeof ctx.getClass === 'function' &&
          this.reflector.get(AllowEmptySsoUser, ctx.getClass())) ||
        undefined
    );
    const checkAccessMetadata =
      (typeof ctx.getHandler === 'function' &&
        this.reflector.get(CheckSsoAccess, ctx.getHandler())) ||
      (typeof ctx.getClass === 'function' &&
        this.reflector.get(CheckSsoAccess, ctx.getClass())) ||
      undefined;

    return {
      checkAccessMetadata,
      allowEmptyUserMetadata,
    };
  }
}
