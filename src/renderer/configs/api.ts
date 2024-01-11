import { getUserInfo } from '@/utils';
import { apiConfig } from './apiUrl';
import configs, { Env } from './index';

// 真实环境请求的url
export function apiURL(type: keyof typeof apiConfig) {
  if (apiConfig[type] && apiConfig[type].length > 0 && process.env.NODE_ENV) {
    if (configs.mockWhiteList.indexOf(apiConfig[type]) >= 0) {
      return `${configs.apiServer.mock}${apiConfig[type]}`; // Mock服务器代理
    }
    return `${configs.apiServer[process.env.NODE_ENV as Env]}${
      apiConfig[type]
    }`;
  }
  throw new Error('该api匹配不到url，请检查api名称或apiConfig配置');
}

export function setHeader() {
  const { token = '', id } = getUserInfo() || {};
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
    'starnote-client': `source=pc;version=${configs.version};env=${process.env.NODE_ENV}`,
    loginNo: String(id),
  };
}

// 基本的Get请求options封装
export function ajaxGetOptions(header: HeadersInit = {}): RequestInit {
  return {
    method: 'GET',
    headers: {
      ...setHeader(),
      ...header,
    },
  };
}

// 基本的Post请求options封装
export function ajaxPostOptions(
  data: Record<string, unknown>,
  header: HeadersInit = {}
): RequestInit {
  const { id } = getUserInfo() || {};
  return {
    method: 'POST',
    headers: {
      ...setHeader(),
      ...header,
    },
    // credentials: 'include',
    body: JSON.stringify({
      loginUserId: id,
      ...data,
    }),
  };
}

// form表单请求Post的options封装
export function ajaxFormPostOptions(
  formData: any,
  header: HeadersInit = {}
): RequestInit {
  const { token = '', id } = getUserInfo() || {};
  return {
    method: 'POST',
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'starnote-client': `source=pc;version=${configs.version};env=${process.env.NODE_ENV}`,
      loginNo: String(id),
      ...header,
    },
    // credentials: 'include',
    body: formData,
  };
}
