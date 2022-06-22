import { useEffect } from 'react';

export interface INoteItem {
  title?: string; // 标题
  onClick?: () => void; // 点击回调
  onRightClick?: () => void; // 右键回调
  active?: boolean; // 是否选中态
  show?: boolean; // 是否展示
}

export const NoteItem = (props: INoteItem) => {
  const { title, onClick, onRightClick, active, show = true } = props;
  useEffect(() => {
    // console.log(onRightClick);
  }, []);

  return (
    <div
      className={`note-item ${active ? 'note-item-active' : ''} ${
        !show ? 'note-item-hide' : ''
      }`}
      onClick={onClick}
    >
      {title || '无标题'}
    </div>
  );
};
