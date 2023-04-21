// import '@babel/polyfill';
// import 'core-js';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import './index.less';
import App from './routes';
import Storage from './utils/Storage';
import configs from './configs';
import * as serviceWorker from './serviceWorker';
import 'antd/dist/antd.css';

Storage.setNamespace(configs.name);
// monitor.init({
//   appName: configs.name,
//   headerName: 'loyalvalleylog',
//   apiUrl: 'http://localhost:3000/log.gif',
// });

const container = document.getElementById('root') as Element;
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
