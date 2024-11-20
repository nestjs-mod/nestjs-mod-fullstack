import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';

import { WebhookService } from '@nestjs-mod-fullstack/webhook';
import { AllowEmptyUser } from '@nestjs-mod/authorizer';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { PrismaClient as AppPrismaClient } from '@prisma/app-client';
import { randomUUID } from 'crypto';
import { AppService } from './app.service';
import { AppDemo } from './generated/rest/dto/app_demo';

export class AppData {
  @ApiProperty({ type: String })
  message!: string;
}

enum AppDemoEventName {
  'app-demo.create' = 'app-demo.create',
  'app-demo.update' = 'app-demo.update',
  'app-demo.delete' = 'app-demo.delete',
}

@AllowEmptyUser()
@Controller()
export class AppController {
  constructor(
    @InjectPrismaClient('app')
    private readonly appPrismaClient: AppPrismaClient,
    private readonly appService: AppService,
    private readonly webhookService: WebhookService<AppDemoEventName, AppDemo>
  ) {}

  @Get('/get-data')
  @ApiOkResponse({ type: AppData })
  getData() {
    return this.appService.getData();
  }

  @Post('/demo')
  @ApiCreatedResponse({ type: AppDemo })
  async demoCreateOne() {
    return await this.appPrismaClient.appDemo
      .create({
        data: { name: 'demo name' + randomUUID() },
      })
      .then(async (result) => {
        await this.webhookService.sendEvent(
          AppDemoEventName['app-demo.create'],
          result
        );
        return result;
      });
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
  async demoDeleteOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.appPrismaClient.appDemo
      .delete({ where: { id } })
      .then(async (result) => {
        await this.webhookService.sendEvent(
          AppDemoEventName['app-demo.delete'],
          result
        );
        return result;
      });
  }

  @Put('/demo/:id')
  @ApiOkResponse({ type: AppDemo })
  async demoUpdateOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.appPrismaClient.appDemo
      .update({ data: { name: 'new demo name' + randomUUID() }, where: { id } })
      .then(async (result) => {
        await this.webhookService.sendEvent(
          AppDemoEventName['app-demo.update'],
          result
        );
        return result;
      });
  }

  @Get('/demo')
  @ApiOkResponse({ type: AppDemo, isArray: true })
  async demoFindMany() {
    return await this.appPrismaClient.appDemo.findMany();
  }
}
