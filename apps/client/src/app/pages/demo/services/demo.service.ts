import { Injectable } from '@angular/core';
import { AppRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';

@Injectable({ providedIn: 'root' })
export class DemoService {
  constructor(private readonly appRestService: AppRestService) {}

  findOne(id: string) {
    return this.appRestService.appControllerDemoFindOne(id);
  }

  findMany() {
    return this.appRestService.appControllerDemoFindMany();
  }

  updateOne(id: string) {
    return this.appRestService.appControllerDemoUpdateOne(id);
  }

  deleteOne(id: string) {
    return this.appRestService.appControllerDemoDeleteOne(id);
  }

  createOne() {
    return this.appRestService.appControllerDemoCreateOne();
  }
}
