const requireFromUrl = require('require-from-url/sync');
const script = require('./test/index');

export const loadScript = key => {
  const staticUrl = 'https://www.unpkg.com/'; // 加载静态资源地址，由于publish sdk需要频繁升级，不能打入项目中
  const sdkUrl = `${staticUrl}@starnote/publish-${key}@0.6.8/dist/electron.min.js`;

  return new Promise((resolve, reject) => {
    // const script = requireFromUrl(sdkUrl);

    if (script && script.elecPublish) {
      resolve(script.elecPublish);
    } else {
      reject(
        new Error(`加载${key}script失败/或无taskLine方法，加载URL：${sdkUrl}`)
      );
    }
  });
};
