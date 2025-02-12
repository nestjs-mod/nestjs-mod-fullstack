import { RestClientHelper } from '@nestjs-mod-fullstack/testing';

describe('GET /api (ru)', () => {
  jest.setTimeout(60000);

  const appApi = new RestClientHelper({ activeLang: 'ru' }).getAppApi();
  let newDemoObject: { id: string };

  it('should return a message', async () => {
    const res = await appApi.appControllerGetData();

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Привет АПИ' });
  });
  xdescribe('', () => {
    it('should create and return a demo object', async () => {
      const res = await appApi.appControllerDemoCreateOne();

      expect(res.status).toBe(201);
      expect(res.data.name).toContain('demo name');

      newDemoObject = res.data;
    });

    it('should get demo object by id', async () => {
      const res = await appApi.appControllerDemoFindOne(newDemoObject.id);

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject(newDemoObject);
    });

    it('should get all demo object', async () => {
      const res = await appApi.appControllerDemoFindMany();

      expect(res.status).toBe(200);
      expect(
        res.data.filter((row) => row.id === newDemoObject.id)
      ).toMatchObject([newDemoObject]);
    });

    it('should delete demo object by id', async () => {
      const res = await appApi.appControllerDemoDeleteOne(newDemoObject.id);

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject(newDemoObject);
    });

    it('should get all demo object', async () => {
      const res = await appApi.appControllerDemoFindMany();

      expect(res.status).toBe(200);
      expect(
        res.data.filter((row) => row.id === newDemoObject.id)
      ).toMatchObject([]);
    });
  });
});
