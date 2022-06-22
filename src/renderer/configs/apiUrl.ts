export const apiConfig: { [key: string]: string } = {
  // 登录
  verificationCode: '/v1/users/verification/code', // 生成验证码
  signup: '/user/sign', // 注册
  sign: '/user/login', // 登陆
  //  qrCodeValid: '/portal/login/qrCodeValid', // PC页面二维码登录结果轮询接口
  //  logout: '/portal/login/logout', // PC页面登出接口

  // 笔记
  createNote: '/notes/create', // 创建笔记
  getNote: '/notes/getById', // 获取笔记
  saveNote: '/notes/save', // 保存笔记
  getUserNotes: '/notes/getUserNotes', // 获取用户笔记树
  uploadImg: '/v1/upload' // 上传图片
};
