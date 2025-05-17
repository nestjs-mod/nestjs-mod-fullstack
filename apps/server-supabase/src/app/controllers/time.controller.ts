import { UseAuthInterceptorsAndGuards } from '@nestjs-mod-fullstack/auth';
import { Controller, Get } from '@nestjs/common';

import { AllowEmptySupabaseUser, SupabaseGuard } from '@nestjs-mod/supabase';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { interval, map, Observable } from 'rxjs';
import { ChangeTimeStream } from '../app.constants';

@UseAuthInterceptorsAndGuards({
  guards: [SupabaseGuard],
  skipInterceptor: true,
})
@AllowEmptySupabaseUser()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/ws/time',
  transports: ['websocket'],
})
@Controller()
export class TimeController {
  @Get('/time')
  @ApiOkResponse({ type: Date })
  time() {
    return new Date();
  }

  @UseAuthInterceptorsAndGuards()
  @SubscribeMessage(ChangeTimeStream)
  onChangeTimeStream(): Observable<WsResponse<Date>> {
    return interval(1000).pipe(
      map(() => ({
        data: new Date(),
        event: ChangeTimeStream,
      }))
    );
  }
}
