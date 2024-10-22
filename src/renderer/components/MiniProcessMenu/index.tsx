import ReactDOM from 'react-dom';
import './index.less';

export type IMiniProcessMenu = {
  visible?: boolean;
  data: { label: string; handler?: () => void; disable?: boolean }[];
  position?: { top?: string; left?: string };
};
export const MiniProcessMenu = (props: IMiniProcessMenu) => {
  const { visible = false, data = [], position } = props;
  const menuHeight = data.length * 32 + 16;
  const style = {
    ...position,
    top:
      position?.top &&
      parseInt(position.top, 10) > window.innerHeight - menuHeight
        ? `${window.innerHeight - menuHeight - 5}px`
        : position?.top,
  };
  if (!visible) return null;
  return ReactDOM.createPortal(
    <div className="mini-process-menu" style={style}>
      {data.map(item => (
        <div
          className={`mini-process-menu-item ${
            item.disable ? 'mini-process-menu-item-disable' : ''
          }`}
          key={item.label}
          onClick={() => {
            if (!item.disable && item.handler) {
              item.handler();
            }
          }}
        >
          <p>{item.label}</p>
        </div>
      ))}
    </div>,
    document.body
  );
};
