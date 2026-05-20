/**
 * Hexo 插件：flatten_img_path
 * 功能：
 *   - 移除图片路径中的 ./ 和 ../
 *   - 可选地将图片路径映射到统一前缀下
 * 配置示例（在 _config.yml 中）：
 *   flatten_img_path:
 *     enable: true
 *     flatten:
 *       enable: true
 *       removeAllUp: true
 *     mapping:
 *       enable: false
 *       prefix: /images
 *     debug: false
 */

const cheerio = require('cheerio');

/**
 * 规范化 URL 路径：解析所有 "./" 和 "../"，不改变路径语义
 * 例如 
 * - "/a/b/../c/d/./e" -> "/a/c/d/e"
 */
function normalizeUrlPath(pathStr) {
  // 处理以 / 开头的情况
  const isAbsolute = pathStr.startsWith('/');
  const parts = pathStr.split('/');

  const stack = [];
  for (const part of parts) {
    if (part === '' || part === '.') {
      // 忽略空段（连续斜杠）或当前目录
      continue;
    } else if (part === '..') {
      if (isAbsolute) {
        // 绝对路径：向上回溯，但不能超过根
        if (stack.length > 0) {
          stack.pop();
        }
      } else {
        // 相对路径：如果没有可回溯的目录，保留 ".."
        if (stack.length > 0 && stack[stack.length - 1] !== '..') {
          stack.pop();
        } else {
          stack.push('..');
        }
      }
    } else {
      stack.push(part);
    }
  }

  let result = stack.join('/');
  if (isAbsolute) {
    result = '/' + result;
  }
  return result;
}

hexo.extend.filter.register('after_render:html', function (htmlContent, data) {
  const config = hexo.config.flatten_img_path;

  // 总开关关闭或配置缺失，原样输出
  if (!config || !config.enable) return htmlContent;

  const flattenCfg = config.flatten || {};
  const mappingCfg = config.mapping || {};
  const debug = config.debug || false;

  // 如果扁平化和映射都未开启，直接返回
  if (!flattenCfg.enable && !mappingCfg.enable) return htmlContent;

  const $ = cheerio.load(htmlContent, { decodeEntities: false });

  $('img').each(function () {
    const $img = $(this);
    let src = $img.attr('src');
    if (!src) return;

    // 跳过 Data URI 和绝对网络路径
    if (/^(https?:|data:|[/]{2})/i.test(src)) return;

    const originalSrc = src;

    // 扁平化：移除开头的所有 ./ 和 ../
    if (flattenCfg.enable && flattenCfg.removeAllUp) {
      // 例如 "../../a/b.png" -> "a/b.png"
      src = normalizeUrlPath(src);
    }

    // 路径映射：添加前缀
    if (mappingCfg.enable && mappingCfg.prefix) {
      const prefix = mappingCfg.prefix.replace(/\/$/, ''); // 去掉末尾斜杠
      const pathPart = src.replace(/^\//, '');             // 去掉开头斜杠
      src = prefix + '/' + pathPart;
    }

    // 替换并调试输出
    if (src !== originalSrc) {
      if (debug) {
        console.log(`[flatten_img_path] [${originalSrc}] -> [${src}]`);
      }
      $img.attr('src', src);
    }
  });

  return $.html();
});
