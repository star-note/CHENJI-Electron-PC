import { FC, useEffect, useRef, useState } from 'react';
import { BookOutlined } from '@ant-design/icons';
import { Cascader, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import store, { DispatchPro } from '@/store';
import { LineSpace, MiniProcessMenu } from '@/components';
import {
  deleteContent,
  editTime,
  editingSaveConfirm,
  titleInputRef,
} from '../utils';
import { Note } from '../note.interface';
import { getOptionsChildren, getUserNotes } from '../utils/firstNotes';
import { UserInfo, parseUrlParams } from '@/utils';

export interface IRightMenu {
  data: {
    position?: { top?: string; left?: string };
    note: Note;
    expandedKeys: React.Key[];
    loginUserId?: UserInfo['id'];
  };
  foldCB: (noteId: Note['noteId']) => void;
  foldOthersCB: (noteId: Note['noteId']) => void;
}

export const RightMenu: FC<IRightMenu> = props => {
  const { data, foldCB, foldOthersCB } = props;
  const [modalTargetOptions, setModalTargetOptions] = useState(null); // 笔记复制、移动modal目标选择器的动态数据源
  const [modalData, setModalData] = useState<{
    type: 'copy' | 'move';
    note: Note;
  } | null>(null); // 笔记复制、移动modal的类型，源笔记等数据，同时控制modal是否展示
  const selectedOptions = useRef<[]>(null); // 笔记复制、移动modal的目标选择器最终选择的options父子节点id数组
  const [cascaderError, setCascaderError] = useState(''); // 笔记复制、移动modal的报错信息
  const [visiable, setVisiable] = useState(false); // 更多菜单是否展示
  const { note: activeNoteId, space } = parseUrlParams(window.location.href);
  const [confirmLoading, setConfirmLoading] = useState(false); // 笔记复制、移动modal的确定button loading
  const { getDeletedNotes } = (store.dispatch as DispatchPro).note;
  const { getDeletedSpaceNotes } = (store.dispatch as DispatchPro).space;

  const [rightMenuData, setRightMenuData] = useState();
  // const addNewNote = useAddNewNote();
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      // 其他地方点击时，让菜单隐藏
      const portalClick = () => {
        setVisiable(false);
        window.removeEventListener('click', portalClick);
      };
      window.addEventListener('click', portalClick, false);

      if (!visiable) {
        setVisiable(true);
      }

      if (data.note) {
        const { note, expandedKeys, loginUserId } = data;
        const { noteId, isLeaf, childNodes, title, spaceId } = note;
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
        ];

        if (
          !noteId ||
          isLeaf === true ||
          !childNodes ||
          childNodes?.length === 0 ||
          !(expandedKeys || []).includes(noteId)
        ) {
          result[0].disable = true;
        } else {
          result[0].handler = () => {
            if (noteId) foldCB(noteId);
          };
        }
        if (
          expandedKeys.length === 0 ||
          (expandedKeys.length === 1 && expandedKeys[0] === noteId)
        ) {
          result[1].disable = true;
        }
        result[1].handler = () => {
          foldOthersCB(noteId);
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
            isLeaf: false, // 给动态loadData使用
            childNodes: store.getState().space.spaceList?.map(s => ({
              ...s,
              parentId: 'mySpaces', // 给动态loadData使用
              noteId: s.spaceId,
              isLeaf: false, // 给动态loadData使用
            })),
          },
        ];
        if (noteId?.startsWith('create$$')) {
          result[2].disable = true; // 正在新建的笔记不能复制
          result[3].disable = true; // 正在新建的笔记不能移动
        }
        result[2].handler = () => {
          setModalTargetOptions(target);
          setModalData({
            type: 'copy',
            note,
          });
        };
        result[3].handler = () => {
          setModalTargetOptions(target);
          setModalData({
            type: 'move',
            note,
          });
        };
        if (noteId !== activeNoteId) result[4].disable = true; // 只能重命名当前笔记
        // if (noteId?.startsWith('create$$')) result[5].disable = true; // 正在新建的笔记不能删除，不保存即可
        result[5].handler = () => {
          Modal.confirm({
            title: `确认删除改笔记及其所有子节点吗？`,
            content: `笔记：${title || '无标题'}`,
            cancelText: '取消',
            okText: '确定',
            onOk: async () => {
              await deleteContent(note);
              editTime.current = null;
              if (space) {
                await getDeletedSpaceNotes({
                  params: {
                    loginUserId,
                  },
                  apiName: 'getDeletedSpaceNotes',
                });
              } else {
                await getDeletedNotes({
                  params: {
                    loginUserId,
                  },
                  apiName: 'getDeletedNotes',
                });
              }
              navigate(
                `${window.location.pathname}${window.location.search}&recovery=1`.replace(
                  '&recovery=0',
                  ''
                )
              );
            },
          });
        };
        setRightMenuData(result);
      }
    }
  }, [data]);

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
    editingSaveConfirm(null).then(() => {
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
    <>
      <MiniProcessMenu
        data={rightMenuData}
        position={data?.position}
        visible={visiable}
      />
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
    </>
  );
};
