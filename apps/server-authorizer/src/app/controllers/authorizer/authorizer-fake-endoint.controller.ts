/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
} from '@nestjs/common';

import { AllowEmptyAuthUser } from '@nestjs-mod-fullstack/auth';
import { AllowEmptyUser } from '@nestjs-mod/authorizer';
import { KeyvService } from '@nestjs-mod/keyv';
import { CACHE_KEY } from '../../app.constants';
import { AppHandlerLog } from '../../types/app-handler-log';

@AllowEmptyUser()
@AllowEmptyAuthUser()
@Controller('fake-endpoint')
export class FakeEndpointController {
  private logger = new Logger(FakeEndpointController.name);

  constructor(private readonly keyvService: KeyvService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async fakeEndpointHandler(@Body() body: any, @Headers() headers: any) {
    const appHandlerLogs: AppHandlerLog[] =
      (await this.keyvService.get<any>(CACHE_KEY)) || [];
    if (headers['app-id']) {
      try {
        appHandlerLogs.push({
          appId: headers['app-id'],
          body: body,
          headers: headers,
        });
        await this.keyvService.set(CACHE_KEY, appHandlerLogs);
      } catch (err) {
        this.logger.debug({
          appId: headers['app-id'],
          body: body,
          headers: headers,
        });
        throw err;
      }
    }
    return body;
  }

  @Get('/logs/:appId')
  async fakeEndpointLogs(@Param('appId') appId: string) {
    const appHandlerLogs: AppHandlerLog[] =
      (await this.keyvService.get<any>(CACHE_KEY)) || [];
    return appHandlerLogs.filter((log) => log.appId === appId);
  }
}
