export interface RequestMeta {
  curPage: number;
  perPage: number;
  totalResults?: number;
  sort: Record<string, 'asc' | 'desc'>;
}

export const DEFAULT_QUERY_META: RequestMeta = {
  curPage: 1,
  perPage: 5,
  sort: { createdAt: 'desc' },
};

export function getQueryMeta(
  meta: Partial<RequestMeta>,
  defaultQueryMeta?: RequestMeta
): RequestMeta {
  return {
    sort:
      Object.keys(meta.sort || {}).length === 0
        ? defaultQueryMeta?.sort || { createdAt: 'desc' }
        : meta.sort || {},
    curPage: !meta.curPage
      ? defaultQueryMeta?.curPage || DEFAULT_QUERY_META.curPage
      : meta.curPage,
    perPage: !meta.perPage
      ? defaultQueryMeta?.perPage || DEFAULT_QUERY_META.perPage
      : meta.perPage,
  };
}
