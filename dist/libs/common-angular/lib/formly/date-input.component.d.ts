import { TranslocoService } from '@jsverse/transloco';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { Observable } from 'rxjs';
import { ActiveLangService } from '../services/active-lang.service';
import * as i0 from "@angular/core";
export declare class DateInputComponent extends FieldType<FieldTypeConfig> {
    private readonly translocoService;
    private readonly activeLangService;
    format$: Observable<string>;
    constructor(translocoService: TranslocoService, activeLangService: ActiveLangService);
    static ɵfac: i0.ɵɵFactoryDeclaration<DateInputComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DateInputComponent, "date-input", never, {}, {}, never, never, true, never>;
}
