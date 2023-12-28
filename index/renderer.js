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
    // console.log("this._selectedTarget:", this._selectedTarget);
    if (value) {
      console.log("设置新选中目标");
      // 添加类名 设为选中目标
      $(`#${this.id}`).addClass("selected-target");
    } else {
      // 移除类名 取消选中目标
      $(`#${this.id}`).removeClass("selected-target");
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
    this._searchTargets = []; // 搜索目标的数组
    this.selectedTargetIndex = 0; // 选中的搜索目标的索引
    // 搜索文本
    this._searchText = "";
    // 是否正在输入搜索内容
    this._onTypingSearch = false;
    // 输入倒计时
    this._typingTimer = null;
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
      console.log("进入搜索状态");
      // 正在输入搜索内容, 显示按键指示器, 并使用淡入动画效果
      $("#keypress-indicate").stop(true, true).fadeIn();
    } else {
      console.log("退出搜索状态");
      // $(document).off("keyup");
      this.unsetAllSearchTarget();
      this.searchText = "";
      // 隐藏按键指示器, 并使用淡出动画效果
      $("#keypress-indicate").stop(true, true).fadeOut();
    }
  }

  get searchTargets() {
    return this._searchTargets;
  }

  set searchTargets(value) {
    this._searchTargets = value;
    console.log("this._searchTargets:", this._searchTargets);
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
    // 切换主题
    this.switchThemeListener();
    // 添加 keyup 监听事件
    // 空格：打开选中目标
    // 上下左右：切换选中目标
    // 回车：打开选中目标
    this.keyupListener();
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
  // 取消所有的搜索目标
  unsetAllSearchTarget() {
    console.log("取消所有的搜索目标 选择目标 清空搜索数组 重置选择索引");
    this.searchTargets.forEach((icon) => {
      icon.searchTarget = false;
      icon.selectedTarget = false;
    });
    this.selectedTargetIndex = 0;
    this.searchTargets = [];
  }
  // 监听按下键盘时搜索图标事件
  searchDesktopIconsListener() {
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
      // 如果按下键不在检测范围内 或者 删除空内容 则返回
      if (!isValidKey(event) || (event.keyCode === 8 && !this.searchText)) {
        // this.onTypingSearch = false;
        return;
      }

      if (!this.onTypingSearch) {
        // 如果不是正在输入搜索内容，则设置为正在输入搜索内容
        this.onTypingSearch = true;
      }

      clearTimeout(this._typingTimer); // 清除之前的定时器
      this.unsetAllSearchTarget(); // 取消所有的搜索目标

      // 如果是退格键
      if (event.keyCode === 8) {
        // 并且有输入内容，则删除最后一个字符
        if (this.searchText.length > 0) {
          this.searchText = this.searchText.slice(0, -1);
        }
        // 删除后没有内容，则退出搜索状态
        if (!this.searchText.length > 0) {
          this.onTypingSearch = false;
          return;
        }
      }

      // 如果不是退格键
      if (event.keyCode !== 8) {
        // 将按下的键添加到searchText变量中
        this.searchText += event.key;
      }

      // 遍历icons对象，匹配搜索关键字
      this.iconsInstance.forEach((icon) => {
        // 对搜索关键字列表进行遍历 如果搜索关键字中的任意一个单词匹配成功，则匹配成功
        for(let i = 0; i < icon.searchKeywords.length; i++){
          if (icon.searchKeywords[i].includes(this.searchText.toLowerCase())) {
            icon.searchTarget = true; // 匹配成功
            this.searchTargets = [...this.searchTargets, icon]; // 添加到搜索目标数组中
            break;
          } else {
            icon.searchTarget = false; // 未匹配成功
          }
        }
      });
      this.searchTargets[this.selectedTargetIndex].selectedTarget = true; // 选中搜索目标

      // 设置定时器，在三秒后退出搜索状态
      this._typingTimer = setTimeout(() => {
        this.onTypingSearch = false;
      }, 5000);
    });
  }
  // 添加空格监听事件:打开选中目标 和 切换选中目标
  // 空格：打开选中目标
  // 上下左右：切换选中目标
  // 回车：打开选中目标
  keyupListener() {
    $(document).on("keydown", (event) => {
      // 如果按下的是空格键或者回车模拟点击拥有选中目标类名的图标
      if (event.keyCode === 32 || event.keyCode === 13) {
        // 获取拥有选中目标类名的图标
        const selectedTarget = this.searchTargets[this.selectedTargetIndex];
        // 如果有选中目标，则模拟点击
        if (selectedTarget) {
          $(`#${selectedTarget.id}`).click();
        } else {
          console.log("没有选中目标");
        }
        return;
      }
      // 判断是否按下的是从37到40上下左右键，上键38 下键40 左37 右39
      if (event.keyCode >= 37 && event.keyCode <= 40) {
        // 判断searchTargets数组是否为空
        if (!this.searchTargets.length) {
          return;
        }
        // 清除倒计时
        clearTimeout(this._typingTimer);
        // 取消当前选中目标
        this.searchTargets[this.selectedTargetIndex].selectedTarget = false;
        // 如果按下的是上键或左键
        if (event.keyCode === 38 || event.keyCode === 37) {
          // 如果当前选中目标索引大于0，则选中上一个
          this.selectedTargetIndex--;
          if (this.selectedTargetIndex < 0) {
            this.selectedTargetIndex = this.searchTargets.length - 1;
          }
        }
        // 如果按下的是下键或右键
        if (event.keyCode === 40 || event.keyCode === 39) {
          // 如果当前选中目标索引小于搜索目标数组的长度减1，则选中下一个
          this.selectedTargetIndex++;
          if (this.selectedTargetIndex > this.searchTargets.length - 1) {
            this.selectedTargetIndex = 0;
          }
        }
        // 选中新的选中目标
        this.searchTargets[this.selectedTargetIndex].selectedTarget = true;
        return;
      }

      // 按下esc ctrl键隐藏窗口
      if (event.ctrlKey || event.which === 17 || event.which === 27) {
        console.log("Esc Ctrl key is keyup");
        window.hideDesk();
        return;
      }
    });
  }
  // ----------------------------------------------
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
