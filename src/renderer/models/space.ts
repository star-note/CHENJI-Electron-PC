import { createModel } from '@rematch/core';
import { Note, NotesTree, Space } from '@/pages/noteList/note.interface';
import { Payload } from '@/middleware/wrapperRequest';
import { RootModel } from '.';

interface ISpaceState {
  createLoading: boolean;
  spaceList: Space[] | null; // 群组List
  getLoading: boolean;
  spaceNotes: Record<string, NotesTree> | null; // 每个群组的笔记树
  deleteNoteLoading: boolean;
  deletedSpaceNotes: Note[] | null;
  resumeLoading: boolean;
}
export const space = createModel<RootModel>()({
  state: {
    createLoading: false,
    spaceList: null,
    getLoading: false,
    spaceNotes: null,
    deletedSpaceNotes: null,
  } as ISpaceState,
  reducers: {
    // 新建群组
    createSpace(
      state,
      payload: Payload<{
        newSpace: Space;
      }>
    ) {
      return {
        ...state,
        createLoading: payload.loading,
        spaceList:
          payload.status === 'success'
            ? [...(state.spaceList || []), payload.data.newSpace]
            : state.spaceList,
      };
    },

    // 取得所有群组
    getAllSpace(
      state,
      payload: Payload<{
        spaces: Space[];
      }>
    ) {
      return {
        ...state,
        getLoading: payload.loading,
        ...(payload.status === 'success'
          ? { spaceList: payload.data.spaces }
          : null),
      };
    },

    // 获取某群组笔记树
    getSpaceNotes(
      state,
      payload: Payload<{ spaceNotes: NotesTree; activeSpace: Space['spaceId'] }>
    ) {
      return {
        ...state,
        getLoading: payload.loading,
        ...(payload.status === 'success'
          ? {
              spaceNotes: {
                ...state.spaceNotes,
                [payload.data.activeSpace]: payload.data.spaceNotes,
              },
            }
          : null),
      };
    },

    // 更新状态
    changeState(state, payload) {
      return {
        ...state,
        ...payload,
      };
    },

    // 删除群组笔记
    deleteNote(
      state,
      payload: Payload<{
        spaceNotes: NotesTree;
        activeSpace: Space['spaceId'];
        deleteNotes: NotesTree;
      }>
    ) {
      return {
        ...state,
        deleteNoteLoading: payload.loading,
        ...(payload.status === 'success'
          ? {
              spaceNotes: {
                ...state.spaceNotes,
                [payload.data.activeSpace]: payload.data.spaceNotes,
              },
              deletedSpaceNotes: payload.data.deleteNotes,
            }
          : null),
      };
    },
    // 获取被删除笔记
    getDeletedSpaceNotes(state, payload: Payload<{ notes: Note[] }>) {
      return {
        ...state,
        ...(payload.status === 'success'
          ? { deletedSpaceNotes: payload.data.notes }
          : null),
      };
    },
    // 恢复笔记
    resumeNotes(
      state,
      payload: Payload<{
        spaceNotes: NotesTree;
        activeSpace: Space['spaceId'];
      }>
    ) {
      return {
        ...state,
        resumeLoading: payload.loading,
        spaceNotes:
          payload.status === 'success'
            ? {
                ...state.spaceNotes,
                [payload.data.activeSpace]: payload.data.spaceNotes,
              }
            : state.spaceNotes,
      };
    },
  },
});
