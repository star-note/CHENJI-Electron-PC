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
        publish(options: Record<string, unknown>): void;
        clickPublish(): any;
        onProcess(callback: (event, value)=> void): any;
      };
    };
  }
}

export {};
