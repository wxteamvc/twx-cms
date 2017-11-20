
const {app, BrowserWindow,autoUpdater,Menu, Tray, ipcMain, globalShortcut } = require('electron')
const path = require('path')
const url = require('url')
// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
var dev = true;
let win,login,set,trayl;
global.info = {};


//创建登录界面
function createLoginScreen(){
  login = new BrowserWindow({
    width: 350, 
    height:464,
    resizable:false,
    center:true,
    frame:false,
  })
  // login.setMenu(null)
  login.loadURL(url.format({
    pathname: path.join(__dirname, 'twx-cms/login/login.html'),
    protocol: 'file:',
    slashes: true
  }))

    // 当 window 被关闭，这个事件会被触发。
  login.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    login = null
  })
}

function createWindow () {
  // 创建浏览器窗口。
  win = new BrowserWindow({
      width: 1024,
      height: 760,
      minWidth: 1024,
      minHeight: 760
    })

  if (dev){
    win.loadURL(`http://localhost:8001`);
  }else{
    // 加载应用的 index.html。
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'twx-cms/main/index.html'),
      protocol: 'file:',
      slashes: true
    }))
  }
  //创建托盘
  tray = new Tray('./logo.ico')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '锁屏', 
      click: function(){

      }
    },
    {
      label: '创建订单',
      click: function(){

      }
    },
    {
      label: '系统设置',
      click: function(){

      }
    },
    {
      label: '意见反馈',
      click: function(){

      }
    },
    {
      label: '退出',
      click: function(){
        app.quit();
      }
    }
  ])
  tray.setToolTip('添维信-贷款客户管理系统')
  tray.setContextMenu(contextMenu)
  
    //快捷键监听
  globalShortcut.register('Alt+c',()=>{
    if (win !== null){
      win.webContents.send('openPage', {page:'mail',select:'add'})
      win.show();
    }
  })

  // 打开开发者工具。
  //win.webContents.openDevTools()

  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null
  })
}

//自动更新开始
function startupEventHandle(){
  var handleStartupEvent = function () {
    if (process.platform !== 'win32') {
      return false;
    }
    var squirrelCommand = process.argv[1];
    switch (squirrelCommand) {
      case '--squirrel-install':
      case '--squirrel-updated':
        install();
        return true;
      case '--squirrel-uninstall':
        uninstall();
        app.quit();
        return true;
      case '--squirrel-obsolete':
        app.quit();
        return true;
    }
      // 安装
    function install() {
      var cp = require('child_process');    
      var updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
      var target = path.basename(process.execPath);
      var child = cp.spawn(updateDotExe, ["--createShortcut", target], { detached: true });
      child.on('close', function(code) {
          app.quit();
      });
    }
    // 卸载
    function uninstall() {
      var cp = require('child_process');    
      var updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
      var target = path.basename(process.execPath);
      var child = cp.spawn(updateDotExe, ["--removeShortcut", target], { detached: true });
      child.on('close', function(code) {
          app.quit();
      });
    }
  };
  if (handleStartupEvent()) {
    return ;
  }
}
function updateHandle(){
  if(require('electron-squirrel-startup')) return ;
  let appName='借贷款客户管理系统';
  let appIcon=__dirname + '/logo.ico';
  let message={
    error:'检查更新出错',
    checking:'正在检查更新……',
    updateAva:'下载更新成功',
    updateNotAva:'现在使用的就是最新版本，不用更新',
    downloaded:'最新版本已下载，将在重启程序后更新'
  };
  const os = require('os');
  const {dialog} = require('electron');
  autoUpdater.setFeedURL('http://127.0.0.1:80/latest');
  autoUpdater.checkForUpdates();
  autoUpdater.on('error', function(error){
    return dialog.showMessageBox(win, {
        type: 'info',
        icon: appIcon,
        buttons: ['OK'],
        title: appName,
        message: message.error,
        detail: '\r'+error
    });
  })
  .on('checking-for-update', function(e) {
      return dialog.showMessageBox(win, {
        type: 'info',
        icon: appIcon,
        buttons: ['OK'],
        title: appName,
        message: message.checking
    });
  })
  .on('update-available', function(e) {
      var downloadConfirmation = dialog.showMessageBox(win, {
          type: 'info',
          icon: appIcon,
          buttons: ['OK'],
          title: appName,
          message: message.updateAva
      });
      if (downloadConfirmation === 0) {
          return;
      }
  })
  .on('update-not-available', function(e) {
      return dialog.showMessageBox(win, {
          type: 'info',
          icon: appIcon,
          buttons: ['OK'],
          title: appName,
          message: message.updateNotAva
      });
  })
  .on('update-downloaded',  function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
      var index = dialog.showMessageBox(win, {
          type: 'info',
          icon: appIcon,
          buttons: ['现在重启','稍后重启'],
          title: appName,
          message: message.downloaded,
          detail: releaseName + "\n\n" + releaseNotes
      });
      if (index === 1) return;
      autoUpdater.quitAndInstall();
  });
}
//自动更新结束

//监听登录状态
ipcMain.on('login', (event, arg) => {
  if (arg.status){
    global.info = arg.info;
    createWindow();
    if (createLoginScreen){
      login.close();
    }
  }
})

ipcMain.on('closeLogin', (event, arg) => {
    if (arg){
      app.quit();
    }
})

ipcMain.on('openSet', (event, arg) => {
    if (arg){
      set = new BrowserWindow({parent: login,width:400, height:200,backgroundColor:'#000'})
      set.setMenu(null)
      set.loadURL(url.format({
        pathname: path.join(__dirname, 'twx-cms/login/set.html'),
        protocol: 'file:',
        slashes: true
      }))
    }
})

ipcMain.on('closeSet', (event, arg) => {
  if (arg){
    set.close();
  }
})

ipcMain.on('reloadLogin', (event, arg) => {
  if (arg){
    login.reload();
  }
})













// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', ()=>{
  // updateHandle();
  createLoginScreen();
})

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})