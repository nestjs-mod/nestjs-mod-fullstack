import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import {
  TRANSLATES_CONFIG,
  TranslatesConfig,
  TranslatesService,
} from 'nestjs-translates';
import { concatMap } from 'rxjs/operators';

@Injectable()
export class TranslatesInterceptor implements NestInterceptor {
  constructor(
    @Inject(TRANSLATES_CONFIG)
    private readonly translatesConfig: TranslatesConfig,
    private readonly translatesService: TranslatesService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const req = getRequestFromExecutionContext(context);

    const out = next.handle();
    return out.pipe(
      concatMap(async (result) => {
        let locale = this.translatesConfig.defaultLocale;
        if (req) {
          locale = await this.translatesConfig.requestLocaleDetector(req);
        }
        if (locale.includes('-')) {
          locale = locale.split('-')[0];
        }

        return await this.convertObject(result, locale);
      })
    );
  }

  async convertObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any> | Record<string, any>[],
    lang: string,
    depth = 10
  ) {
    if (depth === 0) {
      return data;
    }
    if (Array.isArray(data)) {
      const newArray: unknown[] = [];
      for (const item of data) {
        newArray.push(await this.convertObject(item, lang, depth - 1));
      }
      return newArray;
    }
    if (
      typeof data === 'string' ||
      typeof data === 'number' ||
      typeof data === 'function'
    ) {
      return data;
    }
    try {
      if (typeof data === 'object') {
        const keys = Object.keys(data);
        for (const key of keys) {
          const localKey = `${key}Locale`;
          if (keys.includes(localKey)) {
            if (localKey in data && data[localKey]?.[lang]) {
              data[key] = data?.[localKey]?.[lang];
            } else {
              data[key] = this.translatesService.translate(data[key], lang);
            }
          }
        }
      }
    } catch (err) {
      return data;
    }
    return data;
  }
}
