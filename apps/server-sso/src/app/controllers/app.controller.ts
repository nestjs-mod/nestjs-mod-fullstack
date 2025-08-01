import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';

import { AllowEmptyAuthUser } from '@nestjs-mod-fullstack/auth';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { AllowEmptySsoUser, CurrentSsoUser } from '@nestjs-mod/sso';
import { WebhookService } from '@nestjs-mod/webhook';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { InjectTranslateFunction, TranslateFunction } from 'nestjs-translates';
import { APP_FEATURE } from '../app.constants';
import { AppPrismaSdk } from '../app.prisma-sdk';
import { AppDemo } from '../generated/rest/dto/app-demo.entity';
import { AppService } from '../services/app.service';
import { AppData } from '../types/app-data';
import { AppDemoEventName } from '../types/app-demo-event-name';

@AllowEmptySsoUser()
@AllowEmptyAuthUser()
@Controller()
export class AppController {
  constructor(
    @InjectPrismaClient(APP_FEATURE)
    private readonly appPrismaClient: AppPrismaSdk.PrismaClient,
    private readonly appService: AppService,
    private readonly webhookService: WebhookService<AppDemoEventName, AppDemo>,
  ) {}

  @Get('/get-data')
  @ApiOkResponse({ type: AppData })
  getData(@InjectTranslateFunction() getText: TranslateFunction) {
    return this.appService.getData(getText);
  }

  @Post('/demo')
  @ApiCreatedResponse({ type: AppDemo })
  async demoCreateOne(@CurrentSsoUser() externalUser?: { id: string }) {
    const result = await this.appPrismaClient.appDemo.create({
      data: { name: 'demo name' + randomUUID() },
    });

    await this.webhookService.sendEvent({
      eventBody: result,
      eventHeaders: { ['external-user-id']: externalUser?.id },
      eventName: AppDemoEventName['app-demo.create'],
    });

    return result;
  }

  @Get('/demo/:id')
  @ApiOkResponse({ type: AppDemo })
  async demoFindOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.appPrismaClient.appDemo.findFirstOrThrow({
      where: { id },
    });
  }

  @Delete('/demo/:id')
  @ApiOkResponse({ type: AppDemo })
  async demoDeleteOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentSsoUser() externalUser?: { id: string },
  ) {
    const result = await this.appPrismaClient.appDemo.delete({ where: { id } });

    await this.webhookService.sendEvent({
      eventBody: result,
      eventHeaders: { ['external-user-id']: externalUser?.id },
      eventName: AppDemoEventName['app-demo.delete'],
    });

    return result;
  }

  @Put('/demo/:id')
  @ApiOkResponse({ type: AppDemo })
  async demoUpdateOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentSsoUser() externalUser?: { id: string },
  ) {
    const result = await this.appPrismaClient.appDemo.update({
      data: { name: 'new demo name' + randomUUID(), updatedAt: new Date() },
      where: { id },
    });

    await this.webhookService.sendEvent({
      eventBody: result,
      eventHeaders: { ['external-user-id']: externalUser?.id },
      eventName: AppDemoEventName['app-demo.update'],
    });

    return result;
  }

  @Get('/demo')
  @ApiOkResponse({ type: AppDemo, isArray: true })
  async demoFindMany() {
    return await this.appPrismaClient.appDemo.findMany();
  }
}
