import { Input } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SearchBar = () => {
  const [inputShort, setShort] = useState(false); // input是否有内容
  const navigate = useNavigate();

  const onChange = (e) => {
    console.log('onchange', e);
    if (e.target.value && !inputShort) {
      setShort(true);
    }
  };
  const onSearch = (value) => {
    setShort(false);
    navigate(`/search/${value}`);
  };
  return (
    <Input.Search
      placeholder="请输入"
      rootClassName={`search-bar ${inputShort ? 'search-toggle' : ''}`}
      onChange={onChange}
      onSearch={onSearch}
    />
  );
};
