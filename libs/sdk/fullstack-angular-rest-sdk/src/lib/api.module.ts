import {
  NgModule,
  ModuleWithProviders,
  SkipSelf,
  Optional,
} from '@angular/core';
import { RestClientConfiguration } from './configuration';
import { HttpClient } from '@angular/common/http';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: [],
})
export class RestClientApiModule {
  public static forRoot(
    configurationFactory: () => RestClientConfiguration
  ): ModuleWithProviders<RestClientApiModule> {
    return {
      ngModule: RestClientApiModule,
      providers: [
        { provide: RestClientConfiguration, useFactory: configurationFactory },
      ],
    };
  }

  constructor(
    @Optional() @SkipSelf() parentModule: RestClientApiModule,
    @Optional() http: HttpClient
  ) {
    if (parentModule) {
      throw new Error(
        'RestClientApiModule is already loaded. Import in your base AppModule only.'
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
