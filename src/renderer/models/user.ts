import { createModel } from '@rematch/core';
import { RootModel } from '.';
import { UserInfo } from '../utils/userInfo';

export const user = createModel<RootModel>()({
  state: {
    isAuth: false,
    codeLoading: false,
    signupLoading: false,
    loginLoading: false,
    userInfo: {} as UserInfo,
    code: '',
  }, // initial state
  reducers: {
    // 发送验证码
    verificationCode(
      state,
      payload: {
        loading: boolean;
        status: string;
        data: {
          code: string;
        };
      }
    ) {
      return {
        ...state,
        codeLoading: payload.loading,
        ...(payload.status === 'success' ? { code: payload.data.code } : null),
      };
    },
    // 注册
    signup(
      state,
      payload: {
        loading: boolean;
        status: string;
        data: UserInfo;
      }
    ) {
      return {
        ...state,
        signupLoading: payload.loading,
        ...(payload.status === 'success' ? { userInfo: payload.data } : null),
      };
    },
    // 登录
    login(
      state,
      payload: {
        loading: boolean;
        status: string;
        data: UserInfo;
      }
    ) {
      return {
        ...state,
        loginLoading: payload.loading,
        ...(payload.status === 'success' ? { userInfo: payload.data } : null),
      };
    },

    // 设置用户信息
    setUserInfo(state, userInfo: UserInfo) {
      return {
        ...state,
        userInfo,
      };
    },
  },
});
