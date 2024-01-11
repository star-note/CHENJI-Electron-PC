import dayjs from 'dayjs';

// File转Base64
// getBase64(file, url => { console.log(url) })
export const getBase64 = (img: File): Promise<string> => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.readAsDataURL(img);
  });
};

// 获取统一格式时间，到秒
export const getTime = () => {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
};
