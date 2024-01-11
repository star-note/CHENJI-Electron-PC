import { createModel } from '@rematch/core';
import { RootModel } from '.';
import { UserInfo } from '../utils/userInfo';
import { Payload } from '@/middleware/wrapperRequest';

interface State {
  isAuth: boolean;
  codeLoading: boolean;
  signupLoading: boolean;
  loginLoading: boolean;
  userInfo: null | UserInfo;
  code: string;
}
export const user = createModel<RootModel>()({
  state: {} as State, // initial state
  reducers: {
    // 发送验证码
    verificationCode(
      state,
      payload: Payload<{
        code: string;
      }>
    ) {
      return {
        ...state,
        codeLoading: payload.loading,
        code: payload.status === 'success' ? payload.data.code : '',
      };
    },
    // 注册
    signup(state, payload: Payload<UserInfo>) {
      return {
        ...state,
        signupLoading: payload.loading,
        userInfo: payload.status === 'success' ? payload.data : null,
      };
    },
    // 登录
    login(state, payload: Payload<UserInfo>) {
      return {
        ...state,
        loginLoading: payload.loading,
        userInfo: payload.status === 'success' ? payload.data : null,
      };
    },

    // 设置用户信息
    setUserInfo(state, userInfo: UserInfo) {
      return {
        ...state,
        userInfo,
      };
    },

    // 登出
    logout(state) {
      return {
        ...state,
        userInfo: null,
      };
    },
  },
});
