import { FC, useState } from 'react';
import { Tabs } from 'antd';
import { connect } from 'react-redux';
import { DoubleRightOutlined, SettingOutlined } from '@ant-design/icons';
import { DispatchPro, RootState } from '@/store';
import configs from '@/configs';
import { elecPublish, onProcess } from '@/electron';
import { electronPublishKeys, Message, webPublishKeys } from './config';
import { PublishForm, TargetLogo } from './components';
import { PublishDetail } from './detail';
import './index.less';
import { convertHtml } from '../utils/convert';
import { WidthSpace } from '@/components';

type IPublishBoard = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> & {
    closeDrawer?: () => void;
  };

const Board: FC<IPublishBoard> = (props) => {
  const {
    activeNote,
    publishConfigs,
    closeDrawer,
    userInfo,
    allDetails,
    updataPublishDetails,
    // changePublishDetails,
  } = props;
  const [activeKey, setActiveKey] = useState('chenji'); // 发布目标key
  const [formData, setFormData] = useState<Record<string, any> | null>(null);
  const [publishDetail, setDetail] = useState<Message[] | undefined>(undefined); // 当前进度详情的数据源，需要是状态
  // const detailRef = useRef<Record<string, Message[] | null>>({}); // 进度详情的数据存储在ref，更新在这个ref，不能直接更新状态会形成闭包
  const [tabKey, setTabKey] = useState<'config' | 'detail'>('config'); // 右侧tab的activeKey
  const [logoDetails, setLogoDetails] = useState({});

  // web端接收发布消息并塞到publishDetail头部
  const postMsg = (noteId: string, key: string, msg: Message) => {
    // console.log(3333, msg, key, activeKey);
    updataPublishDetails({ noteId, target: key, message: msg });

    // // 当 tab focus 在详情 tab 时，需要持续更新进度
    // if (key === activeKey && detailsRef.current && activeNote?.noteId) {
    //   setDetail([...(detailsRef.current[noteId] || {})[key]]);
    // }
  };

  const onClickTarget = (target: string) => {
    if (target !== activeKey) {
      setActiveKey(target);
      // if (
      //   tabKey === 'detail' &&
      //   detailsRef.current &&
      //   detailsRef.current[activeNote!.noteId!]
      // ) {
      //   setDetail(detailsRef.current[activeNote!.noteId!][target]);
      // }
    }
  };
  const publishFormChangeCB = (allValues: any) => {
    setFormData({
      ...formData,
      [activeKey]: allValues,
    });
  };

  const onTabChange = (key: 'config' | 'detail') => {
    if (key === 'detail') {
      // if (detailsRef.current && detailsRef.current[activeNote!.noteId!]) {
      //   setDetail(detailsRef.current![activeNote!.noteId!][activeKey]);
      // }
    }
  };

  const publishSubmitCB = (form: Record<string, any>) => {
    // 清空之前发布日志
    // if (activeNote?.noteId && detailsRef.current) {
    //   detailsRef.current[activeNote!.noteId!] = {
    //     ...detailsRef.current[activeNote!.noteId!],
    //     [activeKey]: [],
    //   };
    // }
    if (activeNote?.noteId && allDetails[activeNote.noteId]) {
      updataPublishDetails({
        noteId: activeNote.noteId,
        target: activeKey,
        message: [],
        replaceTarget: true, // 完全替换消息列表中noteId、target的messages列表
      });
    }

    if (activeNote) {
      console.log(
        999,
        convertHtml(
          JSON.parse(activeNote.content!).ops,
          userInfo?.id,
          activeNote.noteId!
        )
      );
      // 给每个发布SDK传递的数据都一样，主要包括form、note、发布平台信息、用户信息
      const payload = {
        form,
        note: {
          ...activeNote,
          html: convertHtml(
            JSON.parse(activeNote.content!).ops,
            userInfo?.id,
            activeNote.noteId!
          ),
        },
        source: configs.publishInfo,
        user: {
          nickName: userInfo?.nickName,
          id: userInfo?.id,
          avatarUrl: userInfo?.avatarUrl,
        },
      }; // 发布传递的所有数据
      if (!window.electron || !publishConfigs![activeKey].electron) {
        publishConfigs![activeKey].web.publish(
          payload,
          postMsg.bind(null, activeNote.noteId!, activeKey)
        );
      } else {
        // onProcess(() => {
        //   setDetail([
        //     ...(detailsRef.current[activeNote.noteId!] || {})[activeKey],
        //   ]);
        // });
        onProcess();
        elecPublish({
          key: activeKey,
          payload,
        });
      }

      setTabKey('detail');
      // // setTabKey不会触发onTabChange
      // if (detailsRef.current && detailsRef.current[activeNote!.noteId!]) {
      //   setDetail(detailsRef.current[activeNote!.noteId!][activeKey]);
      // }
    }
  };

  return (
    <div className="flex-row publish-board">
      <div className="target-tab">
        <div className="close-setting flex-center row">
          <div onClick={closeDrawer}>
            <DoubleRightOutlined />
          </div>
          <WidthSpace />
          <SettingOutlined />
        </div>
        {(window.electron ? electronPublishKeys : webPublishKeys).map(
          (key: string) => {
            const { logo = '', label } = publishConfigs![key] || {};
            return (
              <TargetLogo
                key={key}
                target={key}
                logo={logo}
                active={key === activeKey}
                label={label}
                onClick={() => onClickTarget(key)}
                publishDetail={
                  // publishDetail
                  allDetails &&
                  activeNote?.noteId &&
                  allDetails[activeNote?.noteId]
                    ? allDetails[activeNote?.noteId][key]
                    : []
                }
              />
            );
          }
        )}
        <div className="rest-space" />
      </div>
      <div className="form-process-tab">
        <Tabs
          centered
          onChange={onTabChange}
          activeKey={tabKey}
          onTabClick={(key) => setTabKey(key)}
          size="small"
          items={[
            {
              label: '配置',
              key: 'config',
              children:
                publishConfigs && publishConfigs[activeKey] && activeNote ? (
                  <>
                    <PublishForm
                      configs={publishConfigs[activeKey][
                        window.electron && publishConfigs[activeKey].electron
                          ? 'electron'
                          : 'web'
                      ].getForm(activeNote)}
                      name={activeKey}
                      submitCB={publishSubmitCB}
                      changeCB={publishFormChangeCB}
                      initValues={formData && formData[activeKey]}
                    />
                  </>
                ) : (
                  <div>没有Form</div>
                ),
            },
            {
              label: '详情',
              key: 'detail',
              children: (
                <PublishDetail
                  label={publishConfigs![activeKey]?.label || activeKey}
                  publishDetail={
                    // publishDetail
                    activeNote?.noteId && allDetails[activeNote?.noteId]
                      ? allDetails[activeNote?.noteId][activeKey]
                      : []

                    // [
                    //   {
                    //     process: 30,
                    //     type: 'inputCard',
                    //     content: {
                    //       title: 'Authentication code',
                    //       placehodler: 'XXXXXX',
                    //       desc: 'Open your two-factor authenticator (TOTP) app or browser extension to view your authentication code.',
                    //       submitCB: (value) => console.log(value)
                    //     },
                    //   },
                    // ]
                  }
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

const mapStateToProps = ({ user, publish, note }: RootState) => ({
  userInfo: user.userInfo,
  allDetails: publish.allDetails,
  activeNote: note.activeNote,
  publishConfigs: publish.publishConfigs,
});
const mapDispatchToProps = ({
  publish: { updataPublishDetails },
}: DispatchPro) => ({
  updataPublishDetails,
});

export default connect(mapStateToProps, mapDispatchToProps)(Board);
