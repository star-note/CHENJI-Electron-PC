import {
  num2String,
  addParamsToUrl,
  parseUrlParams,
  isAndroidOrIOS,
  stringSort,
  addScript,
} from './utils';
import getIP from './ip';
import monitor from './monitor';
import request from './request';
import Storage from './Storage';
import { debance, throttle } from './throttle';
import { UserInfo, getUserInfo, setUserInfo, removeUserInfo } from './userInfo';
import { getBase64, getTime } from './formatter';

export {
  num2String,
  addParamsToUrl,
  parseUrlParams,
  isAndroidOrIOS,
  stringSort,
  getIP,
  monitor,
  request,
  Storage,
  throttle,
  debance,
  getUserInfo,
  setUserInfo,
  removeUserInfo,
  getBase64,
  getTime,
  addScript,
};
export type { UserInfo };
