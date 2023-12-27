// utils.js

// 函数用于检测字符串是中文还是英文
function strContainsChinese(str) {
  // 检查字符串中是否有中文字符
  const containsChinese = /[\u4e00-\u9fff]/.test(str);
  return containsChinese;
}

// 函数用于提取字符串中的首字母
function extractInitials(str) {
  // 使用正则表达式将字符串拆分为单词数组
  const words = str.split(/[\s-_]+/);
  // 提取每个单词的首字母并拼接成字符串
  const initials = words.map(word => word.charAt(0)).join('');
  return initials;
}

// 导出函数，以便其他文件可以引入并使用
export { strContainsChinese, extractInitials };
