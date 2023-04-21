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
  uploadImg: '/images/up', // 上传图片
  deleteNote: '/notes/delete', // 删除个人笔记
  getDeletedNotes: '/notes/getDeleted', // 获取个人被删除笔记，回收站

  // 群组 Spaces
  getAllSpaces: '/spaces/getAll', // 查找某用户的所有权限群组
  getSpaceNotesById: '/spaces/getNotesById', // 获取群组的笔记树
  createSpace: '/spaces/create', // 新增群组
  getSpaceNote: '/spaces/getNote', // 获取群组中笔记内容
  saveSpaceNote: '/spaces/saveNote', // 保存或新建群组笔记
  deleteSpaceNote: '/spaces/deleteNote', // 删除群组笔记
  getDeletedSpaceNotes: '/spaces/getDeletedNotes', // 获取群组中被本人删除笔记，回收站
};
