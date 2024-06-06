import { CSSProperties, MouseEvent } from 'react';
import {
  DownOutlined,
  UpOutlined,
  PlusOutlined,
  EllipsisOutlined,
  LoadingOutlined,
  SearchOutlined,
  StarOutlined,
  LikeOutlined,
  MessageOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import './index.less';

type IIconButton = {
  type:
    | 'plus'
    | 'ellipsis'
    | 'down'
    | 'up'
    | 'loading'
    | 'search'
    | 'star'
    | 'like'
    | 'message'
    | 'undo';
  style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  className?: string;
};
export const IconButton = (props: IIconButton) => {
  const { type, style, onClick, className } = props;
  const icons = {
    plus: <PlusOutlined />,
    ellipsis: <EllipsisOutlined />,
    down: <DownOutlined />,
    up: <UpOutlined />,
    loading: <LoadingOutlined />,
    search: <SearchOutlined />,
    star: <StarOutlined />,
    like: <LikeOutlined />,
    message: <MessageOutlined />,
    undo: <UndoOutlined />,
  };
  return (
    <div
      className={`icon-button flex-center ${className}`}
      style={style}
      onClick={onClick}
    >
      {icons[type]}
    </div>
  );
};
