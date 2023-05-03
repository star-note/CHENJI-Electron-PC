## CHENJI-Electron-PC

辰记：一个立志于帮每个人内容变现，写丰富形式内容笔记并能发布到任意地方，支持web、h5、桌面程序、App的内容生产笔记应用。向Web3.0靠拢。

本项目主要是辰记桌面Electron端及PC Web端，同时项目中维护着多个基础开源SDK：

框架上继承了3个仓库：[electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) / [electron-react-puppeteer-demo](https://github.com/ludejun/electron-react-puppeteer-demo) / [react-rematch-ts](https://github.com/ludejun/react-rematch-ts)

Demo脱胎于electron-react-puppeteer-demo，render端脱胎于react-rematch-ts，并且刚开始项目为[Supernote-Web](https://github.com/ludejun/Supernote-Web)


### 快速启动

开发启动： yarn start

会把Electron环境启动起来；如果是想开发纯Web的内容，可以在浏览器端打开 http://localhost:1212/ 即为配套开发Web版

打包：yarn run package

### 开发维护：发布SDK

git submodule add https://github.com/star-note/publish-github.git src/publishSDK/github

<!-- git submodule add https://github.com/ludejun/quill-react-commercial.git src/renderer/components/RichTextEditor -->
