import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTheme } from 'next-themes'

import siteMetadata from '@/data/siteMetadata'

const Giscus = () => {
  const [enableLoadComments, setEnableLoadComments] = useState(true)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { theme, resolvedTheme } = useTheme()

  // 确保组件在客户端挂载后才渲染主题相关的内容
  useEffect(() => {
    setMounted(true)
  }, [])

  const getCommentsTheme = () => {
    if (siteMetadata.comment.giscusConfig?.themeURL !== '') {
      return siteMetadata.comment.giscusConfig?.themeURL
    }
    const isDark = theme === 'dark' || resolvedTheme === 'dark'
    return isDark
      ? siteMetadata.comment.giscusConfig?.darkTheme
      : siteMetadata.comment.giscusConfig?.theme
  }

  const commentsTheme = getCommentsTheme()

  const COMMENTS_ID = 'comments-container'

  const LoadComments = useCallback(() => {
    setEnableLoadComments(false)

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
    script.dataset.repo = repo
    script.dataset.repoId = repositoryId
    script.dataset.category = category
    script.dataset.categoryId = categoryId
    script.dataset.mapping = mapping
    script.dataset.reactionsEnabled = reactions
    script.dataset.emitMetadata = metadata
    script.dataset.inputPosition = inputPosition
    script.dataset.lang = lang
    script.dataset.theme = commentsTheme || 'light'
    script.dataset.loading = 'lazy'
    script.setAttribute('crossorigin', 'anonymous')
    script.async = true

    const comments = document.getElementById(COMMENTS_ID)
    if (comments) comments.appendChild(script)

    return () => {
      const comments = document.getElementById(COMMENTS_ID)
      if (comments) comments.innerHTML = ''
    }
  }, [commentsTheme])

  useEffect(() => {
    if (!mounted || !enableLoadComments) return
    if (typeof IntersectionObserver === 'undefined') return

    const target = containerRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          LoadComments()
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px' }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [LoadComments, enableLoadComments, mounted])

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
    <div ref={containerRef} className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300">
      {enableLoadComments && <button onClick={LoadComments}>Load Comments</button>}
      <div className="giscus" id={COMMENTS_ID} />
    </div>
  )
}

export default Giscus
