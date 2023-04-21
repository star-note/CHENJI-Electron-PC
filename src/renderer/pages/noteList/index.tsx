import { IconButton } from '@/components';
import { Layout } from 'antd';
import { lazy, Suspense } from 'react';
// import { EditorContainer } from './components';
import './index.less';

const NoteList = () => {
  const { Header, Content, Footer } = Layout;
  const EditorContainer = lazy(() => import('./components/editorContainer'));

  return (
    <Layout className="note-layout">
      {/* <Header className="note-header">
          <div>退出</div>
        </Header> */}
      <Content className="note-content">
        <Suspense fallback={<IconButton type="loading" />}>
          <EditorContainer />
        </Suspense>
      </Content>
      {/* <Footer
        style={{
          textAlign: 'center',
          height: 32,
          padding: 0,
          lineHeight: '32px',
        }}
      >
        正心谷资本@2022
      </Footer> */}
    </Layout>
  );
};

export default NoteList;
