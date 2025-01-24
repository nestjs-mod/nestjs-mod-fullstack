export interface RequestMeta {
  curPage: number;
  perPage: number;
  totalResults?: number;
  sort: Record<string, 'asc' | 'desc'>;
}
export declare const DEFAULT_QUERY_META: RequestMeta;
export declare function getQueryMeta(
  meta: Partial<RequestMeta>,
  defaultQueryMeta?: RequestMeta
): RequestMeta;
