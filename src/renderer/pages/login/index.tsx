import * as React from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Input, Checkbox } from 'antd';

import { DispatchPro, RootState } from '@/store';
import { setUserInfo, UserInfo } from '@/utils';
import './index.less';

type ILogin = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const Login: React.FC<ILogin> = props => {
  const { loginLoading, login } = props;
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values: {
    mobile: string;
    password: string;
    remember: boolean;
  }) => {
    login({
      params: values,
      apiName: 'sign',
    }).then((userInfo: UserInfo | undefined) => {
      if (userInfo?.token) {
        setUserInfo(userInfo);
        navigate('/main/notelist');
      }
    });
  };

  return (
    <div className="login">
      <Form
        form={form}
        name="login"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="手机号"
          name="mobile"
          rules={[{ required: true, message: '请输入手机号' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="remember"
          valuePropName="checked"
          wrapperCol={{ offset: 8, span: 16 }}
        >
          <Checkbox>记住我</Checkbox>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={loginLoading}>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const mapStateToProps = ({ user }: RootState) => ({
  loginLoading: user.loginLoading,
});
const mapDispatchToProps = ({ user: { login } }: DispatchPro): any => ({
  login,
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
