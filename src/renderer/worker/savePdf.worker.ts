/* eslint-disable no-restricted-globals */
import html2pdf from 'html2pdf.js';
// import { addScript } from "@/utils/utils";

const pdfWorker: Worker = self as any; // 创建主进程this指针
// 监听消息
pdfWorker.addEventListener('message', function (e) {
  const title = e.data[0];
  const htmlString = e.data[1];
  const opt = {
    margin: [15, 10, 15, 10],
    filename: `${title}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, dpi: 300 },
    jsPDF: {
      unit: 'mm',
      format: 'A4',
      orientation: 'portrait',
      compressPDF: true,
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
    },
  };

  console.log(title, htmlString, html2pdf);
  // 生成PDF并下载
  // if (self.html2pdf && typeof self.html2pdf === 'function') {
    html2pdf().from(htmlString).set(opt).save();
  // } else {
  //   addScript(
  //     'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
  //   ).then(() => {
  //     html2pdf().from(htmlString).set(opt).save();
  //   });
  // }
});

export default null as any; // 默认导出以免爆 my.worker.ts is not a module 这样的错误
