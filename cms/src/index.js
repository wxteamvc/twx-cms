import dva from 'dva';
import 'moment/locale/zh-cn';
import './polyfill';
import './g2';
import './raven';
// import { browserHistory } from 'dva/router';
import './index.less';

const remote = window.require('electron').remote;
const Store = window.require('electron-store')
const store = new Store()

//本地存储的服务器参数
global.serverConfig = {
  server:store.get('server'),
  server_port:store.get('server-port')
}

global.info =remote.getGlobal('info');

// 1. Initialize
const app = dva({
  // history: browserHistory,
});

// 2. Plugins
// app.use({});

// 3. Register global model
app.model(require('./models/global'));

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');
