import Link from 'next/link'
import { AnchorHTMLAttributes, PropsWithChildren } from 'react'

type CustomLinkProps = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }
>

const CustomLink = ({ href, ...rest }: CustomLinkProps) => {
  const isInternalLink = href?.startsWith('/')
  const isAnchorLink = href?.startsWith('#')

  if (isInternalLink) {
    return <Link href={href} {...rest} />
  }

  if (isAnchorLink) {
    // Anchor links - content is provided by rest props (children)
    return <a href={href} {...rest} />
  }

  // External links - content is provided by rest props (children)
  return <a target="_blank" rel="noopener noreferrer" href={href} {...rest} />
}

export default CustomLink
