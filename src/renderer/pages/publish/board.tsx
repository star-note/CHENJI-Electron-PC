import { useState } from 'react';
import { DispatchPro, RootState } from '@/store';
import { connect } from 'react-redux';
import { publish as publishElectron } from '@/electron';
import { publishWebFns, publishKeys, publishElectronForms } from './utils';
import { PublishForm } from './form';
import './index.less';

type IPublishBoard = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const Board = (props: IPublishBoard) => {
  const { loadedTarget = [], electronTarget = [], activeNote } = props;
  const [pc, setProcess] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});

  // 某一个目标的发布处理
  const publishHandler = (item: string) => {
    if (window.electron) {
      publishElectron('github', {
        username: 'ludejun07@gmail.com',
        password: '*****',
      });
    } else if (publishWebFns && publishWebFns.current) {
      publishWebFns.current[item].publishHandler(
        {
          form: {
            accessToken: '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',
            owner: 'ludejun',
            repo: 'CHENJI',
            keepPath: true,
          },
          note: activeNote,
        },
        params => {
          const { process, message, help, type } = params;
          if (process || process === 0) setProcess({ ...pc, item: process });
          setMsg({ ...msg, item: message });
          if (type) {
            setProcess({ ...pc, item: 100 });
            // 成功 ｜ 失败处理 TODO
          }
        }
      );
    }
  };

  return (
    <div className="publish-board">
      {publishKeys.map((item: string) => (
        <div className="publish-target" key={item}>
          <img
            src={require(`../../../publishSDK/${item}/icons/icon_128.png`)}
            alt={item}
            className="target-logo"
          />
        </div>
      ))}
      {loadedTarget.map((item: string) => (
        <div key={item}>
          <p>进度：{pc[item]}</p>
          <p>说明：{msg[item]}</p>
          <PublishForm
            configs={
              publishWebFns.current
                ? publishWebFns.current[item].form
                : undefined
            }
            name={item}
          />
          <button onClick={() => publishHandler(item)} type="button">
            发布到{item}
          </button>
        </div>
      ))}
      {electronTarget.map((item: string) => (
        <div key={item}>
          <p>进度：{pc[item]}</p>
          <p>说明：{msg[item]}</p>
          <PublishForm
            configs={
              publishElectronForms.current
                ? publishElectronForms.current[item]
                : undefined
            }
            name={item}
          />
          <button onClick={() => publishHandler(item)} type="button">
            发布到{item}
          </button>
        </div>
      ))}
    </div>
  );
};

const mapStateToProps = ({ publish, note }: RootState) => ({
  loadedTarget: publish.loadedTarget,
  electronTarget: publish.electronTarget,
  activeNote: note.activeNote,
});
const mapDispatchToProps = ({
  publish: { changeLoadedTarget },
}: DispatchPro): any => ({
  changeLoadedTarget,
});

export default connect(mapStateToProps, mapDispatchToProps)(Board);
