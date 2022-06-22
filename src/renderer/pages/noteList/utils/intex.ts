import { createRef, MutableRefObject } from 'react';
import store, { DispatchPro } from '@/store';
import { Modal } from 'antd';
import { getUserInfo, UserInfo } from '@/utils';
import { Note } from '../note.interface';
import { updateFirstNotes } from './firstNotes';

export const quill: MutableRefObject<any | null> = createRef(); // 编辑器quill实例
export const lastSaveTime: MutableRefObject<[string, number] | null> =
  createRef(); // 上一个保存笔记时间，不代表保存成功，为在保存过程中有新增编辑但保存成功后会优先清楚编辑态导致点击其他笔记不会触发保存 [type: start/edit, timestamp]

// 获取某个笔记内容
export const getNoteById = (noteId: Note['noteId'], user?: UserInfo['id']) => {
  const userId = user || getUserInfo()?.id;

  (store.dispatch as DispatchPro).note.getNote({
    params: {
      noteId,
      userId,
    },
    apiName: 'getNote',
  });
};

// 新建笔记更新store
const createContent = () => {
  const { activeNote = {} as Note } = store.getState().note;
  store.dispatch.note.changeState({
    activeNote: {
      noteId: null,
      title: null,
      parentId: activeNote.noteId,
    },
    initContent: null,
    editing: true,
  });
};
// 保存笔记，在某些新建笔记接口失败的情况下，也充当新建笔记作用
export const saveContent = (user?: UserInfo['id']) => {
  const content = quill.current?.getContents();
  const { activeNote = {} as Note } = store.getState().note;
  // 标识是否在保存期间有编辑
  lastSaveTime.current = ['start', new Date().getTime()]; // 时间戳暂时没用
  const userId = user || getUserInfo()?.id;

  return (store.dispatch as DispatchPro).note
    .saveNote({
      params: {
        parentId: activeNote.parentId,
        title: activeNote.title,
        content: JSON.stringify(content),
        noteId: activeNote.noteId,
        userId,
      },
      apiName: activeNote.noteId === null ? 'createNote' : 'saveNote',
    })
    .then(data => {
      console.log(33333, data);
      if (lastSaveTime.current && lastSaveTime.current[0] !== 'edit') {
        store.dispatch.note.changeState({ editing: false });
      }
      // TODO 保存成功更新笔记树：first/second
      updateFirstNotes(data.note);
      return data.note; // 发布时用
    })
    .finally(() => {
      lastSaveTime.current = ['end', new Date().getTime()];
    });
};

// 当还有未保存笔记内容时的弹框
const editingSaveConfirm = (type: string, note: Note | null) => {
  Modal.confirm({
    title: '您还有未保存笔记内容',
    content: '是否保存？',
    onOk() {
      saveContent().then(() => {
        if (type === 'create') {
          createContent();
        } else if (note) {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          onNoteClick(note);
        }
      });
    },
    onCancel() {
      store.dispatch.note.changeState({ editing: false }); // 不保存说明编辑态取消
      if (type === 'create') {
        createContent();
      } else if (note) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        onNoteClick(note);
      }
    },
  });
};

// 点击某个笔记
export const onNoteClick = (note: Note) => {
  const { activeNote, editing } = store.getState().note;
  // 当点击别的笔记，判断当前笔记改动是否保存
  if (activeNote && editing && note.noteId !== activeNote.noteId) {
    editingSaveConfirm('save', note);
  } else if (note.noteId !== activeNote?.noteId) {
    // 先拿Tree的数据显示在树上，防止出现点击左侧在接口很慢的情况下，左侧树等接口返回才有反应
    store.dispatch.note.updateActiveNote(note);
    getNoteById(note.noteId);
  }
};
// 新增笔记
export const addNewNote = () => {
  console.log('新增笔记！');
  if (store.getState().note.editing) {
    editingSaveConfirm('create', null);
  } else {
    createContent();
  }
};
