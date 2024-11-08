import { Configuration, AppApi } from '@nestjs-mod-fullstack/app-rest-sdk';

describe('GET /api', () => {
  const defaultApi = new AppApi(new Configuration({ basePath: '/api' }));
  let newDemoObject: { id: string };

  it('should return a message', async () => {
    const res = await defaultApi.appControllerGetData();

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });

  it('should create and return a demo object', async () => {
    const res = await defaultApi.appControllerDemoCreateOne();

    expect(res.status).toBe(201);
    expect(res.data.name).toContain('demo name');

    newDemoObject = res.data;
  });

  it('should get demo object by id', async () => {
    const res = await defaultApi.appControllerDemoFindOne(newDemoObject.id);

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject(newDemoObject);
  });

  it('should get all demo object', async () => {
    const res = await defaultApi.appControllerDemoFindMany();

    expect(res.status).toBe(200);
    expect(res.data.filter((row) => row.id === newDemoObject.id)).toMatchObject(
      [newDemoObject]
    );
  });

  it('should delete demo object by id', async () => {
    const res = await defaultApi.appControllerDemoDeleteOne(newDemoObject.id);

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject(newDemoObject);
  });

  it('should get all demo object', async () => {
    const res = await defaultApi.appControllerDemoFindMany();

    expect(res.status).toBe(200);
    expect(res.data.filter((row) => row.id === newDemoObject.id)).toMatchObject(
      []
    );
  });
});
