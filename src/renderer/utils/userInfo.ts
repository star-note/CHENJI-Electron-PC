import Storage from './Storage';
import store from '../store';

export interface UserInfo {
  token: string;
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  mobile?: string;
  nickName?: string;
}
export const getUserInfo = (): UserInfo | null => {
  const { userInfo } = store.getState().user;
  if (userInfo && Object.keys(userInfo).length > 0) {
    return userInfo;
  }
  return Storage.get('userInfo') || null;
};

export const setUserInfo = (userInfo: UserInfo) => {
  Storage.set('userInfo', userInfo, 24 * 30 * 2); // 默认60天的缓存有效时间
};

export const removeUserInfo = () => {
  Storage.remove('userInfo');
};

// export const getDeviceId = (): string => {
//   let deviceId = Storage.get('deviceId');
//   if (deviceId) {
//     return deviceId;
//   }

//   deviceId = MD5(window.navigator.userAgent);
//   Storage.set('deviceId', deviceId);
//   return deviceId;
// };
