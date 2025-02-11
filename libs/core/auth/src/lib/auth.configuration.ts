import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';

@ConfigModel()
export class AuthConfiguration {
  @ConfigModelProperty({
    description: 'Function for create default admin.',
  })
  createAdmin!: (user: {
    username?: string;
    password: string;
    email: string;
  }) => Promise<void | null>;
}
