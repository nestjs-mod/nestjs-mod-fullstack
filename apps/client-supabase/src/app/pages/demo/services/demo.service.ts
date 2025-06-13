import { Injectable } from '@angular/core';
import { AppRestService } from '@nestjs-mod-fullstack/fullstack-angular-rest-sdk';
import { map } from 'rxjs';
import { DemoMapperService } from './demo-mapper.service';

@Injectable({ providedIn: 'root' })
export class DemoService {
  constructor(
    private readonly appRestService: AppRestService,
    private readonly demoMapperService: DemoMapperService
  ) {}

  findOne(id: string) {
    return this.appRestService
      .appControllerDemoFindOne(id)
      .pipe(map(this.demoMapperService.toModel));
  }

  findMany() {
    return this.appRestService
      .appControllerDemoFindMany()
      .pipe(map((items) => items.map(this.demoMapperService.toModel)));
  }

  updateOne(id: string) {
    return this.appRestService
      .appControllerDemoUpdateOne(id)
      .pipe(map(this.demoMapperService.toModel));
  }

  deleteOne(id: string) {
    return this.appRestService.appControllerDemoDeleteOne(id);
  }

  createOne() {
    return this.appRestService
      .appControllerDemoCreateOne()
      .pipe(map(this.demoMapperService.toModel));
  }
}
