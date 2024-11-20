import { Controller, Get } from '@nestjs/common';

import { AllowEmptyUser } from '@nestjs-mod/authorizer';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { interval, map, Observable } from 'rxjs';

export const ChangeTimeStream = 'ChangeTimeStream';

@AllowEmptyUser()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/ws/time',
  transports: ['websocket'],
})
@Controller()
export class TimeController implements OnGatewayConnection {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleConnection(client: any, ...args: any[]) {
    client.headers = args[0].headers;
  }

  @Get('/time')
  @ApiOkResponse({ type: Date })
  time() {
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
