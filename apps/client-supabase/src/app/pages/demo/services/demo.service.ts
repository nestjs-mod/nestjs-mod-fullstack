import { Injectable } from '@angular/core';
import { FullstackRestSdkAngularService } from '@nestjs-mod-fullstack/fullstack-rest-sdk-angular';
import { map } from 'rxjs';
import { DemoMapperService } from './demo-mapper.service';

@Injectable({ providedIn: 'root' })
export class DemoService {
  constructor(
    private readonly fullstackRestSdkAngularService: FullstackRestSdkAngularService,
    private readonly demoMapperService: DemoMapperService
  ) {}

  findOne(id: string) {
    return this.fullstackRestSdkAngularService
      .getAppApi()
      .appControllerDemoFindOne(id)
      .pipe(map(this.demoMapperService.toModel));
  }

  findMany() {
    return this.fullstackRestSdkAngularService
      .getAppApi()
      .appControllerDemoFindMany()
      .pipe(map((items) => items.map(this.demoMapperService.toModel)));
  }

  updateOne(id: string) {
    return this.fullstackRestSdkAngularService
      .getAppApi()
      .appControllerDemoUpdateOne(id)
      .pipe(map(this.demoMapperService.toModel));
  }

  deleteOne(id: string) {
    return this.fullstackRestSdkAngularService
      .getAppApi()
      .appControllerDemoDeleteOne(id);
  }

  createOne() {
    return this.fullstackRestSdkAngularService
      .getAppApi()
      .appControllerDemoCreateOne()
      .pipe(map(this.demoMapperService.toModel));
  }
}
