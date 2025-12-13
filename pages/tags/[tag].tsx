import { TagSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import generateRss from '@/lib/generate-rss'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getAllTags } from '@/lib/tags'
import kebabCase from '@/lib/utils/kebabCase'
import fs from 'fs'
import path from 'path'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { FrontMatter } from '@/lib/mdx'

const root = process.cwd()

export const getStaticPaths: GetStaticPaths = async () => {
  const tags = await getAllTags('blog')

  return {
    paths: Object.keys(tags).map((tag) => ({
      params: {
        tag,
      },
    })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<{
  posts: FrontMatter[]
  tag: string
}> = async ({ params }) => {
  const allPosts = await getAllFilesFrontMatter('blog')
  const filteredPosts = allPosts.filter(
    (post) =>
      post.draft !== true &&
      post.tags?.map((t: string) => kebabCase(t)).includes(params!.tag as string)
  )

  // rss
  if (filteredPosts.length > 0) {
    const rss = generateRss(filteredPosts, `tags/${params!.tag}/feed.xml`)
    const rssPath = path.join(root, 'public', 'tags', params!.tag as string)
    fs.mkdirSync(rssPath, { recursive: true })
    fs.writeFileSync(path.join(rssPath, 'feed.xml'), rss)
  }

  return { props: { posts: filteredPosts, tag: params!.tag as string } }
}

export default function Tag({ posts, tag }: InferGetStaticPropsType<typeof getStaticProps>) {
  // Capitalize first letter and convert space to dash
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  return (
    <>
      <TagSEO
        title={`${tag} - ${siteMetadata.author}`}
        description={`${tag} tags - ${siteMetadata.author}`}
      />
      <ListLayout posts={posts} title={title} />
    </>
  )
}
