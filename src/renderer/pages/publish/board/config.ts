import React from 'react';
import configs from '@/configs';
import { Note } from '@/pages/noteList/note.interface';
import store from '@/store';
import { UserInfo } from '@/utils';

export enum DomType {
  input = 'INPUT',
  select = 'SELECT',
  inputNumber = 'INPUTNUMBER',
  textarea = 'TEXTAREA',
  picker = 'IMAGEPICKER',
  checkbox = 'CHECKBOX',
  date = 'DATEPICKER',
}
export interface Config {
  dom: {
    type: DomType;
    defaultValue?: string | boolean | number | null; // 如是DATEPICKER类型，应是'YYYY-MM-DD'格式
    rule?: {
      pattern?: RegExp; // input的校验正则规则
      message?: string; // 错误显示信息
      size?: {
        height: CSSStyleDeclaration['height'];
        width: CSSStyleDeclaration['width'];
        maxBit?: number;
      }; // 给图片上传使用，限制长宽比和最大体积限制，maxBit单位MB（默认1M: 1）
      inputType?: string; // input的 type，如 password 等
    };
    placeholder?: string; // input的placeholder，checkbox的框后文案（默认为label），图片上传的框内文案（默认为上传图片）
    required?: boolean;
    options?: string[]; // Select下拉框选项，如没有，则用户自定义添加
  };
  name: string; // 每一个form.item的name，需要唯一
  label?: string; // 每一个form.item的label
  help?: {
    description: string;
    url?: string;
  }; // 填写的帮助说明或文档
}
export interface Message {
  key: string; // 消息的key，key一样为重复消息
  time: number; // 时间戳
  process?: number;
  content: string | any;
  link?: string; // 文字、图片、卡片超链接
  type?: 'text' | 'url' | 'image' | 'inputCard'; // message支持的类型，默认text
  status?:
    | 'init'
    | 'pending'
    | 'fail'
    | 'publishing'
    | 'unsupported'
    | 'success'; // 默认为publishing
}
export interface PublishItem {
  getForm: (note: Note) => Config[];
  publish: (
    options: {
      form: Record<string, any>;
      note: Partial<Note> & { html?: string };
      source?: typeof configs.publishInfo;
      user?: Partial<UserInfo>;
    },
    postProcess: (message: Message) => void
  ) => void;
}
export const allPublishKeys = ['chenji', 'github', 'wechat']; // 全部可发布的目标key
export const webPublishKeys = ['chenji', 'github']; // web端可以发布的
export const electronPublishKeys = ['chenji', 'github', 'wechat']; // 或者所有可选数组
const staticUrl = 'https://www.unpkg.com/'; // 加载静态资源地址，由于publish sdk需要频繁升级，不能打入项目中

// 加载发布SDK，需要提前预加载
export const loadScript = () => {
  let targets;
  if (window.electron) {
    targets = electronPublishKeys;
  } else {
    targets = webPublishKeys;
  }
  store.dispatch.publish.updatePublishConfigs({
    chenji: {
      label: '辰记博客',
      logo: '',
      web: {
        getForm: (note): Config[] => [
          {
            dom: {
              type: DomType.select,
              required: true,
              placeholder: 'qfaefaw',
              options: ['asf', 'asfawe'],
              defaultValue: 'asf',
            },
            label: '选择分类',
            name: 'category',
            help: {
              description: '文章的分类，存放目录',
              url: 'https://www.baidu.com',
            },
          },
          {
            dom: {
              type: DomType.input,
              defaultValue: note.title,
              rule: {
                pattern: /\S+/,
                message: '请输入正确的文件名',
              },
              placeholder: '请输入文件名',
              required: true,
            },
            label: '发布文件名',
            name: 'name',
            help: {
              description: '保存的文件名，默认使用文章Title',
            },
          },
          {
            dom: {
              type: DomType.picker,
              placeholder: '上传封面',
              rule: {
                size: {
                  height: '200px',
                  width: '100px',
                  maxBit: 1,
                },
              },
            },
            label: '分享封面图片（1M限制）',
            name: 'cover',
            help: {
              description: '文章的分类，存放目录',
            },
          },
        ],
        publish: (options, postProcess) => {
          const { form, note } = options;
          postProcess({
            time: new Date().getTime(),
            process: 1,
            content: `辰记笔记发布开始，发布标题《${form.name}》`,
            status: 'publishing',
          });
          postProcess({
            time: new Date().getTime(),
            process: 10,
            content: `进行中`,
            status: 'publishing',
          });
        },
      },
    },
  });
  targets.forEach(key => {
    if (key !== 'chenji') {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `${staticUrl}@starnote/publish-${key}/dist/publish.min.js`;
      document.body.appendChild(script);
      script.onload = () => {
        console.log(
          key,
          'sdk load',
          window[`$publish_${key}`],
          window.PublishConfigs
        );
        store.dispatch.publish.updatePublishConfigs({
          [key]: window[`$publish_${key}`],
        });
      };
    }
  });
};

export const colorConfig = {
  init: '#d9d9d9',
  pending: 'yellow',
  fail: '#d0021b',
  publishing: 'green',
  unsupported: '#999',
  success: 'green',
};
