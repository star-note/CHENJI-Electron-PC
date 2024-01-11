import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Popover,
  Progress,
} from 'antd';
import { Rule } from 'antd/lib/form';
import dayjs from 'dayjs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ajaxFormPostOptions, apiURL } from '@/configs/api';
import { request } from '@/utils';
import { SelectAdd, UploadImg } from '@/components';
import { isUrl } from '@/utils/utils';
import { Config, Message, colorConfig } from './config';
import { targetIcons } from '../images/config';
import { sendMessage } from '@/electron';

const itemMapping = (item: Config) => {
  const { dom, name, label, help } = item;
  const {
    type,
    defaultValue,
    rule = {},
    placeholder,
    required,
    options = [],
  } = dom;

  // 上传图片base64的API处理函数
  const uploadImg = (blob: File) => {
    const formData = new FormData();
    formData.append(
      'file',
      blob,
      blob.name || `default.${blob.type.split('/')[1]}`
    );
    return request(apiURL('uploadImg'), ajaxFormPostOptions(formData));
  };

  const mapping = {
    INPUT:
      rule.inputType === 'password' ? (
        <Input.Password allowClear placeholder={placeholder} />
      ) : (
        <Input
          allowClear
          placeholder={placeholder}
          type={rule.inputType || 'text'}
        />
      ),
    INPUTNUMBER: <InputNumber placeholder={placeholder} />,
    TEXTAREA: <Input.TextArea placeholder={placeholder} />,
    CHECKBOX: <Checkbox>{placeholder || label}</Checkbox>,
    DATEPICKER: <DatePicker />,
    SELECT: <SelectAdd items={options} placeholder={placeholder} />,
    IMAGEPICKER: (
      <UploadImg
        placehodler={placeholder}
        size={rule?.size}
        uploadImg={uploadImg}
      />
    ),
  };

  let rules: Rule[] | undefined;
  if (required && rule) {
    rules = [{ required: true }, rule];
  } else if (required) {
    rules = [{ required: true }];
  } else if (rule) {
    rules = [rule];
  } else {
    rules = undefined;
  }

  return (
    <div key={name}>
      <p className="form-label">
        {required ? <span className="form-required">* </span> : null}
        <span>{`${label}  `}</span>
        {help ? (
          <Popover
            content={
              help.url ? (
                <a href={help.url} target="_blank" rel="noreferrer">
                  {help.description}
                </a>
              ) : (
                <p>{help.description}</p>
              )
            }
            trigger="hover"
          >
            <QuestionCircleOutlined />
          </Popover>
        ) : null}
      </p>
      <Form.Item name={name} key={name} rules={rules}>
        {mapping[type]}
      </Form.Item>
    </div>
  );
};

interface IPublishForm {
  configs: Config[] | undefined;
  name: string;
  submitCB: (data: Record<string, unknown>) => void;
  changeCB?: (
    allValues: Record<string, unknown>,
    changedValues: Record<string, unknown>
  ) => void;
  initValues?: Record<string, unknown>;
}
export const PublishForm = (props: IPublishForm) => {
  const { configs = [], name, submitCB, changeCB, initValues } = props;
  const [form] = Form.useForm();
  const submitForm = () => {
    form
      .validateFields()
      .then((data) => {
        console.log(data);
        submitCB(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onValuesChange = (changedValues, allValues) => {
    if (changeCB) changeCB(allValues, changedValues);
  };

  // 切换不同目标时，form内容的清除和赋值，现在是先切再清除，会闪
  useEffect(() => {
    form.resetFields();
    const configDefaultValues = {} as Record<string, any>;
    configs.forEach(({ dom, name: key }) => {
      if (dom.defaultValue) {
        configDefaultValues[key] =
          dom.type === 'DATEPICKER'
            ? dayjs(dom.defaultValue as string, 'YYYY-MM-DD')
            : dom.defaultValue;
      }
    });
    form.setFieldsValue({
      ...configDefaultValues,
      ...initValues,
    });
  }, [name]);

  return (
    <>
      <Form
        layout="vertical"
        className="publish-form"
        form={form}
        onValuesChange={onValuesChange}
        initialValues={initValues}
      >
        {configs.map((item) => itemMapping(item))}
      </Form>
      <Button onClick={() => submitForm()}>确认发布</Button>
    </>
  );
};

type ITargetLogo = {
  target?: string;
  active?: boolean;
  logo: string;
  label?: string;
  onClick?: () => void;
  publishDetail?: Message[];
};
export const TargetLogo = (props: ITargetLogo) => {
  const {
    target,
    logo,
    active = false,
    label,
    onClick,
    publishDetail = [],
  } = props;
  const currentProcess = publishDetail.filter(
    (item) => item.process || item.process === 0
  )[0]?.process;
  const currentStatus = publishDetail.filter((item) => item.status)[0]?.status;

  return (
    <div
      className={`target-logo flex-center ${
        active ? 'target-logo-active' : ''
      }`}
      onClick={onClick}
    >
      {/* <div
        className="logo-container flex-center"
        style={{
          border: `4px solid ${colorConfig[status]}`,
        }}
      >
        {logo ? (
          <img
            src={isUrl(logo) ? logo : targetIcons[target] || ''}
            alt={label}
          />
        ) : (
          label
        )}
      </div> */}
      <Progress
        type="circle"
        strokeColor={colorConfig[currentStatus || 'init']}
        percent={currentProcess}
        format={() =>
          logo ? (
            <img
              src={isUrl(logo) ? logo : targetIcons[target] || ''}
              alt={label}
            />
          ) : (
            label
          )
        }
        className="logo-container"
        size="small"
      />
    </div>
  );
};

export const InputCard = ({content}) => {
  const { title, placehodler, desc, channel } = content;
  const [input, setValue] = useState('');
  return (
    <div className="detail-card">
      {title ? <p className="detail-card-title">{title}</p> : null}
      <Input
        placeholder={placehodler}
        onChange={(e) => setValue(e.target.value)}
      />
      {desc ? <p className="detail-card-desc">{desc}</p> : null}
      <Button
        onClick={() =>
          sendMessage({
            channel,
            params: {
              value: input,
            },
          })
        }
      >
        提交
      </Button>
    </div>
  );
}
