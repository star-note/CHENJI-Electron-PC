import { memo, useCallback, useEffect } from 'react';
import store, { DispatchPro } from '@/store';
import { NoteTree, SpaceTitle } from './components';
import { Note, NotesTree, Space } from './note.interface';

// 我的笔记树
type IMyNotes = {
  userId?: string; // 可以通过控制是否传递userId来控制是否在DidMount时请求API，如不传就需要在父组件中预加载
  userNotes: NotesTree | null;
  loading?: boolean;
};
export const MyNotes = memo((props: IMyNotes) => {
  const { userNotes, userId, loading } = props;
  const { fetchUserNotes } = (store.dispatch as DispatchPro).note;

  useEffect(() => {
    if (userId) {
      fetchUserNotes({
        params: {
          loginUserId: userId,
        },
        apiName: 'getUserNotes',
      });
    }
  }, []);

  return (
    <>
      <NoteTree dataSource={userNotes} loading={loading} />
    </>
  );
});

// 我的群组树
type IMySpaceNotes = {
  spaceList: Space[] | null;
  spaceNotes: Record<string, NotesTree> | null;
  space: Space['spaceId'];
};
export const MySpaceNotes = memo((props: IMySpaceNotes) => {
  const { spaceList, spaceNotes, space } = props;
  const { getSpaceNotes } = (store.dispatch as DispatchPro).space;

  useEffect(() => {
    if (space) {
      getSpaceNotes({
        params: {
          spaceId: space,
        },
        apiName: 'getSpaceNotesById',
      });
    }
  }, [space]);

  return (
    <>
      {spaceList && spaceList.length > 0
        ? spaceList.map((item: Space) => {
            return (
              <div className="space-container" key={item.spaceId}>
                <SpaceTitle active={space === item.spaceId} space={item} />
                <NoteTree
                  dataSource={spaceNotes ? spaceNotes[item.spaceId] : null}
                  className={space === item.spaceId ? 'space-tree-active' : ''}
                  spaceId={item.spaceId}
                />
              </div>
            );
          })
        : null}
    </>
  );
});

// 我的回收站
type IMyRecovery = {
  userId: string;
  deletedNotes: Note[] | null;
  deletedSpaceNotes: Note[] | null;
};
export const MyRecovery = (props: IMyRecovery) => {
  const { userId, deletedNotes, deletedSpaceNotes } = props;
  const { getDeletedNotes } = (store.dispatch as DispatchPro).note;
  const { getDeletedSpaceNotes } = (store.dispatch as DispatchPro).space;

  // 获取回收站被删除笔记
  const getRecovery = useCallback(() => {
    getDeletedNotes({
      params: {
        loginUserId: userId,
      },
      apiName: 'getDeletedNotes',
    });
    getDeletedSpaceNotes({
      params: {
        loginUserId: userId,
      },
      apiName: 'getDeletedSpaceNotes',
    });
  }, [getDeletedNotes, getDeletedSpaceNotes, userId]);
  useEffect(() => {
    if (userId) {
      getRecovery();
    }
  }, []);

  return (
    <>
      <NoteTree dataSource={deletedNotes} isRecovery />
      <NoteTree dataSource={deletedSpaceNotes} isRecovery />
    </>
  );
};
