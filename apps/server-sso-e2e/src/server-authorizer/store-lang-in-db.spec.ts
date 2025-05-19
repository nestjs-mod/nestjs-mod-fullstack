import { RestClientHelper } from '@nestjs-mod-fullstack/testing';
import { AxiosError } from 'axios';

describe('Store lang in db', () => {
  jest.setTimeout(60000);

  const user1 = new RestClientHelper();

  beforeAll(async () => {
    await user1.createAndLoginAsUser();
  });

  it('should catch error on try use not exists language code', async () => {
    try {
      await user1.getAuthApi().authControllerUpdateProfile({ lang: 'tt' });
    } catch (err) {
      expect((err as AxiosError).response?.data).toEqual({
        code: 'VALIDATION-000',
        message: 'Validation error',
        metadata: [
          {
            property: 'lang',
            constraints: [
              {
                name: 'isWrongEnumValue',
                description: 'lang must have one of the values: en, ru',
              },
            ],
          },
        ],
      });
    }
  });

  it('should catch error in Russian language on create new webhook as user1', async () => {
    await user1.getAuthApi().authControllerUpdateProfile({ lang: 'ru' });
    try {
      await user1.getWebhookApi().webhookControllerCreateOne({
        enabled: false,
        endpoint: '',
        eventName: '',
      });
    } catch (err) {
      expect((err as AxiosError).response?.data).toEqual({
        code: 'VALIDATION-000',
        message: 'Validation error',
        metadata: [
          {
            property: 'eventName',
            constraints: [
              {
                name: 'isNotEmpty',
                description: 'eventName не может быть пустым',
              },
            ],
          },
          {
            property: 'endpoint',
            constraints: [
              {
                name: 'isNotEmpty',
                description: 'endpoint не может быть пустым',
              },
            ],
          },
        ],
      });
    }
  });
});
