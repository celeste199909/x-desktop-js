const { pinyin } = pinyinPro;
import { strContainsChinese, extractInitials } from "../js/utils.js";

class Icon {
  constructor(icon) {
    this.id = icon.id;
    this.iconName = icon.iconName;
    this.iconImage = icon.iconImage;
    this.realPath = icon.realPath;
    this.searchKeywords = icon.searchKeywords;
    this.type = icon.type;
    this.suffix = icon.suffix;
    this._searchTarget = false;
    this._selectedTarget = false;
  }

  get searchTarget() {
    return this._searchTarget;
  }

  /**
   * @param {boolean} value
   */
  set searchTarget(value) {
    this._searchTarget = value;
    if (value) {
      // 添加类名 设为搜索目标
      $(`#${this.id}`).addClass("search-target");
    } else {
      // 移除类名 取消搜索目标
      $(`#${this.id}`).removeClass("search-target");
    }
  }

  get selectedTarget() {
    return this._selectedTarget;
  }

  /**
   * @param {boolean} value
   */
  set selectedTarget(value) {
    this._selectedTarget = value;
    if (value) {
      // 添加类名 设为选中目标
      $(`#${this.id}`).addClass("selected-target");
      // 并添加键盘监听事件，当按下空格时打开该图标
      $(document).keyup((event) => {
        if (event.keyCode === 32) {
          $(`#${this.id}`).click();
        }
      });
    } else {
      // 移除类名 取消选中目标
      $(`#${this.id}`).removeClass("selected-target");
      // 取消键盘监听事件
      $(document).off("keyup");
    }
  }

  // 渲染图标
  getIconElement() {
    // 单个icon的容器
    const iconElement = $("<div></div>").addClass("icon");
    // 设置id
    iconElement.attr("id", this.id.toString());
    // 单个icon的点击事件
    iconElement.click((e) => {
      // console.log("icon clicked", e);
      utools.shellOpenPath(this.realPath);
      window.hideDesk();
    });
    // 把搜索索引的第一个关键字作为类名
    iconElement.addClass(this.searchKeywords[0]);
    // 单个icon的图片
    const iconImageElement = $("<img>").addClass("icon-image");
    iconImageElement.attr("src", this.iconImage);
    // 单个icon的名称
    const iconNameElement = $("<span></span>").addClass("icon-name");
    iconNameElement.text(this.iconName.split(".")[0]);

    iconElement.append(iconImageElement);
    iconElement.append(iconNameElement);
    return iconElement;
  }
}

class DesktopView {
  constructor(setting, rawIcons) {
    this.setting = setting;
    this.icons = rawIcons;
    this.theme = setting.theme;
    this.iconsInstance = [];
    this.selectedTargetIndex = 0; // 选中的搜索目标的索引
    // 搜索文本
    this._searchText = "";
    // 是否正在输入搜索内容
    this._onTypingSearch = false;
  }

  get searchText() {
    return this._searchText;
  }
  /**
   * @param {string} value
   */
  set searchText(value) {
    this._searchText = value;
    // 更新按键指示器的文本
    $("#keypress-indicate").text(value);
  }

  get onTypingSearch() {
    return this._onTypingSearch;
  }
  /**
   * @param {boolean} value
   */
  set onTypingSearch(value) {
    this._onTypingSearch = value;
    if (value) {
      // 正在输入搜索内容, 显示按键指示器, 并使用淡入动画效果
      $("#keypress-indicate").stop(true, true).fadeIn();
    } else {
      console.log("unset all search target");
      // 没有输入搜索内容，取消所有的搜索目标
      $(document).off("keyup");
      this.unsetAllSearchTarget();
      this.unsetAllSelectedTarget();
      this.searchText = "";
      // 隐藏按键指示器, 并使用淡出动画效果
      $("#keypress-indicate").stop(true, true).fadeOut();
    }
  }

  // 初始化
  init() {
    // 应用设置
    this.applySettings();
    // 处理图标信息
    this.handleDesktopIcons();
    // 渲染桌面图标
    this.renderDesktopIcons();
    // 监听按下键盘时搜索图标事件
    this.searchDesktopIconsListener();
    // 监听子窗口隐藏事件 按下esc ctrl键隐藏窗口
    this.hideDeskListener();
    // 切换主题
    this.switchThemeListener();
  }

  // 应用设置
  applySettings() {
    // 设置主题
    if (this.setting.theme === "light") {
      $("#theme-style").attr("href", "theme/theme-light.css");
    } else if (this.setting.theme === "dark") {
      $("#theme-style").attr("href", "theme/theme-dark.css");
    }
  }
  // 处理图标信息 1 分类 2添加搜索关键字
  handleDesktopIcons() {
    //  分类
    const handledIcons = [];

    this.icons.forEach((icon) => {
      // 给 icon 添加 一个id
      icon.id = Math.random().toString(36).slice(-8);
      // 存放搜索关键字的数组
      icon.searchKeywords = [];
      const splitList = icon.iconName.split(".");
      // 获取文件后缀名
      const fileType = splitList[splitList.length - 1];
      // 去除文件后缀名
      icon.iconName = icon.iconName.replace(/\.[^/.]+$/, "");
      // 为图标添加搜索关键字
      if (strContainsChinese(icon.iconName)) {
        // 如果是中文
        // 1转换为拼音 2去除点 3并转换为小写： wei xin
        const searchingStr = pinyin(icon.iconName, { toneType: "none" })
          .replace(/\./g, "")
          .toLowerCase();
        // 去除空格，并放入索引数组 weixin
        icon.searchKeywords.push(searchingStr.replace(/\s/g, ""));
        // 用空格分割成数组，扁平化数组，并放入索引数组
        icon.searchKeywords.push(...searchingStr.split(" "));
        // 提取首字母 wx
        icon.searchKeywords.push(extractInitials(searchingStr));
        // searchKeywords = [weixin, wx]
        // console.log("icon.searchKeywords:", icon.searchKeywords);
      } else {
        // 如果是英文
        // 转成小写, 去除点
        const searchingStr = icon.iconName.replace(/\./g, "").toLowerCase();
        // 去除空格，并放入索引数组
        icon.searchKeywords.push(searchingStr.replace(/\s/g, ""));
        // 用空格分割成数组，扁平化数组，并放入索引数组
        icon.searchKeywords.push(...searchingStr.split(" "));
        // 提取首字母
        icon.searchKeywords.push(extractInitials(searchingStr));
        // console.log("icon.searchKeywords:", icon.searchKeywords);
      }

      // 设置图标的类型，分为应用、文件夹和文件，放入不同的数组中
      if (fileType === "lnk") {
        icon.type = "app";
        icon.suffix = fileType;
      } else if (splitList.length === 1) {
        icon.type = "folder";
        // 修改文件夹图标
        icon.iconImage = "../assets/folder-64.png";
      } else {
        icon.type = "file";
        icon.suffix = fileType;
      }

      handledIcons.push(icon);
    });
    console.log("handledIcons:", handledIcons);
    this.icons = handledIcons;
  }
  // 渲染桌面图标信息
  renderDesktopIcons() {
    // console.log("Desktop Icons:", desktopIcons);
    // 全部icon的容器
    const iconsWrapper = $("<div></div>").addClass("icons-wrapper");

    // 遍历icons数组，渲染图标
    this.icons.forEach((icon) => {
      // 创建icon实例
      const iconInstance = new Icon(icon);
      this.iconsInstance.push(iconInstance);
      // 获取icon元素
      const iconElement = iconInstance.getIconElement();
      iconsWrapper.append(iconElement);
    });
    // console.log("this.iconsInstance:", this.iconsInstance);
    $("#app").append(iconsWrapper);
  }
  // -------------- 搜索相关 -------------------
  // 取消选中的图标
  unsetAllSelectedTarget() {
    this.iconsInstance.forEach((icon) => {
      if (icon.searchTarget) {
        icon.selectedTarget = false;
      }
    });
  }
  // 取消所有的搜索目标
  unsetAllSearchTarget() {
    this.iconsInstance.forEach((icon) => {
      if (icon.searchTarget) {
        icon.searchTarget = false;
      }
    });
  }
  // 监听按下键盘时搜索图标事件
  searchDesktopIconsListener() {
    let typingTimer;

    // 字母 数字 或者退格键
    const isValidKey = (event) => {
      return (
        (event.keyCode >= 48 && event.keyCode <= 57) || // 数字 0-9
        (event.keyCode >= 65 && event.keyCode <= 90) || // 大写字母 A-Z
        (event.keyCode >= 97 && event.keyCode <= 122) || // 小写字母 a-z
        event.keyCode === 8 // 退格键
      );
    };

    $(document).on("keydown", (event) => {
      // 如果按下键不在检测范围内则返回
      if (!isValidKey(event)) {
        this.onTypingSearch = false;
        return;
      }

      clearTimeout(typingTimer); // 清除之前的定时器

      if (!this.onTypingSearch) {
        // 如果不是正在输入搜索内容，则设置为正在输入搜索内容
        this.onTypingSearch = true;
      }

      if (event.keyCode === 8 && this.searchText.length > 0) {
        // 如果是退格键，并且有输入内容，则删除最后一个字符
        this.searchText = this.searchText.slice(0, -1);
      }

      if (event.keyCode !== 8) {
        // 如果不是退格键，则将按下的键添加到searchText变量中
        // 将按下的键添加到searchText变量中
        this.searchText += event.key;
      }

      this.updateSearchResultView(); // 更新视图

      // 设置定时器，在三秒后清空searchText并隐藏key-indicate元素，使用淡出动画效果
      typingTimer = setTimeout(() => {
        this.onTypingSearch = false;
        this.searchText = "";
      }, 3000);
    });
  }
  // 根据输入的文本匹配并更新数组中的对象
  updateSearchResultView() {

    // 清除所有的search-target
    if (!this.searchText) {
      this.onTypingSearch = false;
      return;
    }
    // 遍历icons对象，匹配搜索关键字
    this.iconsInstance.forEach((icon) => {
      let match = false;
      // 对搜索关键字列表进行遍历 如果搜索关键字中的任意一个单词匹配成功，则匹配成功
      icon.searchKeywords.forEach((keyword) => {
        if (keyword.includes(this.searchText.toLowerCase())) {
          // console.log("icon:", icon);
          match = true;
          return;
        }
      });
      // 更新视图
      if (match) {
        icon.searchTarget = true; // 匹配成功
      } else {
        icon.searchTarget = false; // 未匹配成功
      }
    });
  }
  // ----------------------------------------------
  // 监听子窗口隐藏事件 按下esc ctrl键隐藏窗口
  hideDeskListener() {
    // 监听esc Ctrl 键按下事件
    $(document).keydown((event) => {
      // 监听 Ctrl 键按下事件
      if (event.ctrlKey || event.which === 17 || event.which === 27) {
        console.log("Ctrl key is pressed");
        window.hideDesk();
        // window.closeDesk();
      }
    });
  }
  // 切换主题
  switchThemeListener() {
    $("#light-theme").click(() => {
      console.log("light-theme clicked");
      // 保存设置
      this.setting.theme = "light";
      utools.db.put(this.setting);

      $("#theme-style").attr("href", "theme/theme-light.css");
    });

    $("#dark-theme").click(() => {
      console.log("dark-theme clicked");
      // 保存设置
      this.setting.theme = "dark";
      utools.db.put(this.setting);
      $("#theme-style").attr("href", "theme/theme-dark.css");
    });
  }
}

$(document).ready(function () {
  // 获取本地设置
  const localSetting = getLocalSettings();
  // 获取图标信息
  window.getDesktopIcons(function (rawIcons) {
    // 初始化桌面视图
    const desktopView = new DesktopView(localSetting, rawIcons);
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
      theme: "dark",
    };
    res = utools.db.put(settings);
    // settingdb_rev = res.rev;
    settings = res;
  }
  return settings;
}
