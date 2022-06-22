import { Menu } from 'antd';
import { connect } from 'react-redux';
import { DispatchPro, RootState } from '@/store';
import { getUserInfo, stringSort } from '@/utils';
import { useEffect } from 'react';
import { NoteTree } from './components';
import { addNewNote, onNoteClick } from './utils/intex';

type IFirstNotes = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const FirstNotes = (props: IFirstNotes) => {
  const { firstNotes, activeNote, getUserNotes } = props;
  const userId = getUserInfo()?.id;

  // 获取笔记树
  const getNoteTree = () => {
    getUserNotes({
      params: {
        userId,
      },
      apiName: 'getUserNotes',
    });
  };

  useEffect(() => {
    getNoteTree();
  }, []);

  return (
    <>
      <div className="logo">LOGO 辰记</div>
      <div className="add-note" onClick={addNewNote.bind(null, userId)}>
        新增笔记
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['home']}
        defaultOpenKeys={['myNote']}
      >
        <Menu.Item key="home">首页</Menu.Item>
        <Menu.SubMenu key="myNote" title="我的笔记" className="first-note-tree">
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
    </>
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
const mapDispatchToProps = ({ note: { getUserNotes } }: DispatchPro): any => ({
  getUserNotes,
});

export default connect(mapStateToProps, mapDispatchToProps)(FirstNotes);
