import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SsoStaticEnvironments } from './sso.environments';
import { SsoService } from './sso.service';

@Injectable()
export class SsoGuard implements CanActivate {
  constructor(
    private readonly ssoService: SsoService,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.ssoStaticEnvironments.useGuards) {
      return true;
    }
    await this.ssoService.getUserFromRequest(context);
    return true;
  }
}
