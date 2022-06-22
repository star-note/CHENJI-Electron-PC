import { message } from 'antd';
import { fetch as whatwgFetch } from 'whatwg-fetch';
import configs from '../configs';

type Fetch = typeof window.fetch;
type ReponseBody = {
  status: 'error' | 'success';
  message: string;
  error: string;
  debug?: string;
  data: any;
  params?: any;
};
const fetch = window.fetch || (whatwgFetch as Fetch);

function parseJSON(response: Response | undefined) {
  return response?.json();
}

// 处理网络Code
function checkStatus(response: Response) {
  const { status } = response;
  if (status === 401) {
    message.error('登录态失效，请重新登录', 1.5, () => {
      window.location.href = `${window.location.origin}/login`;
    });
    return undefined;
  }
  return response;
}

// 处理业务Code
function checkoutCode(response: ReponseBody) {
  const { error, message: errMsg, data, status } = response || {};
  if (status === 'success') {
    return data;
  }
  message.error(`${errMsg}：${error}`);
  const resError = new Error(`${errMsg}：${error}`) as Error & {
    response: ReponseBody;
  };
  resError.response = response;
  throw resError;
}

function catchError(error: Error) {
  console.log('catchError', error);
  // 统一request请求报错处理，弹toast等

  return Promise.reject(error);
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} api       将要请求的url // 将要请求的API，从config/api中得到具体url
 * @param  {object} [options] The options we want to pass to "fetch"，参考https://github.github.io/fetch/
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(api: string, options: RequestInit) {
  return fetch(api, options)
    .then(checkStatus)
    .then(parseJSON)
    .then(checkoutCode)
    .catch(catchError);
}
