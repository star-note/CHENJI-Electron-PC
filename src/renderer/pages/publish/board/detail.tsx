import { Button, Input, Progress } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import { Message, colorConfig } from './config';
import { sendMessage } from '@/electron';
import { InputCard } from './components';
import store from '@/store';
// import { useState } from 'react';

const DetailItem = ({ msg }: { msg: Message }) => {
  const {
    content,
    type = 'text',
    status = 'publishing',
    process,
    link,
    time,
  } = msg;

  const msgTpl = useCallback(
    (child: React.ReactNode) => (
      <p className="detail-item">
        <span className="msg-time">{dayjs(time).format('HH:mm:ss')}</span>
        {link ? (
          <a href={link} target="_blank" rel="noreferrer">
            {child}
          </a>
        ) : (
          child
        )}
      </p>
    ),
    []
  );
  switch (type) {
    case 'text':
      return msgTpl(content);
    case 'url':
      return msgTpl(content);
    case 'image':
      return msgTpl(<img src={content} alt="" />);
    case 'inputCard':
      return msgTpl(<InputCard content={content} />);
    default:
      return msgTpl(content);
  }
};

interface IPublishDetail {
  label?: string;
  publishDetail: Message[] | undefined;
}
export const PublishDetail = (props: IPublishDetail) => {
  const { publishDetail = [], label } = props;
  const currentProcess = publishDetail.filter(
    (item) => item.process || item.process === 0
  )[0]?.process;
  let currentStatus = publishDetail.filter((item) => item.status)[0]?.status;
  if (!currentStatus && currentProcess && currentProcess > 0) {
    currentStatus = 'publishing';
  }
  console.log(6666, store.getState().publish.allDetails, publishDetail)

  return publishDetail && publishDetail.length > 0 ? (
    <div className="publish-detail">
      <p>发布{label || ''}进度：</p>
      <Progress
        percent={currentProcess}
        strokeColor={colorConfig[currentStatus || 'init']}
      />
      <p>
        进度详情
        {publishDetail.length > 0
          ? `（${dayjs(publishDetail[0].time).format('YYYY-MM-DD')}）`
          : ''}
        ：
      </p>
      {publishDetail.map((msg, index) => (
        <DetailItem
          msg={msg}
          key={`${String(index)}${(Math.random() * 100).toFixed(0)}`}
        />
      ))}
    </div>
  ) : (
    <div>无发布详情</div>
  );
};
