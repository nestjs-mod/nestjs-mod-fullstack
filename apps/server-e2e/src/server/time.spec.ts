import { RestClientHelper } from '@nestjs-mod-fullstack/testing';
import { isDateString } from 'class-validator';
import { get } from 'env-var';
import { lastValueFrom, take, toArray } from 'rxjs';

describe('Get server time from rest api and ws', () => {
  jest.setTimeout(60000);

  const correctStringDateLength = '2024-11-20T11:58:03.338Z'.length;
  const restClientHelper = new RestClientHelper({
    serverUrl: process.env.IS_DOCKER_COMPOSE
      ? get('CLIENT_URL').asString()
      : undefined,
  });
  const timeApi = restClientHelper.getTimeApi();

  it('should return time from rest api', async () => {
    const time = await timeApi.timeControllerTime();

    expect(time.status).toBe(200);
    expect(time.data).toHaveLength(correctStringDateLength);
    expect(isDateString(time.data)).toBeTruthy();
  });

  it('should return time from ws', async () => {
    const last3ChangeTimeEvents = await lastValueFrom(
      restClientHelper
        .webSocket<string>({
          path: '/ws/time',
          eventName: 'ChangeTimeStream',
        })
        .pipe(take(3), toArray())
    );

    expect(last3ChangeTimeEvents).toHaveLength(3);
    expect(last3ChangeTimeEvents[0].data).toHaveLength(correctStringDateLength);
    expect(last3ChangeTimeEvents[1].data).toHaveLength(correctStringDateLength);
    expect(last3ChangeTimeEvents[2].data).toHaveLength(correctStringDateLength);
    expect(isDateString(last3ChangeTimeEvents[0].data)).toBeTruthy();
    expect(isDateString(last3ChangeTimeEvents[1].data)).toBeTruthy();
    expect(isDateString(last3ChangeTimeEvents[2].data)).toBeTruthy();
  });
});
