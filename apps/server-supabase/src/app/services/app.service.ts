import { Injectable } from '@nestjs/common';
import { TranslateFunction } from 'nestjs-translates';

@Injectable()
export class AppService {
  getData(getText: TranslateFunction): { message: string } {
    return { message: getText('Hello API') };
  }
}
