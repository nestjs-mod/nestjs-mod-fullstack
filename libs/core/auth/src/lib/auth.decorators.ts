import {
  getRequestFromExecutionContext,
  prepareHeaders,
} from '@nestjs-mod/common';
import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRequest } from './types/auth-request';

import { applyDecorators } from '@nestjs/common';
import { URL } from 'node:url';
import { AuthGuard } from './auth.guard';
import { AuthRole } from './auth.prisma-sdk';
import { AuthTimezoneInterceptor } from './interceptors/auth-timezone.interceptor';

export const AllowEmptyAuthUser = Reflector.createDecorator();
export const SkipAuthGuard = Reflector.createDecorator<true>();
export const CheckAuthRole = Reflector.createDecorator<AuthRole[]>();

export const CurrentAuthRequest = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = getRequestFromExecutionContext(ctx) as AuthRequest;
    return req;
  },
);

export const CurrentAuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = getRequestFromExecutionContext(ctx) as AuthRequest;
    return req.authUser;
  },
);

function AddHandleConnection() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (constructor: Function) {
    if (constructor.prototype) {
      constructor.prototype.handleConnection = function (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client: any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
      ) {
        const url = args[0]?.url
          ? new URL(`http://localhost${args[0]?.url}`)
          : null;

        const queryToken = url?.searchParams.get('token');
        const queryClientId = url?.searchParams.get('clientId');

        const headers = prepareHeaders(args[0]?.headers);

        const authorizationHeader = headers.authorization;
        const xClientIdHeader = headers['x-client-id'];

        client.headers = {
          ...(authorizationHeader || queryToken
            ? {
                authorization: authorizationHeader
                  ? authorizationHeader
                  : queryToken
                    ? `Bearer ${queryToken}`
                    : '',
              }
            : {}),
          ...(xClientIdHeader
            ? {
                'x-client-id': xClientIdHeader || queryClientId,
              }
            : {}),
        };
      };
    }
  };
}

export function UseAuthInterceptorsAndGuards(options?: {
  // eslint-disable-next-line @typescript-eslint/ban-types
  guards?: (CanActivate | Function)[];
  skipInterceptor?: boolean;
}) {
  return applyDecorators(
    ...[
      ...(options?.skipInterceptor
        ? []
        : [UseInterceptors(AuthTimezoneInterceptor)]),
      UseGuards(...(options?.guards || []), AuthGuard),
      AllowEmptyAuthUser(),
      AddHandleConnection(),
    ],
  );
}
