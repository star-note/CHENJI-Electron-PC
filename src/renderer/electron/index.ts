// 点击发布，生成Form表单配置
export const clickPublish = async () => {
  const form = await window.electron.ipcRenderer.clickPublish();
  console.log('clickPublish:', form);
  return form;
};

// 点击某一项发布
export const publish = (key: string, payload: Record<string, unknown>) => {
  window.electron.ipcRenderer.publish({
    key,
    payload,
  });
};

// 接收发布状态信息
export const onProcess = () => {
  window.electron.ipcRenderer.onProcess((event, message) => {
    // 更新Message信息 TODO
  });
};
