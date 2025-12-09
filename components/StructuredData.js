import Head from 'next/head'

// BlogPosting structured data
export const BlogPostingStructuredData = ({ post, siteUrl }) => {
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
    wordCount: typeof post.readingTime === 'string' ? post.readingTime.match(/\d+/)?.[0] || 0 : 0,
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
export const BreadcrumbStructuredData = ({ breadcrumbs }) => {
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
export const WebSiteStructuredData = ({ siteUrl, siteName }) => {
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
export const PersonStructuredData = ({ name, url, image, description }) => {
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
export const ArticleStructuredData = ({ article, siteUrl }) => {
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
      typeof article.readingTime === 'string' ? article.readingTime.match(/\d+/)?.[0] || 0 : 0,
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
export const FAQStructuredData = ({ faqs }) => {
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
export const HowToStructuredData = ({ howTo, siteUrl }) => {
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
export const CollectionPageStructuredData = ({ name, description, url, siteUrl }) => {
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
export const OrganizationStructuredData = ({ name, url, logo, description }) => {
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
