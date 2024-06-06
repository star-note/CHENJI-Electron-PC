import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Input, InputRef, Menu, Modal } from 'antd';
import {
  HomeOutlined,
  DesktopOutlined,
  BookOutlined,
  StarOutlined,
  DeleteOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { connect } from 'react-redux';
import { MyNotes, MyRecovery, MySpaceNotes } from '@/pages/noteList/firstNotes';
import { DispatchPro, RootState } from '@/store';
import { Storage, parseUrlParams } from '@/utils';
import { MenuRightIcons } from './menuRightIcons';
import { useAddNewNote } from '../noteList/utils';
import { useUrlKeys } from './hooks';
import { getUserNotes } from '../noteList/utils/firstNotes';
import './index.less';
import configs from '@/configs';

type ILayout = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const Layout = (props: ILayout) => {
  const {
    userNotes,
    deletedNotes,
    deletedSpaceNotes,
    spaceList,
    spaceNotes,
    userInfo = {},
    setUserInfo,
    fetchUserNotes,
    getAllSpace,
    openKeys,
    changeOpenKeys,
    getFirstLoading,
    createSpace,
    getSpaceLoading,
  } = props;
  const [selectedKeys, setSelectedKeys] = useUrlKeys(); // 根据URL确定menu选中的key
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false); // 第一栏是否直接收起
  const [isAddSpaceModalShow, setModalShow] = useState(false); // 新增群组的Modal
  const [spaceTitle, setTitle] = useState(''); // 新增群组的Title
  const spaceTitleRef = useRef<InputRef>(null);
  const addNewNote = useAddNewNote();
  const defaultUserNotes = getUserNotes(); // 默认从缓存读取用户笔记
  const { space } = parseUrlParams(window.location.href);

  // 控制侧边栏拖动改变宽度
  const dragListener = (delay: number) => {
    const dragBtn = document.getElementById('drag-btn');
    const firstSlider = document.querySelector('.first-slider');
    let firstWidth = 300; // firstSlider的默认宽度
    if (dragBtn) {
      dragBtn.onmousedown = (e) => {
        let startX = e.clientX;
        let initTime = 0;
        document.onmousemove = (ee) => {
          const nowTime = new Date().getTime();
          if (nowTime - initTime > delay) {
            initTime = nowTime;
            const endX = ee.clientX;
            const moveX = endX - startX; // 鼠标移动距离
            startX = endX; // 更新鼠标初始位置
            firstWidth += moveX;
            // 边界值处理
            if (firstWidth < 90) {
              firstSlider.style.width = '80px';
              setCollapsed(true);
            } else {
              firstSlider.style.width = `${firstWidth}px`;
              setCollapsed(false);
            }
          }
          return false;
        };

        document.onmouseup = () => {
          document.onmousemove = null;
          document.onmouseup = null;
        };

        return false;
      };
    }
  };

  useEffect(() => {
    const storageUserInfo = Storage.get('userInfo');
    if (!userInfo.id && storageUserInfo && storageUserInfo.id) {
      setUserInfo(storageUserInfo);
    }

    // 预请求我的笔记树和群组列表
    fetchUserNotes({
      params: {},
      apiName: 'getUserNotes',
    });
    getAllSpace({
      params: {},
      apiName: 'getAllSpaces',
    });

    dragListener(30);
  }, []);

  // 左侧菜单树的选择跳转
  const onSelect = ({
    key,
    selectedKeys: keys,
  }: {
    key: string;
    selectedKeys: string[];
  }) => {
    setSelectedKeys(keys);
    navigate(key);
  };

  const toggleCollapsed = () => {
    document.querySelector('.first-slider').style.width = '';
    setCollapsed(!collapsed);
  };
  const onAddSpaceSubmit = () => {
    if (spaceTitle.trim()) {
      createSpace({
        params: {
          title: spaceTitle.trim(),
        },
        apiName: 'createSpace',
      }).then((data) => {
        setModalShow(false);
        navigate(`/space?space=${data.newSpace.spaceId}`);
      });
    }
  };

  useEffect(() => {
    if (isAddSpaceModalShow) {
      setTimeout(() => {
        spaceTitleRef.current?.focus();
      }, 300);
    }
  }, [isAddSpaceModalShow]);

  return (
    <div className="main-layout">
      <div
        className={`scroller first-slider ${
          collapsed ? 'first-slider-collapsed' : ''
        }`}
      >
        <div className="logo">{configs.htmlTitle}</div>
        <div onClick={toggleCollapsed} className="slider-collapse">
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
        <Menu
          theme="light"
          mode="inline"
          openKeys={openKeys}
          selectedKeys={selectedKeys}
          onOpenChange={(keys) => {
            changeOpenKeys(keys);
            // setSelectedKeys([]);
          }}
          onSelect={onSelect}
          inlineCollapsed={collapsed}
        >
          <Menu.Item key="/" icon={<HomeOutlined />}>
            首页
          </Menu.Item>
          <Menu.Item key="/blog" icon={<DesktopOutlined />}>
            我的博客
          </Menu.Item>
          <Menu.Item key="/material" icon={<DesktopOutlined />}>
            素材库
          </Menu.Item>
          <Menu.SubMenu
            key="myNote"
            title={
              <>
                <span>我的笔记</span>
                <MenuRightIcons
                  showLoading={getFirstLoading}
                  onPlusClick={() => {
                    addNewNote(null);
                    changeOpenKeys([...openKeys, 'myNote']);
                  }}
                />
              </>
            }
            icon={<BookOutlined />}
            className="first-note-tree"
          >
            <MyNotes
              userNotes={userNotes || defaultUserNotes}
              loading={getFirstLoading}
            />
          </Menu.SubMenu>
          <Menu.SubMenu
            key="spaces"
            title={
              <>
                <span>群组</span>
                <MenuRightIcons
                  showLoading={getSpaceLoading}
                  onPlusClick={() => {
                    setModalShow(true);
                    changeOpenKeys([...openKeys, 'spaces']);
                  }}
                />
              </>
            }
            icon={<StarOutlined />}
            className="first-note-tree"
          >
            <MySpaceNotes
              spaceList={spaceList}
              space={space}
              spaceNotes={spaceNotes}
            />
          </Menu.SubMenu>
          <Menu.SubMenu key="recovery" title="回收站" icon={<DeleteOutlined />}>
            <MyRecovery
              userId={userInfo?.id}
              deletedNotes={deletedNotes}
              deletedSpaceNotes={deletedSpaceNotes}
            />
          </Menu.SubMenu>
        </Menu>
      </div>
      <div id="drag-btn" className="flex-center">
        <div className="drag-line" />
        {/* <img src={dragBtn} alt="" /> */}
      </div>
      <div className="layout-content">
        <Outlet />
      </div>

      <Modal
        title="新增群组"
        open={isAddSpaceModalShow}
        onOk={onAddSpaceSubmit}
        onCancel={() => setModalShow(false)}
        destroyOnClose
      >
        <Input
          placeholder="输入群组名称"
          value={spaceTitle}
          onChange={(e) => setTitle(e.target.value)}
          ref={spaceTitleRef}
        />
      </Modal>
    </div>
  );
};

const mapStateToProps = ({ note, space, user, sys }: RootState) => ({
  getSpaceLoading: space.getLoading,
  userNotes: note.userNotes,
  getFirstLoading: note.getFirstLoading,
  spaceList: space.spaceList,
  spaceNotes: space.spaceNotes,
  deletedNotes: note.deletedNotes,
  deletedSpaceNotes: space.deletedSpaceNotes,
  userInfo: user.userInfo,
  openKeys: sys.openKeys,
});
const mapDispatchToProps = ({
  note: { fetchUserNotes },
  space: { getAllSpace, createSpace },
  user: { setUserInfo },
  sys: { changeOpenKeys },
}: DispatchPro) => ({
  fetchUserNotes,
  getAllSpace,
  createSpace,
  setUserInfo,
  changeOpenKeys,
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
