import { RestClientHelper } from '@nestjs-mod-fullstack/testing';
import { isDateString } from 'class-validator';
import { get } from 'env-var';
import { lastValueFrom, take, toArray } from 'rxjs';

describe('Get server time from rest api and ws (timezone)', () => {
  jest.setTimeout(60000);

  const correctStringDateLength = '0000-00-00T00:00:00.000Z'.length;
  const restClientHelper = new RestClientHelper({
    serverUrl: process.env.IS_DOCKER_COMPOSE
      ? get('CLIENT_URL').asString()
      : undefined,
  });

  beforeAll(async () => {
    await restClientHelper.createAndLoginAsUser();
  });

  it('should return time from rest api in two different time zones', async () => {
    const time = await restClientHelper.getTimeApi().timeControllerTime();

    expect(time.status).toBe(200);
    expect(time.data).toHaveLength(correctStringDateLength);
    expect(isDateString(time.data)).toBeTruthy();

    await restClientHelper
      .getAuthApi()
      .authControllerUpdateProfile({ timezone: -3 });

    const time2 = await restClientHelper.getTimeApi().timeControllerTime();

    expect(time2.status).toBe(200);
    expect(time2.data).toHaveLength(correctStringDateLength);
    expect(isDateString(time2.data)).toBeTruthy();

    expect(
      +new Date(time.data as unknown as string) -
        +new Date(time2.data as unknown as string)
    ).toBeGreaterThanOrEqual(3 * 60 * 1000);
  });

  it('should return time from ws in two different time zones', async () => {
    await restClientHelper
      .getAuthApi()
      .authControllerUpdateProfile({ timezone: null });

    const { data: oldTime } = await restClientHelper
      .getTimeApi()
      .timeControllerTime();

    const last3ChangeTimeEvents = await lastValueFrom(
      restClientHelper
        .webSocket<string>({
          path: `/ws/time?token=${restClientHelper.authData?.session?.access_token}`,
          eventName: 'ChangeTimeStream',
        })
        .pipe(take(3), toArray())
    );

    expect(last3ChangeTimeEvents).toHaveLength(3);

    await restClientHelper
      .getAuthApi()
      .authControllerUpdateProfile({ timezone: -3 });

    const { data: newTime } = await restClientHelper
      .getTimeApi()
      .timeControllerTime();

    const newLast3ChangeTimeEvents = await lastValueFrom(
      restClientHelper
        .webSocket<string>({
          path: `/ws/time?token=${restClientHelper.authData?.session?.access_token}`,
          eventName: 'ChangeTimeStream',
        })
        .pipe(take(3), toArray())
    );

    expect(newLast3ChangeTimeEvents).toHaveLength(3);

    expect(
      +new Date(last3ChangeTimeEvents[0].data as unknown as string) -
        +new Date(newLast3ChangeTimeEvents[0].data as unknown as string)
    ).toBeGreaterThanOrEqual(3 * 60 * 1000);
    expect(
      +new Date(last3ChangeTimeEvents[1].data as unknown as string) -
        +new Date(newLast3ChangeTimeEvents[1].data as unknown as string)
    ).toBeGreaterThanOrEqual(3 * 60 * 1000);
    expect(
      +new Date(last3ChangeTimeEvents[2].data as unknown as string) -
        +new Date(newLast3ChangeTimeEvents[2].data as unknown as string)
    ).toBeGreaterThanOrEqual(3 * 60 * 1000);
  });
});
