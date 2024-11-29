import { Inject, Scope, ValidationPipe } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { ArgumentMetadata } from '@nestjs/common/interfaces/features/pipe-transform.interface';
import { REQUEST } from '@nestjs/core';
import {
  TRANSLATES_CONFIG,
  TranslatesConfig,
  TranslatesStorage,
} from 'nestjs-translates';

@Injectable({ scope: Scope.REQUEST })
export class TranslatesPipe extends ValidationPipe {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(REQUEST) private readonly req: any,
    @Inject(TRANSLATES_CONFIG)
    private readonly translatesConfig: TranslatesConfig,
    private readonly translatesStorage: TranslatesStorage
  ) {
    super({
      validatorPackage: require('class-validator'),
      transformerPackage: require('class-transformer'),
      ...(translatesConfig.validationPipeOptions || {}),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public override async transform(value: any, metadata: ArgumentMetadata) {
    let locale = this.translatesConfig.defaultLocale;
    if (this.req) {
      locale = await this.translatesConfig.requestLocaleDetector(this.req);
    }
    if (locale.includes('-')) {
      locale = locale.split('-')[0];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.validatorOptions as any).messages =
      this.translatesStorage.translates[locale] ||
      this.translatesStorage.translates[this.translatesConfig.defaultLocale];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.validatorOptions as any).titles =
      this.translatesStorage.translates[locale] ||
      this.translatesStorage.translates[this.translatesConfig.defaultLocale];

    return super.transform(value, metadata);
  }
}
