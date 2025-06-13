export interface AuthTokens {
  access_token?: string;
  refresh_token?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  preferredUsername: string;
  givenName?: string | null;
  familyName?: string | null;
  middleName?: string | null;
  nickname?: string | null;
  picture?: string | null;
  gender?: string | null;
  birthdate?: string | null;
  phoneNumber?: string | null;
  roles?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appData?: Record<string, any>;
}

export interface AuthLoginInput {
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface AuthSignupInput {
  email?: string;
  password: string;
  confirmPassword: string;
  givenName?: string;
  familyName?: string;
  middleName?: string;
  nickname?: string;
  picture?: string;
  gender?: string;
  birthdate?: string;
  phoneNumber?: string;
  roles?: string[];
  redirectUri?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appData?: Record<string, any>;
}

export interface AuthUserAndTokens {
  tokens?: AuthTokens;
  user?: AuthUser;
}

export interface AuthUpdateProfileInput {
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  middleName?: string;
  nickname?: string;
  gender?: string;
  birthdate?: string;
  phoneNumber?: string;
  picture?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appData?: Record<string, any>;
}

export interface AuthCompleteSignUpInput {
  code: string;
}

export interface AuthForgotPasswordInput {
  email: string;
  redirectUri?: string;
}

export interface AuthCompleteForgotPasswordInput {
  code: string;
  password: string;
  confirmPassword: string;
}

export type OAuthProvider = {
  name: string;
  url: string;
};

export interface OAuthVerificationInput {
  verificationCode: string;
  clientId: string | undefined;
}
