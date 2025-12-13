import NextImage, { ImageProps as NextImageProps } from 'next/image'
import { useState } from 'react'
import { useInView } from 'react-intersection-observer'

interface ImageProps extends Omit<NextImageProps, 'src' | 'alt' | 'width' | 'height'> {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  lazy?: boolean
}

const Image = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  lazy = true,
  ...rest
}: ImageProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // Intersection Observer for lazy loading
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px',
    skip: !lazy || priority,
  })

  // Default blur data URL for images
  const defaultBlurDataURL = `data:image/svg+xml;base64,${btoa(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <rect width="100%" height="100%" fill="#9ca3af" opacity="0.2"/>
    </svg>`
  )}`

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setError(true)
    setIsLoading(false)
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={`Failed to load image: ${alt}`}
      >
        <div className="text-center p-4">
          <svg
            className="w-8 h-8 mx-auto text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">Failed to load image</p>
        </div>
      </div>
    )
  }

  const imageComponent = (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading skeleton */}
      {isLoading && <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />}

      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        className={`
          transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        onLoad={handleLoad}
        onError={handleError}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        {...rest}
      />
    </div>
  )

  // Return lazy-loaded or immediate image
  if (lazy && !priority) {
    return (
      <div ref={ref} className={className} style={{ width, height }}>
        {inView ? (
          imageComponent
        ) : (
          // Placeholder for lazy loading
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
      </div>
    )
  }

  return imageComponent
}

export default Image
