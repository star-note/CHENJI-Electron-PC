import { app, BrowserWindow, ipcMain } from 'electron';
import pie from 'puppeteer-in-electron';
import puppeteer from 'puppeteer-core';
import { pretend } from './pretend';
import { loadScript } from './load';
import { subscribe } from './utils';

// 所有接入Electron端的发布SDK
const handlers = {
  // github,
};

export const mainPublish = (mainWindow: BrowserWindow) => {
  const postProcess = async (noteId: string, target: string, message: any) => {
    // 传递进度，单向main -> renderer
    console.log('postProcess: ', noteId, target, message);
    if (target && message) {
      mainWindow.webContents.send('publish:post-process', {
        noteId,
        target,
        message: {
          key: `${noteId}${target}${new Date().getTime()}${(
            Math.random() * 100
          ).toFixed(0)}`,
          ...message,
        },
      });
      if (message.type === 'inputCard' && message.content.channel) {
        const content = await subscribe(message.content.channel);
        return content;
      }
    }
  };

  ipcMain.on('elecPublish', async (event, arg: string) => {
    console.log('开始发布：', arg);
    const { key, payload = {}, needPuppeteer = true } = JSON.parse(arg) || {};
    const postMsg = (msg: any) => postProcess(payload.note.noteId, key, msg);
    // console.log(5555, typeof arg, arg || {}, key, payload, needPuppeteer);
    postMsg({
      process: 0,
      content: '开始发布',
      status: 'publishing',
    });
    if (!payload.note) {
      postMsg({
        process: 100,
        status: 'fail',
        content: `发布note为空`,
      });
      return;
    }

    const isDebug =
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true';

    if (needPuppeteer) {
      const browser = await pie.connect(app, puppeteer);
      const window = new BrowserWindow({
        show: !!isDebug,
        width: 1300,
        height: 800,
        webPreferences: {
          devTools: false,
        },
      });
      // const targetUrl = payload.url || handlers[key].startUrl;
      // try {
      //   await window.loadURL(targetUrl);
      // } catch (e) {
      //   console.log(e);
      //   postProcess(key, {
      //     type: 'error',
      //     message: `加载${targetUrl}网络错误`,
      //     help: {
      //       url: '',
      //       description: '点击查看常见问题',
      //     },
      //   });
      // }

      const contents = window.webContents;
      console.log('UA:', contents.getUserAgent()); // TODO 设置UA：最好替换掉Electron/18.0.3之类的标识
      // postProcess(key, {
      //   process: 10,
      //   message: '加载初始网址完成',
      // });

      const page = await pie.getPage(browser, window);
      page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      );
      await page.evaluateOnNewDocument(pretend); // 反反爬
      console.log(page.url());
      try {
        // await handlers[key].publish(payload, postProcess, page);
        const publish = await loadScript('github');
        publish(page, postMsg, payload);
      } catch (e) {
        console.log(e);
      }
    }
    // else {
    //   try {
    //     await handlers[key].publish(payload, postProcess);
    //   } catch (e) {
    //     console.log(e);
    //   }
    // }
  });

  // // 传递form，点击发起，这里返回form，双向
  // ipcMain.handle('clickPublish', async () => {
  //   const forms: Record<string, unknown> = {};
  //   Object.keys(handlers).forEach(target => {
  //     forms[target] = handlers[target].formConfigs;
  //   });
  //   return forms;
  // });
};
