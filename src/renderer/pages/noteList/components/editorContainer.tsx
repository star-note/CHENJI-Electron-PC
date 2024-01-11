import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Drawer, message, Space } from 'antd';
import { connect } from 'react-redux';
import RichTextEditor from 'quill-react-commercial';
import dayjs from 'dayjs';
import { DispatchPro, RootState } from '@/store';
import { request } from '@/utils';
import Board from '@/pages/publish/board';
import { ajaxFormPostOptions, apiURL } from '@/configs/api';
import { loadScript } from '@/pages/publish/board/config';
import { editTime, quill, saveContent, titleInputRef } from '../utils/intex';
import './editorContainer.less';
import Avatar from '@/pages/components/avatar';
import { MoreNoteProcess } from './MoreNoteProcess';
import { SearchBar } from './SearchBar';

type IEditorContainer = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const EditorContainer = (props: IEditorContainer) => {
  const {
    initContent,
    saveStatus,
    activeNote,
    updateActiveNote,
    saveLoading,
    loginUserInfo,
  } = props;
  const [open, setOpen] = useState(false);
  const saveInterval = useRef(null); // 5分钟保存一次笔记
  const [saveDisable, setDisable] = useState(true); // 保存按钮是否可以保存
  const [lastSave, setLastSave] = useState(''); // 上次保存时间，自动化保存时不会更新activeNote，这里使用个状态保存

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.value = activeNote?.title || '';
    }
    setLastSave(dayjs(activeNote?.modifyTime).format('YYYY-MM-DD'));
  }, [activeNote]);

  useEffect(() => {
    console.log('editing container refresh');
    loadScript();

    return () => clearInterval(saveInterval.current);
  }, []);

  const getQuill = (quillIns: any) => {
    quill.current = quillIns;
  };
  const quillChange = (delta, old) => {
    console.log('quill-change:', delta, old, editTime.current);
    // 如果之前的笔记已自动化保存，则把定时器清除，从当前时间重设定时器
    if (!editTime.current && saveInterval.current) {
      clearInterval(saveInterval.current);
    }
    editTime.current = new Date(); // 上一次编辑的时间
    setDisable(false);
    if (!saveInterval.current) {
      saveInterval.current = setInterval(() => {
        if (editTime.current) {
          saveContent(true).then(() => {
            setLastSave(dayjs().format('HH:mm:ss')); // 假的保存时间，一切以服务端为准
            if (!editTime.current) setDisable(true); // 在save期间没有编辑，则editTime.current会被置为null
          });
        }
      }, 5000 * 60);
    }
  };

  const onTitleChange = () => {
    editTime.current = new Date();
    setDisable(false);
  };
  const onTilteBlur = () => {
    updateActiveNote({ title: titleInputRef.current?.value }); // 失焦再更新active.title
  };

  const publishNote = async () => {
    if (editTime.current || saveStatus === 'failure') {
      try {
        const note = await saveContent();
        console.log('发布内容：', note);
      } catch (e) {
        console.log('发布失败');
      }
    } else {
      console.log('发布内容：', activeNote);
    }

    setOpen(!open);
  };

  const closeDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="note-title">
          <input
            onChange={onTitleChange}
            onBlur={onTilteBlur}
            placeholder="请输入标题"
            ref={titleInputRef}
          />
          <div className="note-desc">
            {activeNote && activeNote.createTime ? (
              <div className="desc-item">
                <span>创建：</span>
                {activeNote.spaceId ? (
                  <Avatar
                    userInfo={{
                      id: activeNote.creator,
                      avatarUrl: activeNote.creatorAvator,
                      name: activeNote.creatorName,
                    }}
                    hasLogout={false}
                    size={16}
                  />
                ) : null}
                <span>{dayjs(activeNote.createTime).format('YYYY-MM-DD')}</span>
              </div>
            ) : null}

            {activeNote && activeNote.modifyTime ? (
              <span className="desc-item">
                上次保存时间：
                {activeNote && activeNote.spaceId ? (
                  <Avatar
                    userInfo={{
                      id: activeNote.modifier,
                      avatarUrl: activeNote.modifierAvator,
                      name: activeNote.modifierName,
                    }}
                    hasLogout={false}
                    size={16}
                  />
                ) : null}
                {lastSave}
              </span>
            ) : null}
          </div>
        </div>
        <Space size={12} rootClassName="button-list">
          <Button
            disabled={saveDisable}
            loading={saveLoading}
            onClick={() => {
              saveContent()
                .then(() => {
                  setDisable(true);
                })
                .catch(() => {
                  setDisable(false);
                });
            }}
          >
            {saveStatus === 'failure' ? '重新保存' : '保存'}
          </Button>
          <Button onClick={publishNote}>发布</Button>
          <MoreNoteProcess
            note={activeNote!}
            userInfo={
              activeNote && activeNote.spaceId ? undefined : loginUserInfo
            }
          />
          <SearchBar />
          <Avatar hasLogout />
        </Space>
      </div>

      {/* <div className="note-label">
        <p>上次保存于：{}</p>
      </div> */}
      <RichTextEditor
        i18n="zh"
        modules={{
          table: true,
          codeHighlight: true,
          imageHandler: {
            imgUploadApi: (formData) =>
              // console.log(apiURL('uploadImg'))
              request(apiURL('uploadImg'), ajaxFormPostOptions(formData)).then(
                (response) => response.url
              ),
            uploadFailCB: () => message.error('图片上传失败'),
          },
        }}
        getQuill={getQuill}
        content={
          // 初始化笔记内容，而不能直接使用activeNote.content，因为当更新或保存会重新渲染导致内容重置到保存时刻，光标变到开头
          initContent
        }
        onChange={quillChange}
      />

      <div id="quillContent" />

      <Drawer
        closable={false}
        open={open}
        placement="right"
        onClose={() => setOpen(false)}
        width={500}
        bodyStyle={{
          padding: 0,
        }}
        destroyOnClose
      >
        <Board closeDrawer={closeDrawer} />
      </Drawer>
    </div>
  );
};

const mapStateToProps = ({ note, user }: RootState) => ({
  activeNote: note.activeNote,
  saveStatus: note.saveStatus,
  initContent: note.initContent,
  saveLoading: note.saveLoading,
  loginUserInfo: user.userInfo,
});
const mapDispatchToProps = ({ note: { updateActiveNote } }: DispatchPro) => ({
  updateActiveNote,
});

export default connect(mapStateToProps, mapDispatchToProps)(EditorContainer);
