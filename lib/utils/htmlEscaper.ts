const { replace } = ''

// escape
const ca = /[&<>'"]/g

const esca: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
}

const pe = (m: string): string => esca[m]

/**
 * Safely escape HTML entities such as `&`, `<`, `>`, `"`, and `'`.
 * @param es the input to safely escape
 * @returns the escaped input
 */
export const escape = (es: string): string => replace.call(es, ca, pe)
