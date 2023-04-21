import { createModel } from '@rematch/core';
import { RootModel } from '.';

interface ISysState {
  openKeys: string[]; // menu 打开的keys
}
export const sys = createModel<RootModel>()({
  state: {
    openKeys: [],
  } as ISysState, // initial state
  reducers: {
    // 控制左侧边栏menu的openkeys
    changeOpenKeys(state, payload) {
      return {
        ...state,
        openKeys: payload,
      };
    },
  },
});
