import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login/index';
import Layout from './pages/layout';
// import store from './store';
import Home from './pages/home';
import Register from './pages/login/register';
import NoteList from './pages/noteList';

export default function App() {
  return (
    <Router initialEntries={['/main/notelist']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<Register />} />
        {/* <PrivateRoute> */}
        <Route path="main" element={<Layout />}>
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
