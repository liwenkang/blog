/**
 * 作者信息类型定义
 */
export interface Author {
  name: string
  avatar: string
  occupation: string
  company: string
  email: string
  twitter?: string
  linkedin?: string
  github?: string
}

/**
 * 作者简介页面 FrontMatter
 */
export interface AuthorFrontMatter extends Author {
  layout?: string
  [key: string]: any
}
