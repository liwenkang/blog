const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return ''

  // 使用固定的日期格式，避免 SSR/CSR 不一致
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    console.warn(`Invalid date format: ${date}`)
    return ''
  }

  // 使用固定的格式，避免 toLocaleDateString 的 SSR/CSR 不一致问题
  const year = dateObj.getFullYear()
  const month = dateObj.toLocaleDateString('en-US', { month: 'long' })
  const day = dateObj.getDate()

  return `${month} ${day}, ${year}`
}

/**
 * 将日期字符串转换为ISO格式，确保SSR和客户端渲染一致性
 */
export const toISOString = (date: string | Date | null | undefined): string | null => {
  if (!date) return null

  // 如果是字符串，确保它是有效的日期格式
  if (typeof date === 'string') {
    // 处理常见的日期格式
    const dateStr = date.trim()

    // 如果是YYYY-MM-DD格式，直接使用
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return `${dateStr}T00:00:00.000Z`
    }

    // 如果是YYYY-MM-DD HH:mm:ss格式，转换为ISO
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
      return `${dateStr.replace(' ', 'T')}.000Z`
    }

    // 其他格式使用Date对象处理
    const parsedDate = new Date(dateStr)
    if (isNaN(parsedDate.getTime())) {
      console.warn(`Invalid date format: ${dateStr}`)
      return null
    }
    // 使用 toISOString() 确保 SSR/CSR 一致性
    return parsedDate.toISOString()
  }

  // 如果是Date对象
  if (date instanceof Date) {
    if (isNaN(date.getTime())) {
      console.warn('Invalid Date object')
      return null
    }
    return date.toISOString()
  }

  return null
}

export default formatDate
