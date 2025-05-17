import { RestClientHelper } from '@nestjs-mod-fullstack/testing';
import { AxiosError } from 'axios';

describe('Validation', () => {
  jest.setTimeout(60000);

  const user1 = new RestClientHelper();

  beforeAll(async () => {
    await user1.createAndLoginAsUser();
  });

  it('should catch error on create new webhook as user1', async () => {
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
                description: 'eventName should not be empty',
              },
            ],
          },
          {
            property: 'endpoint',
            constraints: [
              {
                name: 'isNotEmpty',
                description: 'endpoint should not be empty',
              },
            ],
          },
        ],
      });
    }
  });
});
