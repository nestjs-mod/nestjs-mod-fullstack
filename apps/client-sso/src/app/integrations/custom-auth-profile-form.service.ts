import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import {
  AuthUserScalarFieldEnumInterface,
  ValidationErrorMetadataInterface,
} from '@nestjs-mod-fullstack/fullstack-rest-sdk-angular';
import {
  AuthLoginInput,
  AuthProfileFormService,
} from '@nestjs-mod-fullstack/auth-angular';
import { ValidationService } from '@nestjs-mod/afat';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormlyFieldConfig } from '@ngx-formly/core';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class CustomAuthProfileFormService extends AuthProfileFormService {
  private utcTimeZones = [
    {
      label: marker('UTC−12:00: Date Line (west)'),
      value: -12,
    },
    {
      label: marker('UTC−11:00: Niue, Samoa'),
      value: -11,
    },
    {
      label: marker('UTC−10:00: Hawaii-Aleutian Islands'),
      value: -10,
    },
    {
      label: marker('UTC−09:30: Marquesas Islands'),
      value: -9.5,
    },
    {
      label: marker('UTC−09:00: Alaska'),
      value: -9,
    },
    {
      label: marker('UTC−08:00: Pacific Time (US & Canada)'),
      value: -8,
    },
    {
      label: marker('UTC−07:00: Mountain Time (US & Canada)'),
      value: -7,
    },
    {
      label: marker('UTC−06:00: Central Time (US & Canada), Mexico'),
      value: -6,
    },
    {
      label: marker('UTC−05:00: Eastern Time (US & Canada), Bogota, Lima'),
      value: -5,
    },
    {
      label: marker('UTC−04:00: Atlantic Time (Canada), Caracas, La Paz'),
      value: -4,
    },
    {
      label: marker('UTC−03:30: Newfoundland'),
      value: -3.5,
    },
    {
      label: marker('UTC−03:00: Brazil, Buenos Aires, Georgetown'),
      value: -3,
    },
    {
      label: marker('UTC−02:00: Mid-Atlantic Time'),
      value: -2,
    },
    {
      label: marker('UTC−01:00: Azores, Cape Verde Islands'),
      value: -1,
    },
    {
      label: marker('UTC±00:00: Greenwich Mean Time (GMT), London, Lisbon'),
      value: 0,
    },
    {
      label: marker('UTC+01:00: Central European Time, West African Time'),
      value: 1,
    },
    {
      label: marker('UTC+02:00: Eastern European Time, Central African Time'),
      value: 2,
    },
    {
      label: marker('UTC+03:00: Moscow Time, East African Time'),
      value: 3,
    },
    {
      label: marker('UTC+03:30: Tehran'),
      value: 3.5,
    },
    {
      label: marker('UTC+04:00: Baku, Yerevan, Samara'),
      value: 4,
    },
    {
      label: marker('UTC+04:30: Afghanistan'),
      value: 4.5,
    },
    {
      label: marker('UTC+05:00: Ekaterinburg, Islamabad, Karachi, Tashkent'),
      value: 5,
    },
    {
      label: marker('UTC+05:30: Mumbai, Kolkata, Madras, New Delhi'),
      value: 5.5,
    },
    {
      label: marker('UTC+05:45: Nepal'),
      value: 5.75,
    },
    {
      label: marker('UTC+06:00: Almaty, Dhaka, Novosibirsk'),
      value: 6,
    },
    {
      label: marker('UTC+06:30: Cocos Islands, Myanmar'),
      value: 6.5,
    },
    {
      label: marker('UTC+07:00: Bangkok, Hanoi, Jakarta'),
      value: 7,
    },
    {
      label: marker('UTC+08:00: Beijing, Perth, Singapore, Hong Kong'),
      value: 8,
    },
    {
      label: marker('UTC+08:45: Center and west Australia'),
      value: 8.75,
    },
    {
      label: marker('UTC+09:00: Tokyo, Seoul, Yakutsk'),
      value: 9,
    },
    {
      label: marker('UTC+09:30: Northern Territory, Eucla Adelaide'),
      value: 9.5,
    },
    {
      label: marker('UTC+10:00: Eastern Australia, Guam, Vladivostok'),
      value: 10,
    },
    {
      label: marker('UTC+10:30: Lord Howe Island'),
      value: 10.5,
    },
    {
      label: marker('UTC+11:00: Magadan, Solomon Islands, New Caledonia'),
      value: 11,
    },
    {
      label: marker('UTC+11:30: Norfolk Island'),
      value: 11.5,
    },
    {
      label: marker('UTC+12:00: Fiji, Kamchatka, Marshall Islands'),
      value: 12,
    },
    {
      label: marker('UTC+12:45: Chatham Islands'),
      value: 12.75,
    },
    {
      label: marker('UTC+13:00: Samoa, Tonga'),
      value: 13,
    },
    {
      label: marker('UTC+14:00: Date Line (east)'),
      value: 14,
    },
  ];

  constructor(
    protected override readonly translocoService: TranslocoService,
    protected override readonly validationService: ValidationService
  ) {
    super(translocoService, validationService);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override getFormlyFields(options?: {
    data?: AuthLoginInput;
    errors?: ValidationErrorMetadataInterface[];
  }): FormlyFieldConfig[] {
    return this.validationService.appendServerErrorsAsValidatorsToFields(
      [
        ...super.getFormlyFields(),
        {
          key: AuthUserScalarFieldEnumInterface.timezone,
          type: 'select',
          validation: {
            show: true,
          },
          props: {
            label: this.translocoService.translate(
              `auth.sign-in-form.fields.timezone`
            ),
            placeholder: 'timezone',
            required: false,
            options: this.utcTimeZones.map((z) => ({
              ...z,
              label: this.translocoService.translate(z.label),
            })),
          },
        },
      ],
      options?.errors || []
    );
  }
}
