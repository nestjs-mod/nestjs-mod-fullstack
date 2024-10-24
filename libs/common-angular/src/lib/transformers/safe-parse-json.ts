// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeParseJson<T = any>(data: any): T {
  try {
    return JSON.parse(data);
  } catch (err) {
    return data;
  }
}
