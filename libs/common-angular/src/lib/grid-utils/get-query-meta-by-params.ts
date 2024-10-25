import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { RequestMeta } from './query-meta';

export function getQueryMetaByParams(params: NzTableQueryParams): RequestMeta {
  return {
    curPage: params.pageIndex,
    perPage: params.pageSize,
    sort: params.sort
      .filter((s) => s.value)
      .reduce((all, cur) => {
        if (cur.value === 'ascend') {
          return { ...all, [cur.key]: 'asc' };
        }
        if (cur.value === 'descend') {
          return { ...all, [cur.key]: 'desc' };
        }
        return all;
      }, {}),
  };
}
