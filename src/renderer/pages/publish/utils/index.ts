import store, { Dispatch } from '@/store';
import { createRef, MutableRefObject } from 'react';

export const publishKeys = ['github'];
export interface Message {
  process?: number;
  message: string;
  help?: {
    url?: string;
    description?: string;
    author?: string;
    link?: string;
  }; // 一般是发布结束的发布成功页面或者失败说明，联系作者
  type?: 'error' | 'success'; // 发布结束的状态，优先级最高
}

// Web端的处理函数
export const publishWebFns: MutableRefObject<Record<
  string,
  PublishItem
> | null> = createRef();
export interface PublishItem {
  form: [] | undefined;
  publishHandler: (
    params: unknown,
    callback: (message: Message) => void
  ) => void;
}

export const publishInit = () => {
  publishKeys.forEach(key => {
    if (!(publishWebFns.current && publishWebFns.current[key])) {
      import(
        /* webpackPrefetch: true */ `../../../../publishSDK/${key}/web/index`
      )
        .then(data => {
          console.log('import github:', data);
          publishWebFns.current = {
            ...publishWebFns.current,
            [key]: {
              form: data.formConfigs,
              publishHandler: data.publish,
            },
          };

          // 每加载一个应该渲染一个form
          (store.dispatch as Dispatch).publish.changeLoadedTarget(key);
        })
        .catch(e => console.log('加载publish静态资源失败：', key, e));
    }
  });
};

// Electron端处理函数
export const publishElectronForms: MutableRefObject<Record<string, []> | null> =
  createRef();
export const addTarget = (form: Record<string, []> | null) => {
  publishKeys.forEach(key => {
    if (form && form[key]) {
      (store.dispatch as Dispatch).publish.changeElectronTarget(key);
    }
  });
};
