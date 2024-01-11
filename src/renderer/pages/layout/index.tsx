import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
import { parseUrlParams, Storage } from '@/utils';
import './index.less';
import { MenuRightIcons } from './menuRightIcons';
import { addNewNote } from '../noteList/utils/intex';

type ILayout = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const Layout = (props: ILayout) => {
  const {
    userNotes,
    activeNote,
    deletedNotes,
    deletedSpaceNotes,
    spaceList,
    activeSpace,
    spaceNotes,
    userInfo = {},
    setUserInfo,
    getUserNotes,
    getAllSpace,
    changeState,
    changeSpaceState,
    openKeys,
    changeOpenKeys,
    getFirstLoading,
    getLoading,
    createSpace,
  } = props;
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['home']); // menu 选中的key
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false); // 第一栏是否直接收起
  const [isAddSpaceModalShow, setModalShow] = useState(false); // 新增群组的Modal
  const [spaceTitle, setTitle] = useState(''); // 新增群组的Title
  const spaceTitleRef = useRef<InputRef>(null);
  const location = useLocation(); // 用于监听location change

  // 控制侧边栏拖动改变宽度
  const dragListener = (delay: number) => {
    const dragBtn = document.getElementById('drag-btn');
    const firstSlider = document.getElementsByClassName('first-slider')[0];
    let firstWidth = 300; // firstSlider的默认宽度
    if (dragBtn) {
      dragBtn.onmousedown = e => {
        let startX = e.clientX;
        let initTime = 0;
        document.onmousemove = ee => {
          const nowTime = new Date().getTime();
          if (nowTime - initTime > delay) {
            initTime = nowTime;
            const endX = ee.clientX;
            const moveX = endX - startX; // 鼠标移动距离
            startX = endX; // 更新鼠标初始位置
            firstWidth += moveX;
            // 边界值处理
            // ？
            firstSlider.style.width = `${firstWidth}px`;
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
    getUserNotes({
      params: {},
      apiName: 'getUserNotes',
    });
    getAllSpace({
      params: {},
      apiName: 'getAllSpaces',
    });

    // // 页面刷新处理选择的菜单和打开的菜单
    // const path = window.location.pathname;

    // // note为目标noteId或者新增笔记时的父节点，space为目标spaceId，create表示是否新建笔记1/0
    // const { note, space } = parseUrlParams(window.location.href);
    // if (path === '/') {
    //   setSelectedKeys(['home']);
    //   changeOpenKeys([]);
    // } else if (path === '/blog') {
    //   setSelectedKeys(['blog']);
    //   changeOpenKeys([]);
    // } else if (path.startsWith('/notelist') && space) {
    //   setSelectedKeys([]);
    //   changeOpenKeys(['spaces']);
    //   changeSpaceState({
    //     activeSpace: space,
    //   }); // 在群组组件中监听activeSpace会请求该space的笔记内容
    // } else if (path.startsWith('/notelist') && !space) {
    //   setSelectedKeys([]);
    //   changeOpenKeys(['myNote']);
    // }

    dragListener(30);
  }, []);

  useEffect(() => {
    const { pathname } = location;

    // note为目标noteId或者新增笔记时的父节点，space为目标spaceId，create表示是否新建笔记1/0
    const { note, space } = parseUrlParams(window.location.href);
    if (pathname === '/') {
      setSelectedKeys(['home']);
      changeState({
        activeNote: null,
      });
    } else if (pathname === '/blog') {
      setSelectedKeys(['blog']);
      changeState({
        activeNote: null,
      });
    } else if (pathname.startsWith('/notelist') && space) {
      setSelectedKeys([]);
      changeOpenKeys(['spaces']);
      changeSpaceState({
        activeSpace: space,
      }); // 在群组组件中监听activeSpace会请求该space的笔记内容
    } else if (pathname.startsWith('/notelist') && !space) {
      setSelectedKeys([]);
      changeOpenKeys(['myNote']);
    }
  }, [location]);

  // 左侧菜单树的选择跳转
  const onSelect = ({
    key,
    selectedKeys: keys,
  }: {
    key: string;
    selectedKeys: string[];
  }) => {
    const urlMapping = {
      home: '/',
      blog: '/blog',
      material: '/material',
    } as Record<string, string>;
    setSelectedKeys(keys);
    navigate(urlMapping[key]);
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  const onAddSpaceSubmit = () => {
    if (spaceTitle.trim()) {
      createSpace({
        params: {
          title: spaceTitle.trim(),
        },
        apiName: 'createSpace',
      }).then(() => {
        setModalShow(false);
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
        <div className="logo">辰记</div>
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
          <Menu.Item key="home" icon={<HomeOutlined />}>
            首页
          </Menu.Item>
          <Menu.Item key="blog" icon={<DesktopOutlined />}>
            我的博客
          </Menu.Item>
          <Menu.Item key="material" icon={<DesktopOutlined />}>
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
                    addNewNote(null, '-1');
                    changeOpenKeys([...openKeys, 'myNote']);
                  }}
                />
              </>
            }
            icon={<BookOutlined />}
            className="first-note-tree"
          >
            <MyNotes userNotes={userNotes} activeNote={activeNote} />
          </Menu.SubMenu>
          <Menu.SubMenu
            key="spaces"
            title={
              <>
                <span>群组</span>
                <MenuRightIcons
                  showLoading={getLoading}
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
              activeSpace={activeSpace}
              spaceNotes={spaceNotes}
              activeNote={activeNote}
            />
          </Menu.SubMenu>
          <Menu.SubMenu key="recovery" title="回收站" icon={<DeleteOutlined />}>
            <MyRecovery
              userId={userInfo.id}
              deletedNotes={deletedNotes}
              deletedSpaceNotes={deletedSpaceNotes}
              activeNote={activeNote}
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
  getLoading: note.getLoading,
  activeNote: note.activeNote,
  userNotes: note.userNotes,
  getFirstLoading: note.getFirstLoading,
  spaceList: space.spaceList,
  spaceNotes: space.spaceNotes,
  activeSpace: space.activeSpace,
  deletedNotes: note.deletedNotes,
  deletedSpaceNotes: space.deletedSpaceNotes,
  userInfo: user.userInfo,
  openKeys: sys.openKeys,
});
const mapDispatchToProps = ({
  note: { getUserNotes, changeState },
  space: { getAllSpace, createSpace, changeState: changeSpaceState },
  user: { setUserInfo },
  sys: { changeOpenKeys },
}: DispatchPro) => ({
  getUserNotes,
  getAllSpace,
  createSpace,
  changeState,
  changeSpaceState,
  setUserInfo,
  changeOpenKeys,
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
