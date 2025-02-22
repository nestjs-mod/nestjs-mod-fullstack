import { isInfrastructureMode } from '@nestjs-mod/common';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AuthStaticEnvironments } from '../auth.environments';
import { AuthConfiguration } from '../auth.configuration';

@Injectable()
export class AuthDefaultDataBootstrapService implements OnModuleInit {
  private logger = new Logger(AuthDefaultDataBootstrapService.name);

  constructor(
    private readonly authConfiguration: AuthConfiguration,
    private readonly authStaticEnvironments: AuthStaticEnvironments
  ) {}

  async onModuleInit() {
    this.logger.debug('onModuleInit');
    if (!isInfrastructureMode()) {
      try {
        await this.createAdmin();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.logger.error(err, err.stack);
      }
    }
  }

  private async createAdmin() {
    try {
      if (
        this.authStaticEnvironments.adminEmail &&
        this.authStaticEnvironments.adminPassword
      ) {
        await this.authConfiguration.createAdmin({
          username: this.authStaticEnvironments.adminUsername,
          password: this.authStaticEnvironments.adminPassword,
          email: this.authStaticEnvironments.adminEmail,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
    }
  }
}
