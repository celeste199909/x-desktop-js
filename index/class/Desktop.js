const { pinyin } = pinyinPro;
import { strContainsChinese, extractInitials } from "../../js/utils.js";

import { Page } from "./Page.js";

export class Desktop {
  constructor(layout, setting, rawIcons) {
    this.layout = layout;
    this.setting = setting;
    this.icons = rawIcons;
    // this.theme = setting.theme;
    this._searchTargets = []; // 搜索目标的数组
    this.selectedTargetIndex = 0; // 选中的搜索目标的索引
    // 搜索文本
    this._searchText = "";
    // 是否正在输入搜索内容
    this._onTypingSearch = false;
    // 输入倒计时
    this._typingTimer = null;
    // 页面数据
    this.pages = []; // page [ Icon , ... ]
    // 当前页面索引
    this.currentPageIndex = 0;
    // 编辑模式 多页面全览模式
    this._onEditMode = false;
  }

  // 搜索文本
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
  // 是否正在输入搜索内容
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

  // 搜索目标的数组
  get searchTargets() {
    return this._searchTargets;
  }

  set searchTargets(value) {
    this._searchTargets = value;
    console.log("this._searchTargets:", this._searchTargets);
  }

  // 编辑模式
  get onEditMode() {
    return this._onEditMode;
  }
  /**
   * @param {boolean} value
   */
  set onEditMode(value) {
    // 保存 this
    const d = this;
    this._onEditMode = value;
    if (value) {
      console.log("进入编辑模式");
      // 进入编辑模式
    } else {
      // 退出编辑模式
    }
  }

  // 初始化
  init() {
    // 应用设置
    this.applySettings();
    // 处理图标信息
    this.handleDesktopIcons();
    // 设置布局
    this.setLayout();
    // 搜索：监听按下键盘时搜索图标事件
    this.searchDesktopIconsListener();
    // 元素：添加点击事件监听
    // 用于 1 切换主题 2 打开/关闭侧边栏
    this.elementClickListener();
    // 键盘：添加 keyup 监听事件
    // 空格：打开选中目标
    // 上下左右：切换选中目标
    // 回车：打开选中目标
    this.keyupListener();
    // 鼠标滚轮切换页面
    this.mousewheelListener();

    // 获取area元素
    const leftArea = document.querySelector("#left-area");
    Sortable.create(leftArea, {
      group: "page",
    });
    const rightArea = document.querySelector("#right-area");
    Sortable.create(rightArea, {
      group: "page",
    });
  }

  // 设置布局
  setLayout() {
    const desktop = this;
    // 计算页面数量
    const pagesNumber = Math.ceil(
      this.icons.length / (this.layout.row * this.layout.column)
    );
    // 计算页面容量
    const capacity = this.layout.row * this.layout.column;
    // 创建页面数据
    // 填充数据 并创建容器 创建页面
    for (let pageIndex = 0; pageIndex < pagesNumber; pageIndex++) {
      const options = {
        pageIndex: pageIndex,
        // 页面图标容量
        capacity: capacity,
      };
      const page = new Page(
        options,
        this.icons.slice(pageIndex * capacity, (pageIndex + 1) * capacity),
        desktop
      );
      page.init();
      this.pages.push(page);
    }
    console.log("this.pages:", this.pages);
    // 创建页面切换指示器
    for (let i = 0; i < pagesNumber; i++) {
      const indicate = $("<div></div>")
        .addClass("page-indicate")
        .appendTo("#pages-indicate");
      // 设置点击事件
      indicate.on("click", () => {
        this.currentPageIndex = i;
        this.moveToPage(this.currentPageIndex);
        // 移除所有的指示器类名
        $(".current-page-indicate").removeClass("current-page-indicate");
        // 设置当前页面指示器
        indicate.addClass("current-page-indicate");
      });
      // 设置当前页面指示器
      if (i === this.currentPageIndex) {
        indicate.addClass("current-page-indicate");
      }
    }
  }
  // 应用设置
  applySettings() {
    // 设置主题
    this.switchTheme();
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
      console.log(11);
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

      // 搜索目标
      this.pages.forEach((page) => {
        page.forEach((cell) => {
          if (cell.icon) {
            const icon = cell.icon;
            for (let i = 0; i < icon.searchKeywords.length; i++) {
              if (
                icon.searchKeywords[i].includes(this.searchText.toLowerCase())
              ) {
                icon.searchTarget = true; // 匹配成功
                this.searchTargets = [...this.searchTargets, icon]; // 添加到搜索目标数组中
                break;
              } else {
                icon.searchTarget = false; // 未匹配成功
              }
            }
          }
        });
      });

      // 如果有搜索目标，则根据 selectedTargetIndex 选中
      if (this.searchTargets.length > 0) {
        this.searchTargets[this.selectedTargetIndex].selectedTarget = true; // 选中搜索目标
      }

      this._typingTimer = setTimeout(() => {
        this.onTypingSearch = false;
      }, 9000);
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
      // 判断是否按下的是从上下键，上键38 下键40 并且是在搜索状态
      if (
        event.keyCode === 38 ||
        (event.keyCode === 40 && this.onTypingSearch)
      ) {
        // 判断searchTargets数组是否为空
        if (!this.searchTargets.length) {
          return;
        }
        // 清除倒计时
        clearTimeout(this._typingTimer);
        // 取消当前选中目标
        this.searchTargets[this.selectedTargetIndex].selectedTarget = false;
        // 如果按下的是上键
        if (event.keyCode === 38) {
          // 如果当前选中目标索引大于0，则选中上一个
          this.selectedTargetIndex--;
          if (this.selectedTargetIndex < 0) {
            this.selectedTargetIndex = this.searchTargets.length - 1;
          }
        }
        // 如果按下的是下键
        if (event.keyCode === 40) {
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

      // 按下左右键切换页面
      if (event.keyCode === 37 || event.keyCode === 39) {
        // 如果按下的是左键
        if (event.keyCode === 37) {
          this.currentPageIndex--;
          if (this.currentPageIndex < 0) {
            this.currentPageIndex = 0;
          }
        }
        // 如果按下的是右键
        if (event.keyCode === 39) {
          this.currentPageIndex++;
          if (this.currentPageIndex > this.pages.length - 1) {
            this.currentPageIndex = this.pages.length - 1;
          }
        }
        // 移动页面
        this.moveToPage(this.currentPageIndex);
        // 移除所有的指示器类名
        $(".current-page-indicate").removeClass("current-page-indicate");
        // 设置当前页面指示器
        $(`.page-indicate:eq(${this.currentPageIndex})`).addClass(
          "current-page-indicate"
        );
        return;
      }
    });
  }
  // ----------------------------------------------
  // 监听主题切换按钮/侧边栏按钮
  elementClickListener() {
    // 侧边栏的设置部分
    // 监听主题切换按钮
    $("#light-theme").on("click", () => {
      console.log("light-theme clicked");
      // 保存设置
      this.setting.theme = "light";
      utools.db.put(this.setting);
      this.switchTheme();
    });

    $("#dark-theme").on("click", () => {
      console.log("dark-theme clicked");
      // 保存设置
      this.setting.theme = "dark";
      utools.db.put(this.setting);
      this.switchTheme();
    });

    $("#auto-theme").on("click", () => {
      console.log("auto-theme clicked");
      // 保存设置
      this.setting.theme = "auto";
      utools.db.put(this.setting);
      this.switchTheme();
    });

    // sidebar 监听事件 打开/关闭侧边栏
    $("#sidebar-btn").on("click", () => {
      $("#sidebar").toggleClass("active");
      $("#sidebar-btn").toggleClass("active");
    });
    // 关闭侧边栏
    $("#close-sidebar-btn").on("click", () => {
      $("#sidebar").removeClass("active");
      $("#sidebar-btn").removeClass("active");
    });

    // // 启用拖拽
    // $("#enable-drag-btn").on("click", () => {
    //   console.log("开启拖拽");
    //   this.onEditMode = true;
    //   // 保存设置
    //   this.setting.enableDrag = !this.setting.enableDrag;
    //   utools.db.put(this.setting);
    //   // 切换按钮状态
    //   $("#enable-drag-btn").addClass("active");
    //   $("#disable-drag-btn").removeClass("active");
    // });
    // // 禁用拖拽
    // $("#disable-drag-btn").on("click", () => {
    //   console.log("禁用拖拽");
    //   this.onEditMode = false;
    //   // 保存设置
    //   this.setting.enableDrag = !this.setting.enableDrag;
    //   utools.db.put(this.setting);
    //   // 切换按钮状态
    //   $("#enable-drag-btn").removeClass("active");
    //   $("#disable-drag-btn").addClass("active");
    // });
  }
  // 切换主题
  switchTheme() {
    // 移除所有主题类名
    $(".current-theme").removeClass("current-theme");

    if (this.setting.theme === "light") {
      $("#light-theme").addClass("current-theme");
      $("#theme-style").attr("href", "theme/theme-light.css");
    } else if (this.setting.theme === "dark") {
      $("#dark-theme").addClass("current-theme");
      $("#theme-style").attr("href", "theme/theme-dark.css");
    } else if (this.setting.theme === "auto") {
      $("#auto-theme").addClass("current-theme");
      if (utools.isDarkColors()) {
        $("#theme-style").attr("href", "theme/theme-dark.css");
      } else {
        $("#theme-style").attr("href", "theme/theme-light.css");
      }
    }
  }
  // 移到某一页 pageIndex: number | "prev" | "next"
  moveToPage(pageIndex, extraDistance = 0, duration = 300) {
    if (pageIndex < 0) {
      this.currentPageIndex = 0;
      return;
    }
    if (pageIndex > this.pages.length - 1) {
      this.currentPageIndex = this.pages.length - 1;
      return;
    }
    // 修改当前页面索引
    this.currentPageIndex = pageIndex;
    // 移动页面 播放一次动画
    $("#pages").css({
      transform: `translateX(${
        this.layout.width * -pageIndex + extraDistance
      }px)`,
      transition: `transform ${duration}ms ease-in-out`,
    });
    // 移除所有的指示器类名
    $(".current-page-indicate").removeClass("current-page-indicate");
    // 设置当前页面指示器
    $(`.page-indicate:eq(${pageIndex})`).addClass("current-page-indicate");
  }
  // 通过鼠标滚轮切换页面
  mousewheelListener() {
    const app = document.querySelector("#app");
    app.addEventListener("wheel", (e) => {
      if (e.deltaY < 0) {
        this.currentPageIndex--;
        this.moveToPage(this.currentPageIndex);
      }
      if (e.deltaY > 0) {
        this.currentPageIndex++;
        this.moveToPage(this.currentPageIndex);
      }
    });
  }
  // 编辑模式
  toggleEditMode(value) {
    this._onEditMode = value;
    // 缩小页面 pages.
    if (value) {
      $("#pages").css({
        transform: "scale(0.5) translateX(-50%)",
      });

      $(".page").css({
        border: "1px solid #eee",
        "border-radius": "10px",
      });
    } else {
      $("#pages").css({
        transform: "scale(1)",
      });

      $(".page").css({
        border: "none",
        "border-radius": "0px",
      });
    }
  }
}
