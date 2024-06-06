/* eslint-disable no-nested-ternary */
import { createRef, MutableRefObject, RefObject } from 'react';
import { Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import store, { DispatchPro } from '@/store';
import { getUserInfo, parseUrlParams } from '@/utils';
import { ActiveNote, Note, Space } from '../note.interface';
import { updateFirstNotes } from './firstNotes';

export const quill: MutableRefObject<any | null> = createRef(); // 编辑器quill实例
export const titleInputRef: RefObject<HTMLInputElement> = createRef(); // 编辑器Title Input
export const editTime: MutableRefObject<Date | null> = createRef(); // 上一次编辑的时间，如果被保存需要清空，被用来标识是否有未保存的笔记/新增笔记

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

// 保存笔记，在某些新建笔记接口失败的情况下，也充当新建笔记作用
export const saveContent = (auto = false) => {
  const content = quill.current?.getContents();
  const text = quill.current?.getText();
  const { activeNote = {} as ActiveNote } = store.getState().note;
  const saveStart = new Date(); // 保存开始时间，用来计算是否在保存期间有编辑
  const { id: userId } = getUserInfo() || {};
  const noteId = activeNote.noteId?.startsWith('create$$')
    ? null
    : activeNote.noteId;
  const title = titleInputRef.current?.value || activeNote.title || '无标题';

  let apiName = 'saveNote';
  if (activeNote && activeNote.spaceId) apiName = 'saveSpaceNote';
  else if (noteId === null) apiName = 'createNote';

  // 新增笔记不能自动化保存，先走保存，待更新TreeData后再自动化保存
  if (auto && noteId !== null) {
    return (store.dispatch as DispatchPro).note
      .autoSaveNote({
        params: {
          parentId: activeNote.parentId,
          title,
          content: JSON.stringify(content),
          noteId,
          text,
          loginUserId: userId,
          spaceId: activeNote.spaceId, // 保存群组笔记
          auto,
        },
        apiName,
      })
      .then(() => {
        if (editTime.current && editTime.current < saveStart) {
          editTime.current = null;
        }
      });
  }
  return (store.dispatch as DispatchPro).note
    .saveNote({
      params: {
        parentId: activeNote.parentId,
        title,
        content: JSON.stringify(content),
        noteId,
        text,
        loginUserId: userId,
        spaceId: activeNote.spaceId, // 保存群组笔记
      },
      apiName,
    })
    .then(data => {
      if (editTime.current && editTime.current < saveStart) {
        editTime.current = null;
      }

      // 如是新笔记的保存或者自动化保存，需要更新URL，并且删除笔记树NoteTree上之前noteId为create$$开头的笔记，并替换为data.note
      const { note } = data;
      if (!noteId && activeNote.noteId?.startsWith('create$$')) {
        window.history.pushState(
          {},
          '',
          `/notelist?note=${note.noteId}&space=${note.spaceId || ''}`
        );
        updateFirstNotes(note, activeNote.spaceId, activeNote.noteId);
      } else {
        updateFirstNotes(note, activeNote.spaceId);
      }

      return note; // 发布时用
    });
};

// 当还有未保存笔记内容时的弹框 ·
export const editingSaveConfirm = (
  note: Note | null // 被点击笔记节点，主要是透传给onNoteClick；新建时为null
) => {
  const { note: activeNoteId, space } = parseUrlParams(window.location.href);
  return new Promise<void>(resolve => {
    if (editTime.current && note?.noteId !== activeNoteId) {
      Modal.confirm({
        title: '您还有未保存笔记内容',
        content: '是否保存？',
        onOk() {
          saveContent().then(() => {
            resolve();
          });
        },
        onCancel() {
          editTime.current = null;
          // 当前为新增笔记，取消需要删除树中的节点
          updateFirstNotes({ noteId: activeNoteId }, space, undefined, true);
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
    spaceId?: Space['spaceId'] | undefined,
    isRecovery?: boolean
  ) => {
    const { activeNote } = store.getState().note;
    // const { activeSpace } = store.getState().space;
    // 当点击别的笔记，判断当前笔记改动是否保存
    editingSaveConfirm(note).then(() => {
      // 相同笔记点击就不要操作了
      if (!(activeNote && note && note.noteId === activeNote.noteId)) {
        // 点击的是笔记才更新，防止点击群名导致activeNote更新
        if (note) {
          // 先拿参数的数据显示在树上，防止出现点击左侧在接口很慢的情况下，在切换Note时需要等接口返回更新activeNote才会变更左侧树和右侧内容
          store.dispatch.note.changeState({
            activeNote: {
              ...note,
              spaceId,
            },
            initContent: note && note.content ? JSON.parse(note.content) : null, // 要把内容更新到富文本，只更新activeNote不生效
          });
        }

        // // 当点击群组笔记，更新activeSpace；其他时候不更改ctiveSpace，不收起当前群组笔记树
        // if (spaceId && spaceId !== activeSpace) {
        //   store.dispatch.space.changeState({
        //     activeSpace: spaceId,
        //   });
        // }

        if (note) {
          getNoteById(note.noteId, spaceId);
          let url = spaceId
            ? `/notelist?note=${note.noteId}&space=${spaceId}`
            : `/notelist?note=${note.noteId}`;
          if (isRecovery) {
            url += '&recovery=1';
          }
          navigate(url);
        }
      }
    });
  };

  return [onNoteClick];
};
// 新增子笔记，先更新store中的笔记数据源，然后直接在cb中跳转URL
export const useAddNewNote = () => {
  const navigate = useNavigate();

  return (note: Note | null, spaceId?: Space['spaceId']) =>
    editingSaveConfirm(null).then(() => {
      const tempId = `create$$${new Date().getTime()}`;
      const child = {
        noteId: tempId,
        title: null,
        parentId: note?.noteId, // 新建目标note的子笔记，若note为null，parentId为undefined
        isLeaf: true,
        spaceId: spaceId || undefined,
      };
      if (spaceId) {
        const { spaceNotes } = store.getState().space;
        if (!note) {
          store.dispatch.space.changeState({
            spaceNotes: {
              ...spaceNotes,
              spaceId: [...spaceNotes[spaceId], child],
            },
          });
        } else {
          updateFirstNotes(child, spaceId);
        }
      } else {
        const { userNotes } = store.getState().note;
        if (!note) {
          store.dispatch.note.changeState({
            userNotes: [...userNotes, child],
          });
        } else {
          updateFirstNotes(child);
        }
      }
      editTime.current = new Date();
      store.dispatch.note.changeState({
        activeNote: child,
        initContent: {},
      });

      navigate(
        spaceId
          ? `/notelist?note=${tempId}&space=${spaceId}`
          : `/notelist?note=${tempId}`
      );
      setTimeout(() => titleInputRef.current?.focus(), 300); // 新建笔记自动focus到title
    });
};

// 删除笔记，如是新建笔记则只需要删除前端笔记树的数据节点即可
export const deleteContent = (note: Note) => {
  if (note.noteId?.startsWith('create$$')) {
    updateFirstNotes(note, note.spaceId, undefined, true);
  } else if (note.spaceId) {
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

// 获取笔记的图片列表，默认只返回一张
export const getImgFromContent = (content: string, one = true) => {
  const imgReg = /https?:\/\/.*?\.(?:png|jpg|jpeg|gif)/gi;
  const matches = content.match(imgReg);
  return one && matches && matches.length > 0 ? matches[0] : matches;
};

// 上次保存时间，如在3小时内显示时间，其他展示日期即可
export const showLastModify = (time?: string) => {
  const beforeTime = time || new Date();
  return new Date().getTime() - new Date(beforeTime).getTime() > 10800000
    ? dayjs(beforeTime).format('YYYY-MM-DD')
    : dayjs(beforeTime).format('HH:mm:ss');
};
