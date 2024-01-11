import { createModel } from '@rematch/core';
import { RootModel } from '.';
import { Note } from '@/pages/noteList/note.interface';
import { Payload } from '@/middleware/wrapperRequest';

interface ISysState {
  searchNotes: any;
  openKeys: string[]; // menu 打开的keys
}
export const sys = createModel<RootModel>()({
  state: {
    openKeys: [],
    searchNotes: null,
  } as ISysState, // initial state
  reducers: {
    // 控制左侧边栏menu的openkeys
    changeOpenKeys(state, payload) {
      return {
        ...state,
        openKeys: payload,
      };
    },

    // 全局搜索笔记
    searchAll(state, payload: Payload<any>) {
      return {
        ...state,
        searchNotes: payload.status === 'success' ? payload.data : null,
      };
    },
  },
});
