import React, { useState, useEffect, useCallback } from 'react'
import { useTheme } from 'next-themes'

import siteMetadata from '@/data/siteMetadata'

const Giscus = () => {
  const [enableLoadComments, setEnabledLoadComments] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  // 确保组件在客户端挂载后才渲染主题相关的内容
  useEffect(() => {
    setMounted(true)
  }, [])

  const commentsTheme =
    siteMetadata.comment.giscusConfig.themeURL === ''
      ? theme === 'dark' || resolvedTheme === 'dark'
        ? siteMetadata.comment.giscusConfig.darkTheme
        : siteMetadata.comment.giscusConfig.theme
      : siteMetadata.comment.giscusConfig.themeURL

  const COMMENTS_ID = 'comments-container'

  const LoadComments = useCallback(() => {
    setEnabledLoadComments(false)

    const {
      repo = '',
      repositoryId = '',
      category = '',
      categoryId = '',
      mapping = '',
      reactions = '',
      metadata = '',
      inputPosition = '',
      lang = '',
    } = siteMetadata?.comment?.giscusConfig ?? {}

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', repo)
    script.setAttribute('data-repo-id', repositoryId)
    script.setAttribute('data-category', category)
    script.setAttribute('data-category-id', categoryId)
    script.setAttribute('data-mapping', mapping)
    script.setAttribute('data-reactions-enabled', reactions)
    script.setAttribute('data-emit-metadata', metadata)
    script.setAttribute('data-input-position', inputPosition)
    script.setAttribute('data-lang', lang)
    script.setAttribute('data-theme', commentsTheme)
    script.setAttribute('crossorigin', 'anonymous')
    script.setAttribute('data-loading', 'lazy')
    script.async = true

    const comments = document.getElementById(COMMENTS_ID)
    if (comments) comments.appendChild(script)

    return () => {
      const comments = document.getElementById(COMMENTS_ID)
      if (comments) comments.innerHTML = ''
    }
  }, [commentsTheme])

  // Reload on theme change
  useEffect(() => {
    if (mounted) {
      const iframe = document.querySelector('iframe.giscus-frame')
      if (!iframe) return
      LoadComments()
    }
  }, [mounted, LoadComments])

  // 在服务端渲染时返回一个占位符，避免水合错误
  if (!mounted) {
    return (
      <div className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300">
        <div className="giscus" id={COMMENTS_ID} />
      </div>
    )
  }

  return (
    <div className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300">
      {enableLoadComments && <button onClick={LoadComments}>Load Comments</button>}
      <div className="giscus" id={COMMENTS_ID} />
    </div>
  )
}

export default Giscus
