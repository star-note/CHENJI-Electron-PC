import { DeltaInsertOp, QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import dayjs from 'dayjs';
import configs from '@/configs';
import { ActiveNote } from '@/pages/noteList/note.interface';
import { UserInfo } from '@/utils';

export const convertHtml = (ops, userId?: string, noteId?: string) => {
  const converter = new QuillDeltaToHtmlConverter(ops, {
    inlineStyles: {
      font: {
        wsYaHei: 'font-family: 微软雅黑',
        songTi: 'font-family: 宋体',
        kaiTi: 'font-family: 楷体',
      },
      size: {
        '12px': 'font-size: 12px',
        '14px': 'font-size: 14px',
        '18px': 'font-size: 18px',
        '36px': 'font-size: 36px',
        small: 'font-size: 0.75em',
        large: 'font-size: 1.5em',
        huge: 'font-size: 2.5em',
      },
      // indent: (value, op) => {
      //   const indentSize = parseInt(value, 10) * 2;
      //   const side = op.attributes.direction === 'rtl' ? 'right' : 'left';
      //   return `padding-${side}:${indentSize}em`;
      // },
    },
    customTagAttributes: op => {
      if (op.insert.type === 'image') {
        return {
          style: op.attributes.style,
        };
      }
    },
  });

  // converter.beforeRender((groupType, data) => {
  //   // return your html
  //   if (groupType === 'inline-group') {
  //     const { ops } = data;
  //     if (
  //       Array.isArray(ops) &&
  //       ops.length > 1 &&
  //       ops.filter(op => op.insert.type === 'image').length > 0
  //     ) {
  //       return ops.reduce((total, op) => {
  //         const { insert, attributes } = op;
  //         if (insert.type === 'text') {
  //           if (insert.value !== '\n') {
  //             return `${total}<p ${attr2str(attributes)}>${insert.value}</p>`;
  //           }
  //           return `${total}<br />`;
  //         }
  //         if (insert.type === 'image') {
  //           return `${total}<img ${attr2str(attributes)} src="${
  //             insert.value
  //           }" />`;
  //         }
  //       }, '<p>');
  //     }
  //   }
  // });
  // converter.afterRender(function (groupType, htmlString) {
  //   // modify if you wish
  //   // return the html
  //   console.log(groupType, htmlString);
  //   return htmlString;
  // });

  const style = {
    blockquote: 'border-left: 4px solid #ccc;padding-left:16px;margin:0;',
    pre: 'background: #eee;padding:10px;margin:0;',
    img: 'max-width: 100%',
  };

  return `<div class="ql-star-html" data-user="${userId || ''}" data-noteId="${
    noteId || ''
  }" data-pubTime="${new Date().getTime()}"><style type="text/css">${Object.keys(
    style
  ).reduce(
    (result, key) =>
      `${result}.ql-star-html ${key}{${style[key as keyof typeof style]}}`,
    '.ql-star-html{line-height:1.5;font-size:14px;}.ql-star-html p,ol,ul{margin:0;}'
  )}</style>${converter.convert()}</div>`;
};

export const convertHtmlAll = (note: ActiveNote, userInfo?: UserInfo) => {
  return `
<html>
<head>
<title>${configs.htmlTitle}</title>
<style>
html{font-size: 14px;line-height:1.8;}
ol, ul{padding-inline-start: 2em;}
.note-desc {font-size:12px;color:#999;margin-bottom:16px;}
</style>
</head>
<body>
<h1>${note.title || `${configs.htmlTitle}（无标题）`}</h1>
<p class="note-desc">${
    userInfo?.name || note.userName || note.modifierName || ''
  }&nbsp;&nbsp;&nbsp;&nbsp;${dayjs(note.modifyTime).format('YYYY-MM-DD')}</p>
${convertHtml(JSON.parse(note.content).ops)}
</body>
</html>
  `;
};
