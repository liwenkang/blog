import React, { useState, useEffect } from 'react'

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
}

const Disqus = ({ frontMatter }: DisqusProps) => {
  const [enableLoadComments, setEnabledLoadComments] = useState(true)
  const [mounted, setMounted] = useState(false)

  // 确保组件在客户端挂载后才渲染
  useEffect(() => {
    setMounted(true)
  }, [])

  const COMMENTS_ID = 'disqus_thread'

  function LoadComments() {
    setEnabledLoadComments(false)

    window.disqus_config = function () {
      this.page.url = window.location.href
      this.page.identifier = frontMatter.slug || ''
    }
    if (window.DISQUS === undefined) {
      const script = document.createElement('script')
      script.src =
        'https://' + siteMetadata.comment.disqusConfig?.shortname + '.disqus.com/embed.js'
      // 移除 data-timestamp 属性，避免 SSR/CSR 不一致问题
      // Disqus 通常不需要这个属性，或者可以使用固定的时间戳
      script.setAttribute('crossorigin', 'anonymous')
      script.async = true
      document.body.appendChild(script)
    } else {
      window.DISQUS.reset({ reload: true })
    }
  }

  // 在服务端渲染时返回一个占位符，避免水合错误
  if (!mounted) {
    return (
      <div className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300">
        <div className="disqus-frame" id={COMMENTS_ID} />
      </div>
    )
  }

  return (
    <div className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300">
      {enableLoadComments && <button onClick={LoadComments}>Load Comments</button>}
      <div className="disqus-frame" id={COMMENTS_ID} />
    </div>
  )
}

export default Disqus
