export const UserMenu = (props) => {
  const { hasLogout } = props;
  return <div>
    <p>用户面板</p>
    {hasLogout ? '退出' : ''}
    </div>;
};
