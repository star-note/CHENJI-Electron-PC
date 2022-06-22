import { Outlet } from 'react-router-dom';
import FirstNotes from '@/pages/noteList/firstNotes';
import './index.less';

export default function Layout() {
  return (
    <div className="main-layout">
      <div className="first-slider">
        <FirstNotes />
      </div>
      <div className="layout-content">
        <Outlet />
      </div>
    </div>
  );
}
