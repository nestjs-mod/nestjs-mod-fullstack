import {
  getNestModuleDecorators,
  getNestModuleInternalUtils,
  getRequestFromExecutionContext,
} from '@nestjs-mod/common';
import { Reflector } from '@nestjs/core';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SUPABASE_MODULE } from './supabase.constants';
import { CheckAccessOptions, SupabaseRequest } from './supabase.types';

export const { InjectService: InjectSupabaseService } = getNestModuleDecorators(
  {
    moduleName: SUPABASE_MODULE,
  }
);

export const {
  getServiceToken: getSupabaseServiceToken,
  getEnvironmentsLoaderToken: getSupabaseEnvironmentsLoaderToken,
} = getNestModuleInternalUtils({
  moduleName: SUPABASE_MODULE,
});

export const AllowEmptySupabaseUser = Reflector.createDecorator();

export const CheckSupabaseAccess =
  Reflector.createDecorator<CheckAccessOptions>();

export const CurrentSupabaseUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = getRequestFromExecutionContext(ctx) as SupabaseRequest;
    return request.supabaseUser;
  }
);

export const CurrentSupabaseUserToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = getRequestFromExecutionContext(ctx) as SupabaseRequest;

    return request?.headers?.authorization?.split(' ')[1];
  }
);
