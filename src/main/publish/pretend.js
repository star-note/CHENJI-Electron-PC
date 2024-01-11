/* eslint-disable */
// 可以使用此网站测试： https://infosimples.github.io/detect-headless/
// 在 main 的 page 中直接 gotoUrl 到测试网站
export const pretend = () => {
  try {
    const newProto = navigator.__proto__;
    delete newProto.webdriver; // 删除navigator.webdriver字段
    navigator.__proto__ = newProto;
    window.chrome = {
      app: {
        InstallState: 'hello',
        RunningState: 'alpha',
        getDetails: 'alpha',
        getIsInstalled: 'alpha',
      },
      csi: function () {},
      loadTime: function () {},
      runtime: function () {},
    }; // 添加window.chrome字段，为增加真实性还需向内部填充一些值
    Object.defineProperty(navigator, 'userAgent', {
      // userAgent在无头模式下有headless字样，所以需覆写
      get: () =>
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    });
    // Plugins Length Test
    Object.defineProperty(navigator, 'plugins', {
      get: () => {
        var ChromiumPDFPlugin = {};
        ChromiumPDFPlugin.__proto__ = Plugin.prototype;
        var plugins = {
          0: ChromiumPDFPlugin,
          description: 'Portable Document Format',
          filename: 'internal-pdf-viewer',
          length: 1,
          name: 'Chromium PDF Plugin',
          __proto__: PluginArray.prototype,
        };
        return plugins;
      },
    });

    // 添加语言
    Object.defineProperty(navigator, 'languages', {
      get: () => ['zh-CN', 'zh', 'en'],
    });

    // notification伪装
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);

    // WebGL设置
    const getParameter = WebGLRenderingContext.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (parameter) {
      // UNMASKED_VENDOR_WEBGL
      if (parameter === 37445) {
        return 'Intel Inc.';
      }
      // UNMASKED_RENDERER_WEBGL
      if (parameter === 37446) {
        return 'Intel(R) Iris(TM) Graphics 6100';
      }
      return getParameter(parameter);
    };

    // connection.rtt
    Object.defineProperty(navigator.connection, 'rtt', {
      get: () => 50,
    });
  } catch (e) {
    console.log(e);
  }
};
