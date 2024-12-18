import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import {
  createParamDecorator,
  ExecutionContext,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRole } from '@prisma/auth-client';
import { AuthRequest } from './types/auth-request';

import { AllowEmptyUser, AuthorizerGuard } from '@nestjs-mod/authorizer';
import { applyDecorators } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthTimezoneInterceptor } from './interceptors/auth-timezone.interceptor';

export const SkipAuthGuard = Reflector.createDecorator<true>();
export const CheckAuthRole = Reflector.createDecorator<AuthRole[]>();

export const CurrentAuthRequest = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = getRequestFromExecutionContext(ctx) as AuthRequest;
    return req;
  }
);

export const CurrentAuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = getRequestFromExecutionContext(ctx) as AuthRequest;
    return req.authUser;
  }
);

function AddHandleConnection() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (constructor: Function) {
    constructor.prototype.handleConnection = function (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...args: any[]
    ) {
      const authorizationHeader = args[0]?.headers.authorization;
      const queryToken = args[0]?.url?.split('token=')?.[1];
      client.headers = {
        authorization:
          authorizationHeader || queryToken ? `Bearer ${queryToken}` : '',
      };
    };
  };
}

export function UseAuthInterceptorsAndGuards(options?: {
  allowEmptyUser?: boolean;
}) {
  return applyDecorators(
    UseInterceptors(AuthTimezoneInterceptor),
    UseGuards(AuthorizerGuard, AuthGuard),
    AddHandleConnection(),
    ...(options?.allowEmptyUser ? [AllowEmptyUser()] : [])
  );
}
