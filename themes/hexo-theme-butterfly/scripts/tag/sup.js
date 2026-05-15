'use strict'

const referencesMap = new Map()

function resetReferences() {
  referencesMap.clear()
}

function addReference(tag, title, url) {
  if (!referencesMap.has(tag)) {
    const index = referencesMap.size + 1
    referencesMap.set(tag, { index, title, url })
  }
  return referencesMap.get(tag).index
}

hexo.extend.filter.register('before_post_render', (data) => {
  resetReferences()
  return data
})


hexo.extend.filter.register('after_post_render', (data) => {
  if (referencesMap.size === 0) {
    return data
  }

  let refHtml = '<div class="post-references"><h3>参考资源</h3><ol>'

  for (const [, { index, title, url }] of referencesMap) {
    refHtml += `<li id="ref-${index}"><a href="${url}" target="_blank">${title}-${url}</a></li>`
  }

  refHtml += '</ol></div>'

  data.content += refHtml
  return data
})

const postRef = (args, content) => {
  const enable = hexo.theme.config.ref.enable
  if (enable === false) { return '' }

  const tag = args[0].trim()
  const title = args.slice(1, args.length - 1).join(' ')
  const url = args[args.length - 1].trim()

  if (!tag || !title || !url) {
    hexo.log.error('sup tag usage: {% sup tag title url %}')
    return ''
  }

  const index = addReference(tag.trim(), title.trim(), url.trim())
  return `<sup class="reference" data-ref="${tag}"><a href="#ref-${index}">[${index}]</a></sup>`
}
hexo.extend.tag.register('ref', postRef)
