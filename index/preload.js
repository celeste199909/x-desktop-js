// import "./style.css";

const { readdir, realpathSync } = require("fs");
const { ipcRenderer } = require("electron");


// 获取桌面图标信息
window.getDesktopIcons = function (callback) {
  const desktopIcons = [];

  const desktopPath = utools.getPath("desktop");

  readdir(desktopPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      callback(desktopIcons); // 在出错时返回空的 desktopIcons 数组
      return;
    }

    files.forEach((file) => {
      // 或者快捷方式的真正路径
      const realPath = realpathSync(desktopPath + "/" + file);
      desktopIcons.push({
        iconName: file,
        iconImage: utools.getFileIcon(realPath),
        realPath: realPath,
      });
    });

    callback(desktopIcons); // 返回 desktopIcons 数组
  });
};

(function () {

  window.winId = "";

  // 保存窗口id
  ipcRenderer.on("init", (event, data) => {
    window.winId = event.senderId;
  });

  // 隐藏窗口
  window.hideDesk = function () {
    // const root = document.querySelector("html");
    // root.style.animation = `hide 0.3s linear forwards`;
    // setTimeout(() => {
      ipcRenderer.sendTo(winId, "hideDesktop");
    // }, 300);
  };

  // 播放动画
  // ipcRenderer.on("showDesktop", (e) => {
  //   const root = document.querySelector("html");
  //   root.style.animation = "show 0.3s linear forwards";
  // });
})();

window.onDevMode = true;
window.l = function (...args) {
  if (window.onDevMode) {
    console.log("【开发调试】", ...args);
  }
};