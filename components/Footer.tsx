import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'

export default function Footer() {
  return (
    <footer role="contentinfo" className="mt-16 flex flex-col items-center">
      <nav className="mb-3 flex space-x-4" aria-label="Social media links">
        <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={6} />
        <SocialIcon kind="github" href={siteMetadata.github} size={6} />
        <SocialIcon kind="twitter" href={siteMetadata.twitter} size={6} />
      </nav>

      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400" role="contentinfo">
        <span className="sr-only">Copyright and site information</span>
        <span>{siteMetadata.author}</span>
        <span aria-hidden="true"> • </span>
        <span>{`© ${new Date().getFullYear()}`}</span>
        <span aria-hidden="true"> • </span>
        <Link
          href="/"
          className="link-interactive"
          aria-label={`${siteMetadata.title} - Go to homepage`}
        >
          {siteMetadata.title}
        </Link>
      </div>

      <div className="mb-8 text-sm text-gray-600 dark:text-gray-400">
        <span className="sr-only">Theme attribution</span>
        <Link
          href="https://github.com/timlrx/tailwind-nextjs-starter-blog"
          className="link-interactive"
          aria-label="Tailwind Nextjs Theme - External link to theme repository"
        >
          Tailwind Nextjs Theme
        </Link>
      </div>
    </footer>
  )
}
