import { FC, memo, useCallback, useEffect, useState } from 'react';
import { Tree } from 'antd';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@/components';
import store, { DispatchPro } from '@/store';
import { getNoteById, useAddNewNote, useNoteClick } from '../utils';
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
  const { note, space, origin, recovery } = parseUrlParams(
    window.location.href
  ); // origin为复制或者移动的来源，我的为-1，其他为spaceId；origin为recovery代表是从回收站恢复的笔记；recovery为回收站标识，用于回收站笔记的页面刷新
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]); // 树上被选中的节点，受控，非受控组件在点击时就会选中，然而当未保存点击不能立刻改变状态
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]); // 树展开的key
  const [rightMenuData, setMenuData] = useState<IRightMenu['data'] | null>(
    null
  );
  const userInfo = getUserInfo();
  const navigate = useNavigate();
  const rightMenuCB = useCallback((type: string, noteId: Note['noteId']) => {
    if (type === 'fold') {
      setExpandedKeys(expandedKeys.filter(key => key !== noteId));
    } else if (type === 'foldOthers') {
      if (noteId) setExpandedKeys([noteId]);
    } else if (type === 'copyMove') {
      const { space: targetSpaceId } = parseUrlParams(window.location.href);
      getNoteById(noteId, targetSpaceId); // 主要用于非active的笔记的复制/移动后，右侧编辑器显示后面的笔记内容
    }
  }, []);
  const [menuVisiable, setMenuVisiable] = useState(false);

  useEffect(() => {
    // 不能加dataSource && dataSource.length > 0判断，否则从回收站还原的笔记无法选中
    if (note !== selectedKeys[0]) {
      setSelectedKeys([note]);
    }

    // 只限第一次渲染，展开URL Note；需要限制selectedKeys.length，不然会出现点击我的笔记先拉出一段空白的bug（性能卡顿）
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

  // 用于复制、移动、删除、回收站还原后树的展开，会执行多次和可能的性能问题
  useEffect(() => {
    if (
      !isRecovery &&
      origin &&
      dataSource &&
      dataSource.length > 1 &&
      !expandedKeys.includes(note)
    ) {
      const [father, target] = findFather(dataSource, note);
      console.log(3333, origin, father, target);
      if (target && father.length === 0) {
        setExpandedKeys([...expandedKeys, note]);
      } else if (target && father.length > 0) {
        setExpandedKeys([...expandedKeys, ...father, note]);
      }
    }
  }, [dataSource]);

  // 点击所有节点触发，不控制节点的expand
  const onSelect = useCallback((keys, e) => {
    const { selectedNodes = [] } = e;
    const target = selectedNodes[0] || {};

    if (keys[0] === target.noteId) {
      onNoteClick(target, target.spaceId, isRecovery);
    }
  }, []);
  // 点击含子节点的行才触发
  const onExpand = useCallback((expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
  }, []);
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
    setMenuVisiable(true);
    // 其他地方点击时，让菜单隐藏
    const portalClick = () => {
      setMenuVisiable(false);
      window.removeEventListener('click', portalClick);
    };
    window.addEventListener('click', portalClick, false);
    e.stopPropagation();
  };

  const handleResumeClick = async (node: Note) => {
    const { resumeNotes, getDeletedNotes } = (store.dispatch as DispatchPro)
      .note;
    const { resumeNotes: resumeSpaceNotes, getDeletedSpaceNotes } = (
      store.dispatch as DispatchPro
    ).space;
    const { id: userId } = userInfo || {};

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

      getDeletedNotes({
        params: {
          loginUserId: userId,
        },
        apiName: 'getDeletedNotes',
      });
      getDeletedSpaceNotes({
        params: {
          loginUserId: userId,
        },
        apiName: 'getDeletedSpaceNotes',
      });
      navigate(
        `${window.location.pathname}${window.location.search}`.replace(
          '&recovery=1',
          '&origin=recovery'
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
        titleRender={node => {
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
                          onClick={e => onPlusClick(e, node)}
                        />
                      ) : null}
                      <IconButton
                        type="ellipsis"
                        onClick={e => handleMoreClick(e, node)}
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
          visiable={menuVisiable}
          rightMenuCB={rightMenuCB}
        />
      ) : null}
    </>
  ) : null;
});
