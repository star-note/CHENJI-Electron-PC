import { Menu, Popover } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { IconButton } from '@/components';
import { UserInfo, addScript } from '@/utils';
import { ActiveNote } from '../note.interface';
import { convertHtmlAll } from '@/pages/publish/utils/convert';
import configs from '@/configs';

export const MoreNoteProcess = ({
  note,
  userInfo,
}: {
  note: ActiveNote;
  userInfo?: UserInfo | null;
}) => {
  const onClick = e => {
    const cloneContent = document
      .getElementsByClassName('ql-container')[0]
      .cloneNode(true);
    const container = document.createElement('div');
    const header = document.createElement('div');
    header.innerHTML = `<h1>${
      note.title || `${configs.htmlTitle}（无标题）`
    }</h1><p style="color:#999;margin-bottom:20px;font-size:12px;">${
      userInfo?.name || note.userName || note.modifierName || ''
    }&nbsp;&nbsp;&nbsp;&nbsp;${dayjs(note.modifyTime).format(
      'YYYY-MM-DD'
    )}</p>`;
    cloneContent.style.border = '0'; // 去除编辑器ql-container的边框
    header.style.padding = '0 15px'; // 打印编辑器ql-editor会有padding

    container.appendChild(header);
    container.appendChild(cloneContent);

    const opt = {
      margin: [15, 10, 15, 10],
      filename: `${note.title}.pdf`,
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

    addScript(
      'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
    ).then(() => {
      html2pdf()
        .from(container)
        .set(opt)
        .toPdf()
        .get('pdf')
        .then(function (pdf) {
          const totalPages = pdf.internal.getNumberOfPages();

          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setTextColor(150);
            pdf.text(
              `Page ${i} of ${totalPages}`,
              14,
              pdf.internal.pageSize.getHeight() - 10
            );
          }
        })
        .save();
    });
  };
  const items = [
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: '下载PDF',
    },
  ];
  return (
    <Popover
      content={
        <Menu
          onClick={onClick}
          mode="vertical"
          items={items}
          rootClassName="note-more-menu"
        />
      }
      trigger="hover"
    >
      <div>
        <IconButton type="ellipsis" />
      </div>
    </Popover>
  );
};
