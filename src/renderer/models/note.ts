import { createModel } from '@rematch/core';
import { Note, NotesTree } from '@/pages/noteList/note.interface';
import { RootModel } from '.';

interface INoteState {
  saveLoading: boolean;
  getLoading: boolean;
  activeNote: undefined | Note;
  getFirstLoading: boolean;
  firstNotes: null | NotesTree;
  saveStatus: null | string;
  initContent: null | string;
  editing: boolean;
}
export const note = createModel<RootModel>()({
  state: {
    saveLoading: false,
    getLoading: false,
    activeNote: undefined, // 选中的笔记树内容，默认为undefined，当为新增笔记时，{noteId: null, title: null}，当为activeNote.id为null时应该在新增笔记
    noteContent: null,
    getFirstLoading: false,
    firstNotes: null,
    saveStatus: null,
    initContent: null, // 笔记编辑器的初始内容，不能直接使用activeNote，解释详见编辑器使用的地方
    editing: false, // 笔记是否是在编辑中或者新增中
  } as INoteState, // initial state
  reducers: {
    // 新建笔记
    createNote(
      state,
      payload: {
        loading: boolean;
        status: string;
        data: {
          note: Note;
        };
      }
    ) {
      return {
        ...state,
        saveLoading: payload.loading,
        saveStatus: payload.status,
        ...(payload.status === 'success'
          ? { activeNote: payload.data.note }
          : null),
      };
    },
    // 保存笔记
    saveNote(
      state,
      payload: {
        loading: boolean;
        status: string;
        data: {
          note: Note;
        };
      }
    ) {
      return {
        ...state,
        saveLoading: payload.loading,
        saveStatus: payload.status,
        ...(payload.status === 'success'
          ? { activeNote: payload.data.note }
          : null),
      };
    },
    // 获取笔记内容
    getNote(
      state,
      payload: {
        loading: boolean;
        status: string;
        data: {
          note: Note;
        };
      }
    ) {
      return {
        ...state,
        getLoading: payload.loading,
        ...(payload.status === 'success'
          ? {
              activeNote: payload.data.note,
              initContent: payload.data.note.content
                ? JSON.parse(payload.data.note.content)
                : null,
            }
          : null),
      };
    },
    // 获取第一列笔记树
    getUserNotes(
      state,
      payload: {
        loading: boolean;
        status: string;
        data: {
          notes: NotesTree;
        };
      }
    ) {
      return {
        ...state,
        getFirstLoading: payload.loading,
        ...(payload.status === 'success'
          ? { firstNotes: payload.data.notes }
          : null),
      };
    },
    // // 清空显示笔记内容
    // clearNoteContent(state) {
    //   return {
    //     ...state,
    //     activeNote: undefined,
    //   };
    // },
    // 前端先新增笔记，保存在内存中，不妨碍createNote接口，但是加快用户体验，需要和createNote接口返回值进行融合
    updateActiveNote(state, payload) {
      const activeNote = {
        ...(state.activeNote || {}),
        ...payload,
      };
      return {
        ...state,
        activeNote,
      };
    },
    // 更新状态
    changeState(state, payload) {
      return {
        ...state,
        ...payload,
      };
    },
  },
});
