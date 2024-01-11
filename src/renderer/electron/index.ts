import { Message } from '@/pages/publish/board/config';
import store from '@/store';
// import { updataPublishDetails } from '@/pages/publish/utils';

// 点击某一项发布
export const elecPublish = (payload: Record<string, unknown>) => {
  console.log(8888, payload);
  window.electron.ipcRenderer.elecPublish(JSON.stringify(payload));
};

// 接收发布状态信息
export const onProcess = () => {
  window.electron.ipcRenderer.on('publish:post-process', payload => {
    console.log(9999, payload);
    store.dispatch.publish.updataPublishDetails(payload);
    // updataPublishDetails({ noteId, target, message });
    // callback();
  });
};

// 渲染器传递消息给Main
export const sendMessage = payload => {
  const { channel, params } = payload;
  window.electron.ipcRenderer.sendMessage(channel, params);
};
