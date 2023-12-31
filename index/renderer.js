
import { Desktop } from "./class/Desktop.js";
import { Page } from "./class/Page.js";
import { Icon } from "./class/Icon.js";

$(document).ready(function () {
  // 获取桌面布局信息
  const deskLayout = getDeskLayout();
  // 获取本地设置
  const localSetting = getLocalSettings();
  // 获取图标信息
  window.getDesktopIcons(function (rawIcons) {
    // 初始化桌面视图
    const desktopView = new Desktop(deskLayout, localSetting, rawIcons);
    desktopView.init();
  });
});

// 获取本地设置
function getLocalSettings() {
  // 获取本地设置
  let settings = null;
  try {
    settings = utools.db.get("settings");
  } catch (error) {
    console.log("error:", error);
  }
  if (!settings) {
    // 如果没有设置，则设置默认值
    settings = {
      _id: "settings",
      theme: "auto",
    };
    res = utools.db.put(settings);
    // settingdb_rev = res.rev;
    settings = res;
  }
  return settings;
}

// 获取桌面布局信息
function getDeskLayout() {
  let deskLayout = {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    paddingX: 0.1,
    paddingY: 0.08,
    cellLength: 140,
    row: 0,
    column: 0,
  };

  deskLayout.column = Math.floor(
    (deskLayout.width * (1 - deskLayout.paddingX * 2)) / deskLayout.cellLength
  );
  deskLayout.row = Math.floor(
    (deskLayout.height * (1 - deskLayout.paddingY * 2)) / deskLayout.cellLength
  );

  return deskLayout;
}
