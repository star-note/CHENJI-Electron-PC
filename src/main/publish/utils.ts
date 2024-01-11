const { ipcMain } = require('electron');

export const subscribe = (channel) => {
  return new Promise((resolve, reject) => {
    ipcMain.on(channel, (event, payload) => {
      console.log(333, payload);
      resolve(payload.value);
    });
  });
};
