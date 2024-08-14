import { Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaClient as AppPrismaClient } from '@prisma/app-client';
import { randomUUID } from 'crypto';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(
    @InjectPrismaClient()
    private readonly appPrismaClient: AppPrismaClient,
    private readonly appService: AppService) { }

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post('/demo')
  async demoCreateOne() {
    return await this.appPrismaClient.appDemo.create({ data: { name: 'demo name' + randomUUID() } })
  }

  @Get('/demo/:id')
  async demoFindOne(@Param('id') id: string) {
    return await this.appPrismaClient.appDemo.findFirstOrThrow({ where: { id } })
  }

  @Delete('/demo/:id')
  async demoDeleteOne(@Param('id') id: string) {
    return await this.appPrismaClient.appDemo.delete({ where: { id } })
  }

  @Get('/demo')
  async demoFindMany() {
    return await this.appPrismaClient.appDemo.findMany()
  }
}
