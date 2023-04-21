import { WidthSpace, IconButton } from '@/components';

export const MenuRightIcons = (props) => {
  const { showLoading = false, onPlusClick } = props;
  return (
    <div className="row flex-center right-icons">
      <IconButton
        type="plus"
        style={{ background: 'transparent' }}
        onClick={(e) => {
          onPlusClick();
          e.stopPropagation();
        }}
      />

      {showLoading ? (
        <>
          <WidthSpace width={6} />
          <IconButton type="loading" style={{ background: 'transparent' }} />
        </>
      ) : null}
    </div>
  );
};
