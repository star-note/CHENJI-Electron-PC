import { Channels } from '../../main/preload';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
        elecPublish(
          options: string // 该 publish 函数所需要的参数
        ): void;
        // clickPublish(): any;
        onProcess(callback: (event, value) => void): any;
      };
    };
  }
}

export {};
