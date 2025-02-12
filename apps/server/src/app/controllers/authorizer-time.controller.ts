import {
  AuthRequest,
  CurrentAuthRequest,
  UseAuthInterceptorsAndGuards,
} from '@nestjs-mod-fullstack/auth';
import { AllowEmptyUser, AuthorizerGuard } from '@nestjs-mod/authorizer';
import { Controller, Get } from '@nestjs/common';

import { ApiOkResponse } from '@nestjs/swagger';
import {
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { interval, map, Observable } from 'rxjs';
import { ChangeTimeStream } from '../app.constants';

@UseAuthInterceptorsAndGuards({ guards: [AuthorizerGuard] })
@AllowEmptyUser()
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
  time(@CurrentAuthRequest() req: AuthRequest) {
    console.log(req.headers);
    return new Date();
  }

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
