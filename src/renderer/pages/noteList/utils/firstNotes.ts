import Storage from '@/utils/Storage';
import store from '@/store';
import { Note, NotesTree } from '../note.interface';

export const getFirstNotes = (): NotesTree | null => {
  const { firstNotes } = store.getState().note;
  if (firstNotes) {
    return firstNotes;
  }
  return Storage.get('firstNotes') || null;
};

export const setFirstNotes = (notes: NotesTree) => {
  Storage.set('firstNotes', notes); // 一个月的缓存有效时间
};

export const removeFirstNotes = () => {
  Storage.remove('firstNotes');
};

// 更新或新增FirstNotes树中某一个note的信息
export const updateFirstNotes = (note: Note) => {
  // const note = store.getState().note.activeNote;
  const firstNotes = getFirstNotes();
  const { parentId, noteId } = note;

  const findIdList = (list, parentId, noteId) => {
    if (parentId === null || parentId === undefined) {
      let isCreate = true;
      for (let i = 0; i < list.length; i += 1) {
        if (list[i].noteId === noteId) {
          isCreate = false;
          list[i] = {
            ...list[i],
            ...note,
          };
          break;
        }
      }
      if (isCreate) {
        list.push(note);
      }
    } else {
      for (let i = 0; i < list.length; i += 1) {
        if (
          list[i].noteId === parentId &&
          list[i].childNodes &&
          list[i].childNodes.length > 0
        ) {
          findIdList(list[i].childNodes, null, noteId);
          break;
        } else if (list[i].noteId === parentId) {
          list[i].childNodes = [note];
          break;
        } else if (list[i].childNodes) {
          findIdList(list[i].childNodes, parentId, noteId);
        }
      }
    }
  };

  findIdList(firstNotes, parentId, noteId);

  return firstNotes;
};
