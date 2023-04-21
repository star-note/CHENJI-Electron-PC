/* eslint-disable no-nested-ternary */
import { createRef, MutableRefObject, RefObject } from 'react';
import store, { DispatchPro } from '@/store';
import { Modal } from 'antd';
import { getUserInfo } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { ActiveNote, Note, Space } from '../note.interface';
import { updateFirstNotes } from './firstNotes';

export const quill: MutableRefObject<any | null> = createRef(); // 编辑器quill实例
export const lastSaveTime: MutableRefObject<[string, number] | null> =
  createRef(); // 上一个保存笔记时间，不代表保存成功，为在保存过程中有新增编辑但保存成功后会优先清除编辑态导致点击其他笔记不会触发保存 [type: start/edit, timestamp]
export const titleInputRef: RefObject<HTMLInputElement> = createRef(); // 编辑器Title Input
export const editTime: MutableRefObject<Date | null> = createRef(); // 上一次编辑的时间，如果被保存需要清空，被用来标识是否有未保存的笔记

// 获取某个笔记内容
export const getNoteById = (
  noteId: Note['noteId'],
  spaceId?: Space['spaceId'] | null
) => {
  const userId = getUserInfo()?.id;

  (store.dispatch as DispatchPro).note.getNote({
    params: {
      noteId,
      loginUserId: userId,
      spaceId,
    },
    apiName: spaceId ? 'getSpaceNote' : 'getNote',
  });
};

// 新建note的子笔记更新store；spaceId为新建位置，当明确是为群组笔记新增传spaceId，当明确是个人笔记新增spaceId=-1；主要是addNewNote透传过来
const createContent = (note: Note | null, spaceId?: Space['spaceId']) => {
  const { activeSpace } = store.getState().space;
  // 当有传明确spaceId且不为-1（个人新增），更新spaceId为参数传入的；当为-1时，更新spaceId为undefined；其他情况应该继承
  const targetSpaceId =
    spaceId === '-1'
      ? undefined
      : spaceId && spaceId !== '-1'
      ? spaceId
      : note?.spaceId;
  const child = {
    noteId: null,
    title: null,
    parentId: note?.noteId, // 新建目标note的子笔记，若note为null，parentId为undefined
    spaceId: targetSpaceId,
  };

  store.dispatch.note.changeState({
    activeNote: child,
    initContent: null,
    editing: true,
  });
  if (targetSpaceId !== activeSpace && spaceId !== '-1') {
    store.dispatch.space.changeState({
      activeSpace: targetSpaceId,
    });
  }
};

// 保存笔记，在某些新建笔记接口失败的情况下，也充当新建笔记作用
export const saveContent = () => {
  const content = quill.current?.getContents();
  const { activeNote = {} as ActiveNote } = store.getState().note;
  // // 标识是否在保存期间有编辑
  // lastSaveTime.current = ['start', new Date().getTime()]; // 时间戳暂时没用
  const saveStart = new Date(); // 保存开始时间，用来计算是否在保存期间有编辑
  const { id: userId } = getUserInfo() || {};

  let apiName = 'saveNote';
  if (activeNote.spaceId) apiName = 'saveSpaceNote';
  else if (activeNote.noteId === null) apiName = 'createNote';

  return (store.dispatch as DispatchPro).note
    .saveNote({
      params: {
        parentId: activeNote.parentId,
        title: activeNote.title || '无标题',
        content: JSON.stringify(content),
        noteId: activeNote.noteId,
        loginUserId: userId,
        spaceId: activeNote.spaceId, // 保存群组笔记
        // loginUserName: activeNote.spaceId ? name : undefined, // 群组笔记需要记录唯一ID
      },
      apiName,
    })
    .then((data) => {
      // if (lastSaveTime.current && lastSaveTime.current[0] !== 'edit') {
      //   store.dispatch.note.changeState({ editing: false });
      // }
      if (editTime.current && editTime.current < saveStart) {
        editTime.current = null;
      }
      updateFirstNotes(data.note, activeNote.spaceId);
      return data.note; // 发布时用
    })
    // .finally(() => {
    //   lastSaveTime.current = ['end', new Date().getTime()];
    // });
};;

// 当还有未保存笔记内容时的弹框 ·
const editingSaveConfirm = (
  type: 'save' | 'create', // 是切换笔记还是新建笔记时触发
  note: Note | null // 被点击笔记节点，主要是透传给onNoteClick；新建时为null
) => {
  const { activeNote, editing } = store.getState().note;
  return new Promise<void>(resolve => {
    if (activeNote && editing && note?.noteId !== activeNote.noteId) {
      Modal.confirm({
        title: '您还有未保存笔记内容',
        content: '是否保存？',
        onOk() {
          saveContent().then(() => {
            resolve();
          });
        },
        onCancel() {
          store.dispatch.note.changeState({ editing: false }); // 不保存说明编辑态取消
          // if (type === 'create') {
          //   // 如之前未保存是新建笔记，上面的跳转可能不起作用，因为新建时URL不变，如正好在新建后点击父节点则URL不变化，新建的笔记也不会消失
          //   if (note && activeNote?.noteId === null) {
          //     store.dispatch.note.changeState({ activeNote: note });
          //   }
          // }
          resolve();
        },
      });
    } else {
      resolve();
    }
  });
};

// 点击某个笔记
export const useNoteClick = () => {
  const navigate = useNavigate();

  const onNoteClick = (
    note: Note | null,
    spaceId?: Space['spaceId'] | undefined
  ) => {
    const { activeNote } = store.getState().note;
    const { activeSpace } = store.getState().space;
    // 当点击别的笔记，判断当前笔记改动是否保存
    editingSaveConfirm('save', note).then(() => {
      // 相同笔记点击就不要操作了
      if (!(activeNote && note && note.noteId === activeNote.noteId)) {
        // 先拿参数的数据显示在树上，防止出现点击左侧在接口很慢的情况下，在切换Note时需要等接口返回更新activeNote才会变更左侧树和右侧内容
        store.dispatch.note.changeState({
          activeNote: {
            ...note,
            spaceId,
          },
          initContent: note && note.content ? JSON.parse(note.content) : null, // 要把内容更新到富文本，只更新activeNote不生效
        });

        // 当点击群组笔记，更新activeSpace；其他时候不更改ctiveSpace，不收起当前群组笔记树
        if (spaceId && spaceId !== activeSpace) {
          store.dispatch.space.changeState({
            activeSpace: spaceId,
          });
        }

        if (note) {
          getNoteById(note.noteId, spaceId);
          navigate(
            spaceId
              ? `/notelist?note=${note.noteId}&space=${spaceId}`
              : `/notelist?note=${note.noteId}`
          );
        }
      }
    });
  };

  return [onNoteClick];
};
// 新增子笔记，正常情况下只有note传入，note中包含spaceId信息，只有在NoteTree的最开始添加笔记时第二个参数才有意义；主要逻辑在createContent中处理
export const addNewNote = (note: Note | null, spaceId?: Space['spaceId']) => {
  console.log('新增笔记: ', note, spaceId);
  editingSaveConfirm('create', null).then(() => {
    createContent(note, spaceId); // 会设置最终的activeNote
    setTimeout(() => titleInputRef.current?.focus(), 300); // 新建笔记自动focus到title
  });
};

// 删除笔记
export const deleteContent = (note: Note) => {
  if (note.spaceId) {
    (store.dispatch as DispatchPro).space.deleteNote({
      params: {
        note,
      },
      apiName: 'deleteSpaceNote',
    });
  } else {
    (store.dispatch as DispatchPro).note.deleteNote({
      params: {
        note,
      },
      apiName: 'deleteNote',
    });
  }
  // 如当前的activeNote就是删除的笔记时，需要清空右侧编辑器内容和title
  const { activeNote } = store.getState().note;
  if (activeNote && activeNote.noteId === note.noteId) {
    store.dispatch.note.changeState({
      initContent: undefined,
    });
    if (titleInputRef.current) titleInputRef.current.value = '';
  }
};
