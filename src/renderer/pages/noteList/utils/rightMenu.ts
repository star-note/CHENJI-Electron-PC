import { useState } from 'react';
import { Modal } from 'antd';
import { IRightMenu } from '@/components/rightMenu';
import store, { DispatchPro } from '@/store';
import { Note } from '../note.interface';
import { findFather, getUserNotes } from './firstNotes';
import { deleteContent, titleInputRef } from './intex';

export const useMoreClick = (dataSource, setToggle) => {
  const [position, setPosition] = useState({ top: '0px', left: '0px' }); // 更多菜单的位置
  const [visiable, setVisiable] = useState(false); // 更多菜单是否展示
  const [rightMenuData, setMenuData] = useState<IRightMenu['data'] | null>(
    null
  ); // 更多菜单的数据
  const [modalData, setModalData] = useState<Record<string, unknown> | null>(
    null
  ); // 复制移动笔记Modal弹框数据

  const onMoreClick = (note: Note, x: number, y: number, noteToggle) => {
    setVisiable(true);
    setPosition({ top: `${y}px`, left: `${x}px` });
    const portalClick = () => {
      setVisiable(false);
      window.removeEventListener('click', portalClick);
    };
    window.addEventListener('click', portalClick, false);

    // 计算更多菜单的数据，按照数组的顺序不变来写死
    const result = [
      {
        label: '收起',
      },
      {
        label: '收起其他所有',
      },
      {
        label: '复制到 >',
      },
      {
        label: '移动到 >',
      },
      {
        label: '重命名',
        handler: () => titleInputRef.current?.focus(),
      },
      {
        label: '删除',
      },
    ]; // 每次点击先初始化数据，写在click事件外一直有bug
    if (
      !note.noteId ||
      !noteToggle[note.noteId] ||
      !note.childNodes ||
      note.childNodes.length === 0
    ) {
      result[0].disable = true;
    } else {
      result[0].handler = () => {
        if (note.noteId) setToggle({ ...noteToggle, [note.noteId]: false });
      };
    }
    result[1].handler = () => {
      const openNotes = note.noteId
        ? { [note.noteId]: noteToggle[note.noteId] }
        : {};
      if (dataSource && note.noteId) {
        findFather(dataSource, note.noteId)[0].forEach((noteId) => {
          openNotes[noteId] = true;
        });
      } else if (dataSource && note.parentId) {
        openNotes[note.parentId] = true;
        findFather(dataSource, note.parentId)[0].forEach((noteId) => {
          openNotes[noteId] = true;
        });
      }

      setToggle(openNotes);
      if (note.spaceId) {
        (store.dispatch as DispatchPro).sys.changeOpenKeys(['spaces']);
      } else {
        (store.dispatch as DispatchPro).sys.changeOpenKeys(['myNote']);
      }
    };
    const target = [
      {
        title: '我的笔记',
        noteId: 'myNotes',
        childNodes: getUserNotes(),
      },
      {
        title: '群组',
        noteId: 'mySpaces',
        childNodes: store.getState().space.spaceList?.map((space) => ({
          ...space,
          noteId: space.spaceId,
        })),
      },
    ];
    result[2].handler = () => {
      setModalData({
        type: 'copy',
        from: note,
        to: target,
      });
    };
    result[3].handler = () => {
      setModalData({
        type: 'move',
        from: note,
        to: target,
      });
    };
    if (!note || !note.noteId) result[5].disable = true;
    result[5].handler = () => {
      Modal.confirm({
        title: `确认删除改笔记及其所有子节点吗？`,
        content: `笔记：${note.title || '无标题'}`,
        cancelText: '取消',
        okText: '确定',
        onOk: () => deleteContent(note),
      });
    };
    setMenuData(result);
  };

  return [visiable, position, rightMenuData, modalData, onMoreClick];
};
