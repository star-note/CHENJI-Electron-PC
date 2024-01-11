import React, { createRef, MutableRefObject } from 'react';
import store, { Dispatch } from '@/store';
import { Message } from '../board/config';

// // Electron端处理函数
// export const publishElectronForms: MutableRefObject<Record<string, []> | null> =
//   createRef();
// export const addTarget = (form: Record<string, []> | null) => {
//   publishKeys.forEach(key => {
//     if (form && form[key]) {
//       (store.dispatch as Dispatch).publish.changeElectronTarget(key);
//     }
//   });
// };

// export const detailsRef: React.MutableRefObject<Record<
//   string,
//   Record<string, Message[]>
// > | null> = React.createRef();

// export const updataPublishDetails = (payload: {
//   noteId: string;
//   target: string;
//   message: Message;
// }) => {
//   const { noteId, target, message } = payload;
//   console.log(noteId, target, message, detailsRef.current);

//   if (detailsRef.current) {
//     if (detailsRef.current[noteId]) {
//       if (detailsRef.current[noteId][target]) {
//         detailsRef.current[noteId][target].unshift(message);
//       } else {
//         detailsRef.current[noteId][target] = [message];
//       }
//     } else {
//       detailsRef.current[noteId] = {
//         [target]: [message],
//       };
//     }
//   } else {
//     detailsRef.current = {};
//   }
// };
