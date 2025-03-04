import { AxiosError } from 'axios';

export function getErrorData<T>(err: AxiosError<T>) {
  return (err as AxiosError).isAxiosError && err.response
    ? (err.response.data as T)
    : null;
}
