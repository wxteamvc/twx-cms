//自动更新开始
export const startupEventHandle = ()=>{
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
export default updateHandle = ()=>{
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