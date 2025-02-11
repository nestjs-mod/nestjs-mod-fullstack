export interface AuthTokens {
  access_token?: string;
  refresh_token?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  preferred_username: string;
  given_name?: string | null;
  family_name?: string | null;
  middle_name?: string | null;
  nickname?: string | null;
  picture?: string | null;
  gender?: string | null;
  birthdate?: string | null;
  phone_number?: string | null;
  roles?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app_data?: Record<string, any>;
}

export interface AuthLoginInput {
  email?: string;
  phone_number?: string;
  password: string;
}

export interface AuthSignupInput {
  email?: string;
  password: string;
  confirm_password: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  picture?: string;
  gender?: string;
  birthdate?: string;
  phone_number?: string;
  roles?: string[];
  redirect_uri?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app_data?: Record<string, any>;
}

export interface AuthUserAndTokens {
  tokens?: AuthTokens;
  user?: AuthUser;
}

export interface AuthUpdateProfileInput {
  old_password?: string;
  new_password?: string;
  confirm_new_password?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  gender?: string;
  birthdate?: string;
  phone_number?: string;
  picture?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app_data?: Record<string, any>;
}

export interface AuthForgotPasswordInput {
  email?: string;
  phone_number?: string;
  state?: string;
  redirect_uri?: string;
}

export interface AuthResetPasswordInput {
  token?: string;
  otp?: string;
  phone_number?: string;
  password: string;
  confirm_password: string;
}
