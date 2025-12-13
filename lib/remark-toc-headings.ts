import { visit } from 'unist-util-visit'
import { slug } from 'github-slugger'
import { toString } from 'mdast-util-to-string'
import type { Node } from 'unist'

interface HeadingNode extends Node {
  type: 'heading'
  depth: number
  children: Node[]
}

export interface TocHeading {
  value: string
  url: string
  depth: number
}

interface TocOptions {
  exportRef: TocHeading[]
}

export default function remarkTocHeadings(options: TocOptions) {
  return (tree: Node) =>
    visit(tree, 'heading', (node: HeadingNode) => {
      const textContent = toString(node)
      options.exportRef.push({
        value: textContent,
        url: '#' + slug(textContent),
        depth: node.depth,
      })
    })
}
