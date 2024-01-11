import { createModel } from '@rematch/core';
import { Note, NotesTree } from '@/pages/noteList/note.interface';
import { Message, PublishItem } from '@/pages/publish/board/config';
import { RootModel } from '.';

interface IPublishState {
  publishConfigs: Record<
    string,
    { label: string; logo?: string; web: PublishItem; electron: PublishItem }
  > | null;
  allDetails: Record<string, Record<string, Message[]>>;
}
export const publish = createModel<RootModel>()({
  state: {
    publishConfigs: null,
    allDetails: {},
  } as IPublishState, // initial state
  reducers: {
    // // Web发布加载的目标
    // changeLoadedTarget(state, payload) {
    //   return {
    //     ...state,
    //     loadedTarget:
    //       state.loadedTarget && state.loadedTarget.indexOf(payload) > -1
    //         ? state.loadedTarget
    //         : (state.loadedTarget || []).concat(payload),
    //   };
    // },
    // // Electron发布加载的目标
    // changeElectronTarget(state, payload) {
    //   return {
    //     ...state,
    //     electronTarget:
    //       state.electronTarget && state.electronTarget.indexOf(payload) > -1
    //         ? state.electronTarget
    //         : (state.electronTarget || []).concat(payload),
    //   };
    // },
    // 发布目标及所有config
    updatePublishConfigs(state, payload) {
      return {
        ...state,
        publishConfigs: {
          ...state.publishConfigs,
          ...payload,
        },
      };
    },
    // // 更换发布详情
    // changePublishDetails(state, payload) {
    //   const { allDetails } = state;
    //   const { noteId, target, messages } = payload;
    //   if (allDetails[noteId]) {
    //     allDetails[noteId][target] = messages.concat([]);
    //   } else {
    //     allDetails[noteId] = {
    //       [target]: messages,
    //     };
    //   }
    //   console.log(4444, allDetails);
    //   return {
    //     ...state,
    //     allDetails,
    //   };
    // },
    // 更新发布详情
    updataPublishDetails(state, payload) {
      let { allDetails } = state;
      const { noteId, target, message, replaceTarget } = payload;
      if (replaceTarget) {
        allDetails = {
          ...allDetails,
          [noteId]: {
            ...allDetails[noteId],
            [target]: message,
          },
        };
      } else if (
        // 重复key的消息不插入
        !(
          allDetails[noteId] &&
          allDetails[noteId][target] &&
          allDetails[noteId][target].some(item => item.key === message.key)
        )
      ) {
        allDetails = {
          ...allDetails,
          [noteId]: {
            ...allDetails[noteId],
            [target]: [
              message,
              ...(allDetails[noteId] ? allDetails[noteId][target] : []),
            ],
          },
        };
      }

      return {
        ...state,
        allDetails,
      };
    },
  },
});
