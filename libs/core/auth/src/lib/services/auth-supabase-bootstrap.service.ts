import { isInfrastructureMode } from '@nestjs-mod/common';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AuthEnvironments } from '../auth.environments';
import { AuthSupabaseService } from './auth-supabase.service';

@Injectable()
export class AuthSupabaseBootstrapService implements OnModuleInit {
  private logger = new Logger(AuthSupabaseBootstrapService.name);

  constructor(
    private readonly authSupabaseService: AuthSupabaseService,
    private readonly authEnvironments: AuthEnvironments
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
        this.authEnvironments.adminEmail &&
        this.authEnvironments.adminPassword
      ) {
        await this.authSupabaseService.createAdmin({
          username: this.authEnvironments.adminUsername,
          password: this.authEnvironments.adminPassword,
          email: this.authEnvironments.adminEmail,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
    }
  }
}
