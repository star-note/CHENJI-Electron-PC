import { app, BrowserWindow, ipcMain } from 'electron';
import pie from 'puppeteer-in-electron';
import puppeteer from 'puppeteer-core';
import * as github from '../../publishSDK/github/electron';

// 所有接入Electron端的发布SDK
const handlers = {
  github,
};

interface Arg {
  key: keyof typeof handlers;
  payload: {
    url?: string;
  } & Record<string, unknown>;
  needPuppeteer?: boolean;
}
export const mainPublish = (mainWindow: BrowserWindow) => {
  const postProcess = (target: string, message: unknown) => {
    // 传递进度，单向main -> renderer
    mainWindow.webContents.send('post-process', target, message);
  };

  ipcMain.on('publish', async (event, arg: Arg) => {
    console.log('开始发布：', event, arg);
    postProcess('all', {
      process: 0,
      message: '开始发布',
    });
    const { key, payload = {}, needPuppeteer = true } = arg || {};
    const isDebug =
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true';

    if (needPuppeteer) {
      const browser = await pie.connect(app, puppeteer);

      const window = new BrowserWindow({
        show: !!isDebug,
        width: 1500,
        height: 800,
      });
      // const url = 'https://www.baidu.com/';
      await window.loadURL(payload.url || handlers[key].startUrl);
      const contents = window.webContents;
      console.log('UA:', contents.getUserAgent()); // TODO 设置UA：最好替换掉Electron/18.0.3之类的标识
      postProcess('all', {
        process: 10,
        message: '加载初始网址完成',
      });

      const page = await pie.getPage(browser, window);
      console.log(page.url());
      try {
        await handlers[key].publish(payload, postProcess, page);
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        await handlers[key].publish(payload, postProcess);
      } catch (e) {
        console.log(e);
      }
    }
  });

  // 传递form，点击发起，这里返回form，双向
  ipcMain.handle('clickPublish', async () => {
    const forms: Record<string, unknown> = {};
    Object.keys(handlers).forEach(target => {
      forms[target] = handlers[target].formConfigs;
    });
    return forms;
  });
};
