import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTheme } from 'next-themes'

import siteMetadata from '@/data/siteMetadata'

const Utterances = () => {
  const [enableLoadComments, setEnabledLoadComments] = useState(true)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { theme, resolvedTheme } = useTheme()

  // 确保组件在客户端挂载后才渲染主题相关的内容
  useEffect(() => {
    setMounted(true)
  }, [])

  const commentsTheme =
    theme === 'dark' || resolvedTheme === 'dark'
      ? siteMetadata.comment.utterancesConfig?.darkTheme
      : siteMetadata.comment.utterancesConfig?.theme

  const COMMENTS_ID = 'comments-container'

  const LoadComments = useCallback(() => {
    setEnabledLoadComments(false)
    const script = document.createElement('script')
    script.src = 'https://utteranc.es/client.js'
    script.setAttribute('repo', siteMetadata.comment.utterancesConfig?.repo ?? '')
    script.setAttribute('issue-term', siteMetadata.comment.utterancesConfig?.issueTerm ?? '')
    script.setAttribute('label', siteMetadata.comment.utterancesConfig?.label ?? '')
    script.setAttribute('theme', commentsTheme || 'github-light')
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
      const iframe = document.querySelector('iframe.utterances-frame')
      if (!iframe) return
      LoadComments()
    }
  }, [LoadComments, mounted])

  // 在服务端渲染时返回一个占位符，避免水合错误
  if (!mounted) {
    return (
      <div className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300">
        <div className="utterances-frame relative" id={COMMENTS_ID} />
      </div>
    )
  }

  // Added `relative` to fix a weird bug with `utterances-frame` position
  return (
    <div ref={containerRef} className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300">
      {enableLoadComments && <button onClick={LoadComments}>Load Comments</button>}
      <div className="utterances-frame relative" id={COMMENTS_ID} />
    </div>
  )
}

export default Utterances
