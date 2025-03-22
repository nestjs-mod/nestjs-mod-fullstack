import {
  BooleanTransformer,
  EnvModel,
  EnvModelProperty,
} from '@nestjs-mod/common';

@EnvModel()
export class WebhookStaticEnvironments {
  @EnvModelProperty({
    description: 'Use guards',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useGuards?: boolean;

  @EnvModelProperty({
    description: 'Use filters',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useFilters?: boolean;

  @EnvModelProperty({
    description: 'Auto create user from guard',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  autoCreateUser?: boolean;

  @EnvModelProperty({
    description: 'Search tenantId in headers',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  searchTenantIdInHeaders?: boolean;

  @EnvModelProperty({
    description: 'Search userId in headers',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  searchUserIdInHeaders?: boolean;

  @EnvModelProperty({
    description: 'Skip any guard errors',
    transform: new BooleanTransformer(),
    default: false,
    hidden: true,
  })
  skipGuardErrors?: boolean;

  @EnvModelProperty({
    description: 'User ID with super admin role',
  })
  superAdminExternalUserId?: string;
}
