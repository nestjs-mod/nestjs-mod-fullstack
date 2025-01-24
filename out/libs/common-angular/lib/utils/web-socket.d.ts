import { Observable } from 'rxjs';
export declare function webSocket<T>({
  address,
  eventName,
  options,
}: {
  address: string;
  eventName: string;
  options?: any;
}): Observable<{
  data: T;
  event: string;
}>;
