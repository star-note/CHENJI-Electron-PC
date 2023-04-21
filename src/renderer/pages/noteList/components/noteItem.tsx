import { MouseEvent } from 'react';
import { FolderOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { IconButton } from '@/components/iconButton';
import store from '@/store';
import { addNewNote, useNoteClick } from '../utils/intex';
import { Note } from '../note.interface';

export interface INoteItem {
  note: Note; // 笔记节点
  // title?: string | null; // 标题
  onClick?: (note: Note) => void; // 点击回调
  onMoreClick?: (x: number, y: number) => void; // 右键回调
  active?: boolean; // 是否选中态
  show?: boolean; // 是否展示
  isOpening?: boolean; // 文件夹是否开启状态
  level: number; // 笔记的层级，从0开始
}

export const NoteItem = (props: INoteItem) => {
  const {
    note = {} as Note,
    onClick,
    onMoreClick,
    active,
    show = true,
    isOpening,
    level = 0,
  } = props;
  const [onNoteClick] = useNoteClick();

  const onItemClick = (e: MouseEvent<HTMLDivElement>) => {
    const { activeNote } = store.getState().note;
    if (note.noteId !== activeNote?.noteId) {
      onNoteClick(note, note.spaceId);
    }

    if (onClick) onClick(note);
    e.stopPropagation();
  };
  const handlePlusClick = (e: MouseEvent<HTMLDivElement>) => {
    addNewNote(note);
    e.stopPropagation();
  };
  const handleMoreClick = (e: MouseEvent<HTMLDivElement>) => {
    if (onMoreClick) {
      onMoreClick(
        e.clientX - e.nativeEvent.offsetX + 20 + 4,
        e.clientY - e.nativeEvent.offsetY - 12
      );
    }
    e.stopPropagation();
  };
  return (
    <div
      className={`note-item ${active ? 'note-item-active' : ''} ${
        !show ? 'note-item-hide' : ''
      }`}
      style={{
        paddingLeft: `${20 * level + 16}px`,
      }}
      onClick={onItemClick}
    >
      <p className="item-title">
        {note.childNodes && note.childNodes.length > 0 ? (
          <span className="note-folder-icon">
            {isOpening ? <FolderOpenOutlined /> : <FolderOutlined />}
          </span>
        ) : null}
        {note.title || '无标题'}
      </p>
      {note.title !== '辰记官方' ? (
        <div className="handler-zoo">
          {note.noteId !== null ? (
            <IconButton type="plus" onClick={handlePlusClick} />
          ) : null}
          <IconButton type="ellipsis" onClick={handleMoreClick} />
        </div>
      ) : null}
    </div>
  );
};
