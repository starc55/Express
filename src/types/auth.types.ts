export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface ApiErrorDetail {
  detail?: string;
  non_field_errors?: string[];
  email?: string[];
  password?: string[];
  [key: string]: any;
}
