import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import LoginPage from './pages/login/index';
import Layout from './pages/layout';
import Home from './pages/home';
import Register from './pages/login/register';
import NoteList from './pages/noteList';
import { Blog } from './pages/blog';
import SearchPage from './pages/search';
import { SpacePage } from './pages/space';
import { Material } from './pages/material';

export default function App() {
  return (
    <Router>
      {
        // 给Electron使用的
        window.location.pathname.includes('index.html') && (
          <Navigate to="/" replace />
        )
      }
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="register" element={<Register />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="blog" element={<Blog />} />
          <Route path="material" element={<Material />} />
          <Route path="notelist" element={<NoteList />} />
          <Route path="space" element={<SpacePage />} />
        </Route>

        <Route path="search/*" element={<SearchPage />} />
      </Routes>
    </Router>
  );
}
