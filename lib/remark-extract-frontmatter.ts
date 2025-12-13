import { visit } from 'unist-util-visit'
import { load } from 'js-yaml'
import type { Node } from 'unist'

interface YamlNode extends Node {
  type: 'yaml'
  value: string
}

interface VFile {
  data: {
    frontmatter?: any
  }
}

export default function extractFrontmatter() {
  return (tree: Node, file: VFile) => {
    visit(tree, 'yaml', (node: YamlNode) => {
      file.data.frontmatter = load(node.value)
    })
  }
}
