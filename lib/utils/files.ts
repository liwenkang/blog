import fs from 'fs'
import path from 'path'

const flattenArray = <T>(input: (T | T[])[]): T[] =>
  input.reduce<T[]>((acc, item) => [...acc, ...(Array.isArray(item) ? item : [item])], [])

const walkDir = (fullPath: string): string | string[] => {
  return fs.statSync(fullPath).isFile() ? fullPath : getAllFilesRecursively(fullPath)
}

const getAllFilesRecursively = (folder: string): string[] => {
  const files = fs.readdirSync(folder)
  const paths = files.map((file) => path.join(folder, file))
  const results = paths.map(walkDir)
  return flattenArray(results)
}

export default getAllFilesRecursively
