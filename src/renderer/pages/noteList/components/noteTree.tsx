/* eslint-disable promise/no-nesting */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Cascader, Modal } from 'antd';
import { RightMenu } from '@/components/rightMenu';
import store, { DispatchPro } from '@/store';
import { BookOutlined } from '@ant-design/icons';
import { LineSpace } from '@/components';
import { parseUrlParams } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { NoteItem } from '.';
import { ActiveNote, Note, NotesTree, Space } from '../note.interface';
import { findFather, getOptionsChildren } from '../utils/firstNotes';
import { addNewNote, editingSaveConfirm } from '../utils/intex';
import { useMoreClick } from '../utils/rightMenu';
import './noteTree.less';

export interface INoteTree {
  dataSource: NotesTree | undefined | null; // 数据源
  hasOffical?: boolean; // 是否含有辰记官网笔记，默认有
  activeNote?: ActiveNote; // 当前选中的笔记，如果新增，则activeNote.noteId为null
  className?: string; // 容器其他className
  spaceId?: Space['spaceId']; // 笔记树的类型：我的笔记/群组，用于群组的笔记树顶层需要添加更多的padding-left，space时每个NoteItem的level + 1
  isRecovery?: boolean; // 是否回收站，回收站不能新增，在菜单上也会有差异
}
export const NoteTree = React.memo(function NoteTree(props: INoteTree) {
  const {
    dataSource = [],
    hasOffical = true,
    activeNote,
    className,
    spaceId,
    isRecovery = false,
  } = props;
  const [noteToggle, setToggle] = useState<Record<string, boolean>>({}); // 每个节点noteId收起/展开标识，true为展开
  const [modalTargetOptions, setModalTargetOptions] = useState(null); // 笔记复制、移动modal目标选择器的动态数据源
  const [modalData, setModalData] = useState(null); // 笔记复制、移动modal的类型，源笔记等数据，同时控制modal是否展示
  const selectedOptions = useRef<[]>(null); // 笔记复制、移动modal的目标选择器最终选择的options父子节点id数组
  const [cascaderError, setCascaderError] = useState(''); // 笔记复制、移动modal的报错信息
  const [confirmLoading, setConfirmLoading] = useState(false); // 笔记复制、移动modal的确定button loading
  const navigate = useNavigate(); // 跳转URL用

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
      // note为目标noteId或者新增笔记时的父节点，space为目标spaceId
      const { note } = parseUrlParams(window.location.href);
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
      return notes.map(note => {
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

  const copyMoveCallback = (type, note, options) => {
    setModalTargetOptions(options);
    setModalData({
      type,
      note,
    });
  };

  const [visiable, position, rightMenuData, onMoreClick] = useMoreClick(
    dataSource,
    setToggle,
    copyMoveCallback
  );

  const loadCascaderData = selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    if (
      targetOption.spaceId &&
      targetOption.parentId === 'mySpaces' &&
      !targetOption.childNodes
    ) {
      targetOption.loading = true;
      (store.dispatch as DispatchPro).space
        .getSpaceNotes({
          params: {
            spaceId: targetOption.spaceId,
          },
          apiName: 'getSpaceNotesById',
        })
        .then(data => {
          targetOption.childNodes = data.spaceNotes;
          targetOption.loading = false;
          setModalTargetOptions([...modalTargetOptions]);
        });
    }
  };
  const submitMoveNote = () => {
    const { noteId } = modalData?.note || {};
    const targetOptions = selectedOptions.current;
    // 如还有未保存的笔记，提示需先保存
    editingSaveConfirm('save', null).then(() => {
      if (noteId) {
        if (targetOptions && targetOptions.length > 0) {
          const target = targetOptions[targetOptions.length - 1];
          if (target === 'mySpaces') {
            setCascaderError('不能选择“群组”节点，可以选择某个群组');
          } else if (
            targetOptions.includes(noteId) &&
            modalData?.type === 'move'
          ) {
            setCascaderError(
              '不能移动，目标笔记包含源笔记，请重新选择目标笔记'
            );
          } else {
            // 根据targetOptions路径获取最后节点的子节点
            const children = getOptionsChildren(
              modalTargetOptions,
              targetOptions
            );
            // 如果children包含源笔记，则不用操作
            if (
              children.filter((child: Note) => child.noteId === noteId).length >
              0
            ) {
              setCascaderError(
                `不能${
                  modalData?.type === 'copy' ? '复制' : '移动'
                }，源笔记已在目标笔记中`
              );
            } else {
              setConfirmLoading(true);
              (store.dispatch as DispatchPro).note
                .copyMoveNotes({
                  params: {
                    type: modalData?.type,
                    note: modalData?.note,
                    selectedOptions: targetOptions,
                  },
                  apiName: 'copyMoveNotes',
                })
                .then(result => {
                  setConfirmLoading(false);
                  setModalData(null);
                  // if (targetOptions && targetOptions[0] === 'mySpaces') {
                  //   (store.dispatch as DispatchPro).space.getSpaceNotes({
                  //     params: {
                  //       spaceId: targetOptions[1],
                  //     },
                  //     apiName: 'getSpaceNotesById',
                  //   });
                  //   navigate(
                  //     `/notelist?note=${
                  //       result && result.noteId ? result.noteId : noteId
                  //     }&space=${targetOptions[1]}`
                  //   );
                  // } else if (targetOptions && targetOptions[0] === 'myNotes') {
                  //   (store.dispatch as DispatchPro).note.getUserNotes({
                  //     params: {},
                  //     apiName: 'getUserNotes',
                  //   });
                  //   navigate(
                  //     `/notelist?note=${
                  //       result && result.noteId ? result.noteId : noteId
                  //     }`
                  //   );
                  // }

                  // 根据目标笔记刷新左侧笔记树，移动的话源笔记也需要刷新，还需要设置activeNote，这里干脆整个页面刷新，先弄简单点
                  window.location.href =
                    targetOptions && targetOptions[0] === 'mySpaces'
                      ? `/notelist?note=${
                          result && result.noteId ? result.noteId : noteId
                        }&space=${targetOptions[1]}`
                      : `/notelist?note=${
                          result && result.noteId ? result.noteId : noteId
                        }`;
                });
            }
          }
        } else {
          setCascaderError('未选择目标笔记，请选择');
        }
      } else {
        setCascaderError('源笔记错误，请重新选择源笔记');
      }
    });
  };

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
            {dataSource && dataSource.length === 0 && !isRecovery ? (
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
        onCancel={() => {
          setModalData(null);
          selectedOptions.current = null;
          setCascaderError('');
        }}
        width={700}
        destroyOnClose
        onOk={submitMoveNote}
        confirmLoading={confirmLoading}
      >
        <div>
          <BookOutlined />
          <span>{modalData?.note?.title || '无标题'}</span>
        </div>
        <LineSpace height={24} />
        <div>
          <span>{modalData?.type === 'copy' ? '复制' : '移动'}到：</span>
          <LineSpace height={6} />
          <Cascader
            fieldNames={{
              label: 'title',
              value: 'noteId',
              children: 'childNodes',
            }}
            options={modalTargetOptions}
            onChange={value => (selectedOptions.current = value)}
            loadData={loadCascaderData}
            placeholder="请选择目标笔记"
            expandTrigger="hover"
            className="target-cascader"
            changeOnSelect
          />
        </div>
        <p className="error-text">{cascaderError}</p>
      </Modal>
    </div>
  );
});
