import { FC, memo, useEffect, useState } from 'react';
import { Tree } from 'antd';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@/components';
import store, { DispatchPro } from '@/store';
import { useAddNewNote, useNoteClick } from '../utils';
import { getUserInfo, parseUrlParams } from '@/utils';
import { Note, NotesTree, Space } from '../note.interface';
import { IRightMenu, RightMenu } from './RightMenu';
import { findFather } from '../utils/firstNotes';
import './noteTree.less';

export interface INoteTree {
  dataSource: NotesTree | undefined | null; // 数据源
  className?: string; // 容器其他className
  isRecovery?: boolean; // 是否回收站，回收站不能新增，在菜单上也会有差异
  loading?: boolean;
  spaceId?: Space['spaceId']; // 笔记树的类型：我的笔记/群组
}
export const NoteTree: FC<INoteTree> = memo((props: INoteTree) => {
  const { dataSource, className, isRecovery = false, loading, spaceId } = props;
  const [onNoteClick] = useNoteClick();
  const addNewNote = useAddNewNote();
  const { note, space, recovery } = parseUrlParams(window.location.href);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]); // 树上被选中的节点，受控，非受控组件在点击时就会选中，然而当未保存点击不能立刻改变状态
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]); // 树展开的key
  const [rightMenuData, setMenuData] = useState<IRightMenu['data'] | null>(
    null
  );
  const userInfo = getUserInfo();
  const navigate = useNavigate();

  useEffect(() => {
    // 不能加dataSource && dataSource.length > 0判断，否则从回收站还原的笔记无法选中
    if (note !== selectedKeys[0]) {
      setSelectedKeys([note]);
    }
    // 第一次渲染，展开URL Note；需要限制selectedKeys.length，不然会出现点击我的笔记先拉出一段空白的bug
    if (expandedKeys.length === 0 && selectedKeys.length === 0) {
      // 解决疑难bug，我的笔记设置一个expandedkey就可以让父节点都展开，群组笔记树只设置一个无法展开，需要找到所有的父节点
      if (spaceId && space === spaceId && dataSource) {
        const [father] = findFather(dataSource, note);
        if (father && father.length > 0) {
          setExpandedKeys([...father, note]);
        }
      } else {
        setExpandedKeys([note]);
      }
    }
  }, [note]);
  useEffect(() => {
    if (
      !isRecovery &&
      recovery === '0' &&
      dataSource &&
      !expandedKeys.includes(note)
    ) {
      setExpandedKeys([...expandedKeys, note]); // 从回收站还原无法展开
    }
  }, [recovery]);

  // 点击所有节点触发，不控制节点的expand
  const onSelect = (keys, e) => {
    const { selectedNodes = [] } = e;
    const target = selectedNodes[0] || {};

    if (keys[0] === target.noteId) {
      onNoteClick(target, target.spaceId, isRecovery);
    }
  };
  // 点击含子节点的行才触发
  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
  };
  const onPlusClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    item: Note
  ) => {
    addNewNote(item, item.spaceId);
    if (item.noteId && !expandedKeys.includes(item.noteId)) {
      setExpandedKeys([...expandedKeys, item.noteId]);
    }
    e.stopPropagation();
  };

  const handleMoreClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    item: Note
  ) => {
    setMenuData({
      position: {
        top: `${e.clientY - e.nativeEvent.offsetY - 12}px`,
        left: `${e.clientX - e.nativeEvent.offsetX + 20 + 4}px`,
      },
      note: item,
      expandedKeys,
      loginUserId: userInfo?.id,
    });
    e.stopPropagation();
  };

  const handleResumeClick = async (node: Note) => {
    const { resumeNotes } = (store.dispatch as DispatchPro).note;
    const { resumeNotes: resumeSpaceNotes } = (store.dispatch as DispatchPro)
      .space;

    if (recovery === '1') {
      if (space) {
        await resumeSpaceNotes({
          params: {
            note: node,
          },
          apiName: 'resumeSpaceNotes',
        });
      } else {
        await resumeNotes({
          params: {
            note: node,
          },
          apiName: 'resumeNotes',
        });
      }

      navigate(
        `${window.location.pathname}${window.location.search}`.replace(
          '&recovery=1',
          '&recovery=0'
        )
      );
    }
  };

  if (dataSource?.length === 0 && !loading && !isRecovery) {
    return (
      <div className={`note-container flex-center ${className}`}>
        <div
          className="quick-add-button flex-center"
          onClick={() => addNewNote(null, spaceId)}
        >
          + 快速新增笔记
        </div>
      </div>
    );
  }
  return dataSource && dataSource.length > 0 && !loading ? (
    <>
      <Tree.DirectoryTree
        // autoExpandParent // 子节点全收起来，父节点才能收起
        draggable={{ icon: false }} // 可拖拽的四点icon
        blockNode
        treeData={dataSource}
        fieldNames={{
          key: 'noteId',
          children: 'childNodes',
        }}
        switcherIcon={false} // 切换箭头Icon
        rootClassName={`note-container ${className}`}
        onSelect={onSelect}
        onExpand={onExpand}
        selectedKeys={selectedKeys}
        expandedKeys={expandedKeys}
        titleRender={(node) => {
          return (
            <>
              <span className="item-title">{node.title || '无标题'}</span>
              {node.title !== '辰记官方' ? (
                <div className="handler-zoo">
                  {!isRecovery ? (
                    <>
                      {node.noteId !== null ? (
                        <IconButton
                          type="plus"
                          onClick={(e) => onPlusClick(e, node)}
                        />
                      ) : null}
                      <IconButton
                        type="ellipsis"
                        onClick={(e) => handleMoreClick(e, node)}
                      />
                    </>
                  ) : (
                    <IconButton
                      type="undo"
                      onClick={() => handleResumeClick(node)}
                    />
                  )}
                </div>
              ) : null}
            </>
          );
        }}
      />
      {rightMenuData ? (
        <RightMenu
          data={rightMenuData}
          foldCB={(noteId: Note['noteId']) => {
            setExpandedKeys(expandedKeys.filter((key) => key !== noteId));
          }}
          foldOthersCB={(noteId: Note['noteId']) => {
            if (noteId) setExpandedKeys([noteId]);
          }}
        />
      ) : null}
    </>
  ) : null;
});
