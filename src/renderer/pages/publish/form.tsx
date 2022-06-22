import { Input } from 'antd';
import { Config } from 'src/publishSDK/github/web';

interface IPublishForm {
  configs: Config[] | undefined;
  name: string;
}
const itemMapping = item => {
  const { dom, name, label, help } = item;
  const { type, defaultValue, rules, placeholder, required } = dom;
  if (type === 'INPUT') {
    return (
      <div key={name}>
        <span>{label}：</span>
        <Input
          allowClear
          defaultValue={defaultValue}
          placeholder={placeholder}
        />
      </div>
    );
  }
};

export const PublishForm = (props: IPublishForm) => {
  const { configs = [], name, publishHandler } = props;
  return (
    <div className="publish-form">{configs.map(item => itemMapping(item))}</div>
  );
};
