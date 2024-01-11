/* eslint-disable react/jsx-props-no-spreading */
import {
  Button,
  Divider,
  Input,
  InputRef,
  Select,
  SelectProps,
  Space,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CSSProperties, useRef, useState } from 'react';

type ISelectAdd = {
  items?: string[];
  addCallback?: (options: string[], name: string) => void;
  placeholder?: string;
  style?: CSSProperties;
  value?: string; // 自定义FormItem子组件则为受控，https://ant.design/components/form-cn#components-form-demo-customized-form-controls
  onChange?: (value: string) => void; // 自定义FormItem子组件需要onChange属性
};
export const SelectAdd = (props: SelectProps & ISelectAdd) => {
  const {
    items = [],
    addCallback,
    placeholder,
    style,
    value,
    onChange,
    ...rest
  } = props;
  const [selectedValue, setValue] = useState(value || null);

  const [name, setName] = useState('');
  const inputRef = useRef<InputRef>(null);
  const [options, setOptions] = useState(items);
  const addItem = (e) => {
    if (name) {
      e.preventDefault();
      setOptions([...options, name]);
      if (addCallback) addCallback(options, name);
      setName('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const triggerChange = (v: string) => {
    setValue(v);
    onChange?.(v);
  };

  return (
    <Select
      style={style}
      value={selectedValue}
      onChange={triggerChange}
      placeholder={placeholder}
      dropdownRender={menu => (
        <>
          {menu}
          <Divider style={{ margin: '8px 0' }} />
          <Space style={{ padding: '0 8px 4px' }}>
            <Input
              ref={inputRef}
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
              新增
            </Button>
          </Space>
        </>
      )}
      options={options.map(item => ({ label: item, value: item }))}
      {...rest}
    />
  );
};
