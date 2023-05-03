/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import Storage from '@/utils/Storage';
import store from '@/store';
import { Note, NotesTree } from '../note.interface';

export const getUserNotes = (): NotesTree | null => {
  const { userNotes } = store.getState().note;
  if (userNotes) {
    return userNotes;
  }
  return Storage.get('userNotes') || null;
};
export const getSpaceNotes = (): Record<string, NotesTree> | null => {
  const { spaceNotes } = store.getState().space;
  if (spaceNotes) {
    return spaceNotes;
  }
  return Storage.get('spaceNotes') || null;
};

export const setFirstNotes = (
  type: 'user' | 'space',
  notes: NotesTree | Record<string, NotesTree>
) => {
  // Storage.set('firstNotes', notes); // 一个月的缓存有效时间
};

export const removeFirstNotes = () => {
  Storage.remove('userNotes');
  Storage.remove('spaceNotes');
};

// 更新或新增FirstNotes树中某一个note的信息：note为需要新增或修改的笔记节点，note不应含childNodes
export const updateFirstNotes = (note: Note, spaceId: string | null = null) => {
  let firstNotes: NotesTree = [];
  if (spaceId) {
    const spaceNotes = getSpaceNotes();
    if (spaceNotes) firstNotes = spaceNotes[String(spaceId)];
  } else {
    firstNotes = getUserNotes() || [];
  }
  const { parentId, noteId } = note;

  const findIdList = (
    list: NotesTree,
    _parentId: string | null | undefined,
    _noteId: string | null
  ) => {
    if (_parentId === null || _parentId === undefined) {
      // 无parentId时，顶级新增编辑
      let isCreate = true; // 是否存在此noteId
      for (let i = 0; i < list.length; i += 1) {
        if (list[i].noteId === _noteId) {
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
      // 有parentId时，递归找到哪级新增/编辑
      for (let i = 0; i < list.length; i += 1) {
        if (
          list[i].noteId === _parentId &&
          list[i].childNodes &&
          // @ts-ignore
          list[i].childNodes.length > 0
        ) {
          // 当找到parentId，并且此节点有childNodes，在此节点下递归，parentId为null
          // @ts-ignore
          findIdList(list[i].childNodes, null, _noteId);
          break;
        } else if (list[i].noteId === _parentId) {
          // 当找到parentId，并且此节点无childNodes，代表新增
          list[i].childNodes = [note];
          break;
        } else if (list[i].childNodes) {
          // 当没有找到parentId，接着往下层递归
          // @ts-ignore
          findIdList(list[i].childNodes, _parentId, _noteId);
        }
      }
    }
  };

  if (firstNotes) {
    findIdList(firstNotes, parentId, noteId);
  } else {
    console.log('更新FirstNotes失败，未发现：', firstNotes, spaceId);
  }

  // 替换store
  if (spaceId) {
    store.dispatch.space.changeState({
      spaceNotes: {
        ...store.getState().space.spaceNotes,
        [spaceId]: firstNotes,
      },
    });
  } else {
    store.dispatch.note.changeState({
      userNotes: firstNotes?.concat([]),
    });
  }

  return firstNotes;
};

// 找到某个树中一个节点的所有父节点
export const findFather = (
  noteList: NotesTree,
  noteId: string
): [string[], Note] => {
  const result: string[] = [];
  let target: Note;
  if (noteId && noteList && noteList.length > 0) {
    const find = (tree, id) => {
      if (tree && tree.length > 0) {
        for (let i = 0; i < tree.length; i++) {
          const item = tree[i];
          if (item.noteId === id) {
            if (id !== noteId) {
              result.push(id);
            } else {
              target = item;
            }
            find(noteList, item.parentId);
            break;
          } else if (item.childNodes) {
            find(item.childNodes, id);
          }
        }
      }
    };
    find(noteList, noteId);
  }
  return [result, target];
};

// 根据targetOptions路径获取最后节点的子节点
export const getOptionsChildren = (
  tree: NotesTree,
  selectedOptions: string[]
) => {
  let children;
  const path = selectedOptions ? [...selectedOptions] : selectedOptions;
  if (path && Array.isArray(path) && path.length > 0) {
    if (path.length === 1) {
      children = tree.filter(node => node.noteId === path[0])[0].childNodes;
      return children;
    }

    const _tree = tree.filter(node => node.noteId === path[0]);
    if (_tree && _tree.length === 1 && _tree[0].childNodes) {
      path.shift();
      return getOptionsChildren(_tree[0].childNodes, path);
    }
  }
};
