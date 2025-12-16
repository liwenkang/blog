import { useState, useEffect, useRef, useCallback } from 'react'

import siteMetadata from '@/data/siteMetadata'
import { PostFrontMatter } from '@/types'

interface DisqusProps {
  frontMatter: PostFrontMatter
}

interface DisqusConfig {
  page: {
    url: string
    identifier: string
  }
}

declare global {
  interface Window {
    DISQUS?: any
    disqus_config?: (this: DisqusConfig) => void
  }
  var DISQUS: any
  var disqus_config: ((this: DisqusConfig) => void) | undefined
  var location: Location
}

const Disqus = ({ frontMatter }: DisqusProps) => {
  const [enableLoadComments, setEnableLoadComments] = useState(true)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // 确保组件在客户端挂载后才渲染
  useEffect(() => {
    setMounted(true)
  }, [])

  const COMMENTS_ID = 'disqus_thread'

  const LoadComments = useCallback(() => {
    setEnableLoadComments(false)

    // Disqus API requires 'this' context - this is not a React component method
    // The 'this' usage here is required by Disqus's configuration API
    globalThis.disqus_config = function () {
      // @ts-ignore - Disqus API requires 'this' context
      this.page.url = globalThis.location.href
      // @ts-ignore - Disqus API requires 'this' context
      this.page.identifier = frontMatter.slug || ''
    }
    if (globalThis.DISQUS === undefined) {
      const script = document.createElement('script')
      script.src =
        'https://' + siteMetadata.comment.disqusConfig?.shortname + '.disqus.com/embed.js'
      // 移除 data-timestamp 属性，避免 SSR/CSR 不一致问题
      // Disqus 通常不需要这个属性，或者可以使用固定的时间戳
      script.setAttribute('crossorigin', 'anonymous')
      script.async = true
      document.body.appendChild(script)
    } else {
      globalThis.DISQUS.reset({ reload: true })
    }
  }, [frontMatter.slug])

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

  // 在服务端渲染时返回一个占位符，避免水合错误
  if (!mounted) {
    return (
      <div className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300">
        <div className="disqus-frame" id={COMMENTS_ID} />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300">
      {enableLoadComments && <button onClick={LoadComments}>Load Comments</button>}
      <div className="disqus-frame" id={COMMENTS_ID} />
    </div>
  )
}

export default Disqus
