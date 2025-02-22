import {
  BooleanTransformer,
  EnvModel,
  EnvModelProperty,
} from '@nestjs-mod/common';

@EnvModel()
export class ValidationStaticEnvironments {
  @EnvModelProperty({
    description: 'Use pipes',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  usePipes?: boolean;

  @EnvModelProperty({
    description: 'Use filters',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useFilters?: boolean;
}
