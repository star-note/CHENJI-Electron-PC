import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login/index';
import Layout from './pages/layout';
// import store from './store';
import Home from './pages/home';
import Register from './pages/login/register';
import NoteList from './pages/noteList';
import { Blog } from './pages/blog';

export default function App() {
  console.log(location);
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="register" element={<Register />} />
        {/* <PrivateRoute> */}

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="blog" element={<Blog />} />
          <Route path="notelist" element={<NoteList />} />
        </Route>
        {/* </PrivateRoute> */}
      </Routes>
    </Router>
  );
}

// function PrivateRoute({ children, ...rest }) {
//   const { isAuth } = store.getState().user;

//   return (
//     <Route
//       {...rest}
//       render={({ location }) =>
//         isAuth ? (
//           children
//         ) : (
//           <Redirect
//             to={{
//               pathname: '/login',
//               state: { from: location }
//             }}
//           />
//         )
//       }
//     />
//   );
// }
