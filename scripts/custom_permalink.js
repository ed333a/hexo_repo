/**
 * Hexo 插件：自定义永久链接变量 :custom_link
 * 通过 before_post_render 过滤器为每篇文章注入 custom_link 属性
 * 格式：{分类序号}{分隔符}{CRC32}{分隔符}{日期取反}
 *
 * 依赖：crc-32
 * 安装：npm install crc-32
 */

const crc32 = require('crc-32');

// 计算 CRC32（基于标题 + 源文件名）
function getContentCRC(post, length, pad, format) {
  const content = (post.title || '') + (post.source || '');
  const crcValue = crc32.str(content) >>> 0; // 转为无符号整数
  let crcStr;

  if (format === 'dec') {
    crcStr = crcValue.toString(10);
  } else {
    crcStr = crcValue.toString(16).toLowerCase();
  }

  // 截取指定长度
  crcStr = crcStr.slice(0, length);
  // 不足时补零
  if (pad) {
    crcStr = crcStr.padStart(length, '0');
  }
  return crcStr;
}

// 生成日期取反部分（月份+日期 → 日期+月份）
function getDatePart(post, reverse, pad) {
  const date = post.date || new Date();
  const month = date.month() + 1;
  const day = date.day();

  let monthStr = month.toString();
  let dayStr = day.toString();
  if (pad) {
    monthStr = monthStr.padStart(2, '0');
    dayStr = dayStr.padStart(2, '0');
  }

  let result = (reverse ? (parseInt(monthStr + dayStr) ^ 0xFFFF).toString() : monthStr + dayStr).padStart(4, '0');

  return result.slice(1, 4);
}

// 组合生成 custom_link
function buildCustomLink(post, config) {
  const {
    category_start = 0,
    crc_length = 10,
    crc_pad = true,
    crc_format = 'hex',
    date_reverse = true,
    date_pad = true,
    separator = '-',
    debug = false
  } = config;

  const crc = getContentCRC(post, crc_length, crc_pad, crc_format);
  const datePart = getDatePart(post, date_reverse, date_pad);

  const customLink = `${crc}${separator}${datePart}`;

  if (debug) {
    console.log(`[custom_permalink] ${post.title || post.source}`);
    console.log(`  → ${customLink}`);
  }

  return customLink;
}

// 注册过滤器，在渲染前为文章注入 custom_link
hexo.extend.filter.register('before_post_render', function (data) {
  const config = hexo.config.custom_permalink;
  if (!config || !config.enable) return data;

  data.custom_link = buildCustomLink(data, config);
  return data;
});
