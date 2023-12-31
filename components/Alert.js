export class Alert {
    constructor(message) {
      this.message = message;
      this.timer = null;
      this.init();
    }
    
    init() {
      const alertElement = $("<div></div>")
        .addClass("alert")
        .text(this.message);
      // 设置id
      alertElement.attr("id", "alert");
      alertElement.appendTo("#app");

      this.timer = setTimeout(() => {
        alertElement.remove();
      }, 3000);
    }
  }

  