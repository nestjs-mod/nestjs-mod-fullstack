import { Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { ApiCreatedResponse, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { PrismaClient as AppPrismaClient } from '@prisma/app-client';
import { randomUUID } from 'crypto';
import { AppService } from './app.service';
import { AppDemo } from './generated/rest/dto/app_demo';

export class AppData {
  @ApiProperty({ type: String })
  message: string;
}


@Controller()
export class AppController {
  constructor(
    @InjectPrismaClient()
    private readonly appPrismaClient: AppPrismaClient,
    private readonly appService: AppService) { }

  @Get()
  @ApiResponse({ type: AppData })
  getData() {
    return this.appService.getData();
  }

  @Post('/demo')
  @ApiCreatedResponse({ type: AppDemo })
  async demoCreateOne() {
    return await this.appPrismaClient.appDemo.create({ data: { name: 'demo name' + randomUUID() } })
  }

  @Get('/demo/:id')
  @ApiResponse({ type: AppDemo })
  async demoFindOne(@Param('id') id: string) {
    return await this.appPrismaClient.appDemo.findFirstOrThrow({ where: { id } })
  }

  @Delete('/demo/:id')
  @ApiResponse({ type: AppDemo })
  async demoDeleteOne(@Param('id') id: string) {
    return await this.appPrismaClient.appDemo.delete({ where: { id } })
  }

  @Get('/demo')
  @ApiResponse({ type: AppDemo, isArray: true })
  async demoFindMany() {
    return await this.appPrismaClient.appDemo.findMany()
  }
}
