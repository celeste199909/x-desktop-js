import { Icon } from "./Icon.js";
import { Alert } from "../../components/Alert.js";

export class Page {
  constructor(options, rawIcons, desktop) {
    // 选项
    this.pageId = options.pageId;
    // this.pageIndex = desktop.pages.findIndex(
    //   (page) => {
    //     console.log("page.pageId:", page.pageId);
    //     console.log("this.pageId:", this.pageId);
    //     return page.pageId === this.pageId;
    //   }
    // );
    // console.log("this.pageIndex:", this.pageIndex);
    this.capacity = options.capacity;
    this.options = options;
    // 布局
    this.layout = desktop.layout;
    this.desktop = desktop;
    // 图标
    this.rawIcons = rawIcons; // 原始图标信息
    this.icons = []; // 存放图标实例
    // 编辑模式
    // this._onEditMode = false;
    this.sortable = null;
    // 移动时的timer
    this.moveEventTrigger = false;
  }

  // 渲染至开头或结尾
  renderTo(position) {
    // 渲染页面
    this.renderPage(position);
    // 设置拖动
    this.initSortable();
    // 元素事件监听
    // this.pageElementListener();
  }

  // 渲染页面
  renderPage(position = "end") {
    const pageElement = $("<div></div>")
      .addClass("page")
      .attr("id", `page-${this.pageId}`);

    // 渲染至开头或结尾
    if (position === "start") {
      pageElement.prependTo($("#pages"));
    } else {
      pageElement.appendTo($("#pages"));
    }

    // 设置页面padding-bottom
    pageElement.css({
      "padding-bottom": `${this.layout.paddingY * this.layout.height * 1.2}px`,
    });
    const appsWrapper = $("<div></div>")
      .addClass("apps-wrapper")
      .attr("id", `apps-wrapper-${this.pageId + 1}`)
      .appendTo(pageElement);
    // // 设置grid布局
    appsWrapper.css({
      width: `${this.layout.column * this.layout.cellLength}px`,
      height: `${this.layout.row * this.layout.cellLength}px`,
      "grid-template-columns": `repeat(${this.layout.column}, ${this.layout.cellLength}px)`,
      "grid-template-rows": `repeat(${this.layout.row}, ${this.layout.cellLength}px)`,
      // 间隔
      gap: `${this.layout.cellLength * 0.1}px`,
    });

    // 渲染图标
    this.rawIcons.forEach((icon) => {
      const iconInstance = new Icon(icon, this.desktop);
      appsWrapper.append(iconInstance.getIconElement());
      this.icons.push(iconInstance);
    });
  }

  // 设置拖动
  initSortable() {
    const self = this;
    const desktop = this.desktop;
    const appsWrapperElement = document.querySelector(
      `#apps-wrapper-${this.pageId + 1}`
    );
    // 设为 sortable
    const sortable = Sortable.create(appsWrapperElement, {
      group: "page",
      animation: 150,
      //停靠位置的自定义样式
      ghostClass: "sortable-ghost",
      //选中元素的自定义样式
      chosenClass: "sortable-chosen",
      //拖拽时的自定义样式
      dragClass: "sortable-drag",
      onEnd: (evt) => {
        console.log("evt:", evt);
        // 获取拖动的图标
        const icon = this.icons[evt.oldIndex];
        console.log("获取拖动的图标", icon);
        // 把图标的移到对应位置
        // 如果是同一个页面
        if (evt.to === evt.from) {
          // 重新排列图标数组
          this.icons.splice(evt.oldIndex, 1);
          this.icons.splice(evt.newIndex, 0, icon);
          // 保存图标排序信息
        } else {
          // 如果不是同一个页面
          // 从原页面删除图标
          this.icons.splice(evt.oldIndex, 1);
          // 添加图标到新页面
          const newPageId = parseInt(evt.to.id.split("-")[2]) - 1;
          console.log("newPageId:", newPageId);
          // 获取新页面下标
          const newPageIndex = desktop.pages.findIndex(
            (page) => page.pageId === newPageId
          );
          console.log("newPageIndex:", newPageIndex);
          // 获取新页面
          const newPage = desktop.pages[newPageIndex];
          console.log("newPage:", newPage);
          // 添加图标到新页面
          newPage.icons.splice(evt.newIndex, 0, icon);
        }
        // 删除空页面
        desktop.removeEmptyPage();
        // 保存图标排序信息
        desktop.updateSortInfo();
        // 更新页面指示器
        desktop.updatePageIndicate();
      },
      // 移动时如果超出 apps-wrapper ，页面切换
      onStart: function (evt) {
        // console.log(evt);
        var index = evt.oldIndex;
      },
      onMove: function (evt) {
        // 如果图标容量已满，图标回到原位
        if (evt.to.children.length >= self.capacity && evt.to !== evt.from) {
          // 如果不是同一个容器
          new Alert("桌面剩余空间不足");
          return false;
        }
        // 如果去往的是left-area 或者 right-area，图标回到原位
        if (evt.to.id === "left-area") {
          // 如果已经触发过一次，不再触发
          if (this.moveEventTrigger) {
            return false;
          }
          // 如果左侧没有页面，则新建一个页面
          if (desktop.currentPageIndex === 0) {
            console.log("左侧没有页面，新建一个页面");
            desktop.addPageTo("start");
          }

          this.moveEventTrigger = true;
          this.moveTimer = setTimeout(() => {
            this.moveEventTrigger = false;
          }, 1000);
          // console.log("去往的是left-area 或者 right-area");
          desktop.moveToPage(desktop.currentPageIndex - 1);
          return false;
        }
        // 如果去往的是right-area，图标回到原位
        if (evt.to.id === "right-area") {
          // 如果已经触发过一次，不再触发
          if (this.moveEventTrigger) {
            return false;
          }
          // 如果右侧没有页面，则新建一个页面
          if (desktop.currentPageIndex === desktop.pages.length - 1) {
            console.log("右侧没有页面，新建一个页面");
            desktop.addPageTo("end");
          }

          this.moveEventTrigger = true;
          this.moveTimer = setTimeout(() => {
            this.moveEventTrigger = false;
          }, 1000);
          desktop.moveToPage(desktop.currentPageIndex + 1);
          return false;
        }
      },
    });
    this.sortable = sortable;
  }
  // 添加一个图标
  addIcon(icon) {
    // 如果图标容量已满，图标回到原位
    if (this.icons.length >= this.capacity) {
      new Alert("桌面剩余空间不足");
      return;
    }
    // 添加图标
    const iconInstance = new Icon(icon, this.desktop);
    $(`#apps-wrapper-${this.pageId + 1}`).append(iconInstance.getIconElement());
    this.icons.push(iconInstance);
    // 更新图标排序信息
    this.desktop.updateSortInfo();
  }
}
