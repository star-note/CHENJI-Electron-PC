import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
// import { useHistory } from 'react-router-dom';
import { message, Layout, Menu, Modal, Input } from 'antd';
// import RichTextEditor from 'quill-react-commercial';
// import RichTextEditor from '../../components/RichTextEditor/index';
import { EditorContainer, NoteTree } from './components';
import { DispatchPro, RootState } from '@/store';
import { request, stringSort, debance, throttle } from '@/utils';
import { ajaxFormPostOptions, apiURL } from '@/configs/api';
import './index.less';
import 'quill-react-commercial/dist/quill-react-commercial.min.css';
import { getUserInfo } from '@/utils/userInfo';
import RichTextEditor from '../../components/RichTextEditor/dist/quill-react-commercial.min';
import { Note } from './note.interface';
import { updateFirstNotes } from './utils/firstNotes';
import { getNoteById } from './utils/intex';

type INoteList = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const NoteList = (props: INoteList) => {
  const {
    saveNote,
    getNote,
    // saveLoading,
    // getLoading,
    activeNote,
    getUserNotes,
    // getFirstLoading,
    firstNotes,
    updateActiveNote,
    saveStatus,
  } = props;
  const [quill, setQuill] = useState(null);
  // const [activeNote, setActiveNote] = useState(undefined); // 选中的笔记树内容，默认为undefined，当为新增笔记时，{id: null, title: '无标题'}，当为activeNote.id为null时应该在新增笔记
  // const [editing, setEditing] = useState(false); // 是否有未被保存笔记内容
  // 笔记的编辑态存放在activeNote中
  const userId = getUserInfo()?.id;
  const editing = useRef(false); // 是否有未被保存笔记内容，这个值更新不需要重新渲染组件，在函数组件中保持值使用useRef
  const [title, setTitle] = useState(activeNote?.title); // activeNote的title
  const [initContent, setInitContent] = useState(null); // 富文本编辑器的初始化内容
  const lastSaveTime = useRef(null); // 上一个保存笔记时间，不代表保存成功，为在保存过程中有新增编辑但保存成功后会优先清楚编辑态导致点击其他笔记不会触发保存 [type: start/edit, timestamp]

  const { Header, Content, Footer } = Layout;

  return (
    <Layout className="notelist">
      {/* <Layout.Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
        className="sider"
      >
        <div className="logo">LOGO 辰记</div>
        <div className="add-note" onClick={addNewNote}>
          新增笔记
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['home']}
          defaultOpenKeys={['myNote']}
        >
          <Menu.Item key="home">首页</Menu.Item>
          <Menu.SubMenu
            key="myNote"
            title="我的笔记"
            className="first-note-tree"
          >
            <NoteTree
              dataSource={firstNotes?.sort((a, b) =>
                stringSort(a.title, b.title)
              )}
              onNoteClick={onNoteClick}
              activeNote={activeNote}
            />
          </Menu.SubMenu>
          <Menu.Item key="6">我的收藏</Menu.Item>
          <Menu.Item key="7">回收站</Menu.Item>
        </Menu>
      </Layout.Sider> */}
      <Layout className="note-layout">
        <Header className="note-header" />
        <Content className="note-content">
          <EditorContainer />
          {/* <div>
            <Input
              allowClear
              placeholder="无标题"
              onChange={onTitleChange}
              value={title}
              onBlur={onTilteBlur}
            />
            <RichTextEditor
              modules={{
                table: {},
                codeHighlight: true,
                imageHandler: {
                  imgUploadApi: (formData) =>
                    // console.log(apiURL('uploadImg'))
                    request(
                      apiURL('uploadImg'),
                      ajaxFormPostOptions(formData)
                    ).then((response) => response.url),
                  uploadFailCB: () => message.error('图片上传失败'),
                },
              }}
              getQuill={getQuill}
              content={
                initContent
              }
              onChange={quillChange}
            />
            {saveStatus === 'failure' ? (
              <button onClick={saveContent}>重新保存</button>
            ) : (
              <button onClick={saveContent}>保存</button>
            )}
            <div id="quillContent" />
            <button onClick={publishNote}>发布</button>
          </div> */}
        </Content>
        <Footer style={{ textAlign: 'center' }}>辰记@2022</Footer>
      </Layout>
    </Layout>
  );
};

const mapStateToProps = ({ note }: RootState) => ({
  saveLoading: note.saveLoading,
  getLoading: note.getLoading,
  activeNote: note.activeNote,
  firstNotes: note.firstNotes,
  getFirstLoading: note.getFirstLoading,
  saveStatus: note.saveStatus,
});
const mapDispatchToProps = ({
  note: {
    createNote,
    saveNote,
    getNote,
    getUserNotes,
    updateActiveNote,
  },
}: DispatchPro): any => ({
  createNote,
  saveNote,
  getNote,
  getUserNotes,
  updateActiveNote,
});

export default connect(mapStateToProps, mapDispatchToProps)(NoteList);
