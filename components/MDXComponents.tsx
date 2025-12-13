import { useMemo, ComponentType, ReactElement } from 'react'
import { getMDXComponent } from 'mdx-bundler/client'
import Image from './Image'
import CustomLink from './Link'
import TOCInline from './TOCInline'
import RegionErrorBoundary from './RegionErrorBoundary'
import Pre from './Pre'
import { BlogNewsletterForm } from './NewsletterForm'

// Import all layouts statically to avoid dynamic require
import PostLayout from '../layouts/PostLayout'
import PostSimple from '../layouts/PostSimple'
import ListLayout from '../layouts/ListLayout'
import AuthorLayout from '../layouts/AuthorLayout'

const layouts: Record<string, ComponentType<any>> = {
  PostLayout,
  PostSimple,
  ListLayout,
  AuthorLayout,
}

export const MDXComponents = {
  Image,
  TOCInline: (props: any) => (
    <RegionErrorBoundary label="目录">
      <TOCInline {...props} />
    </RegionErrorBoundary>
  ),
  a: CustomLink,
  pre: Pre,
  BlogNewsletterForm: BlogNewsletterForm,
  wrapper: ({ components: _components, layout, ...rest }: any) => {
    const Layout = layouts[layout]
    return Layout ? <Layout {...rest} /> : null
  },
}

interface MDXLayoutRendererProps {
  layout: string
  mdxSource: string
  [key: string]: any
}

export const MDXLayoutRenderer = ({
  layout,
  mdxSource,
  ...rest
}: Readonly<MDXLayoutRendererProps>): ReactElement => {
  const MDXLayout = useMemo(() => getMDXComponent(mdxSource), [mdxSource])

  return <MDXLayout layout={layout} components={MDXComponents} {...rest} />
}
