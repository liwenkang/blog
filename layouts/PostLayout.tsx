import { ReactNode } from 'react'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import { BlogSEO } from '@/components/SEO'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import Comments from '@/components/comments'
import RegionErrorBoundary from '@/components/RegionErrorBoundary'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import formatDate from '@/lib/utils/formatDate'
import { BlogPostingStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData'
import Head from 'next/head'
import UserExperienceWrapper from '@/components/UserExperienceWrapper'
import { Author, PostNavigation } from '@/types'

const editUrl = (fileName: string) => `${siteMetadata.siteRepo}/blob/master/data/blog/${fileName}`

interface PostLayoutFrontMatter {
  slug: string
  fileName: string
  date: string
  title: string
  images?: string[]
  tags?: string[]
  summary?: string
  excerpt?: string
  [key: string]: any
}

interface PostLayoutProps {
  frontMatter: PostLayoutFrontMatter
  authorDetails: Author[]
  next?: PostNavigation
  prev?: PostNavigation
  children: ReactNode
}

export default function PostLayout({
  frontMatter,
  authorDetails,
  next,
  prev,
  children,
}: Readonly<PostLayoutProps>) {
  const { slug, fileName, date, title, tags } = frontMatter

  // Breadcrumb data for blog posts
  const breadcrumbs = [
    { name: '首页', url: siteMetadata.siteUrl },
    { name: '博客', url: `${siteMetadata.siteUrl}/blog` },
    { name: title, url: `${siteMetadata.siteUrl}/blog/${slug}` },
  ]

  return (
    <SectionContainer>
      <Head>
        {/* BlogPosting structured data */}
        <BlogPostingStructuredData
          post={{
            ...frontMatter,
            slug: `/blog/${slug}`,
            summary: frontMatter.summary || frontMatter.excerpt,
            image: frontMatter.images?.[0],
            author: authorDetails?.[0]?.name || siteMetadata.author,
          }}
          siteUrl={siteMetadata.siteUrl}
        />

        {/* Breadcrumb structured data */}
        <BreadcrumbStructuredData breadcrumbs={breadcrumbs} />
      </Head>

      <BlogSEO
        url={`${siteMetadata.siteUrl}/blog/${slug}`}
        authorDetails={authorDetails}
        summary={frontMatter.summary || frontMatter.excerpt || ''}
        {...frontMatter}
      />
      <ScrollTopAndComment />
      <article>
        <UserExperienceWrapper>
          <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700" id="main-content">
            <header className="pt-6 xl:pb-6">
              <div className="space-y-1 text-center">
                <dl className="space-y-10">
                  <div>
                    <dt className="sr-only">Published on</dt>
                    <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-300">
                      <time dateTime={date}>{formatDate(date)}</time>
                    </dd>
                  </div>
                </dl>
                <div>
                  <PageTitle>{title}</PageTitle>
                </div>
              </div>
            </header>
            <div
              className="divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0"
              style={{ gridTemplateRows: 'auto 1fr' }}
            >
              <dl className="pt-6 pb-10 xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700 print:hidden">
                <dt className="sr-only">Authors</dt>
                <dd>
                  <ul className="flex justify-center space-x-8 sm:space-x-12 xl:block xl:space-x-0 xl:space-y-8">
                    {authorDetails.map((author) => (
                      <li className="flex items-center space-x-2" key={author.name}>
                        {author.avatar && (
                          <Image
                            src={author.avatar}
                            width={38}
                            height={38}
                            alt="avatar"
                            className="h-10 w-10 rounded-full"
                          />
                        )}
                        <dl className="whitespace-nowrap text-sm font-medium leading-5">
                          <dt className="sr-only">Name</dt>
                          <dd className="text-gray-900 dark:text-gray-100">{author.name}</dd>
                          <dt className="sr-only">Twitter</dt>
                          <dd>
                            {author.twitter && (
                              <Link
                                href={author.twitter}
                                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                              >
                                {author.twitter.replace('https://twitter.com/', '@')}
                              </Link>
                            )}
                          </dd>
                        </dl>
                      </li>
                    ))}
                  </ul>
                </dd>
              </dl>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 xl:col-span-3 xl:row-span-2 xl:pb-0">
                <div className="prose max-w-none pt-10 pb-8 dark:prose-invert">{children}</div>
                <div className="pt-6 pb-6 text-sm text-gray-700 dark:text-gray-300 print:hidden">
                  <Link href={editUrl(fileName)}>{'View on GitHub'}</Link>
                </div>
                <div className="print:hidden">
                  <RegionErrorBoundary label="评论">
                    <Comments frontMatter={frontMatter} />
                  </RegionErrorBoundary>
                </div>
              </div>
              <footer className="print:hidden">
                <div className="divide-gray-200 text-sm font-medium leading-5 dark:divide-gray-700 xl:col-start-1 xl:row-start-2 xl:divide-y">
                  {tags && (
                    <div className="py-4 xl:py-8">
                      <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Tags
                      </h2>
                      <div className="flex flex-wrap">
                        {tags.map((tag) => (
                          <Tag key={tag} text={tag} />
                        ))}
                      </div>
                    </div>
                  )}
                  {(next || prev) && (
                    <div className="flex justify-between py-4 xl:block xl:space-y-8 xl:py-8">
                      {prev && (
                        <div>
                          <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Previous Article
                          </h2>
                          <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                            <Link href={`/blog/${prev.slug}`}>{prev.title}</Link>
                          </div>
                        </div>
                      )}
                      {next && (
                        <div>
                          <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Next Article
                          </h2>
                          <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                            <Link href={`/blog/${next.slug}`}>{next.title}</Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="pt-4 xl:pt-8">
                  <Link
                    href="/blog"
                    className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    &larr; Back to the blog
                  </Link>
                </div>
              </footer>
            </div>
          </div>
        </UserExperienceWrapper>
      </article>
    </SectionContainer>
  )
}
