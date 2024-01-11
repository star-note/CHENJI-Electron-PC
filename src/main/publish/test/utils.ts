/* eslint-disable no-await-in-loop */
import { ElementHandle, Page } from 'puppeteer-core';
import { getForm, getTasks, key } from '.';

// -----------------------------------这部分基础定义和函数一般不修改----------------------------------------
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
// 根据Confis检查参数
export const checkParams = (
  params: Record<string, unknown>,
  configs: Config[]
) => {
  let matched = true;
  const isInclude = (arr1: string[], arr2: string[]) =>
    arr2.every(val => arr1.includes(val));
  if (
    !isInclude(
      configs.map(config => config.name),
      Object.keys(params)
    )
  ) {
    matched = false;
  } else {
    configs.forEach(config => {
      const value = params[config.name as keyof typeof params];
      if (config.dom.required && !value) {
        matched = false;
      }
      // 当检测项包涵正则rules
      if (config.dom.rule) {
        if (
          !config.dom.rule.pattern?.test(String(value)) ||
          value === undefined ||
          value === null
        ) {
          matched = false;
        }
      }
    });
  }

  return matched;
};

// 生成当前时间字符串
export const getTimeStr = () => {
  const time = new Date();
  const addLen = (num: number) => `0${num}`.slice(-2);
  return `${time.getFullYear()}-${addLen(time.getMonth() + 1)}-${addLen(
    time.getDate()
  )} ${addLen(time.getHours())}:${addLen(time.getMinutes())}:${addLen(
    time.getSeconds()
  )}`;
};

// 让程序 sleep 一段时间（ms）
export const sleep = (time = 1000) => {
  // eslint-disable-next-line compat/compat
  return new Promise(resolve => setTimeout(resolve, time));
};

// 匹配URL地址，含协议
export function isUrl(url: string) {
  return /^https?:\/\/(www\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(
    url
  );
}

// -------------------------------------这部分是 puppeteer 的操作方法，可能会修改--------------------------------------

export class PuppeteerUtils {
  page: Page;

  constructor(props) {
    const { page } = props;
    this.page = page;
  }

  // 跳转页面，校验是否成功
  gotoUrl = async ({
    url,
    options = {},
    selector,
  }: {
    url: string;
    options?: Parameters<Page['goto']>[1];
    selector?: string;
  }) => {
    if (isUrl(url)) {
      let checked = true;
      await this.page.goto(url, {
        // timeout: 60000,
        // waitUntil: 'load',
        ...options,
      });
      this.page
        .on('load', () => console.log('跳转成功'))
        .on('error', err => {
          console.log('页面崩溃：', err);
          checked = false;
        });

      await sleep();
      if (selector) {
        checked = !!(await this.queryDom({ selector }));
      }
      console.log(
        `完成页面 ${url} 跳转，${selector || '无 '}校验结果为${checked}`
      );

      return checked;
    }
    throw new Error('URL无效，请检查!');
  };

  // 检验页面某dom，没有不会报错，主要用于if判断 https://puppeteer.bootcss.com/api#pageselector
  queryDom = async ({
    selector,
    getOne = true,
  }: {
    selector: string;
    getOne?: boolean;
  }) => {
    let dom: ElementHandle | ElementHandle[] | null;
    if (getOne) {
      dom = await this.page.$(selector);
    } else {
      dom = await this.page.$$(selector);
    }

    return dom;
  };

  // 等待页面某Dom，直至出现，不出现会报错中断
  queryDomWait = async ({
    selector,
  }: {
    selector: string;
    getOne?: boolean;
  }) => {
    const dom: ElementHandle | ElementHandle[] | null =
      await this.page.waitForSelector(selector); // 最多 30s 超时

    return dom;
  };

  // dom点击
  clickDom = async ({
    selector,
    willNavigation = false,
    throwNone = true, // 当无 dom 时是否抛出异常，中断
    options,
  }: {
    selector: string;
    willNavigation?: boolean;
    throwNone?: boolean; // 当无 dom 时是否抛出异常，中断
    options?: Parameters<Page['click']>[1];
  }) => {
    const op = {
      delay: 100,
      ...options,
    };
    const dom = await this.page.$(selector);
    this.page.hover(selector); // selector会滚动到中间
    if (dom) {
      if (willNavigation) {
        const [response] = await Promise.all([
          this.page.waitForNavigation(), // The promise resolves after navigation has finished
          this.page.click(selector, op), // 点击该链接将间接导致导航(跳转)
        ]);
      } else {
        console.log(selector, op);
        await this.page.click(selector);
      }
      await sleep();
      console.log(`完成点击${selector}`);
      return dom;
    }

    if (throwNone) {
      throw new Error(`点击元素不存在：${selector}`);
    }
  };

  // 输入内容
  inputContent = async ({
    selector,
    content,
  }: {
    selector: string;
    content: string;
  }) => {
    if (content) {
      const input = await this.queryDom({ selector });
      // https://it.cha138.com/wen4/show-11542106.html
      await input.click({ clickCount: 3 });
      // await page.keyboard.press('Backspace');

      await sleep();
      await this.page.keyboard.type(content, { delay: 100 });
      console.log(`完成在${selector}中输入内容：${content}`);
    } else {
      throw new Error('输入内容为空，请检查！');
    }
  };

  // 获取内容
  getContent = async ({
    selector,
    type = 'innerText',
  }: {
    selector: string;
    type?: 'innerText' | 'value' | 'innerHTML';
  }) => {
    const result = await this.page.$eval(
      selector,
      (ele, type) => {
        return ele[type];
      },
      type
    );
    console.log(`获取${selector}内容的${type}: `, result);
    return result;
  };

  // select options选择
  selectOption = async ({
    selector,
    optionSelector,
    type = 'click',
    clickOptions,
  }: {
    selector: string;
    optionSelector: string;
    type?: 'click' | 'hover';
    clickOptions?: {
      willNavigation?: boolean;
      options?: Parameters<Page['click']>[1];
    };
  }) => {
    if (type === 'click') {
      await this.clickDom({ selector, ...clickOptions });
    } else {
      this.page.hover(selector);
    }
    await this.clickDom({ selector: optionSelector, ...clickOptions });
  };

  // 下载文件
  download = async ({ selector }) => {
    const downloadBtn = await this.page.waitForSelector(selector);
    if (downloadBtn) {
      await downloadBtn.click();
    } else {
      throw new Error(`找不到下载文件Dom:${selector}`);
    }
  };

  // 屏幕截图或某个dom的截图，返回的是图片 buffer
  screenshot = async ({
    selector,
    clip,
    options,
  }: {
    selector?: string;
    clip?: Parameters<Page['screenshot']>[0]['clip'];
    options?: Parameters<Page['screenshot']>[0];
  }) => {
    let img;
    if (clip) {
      img = await this.page.screenshot({ ...options, clip });
    } else if (selector) {
      const dom = await this.page.$(selector);
      const boundingBox = await dom.boundingBox();
      img = await this.page.screenshot({
        ...options,
        clip: {
          x: boundingBox.x,
          y: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      });
    } else if (options) {
      img = await this.page.screenshot({ ...options });
    }
    return img;
  };

  // 监控页面中请求结果，会监控从函数开始的所有页面请求，当请求 URL 符合时进入回调逻辑
  monitorResponse = ({ url, successTasks, failTasks }) => {
    return new Promise<void>((resolve, reject) => {
      this.page.on('response', async response => {
        try {
          if (response.url() === url) {
            if (response.ok()) {
              console.log(`${url}请求成功，开始执行 callback`);
              for (let i = 0; i < successTasks.length; i++) {
                const { fnName, params, info } = successTasks[i];
                console.log(`[${i + 1}] ${getTimeStr()} ${info}开始`);
                const utils = new PuppeteerUtils({ page: this.page });
                await utils[fnName](params);
              }
            } else {
              console.log(`${url}请求失败，开始执行 callback`);
              for (let i = 0; i < failTasks.length; i++) {
                const { fnName, params, info } = failTasks[i];
                console.log(`[${i + 1}] ${getTimeStr()} ${info}开始`);
                const utils = new PuppeteerUtils({ page: this.page });
                await utils[fnName](params);
              }
            }
            resolve();
          }
        } catch (e) {
          reject(e);
        }
      });
    });
  };

  // 请求接口
  request = (url, options) => {
    return fetch(url, options);
  };
}

export interface Task {
  fnName: string;
  params?: any;
  info?: string;
  msg?: Partial<Message>; // 可用来自定义进度的 msg：process、content、状态等，默认就是使用info简单返回
  failContent?: string; // 错误的自定义反馈
  type?: 'for' | 'if'; // 本条任务的特殊 type，是有循环还是逻辑判断类型
  sub?: {
    count?: number; // for的sub执行次数，从 0 开始
    ifType?: '!==' | '>' | '<' | '!!'; // if状态的 ifvalue 不用===，使用这里的符号
    ifValue?: any; //  if的父任务 fnName 返回值进逻辑sub 的条件
    task: Task[]; // 子任务流水线，现只支持一层，不要再嵌套
  }; // 特殊任务的子分支
}
export const taskLine = async (
  page: Page,
  postProcess: (msg: Message) => void,
  payload: Record<string, any>
) => {
  const { note } = payload;
  const initTasks = getTasks(payload);
  console.log('initTasks: ', initTasks);
  const initLen = initTasks.length;

  console.log(`---------任务线：${key}开始 ${getTimeStr()}---------`);
  checkParams(payload, getForm(note));
  postProcess({
    time: new Date().getTime(),
    content: `参数校验成功，开始${key}发布任务`,
    process: 5,
  });
  const circleTasks = async (
    tasks: Task[],
    pre: string,
    startProcess: number, // 循环开始的进度值
    endProcess: number // 循环终止的进度值
  ) => {
    const len = tasks.length;
    for (let i = 0; i < len; i++) {
      const { fnName, params, info, msg, type, sub, failContent } = tasks[i];
      // 当前进度值
      const process =
        parseInt(
          (((i + 1) * (endProcess - startProcess)) / (len + 1)).toFixed(0),
          10
        ) + startProcess;
      // 下一个进度值，当前如有sub进入递归时需要下一个进度值作为递归循环的终止进度值
      const nextProcess = len > 1 ? (process - startProcess) * 2 + startProcess : endProcess;
      try {
        console.log(
          `[${pre ? `${pre}-` : ''}${i + 1} / ${initLen}] ${getTimeStr()} ${
            info || fnName
          }开始`
        );
        const utils = new PuppeteerUtils({ page });
        console.log(fnName, utils[fnName], params);
        if (params.message && params.message.type === 'inputCard') {
          // 发送inputCard Message并等待返回值
          params.content = await postProcess(params.message);
        }
        const value = await utils[fnName](params);
        await sleep(1000);
        console.log(
          `[${pre ? `${pre}-` : ''}${i + 1} / ${initLen}] ${getTimeStr()} ${
            info || fnName
          }流程返回value为${value}`
        );

        if (type === 'for' && sub && sub.count && sub.task.length > 0) {
          for (let k = 0; k < sub.count; k++) {
            await circleTasks(
              sub.task,
              `${pre ? `${pre}-` : ''}${i + 1}`,
              process,
              nextProcess
            );
            // for (let j = 0; j < sub.task.length; j++) {
            //   const { fnName: fn, params: p, msg: m, info: io } = sub.task[j];
            //   await utils[fn](p);
            //   postProcess({
            //     time: new Date().getTime(),
            //     content: `${io || fn}完成`,
            //     ...m,
            //   });
            // }
          }
        } else if (type === 'if' && sub && sub.task.length > 0) {
          console.log(value, sub?.ifValue);
          let ifResult = value === sub.ifValue;
          if (sub.ifType) {
            ifResult = {
              '!==': value !== sub.ifValue,
              '>': value > sub.ifValue,
              '<': value < sub.ifValue,
              '!!': !!value === sub.ifValue,
            }[sub.ifType];
          }
          if (ifResult) {
            await circleTasks(
              sub.task,
              `${pre ? `${pre}-` : ''}${i + 1}`,
              process,
              nextProcess
            );
            // for (let j = 0; j < sub.task.length; j++) {
            //   const { fnName: fn, params: p, msg: m, info: io } = sub.task[j];
            //   await utils[fn](p);
            //   postProcess({
            //     time: new Date().getTime(),
            //     content: `${io || fn}完成`,
            //     ...m,
            //   });
            // }
          }
        } else {
          console.log(
            `[${pre ? `${pre}-` : ''}${
              i + 1
            } / ${initLen}] ${getTimeStr()} ${info}完成`
          );

          postProcess({
            time: new Date().getTime(),
            process,
            ...msg,
            content: `[${pre ? `${pre}-` : ''}${i + 1} / ${initLen}] ${
              msg?.content || info || fnName
            }完成`,
          });
        }
      } catch (e) {
        console.log('Err: ', e);
        postProcess({
          time: new Date().getTime(),
          process,
          ...msg,
          content: `[${pre ? `${pre}-` : ''}${i + 1} / ${initLen}] ${
            failContent || msg?.content || `${info || fnName}失败`
          }`,
          status: 'fail',
        });

        // break;
        return Promise.reject(e); // catch后抛出错误，使外层的递归循环中止；光break只能退出一层for
      }
      await sleep();
    }
  };

  await circleTasks(initTasks, '', 5, 100);
};
