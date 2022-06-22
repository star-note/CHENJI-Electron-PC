import { createModel } from '@rematch/core';
import { Note, NotesTree } from '@/pages/noteList/note.interface';
import { RootModel } from '.';

interface IPublishState {
  loadedTarget: string[];
  electronTarget: string[];
}
export const publish = createModel<RootModel>()({
  state: {
    loadedTarget: [],
    electronTarget: [],
  } as IPublishState, // initial state
  reducers: {
    // Web发布加载的目标
    changeLoadedTarget(state, payload) {
      return {
        ...state,
        loadedTarget:
          state.loadedTarget && state.loadedTarget.indexOf(payload) > -1
            ? state.loadedTarget
            : (state.loadedTarget || []).concat(payload),
      };
    },
    // Electron发布加载的目标
    changeElectronTarget(state, payload) {
      return {
        ...state,
        electronTarget:
          state.electronTarget && state.electronTarget.indexOf(payload) > -1
            ? state.electronTarget
            : (state.electronTarget || []).concat(payload),
      };
    },
  },
});
