import { FormlyFieldConfig } from '@ngx-formly/core';

export function getFormlyFieldConfigsFromType<T, ExpT = T>(
  fields: Partial<{
    [K in keyof (T & ExpT)]: Omit<FormlyFieldConfig, 'key'>;
  }>
): FormlyFieldConfig[] {
  const result: FormlyFieldConfig[] = [];
  const keys = Object.keys(fields);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    result.push({
      key,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(fields as any)[key],
    });
  }
  return result;
}
