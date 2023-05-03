import { useEffect } from 'react';
import { Button, message, Space } from 'antd';
import { connect } from 'react-redux';
import RichTextEditor from 'quill-react-commercial';
import { DispatchPro, RootState } from '@/store';
import { request } from '@/utils';
import {
  publishWebFns,
  publishInit,
  publishElectronForms,
  addTarget,
} from '@/pages/publish/utils';
import { clickPublish } from '@/electron';
import Board from '@/pages/publish/board';
import { ajaxFormPostOptions, apiURL } from '@/configs/api';
import { editTime, quill, saveContent, titleInputRef } from '../utils/intex';
import './editorContainer.less';

type IEditorContainer = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const EditorContainer = (props: IEditorContainer) => {
  const { initContent, saveStatus, activeNote, updateActiveNote, saveLoading } =
    props;

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.value = activeNote?.title || '';
    }
  }, [activeNote]);

  useEffect(() => {
    console.log('editing container refresh');
  }, []);
  const getQuill = (quillIns: any) => {
    quill.current = quillIns;
  };
  const quillChange = (delta, old) => {
    console.log('quill-change:', delta, old, editTime.current);
    editTime.current = new Date();
  };

  const onTitleChange = () => {
    editTime.current = new Date();
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

    // TODO 临时发布，
    console.log(publishWebFns.current);
    if (window.electron) {
      publishElectronForms.current = await clickPublish();
      addTarget(publishElectronForms.current);
    }
    // Web发布应该不区分环境，都加载
    publishInit();

    console.log(publishWebFns.current);
  };

  return (
    <div className="editor-container">
      <div className="note-title">
        <input
          onChange={onTitleChange}
          onBlur={onTilteBlur}
          placeholder="请输入标题"
          ref={titleInputRef}
        />
        <div className="button-list">
          <Space size={12}>
            {saveStatus === 'failure' ? (
              <Button onClick={() => saveContent()}>重新保存</Button>
            ) : (
              <Button loading={saveLoading} onClick={() => saveContent()}>
                保存
              </Button>
            )}
            <Button onClick={publishNote}>发布</Button>
          </Space>
        </div>
      </div>
      {/* <div className="note-label">
        <p>上次保存于：{}</p>
      </div> */}
      <RichTextEditor
        modules={{
          table: true,
          codeHighlight: true,
          imageHandler: {
            imgUploadApi: formData =>
              // console.log(apiURL('uploadImg'))
              request(apiURL('uploadImg'), ajaxFormPostOptions(formData)).then(
                response => response.url
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

      {/* <Board /> */}
    </div>
  );
};

const mapStateToProps = ({ note }: RootState) => ({
  activeNote: note.activeNote,
  saveStatus: note.saveStatus,
  initContent: note.initContent,
  saveLoading: note.saveLoading,
});
const mapDispatchToProps = ({ note: { updateActiveNote } }: DispatchPro) => ({
  updateActiveNote,
});

export default connect(mapStateToProps, mapDispatchToProps)(EditorContainer);
