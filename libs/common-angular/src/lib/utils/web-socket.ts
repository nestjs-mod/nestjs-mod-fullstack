import { Observable, finalize } from 'rxjs';

export function webSocket<T>({
  address,
  eventName,
  options,
}: {
  address: string;
  eventName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
}) {
  const wss = new WebSocket(
    address.replace('/api', '').replace('http', 'ws'),
    options
  );
  return new Observable<{ data: T; event: string }>((observer) => {
    wss.addEventListener('open', () => {
      wss.addEventListener('message', ({ data }) => {
        observer.next(JSON.parse(data.toString()));
      });
      wss.addEventListener('error', (err) => {
        observer.error(err);
        if (wss?.readyState == WebSocket.OPEN) {
          wss.close();
        }
      });
      wss.send(
        JSON.stringify({
          event: eventName,
          data: true,
        })
      );
    });
  }).pipe(
    finalize(() => {
      if (wss?.readyState == WebSocket.OPEN) {
        wss.close();
      }
    })
  );
}
