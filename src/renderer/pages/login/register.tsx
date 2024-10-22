import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Input } from 'antd';
import { DispatchPro, RootState } from '@/store';
import Storage from '@/utils/Storage';
import './index.less';
import md5 from 'md5';

type IRegister = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const Register = (props: IRegister) => {
  const {
    signup,
    verificationCode,
    codeLoading,
    signupLoading,
    code,
    userInfo,
  } = props;
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // useEffect(() => {
  //   form.setFieldsValue({ code });
  // }, [code]);

  const onFinish = (values: {
    name: string;
    mobile: string;
    password: string;
    confirm: string;
    email: string;
  }) => {
    signup({
      params: {
        ...values,
        password: md5(values.password),
        confirm: md5(values.confirm),
      },
      apiName: 'signup',
    }).then(data => {
      if (data && data.token) {
        Storage.set('userInfo', data);
        navigate('/notelist');
      }
    });
  };
  const getVerificationCode = () => {
    form
      .validateFields(['mobile'])
      .then(values => {
        verificationCode({
          params: {
            mobile: values.mobile,
            scene: 'VERIFICATION_SCENE_UNSPECIFIED',
          },
          apiName: 'verificationCode',
        });
      })
      .catch(error => console.log('verification code error: ', error));
  };

  return (
    <div className="login">
      <Form
        name="basic"
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="用户名"
          name="name"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input />
        </Form.Item>
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
          label="确认密码"
          name="confirm"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入密码不一致！'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            {
              type: 'email',
              message: '请输入正确邮箱格式！',
            },
          ]}
        >
          <Input />
        </Form.Item>
        {/* <Form.Item label="验证码" name="code" rules={[{ required: true, message: '请输入验证码' }]}>
          <Input />
        </Form.Item>
        <Button loading={codeLoading} onClick={getVerificationCode}>
          获取验证码
        </Button> */}

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={signupLoading}>
            注册
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const mapStateToProps = ({ user }: RootState) => ({
  codeLoading: user.codeLoading,
  signupLoading: user.signupLoading,
  // loginLoading: user.loginLoading,
  userInfo: user.userInfo,
  code: user.code,
});
const mapDispatchToProps = ({
  user: { signup, verificationCode },
}: DispatchPro) => ({
  signup,
  verificationCode,
});

export default connect(mapStateToProps, mapDispatchToProps)(Register);
