import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export type AuthAsyncLocalStorageData = {
  authTimezone?: number;
};

@Injectable()
export class AuthAsyncLocalStorageContext {
  private storage: AsyncLocalStorage<AuthAsyncLocalStorageData>;

  constructor() {
    this.storage = new AsyncLocalStorage();
  }

  get() {
    return this.storage.getStore() as AuthAsyncLocalStorageData;
  }

  runWith<T = void>(context: AuthAsyncLocalStorageData, cb: () => T) {
    return this.storage.run(context, cb);
  }
}
