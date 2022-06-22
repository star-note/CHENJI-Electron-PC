import { useEffect, useState } from 'react';
import { Input, message } from 'antd';
import { connect } from 'react-redux';
// import RichTextEditor from 'quill-react-commercial';
// import RichTextEditor from '@/components/RichTextEditor/index';
import RichTextEditor from '@/components/RichTextEditor/dist/quill-react-commercial.min';
import 'quill-react-commercial/dist/quill-react-commercial.min.css';
import { DispatchPro, RootState } from '@/store';
import { getUserInfo } from '@/utils';
import { publishWebFns, publishInit, publishElectronForms, addTarget } from '@/pages/publish/utils';
import { clickPublish } from '@/electron';
import Board from '@/pages/publish/board';
import { lastSaveTime, quill, saveContent } from '../utils/intex';

type IEditorContainer = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const EditorContainer = (props: IEditorContainer) => {
  const {
    initContent,
    saveStatus,
    activeNote,
    changeState,
    editing,
    updateActiveNote,
  } = props;
  const [title, setTitle] = useState(activeNote?.title); // activeNote的title
  // const [initContent, setInitContent] = useState(null); // 富文本编辑器的初始化内容
  const userId = getUserInfo()?.id;

  useEffect(() => {
    console.log('editing activeNote refresh');
    setTitle(activeNote?.title);
  }, [activeNote]);

  useEffect(() => {
    console.log('editing container refresh');
  }, []);
  const getQuill = (quillIns: any) => {
    quill.current = quillIns;
  };
  const quillChange = (delta, old, source) => {
    console.log('quill-change:', delta, old, source, editing);
    // if (!editing.current) {
    //   editing.current = true; // 标识编辑态，在切换笔记、新增时先保存
    // }
    changeState({ editing: true });
    if (lastSaveTime.current && lastSaveTime.current[0] === 'start') {
      lastSaveTime.current[0] = 'edit'; // 保存过程中是否有编辑
    }
  };

  // // 保存笔记，在某些新建笔记接口失败的情况下，也充当新建笔记作用
  // const saveContent = () => {
  //   const content = quill?.getContents();
  //   // 标识是否在保存期间有编辑
  //   lastSaveTime.current = ['start', new Date().getTime()]; // 时间戳暂时没用

  //   return saveNote({
  //     params: {
  //       parentId: activeNote.parentId,
  //       title: activeNote.title,
  //       content: JSON.stringify(content),
  //       noteId: activeNote.noteId,
  //       userId,
  //     },
  //     apiName: activeNote.noteId === null ? 'createNote' : 'saveNote',
  //   })
  //     .then(data => {
  //       console.log(33333, data);
  //       if (lastSaveTime.current && lastSaveTime.current[0] !== 'edit') {
  //         editing.current = false;
  //       }
  //       // TODO 保存成功更新笔记树：first/second
  //       updateFirstNotes(data.note);
  //       return data.note; // 发布时用
  //     })
  //     .finally(() => {
  //       lastSaveTime.current = ['end', new Date().getTime()];
  //     });
  // };

  const onTitleChange = (e: { target: { value: string } }) => {
    setTitle(e.target.value);
    changeState({ editing: true }); // 标题更改也是编辑
    // editing.current = true; // 标题更改也是编辑
  };
  const onTilteBlur = () => {
    updateActiveNote({ title }); // 失焦再更新active.title
  };

  const publishNote = async () => {
    if (editing || saveStatus === 'failure') {
      try {
        const note = await saveContent(userId);
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
    <div>
      <Input
        allowClear
        placeholder="无标题"
        onChange={onTitleChange}
        value={title}
        onBlur={onTilteBlur}
      />
      <RichTextEditor
        modules={{
          table: {},
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
      {saveStatus === 'failure' ? (
        <button onClick={saveContent.bind(null, userId)} type="button">
          重新保存
        </button>
      ) : (
        <button onClick={saveContent.bind(null, userId)} type="button">
          保存
        </button>
      )}
      <div id="quillContent" />
      <button onClick={publishNote} type="button">
        发布
      </button>
      <Board />
      <div />
    </div>
  );
};

const mapStateToProps = ({ note }: RootState) => ({
  saveLoading: note.saveLoading,
  getLoading: note.getLoading,
  activeNote: note.activeNote,
  firstNotes: note.firstNotes,
  getFirstLoading: note.getFirstLoading,
  saveStatus: note.saveStatus,
  initContent: note.initContent,
  editing: note.editing,
});
const mapDispatchToProps = ({
  note: { updateActiveNote, changeState },
}: DispatchPro): any => ({
  updateActiveNote,
  changeState,
});

export default connect(mapStateToProps, mapDispatchToProps)(EditorContainer);
