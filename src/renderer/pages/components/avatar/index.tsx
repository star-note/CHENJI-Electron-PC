import { FC } from 'react';
import { Avatar as AntdAvatar, AvatarProps, Popover } from 'antd';
import { connect } from 'react-redux';
import { DispatchPro, RootState } from '@/store';
import './avatar.less';
import { UserMenu } from './UserMenu';
import { UserInfo } from '@/utils';

type IAvator = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  AvatarProps & {
    userInfo?: UserInfo;
    hasLogout?: boolean;
  };

const Avatar: FC<IAvator> = props => {
  const { loginUserInfo = {}, logout, userInfo, size, hasLogout } = props;
  const { avatarUrl, name } = userInfo || loginUserInfo;
  return avatarUrl || name ? (
    <div className="avator-container">
      <Popover
        content={<UserMenu hasLogout={hasLogout} />}
        title={null}
        trigger="click"
      >
        <AntdAvatar
          style={{ backgroundColor: '#6918b4' }}
          // icon={<UserOutlined />}
          src={avatarUrl}
          size={size || 24}
        >
          {name.substring(0, 1).toUpperCase()}
        </AntdAvatar>
      </Popover>
    </div>
  ) : null;
};

const mapStateToProps = ({ user }: RootState) => ({
  loginUserInfo: user.userInfo,
});
const mapDispatchToProps = ({ user: { logout } }: DispatchPro) => ({
  logout,
});

export default connect(mapStateToProps, mapDispatchToProps)(Avatar);
