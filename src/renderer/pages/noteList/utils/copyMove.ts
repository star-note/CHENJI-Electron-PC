import { useNavigate } from 'react-router-dom';
import { Note } from '../note.interface';
import store, { DispatchPro } from '@/store';
import { updateFirstNotes } from './firstNotes';

export const useCopyMoveNote = () => {
  const navigate = useNavigate();
  const { fetchUserNotes } = (store.dispatch as DispatchPro).note;
  const { getSpaceNotes } = (store.dispatch as DispatchPro).space;

  const request = (
    type: 'copy' | 'move',
    note: Note,
    targetOptions,
    successCB
  ) =>
    (store.dispatch as DispatchPro).note
      .copyMoveNotes({
        params: {
          type,
          note,
          selectedOptions: targetOptions,
        },
        apiName: 'copyMoveNotes',
      })
      .then(result => {
        if (targetOptions) {
          // 如果是同笔记树复制移动，改善用户体验，不刷新页面
          // if (note.spaceId === result?.spaceId) {
          // if (type === 'move') {
          //   updateFirstNotes(note, note.spaceId, undefined, true); // 先删除原笔记
          // }
          // updateFirstNotes(result || note, result?.spaceId || note.spaceId); // 再添加结果笔记
          if (!!note.spaceId || targetOptions[0] !== 'mySpaces') {
            fetchUserNotes({
              params: {},
              apiName: 'getUserNotes',
            });
          }
          if (targetOptions[0] === 'mySpaces' || note.spaceId) {
            console.log(5555, targetOptions[0], targetOptions[1]);
            getSpaceNotes({
              params: {
                spaceId: targetOptions[1],
              },
              apiName: 'getSpaceNotesById',
            });
            if (note.spaceId !== targetOptions[1]) {
              getSpaceNotes({
                params: {
                  spaceId: note.spaceId,
                },
                apiName: 'getSpaceNotesById',
              });
            }
          }

          const origin = note.spaceId ? note.spaceId : '-1'; // 标识笔记来源，用来跳转后笔记树的重新渲染和展开
          const url =
            targetOptions[0] === 'mySpaces'
              ? `/notelist?note=${result?.noteId || note.noteId}&space=${
                  targetOptions[1]
                }&origin=${origin}`
              : `/notelist?note=${
                  result?.noteId || note.noteId
                }&origin=${origin}`;
          successCB(result); // 在跳转前执行回调
          navigate(url);
          // } else {
          //   // 根据目标笔记刷新左侧笔记树，移动的话源笔记也需要刷新，还需要设置activeNote，这里干脆整个页面刷新，先弄简单点
          //   window.location.href =
          //     targetOptions[0] === 'mySpaces'
          //       ? `/notelist?note=${result?.noteId || note.noteId}&space=${
          //           targetOptions[1]
          //         }`
          //       : `/notelist?note=${result?.noteId || note.noteId}`;
          // }

          return result; // 当是移动笔记，result是undefined，但是noteId是不会变的
        }
      });

  return [request];
};
