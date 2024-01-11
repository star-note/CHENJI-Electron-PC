import { createModel } from '@rematch/core';
import { ActiveNote, Note, NotesTree } from '@/pages/noteList/note.interface';
import { Payload } from '@/middleware/wrapperRequest';
import { RootModel } from '.';

interface INoteState {
  saveLoading: boolean;
  getLoading: boolean;
  activeNote: undefined | ActiveNote;
  getFirstLoading: boolean;
  userNotes: null | NotesTree;
  saveStatus: null | string;
  initContent: undefined | string;
  // editing: boolean;
  deleteLoading: boolean;
  deletedNotes: Note[] | null;
}
export const note = createModel<RootModel>()({
  state: {
    saveLoading: false,
    getLoading: false, // 获取某一笔记的loading
    activeNote: undefined, // 选中的笔记树内容，默认为undefined，当为新增笔记时，{noteId: null, title: null}，当为activeNote.id为null时应该在新增笔记
    getFirstLoading: false, // 获取用户笔记的loading
    userNotes: null,
    saveStatus: null,
    initContent: undefined, // 笔记编辑器的初始内容，不能直接使用activeNote，解释详见编辑器使用的地方EditorContainer
    // editing: false, // 笔记是否是在编辑中或者新增中
    deleteLoading: false,
    deletedNotes: null, // 回收站被删除的笔记列表
  } as INoteState, // initial state
  reducers: {
    // 新建笔记
    createNote(state, payload: Payload<{ note: ActiveNote }>) {
      return {
        ...state,
        saveLoading: payload.loading,
        saveStatus: payload.status,
        activeNote:
          payload.status === 'success' ? payload.data.note : undefined,
      };
    },
    // 保存笔记
    saveNote(state, payload: Payload<{ note: ActiveNote }>) {
      return {
        ...state,
        saveLoading: payload.loading,
        saveStatus: payload.status,
        activeNote:
          payload.status === 'success' ? payload.data.note : undefined,
      };
    },
    // 获取笔记内容
    getNote(state, payload: Payload<{ note: ActiveNote }>) {
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
      payload: Payload<{
        notes: NotesTree;
      }>
    ) {
      return {
        ...state,
        getFirstLoading: payload.loading,
        ...(payload.status === 'success'
          ? { userNotes: payload.data.notes }
          : null),
      };
    },

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

    // 删除笔记
    deleteNote(state, payload: Payload<{ notes: NotesTree }>) {
      return {
        ...state,
        deleteLoading: payload.loading,
        ...(payload.status === 'success'
          ? {
              userNotes: payload.data.notes,
            }
          : null),
      };
    },
    // 获取被删除笔记
    getDeletedNotes(state, payload: Payload<{ notes: Note[] }>) {
      return {
        ...state,
        ...(payload.status === 'success'
          ? { deletedNotes: payload.data.notes }
          : null),
      };
    },
    // 复制或者移动笔记
    copyMoveNotes(state, payload: Payload<any>) {
      return {
        ...state,
        copyLoading: payload.loading,
      };
    },
    // 自动保存笔记：追求快，只是要将数据保存，可以有loading展示，但不要其他渲染，特别不要更新activeNote；也不返回任何数据
    autoSaveNote(state, payload: Payload<any>) {
      return {
        ...state,
        saveLoading: payload.loading,
      };
    },
  },
});
