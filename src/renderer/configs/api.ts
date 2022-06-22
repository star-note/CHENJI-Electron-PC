import { getUserInfo } from '@/utils';
import { apiConfig } from './apiUrl';
import configs, { Env } from './index';

// 真实环境请求的url
export function apiURL(type: string) {
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
  const { token = '' } = getUserInfo() || {};
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
    'starnote-client': `web;source=pc;version=${configs.version};env=${process.env.NODE_ENV}`,
  };
}

// 基本的Get请求options封装
export function ajaxGetOptions(
  header: Record<string, string> = {}
): RequestInit {
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
  header: Record<string, string> = {}
): RequestInit {
  return {
    method: 'POST',
    headers: {
      ...setHeader(),
      ...header,
    },
    // credentials: 'include',
    body: JSON.stringify(data),
  };
}

// form表单请求Post的options封装
export function ajaxFormPostOptions(formData: any, header = {}): RequestInit {
  return {
    method: 'POST',
    headers: {
      ...setHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
      ...header,
    },
    // credentials: 'include',
    body: formData,
  };
}
