import {  List } from 'antd';
import Highlighter from 'react-highlight-words';
import dayjs from 'dayjs';
import { LikeOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import { IconButton } from '@/components';
import { getImgFromContent } from '../noteList/utils';
import Avatar from '../components/avatar';

export const SearchList = props => {
  const { data = [], searchWords } = props;

  return (
    <List
      itemLayout="vertical"
      size="large"
      dataSource={data}
      renderItem={(item) => (
        <List.Item
          key={item.noteId}
          actions={[
            <IconButton type="star" />,
            <IconButton type="like" />,
            <IconButton type="message" />,
          ]}
          extra={
            <img width={272} alt="" src={getImgFromContent(item.content)} />
          }
        >
          <List.Item.Meta
            avatar={
              <Avatar
                hasLogout={false}
                userInfo={{
                  avatarUrl: item.avatar,
                  name: item.name || item.modifierName,
                  id: item.userId || item.modifier,
                }}
              />
            }
            title={
              <a href={item.href}>
                <Highlighter
                  highlightClassName="search-highlight-text"
                  searchWords={searchWords}
                  textToHighlight={item.title}
                />
              </a>
            }
            description={`${dayjs(item.modifyTime).format('YYYY-MM-DD')}  ${
              item.spaceId ? '' : '我的笔记'
            }`}
          />
          <Highlighter
            highlightClassName="search-highlight-text"
            searchWords={searchWords}
            textToHighlight={item.text}
          />
        </List.Item>
      )}
    />
  );
};
