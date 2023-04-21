import ReactDOM from 'react-dom';
import './index.less';

export type IRightMenu = {
  visible?: boolean;
  data: { label: string; handler?: () => void; disable?: boolean }[];
  position?: { top?: string; left?: string };
};
export const RightMenu = (props: IRightMenu) => {
  const { visible = false, data = [], position } = props;
  if (!visible) return null;
  return ReactDOM.createPortal(
    <div className="note-more-handler-menu" style={{ ...position }}>
      {data.map(item => (
        <div
          className={`right-menu-item ${
            item.disable ? 'right-menu-item-disable' : ''
          }`}
          key={item.label}
          onClick={item.handler}
        >
          <p>{item.label}</p>
        </div>
      ))}
    </div>,
    document.body
  );
};
