import { ReactElement } from 'react'

// 类型定义
interface Post {
  title: string
  summary?: string
  excerpt?: string
  image?: string
  imageWidth?: number
  imageHeight?: number
  date: string
  lastmod?: string
  author?: string
  slug: string
  tags?: string[]
  readingTime?: string | number
  category?: string
}

interface Breadcrumb {
  name: string
  url: string
}

interface FAQ {
  question: string
  answer: string
}

interface Article {
  title: string
  summary?: string
  excerpt?: string
  image?: string
  date: string
  lastmod?: string
  author?: string
  slug: string
  category?: string
  readingTime?: string | number
}

interface HowToSupply {
  name: string
}

interface HowToTool {
  name: string
}

interface HowToStep {
  name: string
  text: string
  image?: string
  url?: string
}

interface HowTo {
  name: string
  description: string
  image?: string
  totalTime?: string
  estimatedCost?: string
  supply?: HowToSupply[]
  tools?: HowToTool[]
  steps?: HowToStep[]
}

// 组件 Props 接口
interface BlogPostingStructuredDataProps {
  post: Post
  siteUrl: string
}

interface BreadcrumbStructuredDataProps {
  breadcrumbs: Breadcrumb[]
}

interface WebSiteStructuredDataProps {
  siteUrl: string
  siteName: string
}

interface PersonStructuredDataProps {
  name: string
  url: string
  image?: string
  description?: string
}

interface ArticleStructuredDataProps {
  article: Article
  siteUrl: string
}

interface FAQStructuredDataProps {
  faqs: FAQ[]
}

interface HowToStructuredDataProps {
  howTo: HowTo
  siteUrl: string
}

interface CollectionPageStructuredDataProps {
  name: string
  description: string
  url: string
  siteUrl: string
}

interface OrganizationStructuredDataProps {
  name: string
  url: string
  logo?: string
  description: string
}

// BlogPosting structured data
export const BlogPostingStructuredData = ({
  post,
  siteUrl,
}: BlogPostingStructuredDataProps): ReactElement => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary || post.excerpt,
    image: post.image
      ? [
          {
            '@type': 'ImageObject',
            url: `${siteUrl}${post.image}`,
            width: post.imageWidth || 1200,
            height: post.imageHeight || 630,
          },
        ]
      : undefined,
    datePublished: post.date,
    dateModified: post.lastmod || post.date,
    author: {
      '@type': 'Person',
      name: post.author || 'Li Wenkang',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Li Wenkang',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}${post.slug}`,
    },
    keywords: post.tags?.join(', '),
    wordCount: typeof post.readingTime === 'string' ? /\d+/.exec(post.readingTime)?.[0] || 0 : 0,
    inLanguage: 'zh-CN',
    isAccessibleForFree: true,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}

// BreadcrumbList structured data
export const BreadcrumbStructuredData = ({
  breadcrumbs,
}: BreadcrumbStructuredDataProps): ReactElement => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}

// WebSite structured data
export const WebSiteStructuredData = ({
  siteUrl,
  siteName,
}: WebSiteStructuredDataProps): ReactElement => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description: 'Personal blog about web development, JavaScript, React, and more.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    inLanguage: 'zh-CN',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}

// Person structured data for author
export const PersonStructuredData = ({
  name,
  url,
  image,
  description,
}: PersonStructuredDataProps): ReactElement => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: name,
    url: url,
    description:
      description || 'Frontend developer, passionate about web technologies and open source.',
    image: image
      ? {
          '@type': 'ImageObject',
          url: `${url}${image}`,
          height: 400,
          width: 400,
        }
      : undefined,
    sameAs: [
      'https://github.com/liwenkang',
      // Add other social media profiles as needed
    ],
    jobTitle: 'Frontend Developer',
    knowsAbout: ['JavaScript', 'React', 'Next.js', 'TypeScript', 'CSS', 'HTML', 'Web Development'],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}

// Article structured data (for general articles)
export const ArticleStructuredData = ({
  article,
  siteUrl,
}: ArticleStructuredDataProps): ReactElement => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary || article.excerpt,
    image: article.image ? `${siteUrl}${article.image}` : undefined,
    datePublished: article.date,
    dateModified: article.lastmod || article.date,
    author: {
      '@type': 'Person',
      name: article.author || 'Li Wenkang',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Li Wenkang',
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}${article.slug}`,
    },
    articleSection: article.category || 'Technology',
    wordCount:
      typeof article.readingTime === 'string' ? /\d+/.exec(article.readingTime)?.[0] || 0 : 0,
    inLanguage: 'zh-CN',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}

// FAQ structured data
export const FAQStructuredData = ({ faqs }: FAQStructuredDataProps): ReactElement => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}

// HowTo structured data for tutorials
export const HowToStructuredData = ({ howTo, siteUrl }: HowToStructuredDataProps): ReactElement => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    description: howTo.description,
    image: howTo.image ? `${siteUrl}${howTo.image}` : undefined,
    totalTime: howTo.totalTime,
    estimatedCost: howTo.estimatedCost,
    supply: howTo.supply?.map((supply) => ({
      '@type': 'HowToSupply',
      name: supply.name,
    })),
    tool: howTo.tools?.map((tool) => ({
      '@type': 'HowToTool',
      name: tool.name,
    })),
    step: howTo.steps?.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image ? `${siteUrl}${step.image}` : undefined,
      url: step.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}

// Collection page structured data
export const CollectionPageStructuredData = ({
  name,
  description,
  url,
  siteUrl,
}: CollectionPageStructuredDataProps): ReactElement => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: name,
    description: description,
    url: `${siteUrl}${url}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Li Wenkang',
      url: siteUrl,
    },
    about: 'Web Development',
    inLanguage: 'zh-CN',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}

// Organization structured data
export const OrganizationStructuredData = ({
  name,
  url,
  logo,
  description,
}: OrganizationStructuredDataProps): ReactElement => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: name,
    url: url,
    logo: logo
      ? {
          '@type': 'ImageObject',
          url: `${url}${logo}`,
          width: 600,
          height: 60,
        }
      : undefined,
    description: description,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Chinese', 'English'],
    },
    sameAs: ['https://github.com/liwenkang'],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}
