import { Injectable } from '@angular/core';
import { AppDemoInterface } from '@nestjs-mod-fullstack/fullstack-angular-rest-sdk';
import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import { addHours } from 'date-fns';

export interface AppDemoModel
  extends Partial<Omit<AppDemoInterface, 'createdAt' | 'updatedAt'>> {
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

@Injectable({ providedIn: 'root' })
export class DemoMapperService {
  toModel(item?: AppDemoInterface): AppDemoModel {
    return {
      ...item,
      createdAt: item?.createdAt
        ? addHours(new Date(item.createdAt), TIMEZONE_OFFSET)
        : null,
      updatedAt: item?.updatedAt
        ? addHours(new Date(item.updatedAt), TIMEZONE_OFFSET)
        : null,
    };
  }

  toForm(model: AppDemoModel) {
    return {
      ...model,
    };
  }

  toJson(data: AppDemoModel) {
    return {
      ...data,
    };
  }
}
