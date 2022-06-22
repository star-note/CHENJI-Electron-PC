import React, { useCallback, useMemo } from 'react';
import { NoteItem } from '.';
import { Note, NotesTree } from '../note.interface';
import './noteTree.less';

export interface INoteTree {
  dataSource: NotesTree; // 数据源
  hasOffical?: boolean; // 是否含有辰记官网笔记，默认有
  onNoteClick?: (note: Note) => void; // 点击某个笔记的回调
  // initActiveId?: string | null | undefined; // 初始active的笔记ID
  // createNewNote?: {} | undefined; // 新增笔记时的被选中笔记id，即为父笔记
  activeNote?: Note | undefined; // 当前选中的笔记，如果新增，则activeNote.noteId为null
}
export const NoteTree = React.memo(function NoteTree(props: INoteTree) {
  const { dataSource = [], hasOffical = true, onNoteClick, activeNote } = props;
  // const [activeId, setActiveId] = useState(initActiveId);
  // const noteClick = (note) => {
  //   setActiveId(note.id);
  //   console.log(note);
  //   onNoteClick(note);
  // }

  const noteLoop = useCallback(
    (note: Note, parentId: Note['parentId'] | null) => {
      const { noteId, title, childNodes = [] } = note;
      console.log(note, parentId, activeNote);
      return (
        <div key={noteId}>
          <NoteItem
            title={
              activeNote && activeNote.noteId === noteId
                ? activeNote.title
                : title
            }
            onClick={() => onNoteClick && onNoteClick(note)}
            active={activeNote && activeNote.noteId === noteId}
          />
          <div className="note-children">
            {childNodes.length > 0
              ? childNodes.map(child => noteLoop(child, noteId))
              : null}
            {/* 任何节点最下面都有个虚拟的无标题节点，初始看不见；当新增笔记时，下方出来的一行前端虚拟出来的笔记节点，在noteLoop函数中类似 */}
            <NoteItem
              active={activeNote && activeNote.noteId === null}
              show={
                !!activeNote &&
                activeNote.noteId === null &&
                activeNote.parentId === noteId
              }
            />
          </div>
        </div>
      );
    },
    [activeNote, onNoteClick]
  );

  return (
    <div className="note-container">
      {hasOffical ? (
        <NoteItem title="辰记官方" active={activeNote === undefined} />
      ) : null}
      {useMemo(
        () =>
          dataSource && dataSource.length > 0 ? (
            <>
              {
                // 主体笔记树
                dataSource.map(note => noteLoop(note, null))
              }
              {/* 任何节点最下面都有个虚拟的无标题节点，初始看不见；当新增笔记时，下方出来的一行前端虚拟出来的笔记节点，在noteLoop函数中类似 */}
              <NoteItem
                active={activeNote && activeNote.noteId === null}
                show={
                  !!activeNote &&
                  activeNote.noteId === null &&
                  activeNote.parentId === undefined
                }
              />
            </>
          ) : (
            <div>+ 点击新增笔记</div>
          ),
        [dataSource, activeNote, noteLoop]
      )}
      {/* {dataSource && dataSource.length > 0 ? (
        <>
          {useMemo(() => dataSource.map(note => noteLoop(note, null)), [dataSource, activeNote])}
          <NoteItem
            active={activeNote && activeNote.id === null}
            show={!!activeNote && activeNote.id === null && activeNote.parentId === undefined}
          />
        </>
      ) : (
        <div>+ 点击新增笔记</div>
      )} */}
    </div>
  );
});
