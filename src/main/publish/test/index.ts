import { Config, DomType, Task, taskLine } from './utils';

export const key = 'github';
export const getForm = (note): Config[] => [
  {
    dom: {
      type: DomType.input,
      defaultValue: null,
      placeholder: '请输入Github用户名',
      required: true,
    },
    label: '登录Github用户名',
    name: 'username',
    help: {
      description: '如何获取Github的账户？',
      url: 'https://github.com/signup?source=login',
    },
  },
  {
    dom: {
      type: DomType.input,
      defaultValue: null,
      rule: {
        pattern: /\w+/,
        message: '请输入正确Github密码',
        inputType: 'password',
      },
      placeholder: '请输入密码',
      required: true,
    },
    label: 'Github账户密码',
    name: 'password',
    help: {
      description: '忘记Github的密码？',
      url: 'https://github.com/password_reset',
    },
  },
  // {
  //   dom: {
  //     type: DomType.input,
  //     defaultValue: null,
  //     placeholder: '请输入用户名/组织名',
  //   },
  //   label: '需要将仓库放置的用户名或有权限的组织名',
  //   name: 'repoUser',
  //   help: {
  //     description:
  //       '一般放于个人仓库，不填默认使用登录用户名；也可以放于有权限的组织名下',
  //   },
  // },
  {
    dom: {
      type: DomType.input,
      defaultValue: 'CHENJI',
      rule: {
        pattern: /[a-zA-Z0-9]+/,
        message: '请输入正确英文/数字仓库名',
      },
      placeholder: '请输入仓库名（英文）',
    },
    label: '仓库名',
    name: 'repo',
  },
  {
    dom: {
      type: DomType.select,
      options: ['辰记发布'],
      defaultValue: '辰记发布',
    },
    label: '选择分类',
    name: 'category',
    help: {
      description:
        '博客的文章分类/category、存放目录，建议添加修改，默认为“辰记发布”',
    },
  },
  {
    dom: {
      type: DomType.input,
      defaultValue: note.title,
      placeholder: '请输入文件名',
      required: true,
    },
    label: '发布文件名',
    name: 'name',
    help: {
      description: '博客文章名、保存的文件名，默认使用笔记Title',
    },
  },
];

export const getTasks = ({
  form: { username, password, repo, category, name },
  note,
}: any) =>
  [
    {
      fnName: 'gotoUrl',
      params: {
        url: 'https://github.com',
      },
      info: '跳转github',
      msg: {
        content: '跳转github成功，开始验证',
      },
      failContent: '跳转github失败，可能是网络错误需要VPN',
    },
    {
      fnName: 'queryDom',
      params: {
        selector: `img[alt="@${username}"]`,
      },
      type: 'if',
      sub: {
        ifType: '!!',
        ifValue: false,
        task: [
          {
            fnName: 'gotoUrl',
            params: {
              url: 'https://github.com/logout',
            },
            info: '跳转登出',
            msg: {
              content: '跳转登出页成功，开始退出登录',
            },
            failContent: '跳转登出页失败，可能是网络错误需要VPN',
          },
          {
            fnName: 'clickDom',
            params: {
              selector: 'input[value="Sign out"]',
              willNavigation: true,
              throwNone: false,
            },
            info: '确认登出',
          },
          {
            fnName: 'gotoUrl',
            params: {
              url: 'https://github.com/login',
            },
            info: '跳转登录页',
            msg: {
              content: '跳转登录页成功，开始登录',
            },
            failContent: '跳转登录页失败，可能是网络错误需要VPN',
          },
          {
            fnName: 'inputContent',
            params: {
              selector: '#login_field',
              content: username,
            },
            info: '输入用户名',
          },
          {
            fnName: 'inputContent',
            params: {
              selector: '#password',
              content: password,
            },
            info: '输入密码',
          },
          {
            fnName: 'clickDom',
            params: {
              selector: 'input[type=submit]',
              willNavigation: true,
            },
            info: '点击登录',
          },
          {
            fnName: 'queryDom',
            params: {
              selector: 'input#app_totp',
            },
            type: 'if',
            sub: {
              ifType: '!!',
              ifValue: true,
              task: [
                {
                  fnName: 'inputContent',
                  params: {
                    message: {
                      type: 'inputCard',
                      content: {
                        title: 'Authentication code',
                        placehodler: 'XXXXXX',
                        desc: 'Open your two-factor authenticator (TOTP) app or browser extension to view your authentication code.',
                        channel: `${key}-${note.noteId}-totp`,
                      },
                    },
                    selector: 'input#app_totp',
                  },
                },
              ],
            },
          },
          {
            fnName: 'queryDomWait',
            params: {
              selector: `img[alt="@${username}"]`,
            },
            failContent: '登录失败，用户名密码不正确或网络故障',
          },
        ],
      },
      failContent: '登录失败，发布流程中止',
    },
    {
      fnName: 'gotoUrl',
      params: {
        url: `https://github.com/${username}/${repo}`,
        selector: '#repo-content-pjax-container',
      },
      info: '跳转到仓库',
      type: 'if',
      sub: {
        ifValue: false,
        task: [
          {
            fnName: 'gotoUrl',
            params: {
              url: `https://github.com/new?template_name=CHENJI-Template&template_owner=star-note`,
            },
            info: '跳转新建仓库页面',
          },
          {
            fnName: 'inputContent',
            params: {
              selector: 'input[aria-label=Repository]',
              content: repo,
            },
            info: '输入仓库名',
          },
          {
            fnName: 'clickDom',
            params: {
              selector: '.application-main button[type=submit]',
              willNavigation: true,
            },
            info: '创建仓库成功',
          },
        ],
      },
    },
    {
      fnName: 'gotoUrl',
      params: {
        url: `https://github.com/${username}/${repo}/edit/main/Notes笔记/${
          category ? `${category}/${name}` : name
        }`,
        selector: 'a[aria-label="go to Overview"]',
      },
      info: '编辑仓库文章',
      type: 'if',
      sub: {
        ifValue: true,
        task: [
          {
            fnName: 'gotoUrl',
            params: {
              url: `https://github.com/${username}/${repo}/new/main/Notes笔记/`,
            },
            info: '新建仓库文章',
          },
          {
            fnName: 'inputContent',
            params: {
              selector: 'input[aria-label="File name"]',
              content: `${category || '辰记发布'}/${name}`,
            },
            info: '输入仓库文章标题',
          },
        ],
      },
    },
    {
      fnName: 'inputContent',
      params: {
        selector: '.cm-content',
        content: JSON.stringify(note),
      },
      info: '输入笔记内容',
    },
    {
      fnName: 'clickDom',
      params: {
        selector:
          '#repo-content-pjax-container > react-app button[type=button].bbZPuV',
        willNavigation: true,
      },
      info: '提交Commit',
    },
    {
      fnName: 'clickDom',
      params: {
        selector: 'div[role=dialog] button[type=button]:nth-child(2)',
        willNavigation: true,
      },
      info: '提交发布',
    },
    {
      fnName: 'gotoUrl',
      params: {
        url: `https://github.com/${username}/${repo}`,
      },
    },
    {
      fnName: 'queryDom',
      params: {
        selector: '.Layout-sidebar .octicon-link',
      },
      info: '查看是否设置主页',
      type: 'if',
      sub: {
        ifValue: false,
        ifType: '!!',
        task: [
          {
            fnName: 'gotoUrl',
            params: {
              url: `https://github.com/${username}/${repo}/settings/pages`,
            },
            info: '进入Github Pages设置页',
          },
          {
            fnName: 'clickDom',
            params: {
              selector: 'summary.select-menu-button',
            },
            info: '选择分支',
          },
          {
            fnName: 'clickDom',
            params: {
              selector: '.SelectMenu-list label.SelectMenu-item',
            },
            info: '选择主分支',
          },
          {
            fnName: 'clickDom',
            params: {
              selector: 'pages-jekyll-config button[type=submit]',
            },
            info: '保存Github Pages，隔段时间生效',
          },
        ],
      },
    },
  ] as Task[];

export const elecPublish = taskLine;
