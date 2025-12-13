import { useMemo } from 'react'
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

const layouts = {
  PostLayout,
  PostSimple,
  ListLayout,
  AuthorLayout,
}

export const MDXComponents = {
  Image,
  TOCInline: (props) => (
    <RegionErrorBoundary label="目录">
      <TOCInline {...props} />
    </RegionErrorBoundary>
  ),
  a: CustomLink,
  pre: Pre,
  BlogNewsletterForm: BlogNewsletterForm,
  wrapper: ({ components, layout, ...rest }) => {
    const Layout = layouts[layout]
    return Layout ? <Layout {...rest} /> : null
  },
}

export const MDXLayoutRenderer = ({ layout, mdxSource, ...rest }) => {
  const MDXLayout = useMemo(() => getMDXComponent(mdxSource), [mdxSource])

  return <MDXLayout layout={layout} components={MDXComponents} {...rest} />
}
