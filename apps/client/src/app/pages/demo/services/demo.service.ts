import { Injectable } from '@angular/core';
import { DefaultRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';

@Injectable({ providedIn: 'root' })
export class DemoService {
  constructor(private readonly defaultRestService: DefaultRestService) {}

  findOne(id: string) {
    return this.defaultRestService.appControllerDemoFindOne(id);
  }

  findMany() {
    return this.defaultRestService.appControllerDemoFindMany();
  }

  updateOne(id: string) {
    return this.defaultRestService.appControllerDemoUpdateOne(id);
  }

  deleteOne(id: string) {
    return this.defaultRestService.appControllerDemoDeleteOne(id);
  }

  createOne() {
    return this.defaultRestService.appControllerDemoCreateOne();
  }
}
