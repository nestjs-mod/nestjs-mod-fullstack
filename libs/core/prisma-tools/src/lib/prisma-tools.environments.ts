import {
  ArrayOfStringTransformer,
  BooleanTransformer,
  EnvModel,
  EnvModelProperty,
  NumberTransformer,
} from '@nestjs-mod/common';

@EnvModel()
export class PrismaToolsStaticEnvironments {
  @EnvModelProperty({
    description: 'Use filters',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useFilters?: boolean;

  @EnvModelProperty({
    description: 'Pagination initial page',
    transform: new NumberTransformer(),
    default: 1,
    hidden: true,
  })
  paginationInitialPage?: number;

  @EnvModelProperty({
    description: 'Pagination per page steps',
    transform: new ArrayOfStringTransformer(),
    default: [1, 2, 5, 10, 25, 100],
    hidden: true,
  })
  paginationPerPageSteps?: (number | string)[];

  @EnvModelProperty({
    description: 'Pagination per page',
    transform: new NumberTransformer(),
    default: 5,
    hidden: true,
  })
  paginationPerPage?: number;
}
