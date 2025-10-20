---
title: Get Img Dom Base64 Png Url
date: '2024-07-20'
tags: ['IMG', 'WEB', 'BASE64', 'PNG']
draft: false
summary: One way to get base64 png url from a img dom
---

```tsx
import { useEffect } from 'react'

export function Test() {
  const convertImgDomToBase64PngUrl: () => string = () => {
    const img = document.querySelector('img') as HTMLImageElement
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    const ctx = canvas.getContext('2d')
    if (canvas) {
      canvas.width = img.width
      canvas.height = img.height
    }
    if (ctx) {
      ctx.drawImage(img, 0, 0)
    }
    return canvas.toDataURL('image/png')
  }

  useEffect(() => {
    convertImgDomToBase64PngUrl()
  }, [])

  return (
    <div>
      <img crossOrigin="anonymous" src="picture.png" />
      <canvas />
    </div>
  )
}

export default Test
```

Please note that if the src attribute of your img tag points to a resource outside your website, you may encounter a CORS issue.
