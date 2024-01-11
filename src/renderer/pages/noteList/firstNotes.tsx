import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfigProvider, Tree } from 'antd';
import store, { DispatchPro } from '@/store';
import { NoteTree } from './components';
import { ActiveNote, Note, NotesTree, Space } from './note.interface';
import { useNoteClick } from './utils/intex';
import { IconButton } from '@/components';

// 我的笔记树
type IMyNotes = {
  userId?: string; // 可以通过控制是否传递userId来控制是否在DidMount时请求API，如不传就需要在父组件中预加载
  userNotes: NotesTree | null;
  activeNote?: ActiveNote;
  hasOffical?: boolean;
};
export const MyNotes = (props: IMyNotes) => {
  const { userNotes, activeNote, hasOffical = true, userId } = props;
  const { getUserNotes } = (store.dispatch as DispatchPro).note;

  useEffect(() => {
    if (userId) {
      getUserNotes({
        params: {
          loginUserId: userId,
        },
        apiName: 'getUserNotes',
      });
    }
  }, []);

  return (
    <>
      <NoteTree
        hasOffical={hasOffical}
        dataSource={userNotes}
        activeNote={activeNote}
      />

      <Tree.DirectoryTree
        defaultExpandAll
        draggable={{ icon: false }}
        blockNode
        treeData={userNotes}
        fieldNames={{
          key: 'noteId',
          children: 'childNodes',
        }}
        switcherIcon={null}
        rootClassName="note-container"
        titleRender={(note) => {
          return (
            <>
              <span className="item-title">{note.title || '无标题'}</span>
              {note.title !== '辰记官方' ? (
                <div className="handler-zoo">
                  {note.noteId !== null ? (
                    <IconButton type="plus" onClick={() => {}} />
                  ) : null}
                  <IconButton type="ellipsis" onClick={() => {}} />
                </div>
              ) : null}
            </>
          );
        }}
      />
    </>
  );
};

// 我的群组树
type IMySpaceNotes = {
  userId?: string; // 可以通过控制是否传递userId来控制是否在DidMount时请求API，如不传就需要在父组件中预加载
  spaceList: Space[] | null;
  activeNote?: ActiveNote;
  activeSpace?: string; // 当前的spaceid
  spaceNotes: Record<string, NotesTree> | null;
};
export const MySpaceNotes = (props: IMySpaceNotes) => {
  const { spaceList, activeSpace, spaceNotes, activeNote, userId } = props;
  const [onNoteClick] = useNoteClick();
  const { getSpaceNotes } = (store.dispatch as DispatchPro).space;
  const navigate = useNavigate();

  useEffect(() => {
    if (activeSpace) {
      getSpaceNotes({
        params: {
          spaceId: activeSpace,
        },
        apiName: 'getSpaceNotesById',
      });
    }
  }, [activeSpace]);

  const onSpaceTitleClick = (spaceId: Space['spaceId']) => {
    // 当activeSpace不是点击spaceId或者activeNote为个人或者其他群组笔记，则重置activeNote，相当于没有选中任何笔记，只选中了群组
    onNoteClick(null, spaceId); // 在此函数中会改变activeSpace
    navigate(`/space/${spaceId}`);
  };

  return (
    <>
      {spaceList && spaceList.length > 0
        ? spaceList.map((space: Space) => (
            <div className="space-container" key={space.spaceId}>
              <div
                className={`space-name ${
                  activeSpace === space.spaceId ? 'space-name-active' : ''
                }`}
                onClick={() => onSpaceTitleClick(space.spaceId)}
              >
                {space.title}({space.cnt || 1}人)
                <div className="handler-zoo">
                  <IconButton type="plus" />
                  <IconButton type="ellipsis" />
                </div>
              </div>
              <NoteTree
                hasOffical={false}
                dataSource={spaceNotes ? spaceNotes[space.spaceId] : null}
                activeNote={activeNote?.spaceId ? activeNote : undefined}
                className={
                  activeSpace === space.spaceId ? 'space-tree-active' : ''
                }
                spaceId={space.spaceId}
              />
            </div>
          ))
        : null}
    </>
  );
};

// 我的回收站
type IMyRecovery = {
  userId: string;
  deletedNotes: Note[] | null;
  deletedSpaceNotes: Note[] | null;
  activeNote?: ActiveNote;
};
export const MyRecovery = (props: IMyRecovery) => {
  const { userId, deletedNotes, deletedSpaceNotes, activeNote } = props;
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
      <NoteTree
        hasOffical={false}
        dataSource={deletedNotes}
        activeNote={activeNote}
        isRecovery
      />
      <NoteTree
        hasOffical={false}
        dataSource={deletedSpaceNotes}
        activeNote={activeNote}
        isRecovery
      />
    </>
  );
};
