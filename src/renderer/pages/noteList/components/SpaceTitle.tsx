import { useNavigate } from 'react-router-dom';
import { Space } from '../note.interface';
import { IconButton } from '@/components';
import store from '@/store';

export const SpaceTitle = (props) => {
  const { active = false, space } = props;
  const navigate = useNavigate();
  const onSpaceTitleClick = (spId: Space['spaceId']) => {
    // 解决当前是群笔记，点击群Title，再点击这个笔记，由于activeNote没有变，导致URL不变也不会跳转的bug
    store.dispatch.note.changeState({
      activeNote: null,
    });
    navigate(`/space?space=${spId}`);
  };

  return (
    <div
      className={`space-name ${active ? 'space-name-active' : ''}`}
      onClick={() => onSpaceTitleClick(space.spaceId)}
    >
      {space.title}({space.cnt || '-'}人)
      <div className="handler-zoo">
        <IconButton type="plus" />
        <IconButton type="ellipsis" />
      </div>
    </div>
  );
};
