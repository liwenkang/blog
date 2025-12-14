import fs from 'node:fs'
import PageTitle from '@/components/PageTitle'
import generateRss from '@/lib/generate-rss'
import { MDXLayoutRenderer } from '@/components/MDXComponents'
import { formatSlug, getAllFilesFrontMatter, getFileBySlug, getFiles, MdxFileData } from '@/lib/mdx'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { Author, PostNavigation } from '@/types'

const DEFAULT_LAYOUT = 'PostLayout'

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getFiles('blog')
  return {
    paths: posts.map((p) => ({
      params: {
        slug: formatSlug(p).split('/'),
      },
    })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<{
  post: MdxFileData
  authorDetails: Author[]
  prev: PostNavigation | null
  next: PostNavigation | null
}> = async ({ params }) => {
  const allPosts = await getAllFilesFrontMatter('blog')
  const postIndex = allPosts.findIndex(
    (post) => formatSlug(post.slug || '') === (params!.slug as string[]).join('/')
  )
  const prev = allPosts[postIndex + 1] || null
  const next = allPosts[postIndex - 1] || null
  const post = await getFileBySlug('blog', (params!.slug as string[]).join('/'))
  const authorList = post.frontMatter.authors || ['default']
  const authorPromise = authorList.map(async (author: string) => {
    const authorResults = await getFileBySlug('authors', author)
    return authorResults.frontMatter
  })
  const authorDetails = await Promise.all(authorPromise)

  // 清理 undefined 字段以避免序列化错误
  const cleanedAuthorDetails = JSON.parse(JSON.stringify(authorDetails)) as Author[]

  // rss
  if (allPosts.length > 0) {
    const rss = generateRss(allPosts)
    fs.writeFileSync('./public/feed.xml', rss)
  }

  return { props: { post, authorDetails: cleanedAuthorDetails, prev, next } }
}

export default function Blog({
  post,
  authorDetails,
  prev,
  next,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { mdxSource, toc, frontMatter } = post

  return (
    <>
      {frontMatter.draft === true ? (
        <div className="mt-24 text-center">
          <PageTitle>
            Under Construction <span aria-label="roadwork sign">🚧</span>
          </PageTitle>
        </div>
      ) : (
        <MDXLayoutRenderer
          layout={frontMatter.layout || DEFAULT_LAYOUT}
          toc={toc}
          mdxSource={mdxSource}
          frontMatter={frontMatter}
          authorDetails={authorDetails}
          prev={prev}
          next={next}
        />
      )}
    </>
  )
}
