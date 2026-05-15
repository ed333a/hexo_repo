hexo.on('ready', () => {
  const { version, last_modified } = require('../../package.json')
  hexo.log.info(`
  ===================================================================
    Theme Butterfly - By jerryc127
        Website       : https://butterfly.js.org/
        GitHub        : https://github.com/jerryc127/hexo-theme-butterfly
        Verision      : ${version}
        Modified by   : 小田同学
        LastModified  : ${last_modified}
  ===================================================================`)
})
