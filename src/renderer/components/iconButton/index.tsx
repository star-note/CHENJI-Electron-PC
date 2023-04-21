import { CSSProperties, MouseEvent } from 'react';
import {
  DownOutlined,
  UpOutlined,
  PlusOutlined,
  EllipsisOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import './index.less';

type IIconButton = {
  type: 'plus' | 'ellipsis' | 'down' | 'up' | 'loading';
  style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
};
export const IconButton = (props: IIconButton) => {
  const { type, style, onClick } = props;
  const icons = {
    plus: <PlusOutlined />,
    ellipsis: <EllipsisOutlined />,
    down: <DownOutlined />,
    up: <UpOutlined />,
    loading: <LoadingOutlined />,
  };
  return (
    <div
      className={`icon-button flex-center ${type}`}
      style={style}
      onClick={onClick}
    >
      {icons[type]}
    </div>
  );
};
