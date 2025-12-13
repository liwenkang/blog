import Mail from './mail.svg'
import Github from './github.svg'
import Facebook from './facebook.svg'
import Youtube from './youtube.svg'
import Linkedin from './linkedin.svg'
import Twitter from './twitter.svg'

// Icons taken from: https://simpleicons.org/

type SocialIconKind = 'mail' | 'github' | 'facebook' | 'youtube' | 'linkedin' | 'twitter'

const components: Record<SocialIconKind, any> = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
}

interface SocialIconProps {
  kind: SocialIconKind
  href: string
  size?: number
  ariaLabel?: string
}

const SocialIcon = ({ kind, href, size = 8, ariaLabel }: SocialIconProps) => {
  if (
    !href ||
    (kind === 'mail' && !/^mailto:\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(href))
  )
    return null

  const SocialSvg = components[kind]

  // Generate accessible label if not provided
  const defaultLabels: Record<SocialIconKind, string> = {
    mail: 'Send email',
    github: 'Visit GitHub profile',
    facebook: 'Visit Facebook page',
    youtube: 'Visit YouTube channel',
    linkedin: 'Visit LinkedIn profile',
    twitter: 'Visit Twitter profile',
  }

  const label = ariaLabel || defaultLabels[kind]

  return (
    <a
      className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded p-1"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
      <SocialSvg
        className={`fill-current text-gray-700 hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-400 h-${size} w-${size}`}
        aria-hidden="true"
      />
    </a>
  )
}

export default SocialIcon
