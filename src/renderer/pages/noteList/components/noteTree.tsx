import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Cascader, Modal } from 'antd';
import { RightMenu } from '@/components/rightMenu';
import store from '@/store';
import { parseUrlParams } from '@/utils';
import { NoteItem } from '.';
import { ActiveNote, Note, NotesTree, Space } from '../note.interface';
import { findFather } from '../utils/firstNotes';
import { addNewNote } from '../utils/intex';
import { useMoreClick } from '../utils/rightMenu';
import './noteTree.less';

export interface INoteTree {
  dataSource: NotesTree | undefined | null; // 数据源
  hasOffical?: boolean; // 是否含有辰记官网笔记，默认有
  activeNote?: ActiveNote; // 当前选中的笔记，如果新增，则activeNote.noteId为null
  className?: string; // 容器其他className
  spaceId?: Space['spaceId']; // 笔记树的类型：我的笔记/群组，用于群组的笔记树顶层需要添加更多的padding-left，space时每个NoteItem的level + 1
}
export const NoteTree = React.memo(function NoteTree(props: INoteTree) {
  const {
    dataSource = [],
    hasOffical = true,
    activeNote,
    className,
    spaceId,
  } = props;
  const [noteToggle, setToggle] = useState<Record<string, boolean>>({}); // 每个节点noteId收起/展开标识，true为展开
  // const [modalData, setModalData] = useState<Record<string, unknown> | null>(
  //   null
  // ); // 复制移动笔记Modal弹框数据

  // const [rightMenuData, setMenuData] =
  //   useState<IRightMenu['data']>(initRightMenu); // 更多菜单的数据
  // const [position, setPosition] = useState({ top: '0px', left: '0px' }); // 更多菜单的位置
  // const [visiable, setVisiable] = useState(false); // 更多菜单是否展示
  const [visiable, position, rightMenuData, modalData, onMoreClick] =
    useMoreClick(dataSource, setToggle);
  // note为目标noteId或者新增笔记时的父节点，space为目标spaceId，create表示是否新建笔记1/0
  const { note } = parseUrlParams(window.location.href);

  // 直接点击节点只能展开，收起需要右侧按钮
  const noteClick = useCallback(
    (target: Note) => {
      if (target.noteId && noteToggle[target.noteId] !== true) {
        setToggle({ ...noteToggle, [target.noteId]: true });
      }
    },
    [noteToggle]
  );
  // 当activeNote为空，且noteToggle为空，可以相当于该Tree为初次数据渲染，需要递归出所有要打开的节点
  useEffect(() => {
    if (!activeNote && dataSource && Object.keys(noteToggle).length === 0) {
      // dataSource不为空才去递归
      if (dataSource.length > 0 && note) {
        const toggle = noteToggle;

        const [path, target] = findFather(dataSource, note);
        if (path && path.length > 0) {
          path.forEach((noteId: Note['noteId']) => {
            if (noteId) toggle[noteId] = true;
          });
        }
        console.log(
          1111,
          toggle,
          dataSource,
          note,
          findFather(dataSource, note)
        );
        if (target) setToggle({ ...toggle, [note]: true }); // 如找到才设置打开的节点

        // 肯定能在某个树上能找到对应节点，找到节点再定义activeNote
        if (target && target.noteId) {
          store.dispatch.note.changeState({
            activeNote: target,
            initContent: target.content ? JSON.parse(target.content) : null,
          });
        }
      }
    }
  }, [dataSource]);

  // level控制每一个NoteItem的缩进，群组笔记的level初始化是1，需要比我的笔记多缩进一格
  const noteLoop = useCallback(
    (notes: Note[], level = 0) => {
      return notes.map((note) => {
        const { noteId, title, childNodes = [] } = note;
        return (
          <div key={noteId}>
            <NoteItem
              note={{
                ...note,
                title:
                  activeNote && activeNote.noteId === noteId && activeNote.title
                    ? activeNote.title
                    : title,
              }}
              onClick={noteClick}
              active={activeNote && activeNote.noteId === noteId}
              isOpening={!!note.noteId && noteToggle[note.noteId]}
              level={level}
              onMoreClick={(x, y) => onMoreClick(note, x, y, noteToggle)}
            />
            <div
              className={`note-children ${
                note.noteId && !!noteToggle[note.noteId] === false
                  ? 'note-hide'
                  : ''
              }`}
            >
              {childNodes.length > 0 ? noteLoop(childNodes, level + 1) : null}
              {/* 当新增笔记时，下方出来的一行前端虚拟出来的笔记节点，在noteLoop函数中类似 */}
              {activeNote &&
              activeNote.noteId === null &&
              activeNote.parentId === noteId ? (
                <NoteItem
                  note={activeNote}
                  active
                  show
                  level={level + 1}
                  onMoreClick={(x, y) =>
                    onMoreClick(activeNote, x, y, noteToggle)
                  }
                />
              ) : null}
            </div>
          </div>
        );
      });
    },
    [activeNote, noteToggle]
  );

  return (
    <div className={`note-container ${className || ''}`}>
      {hasOffical ? (
        <NoteItem
          note={{
            title: '辰记官方',
          }}
          active={activeNote === undefined}
          level={0}
        />
      ) : null}
      {useMemo(
        () => (
          <>
            {dataSource && dataSource.length > 0 ? (
              <>
                {
                  // 主体笔记树
                  noteLoop(dataSource, spaceId ? 1 : 0)
                }
              </>
            ) : null}
            {/* 当新增笔记时，下方出来的一行前端虚拟出来的笔记节点，在noteLoop函数中类似 */}
            {activeNote &&
            activeNote.noteId === null &&
            (activeNote.parentId === null ||
              activeNote.parentId === undefined) &&
            (spaceId === activeNote.spaceId ||
              (!spaceId && !activeNote.spaceId)) ? (
              <NoteItem
                note={activeNote}
                active
                show
                level={spaceId ? 1 : 0}
                onMoreClick={(x, y) =>
                  onMoreClick(activeNote, x, y, noteToggle)
                }
              />
            ) : null}
            {/* 明确dataSource为空字符串才显示，防止初始化为null时显示数据回来后又消失的闪动 */}
            {dataSource && dataSource.length === 0 ? (
              <div
                onClick={() => addNewNote(null, spaceId || '-1')}
                className="note-item"
                style={{ textAlign: 'center' }}
              >
                + 快速新增笔记
              </div>
            ) : null}
          </>
        ),
        [dataSource, spaceId, activeNote, noteToggle]
      )}

      <RightMenu data={rightMenuData} position={position} visible={visiable} />
      <Modal
        title={modalData?.type === 'copy' ? '复制笔记' : '移动笔记'}
        open={!!modalData}
        // onCancel={() => setModalData(null)}
        cancelText="取消"
        okText="确定"
      >
        <div>
          <span>从当前：</span>
          <span>{modalData?.from?.title || '无标题'}</span>
        </div>
        <div>
          <span>复制到：</span>
          <Cascader
            fieldNames={{
              label: 'title',
              value: 'noteId',
              children: 'childNodes',
            }}
            options={modalData?.to}
            onChange={(value) => console.log(value)}
            placeholder="请选择目标笔记"
            expandTrigger="hover"
          />
        </div>
      </Modal>
    </div>
  );
});
