import { init, RematchDispatch, RematchRootState } from '@rematch/core';
import { request } from '@/utils';
import { apiURL, ajaxPostOptions, ajaxGetOptions } from './configs/api';
import { ApiDict } from './configs/request-info';
import { wrapperRequest } from './middleware/wrapperRequest';
import { models, RootModel } from './models';

const promiseMiddlewareConfig = {
  fetch: request,
  urlProc: (apiName: string) => apiURL(apiName),
  fetchOptionsProc: (data: any, headers = {}, method = 'POST') =>
    method === 'POST'
      ? ajaxPostOptions(data, headers)
      : ajaxGetOptions(headers),
  errorCallback: () => console.log('攻城狮开小差了，请稍后重试～'),
};

const store = init({
  models,
  redux: {
    middlewares: [wrapperRequest.bind(null, promiseMiddlewareConfig)],
  },
});

export default store;

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;

type ChangeDispatchType<
  T extends Record<
    string | number,
    Record<string | symbol | number, (...args: never[]) => unknown>
  >
> = {
  [k in keyof T]: {
    [ik in keyof T[k]]: <A extends keyof ApiDict | undefined>(
      payload: A extends keyof ApiDict
        ? {
            params: ApiDict[A]['request'];
            apiName: A;
          }
        : Parameters<T[k][ik]>[0]['payload']
    ) => A extends keyof ApiDict
      ? Promise<ApiDict[A]['response']>
      : ReturnType<T[k][ik]>;
  };
};

export type DispatchPro = ChangeDispatchType<Dispatch>;
