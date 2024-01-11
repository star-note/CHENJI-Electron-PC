import { useParams } from 'react-router-dom';
import { Input, Tabs, TabsProps } from 'antd';
import { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import store, { DispatchPro, RootState } from '@/store';
import { LineSpace } from '@/components';

import './index.less';
import { SearchList } from './SearchList';

type ISearchPage = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;
export const SearchPage: FC<ISearchPage> = props => {
  const { searchNotes = {}, searchAll } = props;
  console.log(searchNotes && searchNotes.keywords);
  const params = useParams();
  const [words, setWords] = useState(params['*']);

  const onSearch = value => {
    searchAll({
      params: {
        words: value,
      },
      apiName: 'search',
    });
  };

  useEffect(() => {
    if (words) {
      onSearch(words);
    }
  }, []);

  const items: TabsProps['items'] = [
    {
      key: 'total',
      label: '全部',
      children: (
        <SearchList
          data={searchNotes?.all}
          searchWords={[
            words,
            ...(searchNotes ? searchNotes.keywords.split(' ') : []),
          ]}
        />
      ),
    },
    {
      key: 'myNotes',
      label: '我的笔记',
      children: (
        <SearchList
          data={searchNotes?.notes}
          searchWords={[
            words,
            ...(searchNotes ? searchNotes.keywords.split(' ') : []),
          ]}
        />
      ),
    },
    {
      key: 'spaceNotes',
      label: '我的群组',
      children: (
        <SearchList
          data={searchNotes?.spaceNotes}
          searchWords={[
            words,
            ...(searchNotes ? searchNotes.keywords.split(' ') : []),
          ]}
        />
      ),
    },
  ];
  const onTabChange = (key: string) => {
    console.log(key);
  };

  return (
    <div>
      <LineSpace height={60} />
      <Input.Search
        onSearch={onSearch}
        value={words}
        onChange={e => setWords(e.target.value)}
        placeholder="请输入"
      />
      <Tabs
        defaultActiveKey="1"
        items={items}
        centered
        onChange={onTabChange}
      />
    </div>
  );
};

const mapStateToProps = ({ user, sys }: RootState) => ({
  searchNotes: sys.searchNotes,
});
const mapDispatchToProps = ({ sys: { searchAll } }: DispatchPro) => ({
  searchAll,
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchPage);
