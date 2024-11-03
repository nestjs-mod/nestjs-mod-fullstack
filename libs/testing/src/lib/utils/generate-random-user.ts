import { faker } from '@faker-js/faker';

export interface GenerateRandomUserResult {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  num: any;
  phone: string;
  uniqId: string;
  email: string;
  newEmail: string;
  firstName: string;
  middleName: string;
  lastName: string;
  password: string;
  newPassword: string;
  otp: string;
  createdAt: Date;
  dateOfBirth: Date;
  country: string;
  company: string;
  prefix?: string;
  site?: string;
}

export async function generateRandomUser(
  prefix?: string,
  options?: Partial<GenerateRandomUserResult>
): Promise<Required<GenerateRandomUserResult>> {
  prefix = prefix || 'test';
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const num = options?.num || faker.number.int({ min: 1000, max: 9999 });
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const phone = options?.phone || faker.phone.number();

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const uniqId = options?.uniqId || faker.string.nanoid();
  const firstName =
    options?.firstName || `${prefix}${uniqId}${faker.person.firstName()}`;
  const middleName =
    options?.middleName || `${prefix}${uniqId}${faker.person.middleName()}`;
  const lastName =
    options?.lastName || `${prefix}${uniqId}${faker.person.lastName()}`;

  const email =
    options?.email ||
    faker.internet.email({
      firstName,
      lastName,
      provider: 'example.fakerjs.dev',
    });

  const newEmail =
    options?.newEmail ||
    faker.internet.email({
      firstName,
      lastName,
      provider: 'example.fakerjs.dev',
    });

  const password =
    options?.password ||
    `${prefix}pA$$w0rd${num}${faker.internet.password({
      length: 5,
    })}`;

  return {
    ...options,
    id: faker.string.uuid(),
    num,
    phone,
    uniqId,
    email,
    newEmail,
    firstName,
    middleName,
    lastName,
    password,
    newPassword: `${password}new`,
    otp: '1234',
    createdAt: new Date(),
    dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
    country: 'USA',
    company: faker.company.name(),
    prefix,
    site: `https://${faker.internet.domainName()}`,
  };
}
