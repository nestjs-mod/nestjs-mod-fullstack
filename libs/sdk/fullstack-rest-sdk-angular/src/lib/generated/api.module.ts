import {
  NgModule,
  ModuleWithProviders,
  SkipSelf,
  Optional,
} from '@angular/core';
import { FullstackRestClientConfiguration } from './configuration';
import { HttpClient } from '@angular/common/http';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: [],
})
export class FullstackRestClientApiModule {
  public static forRoot(
    configurationFactory: () => FullstackRestClientConfiguration
  ): ModuleWithProviders<FullstackRestClientApiModule> {
    return {
      ngModule: FullstackRestClientApiModule,
      providers: [
        {
          provide: FullstackRestClientConfiguration,
          useFactory: configurationFactory,
        },
      ],
    };
  }

  constructor(
    @Optional() @SkipSelf() parentModule: FullstackRestClientApiModule,
    @Optional() http: HttpClient
  ) {
    if (parentModule) {
      throw new Error(
        'FullstackRestClientApiModule is already loaded. Import in your base AppModule only.'
      );
    }
    if (!http) {
      throw new Error(
        'You need to import the HttpClientModule in your AppModule! \n' +
          'See also https://github.com/angular/angular/issues/20575'
      );
    }
  }
}
